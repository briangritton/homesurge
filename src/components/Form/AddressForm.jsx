import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reference to visible input that user interacts with
  const visibleInputRef = useRef(null);
  
  // Reference to hidden input that Google Maps attaches to
  const hiddenInputRef = useRef(null);
  
  // Handle form input changes
  const handleChange = (e) => {
    let value = e.target.value;
    updateFormData({ 
      street: value,
      addressSelectionType: 'Manual'
    });
    
    // Update hidden input to match visible input
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = value;
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
  
  // Load Google Maps and initialize autocomplete on the hidden input
  useEffect(() => {
    // Only run once and only if we have the hidden input
    if (!hiddenInputRef.current) return;
    
    // Try to load Google Maps API
    try {
      // Create script element if not already present
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyArZ4pBJT_YW6wRVuPI2-AgGL-0hbAdVbI&libraries=places';
        script.async = true;
        script.defer = true;
        
        // Initialize autocomplete when script loads
        script.onload = initializeAutocomplete;
        
        // Add script to page
        document.body.appendChild(script);
      } else if (window.google && window.google.maps && window.google.maps.places) {
        // Script already loaded, initialize autocomplete
        initializeAutocomplete();
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
    
    // Function to initialize autocomplete on the hidden input
    function initializeAutocomplete() {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.log('Google Maps API not available');
        return;
      }
      
      try {
        // Create autocomplete instance on the hidden input
        const autocomplete = new window.google.maps.places.Autocomplete(hiddenInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        });
        
        // Add event listener for place selection
        autocomplete.addListener('place_changed', () => {
          try {
            const place = autocomplete.getPlace();
            
            if (!place || !place.formatted_address) return;
            
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
            
            // Update form data with selected place
            updateFormData({
              street: place.formatted_address,
              city: addressComponents.city,
              state: addressComponents.state,
              zip: addressComponents.zip,
              addressSelectionType: 'Google'
            });
            
            // Update visible input to match the selected place
            if (visibleInputRef.current) {
              visibleInputRef.current.value = place.formatted_address;
            }
          } catch (error) {
            console.error('Error handling place selection:', error);
          }
        });
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    }
  }, [updateFormData]);
  
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
            
            {/* Hidden input for Google Maps autocomplete */}
            <div style={{ height: 0, overflow: 'hidden', position: 'absolute', visibility: 'hidden' }}>
              <input 
                ref={hiddenInputRef}
                type="text"
                defaultValue={formData.street || ''}
              />
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