/**
 * Facebook Pixel integration (simplified client-side only approach)
 * This service handles browser-side pixel events
 */

// Import Facebook Pixel library
import ReactPixel from 'react-facebook-pixel';

// Constants
const PIXEL_ID = process.env.REACT_APP_FB_PIXEL_ID || '';
const DEBUG_MODE = process.env.NODE_ENV === 'development';

/**
 * Helper function to extract campaign name from URL parameters
 * Helps ensure consistent campaign name extraction across the app
 */
function extractCampaignNameFromUrl() {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  
  // Try various parameter naming conventions for campaign name
  const possibleParamNames = [
    'campaignname', // Google Ads tracking template format
    'campaign_name',
    'campaign-name', 
    'utm_campaign',
    'utmcampaign'
  ];
  
  for (const paramName of possibleParamNames) {
    const value = urlParams.get(paramName);
    if (value) {
      try {
        const decoded = decodeURIComponent(value);
        if (DEBUG_MODE) console.log(`Facebook Pixel - Found campaign name in URL parameter "${paramName}":`, decoded);
        return decoded;
      } catch (e) {
        if (DEBUG_MODE) console.warn(`Facebook Pixel - Error decoding campaign name from ${paramName}:`, e);
        return value;
      }
    }
  }
  
  // If we get here, we didn't find a campaign name in the URL
  return null;
}

/**
 * Initialize Facebook Pixel in the browser
 */
export function initializeFacebookPixel() {
  if (!PIXEL_ID) {
    if (DEBUG_MODE) console.log('Facebook Pixel - Initialization skipped: No Pixel ID provided');
    return;
  }

  // Advanced matching parameters (optional)
  const advancedMatching = {}; // Can include em (email), ph (phone) if available at init time

  // Pixel options
  const options = {
    autoConfig: true,
    debug: DEBUG_MODE
  };
  
  // Check for campaign name in URL and store it in localStorage
  const campaignName = extractCampaignNameFromUrl();
  if (campaignName) {
    try {
      // Get existing campaign data from localStorage
      let campaignData = {};
      const storedData = localStorage.getItem('campaignData');
      if (storedData) {
        campaignData = JSON.parse(storedData);
      }
      
      // Update with the new campaign name from URL
      campaignData.campaign_name = campaignName;
      
      // Save back to localStorage
      localStorage.setItem('campaignData', JSON.stringify(campaignData));
      
      if (DEBUG_MODE) console.log('Facebook Pixel - Stored campaign name in localStorage:', campaignName);
    } catch (e) {
      console.error('Facebook Pixel - Error storing campaign name:', e);
    }
  }

  // Initialize pixel
  ReactPixel.init(PIXEL_ID, advancedMatching, options);
  
  // Track initial page view
  ReactPixel.pageView();
  
  if (DEBUG_MODE) {
    console.log('Facebook Pixel - Initialized with ID:', PIXEL_ID);
    
    // Log stored campaign data
    setTimeout(() => {
      logStoredCampaignData();
    }, 500); // Small delay to ensure localStorage is loaded
  }
}

// Keep track of the last path we tracked to avoid duplicates
let lastTrackedPath = '';
let lastTrackedTime = 0;

/**
 * Track page view in Facebook Pixel
 * @param {string} path - Current page path
 */
