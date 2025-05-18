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
      setSaveAttempted(true);
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
    const personalInfoFormVariant = userGroups?.['personal_info_form_test'];
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
  }, [leadId, saveAttempted, formData, userGroups, trackConversion]);
  
  // Initialize button states based on existing data
  useEffect(() => {
    // Set the selected option for property repairs
    if (formData.needsRepairs === 'true') {
      setSelectedOptionLR('right');
    } else if (formData.needsRepairs === 'false') {
      setSelectedOptionLR('left');
    }
    
    // Update toggle button styles based on selection
    if (toggleLeftRef.current && toggleRightRef.current) {
      if (selectedOptionLR === 'left') {
        toggleLeftRef.current.className = 'qualifying-toggle-selected-left';
        toggleRightRef.current.className = 'qualifying-toggle-deselected-right';
      } else {
        toggleLeftRef.current.className = 'qualifying-toggle-deselected-left';
        toggleRightRef.current.className = 'qualifying-toggle-selected-right';
      }
    }
  }, [selectedOptionLR, formData.needsRepairs]);
  
  // Send qualifying answers to Zoho when step changes
  useEffect(() => {
    // Scroll to top when step changes
    window.scrollTo(0, 0);
    
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
  }, [qualifyingStep, remainingMortgage, finishedSquareFootage, basementSquareFootage, leadId, updateFormData, updateLead]);
  
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
        const personalInfoFormVariant = userGroups?.['personal_info_form_test'];
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
  
  // This function handles updating a field value and immediately advancing to the next question
  const handleValueUpdate = (fieldName, value) => {
    // Update form data locally first
    updateFormData({ [fieldName]: value });
    
    // Move to next step immediately
    const nextQuestionStep = qualifyingStep + 1;
    setQualifyingStep(nextQuestionStep);
    updateFormData({ qualifyingQuestionStep: nextQuestionStep });
    
    // Log the update for debugging
    console.log(`Updating ${fieldName} = ${value}`);
    
    // Then start the background update to Zoho
    setTimeout(() => {
      console.log(`Background update to Zoho with ${fieldName} = ${value}`);
      updateLead().then(success => {
        if (success) {
          console.log(`Successfully updated ${fieldName} in Zoho`);
        } else {
          console.warn(`Failed to update ${fieldName} in Zoho`);
          // Track error for analytics
          trackFormError(`Failed to update ${fieldName} in Zoho`, 'zoho_update');
        }
      }).catch(error => {
        console.error(`Error updating ${fieldName}:`, error);
        // Track error for analytics
        trackFormError(`Error updating ${fieldName}: ${error.message}`, 'zoho_update');
      });
    }, 100);
  };
  
  // Handle yes/no toggle selection
  const handleToggleSelect = (field, value) => {
    handleValueUpdate(field, value);
    
    // When clicking the toggle, update its appearance
    if (toggleLeftRef.current && toggleRightRef.current) {
      if (value === true) {
        toggleLeftRef.current.className = 'qualifying-toggle-selected-left';
        toggleRightRef.current.className = 'qualifying-toggle-deselected-right';
        setSelectedOptionLR('left');
      } else {
        toggleLeftRef.current.className = 'qualifying-toggle-deselected-left';
        toggleRightRef.current.className = 'qualifying-toggle-selected-right';
        setSelectedOptionLR('right');
      }
    }
  };
  
  // Handle home type selection
  const handleHomeTypeSelect = (type) => {
    // Close dropdown
    setDropdownOpen(false);
    
    // Use the value update method for consistency
    handleValueUpdate('homeType', type);
  };
  
  // Render a message about using temp ID
  const renderTempIdMessage = () => {
    if (leadId && leadId.startsWith('temp_')) {
      return (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          backgroundColor: '#f1f1f1',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontSize: '12px',
          color: '#666',
          zIndex: 1000
        }}>
          Demo Mode: Updates not sent to CRM
        </div>
      );
    }
    return null;
  };
  
  // Handle slider changes
  const handleSliderChangeMortgage = (e) => {
    const selectedValue = parseInt(e.target.value, 10);
    
    if (selectedValue >= 10000) {
      setRemainingMortgage(Math.round(selectedValue / 10000) * 10000);
    } else {
      setRemainingMortgage(selectedValue);
    }
    
    updateFormData({ remainingMortgage: selectedValue });
  };
  
  const handleSliderChangeSquareFootage = (e) => {
    const selectedValue = parseInt(e.target.value, 10);
    
    if (selectedValue >= 50) {
      setFinishedSquareFootage(Math.round(selectedValue / 250) * 250);
    }
    
    updateFormData({ finishedSquareFootage: selectedValue });
  };
  
  const handleSliderChangeBasementSquareFootage = (e) => {
    const selectedValue = parseInt(e.target.value, 10);
    
    if (selectedValue >= 50) {
      setBasementSquareFootage(Math.round(selectedValue / 250) * 250);
    }
    
    updateFormData({ basementSquareFootage: selectedValue });
  };
  
  // Format display values for sliders
  const displayMortgageValue = remainingMortgage >= 1000000
    ? '$' + remainingMortgage.toLocaleString() + '+'
    : '$' + remainingMortgage.toLocaleString();
    
  const displayFinishedSquareFootage = finishedSquareFootage >= 10000
    ? finishedSquareFootage.toLocaleString() + '+ sq/ft'
    : finishedSquareFootage.toLocaleString() + ' sq/ft';
    
  const displayBasementSquareFootage = basementSquareFootage >= 10000
    ? basementSquareFootage.toLocaleString() + '+ sq/ft'
    : basementSquareFootage.toLocaleString() + ' sq/ft';
  
  // Get the current qualifying question to display
  const renderCurrentQuestion = () => {
    switch (qualifyingStep) {
      case 1:
        // Property owner question
        return (
          <div className="qualifying-option-column">
            <div className="qualifying-question">
              Are you the property owner?
            </div>
            <div className="qualifying-answer-container">
              <button
                className="qualifying-toggle-selected-left"
                ref={toggleLeftRef}
                value="true"
                onClick={(e) => {
                  handleToggleSelect('isPropertyOwner', e.target.value === 'true');
                }}
              >
                Yes
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="false"
                onClick={(e) => {
                  handleToggleSelect('isPropertyOwner', e.target.value === 'true');
                }}
              >
                No
              </button>
            </div>
          </div>
        );
        
      case 2:
        if (formData.isPropertyOwner) {
          // Property type question
          return (
            <div className="qualifying-option-column">
              <div className="qualifying-question">
                What type of property is it?
              </div>
              <div className="dropdown">
                <button
                  className="dropbtn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {formData.homeType || "Select an option"}
                </button>
                <div
                  className="dropdown-content"
                  style={{ display: dropdownOpen ? "block" : "none" }}
                >
                  {['Single Family', 'Condo', 'Townhouse', 'Multi-Family'].map((option) => (
                    <div
                      key={option}
                      onClick={() => handleHomeTypeSelect(option)}
                    >
                      &nbsp;&nbsp;{option}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        } else {
          // Working with agent question
          return (
            <div className="qualifying-option-column">
              <div className="qualifying-question">
                Are you working with a real estate agent?
              </div>
              <div className="qualifying-answer-container">
                <button
                  className="qualifying-toggle-selected-left"
                  ref={toggleLeftRef}
                  value="false"
                  onClick={(e) => {
                    handleToggleSelect('workingWithAgent', e.target.value === 'true');
                  }}
                >
                  No
                </button>
                <button
                  className="qualifying-toggle-deselected-right"
                  ref={toggleRightRef}
                  value="true"
                  onClick={(e) => {
                    handleToggleSelect('workingWithAgent', e.target.value === 'true');
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          );
        }
        
      case 3:
        // Mortgage amount question
        return (
          <div className="qualifying-option-column">
            <div className="qualifying-question">
              What is your remaining mortgage amount?
            </div>
            <div className="qualifying-slider-container">
              <div className="qualifying-slider-text">
                {displayMortgageValue}
              </div>
              <input
                type="range"
                min="0"
                max="1000000"
                value={remainingMortgage}
                className="qualifying-slider"
                ref={mortgageSliderRef}
                onChange={handleSliderChangeMortgage}
              />
            </div>
            <button
              className="qualifying-button"
              onClick={() => handleValueUpdate('remainingMortgage', remainingMortgage)}
            >
              Next
            </button>
          </div>
        );
        
      case 4:
        // Square footage question
        return (
          <div className="qualifying-option-column">
            <div className="qualifying-question">
              What is your finished square footage?
            </div>
            <div className="qualifying-slider-container">
              <div className="qualifying-slider-text">
                {displayFinishedSquareFootage}
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                value={finishedSquareFootage}
                className="qualifying-slider"
                ref={squareFootageSliderRef}
                onChange={handleSliderChangeSquareFootage}
              />
            </div>
            <button
              className="qualifying-button"
              onClick={() => handleValueUpdate('finishedSquareFootage', finishedSquareFootage)}
            >
              Next
            </button>
          </div>
        );
        
      case 5:
        // Basement square footage question
        return (
          <div className="qualifying-option-column">
            <div className="qualifying-question">
              What is your basement square footage?
            </div>
            <div className="qualifying-slider-container">
              <div className="qualifying-slider-text">
                {displayBasementSquareFootage}
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                value={basementSquareFootage}
                className="qualifying-slider"
                ref={basementSquareFootageSliderRef}
                onChange={handleSliderChangeBasementSquareFootage}
              />
            </div>
            <button
              className="qualifying-button"
              onClick={handleSubmit}
            >
              Finish
            </button>
          </div>
        );
        
      default:
        // Final message or error state
        return (
          <div className="qualifying-option-column">
            <div className="qualifying-question">
              Thanks for your detailed responses! We'll be in touch shortly to discuss your options.
            </div>
            <button
              className="qualifying-button"
              onClick={handleSubmit}
            >
              Finish
            </button>
          </div>
        );
    }
  };
  
  return (
    <div className="qualifying-section">
      <div className="qualifying-headline">
        {formData.templateType === 'VALUE' 
          ? 'Help us prepare your detailed home value report' 
          : formData.templateType === 'FAST' 
            ? 'Help us prepare your fast sale offer'
            : 'Help us prepare your best cash offer'}
      </div>
      <div className="qualifying-form-container">
        {renderCurrentQuestion()}
      </div>
      {renderTempIdMessage()}
    </div>
  );
}

export default QualifyingForm;