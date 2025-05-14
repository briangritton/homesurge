// src/services/zoho.js
import axios from 'axios';

/**
 * Track conversion event in Zoho and for marketing analytics
 * @param {string} event - Event type (e.g., 'appointmentSet', 'successfulContact')
 * @param {string} leadId - The Zoho lead ID
 * @param {string} status - Optional status to update in Zoho
 * @param {number|string} customValue - Optional custom conversion value (e.g., transaction amount)
 * @param {Object} additionalData - Optional additional data to include
 * @returns {Promise<boolean>} Success indicator
 */
export async function trackZohoConversion(event, leadId, status = null, customValue = null, additionalData = {}) {
  if (!leadId) {
    console.warn('Cannot track conversion: Missing lead ID');
    return false;
  }
  
  // Don't attempt to track conversions for temporary IDs
  if (leadId.startsWith('temp_')) {
    console.log('Using temporary ID - conversion tracking skipped');
    return true;
  }
  
  try {
    // Create payload for status update and conversion tracking
    let payload = {
      event: event,
      leadId: leadId,
      customValue: customValue
    };
    
    if (status) {
      payload.status = status;
    }
    
    // Include any additional data
    if (additionalData && typeof additionalData === 'object') {
      payload = { ...payload, ...additionalData };
    }
    
    // Track conversion by updating lead in Zoho
    const response = await axios.post('/api/zoho', {
      action: 'track_conversion',
      ...payload
    });
    
    // Also push to dataLayer for GTM tracking
    if (window.dataLayer) {
      const conversionValue = getConversionValue(event, customValue);
      
      window.dataLayer.push({
        event: 'zohoConversion',
        zohoEvent: event,
        leadId: leadId,
        status: status || '',
        conversionValue: conversionValue,
        customValue: customValue,
        ...additionalData
      });
      
      console.log(`Pushed conversion event to dataLayer: ${event} with value: ${conversionValue}`);
    }
    
    console.log(`Successfully tracked conversion: ${event} for lead ${leadId}`);
    return true;
  } catch (error) {
    console.error('Error tracking conversion:', error);
    
    // Still try to push to dataLayer even if the API call fails
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'zohoConversion',
        zohoEvent: event,
        leadId: leadId,
        status: status || '',
        conversionValue: getConversionValue(event, customValue),
        customValue: customValue,
        ...additionalData
      });
    }
    
    return false;
  }
}

// Helper function to get conversion value based on event type
function getConversionValue(event, customValue = null) {
  // If a custom value is provided, use it
  if (customValue !== null && !isNaN(parseFloat(customValue))) {
    return parseFloat(customValue);
  }
  
  // Default values for different conversion types
  switch (event) {
    case 'successfulContact':
      return 25;
    case 'appointmentSet':
      return 50;
    case 'notInterested':
      return 5;
    case 'wrongNumber':
      return 2;
    case 'successfulClientAgreement':
      return 200;
    case 'successfullyClosedTransaction':
    case 'closed':
      // For closed deals, rely on the provided value from Zoho CRM
      return 500;
    case 'offerMade':
      return 100;
    case 'contractSigned':
      return 200;
    default:
      return 10;
  }
}

/**
 * Submit new lead to Zoho CRM with only relevant fields
 * @param {Object} formData - The form data to submit
 * @returns {Promise<string>} - The ID of the created lead
 */
