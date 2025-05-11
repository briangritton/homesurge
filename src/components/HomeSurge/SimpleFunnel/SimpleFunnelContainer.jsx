import React, { useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import { initializeAnalytics, trackPageView } from '../../../services/analytics';

// Components
import AddressForm from './AddressForm';
import AIReportForm from './AIReportForm';
import ThankYou from './ThankYou';

function SimpleFunnelContainer() {
  const { formData, initFromUrlParams } = useFormContext();
  
  // Initialize analytics and dynamic content from URL params
  useEffect(() => {
    // Initialize analytics
    initializeAnalytics();
    
    // Initialize dynamic content from URL parameters (including campaign tracking)
    initFromUrlParams();
    
    // Log that dynamic content has been initialized
    console.log('HomeSurge SimpleFunnel initialized');
    
    // Add debug logging to show what campaign parameters were detected
    console.log('Campaign parameters for HomeSurge funnel:', {
      campaignId: formData.campaignId || 'Not set',
      campaignName: formData.campaignName || 'Not set',
      adgroupId: formData.adgroupId || 'Not set',
      adgroupName: formData.adgroupName || 'Not set',
      keyword: formData.keyword || 'Not set',
      trafficSource: formData.trafficSource || 'Direct',
      funnel: formData.funnel || 'Not set'
    });
  }, [initFromUrlParams, formData]);
  
  // Render the appropriate form step based on form state
  const renderFormStep = () => {
    console.log('Rendering form step:', formData.formStep);
    
    switch (formData.formStep) {
      case 1:
        return <AddressForm />;
      case 2:
        return <AIReportForm />;
      case 3:
        return <ThankYou />;
      default:
        return <AddressForm />;
    }
  };
  
  return (
    <div className="simple-funnel-container">
      <div className="funnel-inner-content">
        {renderFormStep()}
      </div>
    </div>
  );
}

export default SimpleFunnelContainer;