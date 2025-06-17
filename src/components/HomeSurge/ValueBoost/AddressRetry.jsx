import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import { validateAddress } from '../../../utils/validation.js';
import { trackAddressSelected, trackFormStepComplete, trackFormError } from '../../../services/analytics';
import { lookupPropertyInfo } from '../../../services/maps.js';
import { updateLeadInFirebase } from '../../../services/firebase.js';
import { formatSubheadline, formatText } from '../../../utils/textFormatting';

// CSS for visually hidden fields
const visuallyHiddenStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0
};

function AddressRetry({ campaign, variant }) {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [firstSuggestion, setFirstSuggestion] = useState(null);
  const [suggestionTimer, setSuggestionTimer] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [lastTypedAddress, setLastTypedAddress] = useState('');
  
  // Reference to the main input 
  const inputRef = useRef(null);
  
  // Reference to autocomplete instance
  const autocompleteRef = useRef(null);
  
  // Reference to session token
  const sessionTokenRef = useRef(null);
  
  // Reference to the form element
  const formRef = useRef(null);
  
  // Reference to autocomplete service
  const autocompleteServiceRef = useRef(null);
  
  // Track browser autofill and capture name and phone when available
  const [lastStreetValue, setLastStreetValue] = useState('');
  const [autofillDetected, setAutofillDetected] = useState(false);
  
  // Generate a session token for Google Places API
  const generateSessionToken = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return null;
    }
    return new window.google.maps.places.AutocompleteSessionToken();
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const value = e.target.value;
    const fieldName = e.target.name;
    
    // Check if this might be browser autofill
    if (fieldName === 'address-line1') {
      // If the value changes significantly in one update, it might be autofill
      if (value.length > 0 && Math.abs(value.length - lastStreetValue.length) > 5) {
        setAutofillDetected(true);
      }
      
      setLastStreetValue(value);
      
      updateFormData({ 
        street: value,
        addressSelectionType: 'Manual',
        userTypedAddress: value
      });
      
      // Keep track of the latest typed address
      setLastTypedAddress(value);
    } else {
      // For other fields (name, phone), just update the form data
      const updateField = {};
      if (fieldName === 'name') {
        updateField.name = value;
        updateField.autoFilledName = value;
        updateField.nameWasAutofilled = true;
      }
      if (fieldName === 'tel') {
        updateField.phone = value;
        updateField.autoFilledPhone = value;
      }
      
      updateFormData(updateField);
    }
    
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
    
    // Clear any existing suggestion timers
    if (suggestionTimer) {
      clearTimeout(suggestionTimer);
    }
    
    // If the user has typed more than 2 characters, request address predictions
    if (value.length >= 2 && googleApiLoaded && autocompleteServiceRef.current) {
      // Set a timer to avoid too many API calls
      const timer = setTimeout(() => {
        autocompleteServiceRef.current.getPlacePredictions({
          input: value,
          sessionToken: sessionTokenRef.current,
          componentRestrictions: { country: 'us' },
          types: ['address']
        }, async (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
            // Store the first suggestion for potential use if user doesn't select one
            setFirstSuggestion(predictions[0]);
            
            // Store all suggestions for UI only
            setAddressSuggestions(predictions);
            
            // Only update user typed address in form data
            const preparedData = {
              userTypedAddress: value,
              leadStage: 'Address Retry - Typing'
            };
            
            // Update the form data with suggestions only, don't update the street/address fields
            updateFormData(preparedData);
          } else {
            setFirstSuggestion(null);
            setAddressSuggestions([]);
          }
        });
      }, 500); // 500ms debounce to prevent too many API calls
      
      setSuggestionTimer(timer);
    } else if (value.length < 2) {
      // Clear first suggestion if input is too short
      setFirstSuggestion(null);
      setAddressSuggestions([]);
    }
  };
  
  // Get place details for a prediction
  const getPlaceDetails = async (placeId) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }
      
      // Create a PlacesService instance (requires a div element)
      const placesService = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      // Add timeout to prevent waiting indefinitely
      const timeoutId = setTimeout(() => {
        console.log('⚠️ Place details request timed out after 3 seconds');
        resolve(null); // Resolve with null to allow fallback instead of rejecting
      }, 3000); // 3 second timeout
      
      placesService.getDetails({
        placeId: placeId,
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        sessionToken: sessionTokenRef.current
      }, (place, status) => {
        clearTimeout(timeoutId); // Clear the timeout since we got a response
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          console.log(`⚠️ Place details request failed: ${status}`);
          resolve(null); // Resolve with null to allow fallback instead of rejecting
        }
      });
    });
  };
  
  // Fetch property data from Melissa API
  const fetchPropertyData = async (address) => {
    try {
      console.log('Fetching property data for address:', address);
      const propertyData = await lookupPropertyInfo(address);
      
      if (propertyData) {
        console.log('Property data received:', propertyData);
        
        // Format the estimated value nicely (fallback if not already formatted)
        let formattedValue = propertyData.formattedApiEstimatedValue;
        if (!formattedValue || formattedValue === '$0') {
          const estimatedValue = propertyData.apiEstimatedValue || 0;
          formattedValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(estimatedValue);
        }

        // Calculate base increase percentage based on property age
        const yearBuilt = propertyData.propertyRecord?.YearBuilt || 1980;
        const propertyAge = new Date().getFullYear() - yearBuilt;

        let baseIncreasePercentage = 0.15; // Default 15% increase

        // Older homes have higher improvement potential
        if (propertyAge > 30) {
          baseIncreasePercentage = 0.22; // 22% increase potential
        } else if (propertyAge > 15) {
          baseIncreasePercentage = 0.18; // 18% increase potential
        } else if (propertyAge < 5) {
          baseIncreasePercentage = 0.12; // 12% increase potential (newer homes)
        }

        // Calculate potential value increase based on property
        const potentialValueIncrease = Math.round(propertyData.apiEstimatedValue * baseIncreasePercentage);
        const formattedPotentialIncrease = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(potentialValueIncrease);

        // Calculate number of recommended upgrades
        let upgradesNeeded = 8; // Default to higher number

        // Adjust based on property age and features
        if (propertyAge > 30) {
          upgradesNeeded = 10; // Older homes need more improvements
        } else if (propertyAge < 10) {
          upgradesNeeded = 7; // Newer homes need fewer improvements
        }

        // Cap max recommendations at 12
        upgradesNeeded = Math.min(upgradesNeeded, 12);
        
        // Update form data with property information
        updateFormData({
          apiOwnerName: propertyData.apiOwnerName || '',
          apiEstimatedValue: propertyData.apiEstimatedValue || 0,
          apiMaxHomeValue: propertyData.apiMaxValue || 0,
          apiEquity: propertyData.apiEquity || 0,
          apiPercentage: propertyData.apiPercentage || 0,
          formattedApiEstimatedValue: formattedValue,
          mortgageAmount: propertyData.mortgageAmount || 0,
          bedrooms: propertyData.bedrooms || '',
          bathrooms: propertyData.bathrooms || '',
          finishedSquareFootage: propertyData.finishedSquareFootage || 1000,
          city: formData.city || propertyData.city || '',
          state: formData.state || propertyData.state || 'GA',
          zip: formData.zip || propertyData.zip || '',
          propertyRecord: propertyData.propertyRecord,
          potentialValueIncrease: potentialValueIncrease,
          formattedPotentialIncrease: formattedPotentialIncrease,
          upgradesNeeded: upgradesNeeded,
          valueIncreasePercentage: Math.round(baseIncreasePercentage * 100)
        });
        
        console.log('Form data updated with property info:', {
          estimatedValue: formattedValue,
          potentialIncrease: formattedPotentialIncrease,
          upgradesNeeded: upgradesNeeded,
          apiEquity: propertyData.apiEquity,
          apiPercentage: propertyData.apiPercentage
        });
        
        return propertyData;
      } else {
        console.log('No property data found for address:', address);
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
    }
    
    return null;
  };
  
  // Process address selection (whether from autocomplete or suggestion)
  const processAddressSelection = async (place) => {
    if (!place || !place.formatted_address) {
      console.warn('No place data available');
      return false;
    }
    
    // Extract address components
    const addressComponents = {
      city: '',
      state: 'GA',
      zip: ''
    };
    
    if (place.address_components && place.address_components.length > 0) {
      place.address_components.forEach(component => {
        const types = component.types;
        
        if (types.includes('locality')) {
          addressComponents.city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          addressComponents.state = component.short_name;
        } else if (types.includes('postal_code')) {
          addressComponents.zip = component.long_name;
        }
      });
    }
    
    // Get location data if available
    const location = place.geometry?.location ? {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    } : null;
    
    // Update form data with selected place
    updateFormData({
      street: place.formatted_address,
      city: addressComponents.city,
      state: addressComponents.state,
      zip: addressComponents.zip,
      location: location,
      addressSelectionType: 'AddressRetry-Google',
      selectedSuggestionAddress: place.formatted_address,
      leadStage: 'Address Retry - Selected',
      name: formData.name || '',
      phone: formData.phone || ''
    });
    
    // Ensure inputRef has the correct value
    if (inputRef.current) {
      inputRef.current.value = place.formatted_address;
    }
    
    // After a place is selected, we're done with this session token
    sessionTokenRef.current = generateSessionToken();
    
    // Track the address selection in analytics
    trackAddressSelected('AddressRetry-Google');
    
    // Clear any error messages
    setErrorMessage('');
    
    // Update existing lead with retry information
    try {
      const leadId = localStorage.getItem('leadId');
      if (leadId) {
        const retryData = {
          street: place.formatted_address,
          city: addressComponents.city,
          state: addressComponents.state,
          zip: addressComponents.zip,
          userTypedAddress: lastTypedAddress,
          selectedSuggestionAddress: place.formatted_address,
          addressSelectionType: 'AddressRetry-Google',
          leadStage: 'Address Retry - Selected',
          funnel: 'homesurge_valueboost',
          retryTimestamp: new Date().toISOString()
        };
        
        await updateLeadInFirebase(leadId, retryData);
        console.log('Updated lead with retry address data:', leadId);
      }
    } catch (error) {
      console.error('Error updating lead with retry data:', error);
    }
    
    // Fetch property data in the background
    const leadId = localStorage.getItem('leadId');
    if (leadId) {
      fetchPropertyDataInBackground(place.formatted_address, leadId, addressComponents);
    }
    
    return true;
  };
  
  // Process property data in background
  const fetchPropertyDataInBackground = async (address, leadId, addressComponents) => {
    try {
      const propertyData = await fetchPropertyData(address);
      
      if (propertyData && leadId) {
        const propertyUpdateData = {
          street: address,
          city: addressComponents.city,
          state: addressComponents.state,
          zip: addressComponents.zip,
          apiOwnerName: propertyData.apiOwnerName || '',
          apiEstimatedValue: propertyData.apiEstimatedValue?.toString() || '0',
          apiMaxHomeValue: propertyData.apiMaxValue?.toString() || '0',
          apiEquity: propertyData.apiEquity?.toString() || '0',
          apiPercentage: propertyData.apiPercentage?.toString() || '0',
          potentialValueIncrease: formData.potentialValueIncrease || 0,
          formattedPotentialIncrease: formData.formattedPotentialIncrease || '',
          upgradesNeeded: formData.upgradesNeeded || 0,
          valueIncreasePercentage: formData.valueIncreasePercentage || 0,
          retrySuccessful: true,
          retryCompletedAt: new Date().toISOString()
        };
        
        await updateLeadInFirebase(leadId, propertyUpdateData);
        console.log('Background: Successfully updated lead with retry property data');
      }
    } catch (error) {
      console.error('Background: Error fetching retry property data:', error);
    }
  };
  
  // Handle button click
  const handleButtonClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Retry button clicked');
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (formData.street.length < 2) {
        setErrorMessage('Please enter a valid address');
        setIsLoading(false);
        return;
      }
      
      // If we have a first suggestion, use it
      if (firstSuggestion && firstSuggestion.place_id) {
        console.log('Using first suggestion:', firstSuggestion.description);
        
        try {
          const placeDetails = await getPlaceDetails(firstSuggestion.place_id);
          
          if (placeDetails && placeDetails.formatted_address) {
            console.log('Got full place details:', placeDetails.formatted_address);
            
            if (inputRef.current) {
              inputRef.current.value = placeDetails.formatted_address;
            }
            
            updateFormData({
              street: placeDetails.formatted_address,
              selectedSuggestionAddress: placeDetails.formatted_address,
              userTypedAddress: lastTypedAddress,
              addressSelectionType: 'AddressRetry-ButtonClick'
            });
            
            await processAddressSelection(placeDetails);
            
            // Navigate back to step 3 (report) with new data
            setTimeout(() => {
              updateFormData({ formStep: 3 }); // Go to step 3
              setIsLoading(false);
            }, 200);
            
            return;
          }
        } catch (error) {
          console.error('Error getting place details:', error);
        }
      }
      
      // If no suggestion and address validation passes, proceed with what we have
      if (validateAddress(formData.street)) {
        console.log('No suggestion available, but address validates');
        
        await fetchPropertyData(formData.street);
        
        trackFormStepComplete(4, 'Address Retry Completed', formData);
        
        // Navigate back to step 3 (report) with new data
        updateFormData({ formStep: 3 }); // Go to step 3
        setIsLoading(false);
      } else {
        setErrorMessage('Please enter a valid address to retry your value boost report');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error handling retry button click:', error);
      setIsLoading(false);
      setErrorMessage('An error occurred. Please try again.');
    }
  };
  
  // Load Google Maps API
  const loadGoogleMapsAPI = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      return Promise.resolve();
    }
    
    if (window.googleMapsPromise) {
      return window.googleMapsPromise;
    }
    
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is missing');
      return Promise.reject(new Error('Google Maps API key is missing'));
    }
    
    window.googleMapsPromise = new Promise((resolve, reject) => {
      window.initGoogleMapsAutocomplete = () => {
        console.log('Google Maps API loaded successfully');
        setGoogleApiLoaded(true);
        
        if (window.google.maps.places.AutocompleteSessionToken) {
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        }
        
        if (window.google.maps.places.AutocompleteService) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
        
        resolve();
      };
      
      window.gm_authFailure = () => {
        const error = new Error('Google Maps API authentication failure');
        console.error(error);
        trackFormError('Google Maps API authentication failure', 'maps');
        reject(error);
      };
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAutocomplete`;
      script.async = true;
      script.defer = true;
      script.onerror = (e) => {
        const error = new Error('Failed to load Google Maps API script');
        console.error(error, e);
        trackFormError('Failed to load Google Maps API script', 'maps');
        reject(error);
      };
      
      document.body.appendChild(script);
    });
    
    return window.googleMapsPromise;
  };
  
  // Load Google Maps API when input is focused
  useEffect(() => {
    const handleInputInteraction = () => {
      if (!googleApiLoaded) {
        loadGoogleMapsAPI()
          .then(() => {
            console.log('Google Maps API loaded on user interaction');
          })
          .catch(error => {
            console.error('Error loading Google Maps API:', error);
          });
      }
    };
    
    if (inputRef.current) {
      inputRef.current.addEventListener('focus', handleInputInteraction);
      inputRef.current.addEventListener('input', handleInputInteraction);
      
      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener('focus', handleInputInteraction);
          inputRef.current.removeEventListener('input', handleInputInteraction);
        }
      };
    }
  }, [googleApiLoaded, inputRef.current]);
  
  // Initialize autocomplete after API is loaded
  useEffect(() => {
    if (!googleApiLoaded || !inputRef.current || autocompleteRef.current) return;
    
    try {
      if (!sessionTokenRef.current && window.google.maps.places.AutocompleteSessionToken) {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      }
      
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        sessionToken: sessionTokenRef.current
      });
      
      autocompleteRef.current.addListener('place_changed', async () => {
        try {
          const place = autocompleteRef.current.getPlace();
          
          if (!place || !place.formatted_address) {
            console.error('Invalid place selection');
            return;
          }
          
          updateFormData({
            selectedSuggestionAddress: place.formatted_address,
            userTypedAddress: lastTypedAddress,
            addressSelectionType: 'AddressRetry-UserClicked'
          });
          
          setIsLoading(true);
          
          console.log('Auto-submitting retry form after autocomplete selection:', place.formatted_address);
          
          await processAddressSelection(place);

          trackFormStepComplete(4, 'Address Retry Completed (Suggestion)', formData);
          
          // Navigate back to step 3 (report) with new data
          updateFormData({ formStep: 3 }); // Go to step 3
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error handling place selection:', error);
          trackFormError('Error handling place selection: ' + error.message, 'maps');
        }
      });
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      trackFormError('Error initializing Google Places Autocomplete: ' + error.message, 'maps');
    }
  }, [googleApiLoaded, updateFormData, lastTypedAddress]);

  // Track browser autofill events with comprehensive address auto-submission
  useEffect(() => {
    // Keep track of which fields have been autofilled
    const autofilledFields = new Set();
    
    const handleAnimationStart = (e) => {
      // In Chrome, autocomplete fields will have animation-name: onAutoFillStart
      if (e.animationName === 'onAutoFillStart') {
        setAutofillDetected(true);
        console.log('AddressRetry: Autofill detected on field:', e.target.name);
        
        // Add this field to our tracking set
        autofilledFields.add(e.target.name);
        
        // Check if the field that was auto-filled is name or phone
        if (e.target.name === 'name' || e.target.name === 'tel') {
          // Get the value filled in by browser
          setTimeout(() => {
            if (e.target.value) {
              console.log(`AddressRetry: Autofilled ${e.target.name} value:`, e.target.value);
              // Update the form data with this auto-filled value
              const fieldUpdate = {};
              if (e.target.name === 'name') {
                fieldUpdate.name = e.target.value;
                fieldUpdate.autoFilledName = e.target.value;
                fieldUpdate.nameWasAutofilled = true;
              }
              if (e.target.name === 'tel') {
                fieldUpdate.phone = e.target.value;
                fieldUpdate.autoFilledPhone = e.target.value;
              }
              
              updateFormData(fieldUpdate);
            }
          }, 100); // Small delay to ensure the browser has filled in the value
        }
      }
    };
    
    // Add CSS to detect autofill
    const style = document.createElement('style');
    style.textContent = `
      @keyframes onAutoFillStart {
        from {}
        to {}
      }
      input:-webkit-autofill {
        animation-name: onAutoFillStart;
        animation-duration: 1ms;
      }
    `;
    document.head.append(style);
    
    // Add listeners to all form fields that might be autofilled
    const addressInput = inputRef.current;
    const formInputs = formRef.current?.querySelectorAll('input');
    
    if (addressInput) {
      addressInput.addEventListener('animationstart', handleAnimationStart);
    }
    
    if (formInputs) {
      formInputs.forEach(input => {
        if (input.name === 'name' || input.name === 'tel' || input.name === 'address-line1') {
          input.addEventListener('animationstart', handleAnimationStart);
        }
      });
    }
    
    return () => {
      document.head.removeChild(style);
      if (addressInput) {
        addressInput.removeEventListener('animationstart', handleAnimationStart);
      }
      
      if (formInputs) {
        formInputs.forEach(input => {
          if (input.name === 'name' || input.name === 'tel' || input.name === 'address-line1') {
            input.removeEventListener('animationstart', handleAnimationStart);
          }
        });
      }
    };
  }, [updateFormData]);

  return (
    <div className="vb-af1-hero-section vb-retry-hero-section">
      <div className="vb-af1-hero-middle-container vb-retry-hero-middle-container">
        <div className="vb-af1-hero-content vb-retry-hero-content">
          <div className="vb-af1-hero-headline vb-retry-hero-headline">
            {formatText("Ooops! It looks like we had trouble matching your address:")}    
          </div>
          <div className="vb-af1-hero-subheadline vb-retry-hero-subheadline vb-retry-address-display">
            {formData.street || 'No address entered'}
          </div>
          <div className="vb-af1-hero-subheadline vb-retry-hero-subheadline">
            {formatSubheadline("Please enter your address and select a match from the dropdown to check ValueBoost again.")}
          </div>
          
          {/* Address form without the example ValueBoost box */}
          <form className="vb-af1-form-container vb-retry-form-container" id="addressRetryForm" autoComplete="on" onSubmit={handleButtonClick} ref={formRef}>
            <input
              ref={inputRef}
              type="text"
              name="address-line1"
              autoComplete="address-line1"
              placeholder="Enter your complete address..."
              className={errorMessage ? 'vb-af1-address-input-invalid vb-retry-address-input-invalid' : 'vb-af1-address-input vb-retry-address-input'}
              value={formData.street || ''}
              onChange={handleChange}
              onFocus={(e) => e.target.placeholder = ''}
              onBlur={(e) => e.target.placeholder = 'Enter your complete address...'}
              disabled={isLoading}
              required
            />
            
            {/* Visually hidden name field - still accessible to screen readers and browser autofill */}
            <div style={visuallyHiddenStyle}>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Name"
                className="vb-af1-address-input vb-retry-address-input"
                value={formData.name || ''}
                onChange={(e) => updateFormData({ name: e.target.value, autoFilledName: e.target.value })}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Name'}
                disabled={isLoading}
              />
            </div>
            
            {/* Visually hidden phone field - still accessible to screen readers and browser autofill */}
            <div style={visuallyHiddenStyle}>
              <input
                type="tel"
                name="tel"
                autoComplete="tel"
                placeholder="Your phone (optional)"
                className="vb-af1-address-input vb-retry-address-input"
                value={formData.phone || ''}
                onChange={(e) => updateFormData({ phone: e.target.value, autoFilledPhone: e.target.value })}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Your phone (optional)'}
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit"
              className="vb-af1-submit-button vb-retry-submit-button"
              id="address-retry-submit-button" 
              disabled={isLoading}
            >
              {isLoading ? 'RETRYING SCAN...' : 'RETRY SCAN'}
            </button>
          </form>
          
          {errorMessage && (
            <div className="vb-af1-error-message vb-retry-error-message">{errorMessage}</div>
          )}
          
          {/* Phone support option */}
          <div className="vb-retry-help-text">
            Need Help? <a href="tel:+14046714628" className="vb-retry-phone-link">(404) 671-4628</a> - Call or text us and we'll process your request for you and answer any questions!
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressRetry;