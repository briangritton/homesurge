// src/services/zoho.js
import axios from 'axios';

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
      
      // Address info
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
      leadStage: preparedData.leadStage
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
    // Include all relevant fields to ensure complete updates
    const updateData = {
      // Address suggestion tracking
      userTypedAddress: formData.userTypedAddress || '',
      selectedSuggestionAddress: formData.selectedSuggestionAddress || '',
      suggestionOne: formData.suggestionOne || '',
      suggestionTwo: formData.suggestionTwo || '',
      suggestionThree: formData.suggestionThree || '',
      suggestionFour: formData.suggestionFour || '',
      suggestionFive: formData.suggestionFive || '',
      
      // Basic address info if updated
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
      
      // Property data from Melissa API (in case it wasn't sent in initial creation)
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
        leadStage: updateData.leadStage
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
 * Create or update a lead with address suggestions
 * @param {string} partialAddress - The partial address the user has typed
 * @param {Array} suggestions - Array of address suggestions
 * @param {string} leadId - Optional leadId if we're updating an existing lead
 * @returns {Promise<string>} - The ID of the created or updated lead
 */
export async function createSuggestionLead(partialAddress, suggestions, leadId = null) {
  try {
    // If we already have a leadId, use update action, otherwise create
    const action = leadId ? 'update' : 'create';
    
    // Format the suggestions and store individually for better tracking
    const preparedData = {
      // Basic info
      street: partialAddress || '',
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
      trafficSource: 'Website'
    };
    
    // Log the suggestions
    console.log(`${action} suggestion lead with partial address: "${partialAddress}"`);
    console.log("Top suggestions:", {
      sugg1: preparedData.suggestionOne,
      sugg2: preparedData.suggestionTwo,
      sugg3: preparedData.suggestionThree,
      sugg4: preparedData.suggestionFour,
      sugg5: preparedData.suggestionFive
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