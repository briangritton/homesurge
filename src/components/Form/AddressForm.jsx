import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';
import { trackAddressSelected } from '../../services/analytics';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  
  // Reference to the main input
  const inputRef = useRef(null);
  
  // Reference to autocomplete instance
  const autocompleteRef = useRef(null);
  
  // Reference to session token
  const sessionTokenRef = useRef(null);
  
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
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
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
    };
    
    // Define an error handler for the API
    window.gm_authFailure = () => {
      console.error('Google Maps API authentication failure');
    };
    
    // Check if API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps API already loaded');
      setGoogleApiLoaded(true);
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
      autocompleteRef.current.addListener('place_changed', () => {
        try {
          const place = autocompleteRef.current.getPlace();
          
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
          
          // After a place is selected, we're done with this session token
          // Create a new one for the next autocomplete session
          sessionTokenRef.current = generateSessionToken();
          
          // Track the address selection in analytics
          trackAddressSelected('Google');
          
          // Automatically submit the form after selecting an address
          setTimeout(() => handleSubmit(), 100);
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
        </div>
      </div>
    </div>
  );
}

export default AddressForm;