export async function submitLeadToZoho(formData) {
  console.log("%c SUBMIT LEAD TO ZOHO CALLED", "background: #4caf50; color: white; font-size: 16px; padding: 5px;");
  console.log("Form data provided:", {
    name: formData.name,
    address: formData.street,
    campaignName: formData.campaignName,
    campaignId: formData.campaignId,
    adgroupName: formData.adgroupName,
    keyword: formData.keyword,
    templateType: formData.templateType
  });
  
  try {
    // Get list of fields that should only be sent if they have been interacted with
    const qualifyingFields = [
      'isPropertyOwner',
      'needsRepairs', 
      'workingWithAgent',
      'homeType',
      'remainingMortgage',
      'finishedSquareFootage',
      'basementSquareFootage',
      'howSoonSell',
      'wantToSetAppointment'
    ];
    
    // Create cleaned data object
    const preparedData = {
      // Basic user info - always include these
      name: formData.name || '',
      phone: formData.phone || '',
      email: formData.email || '',
      
      // Address info - always include these
      street: formData.street || '',
      city: formData.city || '',
      zip: formData.zip || '',
      state: formData.state || 'GA',
      
      // Address suggestion tracking - always include these
      userTypedAddress: formData.userTypedAddress || '',
      selectedSuggestionAddress: formData.selectedSuggestionAddress || '',
      suggestionOne: formData.suggestionOne || '',
      suggestionTwo: formData.suggestionTwo || '',
      suggestionThree: formData.suggestionThree || '',
      suggestionFour: formData.suggestionFour || '',
      suggestionFive: formData.suggestionFive || '',
      
      // Property data from Melissa API - include if available
      apiOwnerName: formData.apiOwnerName || '',
      apiEstimatedValue: formData.apiEstimatedValue?.toString() || '0',
      apiMaxHomeValue: formData.apiMaxHomeValue?.toString() || '0',
      formattedApiEstimatedValue: formData.formattedApiEstimatedValue || '$0',
      
      // New equity data - include if available
      apiEquity: formData.apiEquity?.toString() || '0',
      apiPercentage: formData.apiPercentage?.toString() || '0',
      
      // Location data - include if available
      location: formData.location ? JSON.stringify(formData.location) : '',
      
      // Tracking parameters - always include these
      trafficSource: formData.trafficSource || 'Direct',
      url: formData.url || '',
      gclid: formData.gclid || '',
      device: formData.device || '',
      campaignName: formData.campaignName || '',
      adgroupName: formData.adgroupName || '',
      keyword: formData.keyword || '',
      campaignId: formData.campaignId || '',
      adgroupId: formData.adgroupId || '',
      templateType: formData.templateType || '',
      
      // Include dynamic content information
      dynamicHeadline: formData.dynamicHeadline || '',
      dynamicSubHeadline: formData.dynamicSubHeadline || '',
      
      // Metadata and selection type
      addressSelectionType: formData.addressSelectionType || 'Manual',
      leadSource: formData.leadSource || 'Website',
      leadStage: formData.leadStage || 'New'
    };
    
    // Only add qualifying fields if they have values set or have been interacted with
    qualifyingFields.forEach(field => {
      const hasValidValue = formData[field] !== undefined && formData[field] !== '';
      const hasBeenInteractedWith = formData.interactedFields && formData.interactedFields[field];
      
      if (hasValidValue || hasBeenInteractedWith) {
        // For numeric fields, add toString() to ensure proper format
        if (typeof formData[field] === 'number') {
          preparedData[field] = formData[field].toString();
        } else {
          preparedData[field] = formData[field];
        }
      } else {
        // Log fields we're NOT sending
        console.log(`Not sending field ${field} to Zoho - no value set or user interaction`);
      }
    });
    
    // Additional fields to include only if they have valid values
    if (formData.selectedAppointmentDate) {
      preparedData.selectedAppointmentDate = formData.selectedAppointmentDate;
    }
    
    if (formData.selectedAppointmentTime) {
      preparedData.selectedAppointmentTime = formData.selectedAppointmentTime;
    }
    
    if (formData.bedrooms) {
      preparedData.bedrooms = formData.bedrooms.toString();
    }
    
    if (formData.bathrooms) {
      preparedData.bathrooms = formData.bathrooms.toString();
    }
    
    console.log("Submitting lead to Zoho with property and appointment data:", {
      needsRepairs: preparedData.needsRepairs,
      appointmentDate: preparedData.selectedAppointmentDate,
      appointmentTime: preparedData.selectedAppointmentTime,
      apiOwnerName: preparedData.apiOwnerName,
      apiEstimatedValue: preparedData.apiEstimatedValue,
      apiMaxHomeValue: preparedData.apiMaxHomeValue,
      apiEquity: preparedData.apiEquity,
      apiPercentage: preparedData.apiPercentage,
      userTypedAddress: preparedData.userTypedAddress,
      selectedSuggestionAddress: preparedData.selectedSuggestionAddress,
      leadStage: preparedData.leadStage,
      address: {
        street: preparedData.street,
        city: preparedData.city,
        state: preparedData.state,
        zip: preparedData.zip
      },
      campaignData: {
        campaignName: preparedData.campaignName,
        campaignId: preparedData.campaignId,
        adgroupName: preparedData.adgroupName,
        adgroupId: preparedData.adgroupId,
        keyword: preparedData.keyword,
        trafficSource: preparedData.trafficSource,
        gclid: preparedData.gclid,
        device: preparedData.device,
        templateType: preparedData.templateType
      }
    });
    
    // Store Zoho data sent in sessionStorage for debugging
    try {
      const zohoDataSent = {
        leadData: {
          contact: {
            name: preparedData.name,
            phone: preparedData.phone,
            email: preparedData.email
          },
          address: {
            street: preparedData.street,
            city: preparedData.city,
            state: preparedData.state,
            zip: preparedData.zip
          },
          property: {
            apiOwnerName: preparedData.apiOwnerName,
            apiEstimatedValue: preparedData.apiEstimatedValue,
            apiMaxHomeValue: preparedData.apiMaxHomeValue,
            apiEquity: preparedData.apiEquity,
            apiPercentage: preparedData.apiPercentage
          },
          campaign: {
            campaignName: preparedData.campaignName,
            campaignId: preparedData.campaignId,
            adgroupName: preparedData.adgroupName,
            adgroupId: preparedData.adgroupId,
            keyword: preparedData.keyword,
            trafficSource: preparedData.trafficSource,
            templateType: preparedData.templateType,
            gclid: preparedData.gclid,
            device: preparedData.device
          }
        },
        timestamp: new Date().toISOString()
      };
      
      // Store in sessionStorage
      sessionStorage.setItem('zohoDataSent', JSON.stringify(zohoDataSent));
      
      // Log detailed information about what's being sent to Zoho
      console.log("%c ZOHO DATA BEING SENT - VERIFY CAMPAIGN INFO", "background: #e91e63; color: white; font-size: 14px; padding: 5px;");
      console.log("Contact Info:", {
        name: preparedData.name,
        phone: preparedData.phone,
        email: preparedData.email
      });
      console.log("Campaign Data:", {
        campaignName: preparedData.campaignName,
        campaignId: preparedData.campaignId, 
        adgroupName: preparedData.adgroupName,
        adgroupId: preparedData.adgroupId,
        keyword: preparedData.keyword,
        gclid: preparedData.gclid,
        device: preparedData.device,
        templateType: preparedData.templateType
      });
      console.log("URL:", preparedData.url);
      console.log("Complete prepared data:", preparedData);
      
    } catch (e) {
      console.error("Error storing Zoho data in sessionStorage:", e);
    }
    
    // Set debug flag to get more info from API
    const response = await axios.post('/api/zoho', {
      action: 'create',
      formData: preparedData,
      debug: true
    });
    
    console.log("Zoho API full response:", response.data);
    
    if (response.data && response.data.success) {
      // First check if leadId exists directly in the response (our API wrapper should provide this)
      if (response.data.leadId) {
        console.log("Found lead ID in direct response:", response.data.leadId);
        return response.data.leadId;
      }
      
      // Look for ID in the fullResponse structure based on the actual response format
      if (response.data.fullResponse?.data?.[0]?.details?.id) {
        const extractedId = response.data.fullResponse.data[0].details.id;
        console.log("Extracted lead ID from fullResponse details:", extractedId);
        return extractedId;
      }
      
      // Try the original path as fallback
      if (response.data.fullResponse?.data?.[0]?.id) {
        const extractedId = response.data.fullResponse.data[0].id;
        console.log("Extracted lead ID from fullResponse:", extractedId);
        return extractedId;
      }
      
      // If we're here, we still don't have a lead ID
      console.error("API returned success but no leadId could be extracted! Full response:", response.data);
      
      // Last resort - generate a temporary fake ID for testing
      const tempId = "temp_" + new Date().getTime();
      console.warn("Generating temporary ID for testing:", tempId);
      return tempId;
    } else {
      throw new Error(response.data?.error || 'No lead ID returned');
    }
  } catch (error) {
    console.error("Error submitting lead to Zoho:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Status:", error.response.status);
    }
    throw new Error(error.response?.data?.error || error.message || 'Failed to submit lead');
  }
}

