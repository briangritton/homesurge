import React from 'react';
import { FormProvider, useFormContext } from '../../../contexts/FormContext';
import AddressForm from './AddressForm';
import AIProcessing from './AIProcessing';
import ValueBoostReport from './ValueBoostReport';

// Import custom styles for ValueBoost funnel
import '../../../styles/valueboost.css';

function ValueBoostContainer() {
  // No longer need ::before override since we're using custom vb-content class
  return (
    <FormProvider>
      <ValueBoostFunnel />
    </FormProvider>
  );
}

function ValueBoostFunnel() {
  const { formData } = useFormContext();

  // Get the current step from form context
  const renderStep = () => {
    // Default to step 1 if not set
    const currentStep = formData?.formStep || 1;

    switch (currentStep) {
      case 1:
        return <AddressForm />;
      case 2:
        return <AIProcessing />;
      case 3:
        return <ValueBoostReport />;
      default:
        return <AddressForm />;
    }
  };

  return (
    <div className="vb-container" style={{ width: '100%' }}>
      {renderStep()}
    </div>
  );
}

export default ValueBoostContainer;