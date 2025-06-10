/**
 * Tracking Service
 * High-level orchestrator for all analytics and tracking
 * Coordinates analytics.js and facebook.js calls
 */

import { 
  trackFormSubmission, 
  trackFormStepComplete, 
  trackFormError,
  trackPhoneNumberLead, 
  trackAddressSelected 
} from './analytics.js';
import { trackPropertyValue } from './facebook.js';

class TrackingService {
  /**
   * Track complete form submission with all related events
   * @param {Object} formData - Form data object
   * @param {string} stepName - Step/component name
   * @param {Object} options - Additional tracking options
   */
  static trackCompleteFormSubmission(formData, stepName, options = {}) {
    console.log('📊 TrackingService: Complete form submission tracking:', stepName);

    try {
      // GA4 tracking
      trackFormSubmission(formData);
      trackFormStepComplete(formData.formStep || 1, stepName, formData);
      
      // Facebook tracking (if property value exists)
      if (formData.apiEstimatedValue > 0) {
        trackPropertyValue({
          value: formData.apiEstimatedValue,
          address: formData.selectedSuggestionAddress || formData.street,
          campaign: formData.campaign_name,
          ...options.propertyData
        });
      }

      console.log('✅ TrackingService: Complete tracking successful');
    } catch (error) {
      console.error('❌ TrackingService: Complete tracking failed:', error);
      trackFormError(`Tracking error: ${error.message}`, stepName);
    }
  }

  /**
   * Track phone number submission with comprehensive data
   * @param {Object} formData - Form data object
   * @param {string} component - Component name ('ValueBoostReport', 'B2Step3', etc.)
   * @param {Object} options - Additional tracking options
   */
  static trackPhoneSubmission(formData, component, options = {}) {
    console.log('📞 TrackingService: Phone submission tracking:', component);

    try {
      // GA4 phone tracking
      trackPhoneNumberLead();
      trackFormStepComplete(formData.formStep || 3, `Phone Submitted - ${component}`, formData);
      
      // Facebook lead tracking
      trackPropertyValue({
        value: formData.apiEstimatedValue || 0,
        address: formData.selectedSuggestionAddress || formData.street,
        phone: formData.phone,
        component: component,
        ...options.leadData
      });

      console.log('✅ TrackingService: Phone tracking successful');
    } catch (error) {
      console.error('❌ TrackingService: Phone tracking failed:', error);
      trackFormError(`Phone tracking error: ${error.message}`, component);
    }
  }

  /**
   * Track report unlock event
   * @param {Object} formData - Form data object
   * @param {string} reportType - Type of report ('ValueBoost', 'OfferBoost', etc.)
   * @param {Object} options - Additional tracking options
   */
  static trackReportUnlock(formData, reportType, options = {}) {
    console.log('🔓 TrackingService: Report unlock tracking:', reportType);

    try {
      // GA4 report unlock tracking
      trackFormStepComplete(formData.formStep || 2, `Report Unlocked - ${reportType}`, formData);
      
      // Facebook tracking with report context
      if (formData.apiEstimatedValue > 0) {
        trackPropertyValue({
          value: formData.apiEstimatedValue,
          address: formData.selectedSuggestionAddress || formData.street,
          reportType: reportType,
          unlocked: true,
          ...options.reportData
        });
      }

      console.log('✅ TrackingService: Report unlock tracking successful');
    } catch (error) {
      console.error('❌ TrackingService: Report unlock tracking failed:', error);
      trackFormError(`Report unlock tracking error: ${error.message}`, `${reportType} Unlock`);
    }
  }

  /**
   * Track address selection (reuses existing analytics function)
   * @param {string} addressType - Type of address selection
   * @param {Object} formData - Form data object
   * @param {Object} options - Additional tracking options
   */
  static trackAddressSelection(addressType, formData, options = {}) {
    console.log('🏠 TrackingService: Address selection tracking:', addressType);

    try {
      // Use existing analytics function
      trackAddressSelected(addressType);
      
      // Add property value tracking if available
      if (formData.apiEstimatedValue > 0) {
        trackPropertyValue({
          value: formData.apiEstimatedValue,
          address: formData.selectedSuggestionAddress || formData.street,
          selectionType: addressType,
          ...options.addressData
        });
      }

      console.log('✅ TrackingService: Address selection tracking successful');
    } catch (error) {
      console.error('❌ TrackingService: Address selection tracking failed:', error);
      trackFormError(`Address selection tracking error: ${error.message}`, 'Address Selection');
    }
  }

