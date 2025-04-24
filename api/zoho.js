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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Zoho-Webhook-Token');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { action, leadId, formData, propertyRecord, userId, debug, event, status, customValue, additionalData } = req.body;
    
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
      let lastName = 'Property Lead'; // Better default than just "Lead"
      
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
          // Extract the lead ID from the correct location in the response
          const leadId = response.data.data[0].details?.id || response.data.data[0].id;
          return res.status(200).json({ 
            success: true, 
            leadId: leadId,  // Return the lead ID properly
            fullResponse: debug ? response.data : undefined
          });
        } else {
          return res.status(500).json({ 
            error: 'No lead ID returned from Zoho CRM',
            fullResponse: debug ? response.data : undefined
          });
        }
      }
      
      // Regular lead creation with all fields using the exact field names from Zoho
      const payload = {
        data: [
          {
            // Basic information - standard fields
            First_Name: firstName,
            Last_Name: lastName,
            Phone: formData.phone || "", // Ensure phone is never undefined
            Email: formData.email || "",
            
            // Address - Make sure we're using exact Zoho field names with proper capitalization
            Street: formData.street,
            City: formData.city || "",
            State: formData.state || "GA",
            Zip_Code: formData.zip || "",
            
            // Lead metadata
            Lead_Source: formData.trafficSource || "Website",
            Description: `Property: ${formData.street}`,
            
            // New address suggestion tracking fields
            userTypedAddress: formData.userTypedAddress || "",
            selectedSuggestionAddress: formData.selectedSuggestionAddress || "",
            suggestionOne: formData.suggestionOne || "",
            suggestionTwo: formData.suggestionTwo || "",
            suggestionThree: formData.suggestionThree || "",
            suggestionFour: formData.suggestionFour || "",
            suggestionFive: formData.suggestionFive || "",
            leadStage: formData.leadStage || "New",
            addressSelectionType: formData.addressSelectionType || "Manual",
            
            // Property details - using exact field names from Zoho
            isPropertyOwner: formData.isPropertyOwner || "true",
            // IMPORTANT: Make sure this is explicitly defined as a string
            needsRepairs: formData.needsRepairs ? formData.needsRepairs.toString() : "false",
            workingWithAgent: formData.workingWithAgent || "false",
            homeType: formData.homeType || "",
            remainingMortgage: formData.remainingMortgage?.toString() || "0",
            finishedSquareFootage: formData.finishedSquareFootage?.toString() || "0",
            basementSquareFootage: formData.basementSquareFootage?.toString() || "0",
            // Make sure both potential field names are included
            howSoonSell: formData.howSoonSell || "",
            "How soon do you want to sell?": formData.howSoonSell || "",
            
            // IMPORTANT: Melissa API data fields
            apiOwnerName: formData.apiOwnerName || "",
            apiMaxHomeValue: formData.apiMaxHomeValue?.toString() || "0", 
            apiHomeValue: formData.apiEstimatedValue?.toString() || "0",
            apiEstimatedValue: formData.apiEstimatedValue?.toString() || "0",
            
            // New equity fields
            apiEquity: formData.apiEquity?.toString() || "0",
            apiPercentage: formData.apiPercentage?.toString() || "0",
            
            // Appointment information - make sure these are explicitly set with string values
            wantToSetAppointment: formData.wantToSetAppointment ? formData.wantToSetAppointment.toString() : "false",
            selectedAppointmentDate: formData.selectedAppointmentDate || "",
            selectedAppointmentTime: formData.selectedAppointmentTime || "",
            // Add alternative field names that Zoho might be expecting
            AppointmentDate: formData.selectedAppointmentDate || "",
            AppointmentTime: formData.selectedAppointmentTime || "",
            
            // Additional property fields
            bedrooms: formData.bedrooms?.toString() || "",
            bathrooms: formData.bathrooms?.toString() || "",
            floors: formData.floors?.toString() || "",
            garage: formData.garage || "", // This is the field name in Zoho
            garageCars: formData.garageCars?.toString() || "",
            hasHoa: formData.hasHoa || "", // Correct casing
            hasSolar: formData.hasSolar || "",
            planningToBuy: formData.planningToBuy || "",
            septicOrSewer: formData.septicOrSewer || "",
            knownIssues: formData.knownIssues || "",
            reasonForSelling: formData.reasonForSelling || "",
            
            // Marketing information
            trafficSource: formData.trafficSource || "",
            campaignName: formData.campaignName || "",
            adgroupName: formData.adgroupName || "",
            device: formData.device || "",
            keyword: formData.keyword || "",
            gclid: formData.gclid || "",
            url: formData.url || "",
            
            // Dynamic content
            dynamicHeadline: formData.dynamicHeadline || "",
            dynamicSubHeadline: formData.dynamicSubHeadline || "",
            thankYouHeadline: formData.thankYouHeadline || "",
            thankYouSubHeadline: formData.thankYouSubHeadline || "",
            
            // Metadata
            addressSelectionType: formData.addressSelectionType || "Manual",
            qualifyingQuestionStep: formData.qualifyingQuestionStep?.toString() || "",
            userInputtedStreet: formData.userInputtedStreet || ""
          }
        ]
      };
      
      // Log the data being sent for debugging
      console.log("Creating lead with key fields:", 
        JSON.stringify({
          needsRepairs: formData.needsRepairs,
          wantToSetAppointment: formData.wantToSetAppointment,
          selectedAppointmentDate: formData.selectedAppointmentDate,
          selectedAppointmentTime: formData.selectedAppointmentTime,
          apiOwnerName: formData.apiOwnerName,
          apiEstimatedValue: formData.apiEstimatedValue,
          apiMaxHomeValue: formData.apiMaxHomeValue,
          apiEquity: formData.apiEquity,
          apiPercentage: formData.apiPercentage,
          userTypedAddress: formData.userTypedAddress,
          selectedSuggestionAddress: formData.selectedSuggestionAddress,
          suggestionsCount: formData.suggestionOne ? "Has suggestions" : "No suggestions",
          leadStage: formData.leadStage,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip
          }
        }, null, 2)
      );
      
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
          // Extract the lead ID from the correct location in the response
          const leadId = response.data.data[0].details?.id || response.data.data[0].id;
          return res.status(200).json({ 
            success: true, 
            leadId: leadId,  // Return the lead ID properly
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
      // Update existing lead with the exact field names from Zoho
      // Handle name field - Zoho requires Last_Name at minimum
      let firstName = '';
      let lastName = '';
      
      if (formData.name) {
        const nameParts = formData.name.split(' ');
        if (nameParts.length >= 2) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else {
          lastName = formData.name;
        }
      }
      
      // Log contact info being updated
      console.log("Updating lead with contact info:", {
        name: formData.name,
        firstName: firstName,
        lastName: lastName,
        phone: formData.phone
      });
      
      // Check direct Zoho field names first, then fallback to our field names
      const hasDirectZohoFields = formData.First_Name !== undefined || formData.Last_Name !== undefined;

      const payload = {
        data: [
          {
            id: leadId,
            
            // Always include these fields to ensure they get updated
            // Even if empty strings, this ensures old values are replaced
            // Use direct Zoho fields if provided, otherwise use our processed values
            First_Name: hasDirectZohoFields ? formData.First_Name : firstName,
            Last_Name: hasDirectZohoFields ? formData.Last_Name : (lastName || formData.name),
            Phone: formData.Phone !== undefined ? formData.Phone : (formData.phone || ""),
            Email: formData.Email !== undefined ? formData.Email : (formData.email || ""),
            
            // Address suggestion tracking fields
            userTypedAddress: formData.userTypedAddress || "",
            selectedSuggestionAddress: formData.selectedSuggestionAddress || "",
            suggestionOne: formData.suggestionOne || "",
            suggestionTwo: formData.suggestionTwo || "",
            suggestionThree: formData.suggestionThree || "",
            suggestionFour: formData.suggestionFour || "",
            suggestionFive: formData.suggestionFive || "",
            leadStage: formData.leadStage || "",
            addressSelectionType: formData.addressSelectionType || "",
            
            // Standard address fields - Make sure we're using exact Zoho field names with proper capitalization
            Street: formData.street || "",
            City: formData.city || "",
            State: formData.state || "",
            Zip_Code: formData.zip || "",
            
            // Property details - using exact field names from Zoho
            isPropertyOwner: formData.isPropertyOwner || "",
            // IMPORTANT: Make sure needsRepairs is explicitly set as a string
            needsRepairs: formData.needsRepairs ? formData.needsRepairs.toString() : "", 
            workingWithAgent: formData.workingWithAgent || "",
            homeType: formData.homeType || "",
            remainingMortgage: formData.remainingMortgage?.toString() || "",
            finishedSquareFootage: formData.finishedSquareFootage?.toString() || "",
            basementSquareFootage: formData.basementSquareFootage?.toString() || "",
            howSoonSell: formData.howSoonSell || "",
            "How soon do you want to sell?": formData.howSoonSell || "",
            
            // IMPORTANT: Melissa API data fields (in case they weren't in initial creation)
            apiOwnerName: formData.apiOwnerName || "",
            apiMaxHomeValue: formData.apiMaxHomeValue?.toString() || "", 
            apiHomeValue: formData.apiEstimatedValue?.toString() || "",
            apiEstimatedValue: formData.apiEstimatedValue?.toString() || "",
            
            // Equity fields
            apiEquity: formData.apiEquity?.toString() || "",
            apiPercentage: formData.apiPercentage?.toString() || "",
            
            // Appointment information - make sure these are explicitly set as strings
            wantToSetAppointment: formData.wantToSetAppointment ? formData.wantToSetAppointment.toString() : "",
            selectedAppointmentDate: formData.selectedAppointmentDate || "",
            selectedAppointmentTime: formData.selectedAppointmentTime || "",
            // Add alternative field names that Zoho might be expecting
            AppointmentDate: formData.selectedAppointmentDate || "",
            AppointmentTime: formData.selectedAppointmentTime || "",
            
            // Additional property fields
            bedrooms: formData.bedrooms?.toString() || "",
            bathrooms: formData.bathrooms?.toString() || "",
            floors: formData.floors?.toString() || "",
            garage: formData.garage || "", // Corrected field name
            garageCars: formData.garageCars?.toString() || "",
            hasHoa: formData.hasHoa || "", // Corrected casing
            hasSolar: formData.hasSolar || "",
            planningToBuy: formData.planningToBuy || "",
            septicOrSewer: formData.septicOrSewer || "",
            knownIssues: formData.knownIssues || "",
            reasonForSelling: formData.reasonForSelling || "",
            
            // Metadata
            qualifyingQuestionStep: formData.qualifyingQuestionStep?.toString() || ""
          }
        ]
      };
      
      // Log the data being updated for debugging
      console.log("Updating lead with key fields:", 
        JSON.stringify({
          needsRepairs: formData.needsRepairs,
          wantToSetAppointment: formData.wantToSetAppointment,
          selectedAppointmentDate: formData.selectedAppointmentDate,
          selectedAppointmentTime: formData.selectedAppointmentTime,
          apiEquity: formData.apiEquity,
          apiPercentage: formData.apiPercentage,
          userTypedAddress: formData.userTypedAddress,
          selectedSuggestionAddress: formData.selectedSuggestionAddress,
          leadStage: formData.leadStage,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip
          }
        }, null, 2)
      );
      
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
      // Save property record as a Note in Zoho
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
    } else if (action === 'track_conversion' && leadId && event) {
      // Handle conversion tracking
      console.log(`Tracking conversion event: ${event} for lead ${leadId}`);
      
      try {
        // If status is provided, update the lead status in Zoho
        if (status) {
          const updatePayload = {
            data: [
              {
                id: leadId,
                Status: status
              }
            ]
          };
          
          // If this is a transaction close event with an amount, update the transaction amount field
          if ((event === 'successfullyClosedTransaction' || event === 'closed') && customValue) {
            updatePayload.data[0].Transaction_Amount = customValue.toString();
          }
          
          // If this is a revenue recorded event with an amount, update the revenue field
          if (event === 'revenueRecorded' && customValue) {
            updatePayload.data[0].Revenue_Made = customValue.toString();
          }
          
          // If this is a contract signed event, update the contract field and status
          if (event === 'successfulClientAgreement') {
            updatePayload.data[0].signed_on_as_client = 'true';
            updatePayload.data[0].Status = 'Contract agreement signed';
          }
          
          await axios.put(
            `${ZOHO_API_DOMAIN}/crm/v2/Leads`,
            updatePayload,
            {
              headers: {
                'Authorization': `Zoho-oauthtoken ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log(`Updated lead ${leadId} status to ${status}`);
        }
        
        // Get lead data to include in the note
        const leadResponse = await axios.get(
          `${ZOHO_API_DOMAIN}/crm/v2/Leads/${leadId}`,
          {
            headers: {
              'Authorization': `Zoho-oauthtoken ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const leadData = leadResponse.data.data[0];
        
        // Create a note to track the conversion event
        const conversionNote = {
          data: [
            {
              Note_Title: `Conversion Event: ${event}`,
              Note_Content: JSON.stringify({
                event: event,
                timestamp: new Date().toISOString(),
                status: status || 'No status change',
                customValue: customValue || 'No custom value',
                additionalData: additionalData || {},
                leadData: {
                  name: leadData.Full_Name || `${leadData.First_Name || ''} ${leadData.Last_Name || ''}`.trim(),
                  phone: leadData.Phone || '',
                  email: leadData.Email || '',
                  gclid: leadData.gclid || '',
                  needsRepairs: leadData.needsRepairs || '',
                  apiEstimatedValue: leadData.apiEstimatedValue || ''
                }
              }, null, 2),
              Parent_Id: leadId,
              se_module: "Leads"
            }
          ]
        };
        
        await axios.post(
          `${ZOHO_API_DOMAIN}/crm/v2/Notes`,
          conversionNote,
          {
            headers: {
              'Authorization': `Zoho-oauthtoken ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Optionally, you could add more analytics tracking here like making a request
        // to Google Analytics Measurement Protocol API
        
        return res.status(200).json({
          success: true,
          message: `Tracked conversion ${event} for lead ${leadId}`,
          status: status ? `Updated status to ${status}` : 'No status change'
        });
      } catch (error) {
        console.error('Error processing conversion tracking:', error);
        return res.status(500).json({
          error: 'Failed to track conversion',
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