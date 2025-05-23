import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { FormProvider, useFormContext } from './contexts/FormContext';
import { initializeAnalytics, trackPageView } from './services/analytics';
import { initEmailJS } from './services/emailjs.js';

// Components
import Header from './components/common/Header';
import ValueBoostHeader from './components/common/ValueBoostHeader';
import Footer from './components/common/Footer';
import AddressForm from './components/Form/AddressForm.jsx';
import PersonalInfoForm from './components/Form/PersonalInfoForm.jsx';
import QualifyingForm from './components/Form/QualifyingForm';
import ThankYou from './components/Form/ThankYou';
import Privacy from './components/common/Privacy';
import ZohoTest from './components/ZohoTest';
import SalesPage from './components/SalesPage';
import ValueBoostContainer from './components/HomeSurge/ValueBoost/ValueBoostContainer';
import DebugDisplay from './components/common/DebugDisplay';
import { CRMApp } from './components/CRM';

// Styles
import './styles/main.css';
import './styles/crm.css';

// Simple container for viewing components in isolation during development
const SimpleComponentViewer = ({ children }) => (
  <div style={{ 
    maxWidth: '600px', 
    margin: '40px auto', 
    padding: '20px',
    border: '1px solid #eee',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}>
    {children}
  </div>
);

// Analytics tracker component to handle route changes
function AnalyticsTracker() {
  const location = useLocation();
  
  useEffect(() => {
    // Track page view whenever location changes
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  return null; // This component doesn't render anything
}

// Conditional header component based on route
function ConditionalHeader() {
  const location = useLocation();
  
  // Use ValueBoost header for ValueBoost routes
  if (location.pathname.startsWith('/valueboost')) {
    return <ValueBoostHeader />;
  }
  
  // Use regular header for all other routes
  return <Header />;
}

// Main form container that manages form steps
function FormContainer() {
  const { formData, initFromUrlParams } = useFormContext();
  
  // Initialize analytics and dynamic content from URL params (only once)
  useEffect(() => {
    // Initialize analytics
    initializeAnalytics();
    
    // Initialize EmailJS for lead notifications
    // This replaces the previous Firebase Extension email system
    initEmailJS('afTroSYel0GQS1oMc'); // Public Key
    
    // Analytics already initialized above, no additional consent needed
    
    // Initialize dynamic content from URL parameters
    initFromUrlParams();
    
    // Log that dynamic content has been initialized
    console.log('Dynamic content and campaign tracking initialized from URL parameters');
    
    // Delay logging parameters to ensure state updates have been applied
    const timer = setTimeout(() => {
      console.log('Current campaign parameters:', {
        campaignId: formData.campaignId || 'Not set',
        campaignName: formData.campaignName || 'Not set',
        adgroupId: formData.adgroupId || 'Not set',
        adgroupName: formData.adgroupName || 'Not set',
        keyword: formData.keyword || 'Not set',
        trafficSource: formData.trafficSource || 'Direct'
      });
    }, 500); // Longer delay to ensure state updates complete
    
    return () => {
      clearTimeout(timer); // Cleanup on unmount
    };
    
    // No dependencies - only run once on mount
  }, []);
  
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

// CRM container - this route will not include header and footer
function CRMContainer() {
  return <CRMApp />;
}

// Main App component with routing
function App() {
  return (
    <div className="app">
      <FormProvider>
        <BrowserRouter>
          <Routes>
            {/* CRM Routes - no header/footer */}
            <Route path="/crm/*" element={<CRMContainer />} />
            
            {/* Main site routes - with header/footer */}
            <Route path="*" element={
              <>
                <ConditionalHeader />
                <AnalyticsTracker /> {/* Track all page views */}
                <Routes>
                  <Route path="/" element={<FormContainer />} />
                  <Route path="/test-zoho" element={<ZohoTest />} />
                  <Route path="/privacy" element={<Privacy handleTermsClick={() => {}} />} />
                  <Route path="/thank-you" element={<ThankYou />} />
                  <Route path="/sales" element={<SalesPage />} />
                  <Route path="/valueboost" element={<ValueBoostContainer />} />
                  
                  {/* Development route for viewing components */}
                  <Route path="/view/personal-info" element={
                    <SimpleComponentViewer>
                      <PersonalInfoForm />
                    </SimpleComponentViewer>
                  } />
                </Routes>
                <Footer />
                {/* Debug display hidden as requested */}
                {/* <DebugDisplay /> */}
              </>
            } />
          </Routes>
        </BrowserRouter>
      </FormProvider>
    </div>
  );
}

export default App;