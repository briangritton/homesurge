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
  
  // Address suggestion tracking fields
  userTypedAddress: '',
  selectedSuggestionAddress: '',
  suggestionOne: '',
  suggestionTwo: '',
  suggestionThree: '',
  suggestionFour: '',
  suggestionFive: '',
  leadStage: 'New',
  
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
  needsRepairs: 'false',  // Explicit default for repairs
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
  
  // Property data (Melissa API)
  apiOwnerName: '',
  apiEstimatedValue: 0,
  apiMaxHomeValue: 0,
  formattedApiEstimatedValue: '',
  apiEquity: 0,
  apiPercentage: 0, 
  mortgageAmount: 0,
  propertyRecord: null
};

// Create the context
const FormContext = createContext();

// Create a provider component
export function FormProvider({ children }) {
  const [formData, setFormData] = useState(initialFormState);
  const [leadId, setLeadId] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  
  // Check for saved leadId from localStorage
  useEffect(() => {
    const savedLeadId = localStorage.getItem('leadId');
    if (savedLeadId) {
      console.log("Retrieved lead ID from localStorage:", savedLeadId);
      setLeadId(savedLeadId);
    }
  }, []);
  
  // Save leadId to localStorage whenever it changes
  useEffect(() => {
    if (leadId) {
      console.log("Saving lead ID to localStorage:", leadId);
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

  // Handle form updates
  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // If there are important property data updates, store them
    if (updates.propertyRecord || updates.apiEstimatedValue || updates.apiOwnerName || 
        updates.apiEquity || updates.apiPercentage || updates.needsRepairs || 
        updates.selectedAppointmentTime || updates.selectedAppointmentDate ||
        updates.userTypedAddress || updates.selectedSuggestionAddress ||
        updates.suggestionOne || updates.suggestionTwo || updates.leadStage) {
      console.log("Storing important data updates in localStorage:", {
        apiOwnerName: updates.apiOwnerName,
        apiEstimatedValue: updates.apiEstimatedValue,
        apiEquity: updates.apiEquity,
        apiPercentage: updates.apiPercentage,
        needsRepairs: updates.needsRepairs,
        appointmentDate: updates.selectedAppointmentDate,
        appointmentTime: updates.selectedAppointmentTime,
        userTypedAddress: updates.userTypedAddress,
        selectedSuggestionAddress: updates.selectedSuggestionAddress,
        suggestionOne: updates.suggestionOne,
        leadStage: updates.leadStage,
        propertyRecord: updates.propertyRecord ? "Available" : "Not available"
      });
    }
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

  // Submit initial lead to Zoho
  const submitLead = async () => {
    setFormData(prev => ({ ...prev, submitting: true }));
    
    // Add enhanced logging for property data
    console.log("Submitting lead with complete form data:", {
      name: formData.name,
      phone: formData.phone,
      street: formData.street,
      needsRepairs: formData.needsRepairs,
      wantToSetAppointment: formData.wantToSetAppointment,
      selectedAppointmentDate: formData.selectedAppointmentDate,
      selectedAppointmentTime: formData.selectedAppointmentTime,
      apiOwnerName: formData.apiOwnerName,
      apiEstimatedValue: formData.apiEstimatedValue,
      apiMaxHomeValue: formData.apiMaxHomeValue,
      formattedApiEstimatedValue: formData.formattedApiEstimatedValue,
      apiEquity: formData.apiEquity,
      apiPercentage: formData.apiPercentage,
      userTypedAddress: formData.userTypedAddress,
      selectedSuggestionAddress: formData.selectedSuggestionAddress,
      suggestionOne: formData.suggestionOne,
      suggestionTwo: formData.suggestionTwo,
      suggestionThree: formData.suggestionThree,
      leadStage: formData.leadStage,
      propertyRecord: formData.propertyRecord ? 'Available' : 'Not available'
    });
    
    try {
      console.log("Submitting lead to Zoho:", formData);
      const id = await submitLeadToZoho(formData);
      console.log("Lead submitted successfully, ID:", id);
      
      // If we got any ID (proper or temp), save it
      if (id) {
        setLeadId(id);
        // Also store in localStorage right away to ensure it's saved
        localStorage.setItem('leadId', id);
        
        if (id.startsWith('temp_')) {
          // For temp IDs, add a console warning
          console.warn("Using temporary lead ID - Zoho updates will be skipped");
        } else {
          console.log("Successfully saved valid lead ID:", id);
        }
      }
      
      // Save the form data including full property record to localStorage
      // IMPORTANT: Make sure we're saving ALL form data to localStorage
      localStorage.setItem('formData', JSON.stringify({
        ...formData,
        propertyRecord: formData.propertyRecord || null
      }));
      
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

  // Update lead information in Zoho, or create a new lead if no ID exists
  const updateLead = async () => {
    // Don't attempt to update if we have a temp ID
    if (leadId && leadId.startsWith('temp_')) {
      console.log("Using temporary lead ID - update operation skipped");
      return true;
    }
    
    // Throttle updates to avoid overloading the API
    const now = Date.now();
    if (lastUpdateTime && now - lastUpdateTime < 2000) {
      console.log("Throttling update - too soon after last update");
      return true; // Pretend success but don't actually send the request
    }
    
    setLastUpdateTime(now);
    
    if (!leadId) {
      console.warn("No lead ID available - will create a new lead instead of updating");
      try {
        // Create a new lead instead of updating
        const newLeadId = await submitLeadToZoho(formData);
        if (newLeadId) {
          console.log("Created a new lead instead:", newLeadId);
          setLeadId(newLeadId);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to create replacement lead:", error);
        return false;
      }
    }
    
    try {
      console.log("Updating lead in Zoho:", leadId, formData);
      
      // Log property and address data being sent in update
      if (formData.apiEstimatedValue || formData.apiOwnerName || formData.apiEquity || 
          formData.needsRepairs || formData.selectedAppointmentTime ||
          formData.userTypedAddress || formData.selectedSuggestionAddress) {
        console.log("Including property, appointment, and address data in update:", {
          apiOwnerName: formData.apiOwnerName,
          apiEstimatedValue: formData.apiEstimatedValue,
          apiMaxHomeValue: formData.apiMaxHomeValue,
          apiEquity: formData.apiEquity,
          apiPercentage: formData.apiPercentage,
          needsRepairs: formData.needsRepairs,
          wantToSetAppointment: formData.wantToSetAppointment,
          selectedAppointmentDate: formData.selectedAppointmentDate,
          selectedAppointmentTime: formData.selectedAppointmentTime,
          userTypedAddress: formData.userTypedAddress,
          selectedSuggestionAddress: formData.selectedSuggestionAddress,
          suggestionOne: formData.suggestionOne,
          suggestionTwo: formData.suggestionTwo,
          leadStage: formData.leadStage
        });
      }
      
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