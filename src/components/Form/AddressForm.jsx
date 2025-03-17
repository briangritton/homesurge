import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Create a ref for the address input
  const addressInputRef = useRef(null);
  // Separate state for handling the input value to avoid conflict with Google
  const [inputValue, setInputValue] = useState(formData.street || '');
  // Track autocomplete initialization
  const [autocompleteInitialized, setAutocompleteInitialized] = useState(false);
  
  // Initialize input value from form data when component mounts
  useEffect(() => {
    if (formData.street) {
      setInputValue(formData.street);
    }
  }, [formData.street]);
  
  // Update formData when user types in the input
  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Update form data
    updateFormData({
      street: value,
      addressSelectionType: 'Manual'
    });
    
    // Clear error message when user types
    if (errorMessage) {
      setErrorMessage('');
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate address
    if (!validateAddress(inputValue)) {
      setErrorMessage('Please enter a valid address to check your cash offer');
      return;
    }
    
    // Clear error message
    setErrorMessage('');
    
    // Set loading state
    setIsLoading(true);
    
    // Ensure form data has the current input value
    updateFormData({
      street: inputValue,
      addressSelectionType: formData.addressSelectionType || 'Manual',
      city: formData.city || '',
      zip: formData.zip || '',
      state: formData.state || 'GA'
    });
    
    // Proceed to next step
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 300);
  };
  
  // Initialize Google Maps autocomplete - separate from normal form functionality
  useEffect(() => {
    // Skip if already initialized or no input ref yet
    if (autocompleteInitialized || !addressInputRef.current) return;
    
    // Function to initialize Google Maps autocomplete
    const initAutocomplete = () => {
      // Verify Google Maps API is available
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.log('Google Maps not available - address form will work normally');
        return false;
      }
      
      try {
        console.log('Initializing Google Maps autocomplete');
        
        // Create autocomplete instance
        const autocomplete = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'us' }
          }
        );
        
        // Add place_changed listener
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          // Validate place has the necessary data
          if (!place || !place.formatted_address) {
            console.log('Invalid place selected');
            return;
          }
          
          console.log('Place selected:', place.formatted_address);
          
          // Update local state to keep input in sync
          setInputValue(place.formatted_address);
          
          // Extract address components
          const addressComponents = {
            city: '',
            state: 'GA',
            zip: ''
          };
          
          // Process address components if available
          if (place.address_components && place.address_components.length > 0) {
            for (const component of place.address_components) {
              const types = component.types;
              
              if (types.includes('locality')) {
                addressComponents.city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                addressComponents.state = component.short_name;
              } else if (types.includes('postal_code')) {
                addressComponents.zip = component.long_name;
              }
            }
          }
          
          // Create location data if available
          const location = place.geometry ? {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          } : null;
          
          // Update form data with place details
          updateFormData({
            street: place.formatted_address,
            city: addressComponents.city,
            state: addressComponents.state,
            zip: addressComponents.zip,
            addressSelectionType: 'Google',
            location: location
          });
        });
        
        return true;
      } catch (error) {
        console.error('Error initializing Google Maps autocomplete:', error);
        return false;
      }
    };
    
    // Try to initialize immediately if Google Maps is loaded
    const success = initAutocomplete();
    setAutocompleteInitialized(success);
    
    // If Maps isn't loaded yet, set up a listener for when it loads
    if (!success && !window.googleMapsInitListener) {
      window.googleMapsInitListener = true;
      
      // Add a script to load Google Maps if it's not already in the page
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyArZ4pBJT_YW6wRVuPI2-AgGL-0hbAdVbI&libraries=places`;
        script.async = true;
        script.defer = true;
        
        // Try initializing after script loads
        script.onload = () => {
          const success = initAutocomplete();
          setAutocompleteInitialized(success);
        };
        
        // Add to document
        document.body.appendChild(script);
      }
      
      // If script is already in page, wait for it to initialize
      else {
        const checkGoogleInterval = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            clearInterval(checkGoogleInterval);
            const success = initAutocomplete();
            setAutocompleteInitialized(success);
          }
        }, 500);
        
        // Clean up interval if component unmounts
        return () => clearInterval(checkGoogleInterval);
      }
    }
  }, [addressInputRef, autocompleteInitialized, updateFormData]);
  
  return (
    <div className="hero-section">
      <div className="hero-middle-container">
        <div className="hero-content fade-in">
          <div className="hero-headline">{formData.dynamicHeadline || "Sell Your House For Cash Fast!"}</div>
          <div className="hero-subheadline">{formData.dynamicSubHeadline || "Get a Great Cash Offer For Your House and Close Fast!"}</div>
          
          <form className="form-container" onSubmit={handleSubmit}>
            <input
              ref={addressInputRef}
              type="text"
              placeholder="Street address..."
              className={errorMessage ? 'address-input-invalid' : 'address-input'}
              value={inputValue}
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