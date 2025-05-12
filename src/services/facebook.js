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

  // Also track as ViewContent event with page path
  ReactPixel.track('ViewContent', {
    content_name: document.title,
    content_type: 'product',
    content_ids: [path]
  });

  if (DEBUG_MODE) console.log('Facebook Pixel - Page View:', path);
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
    console.log('Facebook Pixel - Lead and CompleteRegistration events fired:', {
      value: eventParams.value,
      campaign: formData.campaignId
    });
  }
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
}

export default {
  initializeFacebookPixel,
  trackPageView,
  trackFormStepComplete,
  trackFormSubmission,
  trackCustomEvent
};