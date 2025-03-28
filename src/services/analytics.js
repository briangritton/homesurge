import ReactGA from 'react-ga4';
import TagManager from 'react-gtm-module';

// Stub implementation for ReactPixel
const ReactPixel = {
  init: () => console.log('Pixel initialized (stub)'),
  pageView: () => console.log('Pixel pageview (stub)'),
  track: () => console.log('Pixel event (stub)')
};

// Configuration constants - use empty strings as fallbacks for security
const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || '';
const GTM_ID = process.env.REACT_APP_GTM_ID || '';

// Debug mode for development
const isDebug = process.env.NODE_ENV === 'development';

// Initialize analytics services
export function initializeAnalytics() {
  if (isDebug) console.log('Analytics - Initializing with:', { GA_TRACKING_ID, GTM_ID });
  
  // Only initialize if IDs are provided
  if (GA_TRACKING_ID) {
    // Initialize Google Analytics 4
    ReactGA.initialize(GA_TRACKING_ID);
  } else if (isDebug) {
    console.log('Analytics - GA4 initialization skipped: No tracking ID provided');
  }

  if (GTM_ID) {
    // Initialize Google Tag Manager
    const tagManagerArgs = { 
      gtmId: GTM_ID,
      dataLayerName: 'dataLayer',
      auth: '',
      preview: ''
    };
    TagManager.initialize(tagManagerArgs);
  } else if (isDebug) {
    console.log('Analytics - GTM initialization skipped: No container ID provided');
  }

  // Track initial page view
  trackPageView(window.location.pathname + window.location.search);
  
  if (isDebug) console.log('Analytics - Initialization complete');
}

// Track page views (GA4-compliant)
export function trackPageView(path) {
  if (isDebug) console.log('Analytics - Page View:', path);
  
  // Only track if GA is initialized
  if (GA_TRACKING_ID) {
    // Google Analytics page view (Updated for GA4)
    ReactGA.send({ hitType: "pageview", page: path });
  }

  // Ensure `window.dataLayer` exists before pushing data
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'pageView',
    page: {
      path: path,
      title: document.title
    }
  });
}

// Track form submissions
export function trackFormSubmission(formData) {
  if (isDebug) {
    console.log('Analytics - Form Submission:', { 
      name: formData.name ? 'Provided' : 'Missing',
      phone: formData.phone ? 'Provided' : 'Missing', 
      address: formData.street ? 'Provided' : 'Missing',
      propertyValue: formData.apiEstimatedValue || 'Not Available'
    });
  }
  
  if (GA_TRACKING_ID) {
    ReactGA.event({
      category: 'Form',
      action: 'Submit',
      label: 'Lead Form'
    });
  }

  // GTM form submission event
  window.dataLayer = window.dataLayer || [];
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
    }
  });
}

// Track form step completion
export function trackFormStepComplete(stepNumber, stepName) {
  if (isDebug) console.log('Analytics - Form Step Complete:', { stepNumber, stepName });
  
  if (GA_TRACKING_ID) {
    ReactGA.event({
      category: 'Form',
      action: 'StepComplete',
      label: `Step ${stepNumber}: ${stepName}`
    });
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'formStepComplete',
    formStep: stepNumber,
    stepName: stepName
  });
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
  if (isDebug) console.log('Analytics - Phone Number Lead Submitted');
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'GaPhoneNumberLeadSubmitted'
  });
  
  // Also track as regular GA event
  if (GA_TRACKING_ID) {
    ReactGA.event({
      category: 'Lead',
      action: 'PhoneNumberSubmitted',
      label: 'Phone Number Lead'
    });
  }
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

// Export stub in case any code imports it
export { ReactPixel };