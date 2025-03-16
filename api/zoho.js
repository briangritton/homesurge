// api/zoho.js
const axios = require('axios');

// Zoho credentials from environment variables
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID || "1000.LGKLH514KZLSSXEHNZACB3GGF4LJVN";
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || "6fffecc107326530c6ccdcf39d7237832f048b190d";
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN || "1000.5bfeff607130f3406d5b180df07cce3d.ac515fa8d3f4774f5dde44cbb37ce52b";
const ZOHO_API_DOMAIN = "https://www.zohoapis.com";

// In-memory token cache
let accessToken = '';
let tokenExpiry = 0;

async function getAccessToken() {
  const now = Date.now();
  
  if (accessToken && tokenExpiry > now) {
    return accessToken;
  }
  
  try {
    const response = await axios.post(
      'https://accounts.zoho.com/oauth/v2/token',
      null,
      {
        params: {
          refresh_token: ZOHO_REFRESH_TOKEN,
          client_id: ZOHO_CLIENT_ID,
          client_secret: ZOHO_CLIENT_SECRET,
          grant_type: 'refresh_token'
        }
      }
    );
    
    accessToken = response.data.access_token;
    tokenExpiry = now + (response.data.expires_in * 1000);
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Zoho access token:', error);
    throw new Error('Failed to authenticate with Zoho CRM');
  }
}

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { action, leadId, formData, propertyRecord, userId, debug } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'Missing action parameter' });
    }
    
    // Handle simple ping test
    if (action === 'ping') {
      if (debug) {
        try {
          const token = await getAccessToken();
          return res.status(200).json({ 
            success: true, 
            message: 'API endpoint is working',
            debug: {
              token: token ? 'Valid token retrieved' : 'Failed to get token',
              tokenExpiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : 'No expiry set'
            }
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'API endpoint is working but token retrieval failed',
            error: error.message
          });
        }
      }
      return res.status(200).json({ success: true, message: 'API endpoint is working' });
    }
    
    const token = await getAccessToken();
    
    // Action to get lead field definitions
    if (action === 'getFields') {
      const response = await axios.get(
        `${ZOHO_API_DOMAIN}/crm/v2/settings/fields?module=Leads`,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Format the fields to be more readable
      const formattedFields = response.data.fields.map(field => ({
        apiName: field.api_name,
        displayName: field.field_label,
        dataType: field.data_type,
        required: field.system_mandatory,
        customField: field.custom_field,
        length: field.length,
        options: field.pick_list_values?.map(v => v.display_value) || []
      }));
      
      return res.status(200).json({
        success: true,
        fields: formattedFields,
        rawResponse: debug ? response.data : undefined
      });
    }
    
    // Action to get a specific lead
    if (action === 'getLead' && leadId) {
      const response = await axios.get(
        `${ZOHO_API_DOMAIN}/crm/v2/Leads/${leadId}`,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return res.status(200).json({
        success: true,
        lead: response.data.data[0],
        rawResponse: debug ? response.data : undefined
      });
    }
    
    if (action === 'create' && formData) {
      // Prepare name field - Zoho requires Last_Name at minimum
      let firstName = '';
      let lastName = 'Lead';
      
      if (formData.name) {
        const nameParts = formData.name.split(' ');
        if (nameParts.length >= 2) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else {
          lastName = formData.name;
        }
      }
      
      // Create a new lead with bare minimum fields to test
      if (Object.keys(formData).length <= 3 && formData.name && formData.phone) {
        // This is a minimal test lead
        const payload = {
          data: [
            {
              First_Name: firstName,
              Last_Name: lastName,
              Phone: formData.phone,
              Email: formData.email || "",
              Lead_Source: "Test"
            }
          ]
        };
        
        console.log("Creating minimal test lead with payload:", JSON.stringify(payload, null, 2));
        
        const response = await axios.post(
          `${ZOHO_API_DOMAIN}/crm/v2/Leads`,
          payload,
          {
            headers: {
              'Authorization': `Zoho-oauthtoken ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          return res.status(200).json({ 
            success: true, 
            leadId: response.data.data[0].id,
            fullResponse: debug ? response.data : undefined
          });
        } else {
          return res.status(500).json({ 
            error: 'No lead ID returned from Zoho CRM',
            fullResponse: debug ? response.data : undefined
          });
        }
      }
      
      // Convert boolean string values to actual booleans
      const convertStringToBoolean = (value) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
      };
      
      // Regular lead creation with all fields
      const payload = {
        data: [
          {
            // Basic information - standard fields
            First_Name: firstName,
            Last_Name: lastName,
            Phone: formData.phone,
            Email: formData.email || "",
            
            // Address
            Street: formData.street,
            City: formData.city || "",
            Zip_Code: formData.zip || "",
            State: "GA",
            
            // Lead metadata
            Lead_Source: formData.trafficSource || "Website",
            Description: `Property: ${formData.street}`,
            
            // Property details - try various field naming conventions
            // For property owner
            "Property Owner": convertStringToBoolean(formData.isPropertyOwner),
            Property_Owner: convertStringToBoolean(formData.isPropertyOwner),
            
            // For needs repairs
            "Needs Repairs": convertStringToBoolean(formData.needsRepairs),
            Needs_Repairs: convertStringToBoolean(formData.needsRepairs),
            
            // For working with agent
            "Working with Agent": convertStringToBoolean(formData.workingWithAgent),
            Working_with_Agent: convertStringToBoolean(formData.workingWithAgent),
            
            // For property type
            "Property Type": formData.homeType || "",
            Property_Type: formData.homeType || "",
            
            // For remaining mortgage
            "Remaining Mortgage": parseFloat(formData.remainingMortgage) || 0,
            Remaining_Mortgage: parseFloat(formData.remainingMortgage) || 0,
            
            // For square footage
            "Square Footage": parseFloat(formData.finishedSquareFootage) || 0,
            Square_Footage: parseFloat(formData.finishedSquareFootage) || 0,
            
            // For basement square footage
            "Basement Square Footage": parseFloat(formData.basementSquareFootage) || 0,
            Basement_Square_Footage: parseFloat(formData.basementSquareFootage) || 0,
            
            // For timeframe to sell
            "Timeframe to Sell": formData.howSoonSell || "",
            Timeframe_to_Sell: formData.howSoonSell || "",
            
            // Marketing
            "Campaign Name": formData.campaignName || "",
            Campaign_Name: formData.campaignName || "",
            
            "Ad Group": formData.adgroupName || "",
            Ad_Group: formData.adgroupName || "",
            
            Keyword: formData.keyword || "",
            Device: formData.device || "",
            GCLID: formData.gclid || "",
            URL: formData.url || ""
          }
        ]
      };
      
      console.log("Creating lead with payload:", JSON.stringify(payload, null, 2));
      
      try {
        const response = await axios.post(
          `${ZOHO_API_DOMAIN}/crm/v2/Leads`,
          payload,
          {
            headers: {
              'Authorization': `Zoho-oauthtoken ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          return res.status(200).json({ 
            success: true, 
            leadId: response.data.data[0].id,
            fullResponse: debug ? response.data : undefined,
            attemptedPayload: debug ? payload : undefined
          });
        } else {
          return res.status(500).json({ 
            error: 'No lead ID returned from Zoho CRM',
            fullResponse: debug ? response.data : undefined,
            attemptedPayload: debug ? payload : undefined
          });
        }
      } catch (error) {
        return res.status(500).json({ 
          error: 'Failed to create lead',
          message: error.message,
          details: error.response?.data,
          attemptedPayload: debug ? payload : undefined
        });
      }
    } else if (action === 'update' && leadId && formData) {
      // Convert boolean string values to actual booleans
      const convertStringToBoolean = (value) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
      };
      
      // Update payload with various field naming conventions
      const payload = {
        data: [
          {
            id: leadId,
            
            // Try various field naming conventions
            // For property owner
            "Property Owner": convertStringToBoolean(formData.isPropertyOwner),
            Property_Owner: convertStringToBoolean(formData.isPropertyOwner),
            
            // For needs repairs
            "Needs Repairs": convertStringToBoolean(formData.needsRepairs),
            Needs_Repairs: convertStringToBoolean(formData.needsRepairs),
            
            // For working with agent
            "Working with Agent": convertStringToBoolean(formData.workingWithAgent),
            Working_with_Agent: convertStringToBoolean(formData.workingWithAgent),
            
            // For property type
            "Property Type": formData.homeType || "",
            Property_Type: formData.homeType || "",
            
            // For remaining mortgage
            "Remaining Mortgage": parseFloat(formData.remainingMortgage) || 0,
            Remaining_Mortgage: parseFloat(formData.remainingMortgage) || 0,
            
            // For square footage
            "Square Footage": parseFloat(formData.finishedSquareFootage) || 0,
            Square_Footage: parseFloat(formData.finishedSquareFootage) || 0,
            
            // For basement square footage
            "Basement Square Footage": parseFloat(formData.basementSquareFootage) || 0,
            Basement_Square_Footage: parseFloat(formData.basementSquareFootage) || 0,
            
            // For timeframe to sell
            "Timeframe to Sell": formData.howSoonSell || "",
            Timeframe_to_Sell: formData.howSoonSell || "",
            
            // Appointment information
            "Want to Set Appointment": convertStringToBoolean(formData.wantToSetAppointment),
            Want_to_Set_Appointment: convertStringToBoolean(formData.wantToSetAppointment),
            
            "Appointment Date": formData.selectedAppointmentDate || "",
            Appointment_Date: formData.selectedAppointmentDate || "",
            
            "Appointment Time": formData.selectedAppointmentTime || "",
            Appointment_Time: formData.selectedAppointmentTime || ""
          }
        ]
      };
      
      try {
        const response = await axios.put(
          `${ZOHO_API_DOMAIN}/crm/v2/Leads`,
          payload,
          {
            headers: {
              'Authorization': `Zoho-oauthtoken ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        return res.status(200).json({ 
          success: true,
          fullResponse: debug ? response.data : undefined,
          attemptedPayload: debug ? payload : undefined
        });
      } catch (error) {
        return res.status(500).json({ 
          error: 'Failed to update lead',
          message: error.message,
          details: error.response?.data,
          attemptedPayload: debug ? payload : undefined
        });
      }
    } else if (action === 'saveRecord' && propertyRecord && leadId) {
      // This is a placeholder for saving property records
      // We'd need to adjust this based on the actual Zoho CRM structure
      // Potentially use Zoho Notes API to attach property data
      console.log('Saving property record:', propertyRecord);
      
      // Example implementation for saving as a Note in Zoho
      const notePayload = {
        data: [
          {
            Note_Title: "Property Record Data",
            Note_Content: JSON.stringify(propertyRecord, null, 2),
            Parent_Id: leadId,
            se_module: "Leads"
          }
        ]
      };
      
      try {
        const response = await axios.post(
          `${ZOHO_API_DOMAIN}/crm/v2/Notes`,
          notePayload,
          {
            headers: {
              'Authorization': `Zoho-oauthtoken ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        return res.status(200).json({ 
          success: true,
          fullResponse: debug ? response.data : undefined
        });
      } catch (error) {
        return res.status(500).json({ 
          error: 'Failed to save property record',
          message: error.message,
          details: error.response?.data
        });
      }
    } else {
      return res.status(400).json({ error: 'Invalid action or missing required parameters' });
    }
    
  } catch (error) {
    console.error('Error handling Zoho request:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      action: req.body.action,
      leadId: req.body.leadId
    });
    
    return res.status(500).json({ 
      error: 'Failed to process request', 
      details: error.response?.data || error.message 
    });
  }
};