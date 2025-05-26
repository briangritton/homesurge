import { useEffect } from 'react';
import { FormProvider, useFormContext } from '../../../contexts/FormContext';
import { initializeAnalytics } from '../../../services/analytics';
import { initEmailJS } from '../../../services/emailjs.js';
import AddressForm from './AddressForm';
import AIProcessing from './AIProcessing';
import ValueBoostReport from './ValueBoostReport';
import AddressRetry from './AddressRetry';

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
  const { formData, initFromUrlParams } = useFormContext();

  // Initialize analytics and dynamic content from URL params (only once) - COPIED FROM MAIN FORM
  useEffect(() => {
    try {
      // Initialize analytics
      initializeAnalytics();
      
      // Initialize EmailJS for lead notifications
      initEmailJS('afTroSYel0GQS1oMc'); // Public Key
      
      // Initialize dynamic content from URL parameters
      initFromUrlParams();
    } catch (error) {
      console.error('Failed to initialize services:', error);
      // Continue loading the form even if analytics fails
    }
    
    console.log('ValueBoost: Dynamic content and campaign tracking initialized from URL parameters');
    
    // No dependencies - only run once on mount
  }, []);

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
      case 4:
        return <AddressRetry />;
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