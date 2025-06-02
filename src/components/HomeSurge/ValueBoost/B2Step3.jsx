import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import { trackPropertyValue } from '../../../services/facebook';
import { trackPhoneNumberLead, trackFormStepComplete, trackFormSubmission } from '../../../services/analytics';
import { doc, updateDoc, serverTimestamp, getFirestore } from 'firebase/firestore';

function B2Step3({ campaign, variant }) {
  const { formData, updateFormData, updateLead, nextStep } = useFormContext();
  const db = getFirestore();
  
  // Auto scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
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
        disclaimer: '<strong> No spam ever. </strong>We respect your privacy and will never share your details with anyone. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list.'
      },
     
      // WIDE B2 - Enhanced comprehensive hassle-free solutions
      sellB2: {
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
        disclaimer: '<strong> No spam ever. </strong>We respect your privacy and will never share your details with anyone. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list.'
      },
 
       // VALUE B2 - Deeper value analysis and insights
      valueB2: {
        // Header content
        readyHeadline: 'Next, where do you want us to text a copy your ValueBoost report?',
        readySubheadline: 'We\'ll send you a detailed <strong><i>maximum home value</strong></i>, report with FREE AI personalized opportunity recommendations! ',
        
          // Unlock form content
        unlockHeadline: 'Get Your FREE ValueBoost Max Value Report',
        timeoutUnlockHeadline: 'HomeSurge ValueBoost Report Benefits:',
        unlockSubtext: 'Unlock your full property value report with all personalized recommendations',
        
         // Checkmark lines
        checkmark1: 'All ValueBoost <strong><i>maximum value</strong></i> opportunities for your property',
        checkmark2: 'Detailed <strong><i>AI powered</strong></i> recommendations that show you expected ROIs',
        checkmark3: '<strong><i>Customized for your unique property,</strong></i> down to the smallest detail',
        
        // CTA section
        buttonText: 'GET VALUE REPORT',
        
        // Disclaimer (at bottom)
        disclaimer: '<strong> No spam ever. </strong>We respect your privacy and will never share your details with anyone. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list.'
      },



      // DEFAULT FALLBACK (MATCHES CASH THEME FROM ORIGINAL)
      default: {
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
        disclaimer: '<strong> No spam ever. </strong>We respect your privacy and will never share your details with anyone. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list.'
     }
    };
    
    // Campaign matching logic for B2 variants
    if (campaignName) {
      const simplified = campaignName.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      // CASH/SELLING CAMPAIGN MATCHING
      if (simplified.includes('cash')) return templates.cashB2;
      if (simplified.includes('sell')) return templates.sellB2;
      
      // VALUE/IMPROVEMENT CAMPAIGN MATCHING
      if (simplified.includes('value')) return templates.valueB2;
      if (simplified.includes('equity')) return templates.valueB2; // Use valueB2 for equity campaigns
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
      // BULLETPROOF CONTACT SUBMISSION - NEVER BLOCKS USER (SAME AS VALUEBOOSTREPORT)
    
    // ALWAYS proceed to next step immediately for user experience
    setIsSubmitting(false);
    setSubmitted(true);
    console.log("🔓 B2Step3 proceeding immediately for user");
    
    // Background contact submission with aggressive retry
    const submitContactInBackground = async () => {
      const maxRetries = 10; // More aggressive retry
      let attempt = 0;
      
      const contactData = {
        name: cleanName || '',
        phone: cleanedPhone || '',
        email: contactInfo.email || '',
        firstName: cleanName ? cleanName.split(' ')[0] : '',
        lastName: cleanName ? (cleanName.split(' ').length >= 2 ? cleanName.split(' ').slice(1).join(' ') : cleanName) : 'Contact',
        nameWasAutofilled: false,
        leadStage: 'ValueBoost B2 Contact Info Provided',
        updatedAt: serverTimestamp()
      };
      
      const trySubmission = async () => {
        try {
          const leadId = localStorage.getItem('leadId');
          if (!leadId) {
            console.error('❌ No leadId found for B2 contact submission');
            return false;
          }
          
          const leadRef = doc(db, 'leads', leadId);
          await updateDoc(leadRef, contactData);
          
          console.log(`✅ B2 Contact submission SUCCESS on attempt ${attempt + 1}`);
          
          // Clear any pending retry
          localStorage.removeItem('pendingB2ContactSubmission');
          return true;
          
        } catch (error) {
          console.error(`❌ B2 Contact submission failed (attempt ${attempt + 1}):`, error);
          
          // Store for retry
          localStorage.setItem('pendingB2ContactSubmission', JSON.stringify({
            ...contactData,
            leadId: localStorage.getItem('leadId'),
            timestamp: Date.now(),
            attempts: attempt + 1
          }));
          
          return false;
        }
      };
      
      // Try submission with exponential backoff
      while (attempt < maxRetries) {
        const success = await trySubmission();
        if (success) break;
        
        attempt++;
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 second delay
        console.log(`🔄 Retrying B2 contact submission in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      if (attempt >= maxRetries) {
        console.error('💥 B2 Contact submission failed after all retries - stored locally');
      }
    };
    
    // Start background submission (non-blocking)
    submitContactInBackground();
    
    // Also trigger notifications in background
    setTimeout(() => {
      console.log('🔔 Triggering B2 notifications for contact submission');
    }, 0);
    
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