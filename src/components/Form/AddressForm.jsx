import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addressInputRef = useRef(null);

  // 1) Only load the Google script if it’s not already on the page
  useEffect(() => {
    // Check if google or places is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps script is already present.');
      return;
    }

    // If not, check if there's a script tag
    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log('Injecting Google Maps script...');
      const script = document.createElement('script');
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places';
      script.async = true;
      script.defer = true;

      // Just for debugging if needed
      script.onload = () => {
        console.log('Google Maps script loaded.');
        // IMPORTANT: We are NOT attaching autocomplete here yet
      };

      document.body.appendChild(script);
    } else {
      console.log('Google Maps script tag found; waiting for it to load...');
    }
  }, []);

  const handleManualChange = (e) => {
    if (errorMessage) setErrorMessage('');

    // Keep the formData updated as user types
    updateFormData({
      ...formData,
      street: e.target.value,
      addressSelectionType: 'Manual',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const typedAddress = addressInputRef.current.value || '';

    if (!validateAddress(typedAddress)) {
      setErrorMessage('Please enter a valid address to check your cash offer');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    updateFormData({
      ...formData,
      street: typedAddress,
      addressSelectionType: 'Manual',
    });

    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 1000);
  };

  return (
    <div className="hero-section">
      <div className="hero-middle-container">
        <div className="hero-content fade-in">
          <div className="hero-headline">
            {formData.dynamicHeadline || 'Sell Your House For Cash Fast!'}
          </div>
          <div className="hero-subheadline">
            {formData.dynamicSubHeadline ||
              'Get a Great Cash Offer For Your House and Close Fast!'}
          </div>

          <form className="form-container" onSubmit={handleSubmit}>
            <input
              ref={addressInputRef}
              type="text"
              autoComplete="off"
              defaultValue={formData.street}
              placeholder="Street address..."
              className={
                errorMessage ? 'address-input-invalid' : 'address-input'
              }
              onChange={handleManualChange}
            />

            <button className="submit-button" type="submit" disabled={isLoading}>
              {isLoading ? 'CHECKING...' : 'CHECK OFFER'}
            </button>
          </form>

          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
}

export default AddressForm;


