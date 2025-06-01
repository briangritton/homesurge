import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';
import { trackAddressSelected, trackFormStepComplete, trackFormError } from '../../services/analytics';
import { trackPropertyValue } from '../../services/facebook';
import { lookupPropertyInfo } from '../../services/maps.js';
import { lookupPhoneNumbers } from '../../services/batchdata.js';
import { updateLeadInFirebase } from '../../services/firebase.js';
import { formatSubheadline, formatText } from '../../utils/textFormatting';
import OldBelowFold from '../BelowFold/OldBelowFold';
import axios from 'axios';

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
  
  // ================================================================================
  // DYNAMIC CONTENT SYSTEM - MAIN FORM TEMPLATES
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
    
    // Check for variant parameter for content selection
    const variant = urlParams.get('variant') || urlParams.get('split_test') || 'AIA';
    const useBContent = variant.includes('B');
    const useStreamlinedFormat = variant.includes('2');
    
    // Main Form Templates - Based on existing content
    const templates = {
      cash: {
        headline: 'Need to Sell Your Home Extremely Fast?',
        subheadline: 'Get a great cash offer today. Close in 7 days. No showings, no repairs, no stress',
        buttonText: 'CHECK OFFER'
      },
      cash2: {
        headline: 'Get an Instant Cash Offer Today',
        subheadline: 'Sell your house as-is in 7 days. No agents, no fees, no waiting. Cash in hand fast',
        buttonText: 'GET CASH OFFER'
      },
      fast: {
        headline: 'Sell Your Home In 10 Days or Less',
        subheadline: 'Get a great cash offer today. Close in 7 days. No showings, no repairs, no stress',
        buttonText: 'CHECK OFFER'
      },
      fast2: {
        headline: 'Close on Your House This Week',
        subheadline: 'Emergency home sale? We buy houses in any condition. Get your offer in 24 hours, close in days',
        buttonText: 'URGENT SALE'
      },
      value: {
        headline: 'Need to Check Your Home Value Fast?',
        subheadline: 'Find out how much equity you have now.',
        buttonText: 'CHECK VALUE'
      },
      value2: {
        headline: 'What\'s Your Home Really Worth?',
        subheadline: 'Get your accurate home value and equity report instantly. No obligations, just answers',
        buttonText: 'GET VALUE REPORT'
      },
      wide: {
        headline: 'Sell Your Home Without the Hassle',
        subheadline: 'No repairs, no showings, no waiting. Get a fair cash offer and close when you want',
        buttonText: 'GET OFFER'
      },
      wide2: {
        headline: 'Skip the Real Estate Headaches',
        subheadline: 'Avoid months of stress. We handle everything from inspection to paperwork. You just show up to closing',
        buttonText: 'AVOID STRESS'
      },
      default: {
        headline: 'Need to Sell Your Home Extremely Fast?',
        subheadline: 'Get a great cash offer today. Close in 7 days. No showings, no repairs, no stress',
        buttonText: 'CHECK OFFER'
      }
    };
    
    // Simple keyword matching with priority: cash > value > fast
    if (campaignName) {
      const simplified = campaignName.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      if (simplified.includes('cash')) return templates.cash;
      if (simplified.includes('value')) return templates.value;
      if (simplified.includes('fast')) return templates.fast;
    }
    
    return templates.default;
  };
  
  const dynamicContent = getDynamicContent();
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
  
  
  // Generate a session token for Google Places API
  const generateSessionToken = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return null;
    }
    return new window.google.maps.places.AutocompleteSessionToken();
  };
  
  // Track when browser autofill occurs
  const [lastStreetValue, setLastStreetValue] = useState('');
  const [autofillDetected, setAutofillDetected] = useState(false);
  
  // Handle form input changes
  const handleChange = (e) => {
    const value = e.target.value;
    const fieldName = e.target.name;
    
    // Check if this might be browser autofill
    if (fieldName === 'address-line1') {
      // If the value changes significantly in one update, it might be autofill
      if (value.length > 0 && Math.abs(value.length - lastStreetValue.length) > 5) {
        setAutofillDetected(true);
        // We're no longer auto-submitting on browser autofill
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
              
              // No longer sending to Firebase here - will wait until form submission
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
      // For other fields (name, phone), just update the form data
      const updateField = {};
      if (fieldName === 'name') {
        // Store the original name value without tags
        updateField.name = value;
        updateField.autoFilledName = value; // Store original name separately
        updateField.nameWasAutofilled = true; // Flag to track autofill status
      }
      if (fieldName === 'tel') {
        updateField.phone = value;
        updateField.autoFilledPhone = value; // Store original phone separately
      }
      
      updateFormData(updateField);
    }
  };
  
  // Track browser autofill and capture name and phone when available
  
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
                // Store the original name without tags
                fieldUpdate.name = e.target.value;
                fieldUpdate.autoFilledName = e.target.value; // Store original name separately
                fieldUpdate.nameWasAutofilled = true; // Flag to track autofill status
              }
              if (e.target.name === 'tel') {
                fieldUpdate.phone = e.target.value;
                fieldUpdate.autoFilledPhone = e.target.value; // Store original phone separately
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
                                
                                // Move to next step
                                nextStep();
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
  
  // Fetch property data from Melissa API
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

        // Update form data with property information including equity fields
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
        });
        
        console.log('Form data updated with property info:', {
          estimatedValue: formattedValue,
          apiEquity: propertyData.apiEquity,
          apiPercentage: propertyData.apiPercentage
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
  
  // Additional autofill handling can be added here if needed
  
  // Process address selection (whether from autocomplete or suggestion)
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
    
    // Update form data with selected place - preserve name and phone if they exist
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
      
      console.log("%c AddressForm - Campaign Data Check", "background: #ff9800; color: black; font-size: 12px; padding: 4px;");
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
      
      // Prepare data for the lead
      const finalSelectionData = {
        // Use the proper field names that will map to Zoho
        street: place.formatted_address,
        city: addressComponents.city,
        state: addressComponents.state,
        zip: addressComponents.zip,
        
        // Include name and phone if available
        name: formData.name || '',
        phone: formData.phone || '',
        
        // Include autofilled values if they exist
        autoFilledName: formData.autoFilledName || formData.name || '',
        autoFilledPhone: formData.autoFilledPhone || formData.phone || '',
        
        userTypedAddress: lastTypedAddress,
        selectedSuggestionAddress: place.formatted_address,
        addressSelectionType: autofillDetected ? 'BrowserAutofill' : 'Google',
        leadStage: 'Address Selected',
        
        // Explicitly add campaign data to ensure it's passed to Zoho
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
      }
    } catch (error) {
      console.error('Error sending address data to Firebase:', error);
    }
    
    // Fetch property data and phone numbers in the background - don't await this
    // These APIs run unconditionally to ensure best user experience
    const leadId = localStorage.getItem('leadId');
    fetchPropertyDataInBackground(place.formatted_address, leadId, addressComponents);
    lookupPhoneNumbersInBackground(place.formatted_address, leadId, addressComponents);
    
    return true; // Return success immediately without waiting for API
  };
  
  // Non-blocking version of address selection processing  
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

  // Process address selection in background - prioritize for property valuation
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

  // Lookup phone numbers in background without blocking the UI
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
  
  // Process property data in background without blocking the UI
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
              
              // Include name and phone if available
              name: formData.name || '',
              phone: formData.phone || '',
              
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
            
            // Store this data in sessionStorage and localStorage for retrieval in subsequent steps
            try {
              const propertyDataForStorage = {
                leadData: {
                  contact: {
                    name: formData.name || '',
                    phone: formData.phone || '',
                    email: formData.email || ''
                  },
                  address: {
                    street: propertyUpdateData.street,
                    city: propertyUpdateData.city,
                    state: propertyUpdateData.state,
                    zip: propertyUpdateData.zip
                  },
                  property: {
                    apiOwnerName: propertyUpdateData.apiOwnerName,
                    apiEstimatedValue: propertyUpdateData.apiEstimatedValue,
                    apiMaxHomeValue: propertyUpdateData.apiMaxHomeValue,
                    apiEquity: propertyUpdateData.apiEquity,
                    apiPercentage: propertyUpdateData.apiPercentage,
                    propertyEquity: propertyUpdateData.propertyEquity,
                    equityPercentage: propertyUpdateData.equityPercentage
                  },
                  campaign: {
                    campaign_name: propertyUpdateData.campaign_name,
                    campaign_id: propertyUpdateData.campaign_id,
                    adgroup_name: propertyUpdateData.adgroup_name,
                    adgroup_id: propertyUpdateData.adgroup_id,
                    keyword: propertyUpdateData.keyword,
                    traffic_source: propertyUpdateData.traffic_source,
                    template_type: propertyUpdateData.template_type || propertyUpdateData.templateType,
                    templateType: propertyUpdateData.templateType || propertyUpdateData.template_type,
                    matchtype: propertyUpdateData.matchtype,
                    gclid: propertyUpdateData.gclid,
                    device: propertyUpdateData.device,
                    url: propertyUpdateData.url || window.location.href
                  }
                },
                timestamp: new Date().toISOString()
              };
              
              // Store in sessionStorage for debugging
              sessionStorage.setItem('firebaseDataSent', JSON.stringify(propertyDataForStorage));
              
              // Also store property data in localStorage so it can be used in the next step
              localStorage.setItem('apiPropertyData', JSON.stringify({
                apiOwnerName: propertyData.apiOwnerName,
                apiEstimatedValue: propertyData.apiEstimatedValue,
                apiMaxHomeValue: propertyData.apiMaxValue,
                apiEquity: propertyData.apiEquity,
                apiPercentage: propertyData.apiPercentage,
                mortgageAmount: propertyData.mortgageAmount,
                bedrooms: propertyData.bedrooms,
                bathrooms: propertyData.bathrooms,
                finishedSquareFootage: propertyData.finishedSquareFootage
              }));
            } catch (e) {
              // Error storing data in storage
            }
            
            // Send the update to Firebase directly
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
        nextStep();
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
        nextStep();
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
      setErrorMessage('An error occurred. Please try again or click the Check Offer button.');
    }
  };

  // Handle button click
  const handleButtonClick = async (e) => {
    // Always prevent default form submission
    e.preventDefault();
    e.stopPropagation();
    
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
        nextStep();
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
        nextStep();
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
              // If lead exists, just start property data fetch
              fetchPropertyDataInBackground(formData.street, leadId, addressComponents);
            }
          } catch (error) {
            console.error('Background lead creation for manual address failed:', error);
          }
        })();
      } else {
        // Address doesn't validate
        setErrorMessage('Please enter a valid address to check your cash offer');
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
          
          // Automatically proceed to next step immediately
          nextStep();
          
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
                        
                        // Move to next step
                        nextStep();
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
  
  return (
    <div className="af1-hero-section hero-section">
      <div className="af1-hero-middle-container hero-middle-container">
        <div className="af1-hero-content hero-content fade-in">
          {/* ========================================= */}
          {/* DYNAMIC CONTENT SECTION - HEADLINES     */}
          {/* ========================================= */}
          {/* 
            EDITING INSTRUCTIONS:
            - Headlines change based on URL campaign_name parameter
            - Main logic is in FormContext.setDynamicContent()
            - Fallback defaults are defined below
            - Priority: Dynamic Content > Fallback Defaults
            
            CAMPAIGN MATCHING LOGIC:
            - "cash" in campaign name → Cash template
            - "value" in campaign name → Value template  
            - "fast" in campaign name → Fast template
            - No match → Default template
          */}
          <div className="af1-hero-headline hero-headline">
            {formatText(dynamicContent.headline)}
          </div>
          <div className="af1-hero-subheadline hero-subheadline">
            {formatSubheadline(dynamicContent.subheadline)}
          </div>
          {/* ========================================= */}
          {/* END DYNAMIC CONTENT SECTION              */}
          {/* ========================================= */}
          
       
          
          {/* Using a form structure for browser autofill to work properly */}
          <form className="af1-form-container form-container" id="addressForm" autoComplete="on" onSubmit={(e) => {
            e.preventDefault();
            handleButtonClick(e);
          }} ref={formRef}>
            <input
              ref={inputRef}
              type="text"
              name="address-line1"
              autoComplete="address-line1"
              placeholder="Street address..."
              className={errorMessage ? 'af1-address-input-invalid address-input-invalid' : 'af1-address-input address-input'}
              value={formData.street || ''}
              onChange={handleChange}
              onFocus={(e) => e.target.placeholder = ''}
              onBlur={(e) => e.target.placeholder = 'Street address...'}
              disabled={isLoading}
              required
            />
            
            {/* Visually hidden name field - still accessible to screen readers and browser autofill */}
            <div style={visuallyHiddenStyle}>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Name"
                className="af1-address-input address-input"
                value={formData.name || ''}
                onChange={(e) => updateFormData({ name: e.target.value, autoFilledName: e.target.value })}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Name'}
                disabled={isLoading}
                // No required attribute - optional field
              />
            </div>
            
            {/* Visually hidden phone field - still accessible to screen readers and browser autofill */}
            <div style={visuallyHiddenStyle}>
              <input
                type="tel"
                name="tel"
                autoComplete="tel"
                placeholder="Your phone (optional)"
                className="af1-address-input address-input"
                value={formData.phone || ''}
                onChange={(e) => updateFormData({ phone: e.target.value, autoFilledPhone: e.target.value })}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Your phone (optional)'}
                disabled={isLoading}
                // No required attribute - optional field
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
            <button 
              type="submit"
              className="af1-submit-button submit-button"
              id="address-submit-button" 
              disabled={isLoading}
            >
              {isLoading ? 'CHECKING...' : dynamicContent.buttonText}
            </button>
            {/* ========================================= */}
            {/* END DYNAMIC CONTENT SECTION              */}
            {/* ========================================= */}


   {/* Notice about autofill
          <div className="af1-autofill-notice" style={{ fontSize: '12px', marginBottom: '10px', opacity: 0.8 }}>
            By submitting this form, you allow us to collect your address and any browser auto-filled information to provide you with a cash offer.
          </div> */}

          </form>
          
          {errorMessage && (
            <div className="af1-error-message error-message">{errorMessage}</div>
          )}
        </div>
      </div>
      
      {/* AI Wave Container */}
      <div className="ai-wave-container">
        <img alt="Wave decoration" src="data:image/png;base64,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HI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4YLgAOxxHDBcDhOGK4ADgcRwwXAIfjiOEC4HAcMVwAHI4jhguAw3HEcAFwOI4Y/x9xlNl2BUu1IgAAAABJRU5ErkJggg==" style={{width: '200px', height: 'auto', opacity: 0.6}} />
      </div>
      
      {/* Old below-fold content */}
      <OldBelowFold />
    </div>
  );
}

export default AddressForm;