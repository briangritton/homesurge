import ReactGA from 'react-ga4';
import TagManager from 'react-gtm-module';
import * as FacebookPixel from './facebook';
import { debugCampaignData } from './campaign-debug';

// Configuration constants - use empty strings as fallbacks for security
const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || '';
const GTM_ID = process.env.REACT_APP_GTM_ID || '';

// Debug mode for development
const isDebug = process.env.NODE_ENV === 'development';

// Helper function to get route-based variant data
function getRouteVariantData() {
  const path = window.location.pathname;
  const pathParts = path.split('/');
  
  if (pathParts[1] === 'analysis' && pathParts.length >= 4) {
    return {
      routeCampaign: pathParts[2], // cash, sell, value, equity
      routeVariant: pathParts[3].toUpperCase() // a1o -> A1O
    };
  }
  
  return {
    routeCampaign: '',
    routeVariant: ''
  };
}

// No consent management needed

// Initialize analytics services
export function initializeAnalytics() {
  try {
    if (isDebug) console.log('Analytics - Initializing with:', { GA_TRACKING_ID, GTM_ID });

    // Only initialize if IDs are provided
    if (GA_TRACKING_ID) {
      try {
        // Initialize Google Analytics 4
        ReactGA.initialize(GA_TRACKING_ID);
      } catch (error) {
        console.error('Analytics - Failed to initialize GA4:', error);
      }
    } else if (isDebug) {
      console.log('Analytics - GA4 initialization skipped: No tracking ID provided');
    }

    if (GTM_ID) {
      try {
        // Initialize Google Tag Manager
        const tagManagerArgs = {
          gtmId: GTM_ID,
          dataLayerName: 'dataLayer',
          auth: '',
          preview: ''
        };
        TagManager.initialize(tagManagerArgs);
      } catch (error) {
        console.error('Analytics - Failed to initialize GTM:', error);
      }
    } else if (isDebug) {
      console.log('Analytics - GTM initialization skipped: No container ID provided');
    }

    // Initialize Facebook Pixel
    try {
      FacebookPixel.initializeFacebookPixel();
    } catch (error) {
      console.error('Analytics - Failed to initialize Facebook Pixel:', error);
    }
    
    // No consent management needed

    // Track initial page view
    try {
      trackPageView(window.location.pathname + window.location.search);
    } catch (error) {
      console.error('Analytics - Failed to track initial page view:', error);
    }
  } catch (error) {
    console.error('Analytics - Critical initialization error:', error);
  }

  if (isDebug) {
    console.log('Analytics - Initialization complete');
    
    // Debug campaign data after a small delay to ensure everything is loaded
    setTimeout(() => {
      debugCampaignData();
    }, 1000);
  }
}

// Track page views (GA4-compliant)
export function trackPageView(path) {
  // Skip tracking for CRM and admin pages to avoid skewing visitor analytics
  const currentPath = (path || window.location.pathname).toLowerCase();
  if (currentPath.includes('/crm') || currentPath.includes('/admin')) {
    if (isDebug) console.log('🚫 Skipping page view tracking for internal page:', currentPath);
    return;
  }
  
  if (isDebug) console.log('Analytics - Page View:', path);
  
  // No consent management needed

  // Only track if GA is initialized
  if (GA_TRACKING_ID) {
    // Google Analytics page view (Updated for GA4)
    ReactGA.send({ hitType: "pageview", page: path });
  }

  // Ensure `window.dataLayer` exists before pushing data
  window.dataLayer = window.dataLayer || [];
  
  // Try to get campaign data from localStorage
  let campaignData = {};
  try {
    const storedData = localStorage.getItem('campaignData');
    if (storedData) {
      campaignData = JSON.parse(storedData);
    }
  } catch (e) {
    console.error('Error retrieving campaign data for pageView:', e);
  }
  
  // Get route-based variant data
  const routeData = getRouteVariantData();
  
  window.dataLayer.push({
    event: 'pageView',
    page: {
      path: path,
      title: document.title
    },
    campaignData: {
      campaign_id: campaignData.campaign_id || '',
      campaign_name: campaignData.campaign_name || '',
      adgroup_id: campaignData.adgroup_id || '',
      adgroup_name: campaignData.adgroup_name || '',
      keyword: campaignData.keyword || '',
      device: campaignData.device || '',
      gclid: campaignData.gclid || '',
      matchtype: campaignData.matchtype || '',
      traffic_source: campaignData.traffic_source || 'Direct'
    },
    variantData: {
      routeCampaign: routeData.routeCampaign,
      routeVariant: routeData.routeVariant
    }
  });

  // Track in Facebook Pixel
  FacebookPixel.trackPageView(path);
}

