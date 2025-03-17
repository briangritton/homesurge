import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reference to input
  const inputRef = useRef(null);
  
  // State to track if autocomplete is initialized
  const [autocompleteInitialized, setAutocompleteInitialized] = useState(false);
  
  // Handle form input changes
  const handleChange = (e) => {
    let value = e.target.value;
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
    
    // Set some minimal data
    updateFormData({
      addressSelectionType: 'Manual',
      city: '',
      zip: '',
      state: 'GA'
    });
    
    // Proceed to next step
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 300);
  };
  
  // Initialize Google Maps autocomplete ONLY AFTER component is fully mounted
  // and we check that it's safe to do so
  useEffect(() => {
    // Skip if already initialized
    if (autocompleteInitialized) {
      return;
    }
    
    // Skip if no input ref
    if (!inputRef.current) {
      return;
    }
    
    // Wait a bit to ensure React's control of the input is fully established
    const timeoutId = setTimeout(() => {
      // Function to safely initialize autocomplete
      const initializeAutocompleteDelayed = () => {
        // Safety check - make sure Google Maps API is available
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.log('Google Maps API not available - skipping autocomplete');
          return false;
        }
        
        try {
          // Final check to make sure the input is still in DOM
          if (!inputRef.current || !document.body.contains(inputRef.current)) {
            console.log('Input element no longer in DOM');
            return false;
          }
          
          console.log('Initializing Google Maps autocomplete');
          
          // Create autocomplete instance with careful error handling
          const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['address_components', 'formatted_address', 'geometry'] // limit fields
          });
          
          // Listen for place selection
          const listener = autocomplete.addListener('place_changed', () => {
            try {
              const place = autocomplete.getPlace();
              
              // Check if we have a valid place with address
              if (!place || !place.formatted_address) {
                console.log('Invalid place selected');
                return;
              }
              
              console.log('Selected place:', place.formatted_address);
              
              // Extract address components
              const addressComponents = {
                city: '',
                state: 'GA',
                zip: ''
              };
              
              place.address_components?.forEach(component => {
                const types = component.types;
                
                if (types.includes('locality')) {
                  addressComponents.city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                  addressComponents.state = component.short_name;
                } else if (types.includes('postal_code')) {
                  addressComponents.zip = component.long_name;
                }
              });
              
              // Get location if available
              const location = place.geometry?.location ? {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              } : null;
              
              // Update form data with the selected place
              updateFormData({
                street: place.formatted_address,
                city: addressComponents.city,
                state: addressComponents.state,
                zip: addressComponents.zip,
                addressSelectionType: 'Google',
                location: location
              });
            } catch (error) {
              console.error('Error handling place selection:', error);
            }
          });
          
          // Store cleanup info for unmount
          window.googleMapsAutocompleteListener = listener;
          window.googleMapsAutocomplete = autocomplete;
          
          return true;
        } catch (error) {
          console.error('Error initializing Google Maps autocomplete:', error);
          return false;
        }
      };
      
      // Check if Google Maps is loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        const success = initializeAutocompleteDelayed();
        setAutocompleteInitialized(success);
      } else {
        // Attempt to load Google Maps API
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
          console.log('Loading Google Maps API script');
          
          try {
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyArZ4pBJT_YW6wRVuPI2-AgGL-0hbAdVbI&libraries=places';
            script.async = true;
            script.defer = true;
            
            // When script loads, initialize autocomplete
            script.onload = () => {
              console.log('Google Maps API loaded successfully');
              const success = initializeAutocompleteDelayed();
              setAutocompleteInitialized(success);
            };
            
            // Handle loading errors gracefully
            script.onerror = () => {
              console.error('Failed to load Google Maps API');
              setAutocompleteInitialized(false);
            };
            
            // Add script to page
            document.body.appendChild(script);
          } catch (error) {
            console.error('Error adding Google Maps script:', error);
          }
        }
      }
    }, 500); // 500ms delay
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      
      // Clean up Google Maps listener if it exists
      if (window.google && window.google.maps && window.googleMapsAutocompleteListener) {
        try {
          window.google.maps.event.removeListener(window.googleMapsAutocompleteListener);
          delete window.googleMapsAutocompleteListener;
          delete window.googleMapsAutocomplete;
        } catch (error) {
          console.error('Error cleaning up Google Maps listener:', error);
        }
      }
    };
  }, [formData.street, autocompleteInitialized, updateFormData]);
  
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