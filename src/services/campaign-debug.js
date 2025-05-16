/**
 * Campaign debugging helper
 * This utility helps diagnose campaign tracking issues
 */

// Log the current campaign data available everywhere
export function debugCampaignData() {
  console.group('Campaign Debug Information');
  
  try {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlCampaignParams = {
      campaign_name: urlParams.get('campaignname') || urlParams.get('campaign_name') || urlParams.get('utm_campaign'),
      campaign_id: urlParams.get('campaignid'),
      adgroup_name: urlParams.get('adgroupname') || urlParams.get('adgroup_name'),
      adgroup_id: urlParams.get('adgroupid'),
      keyword: urlParams.get('keyword'),
      device: urlParams.get('device'),
      gclid: urlParams.get('gclid'),
      matchtype: urlParams.get('matchtype')
    };
    
    console.log('URL Parameters:', urlCampaignParams);
    
    // Check localStorage for campaign data
    const storedCampaignData = localStorage.getItem('campaignData');
    if (storedCampaignData) {
      console.log('localStorage campaignData:', JSON.parse(storedCampaignData));
    } else {
      console.warn('No campaignData found in localStorage');
    }
    
    // Check localStorage for formData (may contain campaign info)
    const storedFormData = localStorage.getItem('formData');
    if (storedFormData) {
      const formData = JSON.parse(storedFormData);
      console.log('Campaign data in formData:', {
        campaign_name: formData.campaign_name,
        campaign_id: formData.campaign_id,
        adgroup_name: formData.adgroup_name,
        adgroup_id: formData.adgroup_id,
        keyword: formData.keyword,
        device: formData.device,
        gclid: formData.gclid,
        matchtype: formData.matchtype,
        traffic_source: formData.traffic_source
      });
    } else {
      console.warn('No formData found in localStorage');
    }
    
    // Check if Facebook Pixel is initialized
    if (window.fbq) {
      console.log('Facebook Pixel is initialized');
      
      // Log the dataLayer for GTM
      if (window.dataLayer) {
        const campaignEvents = window.dataLayer.filter(item => 
          item.event === 'campaign_page_view' || 
          item.campaignName || 
          item.campaign_name
        );
        
        if (campaignEvents.length > 0) {
          console.log('Campaign events found in dataLayer:', campaignEvents);
        } else {
          console.warn('No campaign events found in dataLayer');
        }
      } else {
        console.warn('dataLayer is not initialized');
      }
    } else {
      console.error('Facebook Pixel is not initialized');
    }
  } catch (error) {
    console.error('Error in campaign debug:', error);
  }
  
  console.groupEnd();
  
  // Return a message for the browser console
  return 'Campaign debug information logged to console';
}

// Function to manually trigger a Facebook event with campaign data
export function manuallyTriggerFacebookEventWithCampaign(eventName = 'ManualDebugEvent') {
  try {
    // Get campaign data from localStorage
    const storedCampaignData = localStorage.getItem('campaignData');
    let campaignData = {};
    
    if (storedCampaignData) {
      campaignData = JSON.parse(storedCampaignData);
    } else {
      console.warn('No campaignData found in localStorage for manual event');
    }
    
    // Check if Facebook Pixel is initialized
    if (window.fbq) {
      // Prepare event parameters
      const eventParams = {
        content_name: 'Manual Debug Event',
        debug_timestamp: new Date().toISOString()
      };
      
      // Add campaign data if available
      if (campaignData.campaign_name) {
        eventParams.campaign_name = campaignData.campaign_name;
      }
      
      if (campaignData.campaign_id) {
        eventParams.campaign_id = campaignData.campaign_id;
      }
      
      if (campaignData.adgroup_name) {
        eventParams.adgroup_name = campaignData.adgroup_name;
      }
      
      if (campaignData.adgroup_id) {
        eventParams.adgroup_id = campaignData.adgroup_id;
      }
      
      if (campaignData.keyword) {
        eventParams.keyword = campaignData.keyword;
      }
      
      if (campaignData.matchtype) {
        eventParams.matchtype = campaignData.matchtype;
      }
      
      // Trigger the event
      window.fbq('trackCustom', eventName, eventParams);
      
      console.log(`Manually triggered Facebook event '${eventName}' with parameters:`, eventParams);
      return true;
    } else {
      console.error('Could not trigger manual event: Facebook Pixel is not initialized');
      return false;
    }
  } catch (error) {
    console.error('Error triggering manual Facebook event:', error);
    return false;
  }
}

export default {
  debugCampaignData,
  manuallyTriggerFacebookEventWithCampaign
};