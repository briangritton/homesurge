import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { trackFormStepComplete, trackFormError } from '../../services/analytics';
import { trackZohoConversion } from '../../services/zoho';

function QualifyingForm() {
  const { formData, updateFormData, nextStep, updateLead, leadId } = useFormContext();
  const [qualifyingStep, setQualifyingStep] = useState(formData.qualifyingQuestionStep || 1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOptionLR, setSelectedOptionLR] = useState('left');
  const [propertyOwnerSelection, setPropertyOwnerSelection] = useState('left');
  const [repairsSelection, setRepairsSelection] = useState('left');
  const [timelineSelection, setTimelineSelection] = useState('left');
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
        case 9:
          currentSelection = timelineSelection;
          break;
        default:
          currentSelection = selectedOptionLR;
      }
      
      // Apply the appropriate classes
      if (currentSelection === 'left') {
        toggleLeftRef.current.className = 'qualifying-toggle-selected-left';
        toggleRightRef.current.className = 'qualifying-toggle-deselected-right';
      } else {
        toggleLeftRef.current.className = 'qualifying-toggle-deselected-left';
        toggleRightRef.current.className = 'qualifying-toggle-selected-right';
      }
    }
  }, [qualifyingStep, propertyOwnerSelection, repairsSelection, timelineSelection, selectedOptionLR]);
  
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
  
  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Update form data with qualifying info
    updateFormData({
      qualifyingQuestionStep: 10, // Mark as completed
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
        
        // Proceed to thank you page
        nextStep();
      } else {
        console.error('Failed to update lead with qualifying data');
        // Still proceed to thank you page even on error
        nextStep();
      }
    } catch (error) {
      console.error('Error in final submission:', error);
      // Still proceed to thank you page even on error
      nextStep();
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
    
    // Update the appropriate state based on the field
    switch(field) {
      case 'isPropertyOwner':
        setPropertyOwnerSelection(value === 'true' ? 'left' : 'right');
        break;
      case 'needsRepairs':
        setRepairsSelection(value === 'true' ? 'right' : 'left');
        setSelectedOptionLR(value === 'true' ? 'right' : 'left');
        break;
      case 'timelineMotivation':
        setTimelineSelection(value === 'immediately' ? 'left' : 'right');
        break;
      default:
        setSelectedOptionLR(value === 'true' ? 'left' : 'right');
    }
  };
  
  // Handle home type selection
  const handleHomeTypeSelect = (type) => {
    // Close dropdown
    setDropdownOpen(false);
    
    // Use the value update method for consistency
    handleValueUpdate('homeType', type);
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
                  handleToggleSelect('isPropertyOwner', e.target.value);
                }}
              >
                Yes
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="false"
                onClick={(e) => {
                  handleToggleSelect('isPropertyOwner', e.target.value);
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
                  // Make sure this properly updates the value
                  handleToggleSelect('needsRepairs', e.target.value);
                }}
              >
                No
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="true"
                onClick={(e) => {
                  // Make sure this properly updates the value
                  handleToggleSelect('needsRepairs', e.target.value);
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
                  handleToggleSelect('workingWithAgent', e.target.value);
                }}
              >
                No
              </button>
              <button
                className="qualifying-toggle-deselected-right"
                ref={toggleRightRef}
                value="true"
                onClick={(e) => {
                  handleToggleSelect('workingWithAgent', e.target.value);
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
              onClick={() => handleValueUpdate('basementSquareFootage', basementSquareFootage)}
            >
              Next
            </button>
          </div>
        );
        
      case 8:
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
        
      case 9:
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
                className="qualifying-toggle-deselected-right"
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
                  goToStep(10);
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
                      
                      // Track analytics with campaign data
                      trackFormStepComplete(10, `Selected Date: ${date}`, formData);
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
                      updateFormData({ 
                        selectedAppointmentTime: appointmentTime,
                        wantToSetAppointment: 'true' // Ensure this is explicitly set to 'true'
                      });
                      setDropdownOpen(false);
                      
                      // Track analytics with campaign data
                      trackFormStepComplete(11, `Selected Time: ${time}`, formData);
                      
                      // Update Zoho with appointment time
                      updateLead().then(success => {
                        console.log('Appointment time saved to Zoho:', success ? 'Success' : 'Failed');
                        
                        // Track appointment conversion
                        if (success && leadId && !leadId.startsWith('temp_')) {
                          trackZohoConversion('appointmentSet', leadId, 'Appointment Set')
                            .then(tracked => {
                              console.log('Appointment conversion tracked:', tracked ? 'Success' : 'Failed');
                            })
                            .catch(error => {
                              console.error('Error tracking appointment conversion:', error);
                            });
                        }
                        
                        // Submit form data
                        handleSubmit();
                      });
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