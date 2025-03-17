import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addressInputRef = useRef(null);

  // 1) UseEffect to load script AND init minimal Autocomplete
  useEffect(() => {
    // If already loaded, attempt to init immediately
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps script is present—initializing autocomplete...');
      initAutocomplete();
      return;
    }

    // Otherwise, if the script tag isn't present, inject it
    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log('Injecting Google Maps script...');
      const script = document.createElement('script');
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places';
      script.async = true;
      script.defer = true;

      // Once the script loads, try init
      script.onload = () => {
        console.log('Google Maps script loaded—initializing autocomplete...');
        initAutocomplete();
      };

      document.body.appendChild(script);
    } else {
      // A script tag exists—poll until it's ready
      console.log('Google Maps script tag found; waiting for it to load...');
      const intervalId = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(intervalId);
          console.log('Google Maps ready—initializing autocomplete...');
          initAutocomplete();
        }
      }, 500);
      return () => clearInterval(intervalId);
    }
  }, []);

  // 2) Minimal init function: just create Autocomplete & log place_changed
  const initAutocomplete = () => {
    if (!addressInputRef.current) {
      console.warn('No input ref found—cannot init autocomplete.');
      return;
    }
    // Create the Autocomplete instance
    const autocomplete = new window.google.maps.places.Autocomplete(
      addressInputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      }
    );

    // Listen for place changes
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      console.log('place_changed event fired. Selected place:', place);
      // Not doing anything else yet—just logging
    });
  };

  const handleManualChange = (e) => {
    if (errorMessage) setErrorMessage('');

    // Keep the formData updated as user types, still "uncontrolled" input
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

            <button
              className="submit-button"
              type="submit"
              disabled={isLoading}
            >
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



