import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reference to input
  const inputRef = useRef(null);
  
  // UPDATED: Load Google Maps and initialize autocomplete
  useEffect(() => {
    // Function to initialize autocomplete
    function initializeAutocomplete() {
      if (!inputRef.current) {
        console.log('Input element not ready yet');
        return;
      }
      
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.log('Google Maps API not ready yet');
        return;
      }
      
      try {
        console.log('Initializing Google Maps autocomplete');
        
        // Create the autocomplete instance
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        });
        
        // Add place_changed listener
        autocomplete.addListener('place_changed', () => {
          console.log('Place selected');
          
          try {
            const place = autocomplete.getPlace();
            
            if (!place.formatted_address) {
              console.log('No address found in the selected place');
              return;
            }
            
            console.log('Selected address:', place.formatted_address);
            
            // Extract address components
            const addressComponents = {
              city: '',
              state: 'GA',
              zip: ''
            };
            
            if (place.address_components) {
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
            
            // Update form data with the selected place
            updateFormData({
              street: place.formatted_address,
              city: addressComponents.city,
              state: addressComponents.state,
              zip: addressComponents.zip,
              addressSelectionType: 'Google'
            });
          } catch (error) {
            console.error('Error handling place selection:', error);
          }
        });
        
        console.log('Autocomplete initialized successfully');
      } catch (error) {
        console.error('Error initializing Google Maps autocomplete:', error);
      }
    }
    
    // Check if Google Maps API is available
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps API is already loaded');
      initializeAutocomplete();
    } else {
      console.log('Google Maps API is not loaded, adding script');
      
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyArZ4pBJT_YW6wRVuPI2-AgGL-0hbAdVbI&libraries=places';
      script.async = true;
      script.defer = true;
      
      // Add callbacks for script loading
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        initializeAutocomplete();
      };
      script.onerror = () => console.error('Failed to load Google Maps API');
      
      // Append script to body
      document.body.appendChild(script);
    }
  }, [updateFormData]);
  
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