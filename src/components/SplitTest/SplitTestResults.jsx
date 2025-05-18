import React, { useEffect, useState } from 'react';
import { useSplitTest } from '../../contexts/SplitTestContext';
import './SplitTestResults.css';

function SplitTestResults() {
  const { 
    getActiveTests, 
    getAllTestResults, 
    endTest, 
    resetAllTests,
    updateTestDistribution
  } = useSplitTest();
  
  const [activeTests, setActiveTests] = useState({});
  const [testResults, setTestResults] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [distributionWarnings, setDistributionWarnings] = useState({});
  
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
  
  // Function to handle toggling a variant on/off
  const handleToggleVariant = (testId, variant, isActive) => {
    const test = activeTests[testId];
    if (!test || !test.active) return;
    
    // Calculate new distribution by toggling the selected variant
    let newDistribution = { ...test.distribution };
    
    if (isActive) {
      // Turning OFF a variant - set its distribution to 0 and redistribute to others
      const previousPercentage = newDistribution[variant] || 0;
      newDistribution[variant] = 0;
      
      // Find active variants to redistribute percentage to
      const activeVariants = test.variants.filter(v => 
        v !== variant && (newDistribution[v] > 0 || newDistribution[v] === undefined)
      );
      
      if (activeVariants.length === 0) {
        // Can't turn off all variants - show warning and abort
        setDistributionWarnings({
          ...distributionWarnings,
          [testId]: "Can't disable all variants. At least one variant must be active."
        });
        return;
      }
      
      // Distribute the previous percentage evenly among active variants
      const redistributionAmount = previousPercentage / activeVariants.length;
      activeVariants.forEach(v => {
        newDistribution[v] = (newDistribution[v] || 0) + redistributionAmount;
      });
    } else {
      // Turning ON a variant - give it an equal share with other active variants
      const activeVariants = test.variants.filter(v => 
        newDistribution[v] > 0 || newDistribution[v] === undefined
      );
      
      // Calculate new equal percentage for all active variants including this one
      const equalPercentage = 100 / (activeVariants.length + 1);
      
      // Set all active variants to the new percentage
      activeVariants.forEach(v => {
        newDistribution[v] = equalPercentage;
      });
      
      // Set the newly activated variant to the same percentage
      newDistribution[variant] = equalPercentage;
    }
    
    // Round all percentages to 2 decimal places for cleaner display
    Object.keys(newDistribution).forEach(v => {
      newDistribution[v] = parseFloat(newDistribution[v].toFixed(2));
    });
    
    // Adjust for rounding errors to ensure total is exactly 100%
    const total = Object.values(newDistribution).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      // Find any non-zero variant to adjust
      const adjustableVariant = Object.keys(newDistribution).find(v => newDistribution[v] > 0);
      if (adjustableVariant) {
        newDistribution[adjustableVariant] += (100 - total);
      }
    }
    
    // Update the test distribution
    const success = updateTestDistribution(testId, newDistribution);
    if (success) {
      // Clear any previous warnings
      if (distributionWarnings[testId]) {
        const newWarnings = { ...distributionWarnings };
        delete newWarnings[testId];
        setDistributionWarnings(newWarnings);
      }
      
      // Refresh the display
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
            
            {distributionWarnings[testId] && (
              <div className="distribution-warning">
                {distributionWarnings[testId]}
              </div>
            )}
            
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
                    const isActive = (test.distribution[variant] || 0) > 0;
                    const distribution = test.distribution[variant] || 0;
                    
                    return (
                      <tr key={variant} className={variant === winner ? 'winning-row' : ''}>
                        <td>
                          <div className="variant-actions">
                            {variant}
                            <span className={`variant-status ${isActive ? 'variant-active' : 'variant-inactive'}`}>
                              {isActive ? 'Active' : 'Off'}
                            </span>
                            <span className="distribution-value">
                              {distribution.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td>{variantData.views || 0}</td>
                        <td>{variantData.conversions || 0}</td>
                        <td>
                          <div className="variant-actions">
                            {calculateConversionRate(variantData.views, variantData.conversions)}
                            
                            {test.active && (
                              <label className="toggle-container">
                                <input 
                                  type="checkbox"
                                  checked={isActive}
                                  onChange={() => handleToggleVariant(testId, variant, isActive)}
                                  disabled={!test.active}
                                />
                                <span className="toggle-slider"></span>
                              </label>
                            )}
                          </div>
                        </td>
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