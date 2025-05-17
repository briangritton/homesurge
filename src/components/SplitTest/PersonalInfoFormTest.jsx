import React, { useEffect } from 'react';
import { useSplitTest } from '../../contexts/SplitTestContext';

// Import the original PersonalInfoForm
import OriginalPersonalInfoForm from '../Form/PersonalInfoForm';
// Import the variant
import VariantPersonalInfoForm from './VariantPersonalInfoForm';

// Define the test ID for the personal info form test
const PERSONAL_INFO_FORM_TEST_ID = 'personal_info_form_test';

// Component that implements the split test
function PersonalInfoFormTest() {
  const { getVariant, trackConversion } = useSplitTest();
  
  // Get the assigned variant for this user
  const variant = getVariant(PERSONAL_INFO_FORM_TEST_ID);
  
  // Track view event when component mounts
  useEffect(() => {
    if (variant) {
      trackConversion(PERSONAL_INFO_FORM_TEST_ID, variant, 1, 'view');
    }
  }, [variant, trackConversion]);
  
  // Render the appropriate variant based on the test assignment
  switch (variant) {
    case 'original':
      return <OriginalPersonalInfoForm />;
    case 'variant1':
      return <VariantPersonalInfoForm />;
    default:
      // Fallback to original if something went wrong
      return <OriginalPersonalInfoForm />;
  }
}

export default PersonalInfoFormTest;

// Utility functions related to this test
export const initializePersonalInfoFormTest = (createTest) => {
  // Define variants - now with two options
  const variants = ['original', 'variant1'];
  
  // Define distribution - 50/50 split
  const distribution = {
    'original': 50,
    'variant1': 50
  };
  
  // Create the test
  createTest(PERSONAL_INFO_FORM_TEST_ID, variants, distribution);
};

// Track conversion for personal info form (to be called when user proceeds to next step)
export const trackPersonalInfoFormConversion = (trackConversion, variant, value = 1) => {
  trackConversion(PERSONAL_INFO_FORM_TEST_ID, variant, value, 'conversion');
};