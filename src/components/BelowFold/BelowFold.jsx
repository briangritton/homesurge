import React from 'react';
import LeadershipSection from './LeadershipSection';
import HowItWorks from './HowItWorks';
import ComparisonTable from './ComparisonTable';
import ContactForm from './ContactForm';
import ValueBoostContactSection from './ValueBoostContactSection';
import arrowImage from '../../assets/images/arrowshort.webp';
import '../../styles/main.css';

function BelowFold() {
  // Arrow separator component
  const ArrowSeparator = () => (
    <div className="ai-wave-container">
      <img src={arrowImage} alt="Section separator" />
    </div>
  );

  return (
    <div className="bf-belowfold">
      <ValueBoostContactSection />
      <ArrowSeparator />
      <LeadershipSection />
      <ArrowSeparator />
      <HowItWorks />
      <ArrowSeparator />
      <ComparisonTable />
      <ContactForm />
    </div>
  );
}

export default BelowFold;