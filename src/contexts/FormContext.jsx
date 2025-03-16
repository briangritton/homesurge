import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { submitLeadToZoho, updateLeadInZoho } from '../services/zoho';

// Initial form state
const initialFormState = {
  // User information
  name: '',
  phone: '',
  email: '',
  street: '',
  city: '',
  zip: '',
  state: 'GA',
  
  // Meta information
  userId: '',
  formStep: 1,
  submitting: false,
  submitted: false,
  submissionError: null,
  
  // Traffic source information
  dynamicHeadline: 'Sell Your House For Cash Fast!',
  dynamicSubHeadline: 'Get a Great Cash Offer For Your House and Close Fast!',
  thankYouHeadline: 'Request Completed!',
  thankYouSubHeadline: 'You\'ll be receiving your requested details at your contact number shortly, thank you!',
  trafficSource: 'Direct',
  campaignId: '',
  campaignName: '',
  adgroupId: '',
  adgroupName: '',
  keyword: '',
  device: '',
  gclid: '',
  url: window.location.href,
  
  // Property qualifications
  isPropertyOwner: 'true',
  needsRepairs: 'false',
  workingWithAgent: 'false',
  homeType: 'Single Family',
  remainingMortgage: 100000,
  finishedSquareFootage: 1000,
  basementSquareFootage: 0,
  howSoonSell: 'ASAP',
  qualifyingQuestionStep: 1,
  wantToSetAppointment: 'false',
  selectedAppointmentDate: '',
  selectedAppointmentTime: '',
};

// Create the context
const FormContext = createContext();

