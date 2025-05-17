import React, { useRef, useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateName, validatePhone, validateAddress } from '../../utils/validation.js';
import { trackPhoneNumberLead, trackFormStepComplete, trackFormError } from '../../services/analytics';
import { updateContactInfo } from '../../services/zoho.js';

function VariantPersonalInfoForm() {
  const { formData, updateFormData, nextStep, submitLead } = useFormContext();
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [editMode, setEditMode] = useState('address');
  const [editedAddress, setEditedAddress] = useState(formData.street || '');
  const [valueLoading, setValueLoading] = useState(!formData.apiEstimatedValue);

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  
  // Add variant-specific CSS
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Variant-specific styles with v1- prefix */
      .v1-hero-section {
        position: relative;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        min-height: 500px;
      }
      
      .v1-hero-middle-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 20px;
      }
      
      .v1-hero-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 500px;
      }
      
      .v1-fade-in {
        animation: fadeIn 0.5s ease-in-out;
      }
      
     .v1-confirmation-header {
font-size: 2rem;
font-weight: bold;
 
text-align: center;
color: #333;
}
      
  .v1-hero-1-api-address {
font-size: 1.1rem;
 
text-align: center;
width: 100%;
}
      
 .v1-hero-property-estimate {
font-size: 2.3rem;
font-weight: bold;
color: #2e7d32;
text-align: center;
margin-bottom: 20px;
}
      
      .v1-custom-map-container {
        height: 300px;
        width: 100%;
        max-width: 650px;
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid #ccc;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      
    .v1-simple-address-display {
 
text-align: center;
}
      
      .v1-hero-middle-map-sub-info {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .v1-hero-middle-map-buttons {
        display: flex;
        gap: 10px;
        margin-top: 15px;
      }
      
      .v1-hero-middle-map-submit-button {
        padding: 12px 25px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .v1-hero-middle-map-submit-button:hover {
        background-color: #45a049;
      }
      
      .v1-hero-middle-map-edit-button {
        padding: 12px 25px;
        background-color: #f5f5f5;
        color: #333;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .v1-hero-middle-map-edit-button:hover {
        background-color: #e0e0e0;
      }
      
      .v1-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      
      .v1-overlay-form-container {
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        position: relative;
      }
      
      .v1-overlay-close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
      }
      
      .v1-overlay-form-headline {
        font-size: 20px;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .v1-overlay-form-fields {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .v1-overlay-form-input {
        padding: 12px 15px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 16px;
      }
      
      .v1-overlay-form-input.error {
        border-color: #f44336;
      }
      
      .v1-phone-error-message {
        color: #f44336;
        font-size: 14px;
        margin-top: -10px;
      }
      
      .v1-registration-button {
        padding: 12px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .v1-registration-button:hover {
        background-color: #45a049;
      }
      
      .v1-registration-button:disabled {
        background-color: #a5d6a7;
        cursor: not-allowed;
      }
      
      .v1-nowrap-phrase {
        white-space: nowrap;
      }
      
      .v1-max-width-500 {
        max-width: 500px;
      }
      
      @keyframes v1LoadingDots {
        0% { content: "."; }
        33% { content: ".."; }
        66% { content: "..."; }
        100% { content: ""; }
      }
      
      .v1-loading-dots::after {
        content: "";
        animation: v1LoadingDots 1.5s infinite;
        display: inline-block;
        width: 20px;
        text-align: left;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);

    // Initialize edited address with current address
    setEditedAddress(formData.street || '');
    
    // If we have the apiEstimatedValue, stop the loading state
    if (formData.apiEstimatedValue) {
      setValueLoading(false);
    } else {
      // If no value yet, set a timeout to stop loading after 3 seconds
      const valueTimeout = setTimeout(() => {
        setValueLoading(false);
      }, 3000);
      
      return () => clearTimeout(valueTimeout);
    }
  }, [formData.street, formData.apiEstimatedValue]);
  
  // Initialize Google Map
  useEffect(() => {
    let mapLoadAttempted = false;
    
    try {
      // Only initialize if Google Maps is loaded and we have location data
      if (window.google && window.google.maps && mapContainerRef.current && !mapLoaded) {
        mapLoadAttempted = true;
        initializeMap();
      } else {
        // Add event listener for Google Maps script load
        const handleGoogleMapsLoaded = () => {
          if (window.google && window.google.maps && mapContainerRef.current && !mapLoadAttempted) {
            mapLoadAttempted = true;
            initializeMap();
          }
        };
        
        if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
          window.addEventListener('load', handleGoogleMapsLoaded);
        }
        
        // Set a timeout to hide the map container if it doesn't load within 3 seconds
        const mapTimeout = setTimeout(() => {
          if (!mapLoaded && mapContainerRef.current) {
            console.warn('Google Maps failed to load within timeout, hiding map container');
            mapContainerRef.current.style.display = 'none';
          }
        }, 3000);
        
        return () => {
          window.removeEventListener('load', handleGoogleMapsLoaded);
          clearTimeout(mapTimeout);
        };
      }
    } catch (error) {
      console.error('Error setting up map:', error);
      if (mapContainerRef.current) {
        mapContainerRef.current.style.display = 'none';
      }
    }
  }, [mapLoaded]);
  
  // Initialize the map with the address
  const initializeMap = () => {
    if (!mapContainerRef.current || mapLoaded) return;
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      
      const mapOptions = {
        zoom: 18,
        center: { lat: 33.7490, lng: -84.3880 }, // Atlanta, GA as default
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP
        },
        disableDefaultUI: true,
        scrollwheel: false
      };
      
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, mapOptions);
      
      const hideLabelsStyle = [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ];
      
      mapRef.current.setOptions({ styles: hideLabelsStyle });
      
      const mapSafetyTimeout = setTimeout(() => {
        if (!mapLoaded) {
          console.warn('Map initialization taking too long, marking as loaded anyway');
          setMapLoaded(true);
        }
        
        setTimeout(() => {
          setValueLoading(false);
        }, 2000);
      }, 5000);
      
      if (formData.location && formData.location.lat && formData.location.lng) {
        const position = {
          lat: formData.location.lat,
          lng: formData.location.lng
        };
        
        mapRef.current.setCenter(position);
        
        new window.google.maps.Marker({
          position: position,
          map: mapRef.current,
          animation: window.google.maps.Animation.DROP
        });
        
        clearTimeout(mapSafetyTimeout);
        setMapLoaded(true);
      } 
      else if (formData.street) {
        try {
          geocoder.geocode({ address: formData.street }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const position = results[0].geometry.location;
              
              mapRef.current.setCenter(position);
              
              new window.google.maps.Marker({
                position: position,
                map: mapRef.current,
                animation: window.google.maps.Animation.DROP
              });
              
              updateFormData({
                location: {
                  lat: position.lat(),
                  lng: position.lng()
                }
              });
            } else {
              console.warn('Geocode was not successful:', status);
              trackFormError('Geocode was not successful: ' + status, 'geocode');
              
              if (mapRef.current) {
                new window.google.maps.Marker({
                  position: mapOptions.center,
                  map: mapRef.current,
                  animation: window.google.maps.Animation.DROP
                });
              }
            }
            
            clearTimeout(mapSafetyTimeout);
            setMapLoaded(true);
          });
        } catch (geocodeError) {
          console.warn('Geocoding error:', geocodeError);
          clearTimeout(mapSafetyTimeout);
          setMapLoaded(true);
        }
      } else {
        clearTimeout(mapSafetyTimeout);
        setMapLoaded(true);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      trackFormError('Error initializing map: ' + error.message, 'map');
      
      if (mapContainerRef.current) {
        mapContainerRef.current.style.display = 'none';
      }
      
      setMapLoaded(true);
    }
  };
  
  // Handle regular form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    updateFormData({ [name]: value });
    
    if (name === 'name' && nameError) {
      setNameError('');
    } else if (name === 'phone' && phoneError) {
      setPhoneError('');
    }
  };
  
  // Handle address input changes specifically 
  const handleAddressChange = (e) => {
    const { value } = e.target;
    setEditedAddress(value);
    
    if (addressError) {
      setAddressError('');
    }
  };
  
  // Update address in form data and then immediately show the contact form
  const updateAddress = async () => {
    if (!validateAddress(editedAddress)) {
      setAddressError('Please enter a valid address');
      if (addressRef.current) {
        addressRef.current.className = 'v1-overlay-form-input error';
      }
      trackFormError('Invalid address', 'address');
      return false;
    }
    
    updateFormData({ 
      street: editedAddress,
      location: null
    });
    
    setOverlayVisible(false);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setEditMode('contact');
    setOverlayVisible(true);
    
    setMapLoaded(false);
    setTimeout(() => {
      if (mapContainerRef.current && window.google && window.google.maps) {
        initializeMap();
      }
    }, 300);
    
    console.log('Address updated to:', editedAddress);
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e, fromOverlay = false) => {
    e.preventDefault();
    
    // Different handling based on edit mode
    if (editMode === 'address') {
      // Handle address update
      const addressUpdated = await updateAddress().catch(err => {
        console.warn('Address update failed, but continuing:', err.message);
        return true; // Still allow form to proceed even if update fails
      });
      
      if (!addressUpdated) return;
      
      // After successfully updating address, don't proceed further
      return;
    }
    
    // For contact info form
    let isValid = true;
    
    // Validate name
    if (!validateName(formData.name)) {
      setNameError('Please enter a valid name');
      if (nameRef.current) {
        nameRef.current.className = 'v1-overlay-form-input error';
      }
      trackFormError('Invalid name', 'name');
      isValid = false;
    } else {
      setNameError('');
      if (nameRef.current) {
        nameRef.current.className = 'v1-overlay-form-input';
      }
    }
    
    // Validate phone
    if (!validatePhone(formData.phone)) {
      setPhoneError('Valid phone required to receive your cash offer details via text message (No Spam Ever)');
      if (phoneRef.current) {
        phoneRef.current.className = 'v1-overlay-form-input error';
      }
      trackFormError('Invalid phone number', 'phone');
      isValid = false;
    } else {
      setPhoneError('');
      if (phoneRef.current) {
        phoneRef.current.className = 'v1-overlay-form-input';
      }
    }
    
    if (!isValid) {
      return;
    }
    
    // If validation passes, submit the lead
    try {
      setIsSubmitting(true);
      
      const cleanName = formData.name.trim();
      const cleanPhone = formData.phone.trim();
      
      updateFormData({
        name: cleanName,
        phone: cleanPhone,
        leadStage: 'Contact Info Provided'
      });
      
      console.log('Submitting lead with contact info:', {
        name: cleanName,
        phone: cleanPhone,
        address: formData.street
      });
      
      const existingLeadId = localStorage.getItem('suggestionLeadId') || localStorage.getItem('leadId');
      
      let contactUpdateSuccess = true;
      if (existingLeadId) {
        console.log("DIRECT CONTACT UPDATE FOR LEADID:", existingLeadId);
        contactUpdateSuccess = await updateContactInfo(existingLeadId, cleanName, cleanPhone, formData.email || '')
          .catch(err => {
            console.warn('Contact update failed, but continuing:', err.message);
            return false;
          });
      }
      
      let submitSuccess = false;
      try {
        submitSuccess = await submitLead();
      } catch (submitError) {
        console.warn('Lead submission error, but continuing:', submitError.message);
        if (!submitSuccess) {
          console.log('Using fallback storage for lead data');
          localStorage.setItem('offlineLeadData', JSON.stringify({
            name: cleanName,
            phone: cleanPhone,
            address: formData.street,
            timestamp: new Date().toISOString()
          }));
          submitSuccess = true;
        }
      }
      
      if (submitSuccess || contactUpdateSuccess) {
        console.log('Lead captured successfully');
        
        trackPhoneNumberLead();
        
        trackFormStepComplete(2, 'Personal Info Form Completed', formData);
        
        nextStep();
      } else {
        console.error('Failed to submit lead - trying offline storage');
        localStorage.setItem('offlineLeadData', JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          address: formData.street,
          timestamp: new Date().toISOString()
        }));
        
        setPhoneError('There were some connectivity issues, but we\'ve saved your info. Click continue to proceed.');
        
        setTimeout(() => {
          nextStep();
        }, 3000);
        
        trackFormError('Lead submission failed, using offline storage', 'submit');
      }
    } catch (error) {
      console.error('Error during lead submission:', error);
      setPhoneError('There were some connectivity issues, but we will still process your request.');
      trackFormError('Error during lead submission: ' + error.message, 'submit');
      
      localStorage.setItem('offlineLeadData', JSON.stringify({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.street,
        timestamp: new Date().toISOString()
      }));
      
      setTimeout(() => {
        nextStep();
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle "yes, that's correct" button click
  const handleConfirm = () => {
    if (formData.name && formData.phone) {
      handleSubmit({ preventDefault: () => {} }, true);
    } else {
      setEditMode('contact');
      setOverlayVisible(true);
    }
  };
  
  // Helper function to format text with nowrap spans
  const formatConfirmText = (text) => {
    if (text && text.includes('and home value')) {
      const parts = text.split('and home value');
      return (
        <>
          {parts[0]}<span className="v1-nowrap-phrase">and home value</span>{parts[1]}
        </>
      );
    }
    return text;
  };
  
  // Handle "edit info" button click
  const handleEditClick = () => {
    setEditMode('address');
    setEditedAddress(formData.street || '');
    setOverlayVisible(true);
  };
  
  // Close the overlay
  const closeOverlay = () => {
    setOverlayVisible(false);
  };
  
  // Format property value if needed
  const getFormattedPropertyValue = () => {
    if (formData.formattedApiEstimatedValue && formData.formattedApiEstimatedValue !== '$0') {
      return formData.formattedApiEstimatedValue;
    } else if (formData.apiEstimatedValue && formData.apiEstimatedValue > 0) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(formData.apiEstimatedValue);
    }
    return null;
  };
  
  // Get the formatted value
  const formattedValue = getFormattedPropertyValue();
  
  // Render the correct form overlay based on edit mode
  const renderFormOverlay = () => {
    if (editMode === 'contact') {
      return (
        <div className="v1-overlay">
          <div className="v1-overlay-form-container">
            <button onClick={closeOverlay} className="v1-overlay-close-button">
              X
            </button>
            
            <div className="v1-overlay-form-headline">
              {formData.templateType === 'VALUE' 
                ? 'Where should we send your home value report?' 
                : formData.templateType === 'FAST' 
                  ? 'Where should we send your fast sale offer?' 
                  : 'Where should we send your cash offer?'}
            </div>
            
            <form className="v1-overlay-form-fields" onSubmit={handleSubmit}>
              <input
                ref={nameRef}
                autoComplete="name"
                type="text"
                name="name"
                placeholder="Full name"
                className="v1-overlay-form-input"
                value={formData.name || ''}
                onChange={handleChange}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Full name'}
                disabled={isSubmitting}
              />
              {nameError && (
                <div className="v1-phone-error-message">
                  {nameError}
                </div>
              )}
              
              <input
                ref={phoneRef}
                autoComplete="tel"
                type="text"
                name="phone"
                placeholder="Phone (receive quick offer text)"
                className="v1-overlay-form-input"
                value={formData.phone || ''}
                onChange={handleChange}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Phone (receive quick offer text)'}
                disabled={isSubmitting}
              />
              
              {phoneError && (
                <div className="v1-phone-error-message">
                  {phoneError}
                </div>
              )}
              
              <button 
                className="v1-registration-button" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'PROCESSING...' : formData.buttonText || 'CHECK OFFER'}
              </button>
            </form>
          </div>
        </div>
      );
    } else if (editMode === 'address') {
      return (
        <div className="v1-overlay">
          <div className="v1-overlay-form-container">
            <button onClick={closeOverlay} className="v1-overlay-close-button">
              X
            </button>
            
            <div className="v1-overlay-form-headline">
              Edit Property Address
            </div>
            
            <form className="v1-overlay-form-fields" onSubmit={handleSubmit}>
              <input
                ref={addressRef}
                autoComplete="street-address"
                type="text"
                name="editedAddress"
                placeholder="Property address"
                className="v1-overlay-form-input"
                value={editedAddress}
                onChange={handleAddressChange}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Property address'}
                disabled={isSubmitting}
              />
              {addressError && (
                <div className="v1-phone-error-message">
                  {addressError}
                </div>
              )}
               
              <button 
                className="v1-registration-button" 
                type="button"
                onClick={updateAddress}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'UPDATING...' : 'UPDATE ADDRESS'}
              </button>
            </form>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className="v1-hero-section">
      <div className="v1-hero-middle-container">
        <div className="v1-hero-content v1-fade-in v1-max-width-500">
        
          
          <div className="v1-hero-1-api-address">
            {formData.street && formData.street.replace(/, USA$/, '')}
          </div>
          
          {valueLoading ? (
            <div className="v1-hero-property-estimate">
              <span className="v1-loading-dots">Retrieving Maximum Value</span>
            </div>
          ) : formData.apiMaxHomeValue ? (
            <div className="v1-hero-property-estimate">
              Value Estimate: {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(formData.apiMaxHomeValue)}
            </div>
          ) : formattedValue && (
            <div className="v1-hero-property-estimate">
              Value Estimate: {formattedValue}
            </div>
          )}
          
          {/* Google Map */}
          <div 
            ref={mapContainerRef}
            className="v1-custom-map-container"
          />
          
          <div className="v1-simple-address-display">
            <strong className="v1-confirmation-header"> 
              {formData.templateType === 'FAST' 
                  ? <>Great!  Next, where you want us to text your fast sell offer?</> 
                  :  <>Great!  Next, where you want us to text your maximum cash offer?</>}
            </strong>
          </div>
          
          <div className="v1-hero-middle-map-sub-info" style={{ opacity: 1 }}>
            <div className="v1-hero-middle-map-buttons">
              <button
                className="v1-hero-middle-map-submit-button"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Yes, that\'s correct'}
              </button>
              
              <button
                className="v1-hero-middle-map-edit-button"
                onClick={handleEditClick}
                disabled={isSubmitting}
              >
                Edit info
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Overlay - rendered conditionally based on editMode */}
      {overlayVisible && renderFormOverlay()}
    </div>
  );
}

export default VariantPersonalInfoForm;