// src/services/zoho.js
import axios from 'axios';

/**
 * Submit new lead to Zoho CRM
 * @param {Object} formData - The form data to submit
 * @returns {Promise<string>} - The ID of the created lead
 */
export async function submitLeadToZoho(formData) {
  try {
    // Ensure all values are properly formatted for Zoho (strings for text fields)
    const preparedFormData = prepareFormDataForZoho(formData);
    
    console.log("Submitting lead to Zoho:", { formData: preparedFormData });
    const response = await axios.post('/api/zoho', {
      action: 'create',
      formData: preparedFormData
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
    // Ensure all values are properly formatted for Zoho (strings for text fields)
    const preparedFormData = prepareFormDataForZoho(formData);
    
    console.log("Updating lead in Zoho:", { leadId, formData: preparedFormData });
    const response = await axios.post('/api/zoho', {
      action: 'update',
      leadId,
      formData: preparedFormData
    });
    
    console.log("Zoho API update response:", response.data);
    
    if (!response.data || !response.data.success) {
      throw new Error('Update failed');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating lead in Zoho:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data
    });
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
    console.log("Saving property record to Zoho:", { propertyRecord, leadId, userId });
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

/**
 * Prepares form data for Zoho by ensuring correct field names and types
 * @param {Object} formData - The original form data
 * @returns {Object} - Prepared form data for Zoho
 */
function prepareFormDataForZoho(formData) {
  const prepared = { ...formData };
  
  // Convert any numeric fields to strings since Zoho has them as text fields
  if (prepared.remainingMortgage !== undefined) {
    prepared.remainingMortgage = prepared.remainingMortgage.toString();
  }
  
  if (prepared.finishedSquareFootage !== undefined) {
    prepared.finishedSquareFootage = prepared.finishedSquareFootage.toString();
  }
  
  if (prepared.basementSquareFootage !== undefined) {
    prepared.basementSquareFootage = prepared.basementSquareFootage.toString();
  }
  
  if (prepared.bedrooms !== undefined) {
    prepared.bedrooms = prepared.bedrooms.toString();
  }
  
  if (prepared.bathrooms !== undefined) {
    prepared.bathrooms = prepared.bathrooms.toString();
  }
  
  if (prepared.floors !== undefined) {
    prepared.floors = prepared.floors.toString();
  }
  
  // Handle field name differences
  if (prepared.needsRepairs !== undefined) {
    prepared.needRepairs = prepared.needsRepairs; // Fix field name
    delete prepared.needsRepairs;
  }
  
  if (prepared.hasGarage !== undefined) {
    prepared.garage = prepared.hasGarage; // Fix field name
    delete prepared.hasGarage;
  }
  
  if (prepared.garageCapacity !== undefined) {
    prepared.garageCars = prepared.garageCapacity.toString(); // Fix field name
    delete prepared.garageCapacity;
  }
  
  if (prepared.hasHOA !== undefined) {
    prepared.hasHoa = prepared.hasHOA; // Fix casing
    delete prepared.hasHOA;
  }
  
  // Add both possible field names for howSoonSell
  if (prepared.howSoonSell !== undefined) {
    prepared["How soon do you want to sell?"] = prepared.howSoonSell;
  }
  
  // Convert property value fields to strings
  if (prepared.apiEstimatedValue !== undefined) {
    prepared.apiHomeValue = prepared.apiEstimatedValue.toString();
  }
  
  if (prepared.apiMaxHomeValue !== undefined) {
    prepared.apiMaxHomeValue = prepared.apiMaxHomeValue.toString();
  }
  
  if (prepared.apiEquity !== undefined) {
    prepared.apiEquity = prepared.apiEquity.toString();
  }
  
  if (prepared.apiPercentage !== undefined) {
    prepared.apiPercentage = prepared.apiPercentage.toString();
  }
  
  if (prepared.qualifyingQuestionStep !== undefined) {
    prepared.qualifyingQuestionStep = prepared.qualifyingQuestionStep.toString();
  }
  
  return prepared;
}