// Create a provider component
export function FormProvider({ children }) {
  const [formData, setFormData] = useState(initialFormState);
  const [leadId, setLeadId] = useState(null);
  
  // Check for saved leadId from localStorage
  useEffect(() => {
    const savedLeadId = localStorage.getItem('leadId');
    if (savedLeadId) {
      setLeadId(savedLeadId);
    }
  }, []);
  
  // Save leadId to localStorage whenever it changes
  useEffect(() => {
    if (leadId) {
      localStorage.setItem('leadId', leadId);
    }
  }, [leadId]);
  
  // Initialize user ID from localStorage or create a new one
  useEffect(() => {
    let userId;
    if (localStorage.getItem('userId')) {
      userId = localStorage.getItem('userId');
    } else {
      userId = uuidv4();
      localStorage.setItem('userId', userId);
    }
    
    // Get URL parameters for tracking
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get('campaignid');
    const adgroupId = urlParams.get('adgroupid');
    const keyword = urlParams.get('keyword');
    const device = urlParams.get('device');
    const gclid = urlParams.get('gclid');
    
    // Update form data with user ID and tracking parameters
    setFormData(prev => ({
      ...prev,
      userId,
      campaignId: campaignId || '',
      adgroupId: adgroupId || '',
      keyword: keyword || '',
      device: device || '',
      gclid: gclid || '',
      trafficSource: urlParams.get('source') || 'Direct',
      url: window.location.href
    }));
    
    // Check if we have stored form data from a previous session
    const storedFormData = localStorage.getItem('formData');
    if (storedFormData) {
      try {
        const parsedData = JSON.parse(storedFormData);
        setFormData(prev => ({...prev, ...parsedData}));
      } catch (e) {
        console.error('Error parsing stored form data:', e);
      }
    }
  }, []);
  
  // Save crucial form data to localStorage when it changes
  useEffect(() => {
    // Only save non-sensitive data
    const dataToStore = {
      street: formData.street,
      city: formData.city,
      zip: formData.zip,
      state: formData.state,
      formStep: formData.formStep,
      qualifyingQuestionStep: formData.qualifyingQuestionStep,
      isPropertyOwner: formData.isPropertyOwner,
      needsRepairs: formData.needsRepairs,
      workingWithAgent: formData.workingWithAgent,
      homeType: formData.homeType,
      howSoonSell: formData.howSoonSell,
      wantToSetAppointment: formData.wantToSetAppointment
    };
    
    localStorage.setItem('formData', JSON.stringify(dataToStore));
  }, [formData.formStep, formData.street, formData.qualifyingQuestionStep, formData.isPropertyOwner, 
      formData.needsRepairs, formData.workingWithAgent, formData.homeType, formData.howSoonSell, 
      formData.wantToSetAppointment]);

  // Handle form updates
  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Handle form step navigation
  const nextStep = () => {
    const newStep = formData.formStep + 1;
    setFormData(prev => ({ ...prev, formStep: newStep }));
    
    // Save current step to localStorage to persist across page refreshes
    localStorage.setItem('formStep', newStep.toString());
  };

  const previousStep = () => {
    const newStep = Math.max(1, formData.formStep - 1);
    setFormData(prev => ({ ...prev, formStep: newStep }));
    localStorage.setItem('formStep', newStep.toString());
  };

  const goToStep = (step) => {
    setFormData(prev => ({ ...prev, formStep: step }));
    localStorage.setItem('formStep', step.toString());
  };

  // Submit initial lead data to Zoho
  const submitLead = async () => {
    setFormData(prev => ({ ...prev, submitting: true }));
    try {
      console.log("Submitting lead to Zoho:", formData);
      const id = await submitLeadToZoho(formData);
      console.log("Lead submitted successfully, ID:", id);
      
      setLeadId(id);
      setFormData(prev => ({ 
        ...prev, 
        submitted: true, 
        submitting: false,
        submissionError: null 
      }));
      return true;
    } catch (error) {
      console.error("Failed to submit lead:", error);
      setFormData(prev => ({ 
        ...prev, 
        submitting: false, 
        submissionError: error.message || "Failed to submit. Please try again." 
      }));
      return false;
    }
  };

  // Update lead information in Zoho
  const updateLead = async () => {
    if (!leadId) {
      console.warn("Cannot update lead: No lead ID available");
      return false;
    }
    
    try {
      console.log("Updating lead in Zoho:", leadId, formData);
      await updateLeadInZoho(leadId, formData);
      console.log("Lead updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update lead:", error);
      return false;
    }
  };

  // Set dynamic content based on keywords
  const setDynamicContent = (keyword) => {
    if (!keyword) return;
    
    // Convert to lowercase for case-insensitive matching
    const lowerKeyword = keyword.toLowerCase();
    
    // Simple matching logic based on keywords
    if (lowerKeyword.includes('cash') && lowerKeyword.includes('sell')) {
      updateFormData({
        dynamicHeadline: 'Sell Your House For Cash Fast!',
        dynamicSubHeadline: 'Get a great cash offer for your house and close fast!',
        thankYouHeadline: 'Cash Offer Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your no obligation cash offer at your contact number shortly, thank you!'
      });
    } else if (lowerKeyword.includes('value')) {
      updateFormData({
        dynamicHeadline: 'Check The Value Of Your House!',
        dynamicSubHeadline: 'Find out how much your home is worth today.',
        thankYouHeadline: 'Home Value Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your home value details at your contact number shortly, thank you!'
      });
    } else if (lowerKeyword.includes('fast')) {
      updateFormData({
        dynamicHeadline: 'Sell Your House Fast!',
        dynamicSubHeadline: 'Get a cash offer and close in as little as 10 days!',
        thankYouHeadline: 'Fast Sale Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your fast sale details at your contact number shortly, thank you!'
      });
    }
    // Default values are already set in initialFormState
  };
  
  // Clear all form data (for testing or resetting)
  const clearFormData = () => {
    localStorage.removeItem('formData');
    localStorage.removeItem('formStep');
    localStorage.removeItem('leadId');
    setLeadId(null);
    setFormData(initialFormState);
  };

  // Provide the context value to children
  return (
    <FormContext.Provider value={{
      formData,
      leadId,
      updateFormData,
      nextStep,
      previousStep,
      goToStep,
      submitLead,
      updateLead,
      setDynamicContent,
      clearFormData
    }}>
      {children}
    </FormContext.Provider>
  );
}

// Custom hook to use the form context
export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}