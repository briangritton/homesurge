import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addressInputRef = useRef(null);

  // 1) Dynamically load the script, but if key is invalid => skip binding
  useEffect(() => {
    // If google is already loaded, attempt init
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google already loaded—initializing autocomplete...');
      safeInitAutocomplete();
      return;
    }

    // If not, check if script is present
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!existingScript) {
      // Insert the script
      const script = document.createElement('script');
      // *** IMPORTANT: use your real key here! ***
      script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('Google Maps script loaded—attempting autocomplete init...');
        safeInitAutocomplete();
      };

      script.onerror = () => {
        console.warn('Google Maps script failed to load—autocomplete disabled.');
      };

      document.body.appendChild(script);
    } else {
      console.log('Google Maps script tag found—waiting for it to load...');
      // Poll until google is ready or we time out
      const intervalId = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(intervalId);
          console.log('Google is ready—initializing autocomplete...');
          safeInitAutocomplete();
        }
      }, 500);

      // Clean up if component unmounts
      return () => clearInterval(intervalId);
    }
  }, []);

  // 2) Only create Autocomplete if Google loaded *and* no error
  const safeInitAutocomplete = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn('Google Places not available—autocomplete disabled.');
      return;
    }
    if (!addressInputRef.current) {
      console.warn('No input ref found—cannot init autocomplete.');
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        }
      );
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        // If place is invalid, do nothing
        if (!place || !place.formatted_address) {
          console.log('Invalid place selected or no address found.');
          return;
        }
        console.log('Selected place:', place.formatted_address);

        // *** IMPORTANT ***  
        // We update the DOM input manually here so the user sees the full address
        addressInputRef.current.value = place.formatted_address;

        // Optionally parse out city, state, zip
        // For now, just update form data with the chosen address
        updateFormData({
          ...formData,
          street: place.formatted_address,
          addressSelectionType: 'Google'
        });
      });
      console.log('Autocomplete has been initialized successfully.');
    } catch (err) {
      // If the key is invalid or something else breaks
      console.error('Failed to init Autocomplete:', err);
    }
  };

  // 3) Standard input change (uncontrolled input)
  const handleManualChange = (e) => {
    if (errorMessage) setErrorMessage('');
    updateFormData({
      ...formData,
      street: e.target.value,
      addressSelectionType: 'Manual'
    });
  };

  // 4) Submit
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
      addressSelectionType: 'Manual'
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
              // no disabled to ensure you can always type
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




