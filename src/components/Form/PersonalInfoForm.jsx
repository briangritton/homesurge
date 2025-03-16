import React, { useRef, useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateName, validatePhone } from '../../utils/validation.js';

function PersonalInfoForm() {
  const { formData, updateFormData, nextStep, submitLead } = useFormContext();
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    updateFormData({ [name]: value });
    
    // Clear validation errors when user starts typing
    if (name === 'name' && nameError) {
      setNameError('');
    } else if (name === 'phone' && phoneError) {
      setPhoneError('');
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e, fromOverlay = false) => {
    e.preventDefault();
    
    let isValid = true;
    
    // Validate name
    if (!validateName(formData.name)) {
      setNameError('Please enter a valid name');
      if (nameRef.current) {
        nameRef.current.className = 'overlay-form-input error';
      }
      isValid = false;
    } else {
      setNameError('');
      if (nameRef.current) {
        nameRef.current.className = 'overlay-form-input';
      }
    }
    
    // Validate phone
    if (!validatePhone(formData.phone)) {
      setPhoneError('Valid phone required to receive your cash offer details via text message (No Spam Ever)');
      if (phoneRef.current) {
        phoneRef.current.className = 'overlay-form-input error';
      }
      isValid = false;
    } else {
      setPhoneError('');
      if (phoneRef.current) {
        phoneRef.current.className = 'overlay-form-input';
      }
    }
    
    if (!isValid) {
      return;
    }
    
    // If validation passes, submit the lead
    try {
      setIsSubmitting(true);
      console.log('Submitting lead with form data:', formData);
      const success = await submitLead();
      
      if (success) {
        console.log('Lead submitted successfully');
        nextStep();
      } else {
        console.error('Failed to submit lead');
        setPhoneError('There was a problem submitting your information. Please try again.');
      }
    } catch (error) {
      console.error('Error during lead submission:', error);
      setPhoneError('There was a problem submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle "yes, that's correct" button click
  const handleConfirm = () => {
    if (formData.name && formData.phone) {
      handleSubmit({ preventDefault: () => {} }, true);
    } else {
      setOverlayVisible(true);
    }
  };
  
  // Close the overlay
  const closeOverlay = () => {
    setOverlayVisible(false);
  };
  
  return (
    <div className="hero-section">
      <div className="hero-middle-container">
        <div className="hero-content fade-in max-width-500">
          <div className="hero-middle-map-headline">
            Confirm Your Address
          </div>
          
          <div className="hero-1-api-address">
            {formData.street}
          </div>
          
          <div className="simple-address-display" style={{ 
            margin: '20px auto', 
            padding: '20px', 
            border: '1px solid #ccc', 
            borderRadius: '5px',
            maxWidth: '425px',
            textAlign: 'center'
          }}>
            <strong>Please confirm your address is correct</strong>
          </div>
          
          <div className="hero-middle-map-sub-info" style={{ opacity: 1 }}>
            <div className="hero-middle-map-buttons">
              <button
                className="hero-middle-map-submit-button"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Yes, that\'s correct'}
              </button>
              
              <button
                className="hero-middle-map-edit-button"
                onClick={() => setOverlayVisible(true)}
                disabled={isSubmitting}
              >
                Edit info
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Overlay */}
      {overlayVisible && (
        <div className="overlay">
          <div className="overlay-form-container">
            <button onClick={closeOverlay} className="overlay-close-button">
              X
            </button>
            
            <div className="overlay-form-headline">
              Where should we send your cash offer?
            </div>
            
            <form className="overlay-form-fields" onSubmit={(e) => handleSubmit(e, true)}>
              <input
                ref={nameRef}
                autoComplete="name"
                type="text"
                name="name"
                placeholder="Full name"
                className="overlay-form-input"
                value={formData.name || ''}
                onChange={handleChange}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Full name'}
                disabled={isSubmitting}
              />
              {nameError && (
                <div className="phone-error-message">
                  {nameError}
                </div>
              )}
              
              <input
                ref={phoneRef}
                autoComplete="tel"
                type="text"
                name="phone"
                placeholder="Phone (receive quick offer text)"
                className="overlay-form-input"
                value={formData.phone || ''}
                onChange={handleChange}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Phone (receive quick offer text)'}
                disabled={isSubmitting}
              />
              
              {phoneError && (
                <div className="phone-error-message">
                  {phoneError}
                </div>
              )}
              
              <button 
                className="registration-button" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'PROCESSING...' : 'CHECK OFFER'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalInfoForm;