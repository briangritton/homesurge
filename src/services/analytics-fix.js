/**
 * This is a quick fix for the analytics tracking in the form flow
 * 
 * Please apply this fix by removing the "const { trackFormStepComplete } = require('../services/analytics');" 
 * line from FormContext.jsx and directly edit the nextStep function instead.
 * 
 * Replace the nextStep function with:
 * 
 * const nextStep = () => {
 *   // Calculate next step
 *   const currentStep = formData.formStep;
 *   const newStep = currentStep + 1;
 *   
 *   // Move to the next step immediately (before tracking)
 *   setFormData(prev => ({ ...prev, formStep: newStep }));
 *   
 *   // Save current step to localStorage to persist across page refreshes
 *   localStorage.setItem('formStep', newStep.toString());
 * };
 * 
 * Then we'll add tracking to the individual form components to trigger at the right time.
 */