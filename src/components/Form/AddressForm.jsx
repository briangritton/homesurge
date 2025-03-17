import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1) Use a ref for the DOM element. We do NOT store the live text in state.
  const addressInputRef = useRef(null);

  // 2) Initialize Google Autocomplete once
  useEffect(() => {
    let autocomplete;
    let scriptLoaded = false;

    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.log('Google Maps not available - user can still type manually.');
        return false;
      }

      try {
        console.log('Initializing Google Maps Autocomplete...');
        autocomplete = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'us' }
          }
        );

        // When user selects a place from dropdown
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place || !place.formatted_address) {
            console.log('Invalid place selected.');
            return;
          }
          console.log('Place selected:', place.formatted_address);

          // 3) Manually update the input field's DOM value
          addressInputRef.current.value = place.formatted_address;

          // Extract city, state, zip from place (if available)
          const addressComponents = {
            city: '',
            state: 'GA', // default
            zip: ''
          };
          if (place.address_components) {
            for (const comp of place.address_components) {
              const types = comp.types;
              if (types.includes('locality')) {
                addressComponents.city = comp.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                addressComponents.state = comp.short_name;
              } else if (types.includes('postal_code')) {
                addressComponents.zip = comp.long_name;
              }
            }
          }

          // If geometry is available, store lat/lng
          const location = place.geometry
            ? {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              }
            : null;

          // Update form data with the chosen address details
          updateFormData({
            street: place.formatted_address,
            city: addressComponents.city,
            state: addressComponents.state,
            zip: addressComponents.zip,
            addressSelectionType: 'Google',
            location
          });
        });

        return true;
      } catch (error) {
        console.error('Error initializing Google Maps autocomplete:', error);
        return false;
      }
    };

    // 4) Attempt to init immediately
    let initialized = initAutocomplete();

    // If Maps not loaded, dynamically load the script
    if (!initialized) {
      // Only append script once
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyArZ4pBJT_YW6wRVuPI2-AgGL-0hbAdVbI&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          scriptLoaded = true;
          initialized = initAutocomplete();
        };
        document.body.appendChild(script);
      } else {
        // Script already on the page; poll until available
        const intervalId = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            clearInterval(intervalId);
            initialized = initAutocomplete();
          }
        }, 500);
        return () => clearInterval(intervalId);
      }
    }
  }, [updateFormData]);

  // 5) Handle user keystrokes (so we can record typed addresses in the form data)
  const handleManualChange = (e) => {
    const typedValue = e.target.value;
    if (errorMessage) setErrorMessage('');

    // If the user is typing (rather than selecting from Google):
    updateFormData({
      ...formData,
      street: typedValue,
      addressSelectionType: 'Manual'
    });
  };

  // 6) Handle submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Grab the CURRENT value from the DOM input
    const typedAddress = addressInputRef.current.value || '';

    if (!validateAddress(typedAddress)) {
      setErrorMessage('Please enter a valid address to check your cash offer');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    // Ensure formData is up to date
    updateFormData({
      ...formData,
      street: typedAddress,
      addressSelectionType: formData.addressSelectionType || 'Manual'
    });

    // Simulate async step, then next step
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 500);
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
              // 7) UNCONTROLLED => defaultValue
              ref={addressInputRef}
              type="text"
              placeholder="Street address..."
              className={errorMessage ? 'address-input-invalid' : 'address-input'}
              defaultValue={formData.street || ''}
              onChange={handleManualChange}
              // Remove any disabling so user can always type
              // disabled={isLoading}  (optional)
            />

            <button
              className="submit-button"
              type="submit"
              disabled={isLoading} // can remove if you want the button always active
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
