import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { useSplitTest } from '../../contexts/SplitTestContext';
import { trackFormStepComplete, trackFormError } from '../../services/analytics';
import { trackZohoConversion } from '../../services/zoho';
import { trackPersonalInfoFormConversion } from '../SplitTest/PersonalInfoFormTest';

function QualifyingForm() {
  const { formData, updateFormData, nextStep, updateLead, leadId } = useFormContext();
  const { userGroups, trackConversion } = useSplitTest();
  const [qualifyingStep, setQualifyingStep] = useState(formData.qualifyingQuestionStep || 1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOptionLR, setSelectedOptionLR] = useState('left');
  const [saveAttempted, setSaveAttempted] = useState(false);
  
  // Refs for toggle buttonss
  const toggleLeftRef = useRef(null);
  const toggleRightRef = useRef(null);
  
  // Refs for sliders
  const mortgageSliderRef = useRef(null);
  const squareFootageSliderRef = useRef(null);
  const basementSquareFootageSliderRef = useRef(null);
  
  // Local state for slider values
  const [remainingMortgage, setRemainingMortgage] = useState(formData.remainingMortgage || 100000);
  const [finishedSquareFootage, setFinishedSquareFootage] = useState(formData.finishedSquareFootage || 1000);
  const [basementSquareFootage, setBasementSquareFootage] = useState(formData.basementSquareFootage || 0);
  
  // Component initialization
  useEffect(() => {
    // Check if we're using a temp ID and show a message
    if (leadId && leadId.startsWith('temp_') && !saveAttempted) {
      console.warn("Using temporary lead ID - tracking may be limited");
    }
    
    // Track form step for analytics
    trackFormStepComplete(3, 'Qualifying Form Loaded', formData);
    
    // Record window scroll position
    const scrollPosition = window.scrollY;
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Track a conversion for the PersonalInfoForm test
    // This indicates the user successfully completed the personal info form step
    const personalInfoFormVariant = userGroups['personal_info_form_test'];
    if (personalInfoFormVariant) {
      trackPersonalInfoFormConversion(trackConversion, personalInfoFormVariant);
      
      // Also track in dataLayer for Google Analytics
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'split_test_conversion',
          testId: 'personal_info_form_test',
          variant: personalInfoFormVariant,
          conversionType: 'form_step_completion'
        });
      }
    }
    
    // Cleanup function to restore scroll position
    return () => {
      window.scrollTo(0, scrollPosition);
    };
  }, []);
  
  // Send qualifying answers to Zoho when step changes
  useEffect(() => {
    if (qualifyingStep > 1) {
      // Update Zoho with current qualifying data
      updateFormData({
        qualifyingQuestionStep: qualifyingStep,
        remainingMortgage,
        finishedSquareFootage,
        basementSquareFootage
      });
      
      // Only send updates to Zoho when we have a valid lead ID
      if (leadId && !leadId.startsWith('temp_')) {
        updateLead()
          .then(success => {
            if (success) {
              console.log('Successfully updated lead with qualifying data');
            } else {
              console.warn('Failed to update lead with qualifying data');
            }
          })
          .catch(error => {
            console.error('Error updating lead with qualifying data:', error);
          });
      }
    }
  }, [qualifyingStep]);
  
  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format square footage for display
  const formatSquareFootage = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + ' sq ft';
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Update form data with qualifying info
    updateFormData({
      qualifyingQuestionStep: 4, // Mark as completed
      remainingMortgage,
      finishedSquareFootage,
      basementSquareFootage
    });
    
    // Track form completion
    trackFormStepComplete(3, 'Qualifying Form Completed', formData);
    
    try {
      // Final update to Zoho with all data
      const success = await updateLead();
      if (success) {
        // Track conversion in Zoho
        if (leadId && !leadId.startsWith('temp_')) {
          trackZohoConversion(leadId)
            .then(() => {
              console.log('Tracked Zoho conversion successfully');
            })
            .catch(error => {
              console.error('Failed to track Zoho conversion:', error);
            });
        }
        
        // Track high-value conversion for the PersonalInfoForm test
        const personalInfoFormVariant = userGroups['personal_info_form_test'];
        if (personalInfoFormVariant) {
          // Higher value (2) since this is a qualified completion
          trackPersonalInfoFormConversion(trackConversion, personalInfoFormVariant, 2);
          
          // Also track in dataLayer for Google Analytics
          if (window.dataLayer) {
            window.dataLayer.push({
              event: 'split_test_high_value_conversion',
              testId: 'personal_info_form_test',
              variant: personalInfoFormVariant,
              conversionType: 'qualifying_completion'
            });
          }
        }
        
        // Proceed to thank you page
        nextStep();
      } else {
        console.error('Failed to update lead with qualifying data');
      }
    } catch (error) {
      console.error('Error in final submission:', error);
    }
  };
  
  // Handle yes/no toggle selection
  const handleToggleSelect = (field, value) => {
    // Update form data
    updateFormData({
      [field]: value
    });
    
    // Proceed to next question
    if (qualifyingStep < 3) {
      setQualifyingStep(prevStep => prevStep + 1);
    } else {
      handleSubmit();
    }
  };
  
  // Handle home type selection
  const handleHomeTypeSelect = (type) => {
    // Close dropdown
    setDropdownOpen(false);
    
    // Update form data
    updateFormData({
      homeType: type
    });
    
    // Proceed to next question
    setQualifyingStep(prevStep => prevStep + 1);
  };
  
  // Handle slider change for mortgage
  const handleMortgageChange = (e) => {
    setRemainingMortgage(Number(e.target.value));
  };
  
  // Handle slider change for square footage
  const handleSquareFootageChange = (e) => {
    setFinishedSquareFootage(Number(e.target.value));
  };
  
  // Handle slider change for basement square footage
  const handleBasementSquareFootageChange = (e) => {
    setBasementSquareFootage(Number(e.target.value));
  };
  
  // Handle next button click for sliders
  const handleSliderNext = () => {
    // Update form data with slider values
    updateFormData({
      remainingMortgage,
      finishedSquareFootage,
      basementSquareFootage
    });
    
    // Proceed to next question
    if (qualifyingStep < 3) {
      setQualifyingStep(prevStep => prevStep + 1);
    } else {
      handleSubmit();
    }
  };
  
  // Render toggle buttons for yes/no questions
  const renderToggleButtons = (field, questionText) => {
    return (
      <div className="qualifying-question">
        <h3>{questionText}</h3>
        <div className="toggle-container">
          <button
            ref={toggleLeftRef}
            className={`toggle-button ${formData[field] === true ? 'active' : ''}`}
            onClick={() => handleToggleSelect(field, true)}
          >
            Yes
          </button>
          <button
            ref={toggleRightRef}
            className={`toggle-button ${formData[field] === false ? 'active' : ''}`}
            onClick={() => handleToggleSelect(field, false)}
          >
            No
          </button>
        </div>
      </div>
    );
  };
  
  // Render dropdown for home type selection
  const renderHomeTypeDropdown = () => {
    const homeTypes = [
      'Single Family',
      'Multi-Family',
      'Condo/Townhouse',
      'Mobile/Manufactured',
      'Land/Lot',
      'Other'
    ];
    
    return (
      <div className="qualifying-question">
        <h3>What type of property is it?</h3>
        <div className="dropdown-container">
          <button
            className="dropdown-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {formData.homeType || 'Select Property Type'}
            <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
          </button>
          
          {dropdownOpen && (
            <div className="dropdown-menu">
              {homeTypes.map(type => (
                <div
                  key={type}
                  className="dropdown-item"
                  onClick={() => handleHomeTypeSelect(type)}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render slider for numeric inputs
  const renderSlider = (value, setValue, min, max, step, format, label) => {
    return (
      <div className="qualifying-slider">
        <h3>{label}</h3>
        <div className="slider-value">{format(value)}</div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={setValue}
          className="slider"
        />
        <div className="slider-range">
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
      </div>
    );
  };
  
  // Render appropriate question based on current step
  const renderCurrentQuestion = () => {
    switch (qualifyingStep) {
      case 1:
        return renderToggleButtons(
          'isPropertyOwner',
          'Are you the property owner?'
        );
      case 2:
        if (formData.isPropertyOwner) {
          return renderHomeTypeDropdown();
        } else {
          return renderToggleButtons(
            'workingWithAgent',
            'Are you working with a real estate agent?'
          );
        }
      case 3:
        return (
          <div className="qualifying-question">
            <h3>Tell us more about your property</h3>
            <div className="sliders-container">
              {renderSlider(
                remainingMortgage,
                handleMortgageChange,
                0,
                500000,
                10000,
                formatCurrency,
                'Remaining Mortgage'
              )}
              
              {renderSlider(
                finishedSquareFootage,
                handleSquareFootageChange,
                500,
                5000,
                100,
                formatSquareFootage,
                'Finished Square Footage'
              )}
              
              {renderSlider(
                basementSquareFootage,
                handleBasementSquareFootageChange,
                0,
                3000,
                100,
                formatSquareFootage,
                'Basement Square Footage'
              )}
              
              <button
                className="next-button"
                onClick={handleSliderNext}
              >
                Continue
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="qualifying-form">
      <div className="form-header">
        <h2>Help us customize your offer</h2>
        <p>Please answer a few questions about your property to get the most accurate offer.</p>
      </div>
      
      <div className="qualifying-content">
        {renderCurrentQuestion()}
      </div>
    </div>
  );
}

export default QualifyingForm;