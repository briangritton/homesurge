import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';
import { trackAddressSelected } from '../../services/analytics';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    apiLoaded: false,
    autocompleteInitialized: false,
    lastInputValue: '',
    dropdownRequested: false,
    pacContainerFound: false,
    predictions: []
  });
  
  // Reference to visible input that user interacts with
  const visibleInputRef = useRef(null);
  
  // Reference to Google input that Google Maps attaches to
  const googleInputRef = useRef(null);
  
  // Reference to autocomplete instance
  const autocompleteRef = useRef(null);
  
  // Add debug message to console and state
  const addDebugInfo = (key, value) => {
    console.log(`DEBUG [${key}]:`, value);
    setDebugInfo(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle form input changes for the main visible input
  const handleChange = (e) => {
    const value = e.target.value;
    updateFormData({ 
      street: value,
      addressSelectionType: 'Manual'
    });
    
    // Update Google input to match visible input
    if (googleInputRef.current) {
      googleInputRef.current.value = value;
      
      addDebugInfo('lastInputValue', value);
      
      // Trigger the autocomplete by simulating user input
      if (googleApiLoaded && autocompleteRef.current) {
        try {
          addDebugInfo('dropdownRequested', true);
          
          // Show details about autocomplete session
          if (autocompleteRef.current && typeof autocompleteRef.current.getPlace === 'function') {
            const sessionToken = autocompleteRef.current.gm_accessors_ && 
                                 autocompleteRef.current.gm_accessors_.place && 
                                 autocompleteRef.current.gm_accessors_.place.Lc && 
                                 autocompleteRef.current.gm_accessors_.place.Lc.sessionToken;
            
            addDebugInfo('sessionToken', sessionToken ? 'Valid' : 'Missing');
          }
          
          // Explicitly dispatch events that Google's autocomplete listens for
          const event = new Event('input', { bubbles: true });
          googleInputRef.current.dispatchEvent(event);
          
          // Look for pac-container after a small delay
          setTimeout(() => {
            const pacContainer = document.querySelector('.pac-container');
            const pacItemsCount = pacContainer ? pacContainer.querySelectorAll('.pac-item').length : 0;
            
            addDebugInfo('pacContainerFound', !!pacContainer);
            addDebugInfo('pacItemsCount', pacItemsCount);
          }, 300);
        } catch (error) {
          console.error('Error triggering autocomplete:', error);
          addDebugInfo('error', error.message);
        }
      }
    }
    
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Log debug info
    console.log('Debug info at submission:', debugInfo);
    
    // Validate address
    if (!validateAddress(formData.street)) {
      setErrorMessage('Please enter a valid address to check your cash offer');
      return;
    }
    
    // Clear error message
    setErrorMessage('');
    
    // Set loading state
    setIsLoading(true);
    
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
  };
  
  // Test autocomplete manually
  const testAutocomplete = () => {
    if (!googleApiLoaded || !googleInputRef.current || !autocompleteRef.current) {
      addDebugInfo('testResult', 'Cannot test - API or autocomplete not ready');
      return;
    }
    
    try {
      addDebugInfo('testingAutocomplete', true);
      
      // Try to access some internal properties
      const hasSessionToken = autocompleteRef.current.gm_accessors_ && 
                             autocompleteRef.current.gm_accessors_.place && 
                             autocompleteRef.current.gm_accessors_.place.Lc && 
                             autocompleteRef.current.gm_accessors_.place.Lc.sessionToken;
      
      // Check if Google Service responds to a test prediction
      if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.AutocompleteService) {
        const service = new window.google.maps.places.AutocompleteService();
        
        // Request predictions
        service.getPlacePredictions({
          input: '123 Main',
          componentRestrictions: { country: 'us' },
          types: ['address']
        }, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
            addDebugInfo('testResult', 'Success! Predictions received');
            addDebugInfo('predictions', predictions.map(p => p.description).join(', '));
          } else {
            addDebugInfo('testResult', `Failed: ${status}`);
          }
        });
      } else {
        addDebugInfo('testResult', 'AutocompleteService not available');
      }
      
      // Look for pac-container
      const pacContainer = document.querySelector('.pac-container');
      addDebugInfo('pacContainerExists', !!pacContainer);
      
    } catch (error) {
      addDebugInfo('testError', error.message);
    }
  };
  
  // Load Google Maps API
  useEffect(() => {
    // Only run once
    if (googleApiLoaded) return;
    
    // Get API key from environment variable
// New code (no fallback)
const apiKey = "AIzaSyDw28CT6Q1FTSx3wyY1gIRXcLDciES8_vg";

// Optional: throw an error if the env variable isn’t set
if (!apiKey) {
  throw new Error('Missing REACT_APP_GOOGLE_MAPS_API_KEY environment variable.');
}    
    // Define a callback function for when the API loads
    window.initGoogleMapsAutocomplete = () => {
      console.log('Google Maps API loaded successfully via callback');
      setGoogleApiLoaded(true);
      addDebugInfo('apiLoaded', true);
      
      // Test if all expected Google APIs are available
      const hasPlaces = window.google && window.google.maps && window.google.maps.places;
      const hasAutocomplete = hasPlaces && window.google.maps.places.Autocomplete;
      const hasAutocompleteService = hasPlaces && window.google.maps.places.AutocompleteService;
      
      addDebugInfo('hasPlacesAPI', hasPlaces);
      addDebugInfo('hasAutocompleteClass', hasAutocomplete);
      addDebugInfo('hasAutocompleteService', hasAutocompleteService);
    };
    
    // Define an error handler for the API
    window.gm_authFailure = () => {
      console.error('Google Maps API authentication failure');
      addDebugInfo('apiAuthError', true);
    };
    
    // Check if API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps API already loaded');
      setGoogleApiLoaded(true);
      addDebugInfo('apiLoaded', true);
      return;
    }
    
    // Load the API with a callback
    console.log('Loading Google Maps API with key:', apiKey);
    addDebugInfo('apiKeyUsed', apiKey.substring(0, 8) + '...');
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAutocomplete`;
    script.async = true;
    script.defer = true;
    script.onerror = (e) => {
      console.error('Failed to load Google Maps API script:', e);
      addDebugInfo('scriptLoadError', true);
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
    if (!googleApiLoaded || !googleInputRef.current || autocompleteRef.current) return;
    
    try {
      console.log('Initializing autocomplete on Google input');
      addDebugInfo('initializingAutocomplete', true);
      
      // Initialize autocomplete on the Google input
      autocompleteRef.current = new window.google.maps.places.Autocomplete(googleInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name']
      });
      
      addDebugInfo('autocompleteInitialized', true);
      addDebugInfo('autocompleteOptions', {
        types: ['address'],
        countryRestriction: 'us',
        fields: ['address_components', 'formatted_address', 'geometry', 'name']
      });
      
      // Add listener for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        try {
          const place = autocompleteRef.current.getPlace();
          
          addDebugInfo('placeSelected', place ? place.formatted_address : 'No place data');
          
          if (!place || !place.formatted_address) {
            console.warn('No place data available');
            return;
          }
          
          console.log('Place selected:', place.formatted_address);
          
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
          
          // Update visible input to match selected place
          if (visibleInputRef.current) {
            visibleInputRef.current.value = place.formatted_address;
          }
          
          // Track the address selection in analytics
          trackAddressSelected('Google');
        } catch (error) {
          console.error('Error handling place selection:', error);
          addDebugInfo('placeSelectionError', error.message);
        }
      });
      
      console.log('Autocomplete initialized successfully on Google input');
      
      // Try to directly use AutocompleteService as a test
      if (window.google.maps.places.AutocompleteService) {
        try {
          const service = new window.google.maps.places.AutocompleteService();
          service.getPlacePredictions({
            input: '123 Main Street',
            componentRestrictions: { country: 'us' },
            types: ['address']
          }, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              addDebugInfo('apiTestSuccessful', true);
              addDebugInfo('testPredictionsCount', predictions.length);
            } else {
              addDebugInfo('apiTestFailed', status);
            }
          });
        } catch (e) {
          addDebugInfo('serviceTestError', e.message);
        }
      }
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      addDebugInfo('initializationError', error.message);
    }
  }, [googleApiLoaded, updateFormData]);
  
  // Observe for dropdown to debug its appearance
  useEffect(() => {
    if (!googleApiLoaded) return;
    
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          const pacContainer = document.querySelector('.pac-container');
          if (pacContainer) {
            addDebugInfo('pacContainerDetected', true);
            addDebugInfo('pacContainerItems', pacContainer.querySelectorAll('.pac-item').length);
            
            // Log the position of the container
            const rect = pacContainer.getBoundingClientRect();
            addDebugInfo('pacContainerPosition', {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              visible: rect.height > 0
            });
            
            // Ensure it's visible
            pacContainer.style.display = 'block';
            pacContainer.style.visibility = 'visible';
            pacContainer.style.zIndex = '9999';
          }
        }
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
    };
  }, [googleApiLoaded]);
  
  // Styles for the Google input - always visible for debugging
  const googleInputContainerStyle = {
    position: 'absolute',
    top: '80px', // For debugging, positioned below the main input
    left: '0',
    width: '75%',
    zIndex: '5'
  };
  
  const googleInputStyle = {
    width: '100%',
    height: '70px',
    fontSize: '1.5rem',
    color: '#6d6d6d',
    padding: '0 25px',
    border: '1px solid #4e4e4e',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center'
  };
  
  // Style for Google attribution
  const googleAttributionStyle = {
    display: 'block',
    width: '100%',
    fontSize: '0.8rem', 
    color: '#666',
    padding: '5px 0',
    textAlign: 'right'
  };
  
  // Debug panel style
  const debugPanelStyle = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    backgroundColor: '#f1f1f1',
    padding: '10px',
    borderRadius: '5px',
    maxWidth: '300px',
    maxHeight: '200px',
    overflow: 'auto',
    zIndex: '9999',
    fontSize: '12px',
    opacity: '0.9'
  };
  
  return (
    <div className="hero-section">
      <div className="hero-middle-container">
        <div className="hero-content fade-in">
          <div className="hero-headline">{formData.dynamicHeadline || "Sell Your House For Cash Fast!"}</div>
          <div className="hero-subheadline">{formData.dynamicSubHeadline || "Get a Great Cash Offer For Your House and Close Fast!"}</div>
          
          <form className="form-container" onSubmit={handleSubmit}>
            {/* Visible input that user interacts with */}
            <input
              ref={visibleInputRef}
              type="text"
              placeholder="Street address..."
              className={errorMessage ? 'address-input-invalid' : 'address-input'}
              value={formData.street || ''}
              onChange={handleChange}
              onFocus={(e) => e.target.placeholder = ''}
              onBlur={(e) => e.target.placeholder = 'Street address...'}
              disabled={isLoading}
            />
            
            {/* Google Maps input for autocomplete */}
            <div style={googleInputContainerStyle}>
              <input 
                ref={googleInputRef}
                type="text"
                defaultValue={formData.street || ''}
                placeholder="Google Places Search..."
                style={googleInputStyle}
              />
              
              {/* Google attribution */}
              <div style={googleAttributionStyle}>
                Powered by <img 
                  src="https://developers.google.com/static/maps/documentation/images/google_on_white.png" 
                  alt="Google" 
                  height="18"
                  style={{verticalAlign: 'middle'}}
                />
              </div>
              
              {/* Testing button */}
              <button 
                type="button" 
                onClick={testAutocomplete}
                style={{
                  padding: '5px',
                  fontSize: '12px',
                  marginTop: '5px'
                }}
              >
                Test Autocomplete
              </button>
            </div>
            
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
          
          {/* Debug panel */}
          <div style={debugPanelStyle}>
            <h4 style={{margin: '0 0 5px 0'}}>Debug Info</h4>
            <div>API Loaded: {debugInfo.apiLoaded ? 'Yes' : 'No'}</div>
            <div>Autocomplete Init: {debugInfo.autocompleteInitialized ? 'Yes' : 'No'}</div>
            <div>Dropdown Requested: {debugInfo.dropdownRequested ? 'Yes' : 'No'}</div>
            <div>PAC Container: {debugInfo.pacContainerFound ? 'Found' : 'Missing'}</div>
            <div>Last Input: {debugInfo.lastInputValue}</div>
            {Object.entries(debugInfo)
              .filter(([key]) => !['apiLoaded', 'autocompleteInitialized', 'dropdownRequested', 'pacContainerFound', 'lastInputValue'].includes(key))
              .map(([key, value]) => (
                <div key={key}>{key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}</div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressForm;