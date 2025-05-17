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
    
    // Log the complete incoming request for debugging
    console.log("Zoho API Request:", {
      action,
      leadId,
      formDataKeys: formData ? Object.keys(formData) : null,
      event,
      status
    });
    
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
            
            // We'll update this field later once we have the lead ID
            
            // Address - Make sure we're using exact Zoho field names with proper capitalization
            Street: formData.street,
            City: formData.city || "",
            State: formData.state || "GA",
            Zip_Code: formData.zip || "",
            
            // Lead metadata
            Lead_Source: formData.traffic_source || formData.trafficSource || "Website",
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
            
            // Marketing & Campaign information - EXACT ZOHO FIELD NAMES
            Campaign_Source: formData.traffic_source || formData.trafficSource || "",
            Campaign_Name: formData.campaign_name || formData.campaignName || "",
            Ad_Group: formData.adgroup_name || formData.adgroupName || "",
            // Add additional variations of the adgroup field name for better compatibility
            AdGroup: formData.adgroup_name || formData.adgroupName || "",
            Ad_Group_Name: formData.adgroup_name || formData.adgroupName || "",
            AdGroupName: formData.adgroup_name || formData.adgroupName || "",
            Device_Used: formData.device || "",
            Keyword: formData.keyword || "", // Zoho system field
            keywords: formData.keyword || "", // Custom field for redundancy
            search_term: formData.keyword || "", // Alternative field name
            search_query: formData.keyword || "", // Another alternative
            
            // DEBUGGING: Explicit keyword fields to verify values
            keyword_debug: formData.keyword || "NO KEYWORD",
            keyword_source: formData.keyword ? "from keyword field" : "missing",
            
            // Try direct custom fields that might be defined in Zoho
            Keyword_Text: formData.keyword || "",
            Search_Term_Text: formData.keyword || "",
            
            // Regular fields continued
            GCLID: formData.gclid || "",
            URL: formData.url || "",
            Template_Type: formData.templateType || "",
            
            // Our local tracking fields - support both camelCase and snake_case for backward compatibility
            trafficSource: formData.trafficSource || formData.traffic_source || "",
            campaignName: formData.campaignName || formData.campaign_name || "",
            adgroupName: formData.adgroupName || formData.adgroup_name || "",
            device: formData.device || "",
            keyword: formData.keyword || "",
            matchtype: formData.matchtype || "",
            gclid: formData.gclid || "",
            url: formData.url || "",
            templateType: formData.templateType || "",
            campaignId: formData.campaignId || formData.campaign_id || "",
            adgroupId: formData.adgroupId || formData.adgroup_id || "",
            
            // Snake case versions
            traffic_source: formData.traffic_source || formData.trafficSource || "",
            campaign_name: formData.campaign_name || formData.campaignName || "",
            campaign_id: formData.campaign_id || formData.campaignId || "",
            adgroup_name: formData.adgroup_name || formData.adgroupName || "",
            adgroup_id: formData.adgroup_id || formData.adgroupId || "",
            
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
            
            // Dynamic content - HACK: sending keyword as dynamicSubHeadline
            dynamicHeadline: formData.campaign_name || formData.campaignName || formData.dynamicHeadline || "",
            
            // Force keyword into these fields without the "KEYWORD:" prefix
            dynamicSubHeadline: formData.keyword || "NOT_PROVIDED",
            
            thankYouHeadline: formData.thankYouHeadline || "",
            thankYouSubHeadline: formData.keyword || "NOT_PROVIDED",
            
            // Metadata
            addressSelectionType: formData.addressSelectionType || "Manual",
            qualifyingQuestionStep: formData.qualifyingQuestionStep?.toString() || "",
            userInputtedStreet: formData.userInputtedStreet || "",
            dataSourceComplete: formData.dataSourceComplete ? "true" : ""
          }
        ]
      };
      
      // Log the data being sent for debugging - include campaign data
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
          },
          campaignData: {
            campaign_name: formData.campaign_name || formData.campaignName || "Not provided",
            campaign_id: formData.campaign_id || formData.campaignId || "Not provided", 
            adgroup_name: formData.adgroup_name || formData.adgroupName || "Not provided",
            adgroup_id: formData.adgroup_id || formData.adgroupId || "Not provided",
            keyword: formData.keyword || "Not provided",
            matchtype: formData.matchtype || "Not provided",
            traffic_source: formData.traffic_source || formData.trafficSource || "Not provided",
            templateType: formData.templateType || "Not provided",
            gclid: formData.gclid || "Not provided",
            device: formData.device || "Not provided"
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
          
          // Immediately update the lead with its own ID in the Lead_ID_Text field
          try {
            const updatePayload = {
              data: [
                {
                  id: leadId,
                  Lead_ID_Text: leadId
                }
              ]
            };
            
            // Don't await this - we don't want to delay the response
            axios.put(
              `${ZOHO_API_DOMAIN}/crm/v2/Leads`,
              updatePayload,
              {
                headers: {
                  'Authorization': `Zoho-oauthtoken ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            ).then(() => {
              console.log(`Updated Lead_ID_Text field for lead ${leadId}`);
            }).catch((error) => {
              console.error(`Failed to update Lead_ID_Text field: ${error.message}`);
            });
          } catch (error) {
            console.error(`Error preparing Lead_ID_Text update: ${error.message}`);
          }
          
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
      
      // Log critical fields in update
      console.log("Updating lead with data:", {
        // Contact info
        name: formData.name,
        firstName: formData.First_Name || firstName,
        lastName: formData.Last_Name || lastName,
        phone: formData.Phone || formData.phone,
        
        // Sales fields
        Transaction_Amount: formData.Transaction_Amount,
        Revenue_Made: formData.Revenue_Made,
        Signed_On_As_Client: formData.Signed_On_As_Client,
        
        // API fields
        apiOwnerName: formData.apiOwnerName,
        apiEstimatedValue: formData.apiEstimatedValue,
        apiHomeValue: formData.apiHomeValue,
        apiMaxHomeValue: formData.apiMaxHomeValue,
        apiEquity: formData.apiEquity,
        apiPercentage: formData.apiPercentage,
        
        // Address
        Street: formData.Street,
        City: formData.City,
        State: formData.State,
        Zip_Code: formData.Zip_Code,
        
        // Other lead fields
        Status: formData.Status
      });
      
      // Check direct Zoho field names first, then fallback to our field names
      const hasDirectZohoFields = formData.First_Name !== undefined || formData.Last_Name !== undefined;

      const payload = {
        data: [
          {
            id: leadId,
            
            // Add Lead ID Text field explicitly
            Lead_ID_Text: leadId,
            
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
            
            // CRITICAL: Ensure API data fields are preserved during updates
            apiOwnerName: formData.apiOwnerName || "",
            apiEstimatedValue: formData.apiEstimatedValue || formData.apiHomeValue || "",
            apiHomeValue: formData.apiHomeValue || formData.apiEstimatedValue || "",
            apiMaxHomeValue: formData.apiMaxHomeValue || "",
            apiEquity: formData.apiEquity || "",
            apiPercentage: formData.apiPercentage || "",
            
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
            
            // Marketing & Campaign information - EXACT ZOHO FIELD NAMES
            Campaign_Source: formData.traffic_source || formData.trafficSource || "",
            Campaign_Name: formData.campaign_name || formData.campaignName || "",
            Ad_Group: formData.adgroup_name || formData.adgroupName || "",
            // Add additional variations of the adgroup field name for better compatibility
            AdGroup: formData.adgroup_name || formData.adgroupName || "",
            Ad_Group_Name: formData.adgroup_name || formData.adgroupName || "",
            AdGroupName: formData.adgroup_name || formData.adgroupName || "",
            Device_Used: formData.device || "",
            Keyword: formData.keyword || "", // Zoho system field
            keywords: formData.keyword || "", // Custom field for redundancy
            search_term: formData.keyword || "", // Alternative field name
            search_query: formData.keyword || "", // Another alternative
            
            // DEBUGGING: Explicit keyword fields to verify values
            keyword_debug: formData.keyword || "NO KEYWORD",
            keyword_source: formData.keyword ? "from keyword field" : "missing",
            
            // Try direct custom fields that might be defined in Zoho
            Keyword_Text: formData.keyword || "",
            Search_Term_Text: formData.keyword || "",
            GCLID: formData.gclid || "",
            URL: formData.url || "",
            Template_Type: formData.templateType || "",
            
            // Our local tracking fields - support both camelCase and snake_case for backward compatibility
            trafficSource: formData.trafficSource || formData.traffic_source || "",
            campaignName: formData.campaignName || formData.campaign_name || "",
            adgroupName: formData.adgroupName || formData.adgroup_name || "",
            device: formData.device || "",
            keyword: formData.keyword || "",
            matchtype: formData.matchtype || "",
            gclid: formData.gclid || "",
            url: formData.url || "",
            templateType: formData.templateType || "",
            
            // Snake case versions
            traffic_source: formData.traffic_source || formData.trafficSource || "",
            campaign_name: formData.campaign_name || formData.campaignName || "",
            campaign_id: formData.campaign_id || formData.campaignId || "",
            adgroup_name: formData.adgroup_name || formData.adgroupName || "",
            adgroup_id: formData.adgroup_id || formData.adgroupId || "",
            
            // Dynamic content - HACK: sending keyword as dynamicSubHeadline
            dynamicHeadline: formData.campaign_name || formData.campaignName || formData.dynamicHeadline || "",
            
            // Force keyword into these fields without the "KEYWORD:" prefix
            dynamicSubHeadline: formData.keyword || "NOT_PROVIDED",
            
            thankYouHeadline: formData.thankYouHeadline || "",
            thankYouSubHeadline: formData.keyword || "NOT_PROVIDED",
            
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
            qualifyingQuestionStep: formData.qualifyingQuestionStep?.toString() || "",
            dataSourceComplete: formData.dataSourceComplete ? "true" : ""
          }
        ]
      };
      
      // Log the data being updated for debugging - include campaign data
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
          },
          campaignData: {
            zohoFields: {
              campaignSource: formData.Campaign_Source,
              campaignName: formData.Campaign_Name,
              adGroup: formData.Ad_Group,
              keyword: formData.Keyword, 
              keywords: formData.keywords,
              searchTerm: formData.search_term
            },
            ourFields: {
              traffic_source: formData.traffic_source || formData.trafficSource || "",
              campaign_name: formData.campaign_name || formData.campaignName || "",
              campaign_id: formData.campaign_id || formData.campaignId || "",
              adgroup_name: formData.adgroup_name || formData.adgroupName || "",
              adgroup_id: formData.adgroup_id || formData.adgroupId || "",
              keyword: formData.keyword || "",
              matchtype: formData.matchtype || ""
            },
            hackFields: {
              dynamicSubHeadline: formData.keyword || "Not set",
              thankYouSubHeadline: formData.keyword || "Not set"
            }
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
          // Get lead data first to preserve existing values
          const leadResponse = await axios.get(
            `${ZOHO_API_DOMAIN}/crm/v2/Leads/${leadId}`,
            {
              headers: {
                'Authorization': `Zoho-oauthtoken ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          // Extract the lead data
          const leadData = leadResponse.data.data[0] || {};
          
          // Create update payload with existing data preserved
          const updatePayload = {
            data: [
              {
                id: leadId,
                Status: status,
                
                // Preserve important fields
                First_Name: leadData.First_Name || "",
                Last_Name: leadData.Last_Name || "",
                Phone: leadData.Phone || "",
                Email: leadData.Email || "",
                Street: leadData.Street || "",
                City: leadData.City || "",
                State: leadData.State || "",
                Zip_Code: leadData.Zip_Code || "",
                
                // Preserve API data
                apiOwnerName: leadData.apiOwnerName || "",
                apiEstimatedValue: leadData.apiEstimatedValue || leadData.apiHomeValue || "",
                apiHomeValue: leadData.apiHomeValue || leadData.apiEstimatedValue || "",
                apiMaxHomeValue: leadData.apiMaxHomeValue || "",
                apiEquity: leadData.apiEquity || "",
                apiPercentage: leadData.apiPercentage || ""
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
            updatePayload.data[0].Signed_On_As_Client = true; // Boolean for Zoho API
            updatePayload.data[0].Signed_On_As_Client_text = 'true'; // String backup
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