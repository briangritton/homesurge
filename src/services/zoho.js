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
 * Submit new lead to Zoho CRM
 * @param {Object} formData - The form data to submit
 * @returns {Promise<string>} - The ID of the created lead
 */
export async function submitLeadToZoho(formData) {
  try {
    // Include all relevant property data from Melissa API
    const preparedData = {
      // Basic user info
      name: formData.name || '',
      phone: formData.phone || '',
      email: formData.email || '',
      
      // Address info - making sure we're using the internal field names
      // (these will be mapped to Zoho's field names in the API call)
      street: formData.street || '',
      city: formData.city || '',
      zip: formData.zip || '',
      state: formData.state || 'GA',
      
      // Address suggestion tracking
      userTypedAddress: formData.userTypedAddress || '',
      selectedSuggestionAddress: formData.selectedSuggestionAddress || '',
      suggestionOne: formData.suggestionOne || '',
      suggestionTwo: formData.suggestionTwo || '',
      suggestionThree: formData.suggestionThree || '',
      suggestionFour: formData.suggestionFour || '',
      suggestionFive: formData.suggestionFive || '',
      
      // Property data from Melissa API
      apiOwnerName: formData.apiOwnerName || '',
      apiEstimatedValue: formData.apiEstimatedValue?.toString() || '0',
      apiMaxHomeValue: formData.apiMaxHomeValue?.toString() || '0',
      formattedApiEstimatedValue: formData.formattedApiEstimatedValue || '$0',
      
      // New equity data
      apiEquity: formData.apiEquity?.toString() || '0',
      apiPercentage: formData.apiPercentage?.toString() || '0',
      
      // Property qualification data
      isPropertyOwner: formData.isPropertyOwner || 'true',
      needsRepairs: formData.needsRepairs || 'false', // Make sure this is included
      workingWithAgent: formData.workingWithAgent || 'false',
      homeType: formData.homeType || 'Single Family',
      
      // Appointment info
      wantToSetAppointment: formData.wantToSetAppointment || 'false',
      selectedAppointmentDate: formData.selectedAppointmentDate || '',
      selectedAppointmentTime: formData.selectedAppointmentTime || '',
      
      // Location data
      location: formData.location ? JSON.stringify(formData.location) : '',
      
      // Additional property details
      bedrooms: formData.bedrooms?.toString() || '',
      bathrooms: formData.bathrooms?.toString() || '',
      finishedSquareFootage: formData.finishedSquareFootage?.toString() || '',
      
      // Tracking parameters
      trafficSource: formData.trafficSource || 'Direct',
      url: formData.url || '',
      gclid: formData.gclid || '',
      device: formData.device || '',
      campaignName: formData.campaignName || '',
      adgroupName: formData.adgroupName || '',
      keyword: formData.keyword || '',
      addressSelectionType: formData.addressSelectionType || 'Manual',
      leadSource: formData.leadSource || 'Website',
      leadStage: formData.leadStage || 'New'
    };
    
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
      }
    });
    
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
  
  try {
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
    
    // Include all relevant fields to ensure complete updates
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
      // (these will be mapped to Zoho's field names in the API call)
      street: formData.street || '',
      city: formData.city || '',
      state: formData.state || '',
      zip: formData.zip || '',
      
      // Property qualifications - using exact field names from Zoho API
      isPropertyOwner: formData.isPropertyOwner || '',
      needsRepairs: formData.needsRepairs || '', 
      workingWithAgent: formData.workingWithAgent || '',
      homeType: formData.homeType || '',
      remainingMortgage: formData.remainingMortgage?.toString() || '',
      finishedSquareFootage: formData.finishedSquareFootage?.toString() || '',
      basementSquareFootage: formData.basementSquareFootage?.toString() || '',
      howSoonSell: formData.howSoonSell || '',
      "How soon do you want to sell?": formData.howSoonSell || '',
      
      // Property data from Melissa API (in case they weren't in initial creation)
      apiOwnerName: formData.apiOwnerName || '',
      apiEstimatedValue: formData.apiEstimatedValue?.toString() || '',
      apiMaxHomeValue: formData.apiMaxHomeValue?.toString() || '',
      apiHomeValue: formData.apiEstimatedValue?.toString() || '',
      apiEquity: formData.apiEquity?.toString() || '',
      apiPercentage: formData.apiPercentage?.toString() || '',
      
      // Appointment information
      wantToSetAppointment: formData.wantToSetAppointment || '',
      selectedAppointmentDate: formData.selectedAppointmentDate || '',
      selectedAppointmentTime: formData.selectedAppointmentTime || '',
      
      // Lead tracking info
      leadSource: formData.leadSource || '',
      leadStage: formData.leadStage || '',
      addressSelectionType: formData.addressSelectionType || '',
      
      // Progress tracking
      qualifyingQuestionStep: formData.qualifyingQuestionStep?.toString() || ''
    };
    
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