import { useEffect } from 'react';
import { FormProvider, useFormContext } from '../../../contexts/FormContext';
import { initializeAnalytics } from '../../../services/analytics';
import { initEmailJS } from '../../../services/emailjs.js';
import AddressForm from './AddressForm';
import AIProcessing from './AIProcessing';
import ValueBoostReport from './ValueBoostReport';
import B2Step3 from './B2Step3';
import ValueBoostQualifyingB2 from './ValueBoostQualifyingB2';
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
  const { formData, initFromUrlParams, getAssignedVariant, getRouteData } = useFormContext();
  
  // Scroll to top whenever the form step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [formData.formStep]);

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
    const { campaign, variant } = getRouteData();

    switch (currentStep) {
      case 1:
        return <AddressForm campaign={campaign} variant={variant} />;
      case 2:
        return <AIProcessing campaign={campaign} variant={variant} />;
      case 3:
        // Route based on variant type
        // B2O and all "1" variants (A1O, A1I) go to B2Step3
        if (variant === 'B2O' || variant?.includes('1')) {
          return <B2Step3 campaign={campaign} variant={variant} />;
        }
        
        // Only A2O goes to ValueBoostReport now
        return <ValueBoostReport campaign={campaign} variant={variant} />;
      case 4:
        // B2O and all "1" variants go to qualifying form
        if (variant === 'B2O' || variant?.includes('1')) {
          return <ValueBoostQualifyingB2 campaign={campaign} variant={variant} />;
        }
        // Only A2O should redirect back to ValueBoostReport
        return <ValueBoostReport campaign={campaign} variant={variant} />;
      case 5:
        return <AddressRetry campaign={campaign} variant={variant} />;
      default:
        return <AddressForm campaign={campaign} variant={variant} />;
    }
  };

  return (
    <div className="vb-container" style={{ width: '100%' }}>
      {renderStep()}
    </div>
  );
}

export default ValueBoostContainer;