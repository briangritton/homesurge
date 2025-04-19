import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { submitLeadToZoho, updateLeadInZoho } from '../services/zoho';

// Custom hook to use the form context
export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

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
    // First check for suggestionLeadId (created during typing)
    const suggestionLeadId = localStorage.getItem('suggestionLeadId');
    if (suggestionLeadId) {
      console.log("Retrieved suggestion lead ID from localStorage:", suggestionLeadId);
      setLeadId(suggestionLeadId);
      localStorage.setItem('leadId', suggestionLeadId); // Ensure both are in sync
      return;
    }

    // Fall back to regular leadId if no suggestionLeadId exists
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
    
    // Check if we already have a lead ID from the suggestion tracking
    const existingLeadId = localStorage.getItem('suggestionLeadId') || leadId;
    
    // Add enhanced logging for property data
    console.log("Submitting lead with complete form data:", {
      existingLeadId: existingLeadId || 'None',
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
      let id;
      
      if (existingLeadId) {
        // If we already have a lead ID, update it instead of creating a new one
        console.log("Updating existing lead:", existingLeadId, "with name/phone:", {
          name: formData.name,
          phone: formData.phone
        });
        
        // Create updated data with explicit leadStage change
        const updatedData = {
          ...formData,
          name: formData.name, // Explicitly include name
          phone: formData.phone, // Explicitly include phone
          leadStage: 'Contact Info Provided' // Update the lead stage
        };
        
        await updateLeadInZoho(existingLeadId, updatedData);
        id = existingLeadId;
      } else {
        // If no existing lead, create a new one
        console.log("Creating new lead");
        id = await submitLeadToZoho(formData);
      }
      
      console.log("Lead operation successful, ID:", id);
      
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
    // Get the existing lead ID from suggestion tracking or regular flow
    const existingLeadId = localStorage.getItem('suggestionLeadId') || leadId;
    
    // Don't attempt to update if we have a temp ID
    if (existingLeadId && existingLeadId.startsWith('temp_')) {
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
    
    if (!existingLeadId) {
      console.warn("No lead ID available - will create a new lead instead of updating");
      try {
        // Create a new lead instead of updating
        const newLeadId = await submitLeadToZoho(formData);
        if (newLeadId) {
          console.log("Created a new lead instead:", newLeadId);
          setLeadId(newLeadId);
          localStorage.setItem('leadId', newLeadId);
          localStorage.setItem('suggestionLeadId', newLeadId);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to create replacement lead:", error);
        return false;
      }
    }
    
    try {
      console.log("Updating lead in Zoho:", existingLeadId, formData);
      
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
      
      await updateLeadInZoho(existingLeadId, formData);
      console.log("Lead updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update lead:", error);
      return false;
    }
  };

  // Enhanced dynamic content handler based on campaign ID and keyword
  const setDynamicContent = (keyword, campaignId, adgroupId) => {
    if (!keyword) return;
    
    // Convert to lowercase and clean keyword for matching
    const sanitizedKeyword = keyword.replace(/[^a-z0-9\s]/gi, "").toLowerCase();
    const keywordWords = sanitizedKeyword.split(" ");
    
    // Create a config object for the cash offer campaign (20196006239)
    const cashOfferConfig = {
      // Map of keyword sets to content variations
      keywordSets: [
        {
          // Match if ALL these words are in the keyword
          words: ['get', 'cash'],
          content: {
            headline: 'Get Cash For Your House Fast!',
            subHeadline: 'Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer',
            buttonText: 'CHECK OFFER',
            thankYouHeadline: 'Cash Offer Request Completed!',
            thankYouSubHeadline: 'You\'ll be receiving your no obligation cash offer at your contact number shortly, thank you!'
          }
        },
        {
          words: ['cash', 'out'],
          content: {
            headline: 'Check Your Home Cash Out Amount',
            subHeadline: 'Get a great cash out offer for your house and close fast! Enter your address below to generate your cash amount',
            buttonText: 'CHECK OFFER',
            thankYouHeadline: 'Cash Offer Request Completed!',
            thankYouSubHeadline: 'You\'ll be receiving your no obligation cash offer at your contact number shortly, thank you!'
          }
        },
        {
          words: ['sell', 'cash'],
          content: {
            headline: 'Sell Your House For Cash Fast',
            subHeadline: 'Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer',
            buttonText: 'CHECK OFFER',
            thankYouHeadline: 'Cash Offer Request Completed!',
            thankYouSubHeadline: 'You\'ll be receiving your no obligation cash offer at your contact number shortly, thank you!'
          }
        },
        {
          words: ['sell', 'cash', 'fast'],
          content: {
            headline: 'Sell Your House For Cash Fast',
            subHeadline: 'Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer',
            buttonText: 'CHECK OFFER',
            thankYouHeadline: 'Cash Offer Request Completed!',
            thankYouSubHeadline: 'You\'ll be receiving your no obligation cash offer at your contact number shortly, thank you!'
          }
        },
        {
          words: ['cash'],
          content: {
            headline: 'Sell Your House For Cash Fast',
            subHeadline: 'Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer',
            buttonText: 'CHECK OFFER',
            thankYouHeadline: 'Cash Offer Request Completed!',
            thankYouSubHeadline: 'You\'ll be receiving your no obligation cash offer at your contact number shortly, thank you!'
          }
        }
      ],
      // Default content if no keywords match
      defaultContent: {
        headline: 'Sell Your House For Cash Fast!',
        subHeadline: 'We Buy Houses In Any Condition. Get an Instant Cash Offer Now!',
        buttonText: 'CHECK OFFER',
        thankYouHeadline: 'Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your requested details at your contact number shortly, thank you!'
      }
    };
    
    // Select the appropriate campaign config based on campaignId
    let campaignConfig;
    if (campaignId === "20196006239") {
      campaignConfig = cashOfferConfig;
    } else {
      // For all other campaigns, use a simpler approach
      if (keywordWords.includes('cash') && keywordWords.includes('sell')) {
        updateFormData({
          dynamicHeadline: 'Sell Your House For Cash Fast!',
          dynamicSubHeadline: 'Get a great cash offer for your house and close fast!',
          thankYouHeadline: 'Cash Offer Request Completed!',
          thankYouSubHeadline: 'You\'ll be receiving your no obligation cash offer at your contact number shortly, thank you!',
          buttonText: 'CHECK OFFER',
          trafficSource: 'Google Search',
          url: window.location.href
        });
      } else if (keywordWords.includes('value')) {
        updateFormData({
          dynamicHeadline: 'Check The Value Of Your House!',
          dynamicSubHeadline: 'Find out how much your home is worth today.',
          thankYouHeadline: 'Home Value Request Completed!',
          thankYouSubHeadline: 'You\'ll be receiving your home value details at your contact number shortly, thank you!',
          buttonText: 'CHECK VALUE',
          trafficSource: 'Google Search',
          url: window.location.href
        });
      } else if (keywordWords.includes('fast')) {
        updateFormData({
          dynamicHeadline: 'Sell Your House Fast!',
          dynamicSubHeadline: 'Get a cash offer and close in as little as 10 days!',
          thankYouHeadline: 'Fast Sale Request Completed!',
          thankYouSubHeadline: 'You\'ll be receiving your fast sale details at your contact number shortly, thank you!',
          buttonText: 'CHECK OFFER',
          trafficSource: 'Google Search',
          url: window.location.href
        });
      }
      return; // Exit here for non-cash-offer campaigns
    }
    
    // For the cash offer campaign, use the detailed keyword matching
    let matched = false;
    
    // Try to match keyword sets in order (more specific first)
    for (const keywordSet of campaignConfig.keywordSets) {
      // Check if ALL words in this set are in the keyword
      if (keywordSet.words.every(word => keywordWords.includes(word))) {
        const content = keywordSet.content;
        
        // Update form data with the matched content
        updateFormData({
          dynamicHeadline: content.headline,
          dynamicSubHeadline: content.subHeadline,
          thankYouHeadline: content.thankYouHeadline,
          thankYouSubHeadline: content.thankYouSubHeadline,
          buttonText: content.buttonText,
          trafficSource: 'Google Search',
          url: window.location.href,
          campaignName: 'Sell For Cash Form Submit (Google only)',
          adgroupName: adgroupId === '149782006756' ? '(exact)' : 
                        adgroupId === '153620745798' ? '(phrase)' : 'not set'
        });
        
        matched = true;
        break;
      }
    }
    
    // If no match, use default content
    if (!matched) {
      const defaultContent = campaignConfig.defaultContent;
      updateFormData({
        dynamicHeadline: defaultContent.headline,
        dynamicSubHeadline: defaultContent.subHeadline,
        thankYouHeadline: defaultContent.thankYouHeadline,
        thankYouSubHeadline: defaultContent.thankYouSubHeadline,
        buttonText: defaultContent.buttonText,
        trafficSource: 'Google Search',
        url: window.location.href,
        campaignName: 'Sell For Cash Form Submit (Google only)',
        adgroupName: adgroupId === '149782006756' ? '(exact)' : 
                      adgroupId === '153620745798' ? '(phrase)' : 'not set'
      });
    }
  };
  
  // Clear all form data (for testing or resetting)
  const clearFormData = () => {
    localStorage.removeItem('formData');
    localStorage.removeItem('formStep');
    localStorage.removeItem('leadId');
    localStorage.removeItem('suggestionLeadId');
    setLeadId(null);
    setFormData(initialFormState);
  };

  // Initialize dynamic content from URL parameters and setup analytics tracking
  const initFromUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('keyword') || '';
    const campaignId = urlParams.get('campaignid') || '';
    const adgroupId = urlParams.get('adgroupid') || '';
    const device = urlParams.get('device') || '';
    const gclid = urlParams.get('gclid') || '';
    
    // Determine campaign name based on campaignId
    let campaignName = 'Organic';
    if (campaignId === "20196006239") {
      campaignName = "Sell For Cash Form Submit (Google only)";
    } else if (campaignId === "20490389456") {
      campaignName = "Sell For Cash Form Submit (Search Partners)";
    } else if (campaignId === "20311247419") {
      campaignName = "Sell Fast, On Own, No Agent, Form Submit (Google only)";
    } else if (campaignId === "20490511649") {
      campaignName = "Sell Fast, On Own, No Agent, Form Submit (Search Partners)";
    }
    
    // Determine adgroup name based on adgroupId
    let adgroupName = '';
    if (adgroupId === "149782006756" || adgroupId === "151670982418" || 
        adgroupId === "153325247952" || adgroupId === "156355988601") {
      adgroupName = "(exact)";
    } else if (adgroupId === "153620745798" || adgroupId === "156658963430" || 
               adgroupId === "153325247992" || adgroupId === "156355988761") {
      adgroupName = "(phrase)";
    }
    
    if (keyword || campaignId) {
      // Update the tracking parameters in form data
      updateFormData({
        keyword: keyword,
        campaignId: campaignId,
        adgroupId: adgroupId,
        device: device,
        gclid: gclid,
        url: window.location.href,
        campaignName: campaignName,
        adgroupName: adgroupName,
        trafficSource: campaignId ? 'Google Search' : 'Direct'
      });
      
      // Set the dynamic content based on these parameters
      setDynamicContent(keyword, campaignId, adgroupId);
      
      // Push event to Google Analytics (gtag)
      if (window.gtag) {
        window.gtag('set', {
          'campaign_id': campaignId,
          'campaign_name': campaignName,
          'campaign_source': 'google',
          'campaign_medium': 'cpc',
          'campaign_keyword': keyword,
          'adgroup_id': adgroupId,
          'adgroup_name': adgroupName,
          'device': device,
          'gclid': gclid
        });
        
        // Send page view event with campaign data
        window.gtag('event', 'page_view', {
          'campaign_data_available': 'yes'
        });
      }
      
      // Push to dataLayer for GTM
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'campaign_page_view',
        'campaignId': campaignId,
        'campaignName': campaignName,
        'adgroupId': adgroupId,
        'adgroupName': adgroupName,
        'keyword': keyword,
        'device': device,
        'gclid': gclid,
        'template': 'cash_offer',
        'traffic_source': 'paid_search'
      });
      
      console.log('Campaign tracking initialized:', {
        campaignId,
        campaignName,
        adgroupId,
        adgroupName,
        keyword
      });
      
      return true;
    }
    
    // If no campaign parameters, track as direct traffic
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'organic_page_view',
      'traffic_source': 'direct'
    });
    
    return false;
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
      initFromUrlParams,
      clearFormData
    }}>
      {children}
    </FormContext.Provider>
  );
}