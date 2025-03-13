import axios from 'axios';

// Determine the API base URL based on environment
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000/api';

/**
 * Submit new lead to Zoho CRM
 * @param {Object} formData - The form data to submit
 * @returns {Promise<string>} - The ID of the created lead
 */
export async function submitLeadToZoho(formData) {
  try {
    const response = await axios.post(`${API_BASE}/zoho`, {
      action: 'create',
      formData
    });
    
    if (response.data && response.data.success) {
      return response.data.leadId;
    } else {
      throw new Error('No lead ID returned');
    }
  } catch (error) {
    console.error('Error submitting lead to Zoho:', error);
    throw new Error(error.response?.data?.error || 'Failed to submit lead');
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
    const response = await axios.post(`${API_BASE}/zoho`, {
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
    const response = await axios.post(`${API_BASE}/zoho`, {
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

/**
 * Check API connection to Zoho
 * @returns {Promise<boolean>} - True if connection is successful
 */
export async function checkZohoConnection() {
  try {
    const response = await axios.post(`${API_BASE}/zoho`, {
      action: 'checkConnection'
    });
    
    return response.data && response.data.success;
  } catch (error) {
    console.error('Error checking Zoho connection:', error);
    return false;
  }
}