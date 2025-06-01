import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import { trackPropertyValue } from '../../../services/facebook';
import { trackPhoneNumberLead, trackFormStepComplete, trackFormSubmission } from '../../../services/analytics';
import { doc, updateDoc, serverTimestamp, getFirestore } from 'firebase/firestore';

function B2Step3({ campaign, variant }) {
  const { formData, updateFormData, updateLead, nextStep } = useFormContext();
  const db = getFirestore();
  
  // ================================================================================
  // DYNAMIC CONTENT SYSTEM - B2 TEMPLATES ONLY
  // ================================================================================
  
  const getDynamicContent = () => {
    // Use campaign prop from route (e.g., /analysis/cash/b2o)
    const campaignName = campaign || 'cash';
    
    // B2 TEMPLATES ONLY - EXACT MATCH FROM ORIGINAL VALUEBOOSTREPORT
    const templates = {
      // CASH B2 - More urgent, immediate cash offer language
      cashB2: {
        // Header content
        readyHeadline: 'Next, where do you want us to text your cash offer?',
        readySubheadline: 'We\'ll send you our strongest <strong><i>no obligation cash offer</i></strong>, and you choose how fast to close! ',
        
        // Unlock form content
        unlockHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        unlockSubtext: 'Time-sensitive analysis - get your complete cash offer before rates change',
        
        // Checkmark lines
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        
        // CTA section
        buttonText: 'GET CASH OFFER',
        
        // Disclaimer (at bottom)
        disclaimer: '*URGENT: Example values only. Your cash offer expires soon and will depend on current market conditions and property details. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a Do Not Call list. We respect your privacy and will never share your details with anyone. No spam ever.'
      },
      
      // FAST B2 - Emergency/urgent sale scenarios
      fastB2: {
        // Header content
        readyHeadline: 'EMERGENCY: Your 7-Day OfferBoost Exit Strategy is Ready!',
        readySubheadline: 'Your <strong>emergency 7-day sale solution</strong> is ready below. Get immediate cash when you need it most - no delays!',
        
        // Unlock form content
        unlockHeadline: 'Get Your EMERGENCY 7-Day Sale Report',
        unlockSubtext: 'Critical timeline analysis for immediate property liquidation',
        
        // Checkmark lines
        checkmark1: '<strong><em>EMERGENCY:</em></strong> All <strong>7-day exit strategies</strong> for your property',
        checkmark2: '<strong><em>CRISIS-PROVEN:</em></strong> Immediate property <strong>liquidation tactics</strong>',
        checkmark3: '<strong><em>EMERGENCY:</em></strong> <strong>Customized</strong> for your property',
        
        // CTA section
        buttonText: 'EMERGENCY SALE',
        
        // Disclaimer (at bottom)
        disclaimer: '*EMERGENCY: Example values only. Your 7-day exit strategy will depend on urgent market conditions and property details. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a Do Not Call list. We respect your privacy and will never share your details with anyone. No spam ever.'
      },
      
      // VALUE B2 - Deeper value analysis and insights
      valueB2: {
        // Header content
        readyHeadline: 'DEEP DIVE: Your Advanced ValueBoost Analysis is Ready!',
        readySubheadline: 'Your <strong>deep value analysis</strong> reveals hidden opportunities below. Discover equity potential others overlook!',
        
        // Unlock form content
        unlockHeadline: 'Get Your DEEP VALUE Discovery Report',
        unlockSubtext: 'Comprehensive value analysis with hidden equity identification',
        
        // Checkmark lines
        checkmark1: '<strong><em>DEEP DIVE:</em></strong> All <strong>hidden value secrets</strong> for your property',
        checkmark2: '<strong><em>ADVANCED:</em></strong> Untapped <strong>equity opportunities</strong> others miss',
        checkmark3: '<strong><em>DEEP VALUE:</em></strong> <strong>Customized</strong> for your property',
        
        // CTA section
        buttonText: 'DISCOVER VALUE',
        
        // Disclaimer (at bottom)
        disclaimer: '*DEEP DIVE: Example values only. Your hidden value potential will depend on advanced analysis of specific property details and market conditions. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a Do Not Call list. We respect your privacy and will never share your details with anyone. No spam ever.'
      },
      
      // WIDE B2 - Enhanced comprehensive hassle-free solutions
      sellB2: {
        // Header content
        readyHeadline: 'COMPLETE: Your All-Inclusive Property Plan is Ready!',
        readySubheadline: 'Your <strong>complete all-inclusive solution</strong> is below. Every detail handled with white-glove service!',
        
        // Unlock form content
        unlockHeadline: 'Get Your COMPLETE All-Inclusive Report',
        unlockSubtext: 'Total property solution with every detail managed professionally',
        
        // Checkmark lines
        checkmark1: '<strong><em>COMPLETE:</em></strong> All-inclusive <strong>solutions</strong> for your property',
        checkmark2: '<strong><em>WHITE-GLOVE:</em></strong> Every detail <strong>managed professionally</strong>',
        checkmark3: '<strong><em>COMPREHENSIVE:</em></strong> <strong>Customized</strong> for your property',
        
        // CTA section
        buttonText: 'COMPLETE SOLUTION',
        
        // Disclaimer (at bottom)
        disclaimer: '*COMPLETE: Example values only. Your all-inclusive solution will depend on comprehensive analysis of specific property details and service requirements. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a Do Not Call list. We respect your privacy and will never share your details with anyone. No spam ever.'
      },
      
      // DEFAULT FALLBACK (MATCHES CASH THEME FROM ORIGINAL)
      default: {
        readyHeadline: 'dYour OfferBoost Highest Cash Offer is Ready!',
        readySubheadline: 'Check your OfferBoost cash offer below, and unlock your FREE AI powered custom home value and offer optimization report. No obligation, no strings attached.',
        unlockHeadline: 'Get Your FREE OfferBoost Maximum Cash Report',
        unlockSubtext: 'Get your complete cash offer strategy with market insights and opportunities',
        checkmark1: 'All <strong>OfferBoost cash offer</strong> opportunities for your property',
        checkmark2: 'Detailed <strong>maximum OfferBoost calculations</strong> for maximizing home value',
        checkmark3: '<strong>Customized</strong> for your property',
        buttonText: 'CHECK CASH OFFER',
        disclaimer: '*Example values only. Your offer amount will depend on your specific home details and other factors. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a Do Not Call list. We respect your privacy and will never share your details with anyone. No spam ever.'
      }
    };
    
    // Campaign matching logic for B2 variants
    if (campaignName) {
      const simplified = campaignName.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      // CASH/SELLING CAMPAIGN MATCHING
      if (simplified.includes('cash')) return templates.cashB2;
      if (simplified.includes('fast')) return templates.fastB2;
      if (simplified.includes('sell')) return templates.sellB2;
      
      // VALUE/IMPROVEMENT CAMPAIGN MATCHING
      if (simplified.includes('value')) return templates.valueB2;
    }

    return templates.default;
  };
  
  const dynamicContent = getDynamicContent();
  
  // Contact form state
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Phone validation function
  const validateAndCleanPhone = (phone) => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it's a valid US phone number (10 digits)
    if (digitsOnly.length === 10) {
      // Format as (XXX) XXX-XXXX
      const formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
      return { isValid: true, cleaned: formatted };
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      // Handle +1 country code
      const withoutCountryCode = digitsOnly.slice(1);
      const formatted = `(${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(3, 6)}-${withoutCountryCode.slice(6)}`;
      return { isValid: true, cleaned: formatted };
    }
    
    return { isValid: false, cleaned: phone };
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Phone validation
    if (!contactInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneValidation = validateAndCleanPhone(contactInfo.phone);
      if (!phoneValidation.isValid) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    
    // Clean the input values
    let cleanName = contactInfo.name ? contactInfo.name.trim() : '';
    const phoneValidation = validateAndCleanPhone(contactInfo.phone);
    const cleanedPhone = phoneValidation.isValid ? phoneValidation.cleaned : contactInfo.phone;
    
    // Update formData first and wait for it to complete
    updateFormData({
      name: cleanName,
      phone: cleanedPhone,
      email: contactInfo.email || '',
      nameWasAutofilled: false,
      leadStage: 'ValueBoost B2 Qualified'
    });
    
    // Wait a moment for updateFormData to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Update contact info in CRM first
      const leadId = localStorage.getItem('leadId');
      const existingLeadId = leadId;
      
      if (existingLeadId) {
        try {
          // Use a custom update that preserves autofilled data
          const leadRef = doc(db, 'leads', existingLeadId);
          
          // Split name into first/last
          let firstName = '';
          let lastName = '';
          if (cleanName) {
            const nameParts = cleanName.split(' ');
            if (nameParts.length >= 2) {
              firstName = nameParts[0];
              lastName = nameParts.slice(1).join(' ');
            } else {
              lastName = cleanName;
            }
          }
          
          // Update only the manually entered contact fields, preserve autofilled data
          const contactUpdateData = {
            name: cleanName || '',
            phone: cleanedPhone || '',
            email: contactInfo.email || '',
            firstName: firstName,
            lastName: lastName || 'Contact',
            nameWasAutofilled: false,
            leadStage: 'ValueBoost B2 Contact Info Provided',
            updatedAt: serverTimestamp()
          };
          
          await updateDoc(leadRef, contactUpdateData);
        } catch (contactError) {
          console.error("updateContactInfo FAILED:", contactError);
        }
      }
      
      // Send notifications (non-blocking background execution)
      setTimeout(() => {
        const leadData = {
          name: cleanName,
          phone: cleanedPhone,
          address: formData.street,
          email: contactInfo.email || '',
          leadSource: 'ValueBoost B2 Funnel',
          campaign_name: formData.campaign_name || 'ValueBoost B2',
          utm_source: formData.utm_source || '',
          utm_medium: formData.utm_medium || '',
          utm_campaign: formData.utm_campaign || '',
          id: formData.leadId || localStorage.getItem('leadId') || ''
        };
        
        // Note: Notifications are now handled automatically by the centralized notification system
        // in FormContext via the useNotifications hook
      }, 0);
      
      setIsSubmitting(false);
      setSubmitted(true);
      
      // COMPREHENSIVE TRACKING
      
      // 1. PHONE LEAD TRACKING
      trackPhoneNumberLead();
      
      // 2. FORM STEP COMPLETION TRACKING
      trackFormStepComplete(3, 'ValueBoost B2 Qualified', formData);
      
      // 3. FORM SUBMISSION TRACKING
      trackFormSubmission({
        ...formData,
        funnelType: 'valueboost_b2',
        conversionType: 'b2_qualified'
      });
      
      // 4. FACEBOOK PIXEL TRACKING
      trackPropertyValue({
        address: formData.street,
        currentValue: 0, // No API value for B2
        potentialIncrease: 0, // No API value for B2
        name: cleanName,
        phone: cleanedPhone,
        email: contactInfo.email || '',
        funnel: 'valueboost_b2',
        campaign_name: formData.campaign_name || '',
        utm_source: formData.utm_source || '',
        utm_medium: formData.utm_medium || '',
        utm_campaign: formData.utm_campaign || ''
      });
      
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-123456789/AbC-D_efG-h12345',
          'event_category': 'lead',
          'event_label': 'ValueBoost B2 Qualified',
          'value': 1,
          'currency': 'USD'
        });
      }
      
      // Reset qualifying step to 0 and navigate to step 4 (ValueBoostQualifyingB2) after successful submission
      updateFormData({ qualifyingQuestionStep: 0 });
      nextStep();
    } catch (error) {
      console.error('Error submitting lead:', error);
      setIsSubmitting(false);
      setFormErrors({ submit: 'Failed to submit your information. Please try again.' });
    }
  };

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
                      className={`vb-b2-unlock-input ${formErrors.name ? 'vb-b2-unlock-input-error' : ''}`}
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleInputChange}
                      placeholder="Phone (Get a text copy)"
                      className={`vb-b2-unlock-input ${formErrors.phone ? 'vb-b2-unlock-input-error' : ''}`}
                    />
                  </div>
                  {formErrors.phone && (
                    <div className="vb-b2-unlock-form-error">
                      {formErrors.phone}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="vb-b2-unlock-button vb-b2-button-flare"
                >
                  {isSubmitting ? 'Submitting...' : dynamicContent.buttonText}
                </button>

                <div className="vb-b2-unlock-security-text">
                  {dynamicContent.disclaimer}
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