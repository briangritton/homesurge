import React, { useState } from 'react';
import { FormProvider } from '../../contexts/FormContext';

// Import variants
import OriginalPersonalInfoForm from '../Form/PersonalInfoForm';
import VariantPersonalInfoForm from './VariantPersonalInfoForm';

/**
 * Simple test page that lets you view different variants
 */
function TestVariantPage() {
  const [viewMode, setViewMode] = useState('variant1'); // 'original' or 'variant1'
  
  return (
    <FormProvider>
      <div className="test-page-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Variant Test Page</h1>
        
        {/* Simple controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px',
          marginBottom: '20px'
        }}>
          <button 
            onClick={() => setViewMode('original')}
            style={{ 
              padding: '8px 16px', 
              background: viewMode === 'original' ? '#2196f3' : '#e0e0e0',
              color: viewMode === 'original' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View Original
          </button>
          
          <button 
            onClick={() => setViewMode('variant1')}
            style={{ 
              padding: '8px 16px', 
              background: viewMode === 'variant1' ? '#2196f3' : '#e0e0e0',
              color: viewMode === 'variant1' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View Variant 1
          </button>
        </div>
        
        {/* Form display area */}
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>
            {viewMode === 'original' ? 'Original Version' : 'Variant 1'}
          </h2>
          
          {viewMode === 'original' ? (
            <OriginalPersonalInfoForm />
          ) : (
            <VariantPersonalInfoForm />
          )}
        </div>
        
        {/* Help text */}
        <div style={{ marginTop: '30px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
          <p>This page is for development only and lets you view different variants for testing.</p>
          <p>As you update the code for your variant form, you'll see changes reflected here.</p>
        </div>
      </div>
    </FormProvider>
  );
}

export default TestVariantPage;