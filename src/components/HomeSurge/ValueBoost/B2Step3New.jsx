/**
 * B2Step3 Component (Rewritten)
 * Clean, simplified implementation using service layer
 */

import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';

// Import new services
import { templateService } from '../../../services/templateEngine';
import { contactFormService } from '../../../services/contactFormService';
import { trackingService } from '../../../services/trackingService';

function B2Step3({ campaign, variant }) {
  // ===== FORM CONTEXT =====
  const { formData, updateFormData } = useFormContext();
  
  // ===== STATE (Minimal) =====
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // ===== DYNAMIC CONTENT =====
  const dynamicContent = templateService.getTemplate(campaign, variant, 'b2step3');
  
  // ===== AUTO SCROLL =====
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ===== FORM HANDLERS =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Real-time phone formatting
    if (name === 'phone') {
      processedValue = contactFormService.formatPhoneAsTyping(value);
    }
    
    setContactInfo(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const validation = contactFormService.validateForm(contactInfo, {
      requireName: false, // Name is optional in B2
      requireAddress: false
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('📋 B2Step3: Processing contact submission');
      
      // 1. Update FormContext with contact data
      const cleanName = contactInfo.name ? contactInfo.name.trim() : '';
      const phoneValidation = contactFormService.validatePhone(contactInfo.phone);
      const cleanedPhone = phoneValidation.isValid ? phoneValidation.cleanPhone : contactInfo.phone;
      
      const formUpdate = {
        name: cleanName,
        phone: cleanedPhone,
        email: contactInfo.email || '',
        nameWasAutofilled: false,
        leadStage: 'ValueBoost B2 Qualified'
      };
      
      updateFormData(formUpdate);
      
      // Small delay to ensure FormContext updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 2. Submit to CRM with retry logic (non-blocking)
      const submissionResult = await contactFormService.submitWithRetry(
        {
          name: cleanName,
          phone: cleanedPhone,
          email: contactInfo.email || ''
        },
        { ...formData, ...formUpdate },
        {
          component: 'B2Step3',
          leadStage: 'ValueBoost B2 Contact Info Provided',
          maxRetries: 10 // Aggressive retry for B2
        }
      );
      
      // 3. Always proceed for user experience (even if CRM submission failed)
      setSubmitted(true);
      console.log('✅ B2Step3: User proceeding immediately');
      
      // 4. Comprehensive tracking
      trackingService.trackPhoneSubmission(
        { ...formData, ...formUpdate },
        'B2Step3',
        {
          leadData: {
            funnelType: 'valueboost_b2',
            conversionType: 'b2_qualified',
            campaign_name: formData.campaign_name || '',
            submissionSuccess: submissionResult.success
          }
        }
      );
      
      // 5. Track complete form submission
      trackingService.trackCompleteFormSubmission(
        { ...formData, ...formUpdate },
        'ValueBoost B2 Qualified',
        {
          propertyData: {
            funnel: 'valueboost_b2',
            name: cleanName,
            phone: cleanedPhone,
            email: contactInfo.email || ''
          }
        }
      );
      
      console.log('✅ B2Step3: All tracking completed');
      
    } catch (error) {
      console.error('❌ B2Step3: Submission error:', error);
      
      // Track error but still proceed for user experience
      trackingService.trackError(
        `B2Step3 submission error: ${error.message}`,
        'B2Step3',
        formData
      );
      
      // Still mark as submitted so user can proceed
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== RENDER =====
  if (submitted) {
    return (
      <div className="vb-b2-container">
        <div className="vb-b2-success">
          <div className="vb-b2-success-headline">Thank You!</div>
          <div className="vb-b2-success-message">
            Your information has been submitted. You'll receive your report shortly.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vb-b2-container">
      {/* HEADER SECTION */}
      <div className="vb-b2-header">
        <div 
          className="vb-b2-headline"
          dangerouslySetInnerHTML={{ __html: dynamicContent.readyHeadline }}
        />
        <div 
          className="vb-b2-subheadline"
          dangerouslySetInnerHTML={{ __html: dynamicContent.readySubheadline }}
        />
      </div>

      {/* BENEFITS SECTION */}
      <div className="vb-b2-benefits">
        <div 
          className="vb-b2-benefits-headline"
          dangerouslySetInnerHTML={{ __html: dynamicContent.unlockHeadline }}
        />
        <div className="vb-b2-benefits-subtext">
          {dynamicContent.unlockSubtext}
        </div>
        
        <div className="vb-b2-checkmarks">
          <div 
            className="vb-b2-checkmark"
            dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark1 }}
          />
          <div 
            className="vb-b2-checkmark"
            dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark2 }}
          />
          <div 
            className="vb-b2-checkmark"
            dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark3 }}
          />
        </div>
      </div>

      {/* CONTACT FORM */}
      <form onSubmit={handleSubmit} className="vb-b2-form">
        {/* Name Field (Optional) */}
        <div className="vb-b2-field-group">
          <input
            type="text"
            name="name"
            placeholder="Your name (optional)"
            value={contactInfo.name}
            onChange={handleInputChange}
            className={`vb-b2-input ${formErrors.name ? 'vb-b2-input-error' : ''}`}
            disabled={isSubmitting}
          />
          {formErrors.name && (
            <div className="vb-b2-error">{formErrors.name}</div>
          )}
        </div>

        {/* Phone Field (Required) */}
        <div className="vb-b2-field-group">
          <input
            type="tel"
            name="phone"
            placeholder="Your phone number"
            value={contactInfo.phone}
            onChange={handleInputChange}
            className={`vb-b2-input ${formErrors.phone ? 'vb-b2-input-error' : ''}`}
            disabled={isSubmitting}
            required
          />
          {formErrors.phone && (
            <div className="vb-b2-error">{formErrors.phone}</div>
          )}
        </div>

        {/* Email Field (Optional) */}
        <div className="vb-b2-field-group">
          <input
            type="email"
            name="email"
            placeholder="Your email (optional)"
            value={contactInfo.email}
            onChange={handleInputChange}
            className={`vb-b2-input ${formErrors.email ? 'vb-b2-input-error' : ''}`}
            disabled={isSubmitting}
          />
          {formErrors.email && (
            <div className="vb-b2-error">{formErrors.email}</div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="vb-b2-submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : dynamicContent.buttonText}
        </button>

        {/* Disclaimer */}
        <div 
          className="vb-b2-disclaimer"
          dangerouslySetInnerHTML={{ __html: dynamicContent.disclaimer }}
        />
      </form>
    </div>
  );
}

export default B2Step3;