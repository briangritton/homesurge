import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';
import { trackAddressSelected, trackFormStepComplete, trackFormError } from '../../services/analytics';
import { trackPropertyValue } from '../../services/facebook';
import { lookupPropertyInfo } from '../../services/maps.js';
import { createSuggestionLead, updateLeadInFirebase } from '../../services/firebase.js';
import { formatSubheadline, formatText } from '../../utils/textFormatting';
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
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [firstSuggestion, setFirstSuggestion] = useState(null);
  const [suggestionLeadId, setSuggestionLeadId] = useState(null);
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
  
  // Initialize suggestionLeadId from localStorage if available
  useEffect(() => {
    const existingLeadId = localStorage.getItem('suggestionLeadId');
    if (existingLeadId) {
      setSuggestionLeadId(existingLeadId);
    }
  }, []);
  
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
    const handleAnimationStart = (e) => {
      // In Chrome, autocomplete fields will have animation-name: onAutoFillStart
      if (e.animationName === 'onAutoFillStart') {
        setAutofillDetected(true);
        console.log('Autofill detected on field:', e.target.name);
        
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
        if (input.name === 'name' || input.name === 'tel') {
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
          if (input.name === 'name' || input.name === 'tel') {
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
      
      placesService.getDetails({
        placeId: placeId,
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        sessionToken: sessionTokenRef.current
      }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          reject(new Error(`Place details request failed: ${status}`));
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
      
      // Create a new lead or update existing one
      let leadId, response;
      
      if (existingLeadId) {
        // Update existing lead with Firebase
        await updateLeadInFirebase(existingLeadId, finalSelectionData);
        leadId = existingLeadId;
        console.log('Updated lead with final selection in Firebase:', leadId);
      } else {
        // Create a new lead with address, name and phone
        const contactInfo = {
          name: formData.name || '',
          phone: formData.phone || ''
        };
        
        // Pass the full formData object to ensure campaign data is captured in the initial lead creation
        leadId = await createSuggestionLead(place.formatted_address, [], contactInfo, addressComponents, formData);
        console.log('Created new lead with ID in Firebase:', leadId);
      }
      
      if (leadId) {
        // Set in state and localStorage
        setSuggestionLeadId(leadId);
        localStorage.setItem('suggestionLeadId', leadId);
        localStorage.setItem('leadId', leadId);
        
        // Now we've saved the final selection
        finalSelectionSavedRef.current = true;
      }
    } catch (error) {
      console.error('Error sending address data to Firebase:', error);
    }
    
    // Fetch property data in the background - don't await this
    const leadId = localStorage.getItem('leadId') || suggestionLeadId;
    if (leadId) {
      fetchPropertyDataInBackground(place.formatted_address, leadId, addressComponents);
    }
    
    return true; // Return success immediately without waiting for API
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
        
        try {
          // Get the place details
          const placeDetails = await getPlaceDetails(firstSuggestion.place_id);
          
          // Now we have full place details
          if (placeDetails && placeDetails.formatted_address) {
            console.log('Got full place details:', placeDetails.formatted_address);
            
            // Update the value in the input field
            if (inputRef.current) {
              inputRef.current.value = placeDetails.formatted_address;
            }
            
            // Update form data with full address
            updateFormData({
              street: placeDetails.formatted_address,
              selectedSuggestionAddress: placeDetails.formatted_address,
              userTypedAddress: lastTypedAddress,
              addressSelectionType: 'EnterKey'
            });
            
            // Process the selected address - no await
            processAddressSelection(placeDetails);
            
            // Proceed to next step immediately
            nextStep();
            
            // Reset loading state after navigation
            setIsLoading(false);
            
            return;
          }
        } catch (error) {
          console.error('Error getting place details:', error);
        }
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
        const leadId = localStorage.getItem('leadId') || suggestionLeadId;
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
        
        try {
          // Get the place details
          const placeDetails = await getPlaceDetails(firstSuggestion.place_id);
          
          // Now we have full place details
          if (placeDetails && placeDetails.formatted_address) {
            console.log('Got full place details:', placeDetails.formatted_address);
            
            // Update the value in the input field
            if (inputRef.current) {
              inputRef.current.value = placeDetails.formatted_address;
            }
            
            // Update form data with full address
            updateFormData({
              street: placeDetails.formatted_address,
              selectedSuggestionAddress: placeDetails.formatted_address,
              userTypedAddress: lastTypedAddress,
              addressSelectionType: 'ButtonClick'
            });
            
            // Process the selected address - no await
            processAddressSelection(placeDetails);
            
            // Proceed to next step immediately
            nextStep();
            
            // Reset loading state after navigation
            setIsLoading(false);
            
            return;
          }
        } catch (error) {
          console.error('Error getting place details:', error);
        }
      }
      
      // If no suggestion and address validation passes, proceed with what we have
      if (validateAddress(formData.street)) {
        console.log('No suggestion available, but address validates');
        
        // Start API call in background
        const addressComponents = {
          city: '',
          state: 'GA',
          zip: ''
        };
        const leadId = localStorage.getItem('leadId') || suggestionLeadId;
        if (leadId) {
          fetchPropertyDataInBackground(formData.street, leadId, addressComponents);
        }
        
        // Track and proceed
        trackFormStepComplete(1, 'Address Form Completed (Manual)', formData);
        nextStep();
        setIsLoading(false);
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
  
  return (
    <div className="af1-hero-section hero-section">
      <div className="af1-hero-middle-container hero-middle-container">
        <div className="af1-hero-content hero-content fade-in">
          <div className="af1-hero-headline hero-headline">
            {formatText(formData.dynamicHeadline || "Need to Sell Your House For Cash Fast?")}
          </div>
          <div className="af1-hero-subheadline hero-subheadline">
            {formatSubheadline(formData.dynamicSubHeadline || "Get a great cash offer today. Close in 7 days. No agents, no repairs, no stress.")}
          </div>
          
          {/* Notice about autofill */}
          <div className="af1-autofill-notice" style={{ fontSize: '12px', marginBottom: '10px', opacity: 0.8 }}>
            By submitting this form, you allow us to collect your address and any browser auto-filled information to provide you with a cash offer.
          </div>
          
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
                placeholder="Your name (optional)"
                className="af1-address-input address-input"
                value={formData.name || ''}
                onChange={(e) => updateFormData({ name: e.target.value, autoFilledName: e.target.value })}
                onFocus={(e) => e.target.placeholder = ''}
                onBlur={(e) => e.target.placeholder = 'Your name (optional)'}
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
            
            <button 
              type="submit"
              className="af1-submit-button submit-button"
              id="address-submit-button" 
              disabled={isLoading}
            >
              {isLoading ? 'CHECKING...' : formData.buttonText || 'CHECK OFFER'}
            </button>
          </form>
          
          {errorMessage && (
            <div className="af1-error-message error-message">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddressForm;