import React, { useRef, useState } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateName, validatePhone } from '../../utils/validation';
import { trackFormSubmission, trackFormError, trackPhoneNumberLead } from '../../services/analytics';
import { GoogleMap } from '@react-google-maps/api';
import mapIcon from '../../assets/images/mapicon.png';

function PersonalInfoForm() {
  const { formData, updateFormData, nextStep, submitLead } = useFormContext();
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);
  
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
    }
    
    // Validate phone
    if (!validatePhone(formData.phone)) {
      setPhoneError('Valid phone required to receive your cash offer details via text message (No Spam Ever)');
      if (phoneRef.current) {
        phoneRef.current.className = 'overlay-form-input error';
      }
      isValid = false;
      trackFormError('Invalid phone', 'phone');
    }
    
    if (!isValid) {
      return;
    }
    
    // If validation passes, submit the lead
    const success = await submitLead();
    
    if (success) {
      trackFormSubmission(formData);
      trackPhoneNumberLead();
      nextStep();
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
              {formData.addressSelectionType === 'Google' && (
                <GoogleMap
                  center={{ lat: 33.749, lng: -84.388 }} // Default to Atlanta if no coordinates
                  zoom={17}
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  options={{ styles: mapStyles }}
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
              >
                Yes, that's correct
              </button>
              
              <button
                className="hero-middle-map-edit-button"
                onClick={() => setOverlayVisible(true)}
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
              />
              
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
              />
              
              {phoneError && (
                <div className="phone-error-message">
                  {phoneError}
                </div>
              )}
              
              <button className="registration-button" type="submit">
                CHECK OFFER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalInfoForm;