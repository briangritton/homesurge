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
    predictions: []
  });
  
  // Reference to the main input
  const inputRef = useRef(null);
  
  // Reference to autocomplete instance
  const autocompleteRef = useRef(null);
  
  // Reference to session token
  const sessionTokenRef = useRef(null);
  
  // Add debug message to console and state
  const addDebugInfo = (key, value) => {
    console.log(`DEBUG [${key}]:`, value);
    setDebugInfo(prev => ({ ...prev, [key]: value }));
  };
  
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
    
    addDebugInfo('lastInputValue', value);
    
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
    if (!googleApiLoaded) {
      addDebugInfo('testResult', 'Cannot test - API not loaded');
      return;
    }
    
    try {
      addDebugInfo('testingAutocomplete', true);
      
      // Create a fresh session token for this test
      const testSessionToken = generateSessionToken();
      addDebugInfo('testSessionToken', testSessionToken ? 'Created' : 'Failed');
      
      // Check if Google Service responds to a test prediction
      if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.AutocompleteService) {
        const service = new window.google.maps.places.AutocompleteService();
        
        // Request predictions using the direct service
        service.getPlacePredictions({
          input: '123 Main Street, Atlanta, GA',
          sessionToken: testSessionToken,
          componentRestrictions: { country: 'us' },
          types: ['address']
        }, (predictions, status) => {
          addDebugInfo('testStatus', status);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
            addDebugInfo('testResult', 'Success! Predictions received');
            addDebugInfo('testPredictions', predictions.map(p => p.description).join(', '));
          } else {
            addDebugInfo('testResult', `Failed: ${status}`);
          }
        });
      } else {
        addDebugInfo('testResult', 'AutocompleteService not available');
      }
    } catch (error) {
      addDebugInfo('testError', error.message);
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
      
      // Create a session token right away
      if (hasPlaces && window.google.maps.places.AutocompleteSessionToken) {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        addDebugInfo('initialSessionToken', 'Created');
      }
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
    
    // Clean up any existing Google Maps scripts
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.parentNode.removeChild(existingScript);
    }
    
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
    if (!googleApiLoaded || !inputRef.current || autocompleteRef.current) return;
    
    try {
      console.log('Initializing autocomplete on input');
      addDebugInfo('initializingAutocomplete', true);
      
      // If we don't have a session token yet, create one
      if (!sessionTokenRef.current && window.google.maps.places.AutocompleteSessionToken) {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        addDebugInfo('sessionTokenCreated', true);
      }
      
      // Initialize autocomplete directly on the input with the session token
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        sessionToken: sessionTokenRef.current
      });
      
      addDebugInfo('autocompleteInitialized', true);
      
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
          
          // After a place is selected, we're done with this session token
          // Create a new one for the next autocomplete session
          sessionTokenRef.current = generateSessionToken();
          addDebugInfo('newSessionTokenAfterSelection', 'Created');
          
          // Track the address selection in analytics
          trackAddressSelected('Google');
        } catch (error) {
          console.error('Error handling place selection:', error);
          addDebugInfo('placeSelectionError', error.message);
        }
      });
      
      // Style the autocomplete dropdown to match your design
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer) {
        pacContainer.style.zIndex = '9999';
        pacContainer.style.marginTop = '0';
        pacContainer.style.width = 'auto';
      }
      
      console.log('Autocomplete initialized successfully on input');
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      addDebugInfo('initializationError', error.message);
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
          
          {/* Test button for debugging */}
          <button 
            type="button" 
            onClick={testAutocomplete}
            style={{
              position: 'fixed',
              bottom: '220px',
              right: '10px',
              padding: '5px',
              fontSize: '12px',
              zIndex: 9999
            }}
          >
            Test Autocomplete
          </button>
          
          {/* Debug panel */}
          <div style={debugPanelStyle}>
            <h4 style={{margin: '0 0 5px 0'}}>Debug Info</h4>
            <div>API Loaded: {debugInfo.apiLoaded ? 'Yes' : 'No'}</div>
            <div>Autocomplete Init: {debugInfo.autocompleteInitialized ? 'Yes' : 'No'}</div>
            <div>Last Input: {debugInfo.lastInputValue}</div>
            {Object.entries(debugInfo)
              .filter(([key]) => !['apiLoaded', 'autocompleteInitialized', 'lastInputValue'].includes(key))
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