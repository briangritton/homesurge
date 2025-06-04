/**
 * Contact Form Service
 * Unified contact form validation, formatting, and submission
 * Shared between ValueBoostReport, B2Step3, and other contact forms
 */

import { leadService } from './leadOperations.js';

class ContactFormService {
  /**
   * Validate phone number
   * @param {string} phone - Phone number to validate
   * @returns {Object} Validation result
   */
  static validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Remove all non-digits
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check length (10 digits for US numbers)
    if (cleanPhone.length < 10) {
      return { isValid: false, error: 'Phone number must be at least 10 digits' };
    }

    if (cleanPhone.length > 11) {
      return { isValid: false, error: 'Phone number is too long' };
    }

    // Check for valid US number patterns
    const phoneRegex = /^(\+?1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return { isValid: false, error: 'Please enter a valid US phone number' };
    }

    return { isValid: true, cleanPhone };
  }

  /**
   * Format phone number for display
   * @param {string} phone - Raw phone number
   * @returns {string} Formatted phone number
   */
  static formatPhone(phone) {
    if (!phone) return '';

    // Remove all non-digits
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
    } else if (cleanPhone.length === 11 && cleanPhone[0] === '1') {
      return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
    }
    
    return phone; // Return original if can't format
  }

  /**
   * Format phone number as user types (real-time formatting)
   * @param {string} value - Current input value
   * @returns {string} Formatted value for input
   */
  static formatPhoneAsTyping(value) {
    if (!value) return '';

    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits (US phone numbers)
    const limitedDigits = digits.slice(0, 10);
    
    // Format progressively as user types
    if (limitedDigits.length <= 3) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    } else {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
  }

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {Object} Validation result
   */
  static validateEmail(email) {
    if (!email) {
      return { isValid: true }; // Email is optional in most forms
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true };
  }

  /**
   * Validate complete contact form
   * @param {Object} formData - Complete form data
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateForm(formData, options = {}) {
    const errors = {};
    let isValid = true;

    // Validate phone (required)
    const phoneValidation = this.validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error;
      isValid = false;
    }

    // Validate email (optional)
    if (formData.email) {
      const emailValidation = this.validateEmail(formData.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error;
        isValid = false;
      }
    }

    // Validate name (if required)
    if (options.requireName && (!formData.name || formData.name.trim().length < 2)) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Validate address (if required)
    if (options.requireAddress && (!formData.street || formData.street.trim().length < 5)) {
      errors.address = 'Please enter a valid address';
      isValid = false;
    }

    return {
      isValid,
      errors,
      cleanData: isValid ? {
        ...formData,
        phone: phoneValidation.cleanPhone || formData.phone
      } : formData
    };
  }

  /**
   * Submit contact form with retry logic
   * @param {Object} contactData - Contact form data
   * @param {Object} formData - Complete form context data
   * @param {Object} options - Submission options
   * @returns {Promise<Object>} Submission result
   */
  static async submitContact(contactData, formData, options = {}) {
    console.log('📋 ContactFormService: Submitting contact form:', {
      hasPhone: !!contactData.phone,
      hasEmail: !!contactData.email,
      hasName: !!contactData.name,
      component: options.component
    });

    try {
      // Validate the form first
      const validation = this.validateForm(contactData, options.validation || {});
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          message: 'Please correct the form errors'
        };
      }

      // Prepare data for CRM submission
      const submissionData = {
        ...formData, // Preserve existing form data
        ...validation.cleanData, // Override with clean contact data
        leadStage: options.leadStage || 'Contact Form Submitted',
        contactSubmittedAt: new Date().toISOString(),
        contactSubmissionComponent: options.component || 'Unknown'
      };

      // Submit to CRM using existing leadService
      const success = await leadService.updateLead(
        leadService.getLeadId(),
        submissionData
      );

      if (success) {
        console.log('✅ ContactFormService: Contact submission successful');
        return {
          success: true,
          data: submissionData,
          message: 'Contact information submitted successfully'
        };
      } else {
        throw new Error('CRM submission failed');
      }

    } catch (error) {
      console.error('❌ ContactFormService: Contact submission failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to submit contact information. Please try again.'
      };
    }
  }

  /**
   * Submit with background retry (for B2Step3-style forms)
   * @param {Object} contactData - Contact form data
   * @param {Object} formData - Complete form context data
   * @param {Object} options - Submission options with retry config
   * @returns {Promise<Object>} Submission result
   */
  static async submitWithRetry(contactData, formData, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`📋 ContactFormService: Submission attempt ${attempt}/${maxRetries}`);

      const result = await this.submitContact(contactData, formData, {
        ...options,
        attempt
      });

      if (result.success) {
        return result;
      }

      // If not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        console.log(`⏳ ContactFormService: Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // All attempts failed
    console.error('💥 ContactFormService: All submission attempts failed');
    return {
      success: false,
      error: 'All retry attempts failed',
      message: 'Unable to submit after multiple attempts. Please try again later.'
    };
  }

  /**
   * Create contact form state management hook data
   * @param {Object} initialData - Initial form data
   * @returns {Object} Form state helpers
   */
  static createFormState(initialData = {}) {
    return {
      data: {
        phone: '',
        email: '',
        name: '',
        ...initialData
      },
      errors: {},
      isSubmitting: false,
      isValid: false
    };
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  static getStats() {
    return {
      service: 'ContactFormService',
      version: '1.0.0',
      features: [
        'Phone validation & formatting',
        'Email validation',
        'Real-time input formatting',
        'CRM submission with retry',
        'Form state management'
      ],
      dependencies: ['leadOperations.js']
    };
  }
}

// Export singleton-style service
export const contactFormService = ContactFormService;
export default ContactFormService;