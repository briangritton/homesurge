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
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [firstSuggestion, setFirstSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  
  // ===== REFS =====
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const suggestionTimer = useRef(null);
  
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
    const checkGoogleAPI = () => {
      if (googlePlacesService.isAvailable()) {
        const initialized = googlePlacesService.initialize();
        setGoogleApiLoaded(initialized);
        console.log('🗺️ Google Places API initialized:', initialized);
      } else {
        console.log('⏳ Waiting for Google Places API...');
        setTimeout(checkGoogleAPI, 500);
      }
    };
    
    checkGoogleAPI();
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
    // Clear previous timer
    if (suggestionTimer.current) {
      clearTimeout(suggestionTimer.current);
    }

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

    // Get suggestions if input is long enough
    if (value.length >= 2 && googleApiLoaded) {
      suggestionTimer.current = setTimeout(async () => {
        try {
          const suggestions = await googlePlacesService.getPlacePredictions(value);
          setAddressSuggestions(suggestions);
          setFirstSuggestion(suggestions[0] || null);
          
          // Save typing progress to CRM (non-blocking)
          leadService.saveAddressTyping(value);
        } catch (error) {
          console.error('❌ Failed to get address suggestions:', error);
          setAddressSuggestions([]);
        }
      }, 500);
    } else {
      setAddressSuggestions([]);
      setFirstSuggestion(null);
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
      const propertyData = await propertyService.lookupProperty(placeDetails.formatted_address);
      
      // 4. Prepare comprehensive update
      const updateData = {
        ...addressData,
        ...propertyData,
        leadStage: 'Address Selected'
      };
      
      // 5. Update FormContext
      updateFormData(updateData);
      
      // 6. Save to CRM
      await leadService.saveFinalSelection(
        addressData,
        propertyData,
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
      
      // 7. Track analytics
      trackAddressSelected(addressData.addressSelectionType);
      if (propertyData?.apiEstimatedValue) {
        trackPropertyValue(propertyData);
      }
      
      // 8. Reset Google session
      googlePlacesService.resetSessionToken();
      
      // 9. Navigate to next step
      trackFormStepComplete(1, 'Address Form', formData);
      handleStepNavigation();
      
    } catch (error) {
      console.error('❌ Place selection failed:', error);
      setErrorMessage('Unable to process address. Please try again.');
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
      const basicPlace = googlePlacesService.createBasicPlace(addressText);
      await handlePlaceSelect(basicPlace);
      
    } catch (error) {
      console.error('❌ Autofill address processing failed:', error);
    }
  };

  // ===== MANUAL FORM SUBMISSION =====
  const handleManualSubmit = async () => {
    const address = inputRef.current?.value || formData.street;
    
    if (!address || address.length < 5) {
      setErrorMessage('Please enter a valid address');
      return;
    }

    // Use first suggestion if available, otherwise create basic place
    const place = firstSuggestion || googlePlacesService.createBasicPlace(address);
    await handlePlaceSelect(place);
  };

  // ===== ENTER KEY HANDLER =====
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  // ===== RENDER =====
  return (
    <div className="vb-af1-container">
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        
        {/* DYNAMIC CONTENT SECTION - Preserved exactly */}
        <div className="vb-af1-content">
          <div className="vb-af1-headline">{dynamicContent.headline}</div>
          <div 
            className="vb-af1-subheadline"
            dangerouslySetInnerHTML={{ __html: dynamicContent.subheadline }}
          />
        </div>

        {/* ADDRESS INPUT SECTION - Preserved exactly */}
        <div className="vb-af1-address-container">
          <div className="vb-af1-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              name="address-line1"
              autoComplete="street-address"
              placeholder="Enter your street address"
              className="vb-af1-address-input"
              onChange={(e) => handleAddressInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              type="button"
              className="vb-af1-address-button"
              onClick={handleManualSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : dynamicContent.buttonText}
            </button>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="vb-af1-error-message">{errorMessage}</div>
          )}

          {/* Address suggestions */}
          {addressSuggestions.length > 0 && (
            <div className="vb-af1-suggestions">
              {addressSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.place_id}
                  className="vb-af1-suggestion"
                  onClick={() => handlePlaceSelect(suggestion)}
                >
                  {suggestion.description}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HIDDEN AUTOFILL FIELDS - Preserved exactly */}
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
          />
        </div>

        {/* EXAMPLE SECTION - Preserved exactly */}
        <div className="vb-af1-example-section">
          <div className="vb-af1-example-tag">{dynamicContent.exampleTag}</div>
          <div className="vb-af1-potential-container">
            <div 
              className="vb-af1-potential-headline"
              dangerouslySetInnerHTML={{ __html: dynamicContent.potentialHeadline }}
            />
            <div className="vb-af1-opportunities">{dynamicContent.opportunitiesText}</div>
            <div className="vb-af1-percentage-container">
              <div className="vb-af1-percentage">22%</div>
              <div className="vb-af1-percentage-text">{dynamicContent.percentageText}</div>
            </div>
          </div>
        </div>

        {/* CONTACT SECTION - Preserved exactly */}
        <div className="vb-af1-contact-section">
          <div className="vb-af1-contact-headline">{dynamicContent.contactHeadline}</div>
          <div className="vb-af1-checkmarks">
            <div className="vb-af1-checkmark" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark1 }} />
            <div className="vb-af1-checkmark" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark2 }} />
            <div className="vb-af1-checkmark" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark3 }} />
          </div>
        </div>

        {/* DISCLAIMER SECTION - Preserved exactly */}
        <div className="vb-af1-disclaimer-section">
          <div 
            className="vb-af1-disclaimer-main"
            dangerouslySetInnerHTML={{ __html: dynamicContent.disclaimerMain }}
            onClick={(e) => {
              if (e.target.classList.contains('privacy-link')) {
                // Handle privacy policy popup
                alert(dynamicContent.disclaimerPopup);
              }
            }}
          />
        </div>

      </form>

      {/* BELOW FOLD CONTENT - Preserved exactly */}
      <BelowFold />
    </div>
  );
}

export default AddressForm;