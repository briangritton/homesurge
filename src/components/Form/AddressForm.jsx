import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { initializeGoogleMapsAutocomplete, lookupPropertyInfo } from '../../services/maps';
import { validateAddress } from '../../utils/validation.js';
import { trackAddressSelected, trackFormError, trackFormStepComplete } from '../../services/analytics';

function AddressForm() {
  const { formData, updateFormData, nextStep, setDynamicContent } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const streetRef = useRef(null);
  const [autocompleteValue, setAutocompleteValue] = useState('street-address');
  
  // Set dynamic content based on URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('keyword');
    if (keyword) {
      setDynamicContent(keyword);
    }
  }, [setDynamicContent]);
  
  // Initialize Google Maps autocomplete
  useEffect(() => {
    if (!streetRef.current || !window.google || !window.google.maps) {
      return;
    }
    
    const cleanup = initializeGoogleMapsAutocomplete(streetRef, handlePlaceSelected);
    
    return cleanup;
  }, [streetRef]);
  
  // Handle place selection from Google Maps autocomplete
  const handlePlaceSelected = async (placeData) => {
    const { formattedAddress, addressComponents, location } = placeData;
    
    updateFormData({
      street: formattedAddress,
      city: addressComponents.city || '',
      zip: addressComponents.zip || '',
      state: addressComponents.state || 'GA',
      addressSelectionType: 'Google',
      location: location
    });
    
    setIsLoading(true);
    
    // Look up property information using the selected address
    try {
      const propertyInfo = await lookupPropertyInfo(formattedAddress);
      if (propertyInfo) {
        updateFormData({
          ...propertyInfo,
          addressSelectionType: 'Google'
        });
      }
    } catch (error) {
      console.error('Error looking up property:', error);
    } finally {
      setIsLoading(false);
    }
    
    trackAddressSelected('Google');
    handleSubmit();
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    let value = e.target.value;
    
    updateFormData({
      street: value,
      addressSelectionType: 'Manual'
    });
    
    if (value.length > 0) {
      setAutocompleteValue('none');
    } else {
      setAutocompleteValue('street-address');
    }
    
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    // Validate address
    if (!validateAddress(formData.street)) {
      setErrorMessage('Please enter a valid address to check your cash offer');
      trackFormError('Invalid address', 'street');
      
      if (streetRef.current) {
        streetRef.current.className = 'address-input-invalid';
      }
      return;
    }
    
    // Show loading state while we look up property info
    setErrorMessage('');
    setIsLoading(true);
    if (streetRef.current) {
      streetRef.current.className = 'address-input';
    }
    
    // If address is valid and we don't have property info yet, look it up
    if (formData.addressSelectionType === 'Manual' && !formData.propertyRecord) {
      try {
        console.log('Looking up property info for:', formData.street);
        const propertyInfo = await lookupPropertyInfo(formData.street);
        
        if (propertyInfo) {
          console.log('Property info found:', propertyInfo);
          updateFormData({
            ...propertyInfo,
            addressSelectionType: 'Manual',
            userInputtedStreet: formData.street
          });
        } else {
          console.log('No property info found, continuing with manual address');
          // If no property info found, continue with just the address
          updateFormData({
            addressSelectionType: 'Manual',
            userInputtedStreet: formData.street
          });
        }
      } catch (error) {
        console.error('Error looking up property:', error);
        // Continue despite error - don't block the form submission
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
    
    // Track successful step completion
    trackFormStepComplete(1, 'Address Form');
    
    // Proceed to next step
    nextStep();
  };
  
  return (
    <div className="hero-section">
      <div className="hero-middle-container">
        <div className="hero-content fade-in">
          <div className="hero-headline">{formData.dynamicHeadline}</div>
          <div className="hero-subheadline">{formData.dynamicSubHeadline}</div>
          
          <form className="form-container" onSubmit={handleSubmit}>
            <input
              ref={streetRef}
              autoComplete={autocompleteValue}
              type="text"
              placeholder="Street address..."
              className={errorMessage ? 'address-input-invalid' : 'address-input'}
              value={formData.street}
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