export function trackPageView(path) {
  if (!PIXEL_ID) return;

  // Avoid duplicate tracking - only track if path changed or 30 seconds elapsed
  const now = Date.now();
  const timeSinceLastTrack = now - lastTrackedTime;

  // If this is the same path and it's been less than 30 seconds, skip tracking
  if (path === lastTrackedPath && timeSinceLastTrack < 30000) {
    if (DEBUG_MODE) console.log('Facebook Pixel - Skipping duplicate page view for:', path);
    return;
  }

  // Update tracking state
  lastTrackedPath = path;
  lastTrackedTime = now;

  // Track page view
  ReactPixel.pageView();

  // Get campaign data from localStorage if available
  let campaignData = {};
  try {
    const storedData = localStorage.getItem('campaignData');
    if (storedData) {
      campaignData = JSON.parse(storedData);
      if (DEBUG_MODE) console.log('Facebook Pixel - Using campaign data from localStorage for ViewContent:', campaignData);
    }
  } catch (e) {
    console.error('Facebook Pixel - Error retrieving campaign data:', e);
  }

  // Also track as ViewContent event with page path and campaign data
  const viewContentParams = {
    content_name: document.title,
    content_type: 'product',
    content_ids: [path]
  };

  // Add campaign data if available
  if (campaignData.campaign_name) {
    viewContentParams.campaign_name = campaignData.campaign_name;
    if (DEBUG_MODE) console.log('Facebook Pixel - Adding campaign_name to ViewContent:', campaignData.campaign_name);
  }
  
  if (campaignData.campaign_id) {
    viewContentParams.campaign_id = campaignData.campaign_id;
  }
  
  if (campaignData.adgroup_name) {
    viewContentParams.adgroup_name = campaignData.adgroup_name;
  }
  
  if (campaignData.adgroup_id) {
    viewContentParams.adgroup_id = campaignData.adgroup_id;
  }
  
  if (campaignData.keyword) {
    viewContentParams.keyword = campaignData.keyword;
  }

  // Track ViewContent with campaign parameters
  ReactPixel.track('ViewContent', viewContentParams);

  if (DEBUG_MODE) console.log('Facebook Pixel - Page View with campaign data:', viewContentParams);
}

/**
 * Track form step completion
 * @param {number} stepNumber - Form step number
 * @param {string} stepName - Form step name
 * @param {object} formData - Current form data
 */
export function trackFormStepComplete(stepNumber, stepName, formData) {
  if (!PIXEL_ID) return;
  
  let eventName;
  let eventParams = {
    step: stepNumber,
    step_name: stepName
  };
  
  // Map form steps to Facebook standard events
  switch (stepNumber) {
    case 1: // Address form
      eventName = 'InitiateCheckout';
      if (formData?.street) {
        eventParams.content_name = 'Address Provided';
        eventParams.address = formData.street;
      }
      break;
    case 2: // Personal info
      eventName = 'AddPaymentInfo'; // Not actually payment but closest event
      if (formData?.name) {
        eventParams.content_name = 'Contact Info Provided';
      }
      break;
    case 3: // Qualifying form
      eventName = 'Lead'; 
      eventParams.content_name = 'Qualifying Info Provided';
      break;
    case 4: // Thank you
      eventName = 'CompleteRegistration';
      eventParams.content_name = 'Form Completed';
      if (formData?.apiEstimatedValue) {
        eventParams.value = formData.apiEstimatedValue; // Value is already in dollars
        eventParams.currency = 'USD';
      }
      break;
    default:
      eventName = 'CustomStep';
      break;
  }
  
  // Add campaign data if available for ALL events
  if (formData?.campaign_name) {
    eventParams.campaign_name = formData.campaign_name;
    
    // Log that we're adding campaign data
    if (DEBUG_MODE) {
      console.log('Adding campaign data to event:', {
        campaign_name: formData.campaign_name,
        event: eventName
      });
    }
  }
  
  if (formData?.campaign_id) {
    eventParams.campaign_id = formData.campaign_id;
  }
  
  if (formData?.adgroup_name) {
    eventParams.adgroup_name = formData.adgroup_name;
  }
  
  if (formData?.adgroup_id) {
    eventParams.adgroup_id = formData.adgroup_id;
  }
  
  if (formData?.keyword) {
    eventParams.keyword = formData.keyword;
  }
  
  if (formData?.matchtype) {
    eventParams.matchtype = formData.matchtype;
  }
  
  if (formData?.templateType) {
    eventParams.template_type = formData.templateType;
  }
  
  // Track in browser
  ReactPixel.track(eventName, eventParams);
  
  if (DEBUG_MODE) {
    console.log(`Facebook Pixel - ${eventName}:`, eventParams);
  }
}