  /**
   * Track processing step completion
   * @param {Object} formData - Form data object
   * @param {string} processingType - Type of processing ('AI Analysis', 'Property Lookup', etc.)
   * @param {Object} options - Additional tracking options
   */
  static trackProcessingComplete(formData, processingType, options = {}) {
    console.log('⚙️ TrackingService: Processing completion tracking:', processingType);

    try {
      trackFormStepComplete(formData.formStep || 2, `${processingType} Complete`, formData);

      console.log('✅ TrackingService: Processing tracking successful');
    } catch (error) {
      console.error('❌ TrackingService: Processing tracking failed:', error);
      trackFormError(`Processing tracking error: ${error.message}`, processingType);
    }
  }

  /**
   * Track error events with context
   * @param {string} errorMessage - Error message
   * @param {string} context - Error context/component
   * @param {Object} formData - Form data object (optional)
   */
  static trackError(errorMessage, context, formData = {}) {
    console.log('🚨 TrackingService: Error tracking:', { errorMessage, context });

    try {
      trackFormError(errorMessage, context);
      
      // Add additional context if form data available
      if (formData.formStep) {
        trackFormStepComplete(formData.formStep, `Error - ${context}`, formData);
      }

      console.log('✅ TrackingService: Error tracking successful');
    } catch (error) {
      console.error('❌ TrackingService: Error tracking failed:', error);
      // Don't recursively track this error to avoid loops
    }
  }

  /**
   * Track phone call conversions
   * @param {Object} callData - Call data object
   * @param {Object} options - Additional tracking options
   */
  static trackPhoneCall(callData, options = {}) {
    console.log('📞 TrackingService: Phone call tracking:', callData);

    try {
      // GA4 phone call event
      if (window.gtag) {
        window.gtag('event', 'phone_call_conversion', {
          event_category: 'engagement',
          event_label: 'phone_call',
          phone_number: callData.phoneNumber,
          call_duration: callData.duration,
          value: 1,
          currency: 'USD'
        });
      }

      // Facebook conversion event
      if (callData.duration >= 30) { // Only track longer calls as quality leads
        trackPropertyValue({
          value: 500, // Estimated lead value for phone calls
          phone: callData.phoneNumber,
          eventType: 'phone_call_lead',
          callDuration: callData.duration,
          ...options.leadData
        });
      }

      // Track as form step completion for consistency
      trackFormStepComplete('phone_call', 'Phone Call Received', {
        phoneNumber: callData.phoneNumber,
        callDuration: callData.duration,
        ...callData
      });

      console.log('✅ TrackingService: Phone call tracking successful');
    } catch (error) {
      console.error('❌ TrackingService: Phone call tracking failed:', error);
      this.trackError(`Phone call tracking error: ${error.message}`, 'Phone Call');
    }
  }

  /**
   * Capture and store GCLID for phone call attribution
   * @param {string} phoneNumber - The tracking phone number
   */
  static captureCallTrackingData(phoneNumber = '(888) 874-3302') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const gclid = urlParams.get('gclid');
      const fbclid = urlParams.get('fbclid');
      const utmSource = urlParams.get('utm_source');
      const utmCampaign = urlParams.get('utm_campaign');
      
      if (gclid || fbclid || utmSource) {
        const trackingData = {
          gclid,
          fbclid,
          utmSource,
          utmCampaign,
          phoneNumber: phoneNumber.replace(/[^\d]/g, ''), // Clean phone number
          timestamp: Date.now(),
          url: window.location.href,
          referrer: document.referrer
        };

        // Store for later attribution when call comes in
        localStorage.setItem('phone_call_attribution', JSON.stringify(trackingData));
        console.log('📞 Call tracking data captured:', trackingData);
      }
    } catch (error) {
      console.error('❌ Call tracking data capture failed:', error);
    }
  }

  /**
   * Get tracking statistics for debugging
   * @returns {Object} Tracking statistics
   */
  static getStats() {
    return {
      service: 'TrackingService',
      version: '1.0.0',
      dependencies: ['analytics.js', 'facebook.js'],
      methods: [
        'trackCompleteFormSubmission',
        'trackPhoneSubmission', 
        'trackReportUnlock',
        'trackAddressSelection',
        'trackProcessingComplete',
        'trackPhoneCall',
        'captureCallTrackingData',
        'trackError'
      ]
    };
  }
}

// Export singleton-style service
export const trackingService = TrackingService;
export default TrackingService;