import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import { trackFormStepComplete, trackFormError } from '../../../services/analytics';
import { trackZohoConversion } from '../../../services/zoho';

function ValueBoostQualifyingB2({ campaign, variant }) {
  const { formData, updateFormData, nextStep, updateLead, leadId, goToStep } = useFormContext();
  
  // ================================================================================
  // DYNAMIC CONTENT SYSTEM - VALUEBOOST QUALIFYING FORM TEMPLATES
  // ================================================================================
  // 
  // EDITING INSTRUCTIONS:
  // - All content templates are defined here in this component
  // - To add new templates, add them to the templates object below
  // - To modify existing content, edit the template objects
  // - Campaign tracking still handled by FormContext
  //
  // ================================================================================
  
  const getDynamicContent = () => {
    // Read campaign name directly from URL
    const urlParams = new URLSearchParams(window.location.search);
    const possibleParamNames = ['campaign_name', 'campaignname', 'campaign-name', 'utm_campaign'];
    
    let campaignName = '';
    for (const paramName of possibleParamNames) {
      const value = urlParams.get(paramName);
      if (value) {
        campaignName = value;
        break;
      }
    }
    
    // ValueBoost Qualifying Form Templates - Different approach to qualification
    const templates = {
      cash: {
        headline: 'Help us prepare your highest cash offer',
        purpose: 'cash offer preparation'
      },
      fast: {
        headline: 'Help us prepare your highest cash offer', 
        purpose: 'quick sale process'
      },
      value: {
        headline: 'Help us prepare your detailed home value report',
        purpose: 'value assessment'
      },
      default: {
        headline: 'Help us prepare your highest cash offer',
        purpose: 'offer preparation'
      }
    };
    
    // Simple keyword matching with priority: cash > value > fast
    if (campaignName) {
      const simplified = campaignName.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      if (simplified.includes('cash')) return templates.cash;
      if (simplified.includes('value')) return templates.value;
      if (simplified.includes('fast')) return templates.fast;
    }
    
    return templates.default;
  };
  
  const dynamicContent = getDynamicContent();
  const [qualifyingStep, setQualifyingStep] = useState(formData.qualifyingQuestionStep || 0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOptionLR, setSelectedOptionLR] = useState('left');
  const [propertyOwnerSelection, setPropertyOwnerSelection] = useState('left');
  const [repairsSelection, setRepairsSelection] = useState('left');
  const [timelineSelection, setTimelineSelection] = useState('left');
  const [saveAttempted, setSaveAttempted] = useState(false);
  
  // Refs for toggle buttons
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
    trackFormStepComplete(4, 'ValueBoost Qualifying Form Loaded', formData);
    
    // Record window scroll position
    const scrollPosition = window.scrollY;
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Cleanup function to restore scroll position
    return () => {
      window.scrollTo(0, scrollPosition);
    };
  }, [leadId, saveAttempted, formData]);
  
  // Initialize button states based on existing data
  useEffect(() => {
    // Set the selected options based on form data
    if (formData.isPropertyOwner === 'true') {
      setPropertyOwnerSelection('left');
    } else if (formData.isPropertyOwner === 'false') {
      setPropertyOwnerSelection('right');
    }
    
    if (formData.needsRepairs === 'true') {
      setRepairsSelection('right');
      setSelectedOptionLR('right');
    } else if (formData.needsRepairs === 'false') {
      setRepairsSelection('left');
      setSelectedOptionLR('left');
    }
    
    if (formData.timelineMotivation === 'immediately') {
      setTimelineSelection('left');
    } else if (formData.timelineMotivation === 'flexible') {
      setTimelineSelection('right');
    }
  }, [formData.isPropertyOwner, formData.needsRepairs, formData.timelineMotivation]);

  // Update toggle button styles based on current step and selection
  useEffect(() => {
    if (toggleLeftRef.current && toggleRightRef.current) {
      let currentSelection = 'left';
      
      // Determine current selection based on qualifying step
      switch(qualifyingStep) {
        case 1:
          currentSelection = propertyOwnerSelection;
          break;
        case 2:
          currentSelection = repairsSelection;
          break;
        case 3:
          currentSelection = timelineSelection;
          break;
        default:
          currentSelection = 'left';
      }
      
      // Apply styles based on selection
      if (currentSelection === 'left') {
        toggleLeftRef.current.className = 'vb-q-toggle-selected-left';
        toggleRightRef.current.className = 'vb-q-toggle-deselected-right';
      } else {
        toggleLeftRef.current.className = 'vb-q-toggle-deselected-left';
        toggleRightRef.current.className = 'vb-q-toggle-selected-right';
      }
    }
  }, [qualifyingStep, propertyOwnerSelection, repairsSelection, timelineSelection]);

  const handleSubmit = async () => {
    console.log('ValueBoost Qualifying form submitted');
    
    try {
      // Track conversion
      trackZohoConversion(formData);
      
      // Move to next step in the funnel (step 5 or thank you page)
      nextStep();
    } catch (error) {
      console.error('Error submitting qualifying form:', error);
      trackFormError('ValueBoost Qualifying Submit Failed', error.message, formData);
    }
  };

  const handleValueUpdate = async (field, value) => {
    console.log(`Updating ${field} to:`, value);
    
    // Update form data
    updateFormData({ 
      [field]: value,
      qualifyingQuestionStep: qualifyingStep + 1
    });
    
    // Track analytics
    trackFormStepComplete(qualifyingStep, `ValueBoost ${field} Selected: ${value}`, formData);
    
    // Save to Firebase
    try {
      await updateLead();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
    
    // Move to next question
    setQualifyingStep(qualifyingStep + 1);
  };

  const handleSliderChangeMortgage = (e) => {
    setRemainingMortgage(parseInt(e.target.value));
  };

  const handleSliderChangeSquareFootage = (e) => {
    setFinishedSquareFootage(parseInt(e.target.value));
  };

  const handleSliderChangeBasementSquareFootage = (e) => {
    setBasementSquareFootage(parseInt(e.target.value));
  };

  const handleHomeTypeSelect = (homeType) => {
    handleValueUpdate('homeType', homeType);
  };

  // Format values for display
  const displayMortgageValue = remainingMortgage === 0 ? "No mortgage" : `$${remainingMortgage.toLocaleString()}`;
  const displayFinishedSquareFootage = `${finishedSquareFootage.toLocaleString()} sq ft`;
  const displayBasementSquareFootage = basementSquareFootage === 0 ? "No basement" : `${basementSquareFootage.toLocaleString()} sq ft`;

  // Generate date options for appointments
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      dates.push(`${dayName}, ${monthDay}`);
    }
    
    return dates;
  };

  // Generate time options for appointments
  const generateTimeOptions = () => {
    return [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ];
  };

  const renderTempIdMessage = () => {
    if (leadId && leadId.startsWith('temp_')) {
      return (
        <div className="vb-q-temp-id-message">
          <p>Using temporary ID for tracking. Some features may be limited.</p>
        </div>
      );
    }
    return null;
  };

  const renderCurrentQuestion = () => {
    switch(qualifyingStep) {
      case 0:
        // Welcome message step
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#16899d', marginBottom: '20px' }}>
              Your offer is on its way!
            </div>
            <div className="vb-q-question" style={{ fontSize: '1.3rem', marginBottom: '30px' }}>
              Watch your phone, we'll send you your requested details momentarily! In the meantime, let's get your offer completely customized by answering a few more questions about your home.
            </div>
            <button
              className="vb-q-button"
              onClick={() => {
                setQualifyingStep(1);
                updateFormData({ qualifyingQuestionStep: 1 });
              }}
            >
              Continue
            </button>
          </div>
        );
        
      case 1:
        // Property ownership question
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question">
              Are you the property owner?
            </div>
            <div className="vb-q-answer-container">
              <button
                className="vb-q-toggle-selected-left"
                ref={toggleLeftRef}
                onClick={() => {
                  setPropertyOwnerSelection('left');
                  handleValueUpdate('isPropertyOwner', 'true');
                }}
              >
                Yes
              </button>
              <button
                className="vb-q-toggle-deselected-right"
                ref={toggleRightRef}
                onClick={() => {
                  setPropertyOwnerSelection('right');
                  handleValueUpdate('isPropertyOwner', 'false');
                }}
              >
                No
              </button>
            </div>
          </div>
        );
        
      case 2:
        // Repairs needed question
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question">
              Does your property need repairs?
            </div>
            <div className="vb-q-answer-container">
              <button
                className="vb-q-toggle-selected-left"
                ref={toggleLeftRef}
                onClick={() => {
                  setRepairsSelection('left');
                  setSelectedOptionLR('left');
                  handleValueUpdate('needsRepairs', 'false');
                }}
              >
                No
              </button>
              <button
                className="vb-q-toggle-deselected-right"
                ref={toggleRightRef}
                onClick={() => {
                  setRepairsSelection('right');
                  setSelectedOptionLR('right');
                  handleValueUpdate('needsRepairs', 'true');
                }}
              >
                Yes
              </button>
            </div>
          </div>
        );
        
      case 3:
        // Timeline motivation question
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question">
              What is your selling timeline?
            </div>
            <div className="vb-q-answer-container">
              <button
                className="vb-q-toggle-selected-left"
                ref={toggleLeftRef}
                onClick={() => {
                  setTimelineSelection('left');
                  handleValueUpdate('timelineMotivation', 'immediately');
                }}
              >
                ASAP
              </button>
              <button
                className="vb-q-toggle-deselected-right"
                ref={toggleRightRef}
                onClick={() => {
                  setTimelineSelection('right');
                  handleValueUpdate('timelineMotivation', 'flexible');
                }}
              >
                Flexible
              </button>
            </div>
          </div>
        );
        
      case 4:
        // Home type question
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question">
              What type of home is it?
            </div>
            <div className="vb-q-dropdown">
              <button
                className="vb-q-dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {formData.homeType || "Select home type"}
              </button>
              <div
                className="vb-q-dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                {['Single Family', 'Townhome', 'Condo', 'Multi-Family', 'Mobile Home', 'Other'].map((option) => (
                  <div
                    key={option}
                    className="vb-q-dropdown-item"
                    onClick={() => handleHomeTypeSelect(option)}
                  >
                    &nbsp;&nbsp;{option}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 5:
        // Mortgage amount question
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question">
              What is your remaining mortgage amount?
            </div>
            <div className="vb-q-slider-container">
              <div className="vb-q-slider-text">
                {displayMortgageValue}
              </div>
              <input
                type="range"
                min="0"
                max="1000000"
                value={remainingMortgage}
                className="vb-q-slider"
                ref={mortgageSliderRef}
                onChange={handleSliderChangeMortgage}
              />
            </div>
            <button
              className="vb-q-button"
              onClick={() => handleValueUpdate('remainingMortgage', remainingMortgage)}
            >
              Next
            </button>
          </div>
        );
        
      case 6:
        // Square footage question
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question">
              What is your finished square footage?
            </div>
            <div className="vb-q-slider-container">
              <div className="vb-q-slider-text">
                {displayFinishedSquareFootage}
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                value={finishedSquareFootage}
                className="vb-q-slider"
                ref={squareFootageSliderRef}
                onChange={handleSliderChangeSquareFootage}
              />
            </div>
            <button
              className="vb-q-button"
              onClick={() => handleValueUpdate('finishedSquareFootage', finishedSquareFootage)}
            >
              Next
            </button>
          </div>
        );
        
      case 7:
        // Basement square footage question
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question">
              What is your basement square footage?
            </div>
            <div className="vb-q-slider-container">
              <div className="vb-q-slider-text">
                {displayBasementSquareFootage}
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                value={basementSquareFootage}
                className="vb-q-slider"
                ref={basementSquareFootageSliderRef}
                onChange={handleSliderChangeBasementSquareFootage}
              />
            </div>
            <button
              className="vb-q-button"
              onClick={() => handleValueUpdate('basementSquareFootage', basementSquareFootage)}
            >
              Next
            </button>
          </div>
        );
        
      case 8:
        // Timeframe question
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question">
              How soon do you want to sell?
            </div>
            <div className="vb-q-dropdown">
              <button
                className="vb-q-dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {formData.howSoonSell || "Select an option"}
              </button>
              <div
                className="vb-q-dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                {['ASAP', '0-3 months', '3-6 months', '6-12 months', 'not sure'].map((option) => (
                  <div
                    key={option}
                    className="vb-q-dropdown-item"
                    onClick={() => {
                      handleValueUpdate('howSoonSell', option);
                      setDropdownOpen(false);
                    }}
                  >
                    &nbsp;&nbsp;{option}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 9:
        // Request appointment question
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question">
              Do you want to set a virtual appointment? It takes a few minutes,
              and we may be able to make you a cash offer on the spot.
            </div>
            <div className="vb-q-answer-container">
              <button
                className="vb-q-toggle-selected-left"
                ref={toggleLeftRef}
                value="false"
                onClick={(e) => {
                  // Update form data and save
                  updateFormData({ wantToSetAppointment: e.target.value });
                  setSelectedOptionLR('left');
                  
                  // Track analytics with campaign data
                  trackFormStepComplete(9, 'No Appointment Requested', formData);
                  
                  // Update Zoho and finish
                  updateLead().then(() => {
                    console.log('Appointment preference saved');
                    // Submit form data
                    handleSubmit();
                  });
                }}
              >
                No
              </button>
              <button
                className="vb-q-toggle-deselected-right"
                ref={toggleRightRef}
                value="true"
                onClick={(e) => {
                  // Update form data and save in background
                  updateFormData({ wantToSetAppointment: e.target.value });
                  setSelectedOptionLR('right');
                  
                  // Track analytics with campaign data
                  trackFormStepComplete(9, 'Appointment Requested', formData);
                  
                  // Trigger background save
                  updateLead().then(() => console.log('Appointment preference saved'));
                  
                  // Move to next step immediately
                  setQualifyingStep(10);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        );
        
      case 10:
        // Date selection for appointment
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question">
              Select your preferred appointment date.
            </div>
            <div className="vb-q-dropdown">
              <button
                className="vb-q-dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {formData.selectedAppointmentDate || "Select a date"}
              </button>
              <div
                className="vb-q-dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                {generateDateOptions().map((date) => (
                  <div
                    key={date}
                    className="vb-q-dropdown-item"
                    onClick={() => {
                      updateFormData({ selectedAppointmentDate: date });
                      setDropdownOpen(false);
                      setQualifyingStep(11);
                    }}
                  >
                    &nbsp;&nbsp;{date}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 11:
        // Time selection for appointment
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question">
              Select your preferred appointment time.
            </div>
            <div className="vb-q-dropdown">
              <button
                className="vb-q-dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {formData.selectedAppointmentTime || "Select a time"}
              </button>
              <div
                className="vb-q-dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                {generateTimeOptions().map((time) => (
                  <div
                    key={time}
                    className="vb-q-dropdown-item"
                    onClick={() => {
                      updateFormData({ selectedAppointmentTime: time });
                      setDropdownOpen(false);
                      setQualifyingStep(12);
                    }}
                  >
                    &nbsp;&nbsp;{time}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 12:
        // Final confirmation
        return (
          <div className="vb-q-option-column">
            <div className="vb-q-question">
              Perfect! Your appointment is scheduled for {formData.selectedAppointmentDate} at {formData.selectedAppointmentTime}.
              We'll send you a confirmation shortly.
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="vb-q-section">
      {qualifyingStep > 0 && (
        <div className="vb-q-headline">
          {dynamicContent.headline}
        </div>
      )}
      <div className="vb-q-form-container">
        {renderCurrentQuestion()}
      </div>
      {renderTempIdMessage()}
    </div>
  );
}

export default ValueBoostQualifyingB2;