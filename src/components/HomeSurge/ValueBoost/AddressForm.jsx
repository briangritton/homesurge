/**
 * AddressForm Component (Rewritten)
 * Clean, simplified implementation using service layer
 */

import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import { trackAddressSelected, trackFormStepComplete, trackFormError, trackPropertyApiValue } from '../../../services/analytics';
import { trackPropertyValue } from '../../../services/facebook';
import gradientArrow from '../../../assets/images/gradient-arrow.png';
import waveImage from '../../../assets/images/wave.png';
import BelowFold from '../../BelowFold/BelowFold';
import LazyImage from '../../common/LazyImage';
import { BsTelephoneFill } from 'react-icons/bs';

// Import new services
import { googlePlacesService } from '../../../services/googlePlaces';
import { leadService } from '../../../services/leadOperations';
import { propertyService } from '../../../services/propertyLookup';
// import { autofillService } from '../../../services/autofillDetection'; // DISABLED
import { templateService } from '../../../services/templateEngine';

// CSS for visually hidden fields - DISABLED
// const visuallyHiddenStyle = { ... }; // Removed since autofill is disabled

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

  // ===== AUTOFILL DETECTION DISABLED =====
  // Autofill detection has been completely disabled for ValueBoost

  // ===== ADDRESS INPUT HANDLER =====
  const handleAddressInput = async (value) => {
    // Update FormContext with typing progress
    updateFormData({ 
      street: value,
      addressSelectionType: 'Manual',
      userTypedAddress: value,
      leadStage: 'Address Typing'
    });

    // Clear error message when user starts typing
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
        leadStage: 'Address Selected',
        // Add route-based campaign data for CRM consistency with dynamic content
        routeBasedCampaign: campaign,    // What drives the dynamic headlines (cash, sell, value)
        routeBasedVariant: variant,      // What drives the dynamic content (A1O, B2O, etc.)
        displayedHeadline: dynamicContent.headline,  // Exact headline shown to user
        displayedSubheadline: dynamicContent.subheadline // Exact subheadline shown to user
      };
      
      // 5. Update FormContext
      updateFormData(updateData);
      
      // 6. Track address selection IMMEDIATELY (before any async operations)
      trackAddressSelected(addressData.addressSelectionType);
      console.log('✅ GTM addressSelected event fired immediately');
      
      // 7. Start address CRM save in background (non-blocking for instant navigation)
      try {
        console.log('🚀 Starting background address CRM save - navigating instantly...');
        
        // Save only address data (no autofill data)
        const addressOnlyData = {
          ...addressData
        };
        
        // Start CRM save in background - doesn't block navigation
        // Using a detached promise that won't be cancelled by component unmount
        Promise.resolve().then(async () => {
          try {
            await leadService.saveAddressData(addressOnlyData);
            console.log('✅ Background address CRM save completed successfully');
          } catch (error) {
            console.error('❌ Background address CRM save failed:', error);
            // Could retry or queue for later if needed
          }
        });
        
      } catch (error) {
        console.error('❌ Address CRM save initialization failed:', error);
      }

      // 7. Start independent API lookups in background (non-blocking)
      (async () => {
        try {
          // Import services
          const { melissaService } = await import('../../../services/melissa.js');
          const { lookupAndSave: batchDataLookupAndSave } = await import('../../../services/batchdata.js');
          
          // Start Melissa lookup independently and fire GTM event immediately when it returns
          melissaService.lookupAndSave(placeDetails.formatted_address)
            .then(melissaData => {
              console.log('🔍 Melissa returned data:', {
                hasData: !!melissaData,
                apiEstimatedValue: melissaData?.apiEstimatedValue,
                dataStructure: melissaData ? Object.keys(melissaData) : 'null'
              });
              
              if (melissaData?.apiEstimatedValue) {
                console.log('🔥 Melissa returned data - firing GTM api_value event immediately');
                
                // Track Facebook property value
                trackPropertyValue(melissaData);
                
                // GTM tracking for "api_value" event (exact copy from original) - IMMEDIATE
                trackPropertyApiValue(melissaData, placeDetails.formatted_address, formData);
              } else {
                console.log('⚠️ Melissa data missing apiEstimatedValue - not firing GTM event', melissaData);
              }
                
              // Generate AI report in background if property record is available
              if (melissaData?.propertyRecord) {
                (async () => {
                  try {
                    console.log('🤖 AddressForm: Starting background AI report generation...');
                    
                    // Set up 30-second timeout for AI generation
                    const aiTimeout = new Promise((_, reject) => {
                      setTimeout(() => {
                        reject(new Error('AI report generation timed out after 30 seconds'));
                      }, 30000);
                    });
                    
                    // Dynamic import to avoid loading OpenAI service unless needed
                    const { generateAIValueBoostReport } = await import('../../../services/openai');
                    
                    // Race between AI generation and timeout
                    // Extract campaign type from current route/context for appropriate report type
                    const currentCampaign = window.location.pathname.includes('/cash') ? 'cash' :
                                           window.location.pathname.includes('/sell') ? 'sell' :
                                           window.location.pathname.includes('/fsbo') ? 'fsbo' :
                                           window.location.pathname.includes('/buy') ? 'buy' : 'value';
                    
                    const generatedReport = await Promise.race([
                      generateAIValueBoostReport(melissaData, currentCampaign),
                      aiTimeout
                    ]);
                    
                    console.log('✅ AddressForm: AI report generated successfully');
                    
                    // Save to FormContext and localStorage for universal access
                    updateFormData({ aiHomeReport: generatedReport });
                    localStorage.setItem('aiHomeReport', generatedReport);
                    
                  } catch (error) {
                    console.error('❌ AddressForm: AI report generation failed:', error);
                    // Don't block user flow - AI report is optional
                  }
                })();
              }
            })
            .catch(error => {
              console.error('❌ Melissa lookup failed:', error);
            });
          
          // Start BatchData lookup independently (doesn't block GTM events)
          batchDataLookupAndSave(placeDetails.formatted_address)
            .then(() => {
              console.log('✅ BatchData lookup completed');
            })
            .catch(error => {
              console.error('❌ BatchData lookup failed:', error);
            });
        } catch (error) {
          console.error('❌ Independent API lookups failed:', error);
        }
      })();
      
    
      



      
      // 8. Reset Google session
      googlePlacesService.resetSessionToken();
      
      // 9. Navigate to next step
      trackFormStepComplete(1, 'Address Form', formData);
      handleStepNavigation();
      
      // 10. Start background property lookups (non-blocking)
      propertyService.startIndependentLookups(placeDetails.formatted_address, updateFormData);







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
  // handleAddressAutofill function removed - autofill disabled

  // ===== BUTTON CLICK HANDLER =====
  const handleButtonClick = async (e) => {
    e.preventDefault();
    
    // BLOCK MANUAL SUBMISSIONS - Force Google Places selection like original
    setErrorMessage('Please continue typing and select a valid address from the dropdown suggestions');
    
    // Keep focus on the input field instead of scrolling
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // ===== ENTER KEY HANDLER =====
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // BLOCK MANUAL SUBMISSIONS - Force Google Places selection like original  
      setErrorMessage('Please continue typing and select a valid address from the dropdown suggestions');
      
      // Keep focus on the input field instead of scrolling
      if (inputRef.current) {
        inputRef.current.focus();
      }
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

              <h2 
                className="vb-box-headline"
                dangerouslySetInnerHTML={{ __html: dynamicContent.potentialHeadline }}
              />

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
            
            {/* Input container with inline error */}
            <div className="vb-af1-input-container">
              <input
                ref={inputRef}
                type="text"
                name="address-line1"
                autoComplete="off"
                placeholder="Enter your property address"
                className={errorMessage ? 'vb-af1-address-input-invalid' : 'vb-af1-address-input'}
                onChange={(e) => handleAddressInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Enter your property address'}
                disabled={isLoading}
              />
              
              {/* Inline error message */}
              {errorMessage && (
                <div className="vb-af1-inline-error">
                  Please continue typing and select from the drop down
                </div>
              )}
            </div>

            {/* HIDDEN AUTOFILL FIELDS - DISABLED */}

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
            onClick={(e) => {
              e.preventDefault();
              console.log('AddressForm contact button clicked!');
              // Multiple scroll methods for maximum compatibility
              window.scrollTo(0, 0);
              document.body.scrollTop = 0;
              document.documentElement.scrollTop = 0;
            }}
          >
            {dynamicContent.contactButtonText}
          </button>
          <div className="vb-af-phone-section">
            <a href="tel:+14046714628" className="vb-af-phone-link">
              <div className="vb-af-phone-container">
                <div className="vb-af-phone-icon">
                  <BsTelephoneFill />
                </div>
                <div className="vb-af-phone-number">(404) 671-4628</div>
              </div>
            </a>
          </div>
        </div>

        {/* BELOW FOLD CONTENT */}
        <BelowFold />
        
      </div>
    </div>
  );
}

export default AddressForm;