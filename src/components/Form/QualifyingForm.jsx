import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { trackFormStepComplete } from '../../services/analytics';

function QualifyingForm() {
  const { formData, updateFormData, nextStep, updateLead } = useFormContext();
  const [qualifyingStep, setQualifyingStep] = useState(formData.qualifyingQuestionStep || 1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOptionLR, setSelectedOptionLR] = useState('left');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
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
  
  // This function handles updating a field value and saving to Zoho
  const handleValueUpdate = async (fieldName, value) => {
    // Update form data locally first
    updateFormData({ [fieldName]: value });
    
    // Show updating state
    setIsUpdating(true);
    setUpdateMessage(`Saving ${fieldName}...`);
    
    try {
      console.log(`Updating Zoho with ${fieldName} = ${value}`);
      const success = await updateLead();
      
      if (success) {
        setUpdateMessage('Saved successfully!');
        setTimeout(() => setUpdateMessage(''), 1500);
        
        // Track analytics
        trackFormStepComplete(qualifyingStep, `Qualifying Question ${qualifyingStep}`);
        
        // Move to next step
        setTimeout(() => {
          const nextQuestionStep = qualifyingStep + 1;
          setQualifyingStep(nextQuestionStep);
          updateFormData({ qualifyingQuestionStep: nextQuestionStep });
        }, 1000);
      } else {
        setUpdateMessage('Save failed - continuing anyway');
        
        // Still move to next step
        setTimeout(() => {
          const nextQuestionStep = qualifyingStep + 1;
          setQualifyingStep(nextQuestionStep);
          updateFormData({ qualifyingQuestionStep: nextQuestionStep });
        }, 1500);
      }
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      setUpdateMessage('Error saving - continuing anyway');
      
      // Still move to next step
      setTimeout(() => {
        const nextQuestionStep = qualifyingStep + 1;
        setQualifyingStep(nextQuestionStep);
        updateFormData({ qualifyingQuestionStep: nextQuestionStep });
      }, 1500);
    } finally {
      // Reset updating state after a delay
      setTimeout(() => {
        setIsUpdating(false);
      }, 1500);
    }
  };
  
  // Handle completing the qualifying form
  const completeForm = async () => {
    // Update lead in Zoho one final time
    setIsUpdating(true);
    setUpdateMessage('Saving your responses...');
    
    try {
      console.log('Finalizing lead data with qualifying form answers');
      await updateLead();
      setUpdateMessage('All data saved successfully!');
    } catch (error) {
      console.error('Error finalizing lead:', error);
      setUpdateMessage('Unable to save some responses - continuing anyway');
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
        // Track form completion for analytics
        trackFormStepComplete('complete', 'Qualifying Form Complete');
        // Move to thank you page
        nextStep();
      }, 1500);
    }
  };
  
  // Helper function to go to a specific step
  const goToStep = (step) => {
    setQualifyingStep(step);
    updateFormData({ qualifyingQuestionStep: step });
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
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Yes'}
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="false"
                onClick={(e) => {
                  handleValueUpdate('isPropertyOwner', e.target.value);
                  setSelectedOptionLR('right');
                }}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'No'}
              </button>
            </div>
            {updateMessage && (
              <div style={{ 
                marginTop: '15px',
                color: '#3490d1',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {updateMessage}
              </div>
            )}
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
                  handleValueUpdate('needsRepairs', e.target.value);
                  setSelectedOptionLR('left');
                }}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'No'}
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="true"
                onClick={(e) => {
                  handleValueUpdate('needsRepairs', e.target.value);
                  setSelectedOptionLR('right');
                }}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Yes'}
              </button>
            </div>
            {updateMessage && (
              <div style={{ 
                marginTop: '15px',
                color: '#3490d1',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {updateMessage}
              </div>
            )}
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
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'No'}
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="true"
                onClick={(e) => {
                  handleValueUpdate('workingWithAgent', e.target.value);
                  setSelectedOptionLR('right');
                }}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Yes'}
              </button>
            </div>
            {updateMessage && (
              <div style={{ 
                marginTop: '15px',
                color: '#3490d1',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {updateMessage}
              </div>
            )}
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
                {isUpdating ? 'Saving...' : (formData.homeType || "Select an option")}
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
            {updateMessage && (
              <div style={{ 
                marginTop: '15px',
                color: '#3490d1',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {updateMessage}
              </div>
            )}
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
              onClick={() => handleValueUpdate('remainingMortgage', remainingMortgage)}
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Next...'}
            </button>
            {updateMessage && (
              <div style={{ 
                marginTop: '15px',
                color: '#3490d1',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {updateMessage}
              </div>
            )}
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
              onClick={() => handleValueUpdate('finishedSquareFootage', finishedSquareFootage)}
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Next...'}
            </button>
            {updateMessage && (
              <div style={{ 
                marginTop: '15px',
                color: '#3490d1',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {updateMessage}
              </div>
            )}
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
                {isUpdating ? 'Saving...' : (formData.howSoonSell || "Select an option")}
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
            {updateMessage && (
              <div style={{ 
                marginTop: '15px',
                color: '#3490d1',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {updateMessage}
              </div>
            )}
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
                  
                  setIsUpdating(true);
                  setUpdateMessage('Saving your choice...');
                  
                  updateLead().finally(() => {
                    setTimeout(() => {
                      setUpdateMessage('Saved!');
                      setTimeout(() => {
                        setIsUpdating(false);
                        completeForm();
                      }, 1000);
                    }, 1000);
                  });
                }}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'No'}
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="true"
                onClick={(e) => {
                  updateFormData({ wantToSetAppointment: e.target.value });
                  setSelectedOptionLR('right');
                  
                  setIsUpdating(true);
                  setUpdateMessage('Saving your choice...');
                  
                  updateLead().finally(() => {
                    setTimeout(() => {
                      setUpdateMessage('Saved!');
                      setTimeout(() => {
                        setIsUpdating(false);
                        goToStep(9);
                      }, 1000);
                    }, 1000);
                  });
                }}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Yes'}
              </button>
            </div>
            {updateMessage && (
              <div style={{ 
                marginTop: '15px',
                color: '#3490d1',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {updateMessage}
              </div>
            )}
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
                {isUpdating ? 'Saving...' : (formData.selectedAppointmentDate || "Select a Date")}
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
            {updateMessage && (
              <div style={{ 
                marginTop: '15px',
                color: '#3490d1',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {updateMessage}
              </div>
            )}
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
                {isUpdating ? 'Saving...' : (formData.selectedAppointmentTime || "Select a Time")}
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
                      
                      setIsUpdating(true);
                      setUpdateMessage('Saving appointment time...');
                      
                      updateLead().finally(() => {
                        setTimeout(() => {
                          setUpdateMessage('Appointment scheduled!');
                          setTimeout(() => {
                            setIsUpdating(false);
                            completeForm();
                          }, 1500);
                        }, 1000);
                      });
                    }}
                  >
                    &nbsp;&nbsp;{time}
                  </div>
                ))}
              </div>
            </div>
            {updateMessage && (
              <div style={{ 
                marginTop: '15px',
                color: '#3490d1',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {updateMessage}
              </div>
            )}
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
              {isUpdating ? 'Finalizing...' : 'Finish'}
            </button>
            {updateMessage && (
              <div style={{ 
                marginTop: '15px',
                color: '#3490d1',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {updateMessage}
              </div>
            )}
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