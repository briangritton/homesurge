import React from 'react';
import LeadershipSection from './LeadershipSection';
import HowItWorks from './HowItWorks';
import ValueBoostHowItWorks from './ValueBoostHowItWorks';
import CommonQuestions from './CommonQuestions';
import OfferBoostHowItWorks from './OfferBoostHowItWorks';
import WeBuyHomes from './WeBuyHomes';
import AITools from './AITools';
import Results from './Results';
import WhyAI from './WhyAI';
import WhoItsFor from './WhoItsFor';
import CallToAction from './CallToAction';
import '../../styles/belowfold.css';

function BelowFold() {
  return (
    <div className="bf-belowfold">
      <LeadershipSection />
      <HowItWorks />
      <ValueBoostHowItWorks />
      <CommonQuestions />
      <OfferBoostHowItWorks />
      <WeBuyHomes />
      <AITools />
      <Results />
      <WhyAI />
      <WhoItsFor />
      <CallToAction />
    </div>
  );
}

export default BelowFold;