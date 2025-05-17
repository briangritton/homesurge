import React from 'react';
import VariantPersonalInfoForm from './VariantPersonalInfoForm';

// This is a simple component that renders just the variant form for testing/development
function VariantTestPage() {
  return (
    <div className="test-page-container" style={{ padding: '20px' }}>
      <h1>Variant Testing Page</h1>
      <p>This page allows you to view and test the variant form in isolation.</p>
      
      <div style={{ marginTop: '20px' }}>
        <VariantPersonalInfoForm />
      </div>
    </div>
  );
}

export default VariantTestPage;