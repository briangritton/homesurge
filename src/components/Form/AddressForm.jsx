import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { initializeGoogleMapsAutocomplete, lookupPropertyInfo } from '../../services/maps';
import { validateAddress } from '../../utils/validation.js';
import { trackAddressSelected, trackFormError } from '../../services/analytics';

function AddressForm() {
  const { formData, updateFormData, nextStep, setDynamicContent } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
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
      addressSelectionType: 'Google'
    });
    
    // Look up property information using the selected address
    const propertyInfo = await lookupPropertyInfo(formattedAddress);
    if (propertyInfo) {
      updateFormData({
        ...propertyInfo,
        addressSelectionType: 'Google'
      });
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
    
    // If address is valid and we don't have property info yet, look it up
    if (formData.addressSelectionType === 'Manual' && !formData.propertyRecord) {
      try {
        const propertyInfo = await lookupPropertyInfo(formData.street);
        if (propertyInfo) {
          updateFormData(propertyInfo);
        }
      } catch (error) {
        console.error('Error looking up property:', error);
      }
    }
    
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
            />
            
            <button className="submit-button" type="submit">
              CHECK OFFER
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