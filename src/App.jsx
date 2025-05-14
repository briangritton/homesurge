import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { FormProvider, useFormContext } from './contexts/FormContext';
import { initializeAnalytics, trackPageView } from './services/analytics';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import AddressForm from './components/Form/AddressForm';
import PersonalInfoForm from './components/Form/PersonalInfoForm';
import QualifyingForm from './components/Form/QualifyingForm';
import ThankYou from './components/Form/ThankYou';
import Privacy from './components/common/Privacy';
import ZohoTest from './components/ZohoTest';
import SalesPage from './components/SalesPage';
import ValueBoostContainer from './components/HomeSurge/ValueBoost/ValueBoostContainer';

// Styles
import './styles/main.css';

// Analytics tracker component to handle route changes
function AnalyticsTracker() {
  const location = useLocation();
  
  useEffect(() => {
    // Track page view whenever location changes
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  return null; // This component doesn't render anything
}

// Main form container that manages form steps
function FormContainer() {
  const { formData, initFromUrlParams } = useFormContext();
  
  // Initialize analytics and dynamic content from URL params
  useEffect(() => {
    // Initialize analytics
    initializeAnalytics();
    
    // Initialize dynamic content from URL parameters (only once)
    initFromUrlParams();
    
    // Log that dynamic content has been initialized
    console.log('Dynamic content and campaign tracking initialized from URL parameters');
    
    // Add debug logging to show what campaign parameters were detected
    console.log('Current campaign parameters:', {
      campaignId: formData.campaignId || 'Not set',
      campaignName: formData.campaignName || 'Not set',
      adgroupId: formData.adgroupId || 'Not set',
      adgroupName: formData.adgroupName || 'Not set',
      keyword: formData.keyword || 'Not set',
      trafficSource: formData.trafficSource || 'Direct'
    });
    // Remove formData from dependencies to prevent infinite loop
  }, [initFromUrlParams]);
  
  // Render the appropriate form step based on form state
  const renderFormStep = () => {
    switch (formData.formStep) {
      case 1:
        return <AddressForm />;
      case 2:
        return <PersonalInfoForm />;
      case 3:
        return <QualifyingForm />;
      case 4:
        return <ThankYou />;
      default:
        return <AddressForm />;
    }
  };
  
  return (
    <div className="form-main">
      <div className="form-inner-content">
        {renderFormStep()}
      </div>
    </div>
  );
}

// Main App component with routing
function App() {
  return (
    <div className="app">
      <FormProvider>
        <BrowserRouter>
          <Header />
          <AnalyticsTracker /> {/* Add this to track all page views */}
          <Routes>
            <Route path="/" element={<FormContainer />} />
            <Route path="/test-zoho" element={<ZohoTest />} />
            <Route path="/privacy" element={<Privacy handleTermsClick={() => {}} />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/valueboost" element={<ValueBoostContainer />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </FormProvider>
    </div>
  );
}

export default App;