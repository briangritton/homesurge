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
      // Create a new lead
      const payload = {
        data: [
          {
            Last_Name: formData.name || "Lead",
            First_Name: "",
            Phone: formData.phone,
            Email: formData.email || "",
            Street: formData.street,
            City: formData.city || "",
            Zip_Code: formData.zip || "",
            State: "GA", // Default state
            Lead_Source: formData.trafficSource || "Website",
            Description: `Street: ${formData.street}`,
            Lead_Status: "New",
            
            // Custom fields with exact names from Zoho CRM
            "Are you the property owner?": formData.isPropertyOwner === 'true' ? true : false,
            "Does the property need any major repairs?": formData.needsRepairs === 'true' ? true : false,
            "Are you working with a real estate agent?": formData.workingWithAgent === 'true' ? true : false,
            "What type of property is it?": formData.homeType || "",
            "What is your remaining mortgage amount?": parseInt(formData.remainingMortgage) || 0,
            "What is your finished square footage?": parseInt(formData.finishedSquareFootage) || 0,
            "What is your unfinished basement square footage?": parseInt(formData.basementSquareFootage) || 0,
            "How soon do you want to sell?": formData.howSoonSell || "",
            "Why are you selling?": formData.reasonForSelling || "",
            "Do you have a garage?": formData.garage || "",
            "How many cars can fit in your garage?": formData.garageCars || "",
            "Do you have an HOA?": formData.hasHoa || "",
            "Does your home have solar panels?": formData.hasSolar || "",
            "Are you planning to buy a home?": formData.planningToBuy || "",
            "Do you have septic or sewer?": formData.septicOrSewer || "",
            "Does your home have any known issues or necessary": formData.knownIssues || "",
            "Do you want to set a virtual appointment?": formData.wantToSetAppointment === 'true' ? true : false,
            "Select your preferred appointment date.": formData.selectedAppointmentDate || "",
            "Select your preferred appointment time ?": formData.selectedAppointmentTime || "",
            "Number of bedrooms?": formData.bedrooms || "",
            "Number of bathrooms?": formData.bathrooms || "",
            "How many floor does your home have?": formData.floors || "",
            
            // Marketing information
            trafficSource: formData.trafficSource || "",
            campaignName: formData.campaignName || "",
            adgroupName: formData.adgroupName || "",
            device: formData.device || "",
            gclid: formData.gclid || "",
            URL: formData.url || ""
          }
        ]
      };
      
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
      // Update existing lead
      const payload = {
        data: [
          {
            id: leadId,
            "Are you the property owner?": formData.isPropertyOwner === 'true' ? true : false,
            "Does the property need any major repairs?": formData.needsRepairs === 'true' ? true : false,
            "Are you working with a real estate agent?": formData.workingWithAgent === 'true' ? true : false,
            "What type of property is it?": formData.homeType || "",
            "What is your remaining mortgage amount?": parseInt(formData.remainingMortgage) || 0,
            "What is your finished square footage?": parseInt(formData.finishedSquareFootage) || 0,
            "What is your unfinished basement square footage?": parseInt(formData.basementSquareFootage) || 0,
            "How soon do you want to sell?": formData.howSoonSell || "",
            "Why are you selling?": formData.reasonForSelling || "",
            "Do you have a garage?": formData.garage || "",
            "How many cars can fit in your garage?": formData.garageCars || "",
            "Do you have an HOA?": formData.hasHoa || "",
            "Does your home have solar panels?": formData.hasSolar || "",
            "Are you planning to buy a home?": formData.planningToBuy || "",
            "Do you have septic or sewer?": formData.septicOrSewer || "",
            "Does your home have any known issues or necessary": formData.knownIssues || "",
            "Do you want to set a virtual appointment?": formData.wantToSetAppointment === 'true' ? true : false,
            "Select your preferred appointment date.": formData.selectedAppointmentDate || "",
            "Select your preferred appointment time ?": formData.selectedAppointmentTime || ""
          }
        ]
      };
      
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
      // You'd need to adjust this based on your actual Zoho CRM structure
      console.log('Saving property record:', propertyRecord);
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