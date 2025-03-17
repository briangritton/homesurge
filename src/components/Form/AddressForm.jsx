import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputElement, setInputElement] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  
  // -------- CORE FORM FUNCTIONALITY (Works without Google Maps) --------
  
  // Handle form input changes - This works regardless of Google Maps
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
  
  // Handle form submission - This works regardless of Google Maps
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
  
  // -------- GOOGLE MAPS ENHANCEMENT (Optional) --------
  
  // Store reference to input element after it's rendered
  const inputRef = (element) => {
    if (element && element !== inputElement) {
      setInputElement(element);
    }
  };
  
  // Setup Google Maps autocomplete after the input is available
  useEffect(() => {
    // Skip if input isn't available or autocomplete already initialized
    if (!inputElement || autocomplete) return;
    
    // Function to initialize autocomplete
    const initializeAutocomplete = () => {
      try {
        // Make sure Google Maps is available
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.log('Google Maps not available for autocomplete');
          return;
        }
        
        console.log('Initializing Google Maps autocomplete');
        
        // Create autocomplete instance
        const autocompleteInstance = new window.google.maps.places.Autocomplete(inputElement, {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        });
        
        // Handle place selection
        autocompleteInstance.addListener('place_changed', () => {
          try {
            const place = autocompleteInstance.getPlace();
            
            // Make sure we have a valid place with geometry
            if (!place || !place.geometry) {
              console.log('Invalid place selected');
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
            
            // Update form with selected place data
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
            
            // Clear any error message
            setErrorMessage('');
            
            console.log('Place selected successfully:', place.formatted_address);
          } catch (error) {
            // Log error but don't disrupt the form
            console.error('Error handling place selection:', error);
          }
        });
        
        // Store autocomplete instance in state
        setAutocomplete(autocompleteInstance);
        
      } catch (error) {
        // Log error but don't disrupt the form
        console.error('Error initializing Google Maps autocomplete:', error);
      }
    };
    
    // Try to initialize immediately if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeAutocomplete();
    } else {
      // Wait for Google Maps to load
      const googleMapsCheckInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(googleMapsCheckInterval);
          initializeAutocomplete();
        }
      }, 1000);
      
      // Clean up interval
      return () => clearInterval(googleMapsCheckInterval);
    }
    
    // Clean up when component unmounts
    return () => {
      if (autocomplete && window.google && window.google.maps) {
        // Clean up listeners if possible
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [inputElement, autocomplete, updateFormData]);
  
  // -------- COMPONENT RENDER --------
  
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