import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reference to input
  const inputRef = useRef(null);
  
  // ADDED: Load Google Maps API if not already loaded
  useEffect(() => {
    // Check if Google Maps API is available
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps API is already loaded');
    } else {
      console.log('Google Maps API is not loaded, adding script');
      
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyArZ4pBJT_YW6wRVuPI2-AgGL-0hbAdVbI&libraries=places';
      script.async = true;
      script.defer = true;
      
      // Add callbacks for script loading
      script.onload = () => console.log('Google Maps API loaded successfully');
      script.onerror = () => console.error('Failed to load Google Maps API');
      
      // Append script to body
      document.body.appendChild(script);
      
      // No autocomplete initialization yet
    }
  }, []);
  
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
