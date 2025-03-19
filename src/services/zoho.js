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
      addressSelectionType: formData.addressSelectionType || 'Manual'
    };
    
    console.log("Submitting lead to Zoho with property and appointment data:", {
      needsRepairs: preparedData.needsRepairs,
      appointmentDate: preparedData.selectedAppointmentDate,
      appointmentTime: preparedData.selectedAppointmentTime,
      apiOwnerName: preparedData.apiOwnerName,
      apiEstimatedValue: preparedData.apiEstimatedValue,
      apiMaxHomeValue: preparedData.apiMaxHomeValue,
      apiEquity: preparedData.apiEquity,
      apiPercentage: preparedData.apiPercentage
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
      // Property qualifications - using exact field names from Zoho API
      isPropertyOwner: formData.isPropertyOwner || 'true',
      needsRepairs: formData.needsRepairs || 'false', 
      workingWithAgent: formData.workingWithAgent || 'false',
      homeType: formData.homeType || 'Single Family',
      remainingMortgage: formData.remainingMortgage?.toString() || '0',
      finishedSquareFootage: formData.finishedSquareFootage?.toString() || '0',
      basementSquareFootage: formData.basementSquareFootage?.toString() || '0',
      howSoonSell: formData.howSoonSell || 'ASAP',
      "How soon do you want to sell?": formData.howSoonSell || 'ASAP',
      
      // Property data from Melissa API (in case it wasn't sent in initial creation)
      apiOwnerName: formData.apiOwnerName || '',
      apiEstimatedValue: formData.apiEstimatedValue?.toString() || '0',
      apiMaxHomeValue: formData.apiMaxHomeValue?.toString() || '0',
      apiHomeValue: formData.apiEstimatedValue?.toString() || '0',
      apiEquity: formData.apiEquity?.toString() || '0',
      apiPercentage: formData.apiPercentage?.toString() || '0',
      
      // Appointment information
      wantToSetAppointment: formData.wantToSetAppointment || 'false',
      selectedAppointmentDate: formData.selectedAppointmentDate || '',
      selectedAppointmentTime: formData.selectedAppointmentTime || '',
      
      // Progress tracking
      qualifyingQuestionStep: formData.qualifyingQuestionStep?.toString() || '1'
    };
    
    console.log("Updating lead in Zoho:", { 
      leadId, 
      data: {
        needsRepairs: updateData.needsRepairs,
        wantToSetAppointment: updateData.wantToSetAppointment,
        selectedAppointmentDate: updateData.selectedAppointmentDate,
        selectedAppointmentTime: updateData.selectedAppointmentTime,
        apiEquity: updateData.apiEquity,
        apiPercentage: updateData.apiPercentage
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