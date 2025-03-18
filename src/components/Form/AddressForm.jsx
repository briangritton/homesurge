import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';
import { trackAddressSelected } from '../../services/analytics';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [apiStatus, setApiStatus] = useState('initializing'); // 'initializing', 'failed', 'success'
  
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
      
      // Try to trigger the autocomplete
      try {
        const event = new Event('input', { bubbles: true });
        googleInputRef.current.dispatchEvent(event);
        
        // Don't steal focus from the main input
      } catch (error) {
        console.error('Error triggering autocomplete:', error);
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
  
  // Load Google Maps API with timeout and error handling
  useEffect(() => {
    // Only run once
    if (googleApiLoaded) return;
    
    // Get API key from environment variable
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyArZ4pBJT_YW6wRVuPI2-AgGL-0hbAdVbI";
    
    let apiLoadTimeout;
    let scriptAdded = false;
    
    // Set a timeout for API loading
    apiLoadTimeout = setTimeout(() => {
      if (!googleApiLoaded) {
        console.warn('Google Maps API loading timed out after 5 seconds');
        setApiStatus('failed');
      }
    }, 5000);
    
    // Define a callback function for when the API loads
    window.initGoogleMapsAutocomplete = () => {
      console.log('Google Maps API loaded successfully');
      setGoogleApiLoaded(true);
      
      // Test if the API is actually working by trying to create a service
      if (window.google && window.google.maps && window.google.maps.places) {
        try {
          const service = new window.google.maps.places.AutocompleteService();
          
          // Test a simple prediction request
          service.getPlacePredictions({
            input: '123 Main Street',
            componentRestrictions: { country: 'us' },
            types: ['address']
          }, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
              // API is working correctly
              console.log('Google Places API test successful');
              setApiStatus('success');
            } else {
              // API returned a response but no results or an error
              console.warn('Google Places API test failed:', status);
              setApiStatus('failed');
            }
            
            // Clear the timeout
            clearTimeout(apiLoadTimeout);
          });
        } catch (error) {
          // Error in creating service or making request
          console.error('Error testing Google Places API:', error);
          setApiStatus('failed');
          clearTimeout(apiLoadTimeout);
        }
      } else {
        // Places API not available
        console.warn('Google Places API not available');
        setApiStatus('failed');
        clearTimeout(apiLoadTimeout);
      }
    };
    
    // Define an error handler for the API
    window.gm_authFailure = () => {
      console.error('Google Maps API authentication failure');
      setApiStatus('failed');
      clearTimeout(apiLoadTimeout);
    };
    
    // Check if API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      window.initGoogleMapsAutocomplete();
      return;
    }
    
    // Load the API with a callback
    console.log('Loading Google Maps API with key:', apiKey);
    
    try {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAutocomplete`;
      script.async = true;
      script.defer = true;
      script.onerror = (e) => {
        console.error('Failed to load Google Maps API script:', e);
        setApiStatus('failed');
        clearTimeout(apiLoadTimeout);
      };
      
      document.body.appendChild(script);
      scriptAdded = true;
    } catch (error) {
      console.error('Error adding Google Maps script to document:', error);
      setApiStatus('failed');
      clearTimeout(apiLoadTimeout);
    }
    
    return () => {
      // Cleanup function to remove the global callbacks and timeout
      clearTimeout(apiLoadTimeout);
      if (scriptAdded) {
        delete window.initGoogleMapsAutocomplete;
        delete window.gm_authFailure;
      }
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
            visibleInputRef.current.focus();
          }
          
          // Track the address selection in analytics
          trackAddressSelected('Google');
        } catch (error) {
          console.error('Error handling place selection:', error);
        }
      });
      
      console.log('Autocomplete initialized successfully on Google input');
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      setApiStatus('failed');
    }
  }, [googleApiLoaded, updateFormData]);
  
  // Styles for the Google input - ALWAYS VISIBLE for debugging
  const googleInputContainerStyle = {
    position: 'absolute',
    top: '80px', // Always 80px below for debugging
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
  
  // Status indicator style
  const statusStyle = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: apiStatus === 'success' ? '#d4edda' : 
                     apiStatus === 'failed' ? '#f8d7da' : '#cce5ff',
    color: apiStatus === 'success' ? '#155724' : 
           apiStatus === 'failed' ? '#721c24' : '#004085',
    opacity: 0.8,
    zIndex: 9999
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
            
            {/* Google Maps input for autocomplete - ALWAYS shown for debugging */}
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
              
              {/* Display API status */}
              <div style={{fontSize: '12px', marginTop: '5px'}}>
                Status: {apiStatus}
              </div>
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
          
          {/* API status indicator */}
          <div style={statusStyle}>
            {apiStatus === 'initializing' && 'Initializing Google Places...'}
            {apiStatus === 'success' && 'Google Places ready'}
            {apiStatus === 'failed' && 'Using manual address input'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressForm;