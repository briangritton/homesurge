import React, { useRef, useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateName, validatePhone } from '../../utils/validation.js';
import { trackFormSubmission, trackFormError, trackPhoneNumberLead, trackFormStepComplete } from '../../services/analytics';
import { GoogleMap } from '@react-google-maps/api';
import mapIcon from '../../assets/images/mapicon.png';

function PersonalInfoForm() {
  const { formData, updateFormData, nextStep, submitLead } = useFormContext();
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  
  // Map styling to simplify the map view
  const mapStyles = [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'off' }]
    }
  ];
  
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
      trackFormError('Invalid name', 'name');
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
      trackFormError('Invalid phone', 'phone');
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
        trackFormSubmission(formData);
        trackPhoneNumberLead();
        trackFormStepComplete(2, 'Personal Info Form');
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
            Is this your house?
          </div>
          
          <div className="hero-1-api-address">
            {formData.street && formData.street.split(', ').slice(0, -1).join(', ')}
          </div>
          
          <div className="hero-middle-map-container" style={{ position: 'relative', width: '100%', height: '200px', margin: '10px 0' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '0.5px solid black', maxWidth: '425px' }}>
              {window.google && window.google.maps && (
                <GoogleMap
                  center={formData.location 
                    ? { lat: formData.location.lat, lng: formData.location.lng }
                    : { lat: 33.749, lng: -84.388 }} // Default to Atlanta if no coordinates
                  zoom={17}
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  options={{ 
                    styles: mapStyles,
                    zoomControl: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false
                  }}
                />
              )}
            </div>
            <img src={mapIcon} alt="Map Marker" style={{ position: 'absolute', top: '50%', left: '50%', width: '20px', transform: 'translate(-50%, -50%)', marginTop: '-15px', zIndex: 100 }} />
          </div>
          
          <div className="hero-middle-map-sub-info" style={{ opacity: 0, animation: 'fadeInAnimation 1s forwards' }}>
            {formData.formattedApiEstimatedValue && formData.formattedApiEstimatedValue !== "$0" && (
              <>
                <div className="hero-middle-estimated-value">
                  {formData.formattedApiEstimatedValue}
                </div>
                <div className="hero-middle-estimated-value-text">
                  *Estimated market value
                </div>
              </>
            )}
            
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
                value={formData.name}
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
                value={formData.phone}
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