/**
 * ValueBoostReport Component (Rewritten)
 * Clean, simplified implementation using service layer
 */

import { useState, useEffect, useMemo } from 'react';
import { useFormContext } from '../../../contexts/FormContext';

// Import services
import { templateService } from '../../../services/templateEngine';
import { contactFormService } from '../../../services/contactFormService';
import { trackingService } from '../../../services/trackingService';
// import { propertyCalculationService } from '../../../services/propertyCalculationService';
// import { reportStateService } from '../../../services/reportStateService';

// Assets
import gradientArrow from '../../../assets/images/gradient-arrow.png';

function ValueBoostReport({ campaign, variant }) {
  // ===== FORM CONTEXT =====
  const { formData, updateFormData } = useFormContext();
  
  // ===== STATE =====
  const [reportState, setReportState] = useState('loading'); // loading, ready, unlocked, timeout
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  
  // ===== REFS - COMMENTED OUT =====
  // const stateTimeoutRef = useRef(null);
  
  // ===== DYNAMIC CONTENT =====
  const dynamicContent = useMemo(() => {
    return templateService.getTemplate(campaign, variant, 'report');
  }, [campaign, variant]);
  
  // ===== AUTO SCROLL =====
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ===== CSS OVERRIDE =====
  useEffect(() => {
    // Create a style element to override ::before pseudo-elements
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .valueboost-content.hero-content::before {
        content: none !important;
        display: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // ===== AI REPORT LOADING =====
  useEffect(() => {
    // Check if we already have a report (generated in AddressForm)
    const reportFromContext = formData.aiHomeReport;
    const reportFromStorage = localStorage.getItem('aiHomeReport');
    
    if (reportFromContext || reportFromStorage) {
      console.log('📋 ValueBoostReport: AI report already available');
      setAiReport(reportFromContext || reportFromStorage);
      setReportState('ready');
    } else {
      console.log('⚠️ ValueBoostReport: No AI report available, showing fallback message');
      setReportState('timeout'); // Show "texted" message as fallback
    }
  }, [formData.aiHomeReport]);
  //   const availableReport = reportFromContext || reportFromStorage;
  //   
  //   if (availableReport && availableReport !== aiReport) {
  //     console.log('📄 AI report loaded:', availableReport.substring(0, 100) + '...');
  //     setAiReport(availableReport);
  //     
  //     // Sync FormContext if needed
  //     if (!reportFromContext && reportFromStorage) {
  //       updateFormData({ aiHomeReport: reportFromStorage });
  //     }
  //   }
  // }, [formData.aiHomeReport, aiReport, updateFormData]);

  // ===== RECOMMENDATIONS GENERATION - COMMENTED OUT =====
  // useEffect(() => {
  //   if (formData.apiEstimatedValue && recommendations.length === 0) {
  //     const propertyRecommendations = propertyCalculationService.generateRecommendations(formData);
  //     setRecommendations(propertyRecommendations);
  //   }
  // }, [formData.apiEstimatedValue, recommendations.length, formData]);

  // ===== REPORT STATE MANAGEMENT - COMMENTED OUT =====
  // useEffect(() => {
  //   const handleStateTransition = async () => {
  //     const newState = await reportStateService.processStateTransitions(
  //       reportState,
  //       formData,
  //       {
  //         hasAiReport: !!aiReport,
  //         isReturnFromRetry: formData.addressSelectionType === 'AddressRetry-Google'
  //       }
  //     );
  //     
  //     if (newState !== reportState) {
  //       setReportState(newState);
  //     }
  //   };

  //   handleStateTransition();
  // }, [reportState, formData, aiReport]);

  // ===== STATE TIMEOUT HANDLING - COMMENTED OUT =====
  // useEffect(() => {
  //   if (reportState === 'loading') {
  //     stateTimeoutRef.current = setTimeout(() => {
  //       if (!formData.apiEstimatedValue && !aiReport) {
  //         setReportState('timeout');
  //       } else {
  //         setReportState('ready');
  //       }
  //     }, 15000); // 15 second timeout
  //   }

  //   return () => {
  //     if (stateTimeoutRef.current) {
  //       clearTimeout(stateTimeoutRef.current);
  //       stateTimeoutRef.current = null;
  //     }
  //   };
  // }, [reportState, formData.apiEstimatedValue, aiReport]);

  // ===== FORM HANDLERS (IDENTICAL TO B2STEP3) =====
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
      requireName: false, // Name is optional in ValueBoost report (like B2)
      requireAddress: false
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  const handleUnlock = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🔓 ValueBoostReport: Processing contact submission');
      
      // 1. Update FormContext with contact data (same as B2Step3)
      const cleanName = contactInfo.name ? contactInfo.name.trim() : '';
      const phoneValidation = contactFormService.validatePhone(contactInfo.phone);
      const cleanedPhone = phoneValidation.isValid ? phoneValidation.cleanPhone : contactInfo.phone;
      
      const formUpdate = {
        name: cleanName,
        phone: cleanedPhone,
        email: contactInfo.email || '',
        nameWasAutofilled: false,
        leadStage: 'ValueBoost Report Unlocked'
      };
      
      updateFormData(formUpdate);
      
      // Small delay to ensure FormContext updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 2. Submit to CRM with retry logic and 5-second timeout protection (same as B2Step3)
      console.log('🕐 ValueBoostReport: Starting CRM save with 5-second timeout...');
      
      const crmSavePromise = contactFormService.submitWithRetry(
        {
          name: cleanName,
          phone: cleanedPhone,
          email: contactInfo.email || ''
        },
        { ...formData, ...formUpdate },
        {
          component: 'ValueBoostReport',
          leadStage: 'ValueBoost Report Contact Info Provided',
          maxRetries: 3 // Less aggressive than B2
        }
      );
      
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('⏰ ValueBoostReport: CRM save timeout reached (5 seconds) - proceeding with unlock');
          resolve({ success: false, timeout: true, message: 'CRM save timed out' });
        }, 5000);
      });
      
      // Wait for either CRM save to complete OR timeout (whichever comes first)
      const submissionResult = await Promise.race([crmSavePromise, timeoutPromise]);
      
      if (submissionResult.timeout) {
        console.log('⏰ ValueBoostReport: Unlock proceeding due to timeout');
      } else if (submissionResult.success) {
        console.log('✅ ValueBoostReport: CRM save completed successfully before timeout');
      } else {
        console.log('❌ ValueBoostReport: CRM save failed before timeout');
      }
      
      // 3. Check if AI report is ready, if not wait up to 10 seconds
      if (reportState === 'loading') {
        console.log('⏳ ValueBoostReport: AI report still loading, waiting up to 10 seconds...');
        
        const aiReportTimeout = new Promise((resolve) => {
          setTimeout(() => {
            console.log('⏰ ValueBoostReport: AI report timeout reached (10 seconds)');
            resolve(false);
          }, 10000);
        });
        
        const aiReportReady = new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (reportState !== 'loading') {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 200);
        });
        
        const reportWaitResult = await Promise.race([aiReportReady, aiReportTimeout]);
        
        if (!reportWaitResult) {
          console.log('⏰ ValueBoostReport: Proceeding with unlock - AI report timed out');
          setReportState('timeout');
        } else {
          console.log('✅ ValueBoostReport: AI report ready, proceeding with unlock');
          setReportState('unlocked');
        }
      } else {
        // AI report already ready or failed - preserve timeout state
        if (reportState !== 'timeout') {
          setReportState('unlocked');
        }
        // If reportState is 'timeout', leave it as 'timeout' to show "texted" message
      }
      
      setSubmitted(true);
      console.log('✅ ValueBoostReport: Report unlocked successfully');
      
      // 4. Comprehensive tracking (similar to B2Step3)
      trackingService.trackPhoneSubmission(
        { ...formData, ...formUpdate },
        'ValueBoostReport',
        {
          leadData: {
            funnelType: 'valueboost_report',
            conversionType: 'report_unlocked',
            campaign_name: formData.campaign_name || '',
            submissionSuccess: submissionResult.success
          }
        }
      );
      
    } catch (error) {
      console.error('❌ ValueBoostReport: Unlock error:', error);
      
      // Track error but still proceed for UX
      trackingService.trackError(
        `ValueBoostReport unlock error: ${error.message}`,
        'ValueBoostReport',
        formData
      );
      
      // Still unlock for user experience
      // setReportState('unlocked'); // COMMENTED OUT
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== VALUE CALCULATIONS - COMMENTED OUT =====
  // const { displayValue, increaseValue, increasePercentage } = useMemo(() => {
  //   return propertyCalculationService.calculateDisplayValues(formData);
  // }, [formData]);
  
  // Temporary hardcoded values for testing
  const displayValue = '$554,000';
  const increaseValue = '$121,880';
  const increasePercentage = '22%';

  // ===== CONTENT STYLE =====
  const contentStyle = {
    position: 'relative'
  };

  // ===== AI INTRODUCTION EXTRACTION (REMOVED - UNUSED) =====
  // Removed aiIntroduction to fix infinite loop

  // ===== RENDER HELPERS - COMMENTED OUT =====
  /*
  const renderLoadingState = () => (
    <div className="vb-report-section">
      <div className="vb-report-container">
        <div className="vb-content vb-fade-in" style={contentStyle}>
          <div className="vb-loading-container">
            <div className="vb-af1-hero-headline">
              {dynamicContent.loadingMessage || 'Processing Your ValueBoost Analysis...'}
            </div>
            
            <div className="vb-loading-dots">
              <span className="vb-dot"></span>
              <span className="vb-dot"></span>
              <span className="vb-dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimeoutState = () => (
    <div className="vb-report-section">
      <div className="vb-report-container">
        <div className="vb-content vb-fade-in" style={contentStyle}>
          <div className="vb-timeout-container">
            <div className="vb-timeout-headline">
              {dynamicContent.timeoutHeadline || 'Analysis Taking Longer Than Expected'}
            </div>
            <div className="vb-timeout-message">
              We're still processing your report. Please check your messages for updates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  */

  const renderContactForm = () => (
    <div className="vb-locked-overlay">
      {/* Opaque background wrapper for the unlock section */}
      <div className="vb-unlock-section-wrapper">
        <div className="vb-unlock-header">
          <div className="vb-lock-icon-container">
            <div className="vb-lock-icon">
              🔒
            </div>
          </div>
          <h3 className="vb-unlock-headline" dangerouslySetInnerHTML={{ __html: dynamicContent.unlockHeadline }}>
          </h3>
        </div>
        <div className="vb-features-bubble">
          <div className="vb-feature-item">
            <div className="vb-feature-icon">✓</div>
            <p className="vb-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark1 }}>
            </p>
          </div>
          <div className="vb-feature-item">
            <div className="vb-feature-icon">✓</div>
            <p className="vb-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark2 }}>
            </p>
          </div>
          <div className="vb-feature-item">
            <div className="vb-feature-icon">✓</div>
            <p className="vb-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark3 }}>
            </p>
          </div>
        </div>

        {/* Inline form fields */}
        <div className="vb-unlock-form-container">
          <div className="vb-optin-form-fields">
            {/* Name field - starts empty, no autofill */}
            <input
              type="text"
              name="name"
              value={contactInfo.name}
              onChange={handleInputChange}
              placeholder="Name"
              autoComplete="name"
              className={`vb-unlock-input ${formErrors.name ? 'vb-unlock-input-error' : ''}`}
              disabled={isSubmitting}
            />
            <input
              type="tel"
              name="phone"
              value={contactInfo.phone}
              onChange={handleInputChange}
              autoComplete="tel"
              placeholder="Phone (Get a text copy)"
              className={`vb-unlock-input ${formErrors.phone ? 'vb-unlock-input-error' : ''}`}
              disabled={isSubmitting}
              required
            />
          </div>
          {formErrors.phone && (
            <div className="vb-unlock-form-error">
              {formErrors.phone}
            </div>
          )}
          {formErrors.name && (
            <div className="vb-unlock-form-error">
              {formErrors.name}
            </div>
          )}
        </div>

        <button
          onClick={handleUnlock}
          disabled={isSubmitting}
          className="vb-unlock-button vb-button-flare"
        >
          {isSubmitting ? 'Processing...' : dynamicContent.buttonText}
        </button>

        <div className="vb-unlock-security-text" dangerouslySetInnerHTML={{ __html: dynamicContent.disclaimer }}>
        </div>
      </div>
    </div>
  );

  const renderValueDisplay = () => (
    <div className="vb-value-boost-box">
      <h2 className="vb-box-headline">
        {dynamicContent.potentialHeadline || 'Your ValueBoost Potential:'}
      </h2>

      {/* Responsive container for values */}
      <div className="vb-value-container">
        {/* Current Value */}
        <div className="vb-value-item">
          <div className="vb-value-amount vb-current-value">
            {displayValue}
          </div>
          <div className="vb-value-label">
            Current Value
          </div>
        </div>

        {/* Arrow - responsive */}
        <div className="vb-value-arrow">
          <img 
            src={gradientArrow} 
            alt="value increase arrow" 
            className="vb-arrow-horizontal"
          />
          <img 
            src={gradientArrow} 
            alt="value increase arrow" 
            className="vb-arrow-vertical"
          />
        </div>

        {/* Value Boost Potential - separate from new total */}
        <div className="vb-value-item">
          <div className="vb-value-amount vb-boost-value">
            +{increaseValue}
          </div>
          <div className="vb-value-label">
            Value Boost Potential
          </div>
        </div>
      </div>

      {/* New Total Value - shown below */}
      <div className="vb-new-total">
        <div className="vb-new-total-label">Potential New Total Value:</div>
        <div className="vb-new-total-amount">
          {/* Calculate new total: current + increase */}
          {displayValue && increaseValue ? 
            `$${(parseInt(displayValue.replace(/[$,]/g, '')) + parseInt(increaseValue.replace(/[$,]/g, ''))).toLocaleString()}` 
            : 'Calculating...'
          }
        </div>
        <div className="vb-percentage-text">
          ({increasePercentage}% increase)
        </div>
      </div>
    </div>
  );

  /*
  const renderRecommendations = () => (
    <div className="vb-recommendations-section">
      <h2 className="vb-recommendations-title">
        {dynamicContent.recommendationsTitle || 'Your Top 10 ValueBoost Recommendations'}
      </h2>
      <p className="vb-recommendations-subtitle">
        {dynamicContent.recommendationsSubtitle || 'AI-powered strategies to maximize your home value'}
      </p>

      <div className="vb-recommendations-container">
        {recommendations.slice(0, 10).map((rec, index) => (
          <div key={index} className="vb-recommendation-item">
            <div className="vb-recommendation-content">
              <h3 className="vb-recommendation-title">
                <span className="vb-recommendation-number">
                  {index + 1}.
                </span>
                {rec.strategy}
              </h3>
              <p className="vb-recommendation-description">{rec.description}</p>
              <div className="vb-recommendation-details">
                <span className="vb-recommendation-cost">
                  Cost: {rec.costEstimate}
                </span>
                <span className="vb-recommendation-roi">
                  ROI: {rec.roiEstimate}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  */

  const renderAiReport = () => {
    console.log('🐛 renderAiReport - reportState:', reportState, 'aiReport:', !!aiReport);
    
    if (reportState === 'timeout') {
      return (
        <div className="vb-timeout-container">
          <div className="vb-timeout-icon">
            📱
          </div>
          <div className="vb-timeout-headline">
            {dynamicContent.timeoutHeadline || 'Watch your messages, we\'ll be sending a text with your cash offer shortly!'}
          </div>
          <div className="vb-timeout-message">
            AI report generated! You'll receive a text at the number you provided with the full report. We look forward to helping you however we can!
          </div>
        </div>
      );
    }

    if (!aiReport) {
      return (
        <div className="vb-ai-report-section">
          <div className="vb-ai-report-container vb-ai-report-loading">
            <div className="vb-ai-report-content">
              <h3>Preparing Your Property Analysis...</h3>
              <p>We're analyzing your property data to provide customized improvement recommendations.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="vb-ai-report-section">
        <div className="vb-ai-report-container vb-ai-report-ready">
          <div className="vb-ai-report-content">
            {aiReport.replace(/Best Regards,?\s*\[?Your Name\]?/gi, '').trim()}
          </div>
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====
  // Commented out state-based rendering for now
  // if (reportState === 'loading') {
  //   return renderLoadingState();
  // }

  // if (reportState === 'timeout') {
  //   return renderTimeoutState();
  // }

  return (
    <div className="vb-report-section">
      <div className="vb-report-container">
        {/* Header Section - Always Visible */}
        <div className="vb-ready-container">
          <div className="vb-af1-hero-headline">
            {submitted ? dynamicContent.reportHeadline : dynamicContent.readyHeadline}
          </div>
          
          {!submitted && (
            <div 
              className="vb-af1-hero-subheadline"
              dangerouslySetInnerHTML={{ __html: dynamicContent.readySubheadline }}
            />
          )}
        </div>

        <div className="vb-content vb-fade-in" style={contentStyle}>

          {/* Value Display - DISABLED */}
          {/* {(displayValue && increaseValue) && renderValueDisplay()} */}

          {/* Contact Form or Success State */}
          {!submitted ? (
            renderContactForm()
          ) : (
            <div>
              {/* Property Address */}
              {formData.street && (
                <div className="vb-detail-label">
                  <strong>Property: {formData.street}</strong>
                </div>
              )}

              {/* AI Report */}
              {renderAiReport()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ValueBoostReport;