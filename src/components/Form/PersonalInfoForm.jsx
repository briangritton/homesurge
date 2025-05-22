import React, { useRef, useState, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateName, validatePhone, validateAddress } from '../../utils/validation.js';
import { trackPhoneNumberLead, trackFormStepComplete, trackFormError } from '../../services/analytics';
import { updateContactInfo } from '../../services/firebase.js';
import { sendLeadNotificationEmail } from '../../services/emailjs.js';

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
  const [showDefaultMessage, setShowDefaultMessage] = useState(false);

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
    
    // Variable to track if loading timeout is active
    let loadingTimeoutId = null;
    
    // If we already have the API value, show it immediately
    if (formData.apiEstimatedValue) {
      setValueLoading(false);
      setShowDefaultMessage(false);
    } else {
      // If no value available yet, show loading state
      setValueLoading(true);
      
      // Set timeout to handle loading state and fallback message
      loadingTimeoutId = setTimeout(() => {
        // After 5 seconds, check again if we have API value
        if (formData.apiEstimatedValue) {
          // If value arrived while we were waiting, show it
          setValueLoading(false);
          setShowDefaultMessage(false);
        } else {
          // If still no value, switch to default message
          setValueLoading(false);
          setShowDefaultMessage(true);
          
          // Set up a listener for future API value updates
          const apiValueInterval = setInterval(() => {
            // If API value comes in later, update the display
            if (formData.apiEstimatedValue) {
              setShowDefaultMessage(false);
              clearInterval(apiValueInterval);
            }
          }, 1000);
          
          // Clean up the interval
          setTimeout(() => clearInterval(apiValueInterval), 30000); // Stop checking after 30 seconds
        }
      }, 5000); // 5 seconds minimum loading time for the loading animation
    }
    
    // Handle API value arriving during the loading phase
    if (!formData.apiEstimatedValue) {
      const earlyValueCheck = setInterval(() => {
        if (formData.apiEstimatedValue) {
          // If we get the value before the 5-second timeout, show it immediately
          setValueLoading(false);
          setShowDefaultMessage(false);
          clearInterval(earlyValueCheck);
        }
      }, 500); // Check every 500ms
      
      // Clean up interval after 5 seconds (will be cancelled by the timeout anyway)
      setTimeout(() => clearInterval(earlyValueCheck), 5000);
    }
    
    return () => {
      if (loadingTimeoutId) clearTimeout(loadingTimeoutId);
    };
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
  
  // Handle input changes for name and phone fields
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
  
  // Update address in form data
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
    
    // Update map after address change
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For edit address overlay
    if (editMode === 'address' && overlayVisible) {
      const addressUpdated = await updateAddress().catch(err => {
        console.warn('Address update failed, but continuing:', err.message);
        return true;
      });
      
      if (!addressUpdated) return;
      return;
    }
    
    // For main form submission
    let isValid = true;
    
    // Validate name
    if (!validateName(formData.name)) {
      setNameError('Please enter your full name');
      isValid = false;
      trackFormError('Invalid name', 'name');
    } else {
      setNameError('');
    }
    
    // Validate phone
    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid phone number to receive your offer');
      isValid = false;
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
      
      // Clean the input values
      let cleanName = formData.name.trim();
      const cleanPhone = formData.phone.trim();
      
      // If the name had the autofill tag, remove it when user confirms
      if (cleanName.includes('(Autofilled by browser)')) {
        cleanName = cleanName.replace(' (Autofilled by browser)', '');
      }
      
      updateFormData({
        name: cleanName,
        phone: cleanPhone,
        nameWasAutofilled: false, // Clear the autofill flag
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
        console.log('Lead captured successfully - preparing to advance to next step');
        
        // Store data needed for notifications
        const leadData = {
          name: cleanName,
          phone: cleanPhone,
          address: formData.street,
          email: formData.email || '',
          leadSource: formData.leadSource || 'Website Form',
          campaign_name: formData.campaignName || formData.campaign_name || 'Direct',
          utm_source: formData.utm_source || '',
          utm_medium: formData.utm_medium || '',
          utm_campaign: formData.utm_campaign || '',
          id: existingLeadId || localStorage.getItem('leadId') || ''
        };
        
        // ------------------------
        // NON-BLOCKING NOTIFICATIONS
        // ------------------------
        // We use setTimeout with 0ms delay to move this to the next event loop,
        // allowing the UI to continue without waiting for notifications
        setTimeout(() => {
          // NOTIFICATION TRACKING - Send notifications in background
          console.log('🔍🔍🔍 NOTIFICATION TRACKING: Starting background notification section');
          console.log('🔍🔍🔍 NOTIFICATION TRACKING: Lead data ready for notifications', {
            name: leadData.name,
            phone: leadData.phone,
            address: leadData.address,
            leadId: leadData.id
          });
          
          // Background promise for all notification tasks
          (async () => {
            try {
              // PUSHOVER NOTIFICATION
              try {
                console.log('🟢🟢🟢 DIRECT DEBUG: Attempting Pushover notification in background');
                
                // Get the lead ID for linking to CRM
                const leadId = leadData.id;
                
                // Create the CRM deep link URL
                const crmUrl = leadId ? `https://sellforcash.online/crm?leadId=${leadId}` : '';
                
                // Create request body with actual lead information and deep link
                const requestBody = {
                  user: "um62xd21dr7pfugnwanooxi6mqxc3n", // Your Pushover user key
                  message: `New lead: ${leadData.name}\nPhone: ${leadData.phone}\nAddress: ${leadData.address || 'No address'}\nLead ID: ${leadId || 'N/A'}`,
                  title: "New Lead Notification",
                  priority: 1,
                  sound: "persistent",
                  url: crmUrl,
                  url_title: "View in CRM"
                };
                
                // List of additional Pushover user keys to notify
                const additionalRecipients = [
                  "uh5nkfdqcz161r35e6uy55j295to5y" // Spencer user keys here   !!! REMEMBER ADD AND REMOVE COMMA AFTER KEY OR IT WILL BREAK NOTIFICATIONS !!!!
                  // "ufrb12nxavarvmx4vuct15ibz2augo"  // Allison user keys here
                  // "uh5nkfdqcz161r35e6uy55j295teee"// DUMMY USER KEYS
                ];
                
                // Send to each recipient
                const sendPromises = [
                  // Send to primary user
                  fetch('/api/pushover/send-notification', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Accept': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                  })
                ];
                
                // Also send to additional recipients if configured
                additionalRecipients.forEach(recipientKey => {
                  if (recipientKey && recipientKey.trim()) {
                    sendPromises.push(
                      fetch('/api/pushover/send-notification', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                          ...requestBody,
                          user: recipientKey
                        })
                      })
                    );
                  }
                });
                
                // Execute all Pushover send promises in parallel
                const results = await Promise.allSettled(sendPromises);
                
                // Log summary
                const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
                const failureCount = results.length - successCount;
                console.log(`🟢🟢🟢 DIRECT DEBUG: Pushover notification summary - Success: ${successCount}, Failed: ${failureCount}`);
                
              } catch (pushoverError) {
                console.error('🟢🟢🟢 DIRECT DEBUG: Error sending Pushover notification in background:', pushoverError);
              }
              
              // EMAIL NOTIFICATION (also non-blocking)
              try {
                console.log('📧📧📧 EMAIL DEBUG: Sending EmailJS notification in background');
                
                // Define additional templates for secondary recipients
                const additionalTemplates = [
                  {
                    serviceId: 'service_zeuf0n8', // Same or different service ID
                    templateId: 'template_85tw59u' // Secondary template ID
                  }
                  // Add more templates here as needed
                ];
                
                // Send to primary and all additional recipients
                const emailResult = await sendLeadNotificationEmail(
                  leadData, 
                  'service_zeuf0n8', // Primary Service ID
                  'template_kuv08p4', // Primary Template ID
                  additionalTemplates // Additional templates
                );
                
                console.log('📧📧📧 EMAIL DEBUG: EmailJS notification summary:', emailResult.summary);
              } catch (error) {
                console.warn('📧📧📧 EMAIL DEBUG: Failed to send email notification:', error);
              }
              
              console.log('🔍🔍🔍 NOTIFICATION TRACKING: All background notifications completed');
            } catch (error) {
              console.error('🔍🔍🔍 NOTIFICATION TRACKING: Error in background notification process:', error);
            }
          })(); // Self-executing async function
        }, 0); // setTimeout with 0ms = next event loop
        
        trackPhoneNumberLead();
        
        trackFormStepComplete(2, 'Personal Info Form Completed', formData);
        
        console.log('Current form step before advancing:', formData.formStep);
        nextStep();
        console.log('Called nextStep() - should be advancing to next form');
        
        // Force update localStorage with the new step to ensure persistence
        const newStep = formData.formStep + 1;
        localStorage.setItem('formStep', newStep.toString());
        console.log('Manually updated localStorage formStep to:', newStep);
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
          console.log('Timeout expired - attempting to advance through fallback method');
          const currentStep = formData.formStep || 1;
          console.log('Current form step in fallback:', currentStep);
          
          nextStep();
          console.log('Called nextStep() in fallback - should be advancing');
          
          // Force update localStorage with the new step to ensure persistence
          const newStep = currentStep + 1;
          localStorage.setItem('formStep', newStep.toString());
          console.log('Manually updated localStorage formStep in fallback to:', newStep);
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
        console.log('Error recovery timeout expired - attempting final fallback method');
        const currentStep = formData.formStep || 1;
        console.log('Current form step in error recovery:', currentStep);
        
        nextStep();
        console.log('Called nextStep() in error recovery - should be advancing');
        
        // Force update localStorage with the new step to ensure persistence
        const newStep = currentStep + 1;
        localStorage.setItem('formStep', newStep.toString());
        console.log('Manually updated localStorage formStep in error recovery to:', newStep);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle "edit address" button click
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
  
  // Render the address edit overlay
  const renderAddressEditOverlay = () => {
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
  };
  
  return (
    <div className="v1-hero-section">
      <div className="v1-hero-middle-container">
        <div className="v1-hero-content v1-fade-in v1-max-width-500">
          <div className="v1-hero-1-api-address">
            {formData.street && (() => {
              const parts = formData.street.split(',');
              
              // Check if we have enough parts for the expected format
              if (parts.length >= 3) {
                // Format with street part + city, state
                return (
                  <>
                    {parts.slice(0, -2).join(',')},
                    <span className="v1-nowrap-phrase">
                      {parts.slice(-2).join(',').replace(/, USA$/, '')}
                    </span>
                  </>
                );
              } else if (parts.length === 2) {
                // Format with just two parts (likely street + city/state)
                return (
                  <>
                    {parts[0]},
                    <span className="v1-nowrap-phrase">
                      {parts[1].replace(/, USA$/, '')}
                    </span>
                  </>
                );
              } else {
                // Just display the address as is if only one part
                return formData.street.replace(/, USA$/, '');
              }
            })()}
            {/* <button 
              onClick={handleEditClick} 
              style={{ 
                marginLeft: '10px', 
                background: 'none', 
                border: 'none', 
                color: '#4CAF50', 
                cursor: 'pointer', 
                textDecoration: 'underline',
                fontSize: '0.8rem' 
              }}
            >
              Edit
            </button> */}
          </div>
           
          {valueLoading ? (
            <div className="v1-estimate-container">
              <span className="v1-hero-property-estimate v1-loading-dots">Retrieving Maximum Value</span>
            </div>
          ) : showDefaultMessage ? (
            <div className="v1-estimate-container">
              <span className="v1-hero-property-estimate" style={{ color: '#2e7b7d' }}>Your Offer is Ready!</span>
            </div>
          ) : formData.apiMaxHomeValue ? (
            <div className="v1-estimate-container">
              <span className="v1-value-estimate-label">Value Estimate:</span>
              <span className="v1-hero-property-estimate">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(formData.apiMaxHomeValue)}
              </span>
            </div>
          ) : formattedValue && (
            <div className="v1-estimate-container">
              <span className="v1-value-estimate-label">Value Estimate:</span>
              <span className="v1-hero-property-estimate">{formattedValue}</span>
            </div>
          )}
  
          {/* <div 
            ref={mapContainerRef}
            className="v1-custom-map-container"
          /> */}
          
          <div className="v1-simple-address-display">
            <div className="v1-confirmation-header"> 
              {formData.templateType === 'FAST' 
                ? <>Next, where do you want us to text your fast sell offer?</> 
                : <>Next, where do you want us to text your maximum cash offer?</>}
            </ div>
          </div>
          
          {/* Name and Phone Fields */}
          <form onSubmit={handleSubmit} className="v1-input-container">
            <input
              ref={nameRef}
              autoComplete="name"
              type="text"
              name="name"
              placeholder="Full name"
              className={`v1-input-field ${nameError ? 'error' : ''}`}
              value={formData.name || ''}
              onChange={handleChange}
              onFocus={(e) => e.target.placeholder = ''}
              onBlur={(e) => e.target.placeholder = 'Full name'}
              disabled={isSubmitting}
            />
            {nameError && (
              <div className="v1-error-message">
                {nameError}
              </div>
            )}
            
            <input
              ref={phoneRef}
              autoComplete="tel"
              type="tel"
              name="phone"
              placeholder="Phone number"
              className={`v1-input-field ${phoneError ? 'error' : ''}`}
              value={formData.phone || ''}
              onChange={handleChange}
              onFocus={(e) => e.target.placeholder = ''}
              onBlur={(e) => e.target.placeholder = 'Phone number'}
              disabled={isSubmitting}
            />
            {phoneError && (
              <div className="v1-error-message">
                {phoneError}
              </div>
            )}
            
            <button 
              type="submit" 
              className="v1-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'PROCESSING...' : 'CONFIRM'}
            </button>
            
            <p className="v1-privacy-text">
              You will receive an automated text with your offer to the  number provided. We respect your privacy and never share your information.
            </p>
          </form>
        </div>
      </div>
      
      {/* Address Edit Overlay */}
      {overlayVisible && renderAddressEditOverlay()}
    </div>
  );
}

export default PersonalInfoForm;