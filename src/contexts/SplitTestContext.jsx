import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create the context
const SplitTestContext = createContext();

// Custom hook to use the split test context
export function useSplitTest() {
  const context = useContext(SplitTestContext);
  if (context === undefined) {
    throw new Error('useSplitTest must be used within a SplitTestProvider');
  }
  return context;
}

// Initial state for split tests
const initialTestState = {
  activeTests: {}, // Tests that are currently running
  testResults: {}, // Results from all tests
  userGroups: {}, // Which test group the user belongs to for each test
  userId: '' // Unique identifier for the user
};

// Helper function to get test distribution from localStorage if it exists
const getTestDistribution = (testId, defaultDistribution = {}) => {
  try {
    const storedDistribution = localStorage.getItem(`test_distribution_${testId}`);
    if (storedDistribution) {
      return JSON.parse(storedDistribution);
    }
  } catch (error) {
    console.error(`Error getting test distribution for ${testId}:`, error);
  }
  return defaultDistribution;
};

// Helper function to save test distribution to localStorage
const saveTestDistribution = (testId, distribution) => {
  try {
    localStorage.setItem(`test_distribution_${testId}`, JSON.stringify(distribution));
  } catch (error) {
    console.error(`Error saving test distribution for ${testId}:`, error);
  }
};

