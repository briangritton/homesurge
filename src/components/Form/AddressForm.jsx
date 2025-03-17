import React, { useState, useRef } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // We'll keep a ref to read the final value on submit
  const addressInputRef = useRef(null);

  // Handle keystrokes in an uncontrolled input
  const handleManualChange = (e) => {
    // If there's an error showing, clear it as soon as the user types
    if (errorMessage) setErrorMessage('');

    // For debugging, you could log the typed value
    console.log('User is typing:', e.target.value);

    // Keep the formData updated as user types (optional)
    updateFormData({
      ...formData,
      street: e.target.value,
      addressSelectionType: 'Manual'
    });
  };

  // Handle submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const typedAddress = addressInputRef.current.value || '';

    if (!validateAddress(typedAddress)) {
      setErrorMessage('Please enter a valid address to check your cash offer');
      return;
    }

    // Clear error and set loading
    setErrorMessage('');
    setIsLoading(true);

    // Ensure we’ve stored the final typed address
    updateFormData({
      ...formData,
      street: typedAddress,
      addressSelectionType: 'Manual',
    });

    // Simulate an async step, then proceed
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
              autoComplete="off"               // <--- Turn off browser autofill
              defaultValue={formData.street}    // <--- Uncontrolled input
              placeholder="Street address..."
              className={
                errorMessage ? 'address-input-invalid' : 'address-input'
              }
              onChange={handleManualChange}
              // Remove disabled to confirm no locking
              // disabled={isLoading} // Optionally re-add if needed
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

