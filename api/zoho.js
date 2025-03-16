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
    const { action, leadId, formData, propertyRecord, userId } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'Missing action parameter' });
    }
    
    // Handle simple ping test
    if (action === 'ping') {
      return res.status(200).json({ success: true, message: 'API endpoint is working' });
    }
    
    const token = await getAccessToken();
    
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
      
      // Convert boolean string values to actual booleans
      const convertStringToBoolean = (value) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
      };

      // Create a new lead
      const payload = {
        data: [
          {
            // Basic contact information
            First_Name: firstName,
            Last_Name: lastName,
            Phone: formData.phone,
            Email: formData.email || "",
            
            // Address information
            Street: formData.street,
            City: formData.city || "",
            Zip_Code: formData.zip || "",
            State: formData.state || "GA", // Default state
            
            // Lead metadata
            Lead_Source: formData.trafficSource || "Website",
            Description: `Property Address: ${formData.street}\n${formData.additionalInfo || ''}`,
            Lead_Status: "New",
            
            // Property details
            Property_Owner: convertStringToBoolean(formData.isPropertyOwner),
            Needs_Repairs: convertStringToBoolean(formData.needsRepairs),
            Working_with_Agent: convertStringToBoolean(formData.workingWithAgent),
            Property_Type: formData.homeType || "",
            Remaining_Mortgage: parseFloat(formData.remainingMortgage) || 0,
            Square_Footage: parseFloat(formData.finishedSquareFootage) || 0,
            Basement_Square_Footage: parseFloat(formData.basementSquareFootage) || 0,
            Timeframe_to_Sell: formData.howSoonSell || "",
            
            // Additional property details
            Bedrooms: formData.bedrooms || "",
            Bathrooms: formData.bathrooms || "",
            Floors: formData.floors || "",
            Has_Garage: formData.hasGarage || "",
            Garage_Capacity: formData.garageCapacity || "",
            Has_HOA: formData.hasHOA || "",
            Has_Solar: formData.hasSolar || "",
            Planning_To_Buy: formData.planningToBuy || "",
            Septic_Or_Sewer: formData.septicOrSewer || "",
            Known_Issues: formData.knownIssues || "",
            Reason_For_Selling: formData.reasonForSelling || "",
            
            // Appointment information
            Want_to_Set_Appointment: convertStringToBoolean(formData.wantToSetAppointment),
            Appointment_Date: formData.selectedAppointmentDate || "",
            Appointment_Time: formData.selectedAppointmentTime || "",
            
            // Property valuation
            API_Owner_Name: formData.apiOwnerName || "",
            API_Estimated_Value: parseFloat(formData.apiEstimatedValue) || 0,
            
            // Marketing information
            Campaign_Name: formData.campaignName || "",
            Ad_Group: formData.adgroupName || "",
            Keyword: formData.keyword || "",
            Device: formData.device || "",
            GCLID: formData.gclid || "",
            URL: formData.url || ""
          }
        ]
      };
      
      console.log("Creating lead with payload:", JSON.stringify(payload, null, 2));
      
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
          leadId: response.data.data[0].id 
        });
      } else {
        return res.status(500).json({ error: 'No lead ID returned from Zoho CRM' });
      }
      
    } else if (action === 'update' && leadId && formData) {
      // Convert boolean string values to actual booleans
      const convertStringToBoolean = (value) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
      };
      
      // Update existing lead with all available fields
      const payload = {
        data: [
          {
            id: leadId,
            
            // Property details
            Property_Owner: convertStringToBoolean(formData.isPropertyOwner),
            Needs_Repairs: convertStringToBoolean(formData.needsRepairs),
            Working_with_Agent: convertStringToBoolean(formData.workingWithAgent),
            Property_Type: formData.homeType || "",
            Remaining_Mortgage: parseFloat(formData.remainingMortgage) || 0,
            Square_Footage: parseFloat(formData.finishedSquareFootage) || 0,
            Basement_Square_Footage: parseFloat(formData.basementSquareFootage) || 0,
            Timeframe_to_Sell: formData.howSoonSell || "",
            
            // Additional property details
            Bedrooms: formData.bedrooms || "",
            Bathrooms: formData.bathrooms || "",
            Floors: formData.floors || "",
            Has_Garage: formData.hasGarage || "",
            Garage_Capacity: formData.garageCapacity || "",
            Has_HOA: formData.hasHOA || "",
            Has_Solar: formData.hasSolar || "",
            Planning_To_Buy: formData.planningToBuy || "",
            Septic_Or_Sewer: formData.septicOrSewer || "",
            Known_Issues: formData.knownIssues || "",
            Reason_For_Selling: formData.reasonForSelling || "",
            
            // Appointment information
            Want_to_Set_Appointment: convertStringToBoolean(formData.wantToSetAppointment),
            Appointment_Date: formData.selectedAppointmentDate || "",
            Appointment_Time: formData.selectedAppointmentTime || "",
            
            // Add any additional fields that might have been updated
            Description: formData.additionalInfo ? 
              `Additional information: ${formData.additionalInfo}` : undefined
          }
        ]
      };
      
      console.log("Updating lead with payload:", JSON.stringify(payload, null, 2));
      
      await axios.put(
        `${ZOHO_API_DOMAIN}/crm/v2/Leads`,
        payload,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return res.status(200).json({ success: true });
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
      
      await axios.post(
        `${ZOHO_API_DOMAIN}/crm/v2/Notes`,
        notePayload,
        {
          headers: {
            'Authorization': `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return res.status(200).json({ success: true });
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