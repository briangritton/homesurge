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
  const { formData, updateFormData, nextStep } = useFormContext();
  
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
      
      // 2. Submit to CRM with retry logic and 5-second timeout protection
      console.log('🕐 B2Step3: Starting CRM save with 5-second timeout...');
      
      const crmSavePromise = contactFormService.submitWithRetry(
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
      
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('⏰ B2Step3: CRM save timeout reached (5 seconds) - proceeding with navigation');
          resolve({ success: false, timeout: true, message: 'CRM save timed out' });
        }, 5000);
      });
      
      // Wait for either CRM save to complete OR timeout (whichever comes first)
      const submissionResult = await Promise.race([crmSavePromise, timeoutPromise]);
      
      if (submissionResult.timeout) {
        console.log('⏰ B2Step3: Navigation proceeding due to timeout');
      } else if (submissionResult.success) {
        console.log('✅ B2Step3: CRM save completed successfully before timeout');
      } else {
        console.log('❌ B2Step3: CRM save failed before timeout');
      }
      
      // 3. Navigate to step 4 (ValueBoostQualifyingB2)
      nextStep();
      console.log('✅ B2Step3: Navigating to ValueBoostQualifyingB2');
      
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
      
      // Still navigate so user can proceed
      nextStep();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== RENDER =====
  if (submitted) {
    return (
      <div className="vb-b2-report-section">
        <div className="vb-b2-report-container">
          <div className="vb-b2-content vb-b2-fade-in">
            <div className="vb-b2-ready-container">
              <div className="vb-b2-hero-headline">Thank You!</div>
              <div className="vb-b2-hero-subheadline">
                Your information has been submitted. You'll receive your report shortly.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vb-b2-report-section">
      <div className="vb-b2-report-container">
        <div className="vb-b2-content vb-b2-fade-in">
          {/* Report Ready State - match original structure */}
          <div className="vb-b2-ready-container">
            <div className="vb-b2-hero-headline">
              {dynamicContent.readyHeadline}
            </div>
            <div className="vb-b2-hero-subheadline" dangerouslySetInnerHTML={{ __html: dynamicContent.readySubheadline }}>
            </div>
          </div>
          
          {/* Contact Form Section */}
          <div className="vb-b2-form-section">
            <div className="vb-b2-locked-overlay">
              {/* Opaque background wrapper for the unlock section */}
              <div className="vb-b2-unlock-section-wrapper">
                <div className="vb-b2-unlock-header">
                  <h3 className="vb-b2-unlock-headline" dangerouslySetInnerHTML={{ __html: dynamicContent.unlockHeadline }}>
                  </h3>
                </div>
                <div className="vb-b2-features-bubble">
                  <div className="vb-b2-feature-item">
                    <div className="vb-b2-feature-icon">✓</div>
                    <p className="vb-b2-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark1 }}>
                    </p>
                  </div>
                  <div className="vb-b2-feature-item">
                    <div className="vb-b2-feature-icon">✓</div>
                    <p className="vb-b2-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark2 }}>
                    </p>
                  </div>
                  <div className="vb-b2-feature-item">
                    <div className="vb-b2-feature-icon">✓</div>
                    <p className="vb-b2-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark3 }}>
                    </p>
                  </div>
                </div>

                {/* Inline form fields */}
                <div className="vb-b2-unlock-form-container">
                  <div className="vb-b2-optin-form-fields">
                    {/* Name field - starts empty, no autofill */}
                    <input
                      type="text"
                      name="name"
                      value={contactInfo.name}
                      onChange={handleInputChange}
                      placeholder="Name"
                      autoComplete="name"
                      className={`vb-b2-unlock-input ${formErrors.name ? 'vb-b2-unlock-input-error' : ''}`}
                      disabled={isSubmitting}
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleInputChange}
                      placeholder="Phone (Get a text copy)"
                      autoComplete="tel"
                      className={`vb-b2-unlock-input ${formErrors.phone ? 'vb-b2-unlock-input-error' : ''}`}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  {formErrors.phone && (
                    <div className="vb-b2-unlock-form-error">
                      {formErrors.phone}
                    </div>
                  )}
                  {formErrors.name && (
                    <div className="vb-b2-unlock-form-error">
                      {formErrors.name}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="vb-b2-unlock-button vb-b2-button-flare"
                >
                  {isSubmitting ? 'Processing...' : dynamicContent.buttonText}
                </button>

                <div className="vb-b2-unlock-security-text" dangerouslySetInnerHTML={{ __html: dynamicContent.disclaimer }}>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default B2Step3;