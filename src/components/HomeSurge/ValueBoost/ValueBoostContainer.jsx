import React, { useEffect } from 'react';
import { FormProvider, useFormContext } from '../../../contexts/FormContext';
import AddressForm from './AddressForm';
import AIProcessing from './AIProcessing';
import ValueBoostReport from './ValueBoostReport';

function ValueBoostContainer() {
  // Add a custom style to remove the ::before content for this funnel
  useEffect(() => {
    // Create a style element to override the hero-content::before
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .value-boost-container .hero-content::before {
        content: none !important;
        display: none !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Clean up when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
    <div className="value-boost-container" style={{ width: '100%' }}>
      {renderStep()}
    </div>
  );
}

export default ValueBoostContainer;