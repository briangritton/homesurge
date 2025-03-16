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
  
  // Meta information
  userId: '',
  formStep: 1,
  submitting: false,
  submitted: false,
  submissionError: null,
  
  // Property information
  apiOwnerName: '',
  apiMaxHomeValue: '',
  apiEstimatedValue: '',
  formattedApiEstimatedValue: '',
  
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
  homeType: '',
  remainingMortgage: 100000,
  bedrooms: '',
  bathrooms: '',
  floors: '',
  finishedSquareFootage: 1000,
  basementSquareFootage: 1000,
  howSoonSell: '',
  reasonForSelling: '',
  garage: '',
  garageCars: '',
  hasHoa: '',
  hasSolar: '',
  planningToBuy: '',
  septicOrSewer: '',
  knownIssues: '',
  qualifyingQuestionStep: 1,
  wantToSetAppointment: '',
  selectedAppointmentDate: '',
  selectedAppointmentTime: '',
};

// Create the context
const FormContext = createContext();

// Create a provider component
export function FormProvider({ children }) {
  const [formData, setFormData] = useState(initialFormState);
  const [leadId, setLeadId] = useState(null);
  
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
    
    // If campaign ID exists, set the campaign name
    if (campaignId) {
      setCampaignName(campaignId);
    }
    
    // If adgroup ID exists, set the adgroup name
    if (adgroupId) {
      setAdgroupName(adgroupId);
    }
    
    // If keyword exists, set dynamic content
    if (keyword) {
      setDynamicContent(keyword);
    }
  }, []);

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

  // Set campaign name based on campaign ID
  const setCampaignName = (campaignId) => {
    let campaignName = "No Campaign";
    
    if (campaignId === "20196006239") {
      campaignName = "Sell For Cash Form Submit (Google only)";
    } else if (campaignId === "20490389456") {
      campaignName = "Sell For Cash Form Submit (Search Partners)";
    } else if (campaignId === "20311247419") {
      campaignName = "Sell Fast, On Own, No Agent, Form Submit (Google only)";
    } else if (campaignId === "20490511649") {
      campaignName = "Sell Fast, On Own, No Agent, Form Submit (Search Partners)";
    }
    
    setFormData(prev => ({ ...prev, campaignName }));
  };

  // Set adgroup name based on adgroup ID
  const setAdgroupName = (adgroupId) => {
    let adgroupName = "No Ad Group";
    
    if (adgroupId === "149782006756") {
      adgroupName = "(exact)";
    } else if (adgroupId === "153620745798") {
      adgroupName = "(phrase)";
    } else if (adgroupId === "151670982418") {
      adgroupName = "(exact)";
    } else if (adgroupId === "156658963430") {
      adgroupName = "(phrase)";
    } else if (adgroupId === "153325247952") {
      adgroupName = "(exact)";
    } else if (adgroupId === "153325247992") {
      adgroupName = "(phrase)";
    } else if (adgroupId === "156355988601") {
      adgroupName = "(exact)";
    } else if (adgroupId === "156355988761") {
      adgroupName = "(phrase)";
    }
    
    setFormData(prev => ({ ...prev, adgroupName }));
  };

  // Set dynamic headlines based on keywords
  const setDynamicContent = (keyword) => {
    if (!keyword) return;
    
    const sanitizedKeyword = keyword.replace(/[^a-z0-9\s]/gi, '').toLowerCase();
    const keywordWords = sanitizedKeyword.split(' ');
    
    const possibleHeadlines = [
      {
        keywords: ['get', 'cash'],
        headline: 'Get Cash For Your House Fast!',
        subHeadline: 'Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer',
        thankYouHeadline: 'Cash Offer Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your no obligation cash offer at your contact number shortly, thank you!',
      },
      {
        keywords: ['cash', 'out'],
        headline: 'Check Your Home Cash Out Amount',
        subHeadline: 'Get a great cash out offer for your house and close fast! Enter your address below to generate your cash amount',
        thankYouHeadline: 'Cash Offer Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your no obligation cash offer at your contact number shortly, thank you!',
      },
      {
        keywords: ['sell', 'cash'],
        headline: 'Sell Your House For Cash Fast',
        subHeadline: 'Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer',
        thankYouHeadline: 'Cash Offer Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your no obligation cash offer at your contact number shortly, thank you!',
      },
      {
        keywords: ['sell', 'fast'],
        headline: 'Sell Your House Fast In As Little As 4 Days!',
        subHeadline: 'Check your sell price and get an instant cash offer for your house! Enter your address below to generate your cash value',
        thankYouHeadline: 'Home Value Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your home value details at your contact number shortly, thank you!',
      },
      {
        keywords: ['value'],
        headline: 'Check The Market Value Of Your House!',
        subHeadline: 'Check your home value fast. Enter your address below to generate.',
        thankYouHeadline: 'Home Value Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your home value details at your contact number shortly, thank you!',
      }
    ];
    
    for (let i = 0; i < possibleHeadlines.length; i++) {
      if (possibleHeadlines[i].keywords.every(kw => keywordWords.includes(kw))) {
        setFormData(prev => ({
          ...prev,
          dynamicHeadline: possibleHeadlines[i].headline,
          dynamicSubHeadline: possibleHeadlines[i].subHeadline,
          thankYouHeadline: possibleHeadlines[i].thankYouHeadline,
          thankYouSubHeadline: possibleHeadlines[i].thankYouSubHeadline,
        }));
        return;
      }
    }
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
      setCampaignName,
      setAdgroupName,
      setDynamicContent
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