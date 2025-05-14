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
  
  // Property qualifications - removing default values for Zoho submission
  // These will still display default values in UI, but won't be sent to Zoho until set
  isPropertyOwner: undefined, // UI may show 'Yes' but it won't be sent to Zoho initially
  needsRepairs: undefined,    // UI may show 'No' but it won't be sent to Zoho initially
  workingWithAgent: undefined,
  homeType: undefined,
  remainingMortgage: 100000,  // UI shows default but only sent if user interacts or API sets it
  finishedSquareFootage: 1000, // UI shows default but only sent if user interacts or API sets it
  basementSquareFootage: 0,   // UI shows default but only sent if user interacts or API sets it
  howSoonSell: undefined,
  qualifyingQuestionStep: 1,
  wantToSetAppointment: undefined,
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
  propertyRecord: null,
  
  // Track which fields have been interacted with (by user or API)
  interactedFields: {}
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

  // Handle form updates with tracking of interacted fields
  const updateFormData = (updates) => {
    setFormData(prev => {
      // Track which fields have been explicitly interacted with
      const newInteractedFields = { ...prev.interactedFields };
      
      // Mark each updated field as interacted with
      Object.keys(updates).forEach(key => {
        if (key !== 'interactedFields') {
          newInteractedFields[key] = true;
        }
      });
      
      return { 
        ...prev, 
        ...updates, 
        interactedFields: newInteractedFields 
      };
    });
    
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
    // Simply move to the next step - tracking will be handled by components
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

  // Helper function to clean data before sending to Zoho
  const prepareDataForZoho = (data) => {
    // Create a clean copy of data
    const cleanData = { ...data };
    
    // List of qualifying fields that should only be sent if interacted with
    const qualifyingFields = [
      'isPropertyOwner',
      'needsRepairs',
      'workingWithAgent',
      'homeType',
      'howSoonSell',
      'wantToSetAppointment'
    ];
    
    // List of fields that should only be sent if they have a value
    const valueRequiredFields = [
      'remainingMortgage',
      'finishedSquareFootage',
      'basementSquareFootage'
    ];
    
    // Remove qualifying fields that haven't been interacted with
    qualifyingFields.forEach(field => {
      // Only include field if it's been explicitly interacted with or set by an API
      const hasBeenInteractedWith = data.interactedFields[field];
      const hasValidValue = data[field] !== undefined && data[field] !== '';
      
      if (!hasBeenInteractedWith && !hasValidValue) {
        delete cleanData[field];
        console.log(`Removed ${field} from Zoho submission - no user interaction`);
      }
    });
    
    // Remove value fields that don't have values set
    valueRequiredFields.forEach(field => {
      // Check if field has a valid numeric value
      const hasValue = data[field] !== undefined && 
                       data[field] !== null && 
                       data[field] !== '' && 
                       !isNaN(data[field]) && 
                       data[field] > 0;
      
      // Check if field has been set by API or user
      const hasBeenInteractedWith = data.interactedFields[field];
      
      if (!hasValue && !hasBeenInteractedWith) {
        delete cleanData[field];
        console.log(`Removed ${field} from Zoho submission - no value set`);
      }
    });
    
    // Remove the interactedFields tracker from the data sent to Zoho
    delete cleanData.interactedFields;
    
    return cleanData;
  };

  // Submit initial lead to Zoho
  const submitLead = async () => {
    setFormData(prev => ({ ...prev, submitting: true }));
    
    // Check if we already have a lead ID from the suggestion tracking
    const existingLeadId = localStorage.getItem('suggestionLeadId') || leadId;
    
    // Prepare data by removing uninteracted fields
    const cleanedFormData = prepareDataForZoho(formData);
    
    // Add enhanced logging for property data
    console.log("Submitting lead with cleaned form data:", {
      existingLeadId: existingLeadId || 'None',
      name: cleanedFormData.name,
      phone: cleanedFormData.phone,
      street: cleanedFormData.street,
      needsRepairs: cleanedFormData.needsRepairs,
      wantToSetAppointment: cleanedFormData.wantToSetAppointment,
      selectedAppointmentDate: cleanedFormData.selectedAppointmentDate,
      selectedAppointmentTime: cleanedFormData.selectedAppointmentTime,
      apiOwnerName: cleanedFormData.apiOwnerName,
      apiEstimatedValue: cleanedFormData.apiEstimatedValue,
      apiMaxHomeValue: cleanedFormData.apiMaxHomeValue,
      formattedApiEstimatedValue: cleanedFormData.formattedApiEstimatedValue,
      apiEquity: cleanedFormData.apiEquity,
      apiPercentage: cleanedFormData.apiPercentage,
      userTypedAddress: cleanedFormData.userTypedAddress,
      selectedSuggestionAddress: cleanedFormData.selectedSuggestionAddress,
      leadStage: cleanedFormData.leadStage,
      propertyRecord: cleanedFormData.propertyRecord ? 'Available' : 'Not available'
    });
    
    try {
      let id;
      
      if (existingLeadId) {
        // If we already have a lead ID, update it instead of creating a new one
        console.log("Updating existing lead:", existingLeadId, "with name/phone:", {
          name: cleanedFormData.name,
          phone: cleanedFormData.phone
        });
        
        // Create updated data with explicit leadStage change
        const updatedData = {
          ...cleanedFormData,
          name: cleanedFormData.name, // Explicitly include name
          phone: cleanedFormData.phone, // Explicitly include phone
          leadStage: 'Contact Info Provided' // Update the lead stage
        };
        
        await updateLeadInZoho(existingLeadId, updatedData);
        id = existingLeadId;
      } else {
        // If no existing lead, create a new one
        console.log("Creating new lead with cleaned data");
        id = await submitLeadToZoho(cleanedFormData);
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
    
    // Clean data by removing uninteracted fields
    const cleanedFormData = prepareDataForZoho(formData);
    
    if (!existingLeadId) {
      console.warn("No lead ID available - will create a new lead instead of updating");
      try {
        // Create a new lead instead of updating
        const newLeadId = await submitLeadToZoho(cleanedFormData);
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
      console.log("Updating lead in Zoho with cleaned data:", existingLeadId);
      
      // Log property and address data being sent in update
      if (cleanedFormData.apiEstimatedValue || cleanedFormData.apiOwnerName || cleanedFormData.apiEquity || 
          cleanedFormData.needsRepairs || cleanedFormData.selectedAppointmentTime ||
          cleanedFormData.userTypedAddress || cleanedFormData.selectedSuggestionAddress) {
        console.log("Including property, appointment, and address data in update:", {
          apiOwnerName: cleanedFormData.apiOwnerName,
          apiEstimatedValue: cleanedFormData.apiEstimatedValue,
          apiMaxHomeValue: cleanedFormData.apiMaxHomeValue,
          apiEquity: cleanedFormData.apiEquity,
          apiPercentage: cleanedFormData.apiPercentage,
          needsRepairs: cleanedFormData.needsRepairs,
          wantToSetAppointment: cleanedFormData.wantToSetAppointment,
          selectedAppointmentDate: cleanedFormData.selectedAppointmentDate,
          selectedAppointmentTime: cleanedFormData.selectedAppointmentTime,
          userTypedAddress: cleanedFormData.userTypedAddress,
          selectedSuggestionAddress: cleanedFormData.selectedSuggestionAddress,
          leadStage: cleanedFormData.leadStage
        });
      }
      
      await updateLeadInZoho(existingLeadId, cleanedFormData);
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

  // Helper function to extract and process campaign data from URL params
  const extractCampaignData = (urlParams) => {
    // Extract URL parameters
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
    
    return {
      keyword,
      campaignId,
      campaignName,
      adgroupId,
      adgroupName,
      device,
      gclid,
      url: window.location.href
    };
  };

  // Helper function to push campaign data to analytics platforms
  const trackCampaignView = (campaignData) => {
    const { keyword, campaignId, campaignName, adgroupId, adgroupName, device, gclid } = campaignData;
    
    if (campaignId) {
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
      
      console.log('Campaign tracking initialized:', campaignData);
    } else {
      // If no campaign parameters, track as direct traffic
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'organic_page_view',
        'traffic_source': 'direct'
      });
    }
  };

  // Track whether URL parameters have already been processed
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);
  
  // Use ref to store campaign data for persistence
  const campaignDataRef = React.useRef(null);
  
  // Initialize from localStorage if available
  useEffect(() => {
    try {
      // Check for campaign data in localStorage
      const storedCampaignData = localStorage.getItem('campaignData');
      if (storedCampaignData) {
        const parsedData = JSON.parse(storedCampaignData);
        console.log("Found stored campaign data:", parsedData);
        
        // Store in ref for persistence
        campaignDataRef.current = parsedData;
        
        // Update form data directly
        setFormData(prevData => ({
          ...prevData,
          ...parsedData,
          trafficSource: parsedData.campaignId ? 'Google Search' : 'Direct'
        }));
      }
    } catch (e) {
      console.error("Failed to retrieve campaign data from localStorage:", e);
    }
  }, []);
  
  // Initialize dynamic content from URL parameters and setup analytics tracking
  const initFromUrlParams = () => {
    // Only process URL parameters once
    if (urlParamsProcessed) {
      // If we already processed but need to access the campaign data again,
      // return it from our persistent ref
      if (campaignDataRef.current) {
        console.log("Using cached campaign data:", campaignDataRef.current);
      }
      return true; // Already processed
    }
    
    // Mark as processed immediately to prevent future calls
    setUrlParamsProcessed(true);
    
    // Get URL parameters once
    const urlParams = new URLSearchParams(window.location.search);
    
    // Extract and process campaign data 
    const campaignData = extractCampaignData(urlParams);
    
    // Store campaign data in ref for persistence
    campaignDataRef.current = campaignData;
    
    // Track in analytics
    trackCampaignView(campaignData);
    
    // Always update form data with campaign info (even if empty)
    // This ensures consistent state updates
    if (campaignData.campaignId) {
      // Use direct state update instead of updateFormData to ensure immediate update
      setFormData(prevData => {
        const newData = {
          ...prevData,
          ...campaignData,
          trafficSource: campaignData.campaignId ? 'Google Search' : 'Direct'
        };
        
        // Store in localStorage for persistence across refreshes
        try {
          localStorage.setItem('campaignData', JSON.stringify(campaignData));
        } catch (e) {
          console.error("Failed to store campaign data in localStorage:", e);
        }
        
        return newData;
      });
      
      // Set the dynamic content based on these parameters
      setDynamicContent(campaignData.keyword, campaignData.campaignId, campaignData.adgroupId);
      return true;
    }
    
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