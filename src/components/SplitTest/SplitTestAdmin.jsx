import React from 'react';
import SplitTestResults from './SplitTestResults';
import { initializePersonalInfoFormTest } from './PersonalInfoFormTest';
import { useSplitTest } from '../../contexts/SplitTestContext';

function SplitTestAdmin() {
  const { createTest, getActiveTests, resetAllTests } = useSplitTest();
  const activeTests = getActiveTests();
  
  // Start the personal info form test if it doesn't exist yet
  const startPersonalInfoFormTest = () => {
    initializePersonalInfoFormTest(createTest);
  };
  
  return (
    <div className="split-test-admin">
      <div className="admin-header">
        <h1>Split Test Administration</h1>
        
        <div className="admin-actions">
          {!activeTests['personal_info_form_test'] && (
            <button onClick={startPersonalInfoFormTest} className="start-test-button">
              Start Personal Info Form Test
            </button>
          )}
        </div>
      </div>
      
      <SplitTestResults />
    </div>
  );
}

export default SplitTestAdmin;