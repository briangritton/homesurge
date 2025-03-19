import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { trackFormStepComplete } from '../../services/analytics';

function QualifyingForm() {
  const { formData, updateFormData, nextStep, updateLead, leadId } = useFormContext();
  const [qualifyingStep, setQualifyingStep] = useState(formData.qualifyingQuestionStep || 1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOptionLR, setSelectedOptionLR] = useState('left');
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
  
  // Check if we're using a temp ID and show a message
  useEffect(() => {
    if (leadId && leadId.startsWith('temp_') && !saveAttempted) {
      setSaveAttempted(true);
      console.log('Note: Using demo mode - changes will not be saved to Zoho CRM');
    }
  }, [leadId, saveAttempted]);
  
  // Initialize button states based on existing data
  useEffect(() => {
    // Set the selected option for property repairs
    if (formData.needsRepairs === 'true') {
      setSelectedOptionLR('right');
    } else {
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
  
  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [qualifyingStep]);
  
  // Generate date and time options for appointment scheduling
  const getNextSevenDays = () => {
    const result = [];
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const dayName = daysOfWeek[nextDate.getDay()];
      const date = nextDate.getDate();
      const month = nextDate.getMonth() + 1;
      result.push(`${dayName}, ${month}/${date}`);
    }
    return result;
  };
  
  const getTimeSlots = () => {
    const timeSlots = [];
    for (let i = 8; i <= 20; i++) {
      const hour = i <= 12 ? i : i - 12;
      const period = i < 12 ? 'AM' : 'PM';
      timeSlots.push(`${hour}:00 ${period}`);
    }
    return timeSlots;
  };
  
  const availableDates = getNextSevenDays();
  const availableTimes = getTimeSlots();
  
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
  
  // This function handles updating a field value and immediately advancing to the next question
  // The Zoho update happens in the background
  const handleValueUpdate = (fieldName, value) => {
    // Update form data locally first
    updateFormData({ [fieldName]: value });
    
    // Track analytics
    trackFormStepComplete(qualifyingStep, `Qualifying Question ${qualifyingStep}`);
    
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
        }
      }).catch(error => {
        console.error(`Error updating ${fieldName}:`, error);
      });
    }, 100);
  };
  
  // Handle completing the qualifying form
  const completeForm = () => {
    // Update lead in Zoho one final time
    console.log('Finalizing lead data with qualifying form answers');
    
    // Ensure all form data is properly set before finalizing
    console.log('Final form data before completion:', {
      needsRepairs: formData.needsRepairs,
      wantToSetAppointment: formData.wantToSetAppointment,
      selectedAppointmentDate: formData.selectedAppointmentDate,
      selectedAppointmentTime: formData.selectedAppointmentTime
    });
    
    // Initiate Zoho update in the background
    updateLead().then(() => {
      console.log('All data saved successfully!');
    }).catch(error => {
      console.error('Error finalizing lead:', error);
    });
    
    // Track form completion for analytics
    trackFormStepComplete('complete', 'Qualifying Form Complete');
    
    // Move to thank you page immediately
    nextStep();
  };
  
  // Helper function to go to a specific step
  const goToStep = (step) => {
    setQualifyingStep(step);
    updateFormData({ qualifyingQuestionStep: step });
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
                  handleValueUpdate('isPropertyOwner', e.target.value);
                  setSelectedOptionLR('left');
                }}
              >
                Yes
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="false"
                onClick={(e) => {
                  handleValueUpdate('isPropertyOwner', e.target.value);
                  setSelectedOptionLR('right');
                }}
              >
                No
              </button>
            </div>
          </div>
        );
        
      case 2:
        // Repairs needed question
        // IMPORTANT: This is where needsRepairs is set
        return (
          <div className="qualifying-option-column">
            <div className="qualifying-question">
              Does the property need any major repairs?
            </div>
            <div className="qualifying-answer-container">
              <button
                className="qualifying-toggle-selected-left"
                ref={toggleLeftRef}
                value="false"
                onClick={(e) => {
                  // Make sure this properly updates the value and triggers a save
                  const repairValue = e.target.value;
                  console.log("Setting needsRepairs to:", repairValue);
                  handleValueUpdate('needsRepairs', repairValue);
                  setSelectedOptionLR('left');
                }}
              >
                No
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="true"
                onClick={(e) => {
                  // Make sure this properly updates the value and triggers a save
                  const repairValue = e.target.value;
                  console.log("Setting needsRepairs to:", repairValue);
                  handleValueUpdate('needsRepairs', repairValue);
                  setSelectedOptionLR('right');
                }}
              >
                Yes
              </button>
            </div>
          </div>
        );
        
      case 3:
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
                  handleValueUpdate('workingWithAgent', e.target.value);
                  setSelectedOptionLR('left');
                }}
              >
                No
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="true"
                onClick={(e) => {
                  handleValueUpdate('workingWithAgent', e.target.value);
                  setSelectedOptionLR('right');
                }}
              >
                Yes
              </button>
            </div>
          </div>
        );
        
      case 4:
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
                    onClick={() => {
                      handleValueUpdate('homeType', option);
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
        
      case 5:
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
        
      case 6:
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
        
      case 7:
        // Timeframe question
        return (
          <div className="qualifying-option-column">
            <div className="qualifying-question">
              How soon do you want to sell?
            </div>
            <div className="dropdown">
              <button
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {formData.howSoonSell || "Select an option"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                {['ASAP', '0-3 months', '3-6 months', '6-12 months', 'not sure'].map((option) => (
                  <div
                    key={option}
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
        
      case 8:
        // Request appointment question
        return (
          <div className="qualifying-option-column">
            <div className="qualifying-question">
              Do you want to set a virtual appointment? It takes a few minutes,
              and we may be able to make you a cash offer on the spot.
            </div>
            <div className="qualifying-answer-container">
              <button
                className="qualifying-toggle-selected-left"
                ref={toggleLeftRef}
                value="false"
                onClick={(e) => {
                  // Update form data and save
                  updateFormData({ wantToSetAppointment: e.target.value });
                  setSelectedOptionLR('left');
                  
                  // Trigger background save then complete the form
                  updateLead().then(() => console.log('Appointment preference saved'));
                  
                  // Move to completion immediately
                  completeForm();
                }}
              >
                No
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="true"
                onClick={(e) => {
                  // Update form data and save in background
                  updateFormData({ wantToSetAppointment: e.target.value });
                  setSelectedOptionLR('right');
                  
                  // Trigger background save
                  updateLead().then(() => console.log('Appointment preference saved'));
                  
                  // Move to next step immediately
                  goToStep(9);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        );
        
      case 9:
        // Date selection for appointment
        return (
          <div className="qualifying-option-column">
            <div className="qualifying-question">
              Select your preferred appointment date.
            </div>
            <div className="dropdown">
              <button
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {formData.selectedAppointmentDate || "Select a Date"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                {availableDates.map((date, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      handleValueUpdate('selectedAppointmentDate', date);
                      setDropdownOpen(false);
                    }}
                  >
                    &nbsp;&nbsp;{date}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 10:
        // Time selection for appointment
        return (
          <div className="qualifying-option-column">
            <div className="qualifying-question">
              Select your preferred appointment time on {formData.selectedAppointmentDate}
            </div>
            <div className="dropdown">
              <button
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {formData.selectedAppointmentTime || "Select a Time"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                {availableTimes.map((time, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      // Update form data
                      const appointmentTime = time;
                      console.log("Setting selectedAppointmentTime to:", appointmentTime);
                      updateFormData({ selectedAppointmentTime: appointmentTime });
                      setDropdownOpen(false);
                      
                      // Start background update to Zoho and proceed to completion
                      updateLead().then(() => console.log('Appointment time saved'));
                      
                      // Add a delay to ensure the form data is updated
                      setTimeout(() => {
                        // Move to completion
                        completeForm();
                      }, 300);
                    }}
                  >
                    &nbsp;&nbsp;{time}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        // Final message
        return (
          <div className="qualifying-option-column">
            <div className="qualifying-question">
              Thanks for your detailed responses! We'll be in touch shortly to discuss your options.
            </div>
            <button
              className="qualifying-button"
              onClick={completeForm}
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
        Help us prepare your best cash offer
      </div>
      <div className="qualifying-form-container">
        {renderCurrentQuestion()}
      </div>
      {renderTempIdMessage()}
    </div>
  );
}

export default QualifyingForm;