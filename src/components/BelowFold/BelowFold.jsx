import React from 'react';
import LeadershipSection from './LeadershipSection';
import HowItWorks from './HowItWorks';
import ComparisonTable from './ComparisonTable';
import ContactForm from './ContactForm';
import LazyImage from '../common/LazyImage';
import waveImage from '../../assets/images/wave.gif';
import '../../styles/belowfold.css';

function BelowFold() {
  return (
    <div className="bf-belowfold">
      <div className="ai-wave-container">
        <LazyImage src={waveImage} alt="" />
      </div>
      <LeadershipSection />
      <div className="ai-wave-container">
        <LazyImage src={waveImage} alt="" />
      </div>
      <HowItWorks />
      <div className="ai-wave-container">
        <LazyImage src={waveImage} alt="" />
      </div>
      <ComparisonTable />
      <ContactForm />
    </div>
  );
}

export default BelowFold;