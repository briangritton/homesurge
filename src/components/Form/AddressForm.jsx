import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';
import { trackAddressSelected } from '../../services/analytics';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autocompleteInitialized, setAutocompleteInitialized] = useState(false);
  
  // Create a ref for the input element
  const inputRef = useRef(null);
  
  // Safely initialize Google Maps autocomplete
  const initializeAutocomplete = () => {
    // Guard clause - make sure input and Google Maps exists
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      return false;
    }
    
    try {
      // Create the autocomplete instance
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });
      
      // Add place_changed listener
      autocomplete.addListener('place_changed', () => {
        try {
          const place = autocomplete.getPlace();
          
          // Make sure we have a valid place with geometry
          if (!place.geometry) {
            console.log('No geometry for this place');
            return;
          }
          
          // Process address components
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
          
          // Update form data
          updateFormData({
            street: place.formatted_address,
            city: addressComponents.city,
            state: addressComponents.state,
            zip: addressComponents.zip,
            addressSelectionType: 'Google',
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          });
          
          // Track the selection
          trackAddressSelected('Google');
          
          // Clear any error message
          setErrorMessage('');
        } catch (error) {
          console.error('Error handling place selection:', error);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
      return false;
    }
  };
  
  // Initialize once the component is mounted and input ref is available
  useEffect(() => {
    // Don't try to initialize if already done
    if (autocompleteInitialized) return;
    
    // Check if Google Maps API is loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      // API already loaded, initialize immediately
      const success = initializeAutocomplete();
      setAutocompleteInitialized(success);
    } else {
      // Setup a listener for when the API might load
      const checkGoogleMapsInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkGoogleMapsInterval);
          const success = initializeAutocomplete();
          setAutocompleteInitialized(success);
        }
      }, 500);
      
      // Clean up interval
      return () => clearInterval(checkGoogleMapsInterval);
    }
  }, [autocompleteInitialized]);
  
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
    
    // Ensure we have the basic address data
    updateFormData({
      addressSelectionType: formData.addressSelectionType || 'Manual',
      city: formData.city || '',
      zip: formData.zip || '',
      state: formData.state || 'GA'
    });
    
    // Move to next step with a slight delay to show loading state
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 300);
  };
  
  return (
    <div className="hero-section">
      <div className="hero-middle-container">
        <div className="hero-content fade-in">
          <div className="hero-headline">{formData.dynamicHeadline || "Sell Your House For Cash Fast!"}</div>
          <div className="hero-subheadline">{formData.dynamicSubHeadline || "Get a Great Cash Offer For Your House and Close Fast!"}</div>
          
          <form className="form-container" onSubmit={handleSubmit}>
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