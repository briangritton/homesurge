import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';
import { initializeGoogleMapsAutocomplete, lookupPropertyInfo } from '../../services/maps.js';
import { trackAddressSelected } from '../../services/analytics';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);
  
  // Create a ref for the input element
  const inputRef = useRef(null);
  
  // Initialize Google Maps autocomplete when component mounts
  useEffect(() => {
    let cleanupFunc = () => {};
    
    // Only initialize if Google Maps is loaded
    if (window.google && window.google.maps && inputRef.current) {
      cleanupFunc = initializeGoogleMapsAutocomplete(inputRef, handlePlaceSelected);
    } else {
      // Add event listener for Google Maps script load
      const handleGoogleMapsLoaded = () => {
        if (window.google && window.google.maps && inputRef.current) {
          cleanupFunc = initializeGoogleMapsAutocomplete(inputRef, handlePlaceSelected);
        }
      };
      
      // Check if script is already loaded
      if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
        window.addEventListener('load', handleGoogleMapsLoaded);
      }
      
      return () => {
        window.removeEventListener('load', handleGoogleMapsLoaded);
      };
    }
    
    return cleanupFunc;
  }, []);
  
  // Handle place selection from Google Maps autocomplete
  const handlePlaceSelected = async (place) => {
    if (!place || !place.formattedAddress) {
      console.error('No valid place selected');
      return;
    }
    
    console.log('Selected place:', place);
    
    // Track address selection for analytics
    trackAddressSelected('Google');
    
    // Extract address components
    const { addressComponents, formattedAddress, location } = place;
    
    // Update form data with selected address
    updateFormData({
      street: formattedAddress,
      city: addressComponents.city || '',
      zip: addressComponents.zip || '',
      state: addressComponents.state || 'GA',
      addressSelectionType: 'Google',
      location: location
    });
    
    // Clear error message
    setErrorMessage('');
    
    // Try to get property information
    try {
      setIsLoadingProperty(true);
      const propertyInfo = await lookupPropertyInfo(formattedAddress);
      
      if (propertyInfo) {
        console.log('Property info retrieved:', propertyInfo);
        
        // Update form with property details
        updateFormData({
          apiOwnerName: propertyInfo.apiOwnerName || '',
          apiEstimatedValue: propertyInfo.apiEstimatedValue || 0,
          apiMaxHomeValue: propertyInfo.apiMaxValue || 0,
          formattedApiEstimatedValue: propertyInfo.formattedApiEstimatedValue || '$0',
          bedrooms: propertyInfo.bedrooms || '',
          bathrooms: propertyInfo.bathrooms || '',
          finishedSquareFootage: propertyInfo.finishedSquareFootage || 1000,
          city: propertyInfo.city || addressComponents.city || '',
          zip: propertyInfo.zip || addressComponents.zip || '',
          state: propertyInfo.state || addressComponents.state || 'GA'
        });
      }
    } catch (error) {
      console.error('Error retrieving property information:', error);
    } finally {
      setIsLoadingProperty(false);
    }
  };
  
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
  const handleSubmit = async (e) => {
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
    
    try {
      // If address was manually entered, try to get property information
      if (formData.addressSelectionType === 'Manual') {
        try {
          const propertyInfo = await lookupPropertyInfo(formData.street);
          
          if (propertyInfo) {
            console.log('Property info retrieved for manual address:', propertyInfo);
            
            // Update form with property details
            updateFormData({
              apiOwnerName: propertyInfo.apiOwnerName || '',
              apiEstimatedValue: propertyInfo.apiEstimatedValue || 0,
              apiMaxHomeValue: propertyInfo.apiMaxValue || 0,
              formattedApiEstimatedValue: propertyInfo.formattedApiEstimatedValue || '$0',
              bedrooms: propertyInfo.bedrooms || '',
              bathrooms: propertyInfo.bathrooms || '',
              finishedSquareFootage: propertyInfo.finishedSquareFootage || 1000,
              city: propertyInfo.city || '',
              zip: propertyInfo.zip || '',
              state: propertyInfo.state || 'GA'
            });
          }
        } catch (error) {
          console.error('Error retrieving property information for manual address:', error);
        }
      }
      
      // Proceed to next step
      nextStep();
    } catch (error) {
      console.error('Error during form submission:', error);
      setErrorMessage('There was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              disabled={isLoading || isLoadingProperty}
            />
            
            <button 
              className="submit-button" 
              type="submit"
              disabled={isLoading || isLoadingProperty}
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