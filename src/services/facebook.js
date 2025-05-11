/**
 * Facebook Pixel and Conversions API integration
 * This service handles both browser-side pixel events and server-side conversions API
 */

// Import config (during development - will be replaced with env vars)
// IMPORTANT: Remove this import and use env vars in production
import ReactPixel from 'react-facebook-pixel';
import axios from 'axios';

// Constants
const PIXEL_ID = process.env.REACT_APP_FB_PIXEL_ID || '';
const DEBUG_MODE = process.env.NODE_ENV === 'development';

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

  // Initialize pixel
  ReactPixel.init(PIXEL_ID, advancedMatching, options);
  
  // Track initial page view
  ReactPixel.pageView();
  
  if (DEBUG_MODE) console.log('Facebook Pixel - Initialized with ID:', PIXEL_ID);
}

/**
 * Track page view in Facebook Pixel
 * @param {string} path - Current page path
 */
export function trackPageView(path) {
  if (!PIXEL_ID) return;
  
  // Track page view
  ReactPixel.pageView();
  
  // Also track as ViewContent event with page path
  ReactPixel.track('ViewContent', {
    content_name: document.title,
    content_type: 'product',
    content_ids: [path]
  });
  
  if (DEBUG_MODE) console.log('Facebook Pixel - Page View:', path);
  
  // No server-side call for basic page views to reduce API usage
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
        eventParams.value = formData.apiEstimatedValue / 100; // Convert to dollars
        eventParams.currency = 'USD';
      }
      break;
    default:
      eventName = 'CustomStep';
      break;
  }
  
  // Track in browser
  ReactPixel.track(eventName, eventParams);

  if (DEBUG_MODE) {
    console.log(`Facebook Pixel - ${eventName}:`, eventParams);
  }

  // Server-side event tracking
  sendServerEvent(eventName, eventParams, formData);
}

/**
 * Track form submission in Facebook
 * @param {object} formData - Submitted form data
 */
export function trackFormSubmission(formData) {
  if (!PIXEL_ID) return;
  
  // Prepare event parameters
  const eventParams = {
    content_name: 'Lead Form Submission',
    content_category: 'Real Estate',
    value: formData.apiEstimatedValue ? formData.apiEstimatedValue / 100 : 0,
    currency: 'USD',
    status: true
  };
  
  // Add campaign data if available
  if (formData.campaignId) {
    eventParams.campaign_id = formData.campaignId;
    eventParams.campaign_name = formData.campaignName;
  }
  
  // Track Lead event in browser
  ReactPixel.track('Lead', eventParams);
  
  // Also track CompleteRegistration for funnel completion
  ReactPixel.track('CompleteRegistration', {
    content_name: 'Form Completed',
    status: true,
    value: eventParams.value,
    currency: 'USD'
  });
  
  if (DEBUG_MODE) {
    console.log('Facebook Pixel - Lead:', {
      value: eventParams.value,
      campaign: formData.campaignId
    });
  }
  
  // Server-side event tracking
  sendServerEvent('Lead', eventParams, formData);
}

/**
 * Track a custom event
 * @param {string} eventName - Name of the event
 * @param {object} eventParams - Event parameters
 */
export function trackCustomEvent(eventName, eventParams = {}) {
  if (!PIXEL_ID) return;
  
  // Track in browser
  ReactPixel.trackCustom(eventName, eventParams);

  if (DEBUG_MODE) {
    console.log(`Facebook Pixel - ${eventName}:`, eventParams);
  }

  // Server-side event tracking
  sendServerEvent(eventName, eventParams);
}

/**
 * Send event to Facebook Conversions API (server-side)
 * This calls our Vercel serverless function endpoint
 * @param {string} eventName - Facebook standard event name
 * @param {object} eventParams - Event parameters
 * @param {object} userData - User data for matching
 */
async function sendServerEvent(eventName, eventParams = {}, userData = {}) {
  if (!PIXEL_ID) return;

  try {
    // Get browser metadata to help with user matching
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    // Prepare event data for server
    const eventData = {
      eventName,
      eventTime: Date.now(),
      eventSourceUrl: window.location.href,
      eventId: `${eventName}_${Date.now()}`, // Create a unique event ID for deduplication
      userData: {
        ...userData,
        userAgent: navigator.userAgent,
        // Extract Facebook browser cookies if they exist
        fbp: cookies._fbp || cookies.fbp || undefined,
        fbc: cookies._fbc || cookies.fbc || undefined,
        // Use the client's IP address (will be captured by server)
        ip: '' // Will be captured by the server
      },
      customData: {
        ...eventParams,
        value: eventParams.value || 0,
        currency: eventParams.currency || 'USD',
        content_category: eventParams.content_category || 'Real Estate',
        page_title: document.title,
      }
    };

    // Log what we're sending in development
    if (DEBUG_MODE) {
      console.log('Facebook CAPI - Sending event:', {
        event_name: eventName,
        event_params: eventParams,
        user_data: {
          email: userData.email ? '[PRESENT]' : undefined,
          phone: userData.phone ? '[PRESENT]' : undefined,
          address: userData.street ? '[PRESENT]' : undefined
        }
      });
    }

    // Send to our API endpoint
    const response = await fetch('/api/facebook-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    const result = await response.json();

    if (!result.success) {
      console.error('Error sending Facebook CAPI event:', result.error);
    } else if (DEBUG_MODE) {
      console.log('Facebook CAPI event sent successfully:', result);
    }

    return result.success;
  } catch (error) {
    console.error('Error sending Facebook CAPI event:', error);
    return false;
  }
}

export default {
  initializeFacebookPixel,
  trackPageView,
  trackFormStepComplete,
  trackFormSubmission,
  trackCustomEvent
};