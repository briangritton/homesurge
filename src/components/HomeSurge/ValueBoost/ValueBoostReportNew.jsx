/**
 * ValueBoostReport Component (Rewritten)
 * Clean, simplified implementation using service layer
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFormContext } from '../../../contexts/FormContext';

// Import services
import { templateService } from '../../../services/templateEngine';
import { contactFormService } from '../../../services/contactFormService';
import { trackingService } from '../../../services/trackingService';
import { propertyCalculationService } from '../../../services/propertyCalculationService';
import { reportStateService } from '../../../services/reportStateService';

// Assets
import gradientArrow from '../../../assets/images/gradient-arrow.png';

function ValueBoostReport({ campaign, variant }) {
  // ===== FORM CONTEXT =====
  const { formData, updateFormData } = useFormContext();
  
  // ===== STATE (Minimal) =====
  const [reportState, setReportState] = useState('loading'); // loading, ready, unlocked, timeout
  const [contactInfo, setContactInfo] = useState({
    name: '', 
    phone: '', 
    email: formData.email || ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  // ===== REFS =====
  const stateTimeoutRef = useRef(null);
  
  // ===== DYNAMIC CONTENT =====
  const dynamicContent = templateService.getTemplate(campaign, variant, 'report');
  
  // ===== AUTO SCROLL =====
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ===== AI REPORT MANAGEMENT =====
  useEffect(() => {
    const reportFromContext = formData.aiHomeReport;
    const reportFromStorage = localStorage.getItem('aiHomeReport');
    const availableReport = reportFromContext || reportFromStorage;
    
    if (availableReport && availableReport !== aiReport) {
      console.log('📄 AI report loaded:', availableReport.substring(0, 100) + '...');
      setAiReport(availableReport);
      
      // Sync FormContext if needed
      if (!reportFromContext && reportFromStorage) {
        updateFormData({ aiHomeReport: reportFromStorage });
      }
    }
  }, [formData.aiHomeReport, aiReport, updateFormData]);

  // ===== RECOMMENDATIONS GENERATION =====
  useEffect(() => {
    if (formData.apiEstimatedValue && recommendations.length === 0) {
      const propertyRecommendations = propertyCalculationService.generateRecommendations(formData);
      setRecommendations(propertyRecommendations);
    }
  }, [formData.apiEstimatedValue, recommendations.length, formData]);

  // ===== REPORT STATE MANAGEMENT =====
  useEffect(() => {
    const handleStateTransition = async () => {
      const newState = await reportStateService.processStateTransitions(
        reportState,
        formData,
        {
          hasAiReport: !!aiReport,
          isReturnFromRetry: formData.addressSelectionType === 'AddressRetry-Google'
        }
      );
      
      if (newState !== reportState) {
        setReportState(newState);
      }
    };

    handleStateTransition();
  }, [reportState, formData, aiReport]);

  // ===== STATE TIMEOUT HANDLING =====
  useEffect(() => {
    if (reportState === 'loading') {
      stateTimeoutRef.current = setTimeout(() => {
        if (!formData.apiEstimatedValue && !aiReport) {
          setReportState('timeout');
        } else {
          setReportState('ready');
        }
      }, 15000); // 15 second timeout
    }

    return () => {
      if (stateTimeoutRef.current) {
        clearTimeout(stateTimeoutRef.current);
        stateTimeoutRef.current = null;
      }
    };
  }, [reportState, formData.apiEstimatedValue, aiReport]);

  // ===== FORM HANDLERS =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Real-time phone formatting
    if (name === 'phone') {
      console.log('🔍 ValueBoostReport phone formatting:', { original: value, name });
      processedValue = contactFormService.formatPhoneAsTyping(value);
      console.log('🔍 ValueBoostReport formatted result:', processedValue);
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

  const handleUnlock = async () => {
    const validation = contactFormService.validateForm(contactInfo, {
      requireName: true,
      requirePhone: true,
      requireEmail: false
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🔓 ValueBoostReport: Processing unlock');
      
      // Handle unlock process using service
      await reportStateService.handleUnlock(contactInfo, formData, updateFormData);
      
      // Track unlock event
      trackingService.trackReportUnlock(
        { ...formData, ...contactInfo },
        'ValueBoost Report',
        {
          reportData: {
            hasApiData: !!formData.apiEstimatedValue,
            hasAiReport: !!aiReport,
            campaign,
            variant
          }
        }
      );
      
      // Transition to unlocked state
      setReportState('unlocked');
      setSubmitted(true);
      
      console.log('✅ ValueBoostReport: Report unlocked successfully');
      
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

  // ===== VALUE CALCULATIONS =====
  const { displayValue, increaseValue, increasePercentage } = useMemo(() => {
    return propertyCalculationService.calculateDisplayValues(formData);
  }, [formData.apiEstimatedValue, formData.potentialValueIncrease, formData.valueIncreasePercentage]);

  // ===== AI INTRODUCTION EXTRACTION =====
  const aiIntroduction = useMemo(() => {
    if (!aiReport) return null;
    
    const lines = aiReport.split('\n');
    let introStart = -1;
    let introEnd = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('ValueBoost AI Analysis Report') || line.includes('OfferBoost AI Analysis Report')) {
        introStart = i + 1;
      }
      
      if (introStart > -1 && (line.startsWith('Property:') || line.includes('Current Estimated Value:'))) {
        introEnd = i;
        break;
      }
    }
    
    if (introStart > -1 && introEnd > introStart) {
      const introLines = lines.slice(introStart, introEnd)
        .filter(line => line.trim().length > 0)
        .map(line => line.trim());
      
      return introLines.join(' ');
    }
    
    return null;
  }, [aiReport]);

  // ===== RENDER HELPERS =====
  const renderLoadingState = () => (
    <div className="vb-report-container">
      <div className="vb-report-loading">
        <div className="vb-report-loading-spinner" />
        <div className="vb-report-loading-text">
          {dynamicContent.loadingMessage || 'Processing Your ValueBoost Analysis...'}
        </div>
      </div>
    </div>
  );

  const renderTimeoutState = () => (
    <div className="vb-report-container">
      <div className="vb-report-timeout">
        <div className="vb-report-timeout-headline">
          {dynamicContent.timeoutHeadline || 'Analysis Taking Longer Than Expected'}
        </div>
        <div className="vb-report-timeout-message">
          We're still processing your report. Please check your messages for updates.
        </div>
      </div>
    </div>
  );

  const renderContactForm = () => (
    <div className="vb-report-contact-section">
      <div className="vb-report-unlock-content">
        <div 
          className="vb-report-unlock-headline"
          dangerouslySetInnerHTML={{ __html: dynamicContent.unlockHeadline }}
        />
        
        <div className="vb-report-checkmarks">
          <div 
            className="vb-report-checkmark"
            dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark1 }}
          />
          <div 
            className="vb-report-checkmark"
            dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark2 }}
          />
          <div 
            className="vb-report-checkmark"
            dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark3 }}
          />
        </div>
      </div>

      <div className="vb-report-contact-form">
        {/* Name Field */}
        <div className="vb-report-field-group">
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={contactInfo.name}
            onChange={handleInputChange}
            className={`vb-report-input ${formErrors.name ? 'vb-report-input-error' : ''}`}
            disabled={isSubmitting}
            required
          />
          {formErrors.name && (
            <div className="vb-report-error">{formErrors.name}</div>
          )}
        </div>

        {/* Phone Field */}
        <div className="vb-report-field-group">
          <input
            type="tel"
            name="phone"
            placeholder="Your phone number"
            value={contactInfo.phone}
            onChange={handleInputChange}
            className={`vb-report-input ${formErrors.phone ? 'vb-report-input-error' : ''}`}
            disabled={isSubmitting}
            required
          />
          {formErrors.phone && (
            <div className="vb-report-error">{formErrors.phone}</div>
          )}
        </div>

        {/* Email Field */}
        <div className="vb-report-field-group">
          <input
            type="email"
            name="email"
            placeholder="Your email (optional)"
            value={contactInfo.email}
            onChange={handleInputChange}
            className={`vb-report-input ${formErrors.email ? 'vb-report-input-error' : ''}`}
            disabled={isSubmitting}
          />
          {formErrors.email && (
            <div className="vb-report-error">{formErrors.email}</div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleUnlock}
          className="vb-report-unlock-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : dynamicContent.buttonText || 'GET REPORT'}
        </button>

        {/* Disclaimer */}
        <div 
          className="vb-report-disclaimer"
          dangerouslySetInnerHTML={{ __html: dynamicContent.disclaimer }}
        />
      </div>
    </div>
  );

  const renderValueDisplay = () => (
    <div className="vb-report-value-section">
      <div className="vb-report-value-container">
        <div className="vb-report-potential-headline">
          {dynamicContent.potentialHeadline || 'Your ValueBoost Potential:'}
        </div>
        
        <div className="vb-report-value-display">
          <div className="vb-report-current-value">
            Current Value: {displayValue}
          </div>
          
          <div className="vb-report-boost-container">
            <img 
              src={gradientArrow} 
              alt="value increase" 
              className="vb-report-arrow"
            />
            <div className="vb-report-boost-value">
              +{increaseValue}
            </div>
            <div className="vb-report-boost-percentage">
              (+{increasePercentage}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="vb-report-recommendations">
      <div className="vb-report-recommendations-header">
        <div className="vb-report-recommendations-title">
          {dynamicContent.recommendationsTitle || 'Your Top 10 ValueBoost Recommendations'}
        </div>
        <div className="vb-report-recommendations-subtitle">
          {dynamicContent.recommendationsSubtitle || 'AI-powered strategies to maximize your home value'}
        </div>
      </div>

      <div className="vb-report-recommendations-list">
        {recommendations.slice(0, 10).map((rec, index) => (
          <div key={index} className="vb-report-recommendation-item">
            <div className="vb-report-recommendation-header">
              <span className="vb-report-recommendation-number">{index + 1}</span>
              <span className="vb-report-recommendation-strategy">{rec.strategy}</span>
            </div>
            <div className="vb-report-recommendation-description">
              {rec.description}
            </div>
            <div className="vb-report-recommendation-details">
              <span className="vb-report-recommendation-cost">
                Cost: {rec.costEstimate}
              </span>
              <span className="vb-report-recommendation-roi">
                ROI: {rec.roiEstimate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAiReport = () => {
    if (!aiReport) return null;

    return (
      <div className="vb-report-ai-section">
        <div className="vb-report-ai-header">
          <div className="vb-report-ai-title">AI Analysis Report</div>
        </div>
        
        {aiIntroduction && (
          <div className="vb-report-ai-introduction">
            {aiIntroduction}
          </div>
        )}
        
        <div className="vb-report-ai-content">
          <pre className="vb-report-ai-text">
            {aiReport.replace(/Best Regards,?\s*\[?Your Name\]?/gi, '').trim()}
          </pre>
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====
  if (reportState === 'loading') {
    return renderLoadingState();
  }

  if (reportState === 'timeout') {
    return renderTimeoutState();
  }

  return (
    <div className="vb-report-container">
      {/* Header Section */}
      <div className="vb-report-header">
        <div className="vb-report-headline">
          {submitted ? dynamicContent.reportHeadline : dynamicContent.readyHeadline}
        </div>
        
        {!submitted && (
          <div 
            className="vb-report-subheadline"
            dangerouslySetInnerHTML={{ __html: dynamicContent.readySubheadline }}
          />
        )}
      </div>

      {/* Value Display */}
      {(displayValue && increaseValue) && renderValueDisplay()}

      {/* Contact Form or Success State */}
      {!submitted ? (
        renderContactForm()
      ) : (
        <div className="vb-report-unlocked">
          {/* Property Address */}
          {formData.street && (
            <div className="vb-report-property-address">
              <strong>Property: {formData.street}</strong>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && renderRecommendations()}

          {/* AI Report */}
          {renderAiReport()}

          {/* Success Message */}
          <div className="vb-report-success">
            <div className="vb-report-success-headline">
              Report Unlocked Successfully!
            </div>
            <div className="vb-report-success-message">
              You now have access to your complete ValueBoost analysis above.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValueBoostReport;