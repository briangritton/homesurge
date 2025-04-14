import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';
import { trackAddressSelected, trackFormStepComplete, trackFormError } from '../../services/analytics';
import { lookupPropertyInfo } from '../../services/maps.js';
import { createSuggestionLead } from '../../services/zoho.js';
import axios from 'axios';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [firstSuggestion, setFirstSuggestion] = useState(null);
  const [suggestionLeadId, setSuggestionLeadId] = useState(null);
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
  
  // Flag to track if we've already saved a final selection
  const finalSelectionSavedRef = useRef(false);
  
  // Initialize suggestionLeadId from localStorage if available
  useEffect(() => {
    const existingLeadId = localStorage.getItem('suggestionLeadId');
    if (existingLeadId) {
      console.log("Retrieved suggestionLeadId from localStorage:", existingLeadId);
      setSuggestionLeadId(existingLeadId);
    }
  }, []);
  
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
      addressSelectionType: 'Manual',
      userTypedAddress: value  // Always track what the user is typing
    });
    
    // Keep track of the latest typed address
    setLastTypedAddress(value);
    
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
            console.log('Got suggestion:', predictions[0].description);
            
            // Store all suggestions
            setAddressSuggestions(predictions);
            
            // Try to get details for the first suggestion to extract address components
            if (predictions[0].place_id) {
              try {
                const placeDetails = await getPlaceDetails(predictions[0].place_id);
                
                // Extract address components
                const addressComponents = {
                  city: '',
                  state: 'GA',
                  zip: ''
                };
                
                if (placeDetails.address_components && placeDetails.address_components.length > 0) {
                  placeDetails.address_components.forEach(component => {
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
                
                // Try to get an existing leadId from localStorage
                const existingLeadId = localStorage.getItem('suggestionLeadId') || suggestionLeadId;
                
                // Create or update lead with suggestions and address components
                const top5Suggestions = predictions.slice(0, 5); // Only use top 5
                const preparedData = {
                  street: value,
                  userTypedAddress: value,
                  city: addressComponents.city,
                  state: addressComponents.state,
                  zip: addressComponents.zip,
                  suggestionOne: top5Suggestions[0]?.description || '',
                  suggestionTwo: top5Suggestions[1]?.description || '',
                  suggestionThree: top5Suggestions[2]?.description || '',
                  suggestionFour: top5Suggestions[3]?.description || '',
                  suggestionFive: top5Suggestions[4]?.description || ''
                };
                
                // Update the form data with these details
                updateFormData(preparedData);
                
                // Send to Zoho with the address components
                const leadId = await createSuggestionLead(value, top5Suggestions, existingLeadId, addressComponents);
                
                if (leadId) {
                  setSuggestionLeadId(leadId);
                  localStorage.setItem('suggestionLeadId', leadId);
                  localStorage.setItem('leadId', leadId);
                  
                  // Also, let's trigger the property data fetch here
                  fetchPropertyData(placeDetails.formatted_address).then(propertyData => {
                    if (propertyData && leadId) {
                      // Update the lead with property data immediately
                      try {
                        const propertyUpdateData = {
                          apiOwnerName: propertyData.apiOwnerName || '',
                          apiEstimatedValue: propertyData.apiEstimatedValue?.toString() || '0',
                          apiMaxHomeValue: propertyData.apiMaxValue?.toString() || '0',
                          apiEquity: propertyData.apiEquity?.toString() || '0',
                          apiPercentage: propertyData.apiPercentage?.toString() || '0',
                          apiHomeValue: propertyData.apiEstimatedValue?.toString() || '0',
                          // Include address components again to reinforce them
                          street: placeDetails.formatted_address,
                          city: addressComponents.city,
                          state: addressComponents.state,
                          zip: addressComponents.zip
                        };
                        
                        axios.post('/api/zoho', {
                          action: 'update',
                          leadId,
                          formData: propertyUpdateData
                        }).then(() => {
                          console.log('Updated lead with property data during typing');
                        }).catch(err => {
                          console.error('Error updating lead with property data during typing:', err);
                        });
                      } catch (error) {
                        console.error('Error preparing property data update:', error);
                      }
                    }
                  }).catch(err => {
                    console.error('Error fetching property data during typing:', err);
                  });
                }
              } catch (error) {
                console.error('Error getting place details:', error);
                // Fall back to simple suggestion without address components
                const existingLeadId = localStorage.getItem('suggestionLeadId') || suggestionLeadId;
                const top5Suggestions = predictions.slice(0, 5);
                const leadId = await createSuggestionLead(value, top5Suggestions, existingLeadId);
                
                if (leadId) {
                  setSuggestionLeadId(leadId);
                  localStorage.setItem('suggestionLeadId', leadId);
                  localStorage.setItem('leadId', leadId);
                }
              }
            } else {
              // Handle case without place_id (less common)
              const existingLeadId = localStorage.getItem('suggestionLeadId') || suggestionLeadId;
              const top5Suggestions = predictions.slice(0, 5);
              const leadId = await createSuggestionLead(value, top5Suggestions, existingLeadId);
              
              if (leadId) {
                setSuggestionLeadId(leadId);
                localStorage.setItem('suggestionLeadId', leadId);
                localStorage.setItem('leadId', leadId);
              }
            }
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
      console.log('Fetching property data for address:', address);
      const propertyData = await lookupPropertyInfo(address);
      
      if (propertyData) {
        console.log('Property data received with available fields:');
        
        // Log important fields for analysis
        const keysToLog = Object.keys(propertyData).filter(key => 
          key !== 'propertyRecord'
        );
        
        console.log('Available fields in propertyData:', keysToLog);
        console.log('Complete property data for integration:', propertyData);
        
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
        
        // Update form data with property information including equity fields
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
          // If city/state/zip weren't set by Google, use Melissa data
          city: formData.city || propertyData.city || '',
          state: formData.state || propertyData.state || 'GA',
          zip: formData.zip || propertyData.zip || '',
          // Store the full property record for access to all fields
          propertyRecord: propertyData.propertyRecord,
        });
        
        console.log('Form data updated with property info:', {
          estimatedValue: formattedValue,
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
    
    // Log the extracted address components
    console.log('Extracted address components:', {
      city: addressComponents.city,
      state: addressComponents.state,
      zip: addressComponents.zip
    });
    
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
      addressSelectionType: 'Google',
      selectedSuggestionAddress: place.formatted_address,
      leadStage: 'Address Selected'
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
    
    // Get the existing lead ID from localStorage or from state
    const existingLeadId = suggestionLeadId || localStorage.getItem('suggestionLeadId');
    
    // Update the suggestion lead with the final selection if we have one
    if (existingLeadId && !finalSelectionSavedRef.current) {
      finalSelectionSavedRef.current = true;
      
      try {
        // Prepare data for the lead update - explicitly include address fields
        const finalSelectionData = {
          // Use the proper field names that will map to Zoho
          street: place.formatted_address,
          city: addressComponents.city,
          state: addressComponents.state,
          zip: addressComponents.zip,
          
          userTypedAddress: lastTypedAddress,
          selectedSuggestionAddress: place.formatted_address,
          suggestionOne: addressSuggestions[0]?.description || '',
          suggestionTwo: addressSuggestions[1]?.description || '',
          suggestionThree: addressSuggestions[2]?.description || '',
          suggestionFour: addressSuggestions[3]?.description || '',
          suggestionFive: addressSuggestions[4]?.description || '',
          addressSelectionType: 'Google',
          leadStage: 'Address Selected'
        };
        
        console.log('Sending address components to Zoho:', {
          street: finalSelectionData.street,
          city: finalSelectionData.city,
          state: finalSelectionData.state,
          zip: finalSelectionData.zip
        });
        
        // Update the existing lead
        const response = await axios.post('/api/zoho', {
          action: 'update',
          leadId: existingLeadId,
          formData: finalSelectionData
        });
        
        console.log('Updated suggestion lead with final selection:', response.data);
        
        // Make sure we're using this leadId going forward
        localStorage.setItem('leadId', existingLeadId);
      } catch (error) {
        console.error('Error updating suggestion lead with final selection:', error);
      }
    }
    
    // Immediately fetch property data from Melissa API
    console.log('Fetching property data immediately after address selection');
    const propertyData = await fetchPropertyData(place.formatted_address);
    
    // If we got property data, update the lead again with this information
    if (propertyData && existingLeadId) {
      try {
        // Update the lead with property data
        const propertyUpdateData = {
          // Include the address components again to ensure they are saved
          street: place.formatted_address,
          city: addressComponents.city,
          state: addressComponents.state,
          zip: addressComponents.zip,
          
          // Include property data
          apiOwnerName: propertyData.apiOwnerName || '',
          apiEstimatedValue: propertyData.apiEstimatedValue?.toString() || '0',
          apiMaxHomeValue: propertyData.apiMaxValue?.toString() || '0',
          apiEquity: propertyData.apiEquity?.toString() || '0',
          apiPercentage: propertyData.apiPercentage?.toString() || '0',
          apiHomeValue: propertyData.apiEstimatedValue?.toString() || '0'
        };
        
        await axios.post('/api/zoho', {
          action: 'update',
          leadId: existingLeadId,
          formData: propertyUpdateData
        });
        
        console.log('Updated lead with property data from Melissa API');
      } catch (error) {
        console.error('Error updating lead with property data:', error);
      }
    }
    
    return propertyData != null;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // If already loading, prevent multiple submissions
    if (isLoading) return false;
    
    // Set loading state immediately
    setIsLoading(true);
    
    try {
      let propertyDataRetrieved = false;
      
      // If user has entered at least 2 characters and there's a suggestion available
      if (firstSuggestion && formData.street && formData.street.length >= 2) {
        try {
          console.log('Using first suggestion:', firstSuggestion.description);
          
          // Get full place details for the suggestion
          const placeDetails = await getPlaceDetails(firstSuggestion.place_id);
          
          // Process the selected address AND WAIT FOR IT TO COMPLETE
          propertyDataRetrieved = await processAddressSelection(placeDetails);
          
          // Update form data to indicate this was an automatic suggestion selection
          updateFormData({
            selectedSuggestionAddress: placeDetails.formatted_address,
            userTypedAddress: formData.street, // What the user actually typed
            addressSelectionType: 'AutoSuggestion'
          });
          
          // Add a small delay to ensure form data is updated
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('Error using first suggestion:', error);
          // Continue with normal submission even if this fails
        }
      }
      
      // Validate address - only if we don't have a suggestion to use
      if (!firstSuggestion && !validateAddress(formData.street)) {
        const errorMsg = 'Please enter a valid address to check your cash offer';
        setErrorMessage(errorMsg);
        setIsLoading(false);
        
        // Track form error for analytics
        trackFormError(errorMsg, 'street');
        
        return false;
      }
      
      // Clear error message
      setErrorMessage('');
      
      // If we haven't fetched property data yet, do it now
      if (!propertyDataRetrieved && !formData.apiEstimatedValue && formData.street) {
        propertyDataRetrieved = await fetchPropertyData(formData.street) != null;
        
        // If we got property data and have a lead ID, update the lead
        const existingLeadId = suggestionLeadId || localStorage.getItem('suggestionLeadId');
        
        if (propertyDataRetrieved && existingLeadId) {
          try {
            // Update the lead with property data
            const propertyUpdateData = {
              apiOwnerName: formData.apiOwnerName || '',
              apiEstimatedValue: formData.apiEstimatedValue?.toString() || '0',
              apiMaxHomeValue: formData.apiMaxHomeValue?.toString() || '0',
              apiEquity: formData.apiEquity?.toString() || '0',
              apiPercentage: formData.apiPercentage?.toString() || '0',
              apiHomeValue: formData.apiEstimatedValue?.toString() || '0',
              // Include address fields again
              street: formData.street,
              city: formData.city,
              state: formData.state,
              zip: formData.zip
            };
            
            await axios.post('/api/zoho', {
              action: 'update',
              leadId: existingLeadId,
              formData: propertyUpdateData
            });
            
            console.log('Updated lead with property data during form submission');
          } catch (error) {
            console.error('Error updating lead with property data during form submission:', error);
          }
        }
        
        // Add a small delay to ensure form data is updated
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Set some minimal data if we don't have complete address info
      if (!formData.city || !formData.zip) {
        updateFormData({
          addressSelectionType: 'Manual',
          city: formData.city || '',
          zip: formData.zip || '',
          state: formData.state || 'GA',
          userTypedAddress: formData.street // Ensure we capture what the user typed
        });
      }
      
      // Check if we have property data before proceeding
      if (!formData.apiEstimatedValue || formData.apiEstimatedValue === 0) {
        console.log('Warning: No property value available before proceeding to next step');
      }
      
      // Ensure we're using the same lead ID
      const existingLeadId = suggestionLeadId || localStorage.getItem('suggestionLeadId');
      if (existingLeadId) {
        localStorage.setItem('leadId', existingLeadId);
      }
      
      // Track address submission and form step completion
      trackAddressSelected(formData.addressSelectionType || 'Manual');
      trackFormStepComplete(1, 'Address Form Completed');
      
      // Log the final form data before proceeding to the next step
      console.log('Final form data before proceeding to next step:', {
        address: formData.street,
        userTypedAddress: formData.userTypedAddress,
        selectedSuggestionAddress: formData.selectedSuggestionAddress,
        suggestionOne: formData.suggestionOne,
        suggestionTwo: formData.suggestionTwo,
        suggestionThree: formData.suggestionThree,
        suggestionFour: formData.suggestionFour,
        suggestionFive: formData.suggestionFive,
        propertyData: {
          apiOwnerName: formData.apiOwnerName,
          apiEstimatedValue: formData.apiEstimatedValue,
          apiMaxHomeValue: formData.apiMaxHomeValue,
          apiEquity: formData.apiEquity,
          apiPercentage: formData.apiPercentage,
          formattedValue: formData.formattedApiEstimatedValue,
          propertyRecord: formData.propertyRecord ? 'Available' : 'Not Available'
        }
      });
      
      // Proceed to next step
      setTimeout(() => {
        setIsLoading(false);
        nextStep();
      }, 300);
      
      return true;
    } catch (error) {
      console.error('Error during form submission:', error);
      setIsLoading(false);
      
      // Track error for analytics
      trackFormError('Form submission error: ' + error.message, 'form');
      
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
      
      // Track error for analytics
      trackFormError('Google Maps API authentication failure', 'maps');
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
      
      // Track error for analytics
      trackFormError('Failed to load Google Maps API script', 'maps');
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
          
          // Save that this was a user-selected suggestion
          updateFormData({
            selectedSuggestionAddress: place.formatted_address,
            userTypedAddress: lastTypedAddress, // What the user typed before selecting
            addressSelectionType: 'UserClicked'
          });
          
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
          
          // Track error for analytics
          trackFormError('Error handling place selection: ' + error.message, 'maps');
        }
      });
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      
      // Track error for analytics
      trackFormError('Error initializing Google Places Autocomplete: ' + error.message, 'maps');
    }
  }, [googleApiLoaded, updateFormData, lastTypedAddress]);
  
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