import "./MetaRetargetFormMain.css";
import MetaRetargetHeroSection1 from "./MetaRetargetHeroSection1";
import MetaRetargetHeroSectionTY from "./MetaRetargetHeroSectionTY";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import ReactGA from "react-ga";
import ReactPixel from "react-facebook-pixel";

let windowViewCount = 0;
function MetaRetargetFormMain() {
  const initGA = () => {
    ReactGA.initialize("G-L961YM0GEN");
  };

  const GApageView = (page) => {
    ReactGA.pageview(page);
  };

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    ReactPixel.init("268197213521133");
    ReactPixel.pageView();
  }, []);

  // // make a variable with a 50% randomize to set the form version
  // let formVersion = Math.random() < 0.5 ? 1 : 1.2;

  const [formStep, setFormStep] = useState(1);

  const formData = useSelector((state) => state.formData);

  const nextStep = (n) => {
    setFormStep(n);
  };

  const stepDisplay = () => {
    // -------------- GENERIC FUNNEL START --------------------

    if (formStep === 1) {
      return (
        <MetaRetargetHeroSection1 GApageView={GApageView} nextStep={nextStep} />
      );
    }

    if (formStep === 2) {
      return (
        <MetaRetargetHeroSectionTY nextStep={nextStep} formData={formData} />
      );
    }

    // -------------- GENERIC FUNNEL END --------------------
  };

  return <div className="MetaRetargetFormMain">{stepDisplay()}</div>;
}

export default MetaRetargetFormMain;