// Provider component
export function SplitTestProvider({ children }) {
  const [testState, setTestState] = useState(initialTestState);
  
  // Initialize user ID on first load
  useEffect(() => {
    let userId;
    // Try to get existing userId from localStorage
    if (localStorage.getItem('splitTestUserId')) {
      userId = localStorage.getItem('splitTestUserId');
    } else {
      // Generate a new ID if one doesn't exist
      userId = uuidv4();
      localStorage.setItem('splitTestUserId', userId);
    }
    
    // Set the userId in state
    setTestState(prev => ({
      ...prev,
      userId
    }));
    
    // Load active tests from localStorage if they exist
    try {
      const storedTests = localStorage.getItem('activeTests');
      if (storedTests) {
        const parsedTests = JSON.parse(storedTests);
        setTestState(prev => ({
          ...prev,
          activeTests: parsedTests
        }));
      }
      
      // Load user groups from localStorage if they exist
      const storedGroups = localStorage.getItem('userTestGroups');
      if (storedGroups) {
        const parsedGroups = JSON.parse(storedGroups);
        setTestState(prev => ({
          ...prev,
          userGroups: parsedGroups
        }));
      }
      
      // Load test results from localStorage if they exist
      const storedResults = localStorage.getItem('testResults');
      if (storedResults) {
        const parsedResults = JSON.parse(storedResults);
        setTestState(prev => ({
          ...prev,
          testResults: parsedResults
        }));
      }
    } catch (error) {
      console.error('Error loading split test data:', error);
    }
  }, []);
  
  // Save test state to localStorage whenever it changes
  useEffect(() => {
    if (testState.userId) {
      try {
        localStorage.setItem('activeTests', JSON.stringify(testState.activeTests));
        localStorage.setItem('userTestGroups', JSON.stringify(testState.userGroups));
        localStorage.setItem('testResults', JSON.stringify(testState.testResults));
      } catch (error) {
        console.error('Error saving split test data:', error);
      }
    }
  }, [testState]);
  
  // Create a new split test
  const createTest = (testId, variants, distribution = {}) => {
    // If no explicit distribution is provided, distribute evenly
    if (Object.keys(distribution).length === 0) {
      const evenPercentage = 100 / variants.length;
      variants.forEach(variant => {
        distribution[variant] = evenPercentage;
      });
    }
    
    // Create the test configuration
    const testConfig = {
      id: testId,
      variants,
      distribution,
      startDate: new Date().toISOString(),
      active: true
    };
    
    // Update test state
    setTestState(prev => ({
      ...prev,
      activeTests: {
        ...prev.activeTests,
        [testId]: testConfig
      }
    }));
    
    // Store the test distribution in localStorage
    saveTestDistribution(testId, distribution);
    
    // Track test creation in analytics
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'split_test_created',
        testId,
        variants,
        distribution
      });
    }
    
    return testConfig;
  };
  
  // Get the variant for a user for a specific test
  const getVariant = (testId) => {
    // Check if user already has an assigned group for this test
    if (testState.userGroups[testId]) {
      const assignedVariant = testState.userGroups[testId];
      const test = testState.activeTests[testId];
      
      // If the test exists and the variant is now disabled (0% distribution),
      // we should reassign the user to a new variant
      if (test && test.distribution[assignedVariant] === 0) {
        console.log(`User was assigned to variant ${assignedVariant}, but it is now disabled. Reassigning...`);
        // Continue to reassignment logic below
      } else {
        // Otherwise, return the previously assigned variant
        return assignedVariant;
      }
    }
    
    // Check if test exists
    const test = testState.activeTests[testId];
    if (!test) {
      console.error(`Test ${testId} does not exist`);
      return null;
    }
    
    // Get the test distribution
    const distribution = getTestDistribution(testId, test.distribution);
    
    // Filter out variants with 0% distribution
    const activeVariants = test.variants.filter(v => (distribution[v] || 0) > 0);
    
    // If no active variants, return null
    if (activeVariants.length === 0) {
      console.warn(`No active variants for test ${testId}`);
      return null;
    }
    
    // Assign user to a group based on distribution
    const random = Math.random() * 100;
    let cumulativePercentage = 0;
    
    for (const variant of activeVariants) {
      cumulativePercentage += distribution[variant] || 0;
      if (random <= cumulativePercentage) {
        // Assign user to this variant
        setTestState(prev => ({
          ...prev,
          userGroups: {
            ...prev.userGroups,
            [testId]: variant
          }
        }));
        
        // Track assignment in analytics
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'split_test_assignment',
            testId,
            variant,
            userId: testState.userId
          });
        }
        
        return variant;
      }
    }
    
    // Fallback to first active variant if something went wrong
    return activeVariants[0];
  };
  
  // Track a conversion for a particular test
  const trackConversion = (testId, variantId, value = 1, eventType = 'conversion') => {
    // Make sure test exists
    if (!testState.activeTests[testId]) {
      console.error(`Test ${testId} does not exist`);
      return;
    }
    
    // Update test results
    setTestState(prev => {
      const currentTest = prev.testResults[testId] || { events: {} };
      const currentVariant = currentTest.events[variantId] || { 
        views: 0, 
        conversions: 0, 
        conversionValue: 0 
      };
      
      // Increment appropriate metric based on event type
      if (eventType === 'view') {
        currentVariant.views += 1;
      } else if (eventType === 'conversion') {
        currentVariant.conversions += 1;
        currentVariant.conversionValue += value;
      }
      
      return {
        ...prev,
        testResults: {
          ...prev.testResults,
          [testId]: {
            ...currentTest,
            events: {
              ...currentTest.events,
              [variantId]: currentVariant
            }
          }
        }
      };
    });
    
    // Track conversion in analytics
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'split_test_event',
        testId,
        variantId,
        eventType,
        value,
        userId: testState.userId
      });
    }
  };
  
  // Get results for a specific test
  const getTestResults = (testId) => {
    return testState.testResults[testId] || null;
  };
  
  // Get all test results
  const getAllTestResults = () => {
    return testState.testResults;
  };
  
  // Get all active tests
  const getActiveTests = () => {
    return testState.activeTests;
  };
  
  // End a test
  const endTest = (testId) => {
    if (!testState.activeTests[testId]) {
      console.error(`Test ${testId} does not exist`);
      return;
    }
    
    setTestState(prev => {
      const { [testId]: testToUpdate, ...otherTests } = prev.activeTests;
      
      return {
        ...prev,
        activeTests: {
          ...otherTests,
          [testId]: {
            ...testToUpdate,
            active: false,
            endDate: new Date().toISOString()
          }
        }
      };
    });
    
    // Track test end in analytics
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'split_test_ended',
        testId
      });
    }
  };
  
  // Reset all split tests (mainly for testing/development)
  const resetAllTests = () => {
    localStorage.removeItem('activeTests');
    localStorage.removeItem('userTestGroups');
    localStorage.removeItem('testResults');
    setTestState(initialTestState);
  };
  
  // Update test distribution (for toggling variants on/off)
  const updateTestDistribution = (testId, newDistribution) => {
    if (!testState.activeTests[testId]) {
      console.error(`Test ${testId} does not exist`);
      return false;
    }
    
    // Validate that distribution percentages add up to 100%
    const totalPercentage = Object.values(newDistribution).reduce((sum, val) => sum + val, 0);
    if (Math.abs(totalPercentage - 100) > 0.1) {
      console.error(`Distribution percentages must add up to 100%, got ${totalPercentage}%`);
      return false;
    }
    
    // Update the test with the new distribution
    setTestState(prev => {
      const updatedTest = {
        ...prev.activeTests[testId],
        distribution: newDistribution
      };
      
      return {
        ...prev,
        activeTests: {
          ...prev.activeTests,
          [testId]: updatedTest
        }
      };
    });
    
    // Save updated distribution to localStorage
    saveTestDistribution(testId, newDistribution);
    
    // Track distribution update in analytics
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'split_test_distribution_updated',
        testId,
        newDistribution
      });
    }
    
    return true;
  };
  
  return (
    <SplitTestContext.Provider value={{
      createTest,
      getVariant,
      trackConversion,
      getTestResults,
      getAllTestResults,
      getActiveTests,
      endTest,
      resetAllTests,
      updateTestDistribution,
      userId: testState.userId,
      userGroups: testState.userGroups
    }}>
      {children}
    </SplitTestContext.Provider>
  );
}