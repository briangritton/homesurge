// src/services/zoho.js
import axios from 'axios';

/**
 * Submit new lead to Zoho CRM
 * @param {Object} formData - The form data to submit
 * @returns {Promise<string>} - The ID of the created lead
 */
export async function submitLeadToZoho(formData) {
  try {
    // Ensure all required fields are present in a simplified manner
    const preparedData = {
      name: formData.name || '',
      phone: formData.phone || '',
      email: formData.email || '',
      street: formData.street || '',
      city: formData.city || '',
      zip: formData.zip || '',
      state: formData.state || 'GA',
      // Include tracking parameters
      trafficSource: formData.trafficSource || 'Direct',
      url: formData.url || '',
      gclid: formData.gclid || '',
      device: formData.device || '',
      campaignName: formData.campaignName || '',
      adgroupName: formData.adgroupName || '',
      keyword: formData.keyword || ''
    };
    
    console.log("Submitting lead to Zoho:", preparedData);
    const response = await axios.post('/api/zoho', {
      action: 'create',
      formData: preparedData
    });
    
    console.log("Zoho API response:", response.data);
    
    if (response.data && response.data.success) {
      return response.data.leadId;
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
  
  try {
    // Include only the essential fields to update
    const updateData = {
      // Property qualifications
      isPropertyOwner: formData.isPropertyOwner || 'true',
      needsRepairs: formData.needsRepairs || 'false',
      workingWithAgent: formData.workingWithAgent || 'false',
      homeType: formData.homeType || 'Single Family',
      howSoonSell: formData.howSoonSell || '',
      // Appointment information
      wantToSetAppointment: formData.wantToSetAppointment || 'false',
      selectedAppointmentDate: formData.selectedAppointmentDate || '',
      selectedAppointmentTime: formData.selectedAppointmentTime || '',
      // Progress tracking
      qualifyingQuestionStep: formData.qualifyingQuestionStep?.toString() || '1'
    };
    
    console.log("Updating lead in Zoho:", { leadId, data: updateData });
    const response = await axios.post('/api/zoho', {
      action: 'update',
      leadId,
      formData: updateData
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