// Track form submissions
export function trackFormSubmission(formData) {
  if (isDebug) {
    console.log('Analytics - Form Submission:', {
      name: formData.name ? 'Provided' : 'Missing',
      phone: formData.phone ? 'Provided' : 'Missing',
      address: formData.street ? 'Provided' : 'Missing',
      propertyValue: formData.apiEstimatedValue || 'Not Available',
      campaign_id: formData.campaign_id || 'Not Available',
      keyword: formData.keyword || 'Not Available'
    });
  }

  if (GA_TRACKING_ID) {
    ReactGA.event({
      category: 'Form',
      action: 'Submit',
      label: 'Lead Form',
      // Include campaign data as custom parameters
      custom_map: {
        dimension1: 'campaign_id',
        dimension2: 'campaign_name',
        dimension3: 'adgroup_id',
        dimension4: 'adgroup_name',
        dimension5: 'keyword',
        dimension6: 'device',
        dimension7: 'gclid',
        dimension8: 'matchtype'
      },
      campaign_id: formData.campaign_id || '',
      campaign_name: formData.campaign_name || '',
      adgroup_id: formData.adgroup_id || '',
      adgroup_name: formData.adgroup_name || '',
      keyword: formData.keyword || '',
      device: formData.device || '',
      gclid: formData.gclid || '',
      matchtype: formData.matchtype || ''
    });
  }

  // GTM form submission event with enhanced campaign data
  window.dataLayer = window.dataLayer || [];
  const routeData = getRouteVariantData();
  
  window.dataLayer.push({
    event: 'formSubmission',
    formName: 'Lead Form',
    leadInfo: {
      name: formData.name || '',
      phone: formData.phone || '',
      address: formData.street || '',
      propertyValue: formData.formattedApiEstimatedValue || '',
      needsRepairs: formData.needsRepairs || '',
      wantToSetAppointment: formData.wantToSetAppointment || '',
      selectedAppointmentDate: formData.selectedAppointmentDate || '',
      selectedAppointmentTime: formData.selectedAppointmentTime || ''
    },
    campaignData: {
      campaign_id: formData.campaign_id || '',
      campaign_name: formData.campaign_name || '',
      adgroup_id: formData.adgroup_id || '',
      adgroup_name: formData.adgroup_name || '',
      keyword: formData.keyword || '',
      device: formData.device || '',
      gclid: formData.gclid || '',
      traffic_source: formData.traffic_source || 'Direct'
    },
    variantData: {
      routeCampaign: routeData.routeCampaign,
      routeVariant: routeData.routeVariant
    },
    conversionValue: formData.apiEstimatedValue ? Math.round(formData.apiEstimatedValue / 1000) : 0 // Intentionally dividing by 1000 for a "K" value scale
  });

  // Track in Facebook Pixel
  FacebookPixel.trackFormSubmission(formData);
}

// Track form step completion
export function trackFormStepComplete(stepNumber, stepName, formData) {
  if (isDebug) {
    console.log('Analytics - Form Step Complete:', {
      stepNumber,
      stepName,
      campaign_id: formData?.campaign_id || 'Not Available'
    });
  }

  if (GA_TRACKING_ID) {
    ReactGA.event({
      category: 'Form',
      action: 'StepComplete',
      label: `Step ${stepNumber}: ${stepName}`,
      value: stepNumber,
      // Include campaign data as custom parameters
      custom_map: {
        dimension1: 'campaign_id',
        dimension2: 'campaign_name',
        dimension3: 'adgroup_id',
        dimension4: 'adgroup_name',
        dimension5: 'keyword',
        dimension6: 'device',
        dimension7: 'gclid',
        dimension8: 'matchtype'
      },
      campaign_id: formData?.campaign_id || '',
      campaign_name: formData?.campaign_name || '',
      adgroup_id: formData?.adgroup_id || '',
      adgroup_name: formData?.adgroup_name || '',
      keyword: formData?.keyword || '',
      device: formData?.device || '',
      gclid: formData?.gclid || '',
      matchtype: formData?.matchtype || ''
    });
  }

  window.dataLayer = window.dataLayer || [];
  const routeData = getRouteVariantData();
  
  window.dataLayer.push({
    event: 'formStepComplete',
    formStep: stepNumber,
    stepName: stepName,
    campaignData: formData ? {
      campaign_id: formData.campaign_id || '',
      campaign_name: formData.campaign_name || '',
      adgroup_id: formData.adgroup_id || '',
      adgroup_name: formData.adgroup_name || '',
      keyword: formData.keyword || '',
      device: formData.device || '',
      gclid: formData.gclid || '',
      matchtype: formData.matchtype || '',
      traffic_source: formData.traffic_source || 'Direct'
    } : {},
    variantData: {
      routeCampaign: routeData.routeCampaign,
      routeVariant: routeData.routeVariant
    }
  });

  // Track in Facebook Pixel
  FacebookPixel.trackFormStepComplete(stepNumber, stepName, formData);
}

