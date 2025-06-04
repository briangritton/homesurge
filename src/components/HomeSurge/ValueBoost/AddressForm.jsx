/**
 * AddressForm Component (Rewritten)
 * Clean, simplified implementation using service layer
 */

import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import { trackAddressSelected, trackFormStepComplete, trackFormError } from '../../../services/analytics';
import { trackPropertyValue } from '../../../services/facebook';
import gradientArrow from '../../../assets/images/gradient-arrow.png';
import waveImage from '../../../assets/images/wave.png';
import BelowFold from '../../BelowFold/BelowFold';
import LazyImage from '../../common/LazyImage';

// Import new services
import { googlePlacesService } from '../../../services/googlePlaces';
import { leadService } from '../../../services/leadOperations';
import { propertyService } from '../../../services/propertyLookup';
import { autofillService } from '../../../services/autofillDetection';
import { templateService } from '../../../services/templateEngine';

// CSS for visually hidden fields (preserved exactly)
const visuallyHiddenStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0
};

function AddressForm({ campaign, variant }) {
  // ===== FORM CONTEXT =====
  const { formData, updateFormData, nextStep } = useFormContext();
  
  // ===== STATE (Minimal) =====
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  
  // ===== REFS =====
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  // ===== DYNAMIC CONTENT =====
  const dynamicContent = templateService.getTemplate(campaign, variant);
  
  // ===== STEP NAVIGATION =====
  const handleStepNavigation = () => {
    console.log(`🎯 AddressForm navigation for variant: ${variant}`);
    
    if (variant === 'A1I') {
      nextStep(); // Go to Step 2 (AI Processing)
    } else {
      updateFormData({ formStep: 3 }); // Skip to Step 3
    }
  };

  // ===== GOOGLE PLACES INITIALIZATION =====
  useEffect(() => {
    const initializeGooglePlaces = async () => {
      try {
        console.log('🗺️ Initializing Google Places API...');
        const initialized = await googlePlacesService.initialize();
        setGoogleApiLoaded(initialized);
        
        if (initialized && inputRef.current) {
          // Initialize native Google Places Autocomplete widget (like original)
          autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'address_components', 'geometry', 'place_id', 'name']
          });

          // Add place selection listener
          autocompleteRef.current.addListener('place_changed', async () => {
            const place = autocompleteRef.current.getPlace();
            
            if (place && place.geometry) {
              console.log('📍 Google Place selected:', place.formatted_address);
              await handlePlaceSelect(place);
            } else {
              setErrorMessage('Please continue typing and select a valid address from the dropdown suggestions');
            }
          });
        }
        
        console.log('🗺️ Google Places API initialized:', initialized);
      } catch (error) {
        console.error('❌ Failed to initialize Google Places API:', error);
        setGoogleApiLoaded(false);
      }
    };
    
    initializeGooglePlaces();
  }, []);

  // ===== AUTOFILL DETECTION =====
  useEffect(() => {
    const handleAutofillDetected = async (autofillData) => {
      console.log('🤖 Autofill detected:', autofillData);
      
      // Update FormContext with autofilled data
      updateFormData(autofillData);
      
      // Save to CRM
      await leadService.saveAutofillData(autofillData);
      
      // If we have address data, try to process it
      if (autofillData.street) {
        await handleAddressAutofill(autofillData.street);
      }
    };

    const handleFieldAutofilled = (fieldData) => {
      console.log('📝 Field autofilled:', fieldData);
      updateFormData(fieldData);
    };

    // Initialize autofill detection
    autofillService.initDetection({
      onAutofillDetected: handleAutofillDetected,
      onFieldAutofilled: handleFieldAutofilled,
      formRef,
      inputRef,
      enabled: true
    });

    return () => {
      autofillService.cleanup();
    };
  }, [updateFormData]);

  // ===== ADDRESS INPUT HANDLER =====
  const handleAddressInput = async (value) => {
    // Update FormContext with typing progress
    updateFormData({ 
      street: value,
      addressSelectionType: 'Manual',
      userTypedAddress: value,
      leadStage: 'Address Typing'
    });

    // Clear error message
    if (errorMessage) {
      setErrorMessage('');
    }

    // Save typing progress to CRM (non-blocking)
    if (value.length >= 2) {
      leadService.saveAddressTyping(value);
    }
  };

  // ===== PLACE SELECTION HANDLER =====
  const handlePlaceSelect = async (place) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      console.log('📍 Processing place selection:', place.description);
      
      // 1. Get place details if needed
      let placeDetails = place;
      if (place.place_id && !place.address_components) {
        placeDetails = await googlePlacesService.getPlaceDetails(place.place_id);
      }
      
      // 2. Format address components
      const addressData = googlePlacesService.formatAddressComponents(placeDetails);
      
      // 3. Lookup property data
      // const propertyData = await propertyService.lookupProperty(placeDetails.formatted_address);
      
      // 4. Prepare comprehensive update
      const updateData = {
        ...addressData,
        // ...propertyData,
        leadStage: 'Address Selected'
      };
      
      // 5. Update FormContext
      updateFormData(updateData);
      
    
      



      
      // 8. Reset Google session
      googlePlacesService.resetSessionToken();
      
      // 9. Navigate to next step
      trackFormStepComplete(1, 'Address Form', formData);
      handleStepNavigation();
      
      // 10. Start background property lookups (non-blocking)
      propertyService.startIndependentLookups(placeDetails.formatted_address, updateFormData);




  // 6. Save to CRM
      await leadService.saveFinalSelection(
        addressData,
        null, // Property data will be saved when APIs complete
        {
          campaign_name: formData.campaign_name,
          campaign_id: formData.campaign_id,
          keyword: formData.keyword,
          traffic_source: formData.traffic_source
        },
        {
          autoFilledName: formData.autoFilledName,
          autoFilledPhone: formData.autoFilledPhone,
          nameWasAutofilled: formData.nameWasAutofilled
        }
      );



