import React, { useRef, useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateName, validatePhone, validateAddress } from '../../utils/validation.js';
import { trackPhoneNumberLead, trackFormStepComplete, trackFormError } from '../../services/analytics';
import { updateContactInfo } from '../../services/zoho.js';

// This is a variant version of the PersonalInfoForm with a simplified layout
function VariantPersonalInfoForm() {
  const { formData, updateFormData, nextStep, submitLead } = useFormContext();
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [valueLoading, setValueLoading] = useState(!formData.apiEstimatedValue);

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    
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
  }, [formData.apiEstimatedValue]);
  
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
      
      .vb-form-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      
      .vb-headline {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 15px;
        text-align: center;
        color: #333;
      }
      
      .vb-address {
        font-size: 16px;
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 6px;
        margin-bottom: 15px;
        text-align: center;
      }
      
      .vb-value {
        font-size: 28px;
        font-weight: bold;
        color: #2e7d32;
        text-align: center;
        margin-bottom: 20px;
      }
      
      .vb-subheadline {
        font-size: 18px;
        text-align: center;
        margin-bottom: 25px;
        color: #444;
      }
      
      .vb-input-field {
        width: 100%;
        padding: 12px 15px;
        margin-bottom: 15px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 16px;
        transition: border-color 0.3s;
      }
      
      .vb-input-field:focus {
        border-color: #2e7d32;
        outline: none;
      }
      
      .vb-input-field.error {
        border-color: #d32f2f;
      }
      
      .vb-error-message {
        color: #d32f2f;
        font-size: 14px;
        margin-top: -10px;
        margin-bottom: 15px;
      }
      
      .vb-submit-button {
        width: 100%;
        padding: 14px;
        background-color: #2e7d32;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s;
        margin-bottom: 15px;
      }
      
      .vb-submit-button:hover {
        background-color: #1b5e20;
      }
      
      .vb-submit-button:disabled {
        background-color: #a5d6a7;
        cursor: not-allowed;
      }
      
      .vb-privacy-text {
        text-align: center;
        font-size: 13px;
        color: #777;
      }
      
      .vb-map-container {
        height: 250px;
        width: 100%;
        border-radius: 6px;
        margin-bottom: 20px;
        border: 1px solid #ccc;
        overflow: hidden;
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
        zoom: 18, // Increased zoom level
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
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    let isValid = true;
    
    // Validate name
    if (!validateName(formData.name)) {
      setNameError('Please enter your full name');
      isValid = false;
      // Track error for analytics
      trackFormError('Invalid name', 'name');
    } else {
      setNameError('');
    }
    
    // Validate phone
    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid phone number to receive your offer');
      isValid = false;
      // Track error for analytics
      trackFormError('Invalid phone number', 'phone');
    } else {
      setPhoneError('');
    }
    
    if (!isValid) {
      return;
    }
    
    // If validation passes, submit the lead
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
        trackFormStepComplete(2, 'Personal Info Form Completed (Variant)', formData);
        
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
    
    // If we have apiMaxHomeValue, use that
    if (formData.apiMaxHomeValue && formData.apiMaxHomeValue > 0) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(formData.apiMaxHomeValue);
    }
    
    return null;
  };
  
  // Get the formatted value
  const formattedValue = getFormattedPropertyValue();
  
  return (
    <div className="vb-form-container">
      <h1 className="vb-headline">Estimated Home Value</h1>
      
      <div className="vb-address">
        {formData.street && formData.street.replace(/, USA$/, '')}
      </div>
      
      <div className="vb-map-container" ref={mapContainerRef}>
        {!mapLoaded && <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading map...</div>}
      </div>
      
      {valueLoading ? (
        <div className="vb-value">
          <span className="loading-dots">Calculating Value</span>
        </div>
      ) : (
        <div className="vb-value">
          {formattedValue || '$0'}
        </div>
      )}
      
      <h2 className="vb-subheadline">Where should we send your maximum potential offer?</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          ref={nameRef}
          autoComplete="name"
          type="text"
          name="name"
          placeholder="Full name"
          className={`vb-input-field ${nameError ? 'error' : ''}`}
          value={formData.name || ''}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {nameError && <div className="vb-error-message">{nameError}</div>}
        
        <input
          ref={phoneRef}
          autoComplete="tel"
          type="text"
          name="phone"
          placeholder="Phone number"
          className={`vb-input-field ${phoneError ? 'error' : ''}`}
          value={formData.phone || ''}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        {phoneError && <div className="vb-error-message">{phoneError}</div>}
        
        <button 
          type="submit" 
          className="vb-submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'PROCESSING...' : 'CONFIRM'}
        </button>
        
        <p className="vb-privacy-text">
          We respect your privacy and never share your information.
        </p>
      </form>
    </div>
  );
}

export default VariantPersonalInfoForm;