import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FormProvider, useFormContext } from './contexts/FormContext';
import { initializeAnalytics } from './services/analytics';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import AddressForm from './components/Form/AddressForm';
import PersonalInfoForm from './components/Form/PersonalInfoForm';
import QualifyingForm from './components/Form/QualifyingForm';
import ThankYou from './components/Form/ThankYou';
import Privacy from './components/common/Privacy';
import ZohoTest from './components/ZohoTest';

// Styles
import './styles/main.css';

// Main form container that manages form steps
function FormContainer() {
  const { formData } = useFormContext();
  
  // Initialize analytics when the app loads
  useEffect(() => {
    initializeAnalytics();
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

// Main App component with routing
function App() {
  return (
    <div className="app">
      <FormProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<FormContainer />} />
            <Route path="/test-zoho" element={<ZohoTest />} />
            <Route path="/privacy" element={<Privacy handleTermsClick={() => {}} />} />
            <Route path="/thank-you" element={<ThankYou />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </FormProvider>
    </div>
  );
}

export default App;