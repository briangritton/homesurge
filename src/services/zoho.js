import axios from 'axios';

/**
 * Submit new lead to Zoho CRM
 * @param {Object} formData - The form data to submit
 * @returns {Promise<string>} - The ID of the created lead
 */
export async function submitLeadToZoho(formData) {
  try {
    console.log("Attempting to submit lead to Zoho:", { formData });
    const response = await axios.post('/api/zoho', {
      action: 'create',
      formData
    });
    
    console.log("Zoho API response:", response.data);
    
    if (response.data && response.data.success) {
      return response.data.leadId;
    } else {
      throw new Error('No lead ID returned');
    }
  } catch (error) {
    console.error("Error submitting lead to Zoho:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
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
  try {
    const response = await axios.post('/api/zoho', {
      action: 'update',
      leadId,
      formData
    });
    
    if (!response.data || !response.data.success) {
      throw new Error('Update failed');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating lead in Zoho:', error);
    throw new Error(error.response?.data?.error || 'Failed to update lead');
  }
}

/**
 * Save property record data to Zoho
 * @param {Object} propertyRecord - The property record data
 * @param {string} leadId - The ID of the lead
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>}
 */
export async function savePropertyRecord(propertyRecord, leadId, userId) {
  try {
    const response = await axios.post('/api/zoho', {
      action: 'saveRecord',
      propertyRecord,
      leadId,
      userId
    });
    
    if (!response.data || !response.data.success) {
      throw new Error('Save property record failed');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving property record:', error);
    // If this fails, we don't want to stop the whole process
    return false;
  }
}