// // 3. Lookup property data
//       const propertyData = await propertyService.lookupProperty(placeDetails.formatted_address);
      


//       // // 7. Track analytics
//       trackAddressSelected(addressData.addressSelectionType);
//       if (propertyData?.apiEstimatedValue) {
//         trackPropertyValue(propertyData);
//       }

// // 6. Save to CRM
//       await leadService.saveFinalSelection(
       
//         propertyData,
//         {
//         // property data here?  Or shoudl this CRM setting for api data not be handled here and done in their services iinstead?
//         }
//       );












      
    } catch (error) {
      console.error('❌ Place selection failed:', error);
      setErrorMessage('Please continue typing and select a valid address from the dropdown suggestions');
      trackFormError('Place selection failed: ' + error.message, 'address-form');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== AUTOFILL ADDRESS HANDLER =====
  const handleAddressAutofill = async (addressText) => {
    console.log('🤖 Processing autofilled address:', addressText);
    
    try {
      // Try to get Google suggestions for autofilled address
      if (googleApiLoaded) {
        const suggestions = await googlePlacesService.getPlacePredictions(addressText);
        if (suggestions.length > 0) {
          // Use first suggestion
          await handlePlaceSelect(suggestions[0]);
          return;
        }
      }
      
      // Fallback: create basic place object
      // const basicPlace = googlePlacesService.createBasicPlace(addressText);
      // await handlePlaceSelect(basicPlace);
      
    } catch (error) {
      console.error('❌ Autofill address processing failed:', error);
    }
  };

  // ===== BUTTON CLICK HANDLER =====
  const handleButtonClick = async (e) => {
    e.preventDefault();
    
    // BLOCK MANUAL SUBMISSIONS - Force Google Places selection like original
    setErrorMessage('Please continue typing and select a valid address from the dropdown suggestions');
    
    // Scroll to top to show error
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ===== ENTER KEY HANDLER =====
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // BLOCK MANUAL SUBMISSIONS - Force Google Places selection like original  
      setErrorMessage('Please continue typing and select a valid address from the dropdown suggestions');
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ===== RENDER =====
  return (
    <div className="vb-af1-hero-section">
      <div className="vb-af1-hero-middle-container">
        <div className="vb-af1-hero-content">
          
          {/* DYNAMIC CONTENT SECTION - Using original class names */}
          <div className="vb-af1-hero-headline">{dynamicContent.headline}</div>
          <div 
            className="vb-af1-hero-subheadline"
            dangerouslySetInnerHTML={{ __html: dynamicContent.subheadline }}
          />

          {/* SPLIT TEST AREA - STEP 1 BOX VISIBILITY */}
          {/* Position 1: A=Show Box, B=Hide Box */}
          {(() => {
            // Show value boost box for "1" variants (original layout), hide for "2" variants (streamlined layout)
            const showValueBoostBox = variant === 'A1O' || variant === 'A1I';
            console.log(`🎯 AddressForm: variant=${variant}, showValueBoostBox=${showValueBoostBox}`);
            return showValueBoostBox;
          })() && (
            <div className="vb-value-boost-box">
              {/* Example indicator */}
              <div className="vb-box-tag">
                {dynamicContent.exampleTag}
              </div>

              <h2 className="vb-box-headline">
                {dynamicContent.potentialHeadline}
              </h2>

              {/* Responsive container for values */}
              <div className="vb-value-container">
                {/* Current Value */}
                <div className="vb-value-item">
                  <div className="vb-value-amount vb-current-value">
                    $554,000
                  </div>
                  <div className="vb-value-label">
                    Current Value
                  </div>
                </div>

                {/* Arrow - responsive */}
                <div className="vb-value-arrow">
                  <img 
                    src={gradientArrow}
                    alt="Value boost arrow"
                    className="vb-arrow-horizontal"
                  />
                  <img 
                    src={gradientArrow}
                    alt="Value boost arrow"
                    className="vb-arrow-vertical"
                  />
                </div>

                {/* Value Boost Potential */}
                <div className="vb-value-item">
                  <div className="vb-value-amount vb-boost-value">
                    $121,880
                  </div>
                  <div className="vb-value-label">
                    Offer Boost Potential
                  </div>
                </div>
              </div>

              {/* New Total Value */}
              <div className="vb-new-total">
                <div className="vb-new-total-label">
                  New Total Value
                </div>
                <div className="vb-new-total-amount">
                  $675,880
                </div>
              </div>

              <p className="vb-opportunities-text">
                <strong>{dynamicContent.opportunitiesText}</strong>
              </p>
              <p className="vb-percentage-text">
                {dynamicContent.percentageText}: 22%
              </p>
            </div>
          )}

          {/* FORM SECTION - Using original class names */}
          <form className="vb-af1-form-container" ref={formRef} onSubmit={(e) => e.preventDefault()}>
            
            {/* Error message */}
            {errorMessage && (
              <div className="vb-af1-error-message">{errorMessage}</div>
            )}
            
            <input
              ref={inputRef}
              type="text"
              name="address-line1"
              autoComplete="street-address"
              placeholder="Enter your property address"
              className={errorMessage ? 'vb-af1-address-input-invalid' : 'vb-af1-address-input'}
              onChange={(e) => handleAddressInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={(e) => e.target.placeholder = ''}
              onBlur={(e) => e.target.placeholder = 'Enter your property address'}
              disabled={isLoading}
            />

            {/* HIDDEN AUTOFILL FIELDS */}
            <div style={visuallyHiddenStyle}>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Name"
                className="vb-af1-address-input"
                value={formData.autoFilledName || ''}
                onChange={(e) => updateFormData({ autoFilledName: e.target.value })}
                tabIndex="-1"
                disabled={isLoading}
              />
            </div>
            
            <div style={visuallyHiddenStyle}>
              <input
                type="tel"
                name="tel"
                autoComplete="tel"
                placeholder="Your phone (optional)"
                className="vb-af1-address-input"
                value={formData.autoFilledPhone || ''}
                onChange={(e) => updateFormData({ autoFilledPhone: e.target.value })}
                tabIndex="-1"
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit"
              className="vb-af1-submit-button"
              onClick={handleButtonClick}
              disabled={isLoading}
            >
              {isLoading ? 'ANALYZING...' : dynamicContent.buttonText}
            </button>

            {/* Google Places dropdown will appear automatically */}

          </form>

          {/* Tagline */}
          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#666',
            fontWeight: '500',
            letterSpacing: '0.5px',
            marginTop: '20px',
            marginBottom: '15px',
            paddingLeft: '20px',
            paddingRight: '20px'
          }}>
            Smarter Home Services, Powered by HomeSurge.AI
          </div>

          {/* AI Wave container */}
          <div className="ai-wave-container">
            <LazyImage 
              src={waveImage} 
              alt="Wave decoration" 
              style={{
                width: '200px',
                height: 'auto',
                opacity: 0.6
              }}
            />
          </div>

          {/* DISCLAIMER SECTION - Using original class names */}
          <div className="vb-disclaimer-section">
            <div 
              className="vb-disclaimer-text"
              dangerouslySetInnerHTML={{ __html: dynamicContent.disclaimerMain }}
              onClick={(e) => {
                if (e.target.classList.contains('disclaimer-link')) {
                  alert(dynamicContent.disclaimerPopup);
                }
              }}
            />
          </div>

        </div>

        {/* CONTACT SECTION - Using original class names, outside hero-content */}
        <div className="vb-af-contact-section-wrapper">
          <div className="vb-af-contact-header">
            <h3 className="vb-af-contact-headline" dangerouslySetInnerHTML={{ __html: dynamicContent.contactHeadline }}></h3>
          </div>
          <div className="vb-af-features-bubble">
            <div className="vb-af-feature-item">
              <div className="vb-af-feature-icon">✓</div>
              <p className="vb-af-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark1 }}></p>
            </div>
            <div className="vb-af-feature-item">
              <div className="vb-af-feature-icon">✓</div>
              <p className="vb-af-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark2 }}></p>
            </div>
            <div className="vb-af-feature-item">
              <div className="vb-af-feature-icon">✓</div>
              <p className="vb-af-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark3 }}></p>
            </div>
          </div>
          <button 
            className="vb-af-contact-button vb-af-button-flare"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {dynamicContent.contactButtonText}
          </button>
        </div>

        {/* BELOW FOLD CONTENT */}
        <BelowFold />
        
      </div>
    </div>
  );
}

export default AddressForm;