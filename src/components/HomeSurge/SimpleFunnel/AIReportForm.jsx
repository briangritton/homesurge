import React, { useRef, useState, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import { validateName, validatePhone, validateAddress } from '../../../utils/validation.js';
import { trackPhoneNumberLead, trackFormStepComplete, trackFormError } from '../../../services/analytics';
import { updateContactInfo } from '../../../services/firebase.js';
import { formatCurrency } from '../../../utils/validation';

function AIReportForm() {
  const { formData, updateFormData, nextStep, submitLead } = useFormContext();
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(true);
  
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  
  // Calculate value boost information
  const currentValue = formData.apiEstimatedValue || 250000;
  const potentialIncrease = formData.potentialValueIncrease || Math.round(currentValue * 0.15);
  const formattedCurrentValue = formatCurrency(currentValue);
  const formattedPotentialIncrease = formatCurrency(potentialIncrease);
  const upgradesNeeded = formData.upgradesNeeded || 5;
  const formattedNewValue = formatCurrency(currentValue + potentialIncrease);
  const roiPercentage = Math.round((potentialIncrease / currentValue) * 100);
  
  // Sample improvement strategies
  const improvementStrategies = [
    {
      title: "Paint Interior with Neutral Colors",
      costEstimate: 1200,
      roiRange: "200-300%",
      description: "Freshening up with modern neutral colors can dramatically improve buyer appeal with minimal investment."
    },
    {
      title: "Refresh Landscaping & Curb Appeal",
      costEstimate: 800,
      roiRange: "150-200%",
      description: "First impressions matter. Simple landscaping improvements can dramatically increase buyer interest."
    },
    {
      title: "Deep Clean & Declutter Entire Home",
      costEstimate: 500,
      roiRange: "400-500%",
      description: "Professional deep cleaning makes your home appear larger and more maintained."
    }
  ];
  
  // Scroll to top when component mounts and track page view
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track form step for analytics
    trackFormStepComplete(2, 'AI Report Form Loaded');
  }, []);
  
  // Handle name and phone validation
  const validateInput = () => {
    let valid = true;
    
    // Validate name
    if (!validateName(formData.name)) {
      setNameError('Please enter a valid name');
      valid = false;
      nameRef.current.focus();
      return valid;
    } else {
      setNameError('');
    }
    
    // Validate phone
    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid phone number');
      valid = false;
      phoneRef.current.focus();
      return valid;
    } else {
      setPhoneError('');
    }
    
    return valid;
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error message when user starts typing
    if (name === 'name' && nameError) {
      setNameError('');
    } else if (name === 'phone' && phoneError) {
      setPhoneError('');
    }
    
    updateFormData({ [name]: value });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input first
    if (!validateInput()) {
      return;
    }
    
    // Set submitting state to show loading indicator
    setIsSubmitting(true);
    
    try {
      // Track form completion in analytics
      trackFormStepComplete(2, 'AI Report Form Completed', formData);
      trackPhoneNumberLead(formData.phone);
      
      // Update lead in Zoho with contact information
      updateContactInfo(formData.leadId, formData.name, formData.phone, formData.email);
      
      // Submit all lead data to Zoho
      const submitted = await submitLead();
      
      if (submitted) {
        // Update form data to indicate AI report has been viewed
        updateFormData({
          leadStage: 'AI Report Viewed',
          funnel: 'homesurge_simple'
        });
        
        // Proceed to next step after successful submission
        setIsSubmitting(false);
        nextStep();
      } else {
        console.error('Failed to submit lead');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };
  
  // Toggle between form and report preview
  const toggleView = () => {
    setShowReportPreview(!showReportPreview);
  };
  
  return (
    <div className="ai-report-container">
      <div className="personal-info-form">
        <div className="form-content-container">
          <div className="personal-info-header">
            <h1 className="personal-info-headline">Your AI Home Value Boost Report is Ready!</h1>
            <p className="personal-info-subheadline">
              We've analyzed the property at {formData.street} and identified several high-ROI improvement opportunities.
            </p>
          </div>
          
          <div className="report-preview-container">
            {showReportPreview ? (
              <div className="ai-report-preview">
                <div className="value-summary">
                  <div className="value-item">
                    <div className="value-label">Current Value</div>
                    <div className="value-amount">{formattedCurrentValue}</div>
                  </div>
                  <div className="value-item highlight">
                    <div className="value-label">Potential Increase</div>
                    <div className="value-amount">{formattedPotentialIncrease}</div>
                  </div>
                  <div className="value-item">
                    <div className="value-label">Improvements Needed</div>
                    <div className="value-amount">{upgradesNeeded}</div>
                  </div>
                </div>
                
                <div className="strategy-preview">
                  <h3>Top Recommended Improvements</h3>
                  <div className="strategy-list">
                    {improvementStrategies.map((strategy, index) => (
                      <div key={index} className="strategy-item">
                        <h4>{strategy.title}</h4>
                        <div className="strategy-metrics">
                          <span className="cost">Est. Cost: ${strategy.costEstimate}</span>
                          <span className="roi">ROI: {strategy.roiRange}</span>
                        </div>
                        <p className="strategy-description">{strategy.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="preview-message">
                    <p>Enter your contact information to see the full report with all recommendations and detailed ROI analysis.</p>
                  </div>
                  <button className="switch-to-form-button" onClick={toggleView}>
                    Enter Contact Info
                  </button>
                </div>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    ref={nameRef}
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className={nameError ? 'error' : ''}
                  />
                  {nameError && <div className="error-message">{nameError}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    ref={phoneRef}
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className={phoneError ? 'error' : ''}
                  />
                  {phoneError && <div className="error-message">{phoneError}</div>}
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'GET MY FULL REPORT'}
                  </button>
                  
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={toggleView}
                  >
                    Back to Preview
                  </button>
                </div>
                
                <div className="privacy-note">
                  <p>
                    By submitting, you agree to receive text messages and calls about your home value boost plan.
                    Standard rates may apply. You can opt out at any time.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        .ai-report-container {
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .personal-info-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .personal-info-headline {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #1a365d;
        }
        
        .personal-info-subheadline {
          font-size: 18px;
          color: #4a5568;
        }
        
        .value-summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .value-item {
          flex: 1;
          min-width: 200px;
          padding: 20px;
          background-color: #f7fafc;
          border-radius: 8px;
          margin: 10px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .value-item.highlight {
          background-color: #ebf8ff;
          border: 2px solid #3182ce;
        }
        
        .value-label {
          font-size: 16px;
          color: #4a5568;
          margin-bottom: 8px;
        }
        
        .value-amount {
          font-size: 28px;
          font-weight: 700;
          color: #2c5282;
        }
        
        .strategy-preview {
          background-color: #fff;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .strategy-preview h3 {
          font-size: 22px;
          margin-bottom: 20px;
          color: #2d3748;
          text-align: center;
        }
        
        .strategy-list {
          margin-bottom: 30px;
        }
        
        .strategy-item {
          padding: 15px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .strategy-item h4 {
          font-size: 18px;
          margin-bottom: 8px;
          color: #2c5282;
        }
        
        .strategy-metrics {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .strategy-metrics .cost {
          color: #e53e3e;
        }
        
        .strategy-metrics .roi {
          color: #38a169;
          font-weight: 600;
        }
        
        .strategy-description {
          font-size: 14px;
          line-height: 1.6;
          color: #4a5568;
        }
        
        .preview-message {
          text-align: center;
          margin: 20px 0;
          padding: 15px;
          background-color: #ebf8ff;
          border-radius: 8px;
        }
        
        .switch-to-form-button {
          width: 100%;
          padding: 12px;
          background-color: #2b6cb0;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .switch-to-form-button:hover {
          background-color: #2c5282;
        }
        
        .contact-form {
          background-color: #fff;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #2d3748;
        }
        
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .form-group input.error {
          border-color: #e53e3e;
        }
        
        .form-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .primary-button,
        .secondary-button {
          padding: 12px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
          text-align: center;
        }
        
        .primary-button {
          background-color: #2b6cb0;
          color: white;
          border: none;
        }
        
        .primary-button:hover {
          background-color: #2c5282;
        }
        
        .secondary-button {
          background-color: #edf2f7;
          color: #2d3748;
          border: 1px solid #e2e8f0;
        }
        
        .secondary-button:hover {
          background-color: #e2e8f0;
        }
        
        .privacy-note {
          font-size: 12px;
          color: #718096;
          text-align: center;
          line-height: 1.5;
        }
        
        .error-message {
          color: #e53e3e;
          font-size: 14px;
          margin-top: 5px;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .value-summary {
            flex-direction: column;
          }
          
          .value-item {
            margin-bottom: 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default AIReportForm;