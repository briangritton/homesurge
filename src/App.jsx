import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { FormProvider, useFormContext } from './contexts/FormContext';
import { initializeAnalytics, trackPageView } from './services/analytics';
import { initEmailJS } from './services/emailjs.js';

// Components
import Header from './components/common/Header';
import ValueBoostHeader from './components/common/ValueBoostHeader.jsx';
import Footer from './components/common/Footer';
import AddressForm from './components/Form/AddressForm.jsx';
import PersonalInfoForm from './components/Form/PersonalInfoForm.jsx';
import QualifyingForm from './components/Form/QualifyingForm';
import ThankYou from './components/Form/ThankYou';
import Privacy from './components/common/Privacy';
import ZohoTest from './components/ZohoTest';
import SalesPage from './components/SalesPage';
import ValueBoostContainer from './components/HomeSurge/ValueBoost/ValueBoostContainer';
import RealEstateChatbot from './components/RealEstateChatbot';
// import DebugDisplay from './components/common/DebugDisplay';
import { CRMApp } from './components/CRM';

// Styles
import './styles/main.css';
import './styles/crm.css';

// Error boundary to catch and handle JavaScript errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Form Error:', error, errorInfo);
    // Track error in analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="hero-section">
          <div className="hero-middle-container">
            <div className="hero-content">
              <div className="hero-headline">
                Get Your Cash Offer Today
              </div>
              <div className="hero-subheadline">
                We're experiencing a temporary issue. Please call us directly at (770) 765-7969 for immediate assistance.
              </div>
              <div style={{ marginTop: '20px' }}>
                <a href="tel:+17707657969" className="submit-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  Call Now: (770) 765-7969
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  
  // Use regular header for specific form routes
  if (location.pathname.startsWith('/form') || location.pathname.startsWith('/sellfast')) {
    return <Header />;
  }
  
  // Use ValueBoost header for all other routes (now default)
  return <ValueBoostHeader />;
}

// Main form container that manages form steps
function FormContainer() {
  const { formData, initFromUrlParams } = useFormContext();
  
  // Initialize analytics and dynamic content from URL params (only once)
  useEffect(() => {
    try {
      // Initialize analytics
      initializeAnalytics();
      
      // Initialize EmailJS for lead notifications
      // This replaces the previous Firebase Extension email system
      initEmailJS('afTroSYel0GQS1oMc'); // Public Key
      
      // Analytics already initialized above, no additional consent needed
      
      // Initialize dynamic content from URL parameters
      initFromUrlParams();
    } catch (error) {
      console.error('Failed to initialize services:', error);
      // Continue loading the form even if analytics fails
    }
    
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
    <ErrorBoundary>
      <div className="form-main">
        <div className="form-inner-content">
          {renderFormStep()}
        </div>
      </div>
    </ErrorBoundary>
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
                  {/* Analysis page routes - all campaign and variant combinations */}
                  {/* Cash campaigns */}
                  <Route path="/analysis/cash/a1o" element={<ValueBoostContainer />} />
                  <Route path="/analysis/cash/a1i" element={<ValueBoostContainer />} />
                  <Route path="/analysis/cash/a2o" element={<ValueBoostContainer />} />
                  <Route path="/analysis/cash/b2o" element={<ValueBoostContainer />} />
                  
                  {/* Sell campaigns */}
                  <Route path="/analysis/sell/a1o" element={<ValueBoostContainer />} />
                  <Route path="/analysis/sell/a1i" element={<ValueBoostContainer />} />
                  <Route path="/analysis/sell/a2o" element={<ValueBoostContainer />} />
                  <Route path="/analysis/sell/b2o" element={<ValueBoostContainer />} />
                  
                  {/* Value campaigns */}
                  <Route path="/analysis/value/a1o" element={<ValueBoostContainer />} />
                  <Route path="/analysis/value/a1i" element={<ValueBoostContainer />} />
                  <Route path="/analysis/value/a2o" element={<ValueBoostContainer />} />
                 
                  
                  {/* Equity campaigns */}
                  <Route path="/analysis/equity/a1o" element={<ValueBoostContainer />} />
                  <Route path="/analysis/equity/a1i" element={<ValueBoostContainer />} />
                  <Route path="/analysis/equity/a2o" element={<ValueBoostContainer />} />
                  <Route path="/analysis/equity/b2o" element={<ValueBoostContainer />} />
                  
                  {/* Dynamic route as fallback */}
                  <Route path="/analysis/:campaign/:variant" element={<ValueBoostContainer />} />
                  
                  {/* Legacy analysis route - redirect to default */}
                  <Route path="/analysis" element={<ValueBoostContainer />} />
                  
                  {/* Redirect root to default analysis route */}
                  <Route path="/" element={<ValueBoostContainer />} />
                  
                  {/* Real Estate Chatbot Route */}
                  <Route path="/chat-help" element={<RealEstateChatbot />} />
                  
                  {/* Specific routes for other funnels */}
                  <Route path="/form" element={<FormContainer />} />
                  <Route path="/sellfast" element={<FormContainer />} />
                  <Route path="/cash" element={<FormContainer />} />
                  
                  {/* Utility routes */}
                  <Route path="/test-zoho" element={<ZohoTest />} />
                  <Route path="/privacy" element={<Privacy handleTermsClick={() => {}} />} />
                  <Route path="/thank-you" element={<ThankYou />} />
                  <Route path="/sales" element={<SalesPage />} />
                  
                  {/* Development route for viewing components */}
                  <Route path="/view/personal-info" element={
                    <SimpleComponentViewer>
                      <PersonalInfoForm />
                    </SimpleComponentViewer>
                  } />
                  
                  {/* Catch-all route - redirect all unfound/typo paths to analysis */}
                  <Route path="*" element={<ValueBoostContainer />} />
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