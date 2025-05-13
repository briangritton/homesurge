import React, { useRef, useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateName, validatePhone, validateAddress } from '../../utils/validation.js';
import { trackPhoneNumberLead, trackFormStepComplete, trackFormError } from '../../services/analytics';
import { updateContactInfo } from '../../services/zoho.js';

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
  const [valueLoading, setValueLoading] = useState(!formData.apiEstimatedValue);

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);

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
  
  // Initialize Google Map when component mounts
  // Add CSS for animated dots
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes loadingDots {
        0% { content: "."; }
        33% { content: ".."; }
        66% { content: "..."; }
        100% { content: ""; }
      }
      
      .loading-dots::after {
        content: "";
        animation: loadingDots 1.5s infinite;
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

  useEffect(() => {
    // Track map loading attempts to prevent infinite retries
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
        
        // Check if script is already loaded
        if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
          window.addEventListener('load', handleGoogleMapsLoaded);
        }
        
        // Set a timeout to hide the map container if it doesn't load within 3 seconds
        const mapTimeout = setTimeout(() => {
          if (!mapLoaded && mapContainerRef.current) {
            console.warn('Google Maps failed to load within timeout, hiding map container');
            // Hide the map container gracefully
            mapContainerRef.current.style.display = 'none';
            
            // Since map didn't load, show a basic address display instead
            const addressDisplay = document.querySelector('.hero-1-api-address');
            if (addressDisplay) {
              addressDisplay.style.fontSize = '1.2rem';
              addressDisplay.style.padding = '10px';
              addressDisplay.style.border = '1px solid #ccc';
              addressDisplay.style.borderRadius = '5px';
              addressDisplay.style.marginBottom = '20px';
            }
          }
        }, 3000);
        
        return () => {
          window.removeEventListener('load', handleGoogleMapsLoaded);
          clearTimeout(mapTimeout);
        };
      }
    } catch (error) {
      console.error('Error setting up map:', error);
      // Hide the map container if there's an error
      if (mapContainerRef.current) {
        mapContainerRef.current.style.display = 'none';
      }
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
      
      // Set a timeout to ensure we mark the map as loaded even if geocoding fails
      // This prevents the form from being blocked if geocoding hangs
      const mapSafetyTimeout = setTimeout(() => {
        if (!mapLoaded) {
          console.warn('Map initialization taking too long, marking as loaded anyway');
          setMapLoaded(true);
        }
        
        // Also set value loading to false after a delay regardless of API response
        setTimeout(() => {
          setValueLoading(false);
        }, 2000);
      }, 5000);
      
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
        
        clearTimeout(mapSafetyTimeout);
        setMapLoaded(true);
      } 
      // Otherwise, geocode the address
      else if (formData.street) {
        try {
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
              console.warn('Geocode was not successful:', status);
              // Track error for analytics but don't block form
              trackFormError('Geocode was not successful: ' + status, 'geocode');
              
              // If geocoding fails, still show the map at the default location
              if (mapRef.current) {
                // Add a marker at the default location
                new window.google.maps.Marker({
                  position: mapOptions.center,
                  map: mapRef.current,
                  animation: window.google.maps.Animation.DROP
                });
              }
            }
            
            // Mark as loaded even if geocoding fails
            clearTimeout(mapSafetyTimeout);
            setMapLoaded(true);
          });
        } catch (geocodeError) {
          console.warn('Geocoding error:', geocodeError);
          // Still mark as loaded to prevent blocking the form
          clearTimeout(mapSafetyTimeout);
          setMapLoaded(true);
        }
      } else {
        // No location or street address, still mark as loaded
        clearTimeout(mapSafetyTimeout);
        setMapLoaded(true);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      // Track error for analytics
      trackFormError('Error initializing map: ' + error.message, 'map');
      
      // Hide the map container on error
      if (mapContainerRef.current) {
        mapContainerRef.current.style.display = 'none';
      }
      
      // Still mark as loaded to allow form progress
      setMapLoaded(true);
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
      const cleanName = formData.name.trim();
      const cleanPhone = formData.phone.trim();
      
      updateFormData({
        name: cleanName,
        phone: cleanPhone,
        leadStage: 'Contact Info Provided'
      });
      
      // Log the data we're submitting to verify name and phone are included
      console.log('Submitting lead with contact info:', {
        name: cleanName,
        phone: cleanPhone,
        address: formData.street
      });
      
      // Get the existing lead ID - this should already exist from the address suggestion step
      const existingLeadId = localStorage.getItem('suggestionLeadId') || localStorage.getItem('leadId');
      
      let contactUpdateSuccess = true;
      if (existingLeadId) {
        // First directly update the contact info - this is a specialized direct update
        console.log("DIRECT CONTACT UPDATE FOR LEADID:", existingLeadId);
        contactUpdateSuccess = await updateContactInfo(existingLeadId, cleanName, cleanPhone, formData.email || '')
          .catch(err => {
            console.warn('Contact update failed, but continuing:', err.message);
            return false; // Mark as failed but continue with form
          });
      }
      
      // Then submit the full lead data using the standard flow
      let submitSuccess = false;
      try {
        submitSuccess = await submitLead();
      } catch (submitError) {
        console.warn('Lead submission error, but continuing:', submitError.message);
        // Create fallback submitSuccess with local storage as alternative
        if (!submitSuccess) {
          console.log('Using fallback storage for lead data');
          localStorage.setItem('offlineLeadData', JSON.stringify({
            name: cleanName,
            phone: cleanPhone,
            address: formData.street,
            timestamp: new Date().toISOString()
          }));
          submitSuccess = true; // Pretend success to continue the form
        }
      }
      
      if (submitSuccess || contactUpdateSuccess) {
        console.log('Lead captured successfully');
        
        // Track phone number lead for analytics
        trackPhoneNumberLead();
        
        // Track form step completion with campaign data
        trackFormStepComplete(2, 'Personal Info Form Completed', formData);
        
        // Always proceed even if API calls partially failed
        nextStep();
      } else {
        console.error('Failed to submit lead - trying offline storage');
        // Save to local storage as backup
        localStorage.setItem('offlineLeadData', JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          address: formData.street,
          timestamp: new Date().toISOString()
        }));
        
        // Still proceed after showing error
        setPhoneError('There were some connectivity issues, but we\'ve saved your info. Click continue to proceed.');
        
        // We still want to continue after delay to ensure user proceeds
        setTimeout(() => {
          nextStep();
        }, 3000);
        
        // Track error for analytics
        trackFormError('Lead submission failed, using offline storage', 'submit');
      }
    } catch (error) {
      console.error('Error during lead submission:', error);
      setPhoneError('There were some connectivity issues, but we will still process your request.');
      // Track error for analytics
      trackFormError('Error during lead submission: ' + error.message, 'submit');
      
      // Save to local storage as backup
      localStorage.setItem('offlineLeadData', JSON.stringify({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.street,
        timestamp: new Date().toISOString()
      }));
      
      // Still proceed after delay
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
                type="button" //  Button type to handle custom logic
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
            Please confirm your address and home value:
          </div>
          
          <div className="hero-1-api-address">
            {formData.street}
          </div>
          
          {valueLoading ? (
            <div className="hero-property-estimate">
              <span className="loading-dots">Retrieving Maximum Value</span>
            </div>
          ) : formData.apiMaxHomeValue ? (
            <div className="hero-property-estimate">
              Maximum Value: {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(formData.apiMaxHomeValue)}
            </div>
          ) : formattedValue && (
            <div className="hero-property-estimate">
              Maximum Value: {formattedValue}
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
            <strong> Please confirm your address and home value:
            </strong>
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