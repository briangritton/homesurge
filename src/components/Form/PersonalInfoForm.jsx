import React, { useRef, useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateName, validatePhone, validateAddress } from '../../utils/validation.js';
import { trackPhoneNumberLead, trackFormStepComplete, trackFormError } from '../../services/analytics';

function PersonalInfoForm() {
  const { formData, updateFormData, nextStep, submitLead } = useFormContext();
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [editMode, setEditMode] = useState('address');
  const [editedAddress, setEditedAddress] = useState(formData.street || '');

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  
  // Scroll to top when component mounts and track page view
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track form step for analytics
    trackFormStepComplete(2, 'Personal Info Form Loaded');
    
    // Initialize edited address with current address
    setEditedAddress(formData.street || '');
    
    // Fix headline on map confirmation page
    const originalHeadline = document.querySelector('.hero-middle-map-headline');
    if (originalHeadline) {
      originalHeadline.style.display = 'none';
    }
    
    // Remove the confirmation box below the map
    const confirmationBox = document.querySelector('.simple-address-display');
    if (confirmationBox) {
      confirmationBox.style.display = 'none';
    }
  }, [formData.street]);
  
  // Initialize Google Map when component mounts
  useEffect(() => {
    // Only initialize if Google Maps is loaded and we have location data
    if (window.google && window.google.maps && mapContainerRef.current && !mapLoaded) {
      initializeMap();
    } else {
      // Add event listener for Google Maps script load
      const handleGoogleMapsLoaded = () => {
        if (window.google && window.google.maps && mapContainerRef.current) {
          initializeMap();
        }
      };
      
      // Check if script is already loaded
      if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
        window.addEventListener('load', handleGoogleMapsLoaded);
      }
      
      return () => {
        window.removeEventListener('load', handleGoogleMapsLoaded);
      };
    }
  }, [mapLoaded]);
  
  // Initialize the map with the address
  const initializeMap = () => {
    if (!mapContainerRef.current || mapLoaded) return;
    
    try {
      // Create geocoder to convert address to coordinates if needed
      const geocoder = new window.google.maps.Geocoder();
      
      // Default map options centered on address or fallback to GA
      const mapOptions = {
        zoom: 18, // Increased zoom level (was 16)
        center: { lat: 33.7490, lng: -84.3880 }, // Atlanta, GA as default
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP
        },
        // Hide most controls
        disableDefaultUI: true,
        scrollwheel: false
      };
      
      // Create the map
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, mapOptions);
      
      // Add custom styles to hide unnecessary UI elements
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
      
      // If we have location from Google Maps autocomplete
      if (formData.location && formData.location.lat && formData.location.lng) {
        const position = {
          lat: formData.location.lat,
          lng: formData.location.lng
        };
        
        // Center map on location
        mapRef.current.setCenter(position);
        
        // Add marker
        new window.google.maps.Marker({
          position: position,
          map: mapRef.current,
          animation: window.google.maps.Animation.DROP
        });
        
        setMapLoaded(true);
      } 
      // Otherwise, geocode the address
      else if (formData.street) {
        geocoder.geocode({ address: formData.street }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const position = results[0].geometry.location;
            
            // Center map on geocoded location
            mapRef.current.setCenter(position);
            
            // Add marker
            new window.google.maps.Marker({
              position: position,
              map: mapRef.current,
              animation: window.google.maps.Animation.DROP
            });
            
            // Save location to form data for future use
            updateFormData({
              location: {
                lat: position.lat(),
                lng: position.lng()
              }
            });
          } else {
            console.error('Geocode was not successful:', status);
            // Track error for analytics
            trackFormError('Geocode was not successful: ' + status, 'geocode');
          }
        });
        
        setMapLoaded(true);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      // Track error for analytics
      trackFormError('Error initializing map: ' + error.message, 'map');
    }
  };
  
  // Handle regular form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update the form data state
    updateFormData({ [name]: value });
    
    // Clear validation errors when user starts typing
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
    
    // Clear address error when user types
    if (addressError) {
      setAddressError('');
    }
  };
  
  // Update address in form data and then immediately show the contact form
  const updateAddress = async () => {
    if (!validateAddress(editedAddress)) {
      setAddressError('Please enter a valid address');
      if (addressRef.current) {
        addressRef.current.className = 'overlay-form-input error';
      }
      // Track error for analytics
      trackFormError('Invalid address', 'address');
      return false;
    }
    
    // Update form data with the new address
    updateFormData({ 
      street: editedAddress,
      // Reset location to force regeocode
      location: null
    });
    
    // Close the current overlay
    setOverlayVisible(false);
    
    // Give a little time for the state to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Then immediately show the contact form
    setEditMode('contact');
    setOverlayVisible(true);
    
    // Update map in the background
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
      const addressUpdated = await updateAddress();
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
        nameRef.current.className = 'overlay-form-input error';
      }
      // Track error for analytics
      trackFormError('Invalid name', 'name');
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
      // Track error for analytics
      trackFormError('Invalid phone number', 'phone');
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
    
    // If validation passes, submit the lead with the current form data (which includes the updated address)
    try {
      setIsSubmitting(true);
      
      // Ensure name and phone are explicitly updated in the form data before submission
      updateFormData({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        leadStage: 'Contact Info Provided'
      });
      
      // Log the data we're submitting to verify name and phone are included
      console.log('Submitting lead with contact info:', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.street
      });
      
      const success = await submitLead();
      
      if (success) {
        console.log('Lead submitted successfully');
        
        // Track phone number lead for analytics
        trackPhoneNumberLead();
        
        // Track form step completion
        trackFormStepComplete(2, 'Personal Info Form Completed');
        
        nextStep();
      } else {
        console.error('Failed to submit lead');
        setPhoneError('There was a problem submitting your information. Please try again.');
        // Track error for analytics
        trackFormError('Lead submission failed', 'submit');
      }
    } catch (error) {
      console.error('Error during lead submission:', error);
      setPhoneError('There was a problem submitting your information. Please try again.');
      // Track error for analytics
      trackFormError('Error during lead submission: ' + error.message, 'submit');
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
  
  // Handle "edit info" button click
  const handleEditClick = () => {
    setEditMode('address'); // Set to address edit mode
    setEditedAddress(formData.street || ''); // Initialize with current address
    setOverlayVisible(true);
  };
  
  // Close the overlay
  const closeOverlay = () => {
    setOverlayVisible(false);
  };
  
  // Map container styles
  const mapStyles = {
    height: '300px',
    width: '100%',
    maxWidth: '650px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #ccc',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
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
        <div className="overlay">
          <div className="overlay-form-container">
            <button onClick={closeOverlay} className="overlay-close-button">
              X
            </button>
            
            <div className="overlay-form-headline">
              Where should we send your cash offer?
            </div>
            
            <form className="overlay-form-fields" onSubmit={handleSubmit}>
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
      );
    } else if (editMode === 'address') {
      return (
        <div className="overlay">
          <div className="overlay-form-container">
            <button onClick={closeOverlay} className="overlay-close-button">
              X
            </button>
            
            <div className="overlay-form-headline">
              Edit Property Address
            </div>
            
            <form className="overlay-form-fields" onSubmit={handleSubmit}>
              <input
                ref={addressRef}
                autoComplete="street-address"
                type="text"
                name="editedAddress" // Use a different name to avoid conflicts
                placeholder="Property address"
                className="overlay-form-input"
                value={editedAddress}
                onChange={handleAddressChange}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Property address'}
                disabled={isSubmitting}
              />
              {addressError && (
                <div className="phone-error-message">
                  {addressError}
                </div>
              )}
              
              <button 
                className="registration-button" 
                type="button" // Button type to handle custom logic
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
    <div className="hero-section">
      <div className="hero-middle-container">
        <div className="hero-content fade-in max-width-500">
          <div className="hero-middle-map-headline">
            Confirm Your Address
          </div>
          
          <div className="hero-1-api-address">
            {formData.street}
          </div>
          
          {formattedValue && (
            <div className="hero-property-estimate">
              Estimated Value: {formattedValue}
            </div>
          )}
          
          {/* Google Map */}
          <div 
            ref={mapContainerRef}
            style={mapStyles}
            className="custom-map-container"
          />
          
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

export default PersonalInfoForm;