import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import { validateAddress } from '../../../utils/validation.js';
import { trackAddressSelected, trackFormStepComplete, trackFormError } from '../../../services/analytics';
import { trackPropertyValue } from '../../../services/facebook';
import { lookupPropertyInfo } from '../../../services/maps.js';
import { createSuggestionLead, updateLeadInFirebase } from '../../../services/firebase.js';
import { formatSubheadline, formatText } from '../../../utils/textFormatting';
import axios from 'axios';

function AddressForm2(props) {
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
      console.log("Retrieved suggestionLeadId from localStorage:", existingLeadId);
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
  
  // Handle form input changes
  const handleChange = (e) => {
    const value = e.target.value;
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
            console.log('Got suggestion:', predictions[0].description);
            
            // Store all suggestions
            setAddressSuggestions(predictions);
            
            // Store suggestions in form data but don't send to Firebase yet
            const top5Suggestions = predictions.slice(0, 5); // Only use top 5
            const preparedData = {
              userTypedAddress: value,
              suggestionOne: top5Suggestions[0]?.description || '',
              suggestionTwo: top5Suggestions[1]?.description || '',
              suggestionThree: top5Suggestions[2]?.description || '',
              suggestionFour: top5Suggestions[3]?.description || '',
              suggestionFive: top5Suggestions[4]?.description || '',
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
  };
  
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
    
    // Log the extracted address components
    console.log('Extracted address components:', {
      city: addressComponents.city,
      state: addressComponents.state,
      zip: addressComponents.zip
    });
    
    // Get location data if available
    const location = place.geometry?.location ? {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    } : null;
    
    // Update form data with selected place
    updateFormData({
      street: place.formatted_address,
      city: addressComponents.city,
      state: addressComponents.state,
      zip: addressComponents.zip,
      location: location,
      addressSelectionType: 'Google',
      selectedSuggestionAddress: place.formatted_address,
      leadStage: 'Address Selected'
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
        // Use the proper field names that will map to Firebase
        street: place.formatted_address,
        city: addressComponents.city,
        state: addressComponents.state,
        zip: addressComponents.zip,
        
        userTypedAddress: lastTypedAddress,
        selectedSuggestionAddress: place.formatted_address,
        suggestionOne: addressSuggestions[0]?.description || '',
        suggestionTwo: addressSuggestions[1]?.description || '',
        suggestionThree: addressSuggestions[2]?.description || '',
        suggestionFour: addressSuggestions[3]?.description || '',
        suggestionFive: addressSuggestions[4]?.description || '',
        addressSelectionType: 'Google',
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
      
      // Create a new lead or update existing one
      let leadId, response;
      
      if (existingLeadId) {
        // Update existing lead with Firebase
        await updateLeadInFirebase(existingLeadId, finalSelectionData);
        leadId = existingLeadId;
        console.log('Updated lead with final selection in Firebase:', leadId);
      } else {
        // Create a new lead with suggestions and address
        const top5Suggestions = addressSuggestions.slice(0, 5);
        // Pass the full formData object to ensure campaign data is captured in the initial lead creation
        leadId = await createSuggestionLead(place.formatted_address, top5Suggestions, null, addressComponents, formData);
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
    
    // Immediately fetch property data from Melissa API
    console.log('Fetching property data immediately after address selection');
    const propertyData = await fetchPropertyData(place.formatted_address);
    
    // If we got property data, update the lead again with this information
    const updatedLeadId = localStorage.getItem('leadId') || suggestionLeadId;
    if (propertyData && updatedLeadId) {
      try {
        // Get campaign data from formContext 
        const { campaign_name, campaign_id, adgroup_id, adgroup_name, keyword, gclid, device, traffic_source, template_type } = formData;
        
        console.log("%c CRITICAL ADDRESS + PROPERTY DATA UPDATE TO FIREBASE", "background: #4caf50; color: white; font-size: 14px; padding: 5px;");
        console.log("This is where URL campaign data MUST be sent to Firebase");
        console.log("Campaign Data in form context:", {
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
        
        // Update the lead with property data AND campaign data
        const propertyUpdateData = {
          // Include the address components again to ensure they are saved
          street: place.formatted_address,
          city: addressComponents.city,
          state: addressComponents.state,
          zip: addressComponents.zip,
          
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
        
        // Log what we're sending
        console.log("Property + Campaign data being sent to Firebase:", {
          leadId: updatedLeadId,
          address: {
            street: propertyUpdateData.street,
            city: propertyUpdateData.city,
            state: propertyUpdateData.state,
            zip: propertyUpdateData.zip
          },
          property: {
            apiOwnerName: propertyUpdateData.apiOwnerName,
            apiEstimatedValue: propertyUpdateData.apiEstimatedValue,
            apiEquity: propertyUpdateData.apiEquity,
            apiPercentage: propertyUpdateData.apiPercentage
          },
          campaign: {
            campaign_name: propertyUpdateData.campaign_name,
            campaign_id: propertyUpdateData.campaign_id,
            adgroup_name: propertyUpdateData.adgroup_name,
            keyword: propertyUpdateData.keyword,
            template_type: propertyUpdateData.template_type
          }
        });
        
        // Store this data in sessionStorage for the debugger
        try {
          const firebaseDataSent = {
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
          sessionStorage.setItem('firebaseDataSent', JSON.stringify(firebaseDataSent));
          console.log("Stored Firebase data in sessionStorage for debugger");
        } catch (e) {
          console.error("Error storing Firebase data in sessionStorage:", e);
        }
        
        // Send the update to Firebase directly
        await updateLeadInFirebase(updatedLeadId, propertyUpdateData);
        
        console.log('Updated lead in Firebase with property data AND campaign data from URL');
      } catch (error) {
        console.error('Error updating lead with property data:', error);
      }
    }
    
    return propertyData != null;
  };
  
  // Completely separate function for handling Enter key presses
  const handleEnterKeyPress = async (e) => {
    // Always prevent default - critical!
    e.preventDefault();
    e.stopPropagation();
    
    console.log('ENTER key pressed - v1000', firstSuggestion ? 'First suggestion available' : 'No suggestion yet');
    
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
            
            // Process the selected address
            await processAddressSelection(placeDetails);
            
            // Proceed to next step
            setTimeout(() => {
              nextStep();
              // Reset loading state after navigation
              setIsLoading(false);
              
              // Track conversion for variant in analytics
              if (window.dataLayer && props.variantName) {
                window.dataLayer.push({
                  event: 'variant_conversion',
                  component: 'AddressForm',
                  variantIndex: props.variantIndex || 0,
                  variantName: props.variantName
                });
              }
            }, 200);
            
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
        await fetchPropertyData(formData.street);
        trackFormStepComplete(1, 'Address Form Completed (Fallback)', formData);
        nextStep();
        setIsLoading(false);
        
        // Track conversion for variant in analytics
        if (window.dataLayer && props.variantName) {
          window.dataLayer.push({
            event: 'variant_conversion',
            component: 'AddressForm',
            variantIndex: props.variantIndex || 0,
            variantName: props.variantName
          });
        }
        
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
    
    console.log('Button clicked - v1000');
    
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
            
            // Process the selected address
            await processAddressSelection(placeDetails);
            
            // Proceed to next step
            setTimeout(() => {
              nextStep();
              // Reset loading state after navigation
              setIsLoading(false);
              
              // Track conversion for variant in analytics
              if (window.dataLayer && props.variantName) {
                window.dataLayer.push({
                  event: 'variant_conversion',
                  component: 'AddressForm',
                  variantIndex: props.variantIndex || 0,
                  variantName: props.variantName
                });
              }
            }, 200);
            
            return;
          }
        } catch (error) {
          console.error('Error getting place details:', error);
        }
      }
      
      // If no suggestion and address validation passes, proceed with what we have
      if (validateAddress(formData.street)) {
        console.log('No suggestion available, but address validates');
        
        // Try to fetch property data with what we have
        await fetchPropertyData(formData.street);
        
        // Track and proceed
        trackFormStepComplete(1, 'Address Form Completed (Manual)', formData);
        nextStep();
        setIsLoading(false);
        
        // Track conversion for variant in analytics
        if (window.dataLayer && props.variantName) {
          window.dataLayer.push({
            event: 'variant_conversion',
            component: 'AddressForm',
            variantIndex: props.variantIndex || 0,
            variantName: props.variantName
          });
        }
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
          
          // Save that this was a user-selected suggestion
          updateFormData({
            selectedSuggestionAddress: place.formatted_address,
            userTypedAddress: lastTypedAddress, // What the user typed before selecting
            addressSelectionType: 'UserClicked'
          });
          
          // Start form submission process immediately - don't wait for property data
          setIsLoading(true);
          
          // Process the selected address but don't wait for it to complete
          processAddressSelection(place);

          // Track the form step completion for address
          trackFormStepComplete(1, 'Address Form Completed (Suggestion)', formData);

          // Proceed to next step immediately
          nextStep();
          
          // Reset loading state after navigation
          setTimeout(() => {
            setIsLoading(false);
            
            // Track conversion for variant in analytics
            if (window.dataLayer && props.variantName) {
              window.dataLayer.push({
                event: 'variant_conversion',
                component: 'AddressForm',
                variantIndex: props.variantIndex || 0,
                variantName: props.variantName
              });
            }
          }, 100);
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
      
      /* Make sure the suggestions container has enough width */
      .pac-container {
        width: auto !important;
        min-width: 300px;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [googleApiLoaded]);
  
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
  
  // Track view for variant
  useEffect(() => {
    if (window.dataLayer && props.variantName) {
      window.dataLayer.push({
        event: 'variant_view',
        component: 'AddressForm',
        variantIndex: props.variantIndex || 1,
        variantName: props.variantName || 'AddressForm2'
      });
    }
    
    // Add variant-specific CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .af2-hero-section .af2-hero-headline {
        color: #1a5653;
        font-size: 2.5rem;
        font-weight: 700;
      }
      
      .af2-hero-section .af2-hero-subheadline {
        color: #444;
        font-size: 1.3rem;
        margin-bottom: 2rem;
      }
      
      .af2-form-container {
        width: 100%;
        max-width: 600px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .af2-address-input {
        border: 2px solid #1a5653;
        border-radius: 8px;
        padding: 16px 20px;
        font-size: 1.2rem;
        color: #333;
      }
      
      .af2-address-input-invalid {
        border: 2px solid #cc0000;
        border-radius: 8px;
        padding: 16px 20px;
        font-size: 1.2rem;
        color: #333;
      }
      
      .af2-submit-button {
        background-color: #ff6b35;
        border: none;
        border-radius: 8px;
        color: white;
        font-weight: 700;
        font-size: 1.2rem;
        padding: 16px 30px;
        cursor: pointer;
        transition: background-color 0.2s;
        text-transform: uppercase;
      }
      
      .af2-submit-button:hover {
        background-color: #e55a24;
      }
      
      .af2-error-message {
        color: #cc0000;
        font-size: 0.9rem;
        margin-top: 10px;
        text-align: center;
      }
      
      @media (max-width: 768px) {
        .af2-hero-section .af2-hero-headline {
          font-size: 2rem;
        }
        
        .af2-hero-section .af2-hero-subheadline {
          font-size: 1.1rem;
        }
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [props.variantIndex, props.variantName]);
  
  return (
    <div className="af2-hero-section hero-section">
      <div className="af2-hero-middle-container hero-middle-container">
        <div className="af2-hero-content hero-content fade-in">
          <div className="af2-hero-headline hero-headline">
            {formatText(formData.dynamicHeadline || "Get Your No-Obligation Cash Offer")}
          </div>
          <div className="af2-hero-subheadline hero-subheadline">
            {formatSubheadline(formData.dynamicSubHeadline || "No repairs needed. No fees. Close on your timeline.")}
          </div>
          
          {/* Variant 2 with different styling */}
          <div className="af2-form-container form-container">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter your property address..."
              className={errorMessage ? 'af2-address-input-invalid address-input-invalid' : 'af2-address-input address-input'}
              value={formData.street || ''}
              onChange={handleChange}
              onFocus={(e) => e.target.placeholder = ''}
              onBlur={(e) => e.target.placeholder = 'Enter your property address...'}
              disabled={isLoading}
              // We now handle Enter in the document level listener
            />
            
            <button 
              className="af2-submit-button submit-button"
              id="address-submit-button" 
              disabled={isLoading}
              onClick={handleButtonClick}
            >
              {isLoading ? 'PROCESSING...' : formData.buttonText || 'GET MY CASH OFFER'}
            </button>
          </div>
          
          {errorMessage && (
            <div className="af2-error-message error-message">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddressForm2;