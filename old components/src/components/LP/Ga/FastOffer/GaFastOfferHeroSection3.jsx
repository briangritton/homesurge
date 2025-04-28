import "./GaFastOfferHeroSectionQualify.css";
import { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import TagManager from "react-gtm-module";

import { set } from "react-ga";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import axios from "axios";

import {
  formDataChanged,
  formSubmitted,
  leadDataChanged,
  recordChanged,
} from "../../../../formSlice";
import { buildQueries, fireEvent } from "@testing-library/react";
const tagManagerArgs = {
  gtmId: "GTM-N4XT3K3",
};
let windowViewCount = 0;
TagManager.initialize(tagManagerArgs);

function GaFastOfferHeroSection3(props) {
  useEffect(() => {
    ++windowViewCount;
    if (windowViewCount <= 1) {
      window.dataLayer.push({
        event: "GaFastOfferHeroSection3PageView",
        title: "GaFastOfferHeroSection3.js",
      });
    }
  }, []);

  const formData = useSelector((state) => state.form);
  const dispatch = useDispatch();

  // ------------------- start redux state variables --------------------
  const name = useSelector((state) => state.form.name);
  const isPropertyOwner = useSelector((state) => state.form.isPropertyOwner);
  const needsRepairs = useSelector((state) => state.form.needsRepairs);
  const workingWithAgent = useSelector((state) => state.form.workingWithAgent);
  const homeType = useSelector((state) => state.form.homeType);
  const bedrooms = useSelector((state) => state.form.bedrooms);
  const bathrooms = useSelector((state) => state.form.bathrooms);
  const floors = useSelector((state) => state.form.floors);
  const howSoonSell = useSelector((state) => state.form.howSoonSell);
  const reasonForSelling = useSelector((state) => state.form.reasonForSelling);
  const garage = useSelector((state) => state.form.garage);
  const garageCars = useSelector((state) => state.form.garageCars);
  const hasHoa = useSelector((state) => state.form.hasHoa);
  const hasSolar = useSelector((state) => state.form.hasSolar);
  const planningToBuy = useSelector((state) => state.form.planningToBuy);
  const septicOrSewer = useSelector((state) => state.form.septicOrSewer);
  const knownIssues = useSelector((state) => state.form.knownIssues);
  const selectedAppointmentDate = useSelector(
    (state) => state.form.selectedAppointmentDate
  );
  const selectedAppointmentTime = useSelector(
    (state) => state.form.selectedAppointmentTime
  );

  const qualifyingQuestionStep = useSelector(
    (state) => state.form.qualifyingQuestionStep
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const getNextSevenDays = () => {
    const result = [];
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const dayName = daysOfWeek[nextDate.getDay()];
      const date = nextDate.getDate();
      const month = nextDate.getMonth() + 1; // Months are 0-based in JavaScript
      result.push(`${dayName}, ${month}/${date}`);
    }
    return result;
  };

  const getTimeSlots = () => {
    const timeSlots = [];
    for (let i = 8; i <= 20; i++) {
      const hour = i <= 12 ? i : i - 12;
      const period = i < 12 ? "AM" : "PM";
      timeSlots.push(`${hour}:00 ${period}`);
    }
    return timeSlots;
  };
  const availableDates = getNextSevenDays();
  const availableTimes = getTimeSlots();

  // not creating slider variables from redux state because they are being manipulated and set in this component before dispatching to matching redux state variable
  // ------------------- start remaining mortgage handling --------------------
  const [remainingMortgage, setRemainingMortgage] = useState(100000);

  const handleSliderChangeMortgage = (e) => {
    const selectedValue = e.target.value;
    // display slider in unites of 10,000 if the e.target value is greater than 10000
    if (selectedValue >= 10000) {
      setRemainingMortgage(Math.round(selectedValue / 10000) * 10000);
    } else {
      setRemainingMortgage(selectedValue);
    }
    dispatch(formDataChanged({ remainingMortgage: selectedValue }));
  };
  const displayMortgageValue =
    remainingMortgage >= 1000000
      ? remainingMortgage.toLocaleString() + "+"
      : remainingMortgage.toLocaleString();
  // ------------------- end remaining mortgage handling --------------------

  // ------------------- start finished square footage handling --------------------

  const [finishedSquareFootage, setFinishedSquareFootage] = useState(1000);

  const handleSliderChangeSquareFootage = (e) => {
    const selectedValue = e.target.value;
    // display slider in unites of 100 if the e.target value is greater than 10000
    if (selectedValue >= 50) {
      setFinishedSquareFootage(Math.round(selectedValue / 250) * 250);
    }
    dispatch(formDataChanged({ finishedSquareFootage: selectedValue }));
  };
  const displayFinishedSquareFootage =
    finishedSquareFootage >= 10000
      ? finishedSquareFootage.toLocaleString() + "+ sq/ft"
      : finishedSquareFootage.toLocaleString() + " sq/ft";
  // ------------------- end finished square footage handling --------------------

  // ------------------- start basement square footage handling --------------------

  const [basementSquareFootage, setBasementSquareFootage] = useState(1000);

  const handleSliderChangeBasementSquareFootage = (e) => {
    const selectedValue = e.target.value;
    // display slider in unites of 100 if the e.target value is greater than 10000
    if (selectedValue >= 50) {
      setBasementSquareFootage(Math.round(selectedValue / 250) * 250);
    }
    dispatch(formDataChanged({ basementSquareFootage: selectedValue }));
  };
  const displayBasementSquareFootage =
    basementSquareFootage >= 10000
      ? basementSquareFootage.toLocaleString() + "+ sq/ft"
      : basementSquareFootage.toLocaleString() + " sq/ft";
  // ------------------- end finished square footage handling --------------------

  // --------------------- start all refs -----------------------------------
  const toggleLeftRef = useRef(null);
  const toggleRightRef = useRef(null);
  const remainingMortgageRef = useRef(null);
  const MortgageSliderRef = useRef(null);
  const finishedSquareFootageSliderRef = useRef(null);
  const basementSquareFootageSliderRef = useRef(null);
  // --------------------- end all refs -----------------------------------

  const [selectedOptionLR, setSelectedOptionLR] = useState("left");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleQuestionChange = (questionName, event) => {
    const selectedValue = event.target.value;

    // Dispatch the formDataChanged action with the dynamically specified question name
    dispatch(formDataChanged({ [questionName]: selectedValue }));
  };

  const handleQualifyingQuestionStep = (value) => {
    // if value exists set qualifyingQuestionStep to value
    // else increment qualifyingQuestionStep by 1
    if (value) {
      dispatch(formDataChanged({ qualifyingQuestionStep: value }));
    } else {
      dispatch(
        leadDataChanged({ qualifyingQuestionStep: qualifyingQuestionStep + 1 })
      );
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    dispatch(formDataChanged({ selectedAppointmentDate: date }));
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    dispatch(formDataChanged({ selectedAppointmentTime: time }));
  };

  useEffect(() => {
    if (toggleLeftRef.current && toggleRightRef.current) {
      if (selectedOptionLR === "left") {
        toggleLeftRef.current.className =
          "hero-form-qualify-individual-answer-toggle-selected-left";
        toggleRightRef.current.className =
          "hero-form-qualify-individual-answer-toggle-deselected-right";
      } else {
        toggleLeftRef.current.className =
          "hero-form-qualify-individual-answer-toggle-deselected-left";
        toggleRightRef.current.className =
          "hero-form-qualify-individual-answer-toggle-selected-right";
      }
    }
  }, [selectedOptionLR]);

  useEffect(() => {
    // console.log("qualifyingQuestionStep", qualifyingQuestionStep);
    // window.scrollTo(0, 0);
  }, [qualifyingQuestionStep]);

  return (
    <div className="GaFastOfferHeroSectionQualify">
      {/* <div className="hero-qualify-headline">
        Last step! Click to confirm your project details
      </div> */}

      <div className="hero-qualify-form-container">
        {qualifyingQuestionStep === 0 ? (
          <>
            <div className="hero-form-qualify-individual-option-column">
              <div className="hero-form-qualify-individual-question-column">
                What is the owners name?
              </div>

              <input
                className="hero-form-qualify-text-input"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  handleQuestionChange("name", e);
                }}
              />
            </div>
            <div className="hero-qualify-button-positioner">
              <button
                className="hero-qualify-form-button"
                onClick={() => handleQualifyingQuestionStep()}
              >
                Next...
              </button>
            </div>
          </>
        ) : qualifyingQuestionStep === 1 ? (
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Are you the property owner?
            </div>

            <div className="hero-form-qualify-individual-answer">
              <div className="hero-form-qualify-individual-answer-toggle-container">
                <button
                  className="hero-form-qualify-individual-answer-toggle-selected-left"
                  ref={toggleLeftRef}
                  value="true"
                  // onClick  setIsPropertyOwner(e.target.value) and set handleQualifyingQuestionStep(2)
                  onClick={(e) => {
                    handleQuestionChange("isPropertyOwner", e);
                    handleQualifyingQuestionStep();

                    setSelectedOptionLR("left");
                  }}
                >
                  Yes
                </button>
                <button
                  className="hero-form-qualify-individual-answer-toggle-deselected-right"
                  ref={toggleRightRef}
                  value="false"
                  onClick={(e) => {
                    handleQuestionChange("isPropertyOwner", e);
                    handleQualifyingQuestionStep();

                    setSelectedOptionLR("right");
                  }}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 2 ? (
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Does the property need any major repairs?
            </div>

            <div className="hero-form-qualify-individual-answer">
              <div className="hero-form-qualify-individual-answer-toggle-container">
                <button
                  className="hero-form-qualify-individual-answer-toggle-selected-left"
                  ref={toggleLeftRef}
                  value="false"
                  onClick={(e) => {
                    setSelectedOptionLR("left");

                    handleQuestionChange("needsRepairs", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  No
                </button>
                <button
                  className="hero-form-qualify-individual-answer-toggle-deselected-right"
                  ref={toggleRightRef}
                  value="true"
                  onClick={(e) => {
                    setSelectedOptionLR("right");

                    handleQuestionChange("needsRepairs", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 3 ? (
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Are you working with a real estate agent?
            </div>

            <div className="hero-form-qualify-individual-answer">
              <div className="hero-form-qualify-individual-answer-toggle-container">
                <button
                  className="hero-form-qualify-individual-answer-toggle-selected-left"
                  ref={toggleLeftRef}
                  value="false"
                  onClick={(e) => {
                    setSelectedOptionLR("left");

                    handleQuestionChange("workingWithAgent", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  No
                </button>
                <button
                  className="hero-form-qualify-individual-answer-toggle-deselected-right"
                  ref={toggleRightRef}
                  value="true"
                  onClick={(e) => {
                    setSelectedOptionLR("left");

                    handleQuestionChange("workingWithAgent", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 4 ? (
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              What type of property is it?
            </div>

            <div className="dropdown">
              <button
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {/* // homeType || "Select an option" */}
                {homeType || "Select an option"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                <div
                  value="Single Family"
                  onClick={(e) => {
                    handleQuestionChange("homeType", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;Single Family
                </div>
                <div
                  value="Condo"
                  onClick={(e) => {
                    handleQuestionChange("homeType", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;Condo
                </div>
                <div
                  value="Townhouse"
                  onClick={(e) => {
                    handleQuestionChange("homeType", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;Townhouse
                </div>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 5 ? (
          <>
            <div className="hero-form-qualify-individual-option-column">
              <div className="hero-form-qualify-individual-question">
                What is your remaining mortgage amount?
              </div>

              <div className="hero-form-qualify-slider-container">
                <div className="hero-form-qualify-slider-container-text">
                  ${displayMortgageValue}
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  value={remainingMortgage}
                  className="hero-form-qualify-slider"
                  id="myRange"
                  ref={MortgageSliderRef}
                  onChange={handleSliderChangeMortgage}
                />

                {/* Display the selected value */}
              </div>
            </div>

            <div className="hero-qualify-button-positioner">
              <button
                className="hero-qualify-form-button"
                onClick={() => handleQualifyingQuestionStep()}
              >
                Next...
              </button>
            </div>
          </>
        ) : qualifyingQuestionStep === 6 ? (
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Number of bedrooms?
            </div>

            <div className="dropdown">
              <button
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {/* // homeType || "Select an option" */}
                {homeType || "Select an option"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                <div
                  value="1"
                  onClick={(e) => {
                    handleQuestionChange("bedrooms", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;1
                </div>
                <div
                  value="2"
                  onClick={(e) => {
                    handleQuestionChange("bedrooms", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;2
                </div>
                <div
                  value="3"
                  onClick={(e) => {
                    handleQuestionChange("bedrooms", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;3
                </div>
                <div
                  value="4"
                  onClick={(e) => {
                    handleQuestionChange("bedrooms", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;4
                </div>
                <div
                  value="5"
                  onClick={(e) => {
                    handleQuestionChange("bedrooms", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;5
                </div>
                <div
                  value="6+"
                  onClick={(e) => {
                    handleQuestionChange("bedrooms", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;6+
                </div>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 7 ? (
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Number of bathrooms?
            </div>

            <div className="dropdown">
              <button
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {/* // homeType || "Select an option" */}
                {homeType || "Select an option"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                <div
                  value="1"
                  onClick={(e) => {
                    handleQuestionChange("bathrooms", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;1
                </div>
                <div
                  value="2"
                  onClick={(e) => {
                    handleQuestionChange("bathrooms", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;2
                </div>
                <div
                  value="3"
                  onClick={(e) => {
                    handleQuestionChange("bathrooms", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;3
                </div>
                <div
                  value="4"
                  onClick={(e) => {
                    handleQuestionChange("bathrooms", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;4
                </div>
                <div
                  value="5"
                  onClick={(e) => {
                    handleQuestionChange("bathrooms", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;5
                </div>
                <div
                  value="6+"
                  onClick={(e) => {
                    handleQuestionChange("bathrooms", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;6+
                </div>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 8 ? (
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              How many floor does your home have?
            </div>

            <div className="dropdown">
              <button
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {/* // homeType || "Select an option" */}
                {homeType || "Select an option"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                <div
                  value="1"
                  onClick={(e) => {
                    handleQuestionChange("floors", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;1
                </div>
                <div
                  value="2"
                  onClick={(e) => {
                    handleQuestionChange("floors", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;2
                </div>
                <div
                  value="3"
                  onClick={(e) => {
                    handleQuestionChange("floors", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;3
                </div>
                <div
                  value="4+"
                  onClick={(e) => {
                    handleQuestionChange("floors", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;4+
                </div>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 9 ? (
          // finishedSquareFootage SLIDER
          <>
            <div className="hero-form-qualify-individual-option-column">
              <div className="hero-form-qualify-individual-question">
                What is your finished square footage?
              </div>

              <div className="hero-form-qualify-slider-container">
                <div className="hero-form-qualify-slider-container-text">
                  {displayFinishedSquareFootage}
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  value={finishedSquareFootage}
                  className="hero-form-qualify-slider"
                  id="myRange"
                  ref={finishedSquareFootageSliderRef}
                  onChange={handleSliderChangeSquareFootage}
                />

                {/* Display the selected value */}
              </div>
            </div>

            <div className="hero-qualify-button-positioner">
              <button
                className="hero-qualify-form-button"
                onClick={() => handleQualifyingQuestionStep()}
              >
                Next...
              </button>
            </div>
          </>
        ) : qualifyingQuestionStep === 10 ? (
          // basementSquareFootage SLIDER
          <>
            <div className="hero-form-qualify-individual-option-column">
              <div className="hero-form-qualify-individual-question">
                What is your unfinished basement square footage?
              </div>

              <div className="hero-form-qualify-slider-container">
                <div className="hero-form-qualify-slider-container-text">
                  {displayBasementSquareFootage}
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  value={basementSquareFootage}
                  className="hero-form-qualify-slider"
                  id="myRange"
                  ref={basementSquareFootageSliderRef}
                  onChange={handleSliderChangeBasementSquareFootage}
                />

                {/* Display the selected value */}
              </div>
            </div>

            <div className="hero-qualify-button-positioner">
              <button
                className="hero-qualify-form-button"
                onClick={() => handleQualifyingQuestionStep()}
              >
                Next...
              </button>
            </div>
          </>
        ) : qualifyingQuestionStep === 11 ? (
          // howSoonSell DROPDOWN

          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              How soon do you want to sell?
            </div>

            <div className="dropdown">
              <button
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {howSoonSell || "Select an option"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                <div
                  value="ASAP"
                  onClick={(e) => {
                    handleQuestionChange("howSoonSell", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;ASAP
                </div>
                <div
                  value="0-3 months"
                  onClick={(e) => {
                    handleQuestionChange("howSoonSell", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;0-3 months
                </div>
                <div
                  value="3-6 months"
                  onClick={(e) => {
                    handleQuestionChange("howSoonSell", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;3-6 months
                </div>
                <div
                  value="6-12 months"
                  onClick={(e) => {
                    handleQuestionChange("howSoonSell", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;6-12 months
                </div>
                <div
                  value="not sure"
                  onClick={(e) => {
                    handleQuestionChange("howSoonSell", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;not sure
                </div>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 12 ? (
          // reasonForSelling DROPDOWN
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Why are you selling?
            </div>

            <div className="dropdown">
              <button
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {reasonForSelling || "Select an option"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                <div
                  value="upgrading"
                  onClick={(e) => {
                    handleQuestionChange("reasonForSelling", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;Upgrading home
                </div>
                <div
                  value="downsizing"
                  onClick={(e) => {
                    handleQuestionChange("reasonForSelling", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;Downsizing
                </div>
                <div
                  value="relocating"
                  onClick={(e) => {
                    handleQuestionChange("reasonForSelling", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;Relocating
                </div>
                <div
                  value="divorce"
                  onClick={(e) => {
                    handleQuestionChange("reasonForSelling", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;Divorce
                </div>
                <div
                  value="forclosure"
                  onClick={(e) => {
                    handleQuestionChange("reasonForSelling", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;Forclosure
                </div>
                <div
                  value="inherited"
                  onClick={(e) => {
                    handleQuestionChange("reasonForSelling", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;Inherited
                </div>
                <div
                  value="other"
                  onClick={(e) => {
                    handleQuestionChange("reasonForSelling", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;Other
                </div>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 13 ? (
          // garage BUTTON
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Do you have a garage?
            </div>

            <div className="hero-form-qualify-individual-answer">
              <div className="hero-form-qualify-individual-answer-toggle-container">
                <button
                  className="hero-form-qualify-individual-answer-toggle-selected-left"
                  ref={toggleLeftRef}
                  value="false"
                  onClick={(e) => {
                    setSelectedOptionLR("left");

                    handleQuestionChange("garage", e);
                    handleQualifyingQuestionStep(15);
                  }}
                >
                  No
                </button>
                <button
                  className="hero-form-qualify-individual-answer-toggle-deselected-right"
                  ref={toggleRightRef}
                  value="true"
                  onClick={(e) => {
                    setSelectedOptionLR("right");

                    handleQuestionChange("garage", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 14 ? (
          // garageCars dropdown
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              How many cars can fit in your garage?
            </div>

            <div className="dropdown">
              <button
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {/* // homeType || "Select an option" */}
                {garageCars || "Select an option"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                <div
                  value="1"
                  onClick={(e) => {
                    handleQuestionChange("garageCars", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;1
                </div>
                <div
                  value="2"
                  onClick={(e) => {
                    handleQuestionChange("garageCars", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;2
                </div>
                <div
                  value="3"
                  onClick={(e) => {
                    handleQuestionChange("garageCars", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;3
                </div>
                <div
                  value="4+"
                  onClick={(e) => {
                    handleQuestionChange("garageCars", e);
                    setDropdownOpen(false);
                    handleQualifyingQuestionStep();
                  }}
                >
                  &nbsp;&nbsp;4+
                </div>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 15 ? (
          // hasHoa BUTTON
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Do you have an HOA?
            </div>

            <div className="hero-form-qualify-individual-answer">
              <div className="hero-form-qualify-individual-answer-toggle-container">
                <button
                  className="hero-form-qualify-individual-answer-toggle-selected-left"
                  ref={toggleLeftRef}
                  value="false"
                  onClick={(e) => {
                    setSelectedOptionLR("left");

                    handleQuestionChange("hasHoa", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  No
                </button>
                <button
                  className="hero-form-qualify-individual-answer-toggle-deselected-right"
                  ref={toggleRightRef}
                  value="true"
                  onClick={(e) => {
                    setSelectedOptionLR("right");

                    handleQuestionChange("hasHoa", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 16 ? (
          // hasSolar BUTTON
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Does your home have solar panels?
            </div>

            <div className="hero-form-qualify-individual-answer">
              <div className="hero-form-qualify-individual-answer-toggle-container">
                <button
                  className="hero-form-qualify-individual-answer-toggle-selected-left"
                  ref={toggleLeftRef}
                  value="false"
                  onClick={(e) => {
                    setSelectedOptionLR("left");

                    handleQuestionChange("hasSolar", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  No
                </button>
                <button
                  className="hero-form-qualify-individual-answer-toggle-deselected-right"
                  ref={toggleRightRef}
                  value="true"
                  onClick={(e) => {
                    setSelectedOptionLR("right");

                    handleQuestionChange("hasSolar", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 17 ? (
          // planningToBuy BUTTON
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Are you planning to buy a home?
            </div>

            <div className="hero-form-qualify-individual-answer">
              <div className="hero-form-qualify-individual-answer-toggle-container">
                <button
                  className="hero-form-qualify-individual-answer-toggle-selected-left"
                  ref={toggleLeftRef}
                  value="false"
                  onClick={(e) => {
                    setSelectedOptionLR("left");

                    handleQuestionChange("planningToBuy", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  No
                </button>
                <button
                  className="hero-form-qualify-individual-answer-toggle-deselected-right"
                  ref={toggleRightRef}
                  value="true"
                  onClick={(e) => {
                    setSelectedOptionLR("right");

                    handleQuestionChange("planningToBuy", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 18 ? (
          // septicOrSewer BUTTON
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Do you have septic or sewer?
            </div>

            <div className="hero-form-qualify-individual-answer">
              <div className="hero-form-qualify-individual-answer-toggle-container">
                <button
                  className="hero-form-qualify-individual-answer-toggle-selected-left"
                  ref={toggleLeftRef}
                  value="septic"
                  onClick={(e) => {
                    setSelectedOptionLR("left");

                    handleQuestionChange("septicOrSewer", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  Septic
                </button>
                <button
                  className="hero-form-qualify-individual-answer-toggle-deselected-right"
                  ref={toggleRightRef}
                  value="sewer"
                  onClick={(e) => {
                    setSelectedOptionLR("right");

                    handleQuestionChange("septicOrSewer", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  Sewer
                </button>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 19 ? (
          // knownIssues BUTTON
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Does your home have any known issues or necessary repairs?
            </div>

            <div className="hero-form-qualify-individual-answer">
              <div className="hero-form-qualify-individual-answer-toggle-container">
                <button
                  className="hero-form-qualify-individual-answer-toggle-selected-left"
                  ref={toggleLeftRef}
                  value="false"
                  onClick={(e) => {
                    setSelectedOptionLR("left");

                    handleQuestionChange("knownIssues", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  No
                </button>
                <button
                  className="hero-form-qualify-individual-answer-toggle-deselected-right"
                  ref={toggleRightRef}
                  value="true"
                  onClick={(e) => {
                    setSelectedOptionLR("right");

                    handleQuestionChange("knownIssues", e);
                    handleQualifyingQuestionStep();
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 20 ? (
          // knownIssues BUTTON
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Do you want to set a virtual appointment? It takes a few minutes,
              and we may be able to make you a cash offer on the spot.
            </div>

            <div className="hero-form-qualify-individual-answer">
              <div className="hero-form-qualify-individual-answer-toggle-container">
                <button
                  className="hero-form-qualify-individual-answer-toggle-selected-left"
                  ref={toggleLeftRef}
                  value="false"
                  onClick={(e) => {
                    setSelectedOptionLR("left");

                    handleQuestionChange("wantToSetAppointment", e);
                    handleQualifyingQuestionStep(23);
                  }}
                >
                  No
                </button>
                <button
                  className="hero-form-qualify-individual-answer-toggle-deselected-right"
                  ref={toggleRightRef}
                  value="true"
                  onClick={(e) => {
                    setSelectedOptionLR("right");

                    handleQuestionChange("wantToSetAppointment", e);
                    handleQualifyingQuestionStep(21);
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 21 ? (
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Select your preferred appointment date.
            </div>

            <div className="dropdown">
              <button
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {/* // homeType || "Select an option" */}
                {selectedDate || "Select a Date"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                {availableDates.map((date, index) => (
                  <div
                    key={index}
                    value={date}
                    onClick={() => {
                      handleDateChange(date);
                      setDropdownOpen(false);
                      handleQualifyingQuestionStep();
                    }}
                  >
                    &nbsp;&nbsp;{date}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 22 ? (
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Select your preferred appointment time on{" "}
              {selectedAppointmentDate}
            </div>

            <div className="dropdown">
              <button
                className="dropbtn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {/* // homeType || "Select an option" */}
                {selectedTime || "Select a Time"}
              </button>
              <div
                className="dropdown-content"
                style={{ display: dropdownOpen ? "block" : "none" }}
              >
                {availableTimes.map((time, index) => (
                  <div
                    key={index}
                    value={time}
                    onClick={() => {
                      handleTimeChange(time);
                      setDropdownOpen(false);
                      handleQualifyingQuestionStep();
                    }}
                  >
                    &nbsp;&nbsp;{time}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : qualifyingQuestionStep === 23 ? (
          <div className="hero-form-qualify-individual-option-column">
            <div className="hero-form-qualify-individual-question">
              Thanks for your detailed responses! Check for a text in the next
              few minutes, and we'll start preparing your official offer.
              <br></br>
              <br></br> If you have any questions or you don't hear from us in
              the next few minutes, please call us at 720-336-3123. We look
              forward to helping you sell your home!
            </div>
          </div>
        ) : (
          <div>No more questions</div>
        )}
      </div>
    </div>
  );
}

export default GaFastOfferHeroSection3;
