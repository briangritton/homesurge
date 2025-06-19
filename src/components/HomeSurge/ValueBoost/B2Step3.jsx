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
      
      // 1. Update FormContext with contact data (synchronous, immediate)
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
      
      // 2. Navigate immediately - don't wait for CRM
      console.log('🚀 B2Step3: Instant navigation - proceeding to next step');
      nextStep();
      
      // 3. Immediate tracking (synchronous)
      trackingService.trackPhoneSubmission(
        { ...formData, ...formUpdate },
        'B2Step3',
        {
          leadData: {
            funnelType: 'valueboost_b2',
            conversionType: 'b2_qualified',
            campaign_name: formData.campaign_name || '',
            submissionSuccess: 'pending' // CRM submission happening in background
          }
        }
      );
      
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
      
      console.log('✅ B2Step3: Instant navigation and tracking completed');
      
      // 4. Fire-and-forget CRM submission with background retries
      setTimeout(() => {
        console.log('🔄 B2Step3: Starting background CRM submission with retries...');
        
        contactFormService.submitWithRetry(
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
        ).then(result => {
          if (result.success) {
            console.log('✅ B2Step3: Background CRM submission successful');
          } else {
            console.error('❌ B2Step3: Background CRM submission failed after all retries:', result.error);
            // Could store in localStorage for later retry if needed
            localStorage.setItem('pendingB2Step3Submission', JSON.stringify({
              contactData: { name: cleanName, phone: cleanedPhone, email: contactInfo.email || '' },
              formData: { ...formData, ...formUpdate },
              timestamp: new Date().toISOString(),
              component: 'B2Step3'
            }));
          }
        }).catch(error => {
          console.error('❌ B2Step3: Background CRM submission error:', error);
          // Store for potential later retry
          localStorage.setItem('pendingB2Step3Submission', JSON.stringify({
            contactData: { name: cleanName, phone: cleanedPhone, email: contactInfo.email || '' },
            formData: { ...formData, ...formUpdate },
            timestamp: new Date().toISOString(),
            component: 'B2Step3',
            error: error.message
          }));
        });
      }, 0); // setTimeout with 0ms = next event loop (non-blocking)
      
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
          {/* Address Display - Only show when valid API data is available and fully loaded */}
          {((formData.apiMaxHomeValue > 0) || (formData.apiEstimatedValue > 0)) && formData.street && !formData.apiLoading && (
            <div className="vb-b2-address-display">
              {(() => {
                const parts = formData.street.split(',');
                
                // Check if we have enough parts for the expected format
                if (parts.length >= 3) {
                  // Format with street part + city, state
                  return (
                    <>
                      {parts.slice(0, -2).join(',')},
                      <span className="vb-b2-nowrap-phrase">
                        {parts.slice(-2).join(',').replace(/, USA$/, '')}
                      </span>
                    </>
                  );
                } else if (parts.length === 2) {
                  // Format with just two parts (likely street + city/state)
                  return (
                    <>
                      {parts[0]},
                      <span className="vb-b2-nowrap-phrase">
                        {parts[1].replace(/, USA$/, '')}
                      </span>
                    </>
                  );
                } else {
                  // Just display the address as is if only one part
                  return formData.street.replace(/, USA$/, '');
                }
              })()}
            </div>
          )}

          {/* Value Estimate Display - Only show when API data is available and fully loaded */}
          {formData.apiMaxHomeValue > 0 && !formData.apiLoading ? (
            <div className="vb-b2-estimate-container">
              <span className="vb-b2-value-estimate-label">Value Estimate:</span>
              <span className="vb-b2-property-estimate">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(formData.apiMaxHomeValue)}
              </span>
            </div>
          ) : formData.apiEstimatedValue > 0 && !formData.apiLoading ? (
            <div className="vb-b2-estimate-container">
              <span className="vb-b2-value-estimate-label">Value Estimate:</span>
              <span className="vb-b2-property-estimate">
                {formData.formattedApiEstimatedValue && formData.formattedApiEstimatedValue !== '$0' 
                  ? formData.formattedApiEstimatedValue 
                  : new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(formData.apiEstimatedValue)
                }
              </span>
            </div>
          ) : null}

          {/* Report Ready State - match original structure */}
          <div className="vb-b2-ready-container">
            <div 
              className="vb-b2-hero-headline"
              dangerouslySetInnerHTML={{ __html: dynamicContent.readyHeadline }}
            />
            <div className="vb-b2-hero-subheadline" dangerouslySetInnerHTML={{ __html: dynamicContent.readySubheadline }}>
            </div>
          </div>
          
          {/* Contact Form Section */}
          <div className="vb-b2-form-section">
            <div className="vb-b2-locked-overlay">
              {/* Opaque background wrapper for the unlock section */}
              <div className="vb-b2-unlock-section-wrapper">
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

                <div className="vb-b2-unlock-security-text" dangerouslySetInnerHTML={{ __html: dynamicContent.disclaimer }}>
                </div>
                
                <div className="vb-b2-phone-section">
                  <p className="vb-b2-phone-text">Prefer to talk? Call or text:</p>
                  <a href="tel:+14046714628" className="vb-b2-phone-number">(404) 671-4628</a>
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