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
      campaign_name: urlParams.get('campaign_name') || urlParams.get('campaignname') || urlParams.get('utm_campaign'),
      campaignid: urlParams.get('campaignid'),
      adgroupid: urlParams.get('adgroupid'),
      adgroup_name: urlParams.get('adgroup_name') || urlParams.get('adgroupname'),
      keyword: urlParams.get('keyword'),
      device: urlParams.get('device'),
      gclid: urlParams.get('gclid')
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
        campaignName: formData.campaignName,
        campaignId: formData.campaignId,
        adgroupName: formData.adgroupName,
        adgroupId: formData.adgroupId,
        keyword: formData.keyword,
        device: formData.device,
        gclid: formData.gclid,
        trafficSource: formData.trafficSource
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
      if (campaignData.campaignName) {
        eventParams.campaign_name = campaignData.campaignName;
      }
      
      if (campaignData.campaignId) {
        eventParams.campaign_id = campaignData.campaignId;
      }
      
      if (campaignData.adgroupName) {
        eventParams.adgroup_name = campaignData.adgroupName;
      }
      
      if (campaignData.adgroupId) {
        eventParams.adgroup_id = campaignData.adgroupId;
      }
      
      if (campaignData.keyword) {
        eventParams.keyword = campaignData.keyword;
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