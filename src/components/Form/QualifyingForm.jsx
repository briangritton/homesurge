import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { trackFormStepComplete } from '../../services/analytics';

function QualifyingForm() {
  const { formData, updateFormData, nextStep, updateLead } = useFormContext();
  const [qualifyingStep, setQualifyingStep] = useState(formData.qualifyingQuestionStep || 1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOptionLR, setSelectedOptionLR] = useState('left');
  const [isUpdating, setIsUpdating] = useState(false);
  
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
  const [basementSquareFootage, setBasementSquareFootage] = useState(formData.basementSquareFootage || 1000);
  
  // Update toggle button styles based on selection
  useEffect(() => {
    if (toggleLeftRef.current && toggleRightRef.current) {
      if (selectedOptionLR === 'left') {
        toggleLeftRef.current.className = 'qualifying-toggle-selected-left';
        toggleRightRef.current.className = 'qualifying-toggle-deselected-right';
      } else {
        toggleLeftRef.current.className = 'qualifying-toggle-deselected-left';
        toggleRightRef.current.className = 'qualifying-toggle-selected-right';
      }
    }
  }, [selectedOptionLR]);
  
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
  
  // Handle advancing to next qualifying question
  const handleNextStep = async () => {
    // Update lead in Zoho to save progress
    setIsUpdating(true);
    try {
      console.log(`Updating lead with qualifying step ${qualifyingStep} data`);
      await updateLead();
    } catch (error) {
      console.error('Error updating lead:', error);
      // Continue despite error - don't block the user's progress
    } finally {
      setIsUpdating(false);
    }
    
    // Track form step completion for analytics
    trackFormStepComplete(qualifyingStep, `Qualifying Question ${qualifyingStep}`);
    
    // Move to next step
    const nextQuestionStep = qualifyingStep + 1;
    setQualifyingStep(nextQuestionStep);
    updateFormData({ qualifyingQuestionStep: nextQuestionStep });
  };
  
  // Handle going to specific step
  const goToStep = (step) => {
    setQualifyingStep(step);
    updateFormData({ qualifyingQuestionStep: step });
  };
  
  // Handle completing the qualifying form
  const completeForm = async () => {
    // Update lead in Zoho one final time
    setIsUpdating(true);
    try {
      console.log('Finalizing lead data with qualifying form answers');
      await updateLead();
      console.log('Lead successfully updated with all qualifying information');
    } catch (error) {
      console.error('Error finalizing lead:', error);
      // Continue despite error - don't block the user's progress
    } finally {
      setIsUpdating(false);
    }
    
    // Track form completion for analytics
    trackFormStepComplete('complete', 'Qualifying Form Complete');
    
    // Move to thank you page
    nextStep();
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
                  updateFormData({ isPropertyOwner: e.target.value });
                  setSelectedOptionLR('left');
                  handleNextStep();
                }}
                disabled={isUpdating}
              >
                Yes
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="false"
                onClick={(e) => {
                  updateFormData({ isPropertyOwner: e.target.value });
                  setSelectedOptionLR('right');
                  handleNextStep();
                }}
                disabled={isUpdating}
              >
                No
              </button>
            </div>
          </div>
        );
        
      case 2:
        // Repairs needed question
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
                  updateFormData({ needsRepairs: e.target.value });
                  setSelectedOptionLR('left');
                  handleNextStep();
                }}
                disabled={isUpdating}
              >
                No
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="true"
                onClick={(e) => {
                  updateFormData({ needsRepairs: e.target.value });
                  setSelectedOptionLR('right');
                  handleNextStep();
                }}
                disabled={isUpdating}
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
                  updateFormData({ workingWithAgent: e.target.value });
                  setSelectedOptionLR('left');
                  handleNextStep();
                }}
                disabled={isUpdating}
              >
                No
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="true"
                onClick={(e) => {
                  updateFormData({ workingWithAgent: e.target.value });
                  setSelectedOptionLR('right');
                  handleNextStep();
                }}
                disabled={isUpdating}
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
                disabled={isUpdating}
              >
                {formData.homeType || "Select an option"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                <div
                  onClick={() => {
                    updateFormData({ homeType: "Single Family" });
                    setDropdownOpen(false);
                    handleNextStep();
                  }}
                >
                  &nbsp;&nbsp;Single Family
                </div>
                <div
                  onClick={() => {
                    updateFormData({ homeType: "Condo" });
                    setDropdownOpen(false);
                    handleNextStep();
                  }}
                >
                  &nbsp;&nbsp;Condo
                </div>
                <div
                  onClick={() => {
                    updateFormData({ homeType: "Townhouse" });
                    setDropdownOpen(false);
                    handleNextStep();
                  }}
                >
                  &nbsp;&nbsp;Townhouse
                </div>
                <div
                  onClick={() => {
                    updateFormData({ homeType: "Multi-Family" });
                    setDropdownOpen(false);
                    handleNextStep();
                  }}
                >
                  &nbsp;&nbsp;Multi-Family
                </div>
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
                disabled={isUpdating}
              />
            </div>
            <button
              className="qualifying-button"
              onClick={handleNextStep}
              disabled={isUpdating}
            >
              {isUpdating ? 'Processing...' : 'Next...'}
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
                disabled={isUpdating}
              />
            </div>
            <button
              className="qualifying-button"
              onClick={handleNextStep}
              disabled={isUpdating}
            >
              {isUpdating ? 'Processing...' : 'Next...'}
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
                disabled={isUpdating}
              >
                {formData.howSoonSell || "Select an option"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                <div
                  onClick={() => {
                    updateFormData({ howSoonSell: "ASAP" });
                    setDropdownOpen(false);
                    handleNextStep();
                  }}
                >
                  &nbsp;&nbsp;ASAP
                </div>
                <div
                  onClick={() => {
                    updateFormData({ howSoonSell: "0-3 months" });
                    setDropdownOpen(false);
                    handleNextStep();
                  }}
                >
                  &nbsp;&nbsp;0-3 months
                </div>
                <div
                  onClick={() => {
                    updateFormData({ howSoonSell: "3-6 months" });
                    setDropdownOpen(false);
                    handleNextStep();
                  }}
                >
                  &nbsp;&nbsp;3-6 months
                </div>
                <div
                  onClick={() => {
                    updateFormData({ howSoonSell: "6-12 months" });
                    setDropdownOpen(false);
                    handleNextStep();
                  }}
                >
                  &nbsp;&nbsp;6-12 months
                </div>
                <div
                  onClick={() => {
                    updateFormData({ howSoonSell: "not sure" });
                    setDropdownOpen(false);
                    handleNextStep();
                  }}
                >
                  &nbsp;&nbsp;Not sure
                </div>
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
                  updateFormData({ wantToSetAppointment: e.target.value });
                  setSelectedOptionLR('left');
                  completeForm();
                }}
                disabled={isUpdating}
              >
                No
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="true"
                onClick={(e) => {
                  updateFormData({ wantToSetAppointment: e.target.value });
                  setSelectedOptionLR('right');
                  goToStep(9);
                }}
                disabled={isUpdating}
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
                disabled={isUpdating}
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
                      updateFormData({ selectedAppointmentDate: date });
                      setDropdownOpen(false);
                      handleNextStep();
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
                disabled={isUpdating}
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
                      updateFormData({ selectedAppointmentTime: time });
                      setDropdownOpen(false);
                      completeForm();
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
              disabled={isUpdating}
            >
              {isUpdating ? 'Processing...' : 'Finish'}
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
    </div>
  );
}

export default QualifyingForm;