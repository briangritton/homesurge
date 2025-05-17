import React, { useEffect, useState } from 'react';
import { useSplitTest } from '../../contexts/SplitTestContext';
import './SplitTestResults.css';

function SplitTestResults() {
  const { 
    getActiveTests, 
    getAllTestResults, 
    endTest, 
    resetAllTests 
  } = useSplitTest();
  
  const [activeTests, setActiveTests] = useState({});
  const [testResults, setTestResults] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Fetch tests and results when component mounts or refreshes
  useEffect(() => {
    setActiveTests(getActiveTests());
    setTestResults(getAllTestResults());
  }, [getActiveTests, getAllTestResults, refreshTrigger]);
  
  // Function to calculate conversion rate
  const calculateConversionRate = (views, conversions) => {
    if (!views || views === 0) return '0.00%';
    const rate = (conversions / views) * 100;
    return `${rate.toFixed(2)}%`;
  };
  
  // Function to handle ending a test
  const handleEndTest = (testId) => {
    if (window.confirm(`Are you sure you want to end the test "${testId}"?`)) {
      endTest(testId);
      setRefreshTrigger(prev => prev + 1);
    }
  };
  
  // Function to handle resetting all tests
  const handleResetAllTests = () => {
    if (window.confirm('Are you sure you want to reset ALL tests? This will delete all test data.')) {
      resetAllTests();
      setRefreshTrigger(prev => prev + 1);
    }
  };
  
  // Function to determine the winning variant
  const determineWinner = (testId) => {
    const testResult = testResults[testId];
    if (!testResult || !testResult.events) return null;
    
    let highestRate = 0;
    let winner = null;
    
    Object.entries(testResult.events).forEach(([variant, data]) => {
      const conversionRate = data.views > 0 ? data.conversions / data.views : 0;
      if (conversionRate > highestRate) {
        highestRate = conversionRate;
        winner = variant;
      }
    });
    
    return winner;
  };
  
  return (
    <div className="split-test-results">
      <div className="results-header">
        <h1>Split Test Results</h1>
        <button onClick={() => setRefreshTrigger(prev => prev + 1)} className="refresh-button">
          Refresh Data
        </button>
        <button onClick={handleResetAllTests} className="reset-button">
          Reset All Tests
        </button>
      </div>
      
      {Object.keys(activeTests).length === 0 && (
        <div className="no-tests">
          <p>No active split tests found.</p>
        </div>
      )}
      
      {Object.entries(activeTests).map(([testId, test]) => {
        const testResult = testResults[testId] || { events: {} };
        const winner = determineWinner(testId);
        
        return (
          <div key={testId} className="test-card">
            <div className="test-header">
              <h2>{testId}</h2>
              <div className="test-status">
                <span className={test.active ? 'status-active' : 'status-inactive'}>
                  {test.active ? 'Active' : 'Inactive'}
                </span>
                {test.active && (
                  <button onClick={() => handleEndTest(testId)} className="end-test-button">
                    End Test
                  </button>
                )}
              </div>
            </div>
            
            <div className="test-details">
              <p><strong>Started:</strong> {new Date(test.startDate).toLocaleString()}</p>
              {test.endDate && (
                <p><strong>Ended:</strong> {new Date(test.endDate).toLocaleString()}</p>
              )}
              {winner && (
                <p className="winner-tag">
                  <strong>Current Leader:</strong> {winner}
                </p>
              )}
            </div>
            
            <div className="test-results-table">
              <table>
                <thead>
                  <tr>
                    <th>Variant</th>
                    <th>Views</th>
                    <th>Conversions</th>
                    <th>Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {test.variants.map(variant => {
                    const variantData = testResult.events[variant] || { views: 0, conversions: 0 };
                    return (
                      <tr key={variant} className={variant === winner ? 'winning-row' : ''}>
                        <td>{variant}</td>
                        <td>{variantData.views || 0}</td>
                        <td>{variantData.conversions || 0}</td>
                        <td>{calculateConversionRate(variantData.views, variantData.conversions)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SplitTestResults;