/**
 * Update existing lead in Zoho CRM
 * @param {string} leadId - The ID of the lead to update
 * @param {Object} formData - The updated form data
 * @returns {Promise<boolean>}
 */
export async function updateLeadInZoho(leadId, formData) {
  if (!leadId) {
    console.error("Cannot update lead: Missing lead ID");
    return false;
  }
  
  // Don't attempt to update temporary IDs
  if (leadId.startsWith("temp_")) {
    console.log("Using temporary ID - update operation skipped");
    return true;
  }
  
  // Add detailed logging for campaign data
  console.log("%c UPDATE LEAD IN ZOHO - Campaign Data Check", "background: #673ab7; color: white; font-size: 14px; padding: 5px;");
  console.log("Campaign data in update:", {
    campaignName: formData.campaignName || 'NOT PROVIDED',
    campaignId: formData.campaignId || 'NOT PROVIDED',
    adgroupName: formData.adgroupName || 'NOT PROVIDED', 
    adgroupId: formData.adgroupId || 'NOT PROVIDED',
    keyword: formData.keyword || 'NOT PROVIDED',
    gclid: formData.gclid || 'NOT PROVIDED',
    device: formData.device || 'NOT PROVIDED',
    templateType: formData.templateType || 'NOT PROVIDED',
    dataSourceComplete: formData.dataSourceComplete || false
  });
  
  try {
    // List of fields that should only be sent if they have been explicitly set
    const qualifyingFields = [
      'isPropertyOwner',
      'needsRepairs', 
      'workingWithAgent',
      'homeType',
      'howSoonSell',
      'wantToSetAppointment'
    ];
    
    // List of fields that should only be sent if they have a numeric value
    const valueRequiredFields = [
      'remainingMortgage',
      'finishedSquareFootage',
      'basementSquareFootage'
    ];
    
    // Process name field for Zoho - need to split into first/last
    let firstName = '';
    let lastName = '';
    
    // If name is provided, extract first and last name
    if (formData.name) {
      const nameParts = formData.name.split(' ');
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        // If only one name provided, use it as last name
        lastName = formData.name;
      }
    }
    
    // Explicitly log contact info to debug
    console.log("CONTACT INFO FOR ZOHO UPDATE:", {
      name: formData.name,
      firstName: firstName,
      lastName: lastName,
      phone: formData.phone || ''
    });
    
    // Include basic fields in updateData
    const updateData = {
      // IMPORTANT: Basic user info
      name: formData.name || '',
      phone: formData.phone || '',
      email: formData.email || '',
      // Add Zoho-specific name fields
      First_Name: firstName,
      Last_Name: lastName || "Contact",
      Phone: formData.phone || '',
      
      // Address suggestion tracking
      userTypedAddress: formData.userTypedAddress || '',
      selectedSuggestionAddress: formData.selectedSuggestionAddress || '',
      suggestionOne: formData.suggestionOne || '',
      suggestionTwo: formData.suggestionTwo || '',
      suggestionThree: formData.suggestionThree || '',
      suggestionFour: formData.suggestionFour || '',
      suggestionFive: formData.suggestionFive || '',
      
      // Basic address info if updated - using internal field names
      street: formData.street || '',
      city: formData.city || '',
      state: formData.state || '',
      zip: formData.zip || '',
      
      // Property data from Melissa API (in case they weren't in initial creation)
      apiOwnerName: formData.apiOwnerName || '',
      apiEstimatedValue: formData.apiEstimatedValue?.toString() || '',
      apiMaxHomeValue: formData.apiMaxHomeValue?.toString() || '',
      apiHomeValue: formData.apiEstimatedValue?.toString() || '',
      apiEquity: formData.apiEquity?.toString() || '',
      apiPercentage: formData.apiPercentage?.toString() || '',
      
      // CRITICAL: Include all campaign data in every update
      campaignName: formData.campaignName || '',
      campaignId: formData.campaignId || '',
      adgroupId: formData.adgroupId || '',
      adgroupName: formData.adgroupName || '',
      keyword: formData.keyword || '',
      gclid: formData.gclid || '',
      device: formData.device || '',
      trafficSource: formData.trafficSource || '',
      templateType: formData.templateType || '',
      url: formData.url || '',
      
      // Dynamic content data
      dynamicHeadline: formData.dynamicHeadline || '',
      dynamicSubHeadline: formData.dynamicSubHeadline || '',
      
      // Lead tracking info
      leadSource: formData.leadSource || '',
      leadStage: formData.leadStage || '',
      addressSelectionType: formData.addressSelectionType || '',
      
      // Progress tracking
      qualifyingQuestionStep: formData.qualifyingQuestionStep?.toString() || '',
      
      // Debug tracking flag
      dataSourceComplete: formData.dataSourceComplete || false
    };
    
    // Only include qualifying fields if they have values or have been interacted with
    qualifyingFields.forEach(field => {
      const hasValidValue = formData[field] !== undefined && formData[field] !== '';
      const hasBeenInteractedWith = formData.interactedFields && formData.interactedFields[field];
      
      if (hasValidValue || hasBeenInteractedWith) {
        // Include the field with its value
        updateData[field] = formData[field];
      } else {
        // Log fields we're excluding
        console.log(`Not including ${field} in update - no value set or user interaction`);
      }
    });
    
    // Only include value-required fields if they have numeric values or API set them
    valueRequiredFields.forEach(field => {
      const hasValidValue = formData[field] !== undefined && 
          formData[field] !== '' && 
          formData[field] !== null && 
          !isNaN(formData[field]) && 
          Number(formData[field]) > 0;
      
      const hasBeenInteractedWith = formData.interactedFields && formData.interactedFields[field];
      
      if (hasValidValue || hasBeenInteractedWith) {
        updateData[field] = formData[field].toString();
      } else {
        console.log(`Not including ${field} in update - no valid numeric value or user interaction`);
      }
    });
    
    // Include appointment fields only if they have values
    if (formData.selectedAppointmentDate) {
      updateData.selectedAppointmentDate = formData.selectedAppointmentDate;
      updateData.AppointmentDate = formData.selectedAppointmentDate;
    }
    
    if (formData.selectedAppointmentTime) {
      updateData.selectedAppointmentTime = formData.selectedAppointmentTime;
      updateData.AppointmentTime = formData.selectedAppointmentTime;
    }
    
    console.log("Updating lead in Zoho:", { 
      leadId, 
      data: {
        needsRepairs: updateData.needsRepairs,
        wantToSetAppointment: updateData.wantToSetAppointment,
        selectedAppointmentDate: updateData.selectedAppointmentDate,
        selectedAppointmentTime: updateData.selectedAppointmentTime,
        apiEquity: updateData.apiEquity,
        apiPercentage: updateData.apiPercentage,
        selectedSuggestionAddress: updateData.selectedSuggestionAddress,
        userTypedAddress: updateData.userTypedAddress,
        leadStage: updateData.leadStage,
        address: {
          street: updateData.street,
          city: updateData.city,
          state: updateData.state,
          zip: updateData.zip
        },
        campaign: {
          campaignName: updateData.campaignName,
          campaignId: updateData.campaignId,
          adgroupName: updateData.adgroupName,
          adgroupId: updateData.adgroupId,
          keyword: updateData.keyword,
          gclid: updateData.gclid,
          device: updateData.device,
          templateType: updateData.templateType,
          trafficSource: updateData.trafficSource
        },
        dynamic: {
          dynamicHeadline: updateData.dynamicHeadline,
          dynamicSubHeadline: updateData.dynamicSubHeadline,
          templateType: updateData.templateType
        }
      } 
    });
    
    // Add debug flag to get more info from API
    const response = await axios.post('/api/zoho', {
      action: 'update',
      leadId,
      formData: updateData,
      debug: true
    });
    
    console.log("Zoho API update response:", response.data);
    
    if (response.data && response.data.success) {
      return true;
    } else {
      console.error("Zoho update failed:", response.data);
      return false;
    }
  } catch (error) {
    console.error("Error updating lead in Zoho:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Status:", error.response.status);
    }
    return false; // Don't interrupt the user flow on update errors
  }
}