// Track form errors
export function trackFormError(errorMessage, fieldName) {
  if (isDebug) console.log('Analytics - Form Error:', { errorMessage, fieldName });
  
  if (GA_TRACKING_ID) {
    ReactGA.event({
      category: 'Form',
      action: 'Error',
      label: `${fieldName}: ${errorMessage}`
    });
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'formError',
    errorField: fieldName,
    errorMessage: errorMessage
  });
}

// Track phone number conversion (successful phone number submission)
export function trackPhoneNumberLead() {
  console.log('🚀 trackPhoneNumberLead() CALLED - Starting phone lead tracking');
  console.log('🚀 Debug mode:', isDebug);
  console.log('🚀 GA_TRACKING_ID:', GA_TRACKING_ID ? 'Present' : 'Missing');
  
  if (isDebug) console.log('Analytics - Phone Number Lead Submitted');
  
  // GA4 standard event name
  window.dataLayer = window.dataLayer || [];
  console.log('🚀 DataLayer before push:', window.dataLayer.length, 'events');
  
  window.dataLayer.push({
    event: 'GaPhoneNumberLeadSubmitted'
  });
  
  console.log('🚀 DataLayer after push:', window.dataLayer.length, 'events');
  console.log('🚀 Last dataLayer event:', window.dataLayer[window.dataLayer.length - 1]);
  
  // Also track as regular GA event
  if (GA_TRACKING_ID) {
    console.log('🚀 Sending GA4 event...');
    ReactGA.event({
      category: 'Lead',
      action: 'PhoneNumberSubmitted',
      label: 'Phone Number Lead'
    });
    console.log('🚀 GA4 event sent');
  } else {
    console.log('🚀 GA4 event skipped - no tracking ID');
  }
  
  console.log('🚀 trackPhoneNumberLead() COMPLETED');
}

// Track address autocomplete selection
export function trackAddressSelected(addressType) {
  if (isDebug) console.log('Analytics - Address Selected:', addressType);
  
  if (GA_TRACKING_ID) {
    ReactGA.event({
      category: 'Form',
      action: 'AddressSelected',
      label: addressType // 'Google', 'Manual', or 'Autocomplete'
    });
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'addressSelected',
    addressType: addressType
  });
}

// Track property API value received - exact implementation from original AddressForm
export function trackPropertyApiValue(propertyData, address, formData) {
  if (isDebug) console.log('Analytics - Property API Value:', propertyData.apiEstimatedValue, address);
  
  // GTM tracking for "api_value" event (exact copy from original)
  if (window.dataLayer) {
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(propertyData.apiEstimatedValue);

    console.log('%c SENDING API_VALUE EVENT TO GTM', 'background: #4CAF50; color: white; font-weight: bold; padding: 4px;', {
      apiEstimatedValue: propertyData.apiEstimatedValue,
      address: address
    });

    // Create dataLayer event with the confirmed working format (exact copy from original)
    const dataLayerEvent = {
      event: 'api_value', // This exact name is expected by GTM trigger
      apiValue: propertyData.apiEstimatedValue,
      propertyAddress: address,
      formattedValue: formattedValue,
      propertyEquity: propertyData.apiEquity || 0,
      propertyEquityPercentage: propertyData.apiPercentage || 0,
      
      // Campaign parameters at top level for GTM variables
      campaign_name: formData.campaign_name || '',
      campaign_id: formData.campaign_id || '',
      adgroup_name: formData.adgroup_name || '',
      adgroup_id: formData.adgroup_id || '',
      keyword: formData.keyword || '',
      matchtype: formData.matchtype || '',
      gclid: formData.gclid || '',
      device: formData.device || '',
      traffic_source: formData.traffic_source || 'Direct',
      template_type: formData.template_type || ''
    };
    
    // Push event IMMEDIATELY with no delay
    console.log('Pushing api_value event to dataLayer:', dataLayerEvent);
    window.dataLayer.push(dataLayerEvent);
    
    // Log campaign data for debugging
    console.log('CAMPAIGN DATA IN API_VALUE EVENT:', {
      campaign_name: formData.campaign_name || '',
      campaign_id: formData.campaign_id || '',
      keyword: formData.keyword || '',
      matchtype: formData.matchtype || '',
      adgroup_name: formData.adgroup_name || '',
      adgroup_id: formData.adgroup_id || ''
    });
  }
}

// Export debugging tool for use in development
export function debugCampaignTracking() {
  return debugCampaignData();
}

// Re-export Facebook Pixel for compatibility
export { default as ReactPixel } from './facebook';

// Export campaign debugging utilities
export { default as CampaignDebug } from './campaign-debug';