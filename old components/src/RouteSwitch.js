import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Privacy from "../src/components/Privacy";
import Header from "../src/components/Header";
import FormMain from "../src/components/FormMain"; // import the FormMain component

import GaFastOfferFormMain from "./components/LP/Ga/FastOffer/GaFastOfferFormMain"; // import the GaFormMain component
import GaFastOfferHeroSection2 from "./components/LP/Ga/FastOffer/GaFastOfferHeroSection3";
import GaFastOfferHeroSectionTY from "./components/LP/Ga/FastOffer/GaFastOfferHeroSectionTY";

import MetaRetargetFormMain from "./components/LP/Meta/GaRetargeting/MetaRetargetFormMain";
import MetaRetargetHeroSectionTY from "./components/LP/Meta/GaRetargeting/MetaRetargetHeroSectionTY";

const RouteSwitch = () => {
  return (
    <BrowserRouter className="BrowserRouter">
      <Header />
      <Routes>
        <Route path="/" element={<FormMain />} />
        <Route path="/ga/fast-offer" element={<GaFastOfferFormMain />} />
        <Route path="/ga/sell-fast" element={<GaFastOfferFormMain />} /> 
        <Route
          path="/ga/fast-offer/ty"
          element={<GaFastOfferHeroSectionTY />}
        />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouteSwitch;
