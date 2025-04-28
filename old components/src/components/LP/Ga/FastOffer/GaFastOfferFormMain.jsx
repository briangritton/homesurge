import "./GaFastOfferFormMain.css";

import GaFastOfferHeroSectionTY from "./GaFastOfferHeroSectionTY";
import GaFastOfferHeroSection1v2 from "./GaFastOfferHeroSection1v2";
// import GaFastOfferHeroSection2 from "./GaFastOfferHeroSection2";
import GaFastOfferHeroSection3 from "./GaFastOfferHeroSection3";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import ReactGA from "react-ga";
import ReactPixel from "react-facebook-pixel";

let windowViewCount = 0;
function GaFastOfferFormMain() {
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

  const [formStep, setFormStep] = useState(1);

  const formData = useSelector((state) => state.formData);

  const nextStep = (n) => {
    setFormStep(n);
  };

  const stepDisplay = () => {
    // -------------- GENERIC FUNNEL START --------------------

    if (formStep === 1) {
      return (
        <GaFastOfferHeroSection1v2
          GApageView={GApageView}
          nextStep={nextStep}
        />
      );
    }
    // else if (formStep === 2) {
    //   return <GaFastOfferHeroSection2 nextStep={nextStep} />;
    // }
    else if (formStep === 2) {
      return <GaFastOfferHeroSectionTY nextStep={nextStep} />;
    } else if (formStep === 3) {
      return <GaFastOfferHeroSection3 nextStep={nextStep} />;
    }

    // -------------- GENERIC FUNNEL END --------------------
  };

  return <div className="GaFastOfferFormMain">{stepDisplay()}</div>;
}

export default GaFastOfferFormMain;
