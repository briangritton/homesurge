import ReactGA from 'react-ga4';
import TagManager from 'react-gtm-module';

//
// Stub implementation for ReactPixel
const ReactPixel = {
  init: () => console.log('Pixel initialized (stub)'),
  pageView: () => console.log('Pixel pageview (stub)'),
  track: () => console.log('Pixel event (stub)')
};

// Configuration constants
const GA_TRACKING_ID = 'G-L1BJWHLFF6';
const GTM_ID = 'GTM-NGC4HNKG';

// Initialize analytics services
export function initializeAnalytics() {
  // Initialize Google Analytics 4
  ReactGA.initialize(GA_TRACKING_ID);

  // Initialize Google Tag Manager
  const tagManagerArgs = { gtmId: GTM_ID };
  TagManager.initialize(tagManagerArgs);

  // Track initial page view
  trackPageView(window.location.pathname + window.location.search);
}

// Track page views (GA4-compliant)
export function trackPageView(path) {
  // Google Analytics page view (Updated for GA4)
  ReactGA.send({ hitType: "pageview", page: path });

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
  ReactGA.event({
    category: 'Form',
    action: 'Submit',
    label: 'Lead Form'
  });

  // GTM form submission event
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'formSubmission',
    formName: 'Lead Form',
    leadInfo: {
      name: formData.name,
      phone: formData.phone,
      address: formData.street
    }
  });
}

// Track form step completion
export function trackFormStepComplete(stepNumber, stepName) {
  ReactGA.event({
    category: 'Form',
    action: 'StepComplete',
    label: `Step ${stepNumber}: ${stepName}`
  });

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'formStepComplete',
    formStep: stepNumber,
    stepName: stepName
  });
}

// Track form errors
export function trackFormError(errorMessage, fieldName) {
  ReactGA.event({
    category: 'Form',
    action: 'Error',
    label: `${fieldName}: ${errorMessage}`
  });

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'formError',
    errorField: fieldName,
    errorMessage: errorMessage
  });
}

// Track phone number conversion (successful phone number submission)
export function trackPhoneNumberLead() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'GaPhoneNumberLeadSubmitted'
  });
}

// Track address autocomplete selection
export function trackAddressSelected(addressType) {
  ReactGA.event({
    category: 'Form',
    action: 'AddressSelected',
    label: addressType // 'Google', 'Manual', or 'Autocomplete'
  });

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'addressSelected',
    addressType: addressType
  });
}

// Export stub in case any code imports it
export { ReactPixel };