// Tracking state to prevent duplicate submission events
let hasTrackedFormSubmission = false;

/**
 * Track form submission in Facebook
 * @param {object} formData - Submitted form data
 */
export function trackFormSubmission(formData) {
  if (!PIXEL_ID) return;

  // Prevent duplicate tracking
  if (hasTrackedFormSubmission) {
    if (DEBUG_MODE) console.log('Facebook Pixel - Skipping duplicate form submission tracking');
    return;
  }

  // Mark as tracked
  hasTrackedFormSubmission = true;

  // Prepare event parameters
  const eventParams = {
    content_name: 'Lead Form Submission',
    content_category: 'Real Estate',
    value: formData.apiEstimatedValue ? formData.apiEstimatedValue : 0,
    currency: 'USD',
    status: true
  };

  // Add campaign data if available
  if (formData.campaign_id) {
    eventParams.campaign_id = formData.campaign_id;
    eventParams.campaign_name = formData.campaign_name;
  }

  // Track Lead event in browser
  ReactPixel.track('Lead', eventParams);

  // Also track CompleteRegistration for funnel completion with campaign data
  const registrationParams = {
    content_name: 'Form Completed',
    status: true,
    value: eventParams.value, // This now contains the full value
    currency: 'USD'
  };
  
  // Add campaign data to registration event
  if (formData.campaign_name) {
    registrationParams.campaign_name = formData.campaign_name;
    if (DEBUG_MODE) console.log('Adding campaign_name to CompleteRegistration:', formData.campaign_name);
  }
  
  if (formData.campaign_id) {
    registrationParams.campaign_id = formData.campaign_id;
  }
  
  if (formData.adgroup_name) {
    registrationParams.adgroup_name = formData.adgroup_name;
  }
  
  if (formData.adgroup_id) {
    registrationParams.adgroup_id = formData.adgroup_id;
  }
  
  if (formData.keyword) {
    registrationParams.keyword = formData.keyword;
  }
  
  if (formData.device) {
    registrationParams.device = formData.device;
  }
  
  if (formData.gclid) {
    registrationParams.gclid = formData.gclid;
  }
  
  if (formData.matchtype) {
    registrationParams.matchtype = formData.matchtype;
  }
  
  if (formData.templateType) {
    registrationParams.template_type = formData.templateType;
  }
  
  ReactPixel.track('CompleteRegistration', registrationParams);

  if (DEBUG_MODE) {
    console.log('Facebook Pixel - Lead and CompleteRegistration events fired:', {
      value: eventParams.value,
      campaign_id: formData.campaign_id,
      campaign_name: formData.campaign_name,
      adgroup_name: formData.adgroup_name,
      keyword: formData.keyword
    });
  }
}

/**
 * Track a custom event
 * @param {string} eventName - Name of the event
 * @param {object} eventParams - Event parameters
 * @param {object} campaignData - Optional campaign data to include
 */
export function trackCustomEvent(eventName, eventParams = {}, campaignData = null) {
  if (!PIXEL_ID) return;
  
  // If campaignData wasn't provided but we have it in localStorage, use that
  if (!campaignData) {
    try {
      const storedData = localStorage.getItem('campaignData');
      if (storedData) {
        campaignData = JSON.parse(storedData);
        if (DEBUG_MODE) console.log(`Facebook Pixel - Using stored campaign data for ${eventName}:`, campaignData);
      }
    } catch (e) {
      console.error('Facebook Pixel - Error retrieving campaign data:', e);
    }
  }
  
  // Add campaign data if available
  if (campaignData) {
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
    
    if (campaignData.device) {
      eventParams.device = campaignData.device;
    }
    
    if (campaignData.gclid) {
      eventParams.gclid = campaignData.gclid;
    }
    
    if (campaignData.matchtype) {
      eventParams.matchtype = campaignData.matchtype;
    }
  }
  
  // Track in browser
  ReactPixel.trackCustom(eventName, eventParams);
  
  if (DEBUG_MODE) {
    console.log(`Facebook Pixel - ${eventName}:`, {
      ...eventParams,
      hasCampaignData: campaignData ? 'Yes' : 'No'
    });
  }
}

