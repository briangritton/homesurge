import ReactGA from 'react-ga4';
// import ReactPixel from 'react-facebook-pixel';
import TagManager from 'react-gtm-module';

// Configuration constants
const GA_TRACKING_ID = 'G-L961YM0GEN';
// const FB_PIXEL_ID = '268197213521133';
const GTM_ID = 'GTM-MXD6W8K';

// Initialize analytics services
export function initializeAnalytics() {
  // Initialize Google Analytics
  ReactGA.initialize(GA_TRACKING_ID);
  
  // Initialize Facebook Pixel
  // ReactPixel.init(FB_PIXEL_ID);
  
  // Initialize Google Tag Manager
  const tagManagerArgs = {
    gtmId: GTM_ID
  };
  TagManager.initialize(tagManagerArgs);
  
  // Track initial page view
  trackPageView(window.location.pathname + window.location.search);
}

// Track page views
export function trackPageView(path) {
  // Google Analytics page view
  ReactGA.pageview(path);
  
  // Facebook Pixel page view
  // ReactPixel.pageView();
  
  // GTM page view event
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
  // Google Analytics event
  ReactGA.event({
    category: 'Form',
    action: 'Submit',
    label: 'Lead Form'
  });
  
  // Facebook Pixel lead event
  // ReactPixel.track('Lead', {
  //   name: formData.name,
  //   email: formData.email,
  //   phone: formData.phone,
  //   zip: formData.zip,
  //   street: formData.street
  // });
  
  // GTM form submission event
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
  // Google Analytics event
  ReactGA.event({
    category: 'Form',
    action: 'StepComplete',
    label: `Step ${stepNumber}: ${stepName}`
  });
  
  // GTM form step event
  window.dataLayer.push({
    event: 'formStepComplete',
    formStep: stepNumber,
    stepName: stepName
  });
}

// Track form errors
export function trackFormError(errorMessage, fieldName) {
  // Google Analytics event
  ReactGA.event({
    category: 'Form',
    action: 'Error',
    label: `${fieldName}: ${errorMessage}`
  });
  
  // GTM form error event
  window.dataLayer.push({
    event: 'formError',
    errorField: fieldName,
    errorMessage: errorMessage
  });
}

// Track phone number conversion (successful phone number submission)
export function trackPhoneNumberLead() {
  // GTM specific event for phone lead conversion
  window.dataLayer.push({
    event: 'GaPhoneNumberLeadSubmitted'
  });
}

// Track address autocomplete selection
export function trackAddressSelected(addressType) {
  // Google Analytics event
  ReactGA.event({
    category: 'Form',
    action: 'AddressSelected',
    label: addressType // 'Google', 'Manual', or 'Autocomplete'
  });
  
  // GTM address selection event
  window.dataLayer.push({
    event: 'addressSelected',
    addressType: addressType
  });
}