/**
 * Specialized function to update ONLY contact info (name and phone)
 * This ensures these fields are explicitly sent to Zoho
 */
export async function updateContactInfo(leadId, name, phone, email = '') {
  if (!leadId) {
    console.error("Cannot update contact: Missing lead ID");
    return false;
  }
  
  // Don't attempt to update temporary IDs
  if (leadId.startsWith("temp_")) {
    console.log("Using temporary ID - contact update skipped");
    return true;
  }
  
  try {
    // Process name field for Zoho
    let firstName = '';
    let lastName = '';
    
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        lastName = name;
      }
    }
    
    // Contact data only - using both Zoho specific fields and generic fields
    const contactData = {
      // Generic field names handled by our API wrapper
      name: name || '',
      phone: phone || '',
      email: email || '',
      
      // Zoho-specific field names (these will be used directly)
      First_Name: firstName,
      Last_Name: lastName || 'Contact',
      Phone: phone || '',
      Email: email || '',
      
      // Update lead stage
      leadStage: 'Contact Info Provided'
    };
    
    console.log("DIRECT CONTACT UPDATE:", {
      leadId,
      name,
      firstName,
      lastName,
      phone
    });
    
    // Make the API call - this only updates contact fields, nothing else
    const response = await axios.post('/api/zoho', {
      action: 'update',
      leadId,
      formData: contactData,
      debug: true
    });
    
    if (response.data && response.data.success) {
      console.log("Contact info update successful");
      return true;
    } else {
      console.error("Contact info update failed:", response.data);
      return false;
    }
  } catch (error) {
    console.error("Error updating contact info:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    return false;
  }
}

