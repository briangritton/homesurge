import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';
import { trackAddressSelected } from '../../services/analytics';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Reference to visible input that user interacts with
  const visibleInputRef = useRef(null);
  
  // Reference to Google input that Google Maps attaches to
  const googleInputRef = useRef(null);
  
  // Reference to autocomplete instance
  const autocompleteRef = useRef(null);
  
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
      
      // Trigger the autocomplete by simulating user input
      if (googleApiLoaded && autocompleteRef.current) {
        const event = new Event('input', { bubbles: true });
        googleInputRef.current.dispatchEvent(event);
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
  
  // Load Google Maps API
  useEffect(() => {
    // Only run once
    if (googleApiLoaded) return;
    
    // Try multiple API keys if available
    const apiKeys = [
      process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      "AIzaSyArZ4pBJT_YW6wRVuPI2-AgGL-0hbAdVbI",
      // Add additional API keys here if needed
    ].filter(Boolean); // Remove any undefined/null values
    
    if (apiKeys.length === 0) {
      console.error('No Google Maps API key available');
      setApiError('No API key available');
      return;
    }
    
    // Use the first available API key
    const apiKey = apiKeys[0];
    
    // Define a callback function for when the API loads
    window.initGoogleMapsAutocomplete = () => {
      console.log('Google Maps API loaded successfully via callback');
      setGoogleApiLoaded(true);
    };
    
    // Define an error handler for the API
    window.gm_authFailure = () => {
      console.error('Google Maps API authentication failure');
      setApiError('API authentication failure');
    };
    
    // Check if API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps API already loaded');
      setGoogleApiLoaded(true);
      return;
    }
    
    // Load the API with a callback
    console.log('Loading Google Maps API with key:', apiKey);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAutocomplete`;
    script.async = true;
    script.defer = true;
    script.onerror = (e) => {
      console.error('Failed to load Google Maps API script:', e);
      setApiError('Failed to load API script');
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
      
      // Initialize autocomplete on the Google input
      autocompleteRef.current = new window.google.maps.places.Autocomplete(googleInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name']
      });
      
      // Add listener for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        try {
          const place = autocompleteRef.current.getPlace();
          
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
        }
      });
      
      // Trigger a small delay and then try to activate the dropdown
      setTimeout(() => {
        if (googleInputRef.current && googleInputRef.current.value) {
          try {
            const event = new Event('focus', { bubbles: true });
            googleInputRef.current.dispatchEvent(event);
            
            // Return focus to main input after a brief pause
            setTimeout(() => {
              if (visibleInputRef.current) {
                visibleInputRef.current.focus();
              }
            }, 100);
          } catch (error) {
            console.error('Error activating autocomplete:', error);
          }
        }
      }, 500);
      
      console.log('Autocomplete initialized successfully on Google input');
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      setApiError(`Initialization error: ${error.message}`);
    }
  }, [googleApiLoaded, updateFormData]);
  
  // Styles for the Google input
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
              
              {/* Always show Google attribution */}
              <div style={googleAttributionStyle}>
                Powered by <img 
                  src="https://developers.google.com/static/maps/documentation/images/google_on_white.png" 
                  alt="Google" 
                  height="18"
                  style={{verticalAlign: 'middle'}}
                />
              </div>
              
              {/* Display any API errors for debugging */}
              {apiError && (
                <div style={{color: 'red', fontSize: '12px'}}>
                  API Error: {apiError}
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
}

export default AddressForm;