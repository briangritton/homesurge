import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import { validateAddress } from '../../../utils/validation.js';
import { trackAddressSelected, trackFormStepComplete, trackFormError } from '../../../services/analytics';
import { trackPropertyValue } from '../../../services/facebook';
import { lookupPropertyInfo } from '../../../services/maps.js';
import { lookupPhoneNumbers } from '../../../services/batchdata.js';
import { updateLeadInFirebase } from '../../../services/firebase.js';
import { generateAIValueBoostReport } from '../../../services/openai';
// Removed formatSubheadline, formatText - using CSS text-wrap: pretty instead
import gradientArrow from '../../../assets/images/gradient-arrow.png';
import waveImage from '../../../assets/images/wave.png';

// CSS for visually hidden fields
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

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  
  // State for AI animation loading and fade-in effect
  const [aiAnimationLoaded, setAiAnimationLoaded] = useState(false);
  const [showAiAnimation, setShowAiAnimation] = useState(false);
  
  // Defer AI animation loading until after page is ready
  useEffect(() => {
    // Wait for page to be fully loaded before starting animation load
    const timer = setTimeout(() => {
      setShowAiAnimation(true);
      // For CSS animation, trigger loaded state immediately
      setTimeout(() => setAiAnimationLoaded(true), 100);
    }, 1000); // 1 second delay to let page content load first
    
    return () => clearTimeout(timer);
  }, []);
  
  // ================================================================================
  // DYNAMIC CONTENT SYSTEM - VALUEBOOST TEMPLATES
  // ================================================================================
  // 
  // EDITING INSTRUCTIONS:
  // - All content templates are defined here in this component
  // - To add new templates, add them to the templates object below
  // - To modify existing content, edit the template objects
  // - Campaign tracking still handled by FormContext
  //
  // ================================================================================
  
  const getDynamicContent = () => {
    // Read campaign name directly from URL
    const urlParams = new URLSearchParams(window.location.search);
    const possibleParamNames = ['campaign_name', 'campaignname', 'campaign-name', 'utm_campaign'];
    
    let campaignName = '';
    for (const paramName of possibleParamNames) {
      const value = urlParams.get(paramName);
      if (value) {
        campaignName = value;
        break;
      }
    }
    
    // ================= UNIVERSAL DYNAMIC CONTENT TEMPLATES ===================
    // COMPREHENSIVE TEMPLATES - ValueBoost + Form Funnel campaigns
    // ================= ADD NEW CAMPAIGNS HERE ===================
    const templates = {
      // ========== CASH/SELLING CAMPAIGNS (From Form Funnel) ==========
      cash: {
        headline: 'Need to Sell Your Home Extremely Fast?',
        subheadline: 'OfferBoost AI home scan will look for your <strong><em>maximum cash offer</em></strong>. Close in 7 days. No showings, no repairs, no stress',
        buttonText: 'CHECK CASH OFFER',
        exampleTag: 'Example OfferBoost Increase*',
        potentialHeadline: 'Your OfferBoost Potential:',
        opportunitiesText: '11 OfferBoost opportunities found!',
        percentageText: 'Potential Cash Offer Increase'
      },
      
      fast: {
        headline: 'Need to Sell Your Home Extremely Fast?',
        subheadline: 'OfferBoost AI home scan will look for your <strong><em>fastest maximum offer</em></strong>. Close in 7 days. No showings, no repairs, no stress',
        buttonText: 'CHECK FAST OFFER',
        exampleTag: 'Example OfferBoost Increase*',
        potentialHeadline: 'Your OfferBoost Potential:',
        opportunitiesText: '11 OfferBoost opportunities found!',
        percentageText: 'Potential Cash Offer Increase'
      },

        wide: {
        headline: 'Want to Sell Your House Fast?',
        subheadline: 'OfferBoost AI home scan will look for your <strong><em>fastest maximum offer</em></strong>. Close in as little as 7 days. No showings, no repairs, no stress',
        buttonText: 'CHECK FAST OFFERS',
        exampleTag: 'Example OfferBoost Increase*',
        potentialHeadline: 'Your OfferBoost Potential:',
        opportunitiesText: '11 OfferBoost opportunities found!',
        percentageText: 'Potential Cash Offer Increase'
      },
      
      // ========== VALUE/IMPROVEMENT CAMPAIGNS (Enhanced ValueBoost) ==========
      value: {
        headline: 'Maximize Your Home Value With ValueBoost AI',
        subheadline: 'ValueBoost AI home scan will look for your <strong><em>maximum home value</em></strong> with FREE AI personalized opportunity recommendations!',
        buttonText: 'GET VALUE REPORT',
        exampleTag: 'Example ValueBoost Increase*',
        potentialHeadline: 'Your ValueBoost Potential:',
        opportunitiesText: '11 ValueBoost opportunities found!',
        percentageText: 'Potential Home Value Increase'
      },
      
      valueboost: {
        headline: 'Unlock Your Property\'s Maximum Value',
        subheadline: 'AI analysis reveals exactly which improvements will boost your home value the most',
        buttonText: 'START VALUE ANALYSIS',
        exampleTag: 'Example ValueBoost Increase*',
        potentialHeadline: 'Your ValueBoost Potential:',
        opportunitiesText: '11 ValueBoost opportunities found!',
        percentageText: 'Potential Home Value Increase'
      },
      
      boost: {
        headline: 'Boost Your Home Value Instantly',
        subheadline: 'AI-powered analysis reveals hidden value in your home. Get your personalized enhancement plan now!',
        buttonText: 'BOOST MY VALUE',
        exampleTag: 'Example ValueBoost Increase*',
        potentialHeadline: 'Your ValueBoost Potential:',
        opportunitiesText: '11 ValueBoost opportunities found!',
        percentageText: 'Potential Home Value Increase'
      },
      
      equity: {
        headline: 'Unlock Hidden Home Equity',
        subheadline: 'Find out how much equity you could gain with strategic home improvements guided by AI.',
        buttonText: 'UNLOCK EQUITY',
        exampleTag: 'Example ValueBoost Increase*',
        potentialHeadline: 'Your ValueBoost Potential:',
        opportunitiesText: '11 ValueBoost opportunities found!',
        percentageText: 'Potential Home Value Increase'
      },
      
      // ========== DEFAULT FALLBACK ==========
      default: {
        headline: 'Need to Sell Your Home Extremely Fast?',
        subheadline: 'OfferBoost AI home scan will look for your <strong><em>maximum cash offer</em></strong>. Close in 7 days. No showings, no repairs, no stress',
        buttonText: 'CHECK CASH OFFER',
        exampleTag: 'Example OfferBoost Increase*',
        potentialHeadline: 'Your OfferBoost Potential:',
        opportunitiesText: '11 OfferBoost opportunities found!',
        percentageText: 'Potential Cash Offer Increase'
      }
    };
    
    // ================= CAMPAIGN MATCHING LOGIC ===================
    // ENHANCED MATCHING - Supports both Value and Cash campaigns
    // Priority: cash > sellfast > fast > value > valueboost > boost > equity
    if (campaignName) {
      const simplified = campaignName.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      // CASH/SELLING CAMPAIGN MATCHING (Highest priority)
      if (simplified.includes('cash')) return templates.cash;
      if (simplified.includes('sellfast') || simplified.includes('sell_fast')) return templates.sellfast;
      if (simplified.includes('wide')) return templates.wide;
      if (simplified.includes('fast')) return templates.fast;
      
      // VALUE/IMPROVEMENT CAMPAIGN MATCHING
      if (simplified.includes('valueboost') || simplified.includes('value_boost')) return templates.valueboost;
      if (simplified.includes('value')) return templates.value;
      if (simplified.includes('boost')) return templates.boost;
      if (simplified.includes('equity')) return templates.equity;
    }
    
    return templates.default;
  };
  
  const dynamicContent = getDynamicContent();
  
  // Scroll to top when component loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [firstSuggestion, setFirstSuggestion] = useState(null);
  const [suggestionTimer, setSuggestionTimer] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [lastTypedAddress, setLastTypedAddress] = useState('');
  
  // Reference to the main input 
  const inputRef = useRef(null);
  
  // Reference to autocomplete instance
  const autocompleteRef = useRef(null);
  
  // Reference to session token
  const sessionTokenRef = useRef(null);
  
  // Reference to the form element
  const formRef = useRef(null);
  
  // Reference to autocomplete service
  const autocompleteServiceRef = useRef(null);
  
  // Flag to track if we've already saved a final selection
  const finalSelectionSavedRef = useRef(false);
  
  // Track browser autofill and capture name and phone when available
  const [lastStreetValue, setLastStreetValue] = useState('');
  const [autofillDetected, setAutofillDetected] = useState(false);
  
  
  // Generate a session token for Google Places API
  const generateSessionToken = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return null;
    }
    return new window.google.maps.places.AutocompleteSessionToken();
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const value = e.target.value;
    const fieldName = e.target.name;
    
    // Check if this might be browser autofill
    if (fieldName === 'address-line1') {
      // If the value changes significantly in one update, it might be autofill
      if (value.length > 0 && Math.abs(value.length - lastStreetValue.length) > 5) {
        setAutofillDetected(true);
      }
      
      setLastStreetValue(value);
      
      updateFormData({ 
        street: value,
        addressSelectionType: 'Manual',
        userTypedAddress: value  // Always track what the user is typing
      });
      
      // Keep track of the latest typed address
      setLastTypedAddress(value);
      
      // Clear error message when user starts typing
      if (errorMessage) {
        setErrorMessage('');
      }
      
      // Clear any existing suggestion timers
      if (suggestionTimer) {
        clearTimeout(suggestionTimer);
      }
      
      // If the user has typed more than 2 characters, request address predictions
      if (value.length >= 2 && googleApiLoaded && autocompleteServiceRef.current) {
        // Set a timer to avoid too many API calls
        const timer = setTimeout(() => {
          autocompleteServiceRef.current.getPlacePredictions({
            input: value,
            sessionToken: sessionTokenRef.current,
            componentRestrictions: { country: 'us' },
            types: ['address']
          }, async (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
              // Store the first suggestion for potential use if user doesn't select one
              setFirstSuggestion(predictions[0]);
              
              // Store all suggestions for UI only
              setAddressSuggestions(predictions);
              
              // Only update user typed address in form data
              const preparedData = {
                userTypedAddress: value,
                leadStage: 'Address Typing'
              };
              
              // Update the form data with suggestions only, don't update the street/address fields
              updateFormData(preparedData);
            } else {
              setFirstSuggestion(null);
              setAddressSuggestions([]);
            }
          });
        }, 500); // 500ms debounce to prevent too many API calls
        
        setSuggestionTimer(timer);
      } else if (value.length < 2) {
        // Clear first suggestion if input is too short
        setFirstSuggestion(null);
        setAddressSuggestions([]);
      }
    } else {
      // For autofill fields (name, phone), only save as autofilled data
      const updateField = {};
      if (fieldName === 'name') {
        // Only store as autofilled name, not primary name
        updateField.autoFilledName = value;
        updateField.nameWasAutofilled = true; // Flag to track autofill status
      }
      if (fieldName === 'tel') {
        // Only store as autofilled phone, not primary phone
        updateField.autoFilledPhone = value;
      }
      
      updateFormData(updateField);
    }
  };
  
  // Track browser autofill events with comprehensive address auto-submission
  useEffect(() => {
    // Keep track of which fields have been autofilled
    const autofilledFields = new Set();
    
    const handleAnimationStart = (e) => {
      // In Chrome, autocomplete fields will have animation-name: onAutoFillStart
      if (e.animationName === 'onAutoFillStart') {
        setAutofillDetected(true);
        console.log('Autofill detected on field:', e.target.name);
        
        // Add this field to our tracking set
        autofilledFields.add(e.target.name);
        
        // Check if the field that was auto-filled is name or phone
        if (e.target.name === 'name' || e.target.name === 'tel') {
          // Get the value filled in by browser
          setTimeout(() => {
            if (e.target.value) {
              console.log(`Autofilled ${e.target.name} value:`, e.target.value);
              // Update the form data with this auto-filled value
              const fieldUpdate = {};
              if (e.target.name === 'name') {
                // Only store as autofilled name, not primary name
                fieldUpdate.autoFilledName = e.target.value;
                fieldUpdate.nameWasAutofilled = true; // Flag to track autofill status
              }
              if (e.target.name === 'tel') {
                // Only store as autofilled phone, not primary phone
                fieldUpdate.autoFilledPhone = e.target.value;
              }
              
              updateFormData(fieldUpdate);
            }
          }, 100); // Small delay to ensure the browser has filled in the value
        }
        
        // Check if the address field was auto-filled
        if (e.target.name === 'address-line1') {
          // Wait a bit for the autofill to complete
          setTimeout(() => {
            if (e.target.value && e.target.value.length > 10) {
              console.log('Address autofilled with value:', e.target.value);
              
              // If the address is sufficiently filled, and we have at least one more field autofilled,
              // trigger form submission
              if (autofilledFields.size > 1 || autofilledFields.has('name') || autofilledFields.has('tel')) {
                console.log('Multiple fields autofilled, triggering form submission');
                
                // Allow time for all browser autofill data to be populated
                setTimeout(() => {
                  console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: Input field contains:', inputRef.current ? inputRef.current.value : 'not available');
                  console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: formData.street =', formData.street);
                  console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: firstSuggestion =', firstSuggestion);
                  console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: autofilledFields =', Array.from(autofilledFields));
                  
                  // Need to ensure formData is updated with the current input value
                  if (inputRef.current && inputRef.current.value) {
                    console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: Updating formData with current input value');
                    updateFormData({ street: inputRef.current.value });
                    
                    // Request suggestions for the address and process it
                    if (inputRef.current && inputRef.current.value.length > 3 && googleApiLoaded && autocompleteServiceRef.current) {
                      console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: Requesting suggestions for autofilled address');
                      
                      // Request suggestions in a separate function to avoid nesting issues
                      const getAndProcessSuggestions = () => {
                        return new Promise((resolve) => {
                          // Add timeout to prevent waiting indefinitely
                          const timeoutId = setTimeout(() => {
                            console.log('⚠️ Address suggestions request timed out after 2 seconds');
                            // Proceed with manual submission
                            resolve(false);
                          }, 2000); // 2 second timeout
                          
                          autocompleteServiceRef.current.getPlacePredictions({
                            input: inputRef.current.value,
                            sessionToken: sessionTokenRef.current,
                            componentRestrictions: { country: 'us' },
                            types: ['address']
                          }, (predictions, status) => {
                            clearTimeout(timeoutId); // Clear timeout since we got a response
                            
                            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                              console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: Got suggestions:', predictions);
                              // Store the first suggestion
                              setFirstSuggestion(predictions[0]);
                              resolve(predictions[0]);
                            } else {
                              console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: No suggestions found for:', inputRef.current.value);
                              resolve(false);
                            }
                          });
                        });
                      };
                      
                      // Get suggestions and process them
                      getAndProcessSuggestions().then(suggestion => {
                        console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: Processed suggestions:', suggestion);
                        
                        if (suggestion && suggestion.place_id) {
                          // Use the suggestion if available
                          console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: Using suggestion:', suggestion.description);
                          
                          // Get place details
                          getPlaceDetails(suggestion.place_id)
                            .then(placeDetails => {
                              if (placeDetails && placeDetails.formatted_address) {
                                console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: Got place details:', placeDetails.formatted_address);
                                
                                // Process the address selection
                                processAddressSelection(placeDetails);
                                
                                // ========================================
                                // SPLIT TEST AREA - STEP NAVIGATION
                                // Position 2: A=Show Step 2, B=Skip to Step 3
                                // ========================================
                                const urlParams = new URLSearchParams(window.location.search);
                                const splitTest = urlParams.get('split_test') || urlParams.get('variant') || 'AAA';
                                const showStep2 = splitTest[1] === 'A'; // Position 2 controls Step 2 interstitial
                                
                                if (showStep2) {
                                  nextStep(); // Go to Step 2 (AI Processing)
                                } else {
                                  // Skip Step 2, go directly to Step 3
                                  updateFormData({ formStep: 3 });
                                }
                                // ======================================== 
                                // END SPLIT TEST AREA - STEP NAVIGATION
                                // ========================================
                              } else {
                                console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: No valid place details, using button click');
                                handleButtonClick({preventDefault: () => {}, stopPropagation: () => {}});
                              }
                            })
                            .catch(error => {
                              console.error('🔍 AUTOFILL ANIMATION DIAGNOSIS: Error getting place details:', error);
                              handleButtonClick({preventDefault: () => {}, stopPropagation: () => {}});
                            });
                        } else {
                          console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: No suggestion available, using button click');
                          handleButtonClick({preventDefault: () => {}, stopPropagation: () => {}});
                        }
                      });
                    } else {
                      // If we can't get suggestions, fall back to button click
                      console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: Cannot get suggestions, using button click');
                      handleButtonClick({preventDefault: () => {}, stopPropagation: () => {}});
                    }
                  } else {
                    console.log('🔍 AUTOFILL ANIMATION DIAGNOSIS: No value in input field, using standard submission');
                    handleButtonClick({preventDefault: () => {}, stopPropagation: () => {}});
                  }
                }, 600);
              }
            }
          }, 100);
        }
      }
    };
    
    // Add CSS to detect autofill
    const style = document.createElement('style');
    style.textContent = `
      @keyframes onAutoFillStart {
        from {}
        to {}
      }
      input:-webkit-autofill {
        animation-name: onAutoFillStart;
        animation-duration: 1ms;
      }
    `;
    document.head.append(style);
    
    // Add listeners to all form fields that might be autofilled
    const addressInput = inputRef.current;
    const formInputs = formRef.current?.querySelectorAll('input');
    
    if (addressInput) {
      addressInput.addEventListener('animationstart', handleAnimationStart);
    }
    
    if (formInputs) {
      formInputs.forEach(input => {
        if (input.name === 'name' || input.name === 'tel' || input.name === 'address-line1') {
          input.addEventListener('animationstart', handleAnimationStart);
        }
      });
    }
    
    return () => {
      document.head.removeChild(style);
      if (addressInput) {
        addressInput.removeEventListener('animationstart', handleAnimationStart);
      }
      
      if (formInputs) {
        formInputs.forEach(input => {
          if (input.name === 'name' || input.name === 'tel' || input.name === 'address-line1') {
            input.removeEventListener('animationstart', handleAnimationStart);
          }
        });
      }
    };
  }, [updateFormData]);
  
  // Get place details for a prediction
  const getPlaceDetails = async (placeId) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }
      
      // Create a PlacesService instance (requires a div element)
      const placesService = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      // Add timeout to prevent waiting indefinitely
      const timeoutId = setTimeout(() => {
        console.log('⚠️ Place details request timed out after 3 seconds');
        resolve(null); // Resolve with null to allow fallback instead of rejecting
      }, 3000); // 3 second timeout
      
      placesService.getDetails({
        placeId: placeId,
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        sessionToken: sessionTokenRef.current
      }, (place, status) => {
        clearTimeout(timeoutId); // Clear the timeout since we got a response
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          console.log(`⚠️ Place details request failed: ${status}`);
          resolve(null); // Resolve with null to allow fallback instead of rejecting
        }
      });
    });
  };
  
  // Calculate ValueBoost potential based on property data - RESTORED FROM COMMIT 7335844
  const calculateValueBoostPotential = (propertyData, formData) => {
    try {
      const currentValue = propertyData.apiEstimatedValue || 0;
      if (currentValue === 0) {
        return {
          potentialValueIncrease: 0,
          formattedPotentialIncrease: '$0',
          valueIncreasePercentage: 0,
          upgradesNeeded: 5
        };
      }

      // Extract property attributes for calculation
      const propertyRecord = propertyData.propertyRecord || {};
      const yearBuilt = propertyRecord.PropertyUseInfo?.YearBuilt || propertyRecord.YearBuilt || 1980;
      const propertyAge = new Date().getFullYear() - yearBuilt;
      const squareFootage = propertyData.finishedSquareFootage || 
                           (propertyRecord.PropertySize?.AreaBuilding) || 1500;

      // Calculate base increase percentage based on property characteristics
      let baseIncreasePercentage = 0.18; // Default 18% increase

      // Older homes have higher improvement potential
      if (propertyAge > 30) {
        baseIncreasePercentage = 0.25; // 25% increase potential
      } else if (propertyAge > 15) {
        baseIncreasePercentage = 0.22; // 22% increase potential
      } else if (propertyAge < 5) {
        baseIncreasePercentage = 0.12; // 12% increase potential (newer homes)
      }

      // Adjust based on home size
      if (squareFootage > 3000) {
        baseIncreasePercentage -= 0.02;
      } else if (squareFootage < 1200) {
        baseIncreasePercentage += 0.03;
      }

      // Adjust based on neighborhood value/price point
      if (currentValue > 750000) {
        baseIncreasePercentage -= 0.03;
      } else if (currentValue < 200000) {
        baseIncreasePercentage += 0.04;
      }

      // Calculate the final increase amount
      const increaseAmount = Math.round(currentValue * baseIncreasePercentage);
      
      // Format the increase amount
      const formattedIncrease = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(increaseAmount);

      // Calculate estimated upgrades needed (5-12 upgrades typical)
      const upgradesNeeded = Math.max(5, Math.min(12, 
        Math.round(5 + (baseIncreasePercentage - 0.12) * 20)
      ));

      return {
        potentialValueIncrease: increaseAmount,
        formattedPotentialIncrease: formattedIncrease,
        valueIncreasePercentage: Math.round(baseIncreasePercentage * 100),
        upgradesNeeded: upgradesNeeded
      };
    } catch (error) {
      console.error('Error calculating ValueBoost potential:', error);
      return {
        potentialValueIncrease: 0,
        formattedPotentialIncrease: '$0',
        valueIncreasePercentage: 0,
        upgradesNeeded: 5
      };
    }
  };
  
  // Fetch property data from Melissa API - COPIED FROM MAIN FORM  
  const fetchPropertyData = async (address) => {
    try {
      console.log('Fetching property data for address:', address);
      const propertyData = await lookupPropertyInfo(address);
      
      if (propertyData) {
        console.log('Property data received with available fields:');
        
        // Log important fields for analysis
        const keysToLog = Object.keys(propertyData).filter(key => 
          key !== 'propertyRecord'
        );
        
        console.log('Available fields in propertyData:', keysToLog);
        console.log('Complete property data for integration:', propertyData);
        
        // Format the estimated value nicely (fallback if not already formatted)
        let formattedValue = propertyData.formattedApiEstimatedValue;
        if (!formattedValue || formattedValue === '$0') {
          const estimatedValue = propertyData.apiEstimatedValue || 0;
          formattedValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(estimatedValue);
        }
        
        // Track property value obtained for Facebook audience creation
        if (propertyData.apiEstimatedValue && propertyData.apiEstimatedValue > 0) {
          // Get all campaign data from formContext
          const { 
            campaign_name, 
            campaign_id, 
            adgroup_id, 
            adgroup_name, 
            keyword, 
            gclid, 
            device, 
            traffic_source, 
            template_type 
          } = formData;
          
          console.log('Sending campaign data to Facebook PropertyValueObtained event:', {
            campaign_name,
            campaign_id,
            adgroup_name,
            keyword
          });
          
          // Send the property data to Facebook for value-based audiences with campaign data
          trackPropertyValue({
            ...propertyData,
            formattedApiEstimatedValue: formattedValue,
            address: address, // Include the address the user entered
            
            // Explicitly include campaign data
            campaign_name: campaign_name || '',
            campaign_id: campaign_id || '',
            adgroup_id: adgroup_id || '',
            adgroup_name: adgroup_name || '',
            keyword: keyword || '',
            gclid: gclid || '',
            device: device || '',
            traffic_source: traffic_source || 'Direct',
            template_type: template_type || ''
          });

          // Send to Google Analytics via dataLayer - IMMEDIATELY (no delay)
          if (window.dataLayer) {
            console.log('%c SENDING API_VALUE EVENT TO GTM', 'background: #4CAF50; color: white; font-weight: bold; padding: 4px;', {
              apiEstimatedValue: propertyData.apiEstimatedValue,
              address: address
            });

            // Create dataLayer event with the confirmed working format
            const dataLayerEvent = {
              event: 'api_value', // This exact name is expected by GTM trigger
              apiValue: propertyData.apiEstimatedValue,
              propertyAddress: address,
              formattedValue: formattedValue,
              propertyEquity: propertyData.apiEquity || 0,
              propertyEquityPercentage: propertyData.apiPercentage || 0,
              
              // Campaign parameters at top level for GTM variables
              campaign_name: formData.campaign_name || '',
              campaign_id: formData.campaign_id || '',
              adgroup_name: formData.adgroup_name || '',
              adgroup_id: formData.adgroup_id || '',
              keyword: formData.keyword || '',
              matchtype: formData.matchtype || '',
              gclid: formData.gclid || '',
              device: formData.device || '',
              traffic_source: formData.traffic_source || 'Direct',
              template_type: formData.template_type || ''
            };
            
            // Push event IMMEDIATELY with no delay
            console.log('Pushing api_value event to dataLayer:', dataLayerEvent);
            window.dataLayer.push(dataLayerEvent);
            
            // Log campaign data for debugging
            console.log('CAMPAIGN DATA IN API_VALUE EVENT:', {
              campaign_name: formData.campaign_name || '',
              campaign_id: formData.campaign_id || '',
              keyword: formData.keyword || '',
              matchtype: formData.matchtype || '',
              adgroup_name: formData.adgroup_name || '',
              adgroup_id: formData.adgroup_id || ''
            });
          }
        }

        // VALUEBOOST CALCULATION - Add back the ValueBoost calculation logic
        const valueBoostData = calculateValueBoostPotential(propertyData, formData);
        
        // Add ValueBoost calculations to form data update
        updateFormData({
          apiOwnerName: propertyData.apiOwnerName || '',
          apiEstimatedValue: propertyData.apiEstimatedValue || 0,
          apiMaxHomeValue: propertyData.apiMaxValue || 0,
          apiEquity: propertyData.apiEquity || 0,
          apiPercentage: propertyData.apiPercentage || 0,
          formattedApiEstimatedValue: formattedValue,
          mortgageAmount: propertyData.mortgageAmount || 0,
          bedrooms: propertyData.bedrooms || '',
          bathrooms: propertyData.bathrooms || '',
          finishedSquareFootage: propertyData.finishedSquareFootage || 1000,
          // If city/state/zip weren't set by Google, use Melissa data
          city: formData.city || propertyData.city || '',
          state: formData.state || propertyData.state || 'GA',
          zip: formData.zip || propertyData.zip || '',
          // Store the full property record for access to all fields
          propertyRecord: propertyData.propertyRecord,
          // ADD VALUEBOOST CALCULATIONS
          potentialValueIncrease: valueBoostData.potentialValueIncrease,
          formattedPotentialIncrease: valueBoostData.formattedPotentialIncrease,
          valueIncreasePercentage: valueBoostData.valueIncreasePercentage,
          upgradesNeeded: valueBoostData.upgradesNeeded
        });
        
        console.log('Form data updated with property info and ValueBoost calculations:', {
          estimatedValue: formattedValue,
          apiEquity: propertyData.apiEquity,
          apiPercentage: propertyData.apiPercentage,
          potentialValueIncrease: valueBoostData.potentialValueIncrease,
          valueIncreasePercentage: valueBoostData.valueIncreasePercentage
        });
        
        return propertyData;
      } else {
        console.log('No property data found for address:', address);
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
    }
    
    return null;
  };
  
  // Process address selection (whether from autocomplete or suggestion) - COPIED FROM MAIN FORM
  const processAddressSelection = async (place) => {
    if (!place || !place.formatted_address) {
      console.warn('No place data available');
      return false;
    }
    
    // Extract address components
    const addressComponents = {
      city: '',
      state: 'GA',
      zip: ''
    };
    
    if (place.address_components && place.address_components.length > 0) {
      place.address_components.forEach(component => {
        const types = component.types;
        
        if (types.includes('locality')) {
          addressComponents.city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          addressComponents.state = component.short_name;
        } else if (types.includes('postal_code')) {
          addressComponents.zip = component.long_name;
        }
      });
    }
    
    // Get location data if available
    const location = place.geometry?.location ? {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    } : null;
    
    // Update form data with selected place - preserve name, phone, and email if they exist
    updateFormData({
      street: place.formatted_address,
      city: addressComponents.city,
      state: addressComponents.state,
      zip: addressComponents.zip,
      location: location,
      addressSelectionType: autofillDetected ? 'BrowserAutofill' : 'Google',
      selectedSuggestionAddress: place.formatted_address,
      leadStage: 'Address Selected',
      // Preserve name and phone
      name: formData.name || '',
      phone: formData.phone || ''
    });
    
    // Ensure inputRef has the correct value
    if (inputRef.current) {
      inputRef.current.value = place.formatted_address;
    }
    
    // After a place is selected, we're done with this session token
    // Create a new one for the next autocomplete session
    sessionTokenRef.current = generateSessionToken();
    
    // Track the address selection in analytics
    trackAddressSelected('Google');
    
    // Clear any error messages
    setErrorMessage('');
    
    // Get existing lead ID from localStorage
    const existingLeadId = localStorage.getItem('leadId');
    
    // Create or update lead with the final selection and address data
    try {
      // Get campaign data from formContext
      const { campaign_name, campaign_id, adgroup_id, adgroup_name, keyword, gclid, device, traffic_source, template_type } = formData;
      
      console.log("%c ValueBoost AddressForm - Campaign Data Check", "background: #ff9800; color: black; font-size: 12px; padding: 4px;");
      console.log("Campaign Data in FormContext:", {
        campaign_name,
        campaign_id,
        adgroup_id, 
        adgroup_name,
        keyword,
        gclid,
        device,
        traffic_source,
        template_type
      });
      
      // Prepare data for the lead - COPIED FROM MAIN FORM
      const finalSelectionData = {
        // Use the proper field names that will map to Firebase
        street: place.formatted_address,
        city: addressComponents.city,
        state: addressComponents.state,
        zip: addressComponents.zip,
        
        // Send empty primary fields but include autofilled data
        name: '',  // Force empty - don't use formData.name during autofill
        phone: '', // Force empty - don't use formData.phone during autofill
        
        // Include autofilled values for CRM reference
        autoFilledName: formData.autoFilledName || '',
        autoFilledPhone: formData.autoFilledPhone || '',
        
        userTypedAddress: lastTypedAddress,
        selectedSuggestionAddress: place.formatted_address,
        addressSelectionType: autofillDetected ? 'BrowserAutofill' : 'Google',
        leadStage: 'Address Selected',
        
        // Explicitly add campaign data to ensure it's passed to Firebase
        campaign_name: campaign_name || '',
        campaign_id: campaign_id || '',
        adgroup_id: adgroup_id || '',
        adgroup_name: adgroup_name || '',
        keyword: keyword || '',
        gclid: gclid || '',
        device: device || '',
        traffic_source: traffic_source || 'Direct',
        template_type: template_type || '',
        dynamicHeadline: formData.dynamicHeadline || '',
        dynamicSubHeadline: formData.dynamicSubHeadline || '',
        buttonText: formData.buttonText || ''
      };
      
      console.log('Sending address components to Firebase:', {
        street: finalSelectionData.street,
        city: finalSelectionData.city,
        state: finalSelectionData.state,
        zip: finalSelectionData.zip
      });
      
      // Update existing lead (should always exist with immediate lead creation)
      let leadId;
      
      if (existingLeadId) {
        // Update existing lead with address data
        await updateLeadInFirebase(existingLeadId, finalSelectionData);
        leadId = existingLeadId;
        console.log('Updated lead with final selection in Firebase:', leadId);
      } else {
        // This should not happen with immediate lead creation, but add fallback
        console.error('❌ No existing lead found - this should not happen with immediate lead creation');
        console.log('🔍 FormData for debugging:', {
          name: formData.name,
          autoFilledName: formData.autoFilledName,
          phone: formData.phone,
          autoFilledPhone: formData.autoFilledPhone,
          campaign_name: formData.campaign_name
        });
        
        // Continue without blocking user, but log the issue
        leadId = null;
      }
      
      if (leadId) {
        // Set in localStorage (only one key needed)
        localStorage.setItem('leadId', leadId);
        
        // Now we've saved the final selection
        finalSelectionSavedRef.current = true;
        
        // Note: Notifications are now handled automatically by the centralized notification system
        // in FormContext via the useNotifications hook
      }
    } catch (error) {
      console.error('Error sending address data to Firebase:', error);
    }
    
    // Fetch property data and phone numbers in the background - don't await this
    // These APIs run unconditionally to ensure best user experience
    const leadId = localStorage.getItem('leadId');
    fetchPropertyDataInBackground(place.formatted_address, leadId, addressComponents);
    lookupPhoneNumbersInBackground(place.formatted_address, leadId, addressComponents);
    
    // Start OpenAI report generation in background when property data becomes available
    startOpenAIGenerationInBackground(leadId);
    
    return true; // Return success immediately without waiting for API
  };
  
  // Non-blocking version of address selection processing - COPIED FROM MAIN FORM
  const processAddressSelectionNonBlocking = (place) => {
    // This runs all the same logic as processAddressSelection but without blocking awaits
    console.log('🔄 Processing address selection in background (non-blocking)');
    
    // Run the original processAddressSelection without awaiting
    processAddressSelection(place)
      .then(() => {
        console.log('✅ Background address selection processing completed');
      })
      .catch(error => {
        console.error('❌ Background address selection failed:', error);
        // Don't block user flow on Firebase errors
      });
  };

  // Process address selection in background - prioritize for property valuation - COPIED FROM MAIN FORM
  const processAddressInBackground = async (suggestion) => {
    try {
      console.log('🔄 Starting background address processing for:', suggestion.description);
      
      // Step 1: Get Google Places details (with existing 3-second timeout)
      const placeDetails = await getPlaceDetails(suggestion.place_id);
      
      if (placeDetails && placeDetails.formatted_address) {
        console.log('✅ Got enhanced address details:', placeDetails.formatted_address);
        
        // Update form data with enhanced address for better property API results
        updateFormData({
          street: placeDetails.formatted_address,
          selectedSuggestionAddress: placeDetails.formatted_address,
          userTypedAddress: lastTypedAddress,
          addressSelectionType: 'ButtonClick'
        });
        
        // Update the input field with enhanced address
        if (inputRef.current) {
          inputRef.current.value = placeDetails.formatted_address;
        }
        
        // Step 2: Process address selection (Firebase + Property APIs) - non-blocking
        processAddressSelectionNonBlocking(placeDetails);
      } else {
        console.log('⚠️ Google Places failed, proceeding with basic address');
        
        // Fallback: Process with basic suggestion data
        const fallbackPlace = {
          formatted_address: suggestion.description,
          address_components: []
        };
        
        processAddressSelectionNonBlocking(fallbackPlace);
      }
    } catch (error) {
      console.error('❌ Background address processing failed:', error);
      
      // Fallback: Still try to process with basic data
      try {
        const fallbackPlace = {
          formatted_address: suggestion.description,
          address_components: []
        };
        processAddressSelectionNonBlocking(fallbackPlace);
      } catch (fallbackError) {
        console.error('❌ Fallback address processing also failed:', fallbackError);
      }
    }
  };

  // Lookup phone numbers in background without blocking the UI - COPIED FROM MAIN FORM
  // Generate OpenAI report in background when property data becomes available
  const startOpenAIGenerationInBackground = (leadId) => {
    console.log('🤖 Starting OpenAI monitoring from AddressForm...');
    
    // Monitor for Melissa API data updates and generate report when ready
    const checkForMelissaDataAndGenerateAI = () => {
      // Check if we have received Melissa API data
      if (formData.apiEstimatedValue && formData.apiEstimatedValue > 0) {
        console.log('📊 Melissa API data detected in AddressForm, triggering AI report generation');
        
        // Generate AI report now that we have property data
        generateAIReportInBackground(formData, leadId);
        return true; // Stop monitoring
      }
      return false; // Continue monitoring
    };
    
    // Check initially
    if (checkForMelissaDataAndGenerateAI()) {
      return; // Data already available
    }
    
    // Poll every 500ms for Melissa data updates (max 30 seconds)
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds
    const interval = setInterval(() => {
      attempts++;
      
      if (checkForMelissaDataAndGenerateAI() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts) {
          console.log('⚠️ OpenAI generation timeout - Melissa data not received');
        }
      }
    }, 500);
  };
  
  // Generate AI report in background without blocking UI
  const generateAIReportInBackground = async (propertyData, leadId) => {
    try {
      console.log('🤖 Starting OpenAI report generation in AddressForm...');
      
      // Prepare property context for AI
      const propertyContext = {
        address: propertyData.street || formData.street,
        estimatedValue: propertyData.apiEstimatedValue || formData.apiEstimatedValue,
        bedrooms: propertyData.bedrooms || formData.bedrooms || '',
        bathrooms: propertyData.bathrooms || formData.bathrooms || '',
        squareFootage: propertyData.finishedSquareFootage || formData.finishedSquareFootage || '',
        potentialIncrease: propertyData.potentialValueIncrease || formData.potentialValueIncrease,
        upgradesNeeded: propertyData.upgradesNeeded || formData.upgradesNeeded || 8
      };

      // Use actual OpenAI API to generate personalized report
      const aiReport = await generateAIValueBoostReport(propertyContext);
      
      console.log('✅ AI report generated successfully in AddressForm');
      
      // Store report in localStorage for Step 3
      localStorage.setItem('aiHomeReport', aiReport);
      
      // Update Firebase with AI report
      if (leadId) {
        await updateLeadInFirebase(leadId, {
          aiHomeReport: aiReport,
          aiReportGeneratedAt: new Date().toISOString()
        });
        console.log('✅ AI report saved to Firebase from AddressForm');
      }
      
    } catch (error) {
      console.error('❌ Error generating AI report in AddressForm:', error);
      // Silently fail - user flow continues normally
    }
  };

  const lookupPhoneNumbersInBackground = (address, leadId, addressComponents) => {
    // Start the phone number lookup in background
    lookupPhoneNumbers({
      street: address,
      city: addressComponents.city || '',
      state: addressComponents.state || '',
      zip: addressComponents.zip || ''
    })
      .then(phoneData => {
        // If we got phone data, update the lead with this information
        if (phoneData && leadId && (phoneData.phoneNumbers.length > 0 || phoneData.emails.length > 0)) {
          try {
            // Get campaign data from formContext 
            const { campaign_name, campaign_id, adgroup_id, adgroup_name, keyword, gclid, device, traffic_source, template_type } = formData;
            
            console.log("%c BACKGROUND: BATCHDATA PHONE UPDATE TO FIREBASE", "background: #4caf50; color: white; font-size: 14px; padding: 5px;");
            
            // Create an update object with the phone numbers
            const phoneUpdateData = {
              // IMPORTANT: Keep BatchData phone numbers separate from user input
              // These are stored in separate fields and won't overwrite user-entered data
              batchDataPhoneNumbers: phoneData.phoneNumbers,
              batchDataEmails: phoneData.emails,
              
              // CRITICAL: Include ALL campaign data with phone update
              campaign_name: campaign_name || '',
              campaign_id: campaign_id || '',
              adgroup_id: adgroup_id || '',
              adgroup_name: adgroup_name || '',
              keyword: keyword || '',
              gclid: gclid || '',
              device: device || '',
              traffic_source: traffic_source || 'Direct',
              template_type: template_type || '',
              
              // Set a flag to indicate BatchData was processed
              batchDataProcessed: true,
              
              // Include timestamp for when this was processed
              batchDataProcessedAt: new Date().toISOString()
            };
            
            // Update the lead with phone data
            updateLeadInFirebase(leadId, phoneUpdateData)
              .then(() => console.log('Background: Successfully updated lead with BatchData phone numbers'))
              .catch(err => console.error('Background: Error updating lead with phone numbers:', err));
            
          } catch (error) {
            console.error('Background: Error handling phone data:', error);
          }
        } else {
          console.log('No BatchData phone numbers found or lead ID not available');
        }
      })
      .catch(error => {
        console.error('Background: Error fetching BatchData phone numbers:', error);
      });
  };
  
  // Process property data in background without blocking the UI - COPIED FROM MAIN FORM
  const fetchPropertyDataInBackground = (address, leadId, addressComponents) => {
    // Start the property data fetch in background
    fetchPropertyData(address)
      .then(propertyData => {
        // If we got property data, update the lead with this information
        if (propertyData && leadId) {
          try {
            // Get campaign data from formContext 
            const { campaign_name, campaign_id, adgroup_id, adgroup_name, keyword, gclid, device, traffic_source, template_type } = formData;
            
            console.log("%c BACKGROUND: PROPERTY DATA UPDATE TO FIREBASE", "background: #4caf50; color: white; font-size: 14px; padding: 5px;");
            
            // Update the lead with property data AND campaign data
            const propertyUpdateData = {
              // Include the address components again to ensure they are saved
              street: address,
              city: addressComponents.city,
              state: addressComponents.state,
              zip: addressComponents.zip,
              
              // Send empty primary fields but include autofilled data
              name: '',  // Force empty during autofill
              phone: '', // Force empty during autofill  
              email: formData.email || '',
              
              // Include property data
              apiOwnerName: propertyData.apiOwnerName || '',
              apiEstimatedValue: propertyData.apiEstimatedValue?.toString() || '0',
              apiMaxHomeValue: propertyData.apiMaxValue?.toString() || '0',
              apiEquity: propertyData.apiEquity?.toString() || '0',
              apiPercentage: propertyData.apiPercentage?.toString() || '0',
              apiHomeValue: propertyData.apiEstimatedValue?.toString() || '0',
              // Add these duplicate field names for consistency
              propertyEquity: propertyData.apiEquity?.toString() || '0', 
              equityPercentage: propertyData.apiPercentage?.toString() || '0',
              
              // Include autofilled values in background update
              autoFilledName: formData.autoFilledName || formData.name || '',
              autoFilledPhone: formData.autoFilledPhone || formData.phone || '',
              autoFilledEmail: formData.autoFilledEmail || formData.email || '',
              
              // CRITICAL: Include ALL campaign data with property update
              campaign_name: campaign_name || '',
              campaign_id: campaign_id || '',
              adgroup_id: adgroup_id || '',
              adgroup_name: adgroup_name || '',
              keyword: keyword || '',
              gclid: gclid || '',
              device: device || '',
              traffic_source: traffic_source || 'Direct',
              template_type: template_type || '',
              matchtype: formData.matchtype || '',
              url: formData.url || window.location.href || '',
              
              // Include dynamic content information
              dynamicHeadline: formData.dynamicHeadline || '',
              dynamicSubHeadline: formData.dynamicSubHeadline || '',
              buttonText: formData.buttonText || '',
              
              // Set a special flag for debugging
              dataSourceComplete: true
            };
            
            // Update the lead with property data
            updateLeadInFirebase(leadId, propertyUpdateData)
              .then(() => console.log('Background: Successfully updated lead with API property data'))
              .catch(err => console.error('Background: Error updating lead with property data:', err));
            
          } catch (error) {
            console.error('Background: Error handling property data:', error);
          }
        }
      })
      .catch(error => {
        console.error('Background: Error fetching property data:', error);
      });
  };
  
  // Completely separate function for handling Enter key presses
  const handleEnterKeyPress = async (e) => {
    // Always prevent default - critical!
    e.preventDefault();
    e.stopPropagation();
    
    // If already loading, prevent action
    if (isLoading) return;
    
    // Set loading immediately
    setIsLoading(true);
    
    try {
      // Make sure we have enough characters to get suggestions
      if (formData.street.length < 2) {
        setErrorMessage('Please enter a valid address');
        setIsLoading(false);
        return;
      }
      
      // If we already have a first suggestion, use it
      if (firstSuggestion && firstSuggestion.place_id) {
        console.log('Using first suggestion:', firstSuggestion.description);
        
        // Update form data immediately with suggestion description
        updateFormData({
          street: firstSuggestion.description,
          selectedSuggestionAddress: firstSuggestion.description,
          userTypedAddress: lastTypedAddress,
          addressSelectionType: 'EnterKey'
        });
        
        // Proceed to next step immediately - don't wait for APIs
        trackFormStepComplete(1, 'Address Form Completed (Enter Key)', formData);
        
        // ========================================
        // SPLIT TEST AREA - STEP NAVIGATION
        // Position 2: A=Show Step 2, B=Skip to Step 3
        // ========================================
        const urlParams = new URLSearchParams(window.location.search);
        const splitTest = urlParams.get('split_test') || urlParams.get('variant') || 'AAA';
        const showStep2 = splitTest[1] === 'A'; // Position 2 controls Step 2 interstitial
        
        if (showStep2) {
          nextStep(); // Go to Step 2 (AI Processing)
        } else {
          // Skip Step 2, go directly to Step 3
          updateFormData({ formStep: 3 });
        }
        // ======================================== 
        // END SPLIT TEST AREA - STEP NAVIGATION
        // ========================================
        setIsLoading(false);
        
        // Start background API processing - prioritize for property valuation
        processAddressInBackground(firstSuggestion);
        
        return;
      }
      
      // If address text is reasonable length, allow form to proceed anyway
      // This provides a fallback if Google Places API fails
      if (formData.street && formData.street.length > 10 && validateAddress(formData.street)) {
        console.log('No suggestion available, but address text is reasonable - proceeding anyway');
        
        // Start API call in background
        const addressComponents = {
          city: '',
          state: 'GA',
          zip: ''
        };
        const leadId = localStorage.getItem('leadId');
        if (leadId) {
          fetchPropertyDataInBackground(formData.street, leadId, addressComponents);
        }
        trackFormStepComplete(1, 'Address Form Completed (Fallback)', formData);
        
        // ========================================
        // SPLIT TEST AREA - STEP NAVIGATION
        // Position 2: A=Show Step 2, B=Skip to Step 3
        // ========================================
        const urlParams = new URLSearchParams(window.location.search);
        const splitTest = urlParams.get('split_test') || urlParams.get('variant') || 'AAA';
        const showStep2 = splitTest[1] === 'A'; // Position 2 controls Step 2 interstitial
        
        if (showStep2) {
          nextStep(); // Go to Step 2 (AI Processing)
        } else {
          // Skip Step 2, go directly to Step 3
          updateFormData({ formStep: 3 });
        }
        // ======================================== 
        // END SPLIT TEST AREA - STEP NAVIGATION
        // ========================================
        setIsLoading(false);
        
        return;
      } else {
        // Only show error for short addresses
        setErrorMessage('Please enter a complete address or select from dropdown suggestions');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error handling Enter key:', error);
      setIsLoading(false);
      setErrorMessage('An error occurred. Please try again or click the Get Report button.');
    }
  };

  // Handle button click
  const handleButtonClick = async (e) => {
    // Always prevent default form submission
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Button clicked - ValueBoost');
    
    // If already loading, prevent action
    if (isLoading) return;
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Make sure we have enough characters to get suggestions
      if (formData.street.length < 2) {
        setErrorMessage('Please enter a valid address');
        setIsLoading(false);
        return;
      }
      
      // If we have a first suggestion, use it
      if (firstSuggestion && firstSuggestion.place_id) {
        console.log('Using first suggestion:', firstSuggestion.description);
        
        // Update form data immediately with suggestion description
        updateFormData({
          street: firstSuggestion.description,
          selectedSuggestionAddress: firstSuggestion.description,
          userTypedAddress: lastTypedAddress,
          addressSelectionType: 'ButtonClick'
        });
        
        // Proceed to next step immediately - don't wait for APIs
        trackFormStepComplete(1, 'Address Form Completed (Google Suggestion)', formData);
        
        // ========================================
        // SPLIT TEST AREA - STEP NAVIGATION
        // Position 2: A=Show Step 2, B=Skip to Step 3
        // ========================================
        const urlParams = new URLSearchParams(window.location.search);
        const splitTest = urlParams.get('split_test') || urlParams.get('variant') || 'AAA';
        const showStep2 = splitTest[1] === 'A'; // Position 2 controls Step 2 interstitial
        
        if (showStep2) {
          nextStep(); // Go to Step 2 (AI Processing)
        } else {
          // Skip Step 2, go directly to Step 3
          updateFormData({ formStep: 3 });
        }
        // ======================================== 
        // END SPLIT TEST AREA - STEP NAVIGATION
        // ========================================
        setIsLoading(false);
        
        // Start background API processing - prioritize for property valuation
        processAddressInBackground(firstSuggestion);
        
        return;
      }
      
      // If no suggestion and address validation passes, proceed with what we have
      if (validateAddress(formData.street)) {
        console.log('No suggestion available, but address validates');
        
        // Track and proceed immediately (Option B behavior)
        trackFormStepComplete(1, 'Address Form Completed (Manual)', formData);
        
        // ========================================
        // SPLIT TEST AREA - STEP NAVIGATION
        // Position 2: A=Show Step 2, B=Skip to Step 3
        // ========================================
        const urlParams = new URLSearchParams(window.location.search);
        const splitTest = urlParams.get('split_test') || urlParams.get('variant') || 'AAA';
        const showStep2 = splitTest[1] === 'A'; // Position 2 controls Step 2 interstitial
        
        if (showStep2) {
          nextStep(); // Go to Step 2 (AI Processing)
        } else {
          // Skip Step 2, go directly to Step 3
          updateFormData({ formStep: 3 });
        }
        // ======================================== 
        // END SPLIT TEST AREA - STEP NAVIGATION
        // ========================================
        setIsLoading(false);
        
        // Create lead in background for manual address - this should ALWAYS happen
        (async () => {
          try {
            const addressComponents = {
              city: '',
              state: 'GA',
              zip: ''
            };
            
            let leadId = localStorage.getItem('leadId');
            
            if (!leadId) {
              console.log('Creating lead for manual address with autofilled contact info:', {
                address: formData.street,
                name: formData.name || formData.autoFilledName || '',
                phone: formData.phone || formData.autoFilledPhone || '',
                email: formData.email || formData.autoFilledEmail || '',
                nameWasAutofilled: formData.nameWasAutofilled
              });
              
              // Create a fallback place object for manual addresses (same structure as processAddressSelection)
              const manualPlace = {
                formatted_address: formData.street,
                address_components: []
              };
              
              // Use the same processAddressSelection logic but non-blocking
              processAddressSelectionNonBlocking(manualPlace);
            } else {
              // If lead exists, update it with autofilled contact info, then start property data fetch
              console.log('Updating existing lead with autofilled contact info:', {
                leadId: leadId,
                address: formData.street,
                name: formData.name || formData.autoFilledName || '',
                phone: formData.phone || formData.autoFilledPhone || '',
                email: formData.email || formData.autoFilledEmail || ''
              });
              
              // Create a fallback place object for manual addresses
              const manualPlace = {
                formatted_address: formData.street,
                address_components: []
              };
              
              // Update the existing lead with autofilled data AND address
              processAddressSelectionNonBlocking(manualPlace);
            }
          } catch (error) {
            console.error('Background lead creation for manual address failed:', error);
          }
        })();
      } else {
        // Address doesn't validate
        setErrorMessage('Please enter a valid address');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error handling button click:', error);
      setIsLoading(false);
      setErrorMessage('An error occurred. Please try again.');
    }
  };
  
  // Lazy load Google Maps API only when needed
  const loadGoogleMapsAPI = () => {
    // If already loaded, return resolved promise
    if (window.google && window.google.maps && window.google.maps.places) {
      return Promise.resolve();
    }
    
    // If already loading, return existing promise
    if (window.googleMapsPromise) {
      return window.googleMapsPromise;
    }
    
    // Get API key from environment variable
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    // Check if API key is available
    if (!apiKey) {
      console.error('Google Maps API key is missing. Please check your environment variables.');
      return Promise.reject(new Error('Google Maps API key is missing'));
    }
    
    // Create a new promise for loading
    window.googleMapsPromise = new Promise((resolve, reject) => {
      // Define callback function
      window.initGoogleMapsAutocomplete = () => {
        console.log('Google Maps API loaded successfully');
        setGoogleApiLoaded(true);
        
        // Create a session token right away
        if (window.google.maps.places.AutocompleteSessionToken) {
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        }
        
        // Initialize the AutocompleteService for getting suggestions
        if (window.google.maps.places.AutocompleteService) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
        
        resolve();
      };
      
      // Define error handler for the API
      window.gm_authFailure = () => {
        const error = new Error('Google Maps API authentication failure');
        console.error(error);
        
        // Track error for analytics
        trackFormError('Google Maps API authentication failure', 'maps');
        reject(error);
      };
      
      // Load the API with a callback
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAutocomplete`;
      script.async = true;
      script.defer = true;
      script.onerror = (e) => {
        const error = new Error('Failed to load Google Maps API script');
        console.error(error, e);
        
        // Track error for analytics
        trackFormError('Failed to load Google Maps API script', 'maps');
        reject(error);
      };
      
      document.body.appendChild(script);
    });
    
    return window.googleMapsPromise;
  };
  
  // Load Google Maps API when input is focused or when typing begins
  useEffect(() => {
    // Only trigger loading when the user starts interacting with the input
    const handleInputInteraction = () => {
      if (!googleApiLoaded) {
        loadGoogleMapsAPI()
          .then(() => {
            console.log('Google Maps API loaded on user interaction');
          })
          .catch(error => {
            console.error('Error loading Google Maps API:', error);
          });
      }
    };
    
    // Add event listeners to input when it exists
    if (inputRef.current) {
      inputRef.current.addEventListener('focus', handleInputInteraction);
      inputRef.current.addEventListener('input', handleInputInteraction);
      
      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener('focus', handleInputInteraction);
          inputRef.current.removeEventListener('input', handleInputInteraction);
        }
      };
    }
  }, [googleApiLoaded, inputRef.current]);
  
  // Initialize autocomplete after API is loaded
  useEffect(() => {
    if (!googleApiLoaded || !inputRef.current || autocompleteRef.current) return;
    
    try {
      // If we don't have a session token yet, create one
      if (!sessionTokenRef.current && window.google.maps.places.AutocompleteSessionToken) {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      }
      
      // Initialize autocomplete directly on the input with the session token
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        sessionToken: sessionTokenRef.current
      });
      
      // Add listener for place selection
      autocompleteRef.current.addListener('place_changed', async () => {
        try {
          const place = autocompleteRef.current.getPlace();
          
          // Only proceed if we have a valid place with formatted_address
          if (!place || !place.formatted_address) {
            console.error('Invalid place selection');
            return;
          }
          
          // Check for name and phone values that might have been auto-filled
          const nameInput = document.querySelector('input[name="name"]');
          const phoneInput = document.querySelector('input[name="tel"]');
          
          // Get name and phone values from the form inputs if they exist
          let nameValue = '';
          let phoneValue = '';
          
          if (nameInput && nameInput.value) {
            nameValue = nameInput.value;
            console.log('Name value from input field:', nameValue);
          }
          
          if (phoneInput && phoneInput.value) {
            phoneValue = phoneInput.value;
            console.log('Phone value from input field:', phoneValue);
          }
          
          
          // Save that this was a user-selected suggestion along with name and phone
          updateFormData({
            selectedSuggestionAddress: place.formatted_address,
            userTypedAddress: lastTypedAddress, // What the user typed before selecting
            addressSelectionType: 'UserClicked',
            name: nameValue || formData.name || '',  // Use value from input if available, fallback to formData
            phone: phoneValue || formData.phone || '', // Use value from input if available, fallback to formData
            autoFilledName: nameValue || formData.autoFilledName || formData.name || '',
            autoFilledPhone: phoneValue || formData.autoFilledPhone || formData.phone || ''
          });
          
          // Start form submission process immediately
          setIsLoading(true);
          
          console.log('Auto-submitting form after autocomplete selection with values:', {
            address: place.formatted_address,
            name: nameValue || formData.name || '',
            phone: phoneValue || formData.phone || '',
            autoFilledName: nameValue || formData.autoFilledName || formData.name || '',
            autoFilledPhone: phoneValue || formData.autoFilledPhone || formData.phone || ''
          });
          
          // Process the selected address - no await
          processAddressSelection(place);

          // Track the form step completion for address
          trackFormStepComplete(1, 'Address Form Completed (Suggestion)', formData);
          
          // ========================================
          // SPLIT TEST AREA - STEP NAVIGATION
          // Position 2: A=Show Step 2, B=Skip to Step 3
          // ========================================
          const urlParams = new URLSearchParams(window.location.search);
          const splitTest = urlParams.get('split_test') || urlParams.get('variant') || 'AAA';
          const showStep2 = splitTest[1] === 'A'; // Position 2 controls Step 2 interstitial
          
          if (showStep2) {
            nextStep(); // Go to Step 2 (AI Processing)
          } else {
            // Skip Step 2, go directly to Step 3
            updateFormData({ formStep: 3 });
          }
          // ======================================== 
          // END SPLIT TEST AREA - STEP NAVIGATION
          // ========================================
          
          // Reset loading state right away
          setIsLoading(false);
        } catch (error) {
          console.error('Error handling place selection:', error);
          
          // Track error for analytics
          trackFormError('Error handling place selection: ' + error.message, 'maps');
        }
      });
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
      
      // Track error for analytics
      trackFormError('Error initializing Google Places Autocomplete: ' + error.message, 'maps');
    }
  }, [googleApiLoaded, updateFormData, lastTypedAddress]);
  
  // Add additional CSS to fix autocomplete dropdown styling
  useEffect(() => {
    if (!googleApiLoaded) return;
    
    // Create a style element for the pac-container
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .pac-container {
        z-index: 9999 !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        border: 1px solid #ccc;
        border-top: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", sans-serif;
      }
      .pac-item {
        padding: 8px 15px;
        font-size: 1.5rem; /* Increased font size to match input */
        cursor: pointer !important;
      }
      .pac-item:hover {
        background-color: #f5f5f5;
      }
      .pac-item-query {
        font-size: 1.5rem; /* Increased font size to match input */
        color: #333;
      }
      .pac-matched {
        font-weight: bold;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [googleApiLoaded]);
  
  // Additional listener for input events to detect browser autofill
  // This catches cases that the animation approach might miss
  useEffect(() => {
    let lastInputTime = 0;
    let autofilledFields = new Set();
    let autoSubmitTimer = null;
    
    // Function to handle any input event
    const handleInput = (e) => {
      const now = Date.now();
      
      // If multiple input events fire almost simultaneously (< 50ms apart),
      // this is likely browser autofill
      if (now - lastInputTime < 50) {
        console.log('Rapid input detected, likely browser autofill on:', e.target.name);
        autofilledFields.add(e.target.name);
        
        // Clear any pending auto submit
        if (autoSubmitTimer) {
          clearTimeout(autoSubmitTimer);
        }
        
        // If we have address and at least one more field or 3+ fields filled,
        // auto-submit after a short delay
        if ((autofilledFields.has('address-line1') && autofilledFields.size > 1) || 
            autofilledFields.size >= 3) {
          
          // Schedule an auto-submit
          autoSubmitTimer = setTimeout(() => {
            console.log('Auto-submitting form after browser autofill detected');
            
            // Update the autofill flag
            setAutofillDetected(true);
            
            console.log('🔍 AUTOFILL DIAGNOSIS: Input field contains:', inputRef.current ? inputRef.current.value : 'not available');
            console.log('🔍 AUTOFILL DIAGNOSIS: formData.street =', formData.street);
            console.log('🔍 AUTOFILL DIAGNOSIS: firstSuggestion =', firstSuggestion);
            console.log('🔍 AUTOFILL DIAGNOSIS: autofilledFields =', Array.from(autofilledFields));
            
            // Need to ensure formData is updated with the current input value
            if (inputRef.current && inputRef.current.value) {
              console.log('🔍 AUTOFILL DIAGNOSIS: Updating formData with current input value');
              updateFormData({ street: inputRef.current.value });
              
              // We'll use a promise to handle the suggestion flow
              // Request suggestions in a separate function to avoid nesting issues
              const getAndProcessSuggestions = () => {
                return new Promise((resolve) => {
                  // If we already have suggestions, resolve immediately
                  if (firstSuggestion) {
                    console.log('🔍 AUTOFILL DIAGNOSIS: Already have suggestions, using those');
                    resolve(firstSuggestion);
                    return;
                  }
                  
                  // If API isn't loaded or available, resolve with failure
                  if (!googleApiLoaded || !autocompleteServiceRef.current || inputRef.current.value.length < 3) {
                    console.log('🔍 AUTOFILL DIAGNOSIS: Cannot get suggestions - API not ready or address too short');
                    resolve(false);
                    return;
                  }
                  
                  // Add timeout to prevent waiting indefinitely
                  const timeoutId = setTimeout(() => {
                    console.log('⚠️ Address suggestions request timed out after 2 seconds');
                    // Proceed with manual submission
                    resolve(false);
                  }, 2000); // 2 second timeout
                  
                  console.log('🔍 AUTOFILL DIAGNOSIS: Requesting suggestions for autofilled address');
                  // Request suggestions for this address
                  autocompleteServiceRef.current.getPlacePredictions({
                    input: inputRef.current.value,
                    sessionToken: sessionTokenRef.current,
                    componentRestrictions: { country: 'us' },
                    types: ['address']
                  }, (predictions, status) => {
                    clearTimeout(timeoutId); // Clear timeout since we got a response
                    
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                      console.log('🔍 AUTOFILL DIAGNOSIS: Got suggestions:', predictions);
                      // Store the first suggestion in state, but also pass it directly in the resolve
                      setFirstSuggestion(predictions[0]);
                      resolve(predictions[0]); // Pass the suggestion directly to avoid relying on state updates
                    } else {
                      console.log('🔍 AUTOFILL DIAGNOSIS: No suggestions found for:', inputRef.current.value);
                      resolve(false);
                    }
                  });
                });
              };
              
              // Get suggestions and process them
              getAndProcessSuggestions().then(suggestion => {
                console.log('🔍 AUTOFILL DIAGNOSIS: Processed suggestions:', suggestion);
                
                if (suggestion && suggestion.place_id) {
                  // Use the suggestion if available
                  console.log('🔍 AUTOFILL DIAGNOSIS: Using suggestion:', suggestion.description);
                  
                  // Get place details
                  getPlaceDetails(suggestion.place_id)
                    .then(placeDetails => {
                      if (placeDetails && placeDetails.formatted_address) {
                        console.log('🔍 AUTOFILL DIAGNOSIS: Got place details:', placeDetails.formatted_address);
                        
                        // Process the address selection
                        processAddressSelection(placeDetails);
                        
                        // ========================================
                        // SPLIT TEST AREA - STEP NAVIGATION
                        // Position 2: A=Show Step 2, B=Skip to Step 3
                        // ========================================
                        const urlParams = new URLSearchParams(window.location.search);
                        const splitTest = urlParams.get('split_test') || urlParams.get('variant') || 'AAA';
                        const showStep2 = splitTest[1] === 'A'; // Position 2 controls Step 2 interstitial
                        
                        if (showStep2) {
                          nextStep(); // Go to Step 2 (AI Processing)
                        } else {
                          // Skip Step 2, go directly to Step 3
                          updateFormData({ formStep: 3 });
                        }
                        // ======================================== 
                        // END SPLIT TEST AREA - STEP NAVIGATION
                        // ========================================
                      } else {
                        console.log('🔍 AUTOFILL DIAGNOSIS: No valid place details, using button click');
                        handleButtonClick({preventDefault: () => {}, stopPropagation: () => {}});
                      }
                    })
                    .catch(error => {
                      console.error('🔍 AUTOFILL DIAGNOSIS: Error getting place details:', error);
                      handleButtonClick({preventDefault: () => {}, stopPropagation: () => {}});
                    });
                } else {
                  console.log('🔍 AUTOFILL DIAGNOSIS: No Google suggestion available, trying manual submission with current address:', 
                    formData.street || (inputRef.current ? inputRef.current.value : 'not available'));
                  
                  // No Google suggestion available, use standard button click handler
                  handleButtonClick({preventDefault: () => {}, stopPropagation: () => {}});
                }
              });
            } else {
              console.log('🔍 AUTOFILL DIAGNOSIS: No value in input field, using standard submission');
              handleButtonClick({preventDefault: () => {}, stopPropagation: () => {}});
            }
          }, 600);
        }
      }
      
      // Update last input time
      lastInputTime = now;
    };
    
    // Add listeners to all form inputs
    const formInputs = formRef.current?.querySelectorAll('input');
    
    if (formInputs) {
      formInputs.forEach(input => {
        input.addEventListener('input', handleInput);
      });
    }
    
    return () => {
      // Clean up all listeners
      if (formInputs) {
        formInputs.forEach(input => {
          input.removeEventListener('input', handleInput);
        });
      }
      
      if (autoSubmitTimer) {
        clearTimeout(autoSubmitTimer);
      }
    };
  }, [handleButtonClick, firstSuggestion, nextStep, getPlaceDetails, processAddressSelection]);
  
  // Special effect to add key event listeners at the document level to catch Enter globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Enter key at the document level
      if (e.key === 'Enter' && document.activeElement === inputRef.current) {
        console.log('Enter key caught at document level');
        e.preventDefault();
        e.stopPropagation();
        
        // Call our Enter key handler
        handleEnterKeyPress(e);
        
        return false;
      }
    };
    
    // Add global event listener for keydown
    document.addEventListener('keydown', handleKeyDown, true);
    
    // Cleanup 
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [firstSuggestion, formData.street, isLoading]);
  
  // Override styles to prevent conflicts
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .vb-af1-hero-content.hero-content::before {
        content: none !important;
        display: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="vb-af1-hero-section">
      <div className="vb-af1-hero-middle-container">
        <div className="vb-af1-hero-content">
          {/* ========================================= */}
          {/* DYNAMIC CONTENT SECTION - HEADLINES     */}
          {/* ========================================= */}
          {/* 
            EDITING INSTRUCTIONS:
            - Headlines change based on URL campaign_name parameter
            - Main logic is in FormContext.setDynamicContent()
            - Fallback defaults are defined below
            - Priority: Dynamic Content > Fallback Defaults
          */}
          <div className="vb-af1-hero-headline">
            {dynamicContent.headline}    
          </div>
          <div className="vb-af1-hero-subheadline" dangerouslySetInnerHTML={{ __html: dynamicContent.subheadline }}>
          </div>
          {/* ========================================= */}
          {/* END DYNAMIC CONTENT SECTION              */}
          {/* ========================================= */}

          {/* ========================================= */}
          {/* SPLIT TEST AREA - STEP 1 BOX VISIBILITY  */}
          {/* Position 1: A=Show Box, B=Hide Box       */}
          {/* ========================================= */}
          {(() => {
            // Check split test parameters from URL
            const urlParams = new URLSearchParams(window.location.search);
            const splitTest = urlParams.get('split_test') || urlParams.get('variant') || 'AAA'; // Default to show everything
            const showStep1Box = splitTest[0] === 'A'; // Position 1 controls Step 1 box - A=show (default), B=hide
            
            return showStep1Box;
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

              {/* Value Boost Potential - separate from new total */}
              <div className="vb-value-item">
                <div className="vb-value-amount vb-boost-value">
                  $121,880
                </div>
                <div className="vb-value-label">
                  Offer Boost Potential
                </div>
              </div>
            </div>

            {/* New Total Value - shown below */}
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
          {/* ========================================= */}
          {/* END SPLIT TEST AREA - STEP 1 BOX         */}
          {/* ========================================= */}

          {/* ========================================= */}
          {/* SPLIT TEST AREA - DOWN ARROW VISIBILITY  */}
          {/* Position 1: A=Show Arrow, B=Hide Arrow   */}
          {/* ========================================= */}
          {/* COMMENTED OUT - Down arrow removed
          {(() => {
            // Check split test parameters from URL
            const urlParams = new URLSearchParams(window.location.search);
            const splitTest = urlParams.get('split_test') || urlParams.get('variant') || 'AAA';
            const showStep1Box = splitTest[0] === 'A'; // Position 1 controls Step 1 box and arrow
            
            return showStep1Box;
          })() && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '-40px 0 10px 0',
            position: 'relative',
            zIndex: 1
          }}>
            <img 
              src={gradientArrow}
              alt="Enter your address below"
              style={{
                width: '80px',
                height: 'auto',
                transform: 'rotate(90deg)',
                filter: 'drop-shadow(0 2px 8px rgba(0, 184, 230, 0.3))'
              }}
            />
          </div>
          )}
          */}
          {/* ========================================= */}
          {/* END SPLIT TEST AREA - DOWN ARROW         */}
          {/* ========================================= */}
          
          {/* Using a form structure for browser autofill to work properly */}
          <form className="vb-af1-form-container" id="valueboostAddressForm" autoComplete="on" onSubmit={(e) => {
            e.preventDefault();
            handleButtonClick(e);
          }} ref={formRef}>
            <input
              ref={inputRef}
              type="text"
              name="address-line1"
              autoComplete="address-line1"
              placeholder="Street address..."
              className={errorMessage ? 'vb-af1-address-input-invalid' : 'vb-af1-address-input'}
              value={formData.street || ''}
              onChange={handleChange}
              onFocus={(e) => e.target.placeholder = ''}
              onBlur={(e) => e.target.placeholder = 'Street address...'}
              disabled={isLoading}
              required
            />
            
            {/* Visually hidden name field - captures autofill data only (not primary name) */}
            <div style={visuallyHiddenStyle}>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your name (optional)"
                className="vb-af1-address-input"
                value={formData.autoFilledName || ''}
                onChange={(e) => updateFormData({ autoFilledName: e.target.value })}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Your name (optional)'}
                disabled={isLoading}
              />
            </div>
            
            {/* Visually hidden phone field - captures autofill data only (not primary phone) */}
            <div style={visuallyHiddenStyle}>
              <input
                type="tel"
                name="tel"
                autoComplete="tel"
                placeholder="Your phone (optional)"
                className="vb-af1-address-input"
                value={formData.autoFilledPhone || ''}
                onChange={(e) => updateFormData({ autoFilledPhone: e.target.value })}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Your phone (optional)'}
                disabled={isLoading}
              />
            </div>
            
            {/* ========================================= */}
            {/* DYNAMIC CONTENT SECTION - BUTTON TEXT   */}
            {/* ========================================= */}
            {/* 
              EDITING INSTRUCTIONS:
              - Button text changes based on URL campaign_name parameter
              - Main logic is in FormContext.setDynamicContent()
              - Fallback default is defined below
              - Priority: Dynamic Content > Fallback Default
            */}


{errorMessage && (
            <div className="vb-af1-error-message">{errorMessage}</div>
          )}






            <button 
              type="submit"
              className="vb-af1-submit-button"
              id="valueboost-address-submit-button" 
              disabled={isLoading}
            >
              {isLoading ? 'ANALYZING...' : dynamicContent.buttonText}
            </button>
            {/* ========================================= */}
            {/* END DYNAMIC CONTENT SECTION              */}
            {/* ========================================= */}
          </form>

          {/* Tagline below submit button */}
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
            Smarter Home Ownership, Powered by HomeSurge.AI
          </div>
          
          {/* Static wave image container */}
          <div className="ai-wave-container">
            <img 
              src={waveImage} 
              alt="Wave decoration" 
              style={{
                width: '200px',
                height: 'auto',
                opacity: 0.6
              }}
            />
          </div>
          
          
          
          
          {/* Disclaimer Section */}
          <div className="vb-disclaimer-section">
            <div className="vb-disclaimer-text">
              *Example values only. Your offer amount will depend on your specific home details and other factors. Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible home value increase that might be acheived by various home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes. By submitting your address, you agree to send address details and other available autofill information not displayed to HomeSurge.AI for the purpose of contacting you with your requested information. <strong>We respect your privacy and will never share your details with anyone. No spam ever.</strong>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default AddressForm; 