export async function createSuggestionLead(partialAddress, suggestions, leadId = null, addressComponents = null) {
  try {
    // If we already have a leadId, use update action, otherwise create
    const action = leadId ? 'update' : 'create';
    
    // Format the suggestions and store individually for better tracking
    const preparedData = {
      // Only include userTypedAddress, not the official street address
      userTypedAddress: partialAddress || '',
      
      // Store top 5 suggestions individually
      suggestionOne: suggestions[0]?.description || '',
      suggestionTwo: suggestions[1]?.description || '',
      suggestionThree: suggestions[2]?.description || '',
      suggestionFour: suggestions[3]?.description || '',
      suggestionFive: suggestions[4]?.description || '',
      
      // Lead classification
      leadSource: 'Address Entry',
      leadStage: 'Address Typing',
      addressSelectionType: 'Partial',
      
      // Set a default name to avoid "Lead" default
      name: 'Property Lead',
      
      // Initialize phone to empty string to avoid undefined
      phone: ''
    };
    
    // Only add address components if explicitly provided and this is a final selection
    if (addressComponents && addressComponents.city) {
      preparedData.city = addressComponents.city;
      preparedData.state = addressComponents.state || 'GA';
      preparedData.zip = addressComponents.zip || '';
      preparedData.street = partialAddress; // Only set street if we have other components
      preparedData.leadStage = 'Address Selected'; // Update the stage
    }
    
    // Log the suggestions
    console.log(`${action} suggestion lead with partial address: "${partialAddress}"`);
    console.log("Top suggestions:", {
      sugg1: preparedData.suggestionOne,
      sugg2: preparedData.suggestionTwo,
      sugg3: preparedData.suggestionThree,
      sugg4: preparedData.suggestionFour,
      sugg5: preparedData.suggestionFive,
      address: {
        street: preparedData.street,
        city: preparedData.city,
        state: preparedData.state,
        zip: preparedData.zip
      }
    });
    
    // Prepare the request
    const requestData = {
      action,
      formData: preparedData,
      debug: false
    };
    
    // Add leadId if updating
    if (leadId) {
      requestData.leadId = leadId;
    }
    
    // Send to API
    const response = await axios.post('/api/zoho', requestData);
    
    if (response.data && response.data.success) {
      // Return the lead ID
      const newLeadId = leadId || response.data.leadId;
      console.log(`Successfully ${action}d suggestion lead with ID: ${newLeadId}`);
      return newLeadId;
    } else {
      console.warn("Suggestion lead operation didn't return success:", response.data);
      // Return the existing leadId if available, to maintain continuity
      return leadId; 
    }
  } catch (error) {
    console.error("Error in suggestion lead operation:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    // Return the existing leadId if there was an error, to maintain continuity
    return leadId;
  }
}