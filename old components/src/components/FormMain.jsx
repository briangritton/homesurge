// google cloud maps api credentials
// AIzaSyAtMetoPNpXbwJW70SiG6aD-sXI6Dxav9Q

import "./FormMain.css";
import HeroSection1 from "./HeroSection1";

import HeroSection3 from "./HeroSection3";
import HeroSection3v2 from "./HeroSection3v2";
import HeroSectionTY from "./HeroSectionTY";
import React, { useState, useEffect } from "react";

import ReactGA from "react-ga";
import ReactPixel from "react-facebook-pixel";

let windowViewCount = 0;
function FormMain() {
  const queryParams = new URLSearchParams(window.location.search);
  const campaignidnumber = queryParams.get("campaignid");
  const adgroupidnumber = queryParams.get("adgroupid");
  const keyword = queryParams.get("keyword");
  const device = queryParams.get("device");
  const gclid = queryParams.get("gclid");
  // console.log(device, campaignid, adgroupid, keyword, gclid);

  const [clickData, setClickData] = useState({
    campaignid: campaignidnumber,
    adgroupid: adgroupidnumber,
    keyword: keyword,
    device: device,
    gclid: gclid,
  });

  const parseClickData = () => {
    //  ------------ set campaign names -------------------
    if (clickData.campaignid === "20196006239") {
      // alert('set LocalQuotesComparisonMobile')
      setClickData({ ...clickData, campaignid: "SellForCashFormSubmitMOBILE" });
    }
    if (clickData.campaignid === "20224227794") {
      // alert('set LocalQuotesComparisonDesktop')
      setClickData({
        ...clickData,
        campaignid: "SellForCashFormSubmitDESKTOP",
      });
    }
    //  ------------ set adgroup names -------------------
    if (clickData.adgroupid === "149782006756") {
      setClickData({
        ...clickData,
        adgroupid: "MobileSellForCashOrFastIntentPhrase",
      });
    }
    if (clickData.adgroupid === "148370567926") {
      setClickData({
        ...clickData,
        adgroupid: "MobileCheckHomeValueIntentPhrase",
      });
    }
    if (clickData.adgroupid === "150569748140") {
      setClickData({
        ...clickData,
        adgroupid: "MobileRefinanceOrCashOutIntentPhrase",
      });
    }
    if (clickData.adgroupid === "149591994853") {
      setClickData({
        ...clickData,
        adgroupid: "DesktopCheckHomeValueIntentPhrase",
      });
    }
    if (clickData.adgroupid === "149591994893") {
      setClickData({
        ...clickData,
        adgroupid: "DesktopSellForCashOrFastIntentPhrase",
      });
    }
    if (clickData.adgroupid === "149591994933") {
      setClickData({
        ...clickData,
        adgroupid: "DesktopRefinanceOrCashOutIntentPhrase",
      });
    }
    console.log(clickData);
  };

  useEffect(() => {
    ++windowViewCount;
    if (windowViewCount <= 1) {
      parseClickData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickData]);

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
  const [formData, setFormData] = useState({
    name: "",
    browserAutoFilledName:"",
    browserAutoFilledPhone:"",
    email: "",
    phone: "",
    street: "",
    zip: "",
    dynamicHeadline: "",
    dynamicSubHeadline: "",
    thankYouHeadline: "",
    thankYouSubHeadline: "",
  
  });

  const nextStep = (n) => {
    console.log(formData);
    setFormStep(n);
  };

  const stepDisplay = () => {
    // -------------- GENERIC FUNNEL START --------------------

    if (formStep === 1) {
      return (
        <HeroSection1
          GApageView={GApageView}
          nextStep={nextStep}
          formData={formData}
          clickData={clickData}
          setFormData={setFormData}
        />
      );
    }

    if (formStep === 2) {
      return (
        <HeroSectionTY
          nextStep={nextStep}
          formData={formData}
          clickData={clickData}
          setFormData={setFormData}
        />
      );
    }

    // -------------- GENERIC FUNNEL END --------------------
  };

  return <div className="FormMain">{stepDisplay()}</div>;
}

export default FormMain;