/**
 * Track property value event when Melissa API returns an estimate
 * @param {object} propertyData - The property data from Melissa API
 */
export function trackPropertyValue(propertyData) {
  if (!PIXEL_ID) return;

  // Only track if we have an actual value
  if (!propertyData || !propertyData.apiEstimatedValue || propertyData.apiEstimatedValue <= 0) {
    return;
  }

  const value = propertyData.apiEstimatedValue;
  const formattedValue = propertyData.formattedApiEstimatedValue ||
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  // Prepare event parameters
  const eventParams = {
    content_type: 'real_estate',
    content_name: 'Property Value Obtained',
    content_category: 'Real Estate',
    value: value, // Use the full value - already in dollars
    currency: 'USD',
    property_address: propertyData.address || '',
    estimated_value: value,
    formatted_value: formattedValue,
    // Add equity information for audience segmentation
    property_equity: propertyData.apiEquity || 0,
    property_equity_percentage: propertyData.apiPercentage || 0
  };
  
  // Try to get campaign data from multiple sources
  let campaign_name = propertyData.campaign_name || '';
  let campaign_id = propertyData.campaign_id || '';
  let adgroup_name = propertyData.adgroup_name || '';
  let adgroup_id = propertyData.adgroup_id || '';
  let keyword = propertyData.keyword || '';
  let templateType = propertyData.templateType || '';
  
  // If campaign data not in propertyData, try to get from localStorage
  if (!campaign_name || !campaign_id) {
    try {
      const storedCampaignData = localStorage.getItem('campaignData');
      if (storedCampaignData) {
        const campaignData = JSON.parse(storedCampaignData);
        if (DEBUG_MODE) console.log('PropertyValueObtained - Found campaign data in localStorage:', campaignData);
        
        // Use data from localStorage if not already present in propertyData
        campaign_name = campaign_name || campaignData.campaign_name || '';
        campaign_id = campaign_id || campaignData.campaign_id || '';
        adgroup_name = adgroup_name || campaignData.adgroup_name || '';
        adgroup_id = adgroup_id || campaignData.adgroup_id || '';
        keyword = keyword || campaignData.keyword || '';
      }
    } catch (e) {
      console.error('PropertyValueObtained - Error retrieving campaign data from localStorage:', e);
    }
  }
  
  // If still no campaign data, try to get from URL
  if (!campaign_name) {
    const urlParams = new URLSearchParams(window.location.search);
    campaign_name = urlParams.get('campaign_name') || urlParams.get('campaignname') || urlParams.get('utm_campaign') || '';
    
    if (campaign_name && DEBUG_MODE) {
      console.log('PropertyValueObtained - Using campaign name from URL:', campaign_name);
    }
  }
  
  // Add campaign data to event params if available
  if (campaign_name) {
    eventParams.campaign_name = campaign_name;
    
    if (DEBUG_MODE) {
      console.log('Adding campaign data to PropertyValueObtained event:', {
        campaign_name: campaign_name,
        source: propertyData.campaign_name ? 'propertyData' : 'localStorage/URL'
      });
    }
  }
  
  if (campaign_id) {
    eventParams.campaign_id = campaign_id;
  }
  
  if (adgroup_name) {
    eventParams.adgroup_name = adgroup_name;
  }
  
  if (adgroup_id) {
    eventParams.adgroup_id = adgroup_id;
  }
  
  if (keyword) {
    eventParams.keyword = keyword;
  }
  
  // Check if matchtype is available from propertyData
  if (propertyData?.matchtype) {
    eventParams.matchtype = propertyData.matchtype;
  }
  
  if (templateType) {
    eventParams.template_type = templateType;
  }

  // Add value tiers for easier audience segmentation
  if (value < 200000) {
    eventParams.value_tier = 'under_200k';
  } else if (value < 300000) {
    eventParams.value_tier = '200k_300k';
  } else if (value < 400000) {
    eventParams.value_tier = '300k_400k';
  } else if (value < 500000) {
    eventParams.value_tier = '400k_500k';
  } else if (value < 750000) {
    eventParams.value_tier = '500k_750k';
  } else if (value < 1000000) {
    eventParams.value_tier = '750k_1m';
  } else {
    eventParams.value_tier = 'over_1m';
  }

  // Add equity tiers for targeted marketing
  const equity = propertyData.apiEquity || 0;
  if (equity <= 0) {
    eventParams.equity_tier = 'no_equity';
  } else if (equity < 50000) {
    eventParams.equity_tier = 'under_50k';
  } else if (equity < 100000) {
    eventParams.equity_tier = '50k_100k';
  } else if (equity < 200000) {
    eventParams.equity_tier = '100k_200k';
  } else if (equity < 300000) {
    eventParams.equity_tier = '200k_300k';
  } else {
    eventParams.equity_tier = 'over_300k';
  }

  // Add equity percentage tiers
  const equityPercentage = propertyData.apiPercentage || 0;
  if (equityPercentage <= 0) {
    eventParams.equity_percentage_tier = 'no_equity';
  } else if (equityPercentage < 10) {
    eventParams.equity_percentage_tier = 'under_10_percent';
  } else if (equityPercentage < 20) {
    eventParams.equity_percentage_tier = '10_20_percent';
  } else if (equityPercentage < 30) {
    eventParams.equity_percentage_tier = '20_30_percent';
  } else if (equityPercentage < 50) {
    eventParams.equity_percentage_tier = '30_50_percent';
  } else if (equityPercentage < 75) {
    eventParams.equity_percentage_tier = '50_75_percent';
  } else {
    eventParams.equity_percentage_tier = 'over_75_percent';
  }

  // Track custom event in browser
  ReactPixel.trackCustom('PropertyValueObtained', eventParams);

  if (DEBUG_MODE) {
    console.log('Facebook Pixel - PropertyValueObtained:', {
      value: eventParams.value,
      value_tier: eventParams.value_tier,
      property_equity: eventParams.property_equity,
      equity_tier: eventParams.equity_tier,
      property_equity_percentage: eventParams.property_equity_percentage,
      equity_percentage_tier: eventParams.equity_percentage_tier,
      // Include campaign data in logs to verify it's being sent
      campaign_name: eventParams.campaign_name || 'Not set',
      campaign_id: eventParams.campaign_id || 'Not set',
      adgroup_name: eventParams.adgroup_name || 'Not set',
      keyword: eventParams.keyword || 'Not set'
    });
  }
}

/**
 * Debug function to log current campaign data stored in localStorage
 * Useful for debugging tracking issues
 */
export function logStoredCampaignData() {
  if (!DEBUG_MODE) return;
  
  try {
    const storedData = localStorage.getItem('campaignData');
    if (storedData) {
      const campaignData = JSON.parse(storedData);
      console.log('Facebook Pixel - Current campaign data in localStorage:', campaignData);
      
      // Always check for campaign name specifically
      if (campaignData.campaign_name) {
        console.log('Facebook Pixel - Campaign name is available:', campaignData.campaign_name);
      } else {
        console.warn('Facebook Pixel - Campaign name is NOT available in stored data');
      }
      
      return campaignData;
    } else {
      console.warn('Facebook Pixel - No campaign data found in localStorage');
    }
  } catch (e) {
    console.error('Facebook Pixel - Error retrieving campaign data:', e);
  }
  
  return null;
}

export default {
  initializeFacebookPixel,
  trackPageView,
  trackFormStepComplete,
  trackFormSubmission,
  trackCustomEvent,
  trackPropertyValue,
  logStoredCampaignData
};