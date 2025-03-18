import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';
import { trackAddressSelected } from '../../services/analytics';
import { lookupPropertyInfo } from '../../services/maps.js';
import axios from 'axios';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [firstSuggestion, setFirstSuggestion] = useState(null);
  
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
    updateFormData({ 
      street: value,
      addressSelectionType: 'Manual'
    });
    
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
    
    // If the user has typed more than 5 characters, request address predictions
    if (value.length > 5 && googleApiLoaded && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions({
        input: value,
        sessionToken: sessionTokenRef.current,
        componentRestrictions: { country: 'us' },
        types: ['address']
      }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
          // Store the first suggestion for potential use if user doesn't select one
          setFirstSuggestion(predictions[0]);
        } else {
          setFirstSuggestion(null);
        }
      });
    } else if (value.length <= 5) {
      // Clear first suggestion if input is too short
      setFirstSuggestion(null);
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
      
      placesService.getDetails({
        placeId: placeId,
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        sessionToken: sessionTokenRef.current
      }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          reject(new Error(`Place details request failed: ${status}`));
        }
      });
    });
  };
  
  // Fetch property data from Melissa API
  const fetchPropertyData = async (address) => {
    try {
      const propertyData = await lookupPropertyInfo(address);
      
      if (propertyData) {
        // Update form data with property information
        updateFormData({
          apiOwnerName: propertyData.apiOwnerName,
          apiEstimatedValue: propertyData.apiEstimatedValue,
          apiMaxHomeValue: propertyData.apiMaxValue,
          formattedApiEstimatedValue: propertyData.formattedApiEstimatedValue,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          finishedSquareFootage: propertyData.finishedSquareFootage,
          // If city/state/zip weren't set by Google, use Melissa data
          city: formData.city || propertyData.city,
          state: formData.state || propertyData.state,
          zip: formData.zip || propertyData.zip
        });
        
        return propertyData;
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
      return;
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
      addressSelectionType: 'Google'
    });
    
    // Ensure inputRef has the correct value
    if (inputRef.current) {
      inputRef.current.value = place.formatted_address;
    }
    
    // After a place is selected, we're done with this session token
    // Create a new one for the next autocomplete session
    sessionTokenRef.current = generateSessionToken();
    
    // Track the address selection in analytics
    trackAddressSelected('Google');
    
    // Clear any error messages
    setErrorMessage('');
    
    // Fetch property data from Melissa API
    await fetchPropertyData(place.formatted_address);
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // If already loading, prevent multiple submissions
    if (isLoading) return false;
    
    // Set loading state immediately
    setIsLoading(true);
    
    try {
      // If user hasn't selected an address but has typed enough, try to use first suggestion
      if (firstSuggestion && formData.street && formData.street.length > 5 && !formData.city) {
        try {
          console.log('Using first suggestion:', firstSuggestion.description);
          
          // Get full place details for the suggestion
          const placeDetails = await getPlaceDetails(firstSuggestion.place_id);
          
          // Process the selected address
          await processAddressSelection(placeDetails);
        } catch (error) {
          console.error('Error using first suggestion:', error);
          // Continue with normal submission even if this fails
        }
      }
      
      // Validate address
      if (!validateAddress(formData.street)) {
        setErrorMessage('Please enter a valid address to check your cash offer');
        setIsLoading(false);
        return false;
      }
      
      // Clear error message
      setErrorMessage('');
      
      // If we haven't fetched property data yet, do it now
      if (!formData.apiEstimatedValue && formData.street) {
        await fetchPropertyData(formData.street);
      }
      
      // Set some minimal data if we don't have complete address info
      if (!formData.city || !formData.zip) {
        updateFormData({
          addressSelectionType: 'Manual',
          city: formData.city || '',
          zip: formData.zip || '',
          state: formData.state || 'GA'
        });
      }
      
      // Track address submission
      trackAddressSelected(formData.addressSelectionType || 'Manual');
      
      // Proceed to next step
      setTimeout(() => {
        setIsLoading(false);
        nextStep();
      }, 300);
      
      return true;
    } catch (error) {
      console.error('Error during form submission:', error);
      setIsLoading(false);
      return false;
    }
  };
  
  // Load Google Maps API
  useEffect(() => {
    // Only run once
    if (googleApiLoaded) return;
    
    // Get API key from environment variable
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyArZ4pBJT_YW6wRVuPI2-AgGL-0hbAdVbI";
    
    // Define a callback function for when the API loads
    window.initGoogleMapsAutocomplete = () => {
      console.log('Google Maps API loaded successfully');
      setGoogleApiLoaded(true);
      
      // Create a session token right away
      if (window.google.maps.places.AutocompleteSessionToken) {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      }
      
      // Initialize the AutocompleteService for getting suggestions
      if (window.google.maps.places.AutocompleteService) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }
    };
    
    // Define an error handler for the API
    window.gm_authFailure = () => {
      console.error('Google Maps API authentication failure');
    };
    
    // Check if API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps API already loaded');
      setGoogleApiLoaded(true);
      
      // Initialize service if API is already loaded
      if (window.google.maps.places.AutocompleteService) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }
      
      return;
    }
    
    // Load the API with a callback
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAutocomplete`;
    script.async = true;
    script.defer = true;
    script.onerror = (e) => {
      console.error('Failed to load Google Maps API script:', e);
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Cleanup function to remove the global callbacks
      delete window.initGoogleMapsAutocomplete;
      delete window.gm_authFailure;
    };
  }, [googleApiLoaded]);
  
  // Initialize autocomplete after API is loaded
  useEffect(() => {
    if (!googleApiLoaded || !inputRef.current || autocompleteRef.current) return;
    
    try {
      // If we don't have a session token yet, create one
      if (!sessionTokenRef.current && window.google.maps.places.AutocompleteSessionToken) {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      }
      
      // Initialize autocomplete directly on the input with the session token
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        sessionToken: sessionTokenRef.current
      });
      
      // Add listener for place selection
      autocompleteRef.current.addListener('place_changed', async () => {
        try {
          const place = autocompleteRef.current.getPlace();
          
          // Process the selected address
          const success = await processAddressSelection(place);
          
          if (success) {
            // Automatically submit the form after selecting an address
            // Using setTimeout to ensure React has updated the state
            setTimeout(() => {
              // Use a direct click on the submit button for most reliable behavior
              const submitButton = document.querySelector('.submit-button');
              if (submitButton) {
                submitButton.click();
              } else {
                // Fallback to programmatic form submission
                if (formRef.current) {
                  formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }
            }, 200);
          }
        } catch (error) {
          console.error('Error handling place selection:', error);
        }
      });
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  }, [googleApiLoaded, updateFormData]);
  
  // Add additional CSS to fix autocomplete dropdown styling
  useEffect(() => {
    if (!googleApiLoaded) return;
    
    // Create a style element for the pac-container
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .pac-container {
        z-index: 9999 !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        border: 1px solid #ccc;
        border-top: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", sans-serif;
      }
      .pac-item {
        padding: 8px 15px;
        font-size: 1.2rem;
        cursor: pointer !important;
      }
      .pac-item:hover {
        background-color: #f5f5f5;
      }
      .pac-item-query {
        font-size: 1.2rem;
        color: #333;
      }
      .pac-matched {
        font-weight: bold;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [googleApiLoaded]);
  
  return (
    <div className="hero-section">
      <div className="hero-middle-container">
        <div className="hero-content fade-in">
          <div className="hero-headline">{formData.dynamicHeadline || "Sell Your House For Cash Fast!"}</div>
          <div className="hero-subheadline">{formData.dynamicSubHeadline || "Get a Great Cash Offer For Your House and Close Fast!"}</div>
          
          <form ref={formRef} className="form-container" onSubmit={handleSubmit}>
            {/* Input with direct Google Places autocomplete */}
            <input
              ref={inputRef}
              type="text"
              placeholder="Street address..."
              className={errorMessage ? 'address-input-invalid' : 'address-input'}
              value={formData.street || ''}
              onChange={handleChange}
              onFocus={(e) => e.target.placeholder = ''}
              onBlur={(e) => e.target.placeholder = 'Street address...'}
              disabled={isLoading}
            />
            
            <button 
              className="submit-button" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'CHECKING...' : 'CHECK OFFER'}
            </button>
          </form>
          
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddressForm;