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
import spencerImage from '../../../assets/images/spencerpicwhite.jpg';

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
  const [showStickyPopup, setShowStickyPopup] = useState(false);
  
  // ===== REFS - COMMENTED OUT =====
  // const stateTimeoutRef = useRef(null);
  
  // ===== DYNAMIC CONTENT =====
  const dynamicContent = useMemo(() => {
    return templateService.getTemplate(campaign, variant, 'report');
  }, [campaign, variant]);
  
  // ===== AUTO SCROLL TO TOP =====
  useEffect(() => {
    // Immediate scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Also scroll again after a brief delay to ensure content has loaded
    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    
    return () => clearTimeout(scrollTimer);
  }, []);

  // ===== SCROLL TO TOP WHEN REPORT STATE CHANGES =====
  useEffect(() => {
    // Scroll to top when transitioning to unlocked state (when report becomes visible)
    if (submitted || reportState === 'unlocked') {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
    }
  }, [submitted, reportState]);

  // ===== STICKY POPUP FOR VALUE CAMPAIGNS =====
  useEffect(() => {
    // Check if this is a value campaign
    const isValueCampaign = window.location.pathname.includes('/value') || 
                           dynamicContent.reportHeadline?.toLowerCase().includes('valueboost') ||
                           (!window.location.pathname.includes('/cash') && 
                            !window.location.pathname.includes('/sell') && 
                            !window.location.pathname.includes('/fsbo') && 
                            !window.location.pathname.includes('/buy'));
    
    // Show sticky popup for ALL campaigns 1 second after report starts generating
    if (submitted && !showStickyPopup) {
      const timer = setTimeout(() => {
        setShowStickyPopup(true);
      }, 1000); // Show popup 1 second after report generation starts
      
      return () => clearTimeout(timer);
    }
  }, [submitted, dynamicContent.reportHeadline]);

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
      console.log('⏳ ValueBoostReport: No AI report yet, staying in loading state');
      setReportState('loading'); // Stay in loading state to wait for AI generation
      
      // Set up polling to check for AI report updates
      const pollInterval = setInterval(() => {
        const updatedReportFromStorage = localStorage.getItem('aiHomeReport');
        const updatedReportFromContext = formData.aiHomeReport;
        
        if (updatedReportFromStorage || updatedReportFromContext) {
          console.log('✅ ValueBoostReport: AI report now available via polling');
          setAiReport(updatedReportFromStorage || updatedReportFromContext);
          setReportState('ready');
          clearInterval(pollInterval);
        }
      }, 500); // Check every 500ms
      
      // Timeout after 35 seconds (5 seconds longer than AI generation timeout)
      const timeoutId = setTimeout(() => {
        console.log('⏰ ValueBoostReport: AI report polling timed out after 35 seconds');
        setReportState('timeout');
        clearInterval(pollInterval);
      }, 35000);
      
      // Cleanup function
      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
      };
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
      
      // 1. Update FormContext with contact data (synchronous, immediate)
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
      
      // 2. Unlock immediately - don't wait for CRM
      console.log('🚀 ValueBoostReport: Instant unlock - proceeding to show report');
      if (reportState === 'timeout') {
        // If already in timeout state, preserve it to show "texted" message
        console.log('🔒 ValueBoostReport: Keeping timeout state to show texted message');
      } else {
        // For loading or ready states, unlock the report immediately
        setReportState('unlocked');
      }
      
      setSubmitted(true);
      console.log('✅ ValueBoostReport: Report unlocked instantly');
      
      // 3. Immediate tracking (synchronous)
      trackingService.trackPhoneSubmission(
        { ...formData, ...formUpdate },
        'ValueBoostReport',
        {
          leadData: {
            funnelType: 'valueboost_report',
            conversionType: 'report_unlocked',
            campaign_name: formData.campaign_name || '',
            submissionSuccess: 'pending' // CRM submission happening in background
          }
        }
      );
      
      console.log('✅ ValueBoostReport: Instant unlock and tracking completed');
      
      // 4. Fire-and-forget CRM submission with background retries
      setTimeout(() => {
        console.log('🔄 ValueBoostReport: Starting background CRM submission with retries...');
        
        contactFormService.submitWithRetry(
          {
            name: cleanName,
            phone: cleanedPhone,
            email: contactInfo.email || ''
          },
          { ...formData, ...formUpdate },
          {
            component: 'ValueBoostReport',
            leadStage: 'ValueBoost Report Contact Info Provided',
            maxRetries: 5 // Moderate retry for report unlock
          }
        ).then(result => {
          if (result.success) {
            console.log('✅ ValueBoostReport: Background CRM submission successful');
          } else {
            console.error('❌ ValueBoostReport: Background CRM submission failed after all retries:', result.error);
            // Store in localStorage for later retry if needed
            localStorage.setItem('pendingValueBoostReportSubmission', JSON.stringify({
              contactData: { name: cleanName, phone: cleanedPhone, email: contactInfo.email || '' },
              formData: { ...formData, ...formUpdate },
              timestamp: new Date().toISOString(),
              component: 'ValueBoostReport'
            }));
          }
        }).catch(error => {
          console.error('❌ ValueBoostReport: Background CRM submission error:', error);
          // Store for potential later retry
          localStorage.setItem('pendingValueBoostReportSubmission', JSON.stringify({
            contactData: { name: cleanName, phone: cleanedPhone, email: contactInfo.email || '' },
            formData: { ...formData, ...formUpdate },
            timestamp: new Date().toISOString(),
            component: 'ValueBoostReport',
            error: error.message
          }));
        });
      }, 0); // setTimeout with 0ms = next event loop (non-blocking)
      
    } catch (error) {
      console.error('❌ ValueBoostReport: Unlock error:', error);
      
      // Track error but still proceed for UX
      trackingService.trackError(
        `ValueBoostReport unlock error: ${error.message}`,
        'ValueBoostReport',
        formData
      );
      
      // Still unlock for user experience
      setReportState('unlocked');
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
      <h2 
        className="vb-box-headline"
        dangerouslySetInnerHTML={{ __html: dynamicContent.potentialHeadline || 'Your ValueBoost Potential:' }}
      />

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
      <h2 
        className="vb-recommendations-title"
        dangerouslySetInnerHTML={{ __html: dynamicContent.recommendationsTitle || 'Your Top 10 ValueBoost Recommendations' }}
      />
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

  // ===== CAMPAIGN-SPECIFIC CONTACT MESSAGES =====
  const getContactMessage = () => {
    // Determine campaign type from URL path
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes('/buy')) {
      return "Need help putting together your strongest potential offer? I can help! Give me a call or shoot me a text. (480) 519-0554";
    } else if (path.includes('/cash')) {
      return "Want me to help you negotiate the strongest cash offer? I have direct connections with some of the industries largest buyers, let me do the work for you! Give me a call or shoot me a text. (480) 519-0554";
    } else if (path.includes('/fsbo')) {
      return "Need help putting together the documents you need to do this on your own? I can help, no obligation! Give me a call or shoot me a text. (480) 519-0554";
    } else if (path.includes('/sell')) {
      return "Want me to help you sell your home fast and for the maximum value? I've managed millions in listings and I would love to help you out! Give me a call or shoot me a text. (480) 519-0554";
    } else {
      // Default to value campaign
      return "Need help improving your home's value? I can help! I have connections with some of the industries best home improvement companies, and in some cases we might be able to do these upgrades <em>ABSOLUTELY FREE</em>! Give me a call or shoot me a text. (480) 519-0554";
    }
  };

  const renderContactSection = () => (
    <div className="vb-contact-section">
      <div className="vb-contact-message" dangerouslySetInnerHTML={{ __html: getContactMessage() }} />
      <div className="vb-contact-profile">
        <div className="vb-contact-image">
          <img src={spencerImage} alt="Spencer - Real Estate Expert" />
        </div>
        <div className="vb-contact-info">
          <div className="vb-contact-name">Spencer Gritton</div>
           <div className="vb-contact-phone">(480) 519-0554</div>
          <div className="vb-contact-title">Licensed Real Estate Agent</div>
         
          <div className="vb-contact-agency">HomeSmart Realty Partners</div>
        </div>
      </div>
    </div>
  );

  const renderStickyPopup = () => {
    if (!showStickyPopup) return null;
    
    return (
      <div className="vb-sticky-popup-overlay">
        <div className="vb-sticky-popup">
          <div 
            className="vb-sticky-popup-message"
            dangerouslySetInnerHTML={{ __html: dynamicContent.stickyPopupMessage || 'Want to maximize your results? Give me a call or shoot me a text!' }}
          />
          <div className="vb-sticky-popup-profile">
            <div className="vb-sticky-popup-image">
              <img src={spencerImage} alt="Spencer - Real Estate Expert" />
            </div>
            <div className="vb-sticky-popup-info">
              <div className="vb-sticky-popup-name">Spencer Gritton</div>
              <div className="vb-sticky-popup-phone">(480) 519-0554</div>
              <div className="vb-sticky-popup-title">Licensed Real Estate Agent</div>
              
              <div className="vb-sticky-popup-agency">HomeSmart Realty Partners</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===== AI REPORT FORMATTING =====
  const formatAiReportContent = (content) => {
    if (!content) return '';
    
    // Clean up the content
    const cleanContent = content.replace(/Best Regards,?\s*\[?Your Name\]?/gi, '').trim();
    
    // Split content into lines and process each line
    const lines = cleanContent.split('\n');
    let formattedContent = '';
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines completely - don't add anything for empty lines
      if (!trimmedLine) {
        return;
      }
      
      // Check if this is a headline (only major section headers, NOT numbered items)
      const isHeadline = (
        // Section headers like "TOP IMPROVEMENT OPPORTUNITIES:" (all caps with colon)
        /^[A-Z][A-Z\s]+:\s*$/.test(trimmedLine) ||
        // Report title
        /^ValueBoost\s+AI\s+Analysis\s+Report/i.test(trimmedLine) ||
        // Property Analysis header
        /^Property\s+Analysis:/i.test(trimmedLine) ||
        // Other major section headers (all caps with optional colon)
        /^(TOTAL\s+IMPROVEMENT\s+VALUE\s+CALCULATION|MARKET\s+STRATEGY\s+SUMMARY):\s*$/i.test(trimmedLine)
      );
      
      if (isHeadline) {
        formattedContent += `<div class="vb-ai-report-headline">${trimmedLine}</div>\n`;
      } else {
        // Regular text content
        formattedContent += `<div class="vb-ai-report-text">${trimmedLine}</div>\n`;
      }
    });
    
    return formattedContent;
  };

  const renderAiReport = () => {
    console.log('🐛 renderAiReport - reportState:', reportState, 'aiReport:', !!aiReport);
    
    if (reportState === 'timeout') {
      // Check if this is a value campaign for timeout display
      const isValueCampaignTimeout = window.location.pathname.includes('/value') || 
                                   dynamicContent.reportHeadline?.toLowerCase().includes('valueboost') ||
                                   (!window.location.pathname.includes('/cash') && 
                                    !window.location.pathname.includes('/sell') && 
                                    !window.location.pathname.includes('/fsbo') && 
                                    !window.location.pathname.includes('/buy'));
      
      // Debug the values causing the "0" issue
      console.log('🐛 TIMEOUT DEBUG:', {
        isValueCampaignTimeout,
        apiEstimatedValue: formData.apiEstimatedValue,
        apiEstimatedValueType: typeof formData.apiEstimatedValue,
        shouldShowValueSection: isValueCampaignTimeout && formData.apiEstimatedValue && formData.apiEstimatedValue > 0
      });
      
      // Sticky popup should already be showing from initial trigger during loading
      
      return (
        <div className="vb-timeout-container">
          {/* Value Display for Value Campaigns Only */}
          {Boolean(isValueCampaignTimeout && formData.apiEstimatedValue && formData.apiEstimatedValue > 0) && (
            <div className="vb-timeout-value-section">
              <div className="vb-timeout-value-container">
                <div className="vb-timeout-value-item">
                  <div className="vb-timeout-value-label">Estimated home value:</div>
                  <div className="vb-timeout-value-amount">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(formData.apiEstimatedValue)}
                  </div>
                </div>
                <div className="vb-timeout-value-item">
                  <div className="vb-timeout-value-label">ValueBoost home value:</div>
                  <div className="vb-timeout-value-amount">Check text for report</div>
                </div>
              </div>
            </div>
          )}
          
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
      // Determine report type from campaign
      const campaignType = dynamicContent.reportHeadline?.includes('OfferBoost') ? 'OfferBoost' :
                          dynamicContent.reportHeadline?.includes('ValueBoost') ? 'ValueBoost' :
                          dynamicContent.reportHeadline?.includes('SellerBoost') ? 'SellerBoost' : 'AI';
      
      return (
        <div className="vb-ai-report-section">
          <div className="vb-ai-report-container vb-ai-report-loading">
            <div className="vb-ai-report-content">
              <h3>{campaignType} Report Generating...</h3>
              <p>We're creating your personalized {campaignType.toLowerCase()} analysis. This could take up to 30 seconds as we analyze your property's unique characteristics and market conditions.</p>
              <p>Please wait while we generate your customized recommendations...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="vb-ai-report-section">
        <div className="vb-ai-report-container vb-ai-report-ready">
          <div 
            className="vb-ai-report-content"
            dangerouslySetInnerHTML={{ __html: formatAiReportContent(aiReport) }}
          />
          {/* Contact Section at bottom of every report - COMMENTED OUT (using sticky popup instead) */}
          {/* {renderContactSection()} */}
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
          <div 
            className="vb-af1-hero-headline"
            dangerouslySetInnerHTML={{ __html: submitted ? dynamicContent.reportHeadline : dynamicContent.readyHeadline }}
          />
          
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

              {/* Value Headline for Value Campaign Only */}
              {(() => {
                // Check if this is a value campaign by looking at the URL or campaign context
                const isValueCampaign = window.location.pathname.includes('/value') || 
                                       dynamicContent.reportHeadline?.toLowerCase().includes('valueboost') ||
                                       (!window.location.pathname.includes('/cash') && 
                                        !window.location.pathname.includes('/sell') && 
                                        !window.location.pathname.includes('/fsbo') && 
                                        !window.location.pathname.includes('/buy'));
                
                if (isValueCampaign && formData.apiEstimatedValue && formData.apiEstimatedValue > 0) {
                  const currentValue = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(formData.apiEstimatedValue);
                  
                  // Extract potential value increase from AI report if available
                  let potentialValue = "Pending..";
                  if (aiReport) {
                    // Look for "Total Potential Value Increase: $XX,XXX" pattern
                    const valueIncreaseMatch = aiReport.match(/Total Potential Value Increase:\s*\$([0-9,]+)/i);
                    if (valueIncreaseMatch) {
                      const increaseAmount = parseInt(valueIncreaseMatch[1].replace(/,/g, ''));
                      const currentValueNumber = parseInt(formData.apiEstimatedValue);
                      const totalPotentialValue = currentValueNumber + increaseAmount;
                      potentialValue = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(totalPotentialValue);
                    }
                  }
                  
                  return (
                    <div className="vb-report-value-boost-box">
                      <div className="vb-report-value-container">
                        {/* Current Value */}
                        <div className="vb-report-value-item">
                          <div className="vb-report-value-amount vb-report-current-value">
                            {currentValue}
                          </div>
                          <div className="vb-report-value-label">
                            Your Current Value
                          </div>
                        </div>

                        {/* Arrow - responsive */}
                        <div className="vb-report-value-arrow">
                          <img 
                            src={gradientArrow} 
                            alt="value increase arrow" 
                            className="vb-report-arrow-horizontal"
                          />
                          <img 
                            src={gradientArrow} 
                            alt="value increase arrow" 
                            className="vb-report-arrow-vertical"
                          />
                        </div>

                        {/* ValueBoost Potential */}
                        <div className="vb-report-value-item">
                          <div className="vb-report-value-amount vb-report-boost-value">
                            {potentialValue}
                          </div>
                          <div className="vb-report-value-label">
                            ValueBoost Estimate
                          </div>
                        </div>
                      </div>
                      
                      <div className="vb-report-value-disclaimer">
                        <em>Values are estimates only, this is not an appraisal.</em>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* AI Report */}
              {renderAiReport()}
            </div>
          )}
        </div>
      </div>
      
      {/* Sticky Popup for Value Campaigns */}
      {renderStickyPopup()}
    </div>
  );
}

export default ValueBoostReport;