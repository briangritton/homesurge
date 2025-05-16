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
  traffic_source: 'Direct',
  campaign_id: '',
  campaign_name: '',
  adgroup_id: '',
  adgroup_name: '',
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
    
    // ONLY SET USER ID - NOT CAMPAIGN DATA
    // Campaign data will be handled by initFromUrlParams
    setFormData(prev => ({
      ...prev,
      userId,
      url: window.location.href
    }));
    
    // Check if we have stored form data from a previous session
    const storedFormData = localStorage.getItem('formData');
    if (storedFormData) {
      try {
        const parsedData = JSON.parse(storedFormData);
        
        // Filter out campaign tracking fields to prevent duplicated or conflicting updates
        // We'll handle those separately in initFromUrlParams
        const {
          campaign_id, campaign_name, adgroup_id, adgroup_name, 
          keyword, device, gclid, traffic_source, ...otherData
        } = parsedData;
        
        // Only update non-campaign data
        setFormData(prev => ({...prev, ...otherData}));
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

  // Simplified dynamic content handler based only on campaign name
  const setDynamicContent = (keyword, campaign_id, adgroup_id) => {
    // Always get campaign name directly from URL
    const urlParams = new URLSearchParams(window.location.search);
    
    // Try various parameter naming conventions
    let campaignName = '';
    const possibleParamNames = ['campaign_name', 'campaignname', 'campaign-name', 'utm_campaign'];
    
    for (const paramName of possibleParamNames) {
      const value = urlParams.get(paramName);
      if (value) {
        campaignName = value;
        break;
      }
    }
    
    // If no campaign name in URL, use the one in form state
    if (!campaignName) {
      campaignName = formData.campaign_name || '';
    }
    
    // Log information about the current campaign name we'll use for matching
    console.log('Using campaign name for template selection:', campaignName);
    
    // Simplified campaign templates by type
    const campaignTemplates = {
      // Template types
      "cash": {
        type: 'CASH',
        headline: 'Need to Sell Your House For Cash Fast?',
        subHeadline: 'Get a great cash offer today. Close in 7 days. No agents, no repairs, no stress.',
        thankYouHeadline: 'Cash Offer Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your no obligation cash offer at your contact number shortly, thank you!',
        buttonText: 'CHECK OFFER'
      },
      "fast": {
        type: 'FAST',
        headline: 'Sell Your House In 10 Days or Less',
        subHeadline: 'Skip the repairs and listings. Get a no-obligation cash offer today and close on your terms. No fees, no stress.',
        thankYouHeadline: 'Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your fast sale details at your contact number shortly, thank you!',
        buttonText: 'CHECK OFFER'
      },
      "value": {
        type: 'VALUE',
        headline: 'Check The Value Of Your House!',
        subHeadline: 'Find out how much your home is worth today.',
        thankYouHeadline: 'Home Value Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your home value details at your contact number shortly, thank you!',
        buttonText: 'CHECK VALUE'
      }
    };
    
    // Default content if no campaign matches
    const defaultContent = {
      type: 'DEFAULT',
      headline: 'Need to Sell Your House For Cash Fast?',
      subHeadline: 'Get a great cash offer today. Close in 7 days. No agents, no repairs, no stress.',
      buttonText: 'CHECK OFFER',
      thankYouHeadline: 'Request Completed!',
      thankYouSubHeadline: 'You\'ll be receiving your requested details at your contact number shortly, thank you!'
    };
    
    // Identify which template to use based on campaign name
    let contentTemplate = null;
    let templateType = 'DEFAULT'; // For debugging
    
    if (campaignName) {
      // Clean the campaign name to handle any encoding issues or special characters
      const cleanCampaignName = campaignName
        .replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII characters
        .trim();                      // Remove leading/trailing whitespace
      
      // Simplify campaign name for matching (remove spaces, convert to lowercase)
      const simplifiedCampaignName = cleanCampaignName.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      // Log each step of the process
      console.log('Original campaign name:', campaignName);
      console.log('Cleaned campaign name:', cleanCampaignName);
      console.log('Simplified campaign name for matching:', simplifiedCampaignName);
      
      // Simple keyword checks on the simplified name
      const hasCash = simplifiedCampaignName.includes('cash');
      const hasFast = simplifiedCampaignName.includes('fast');
      const hasValue = simplifiedCampaignName.includes('value');
      
      console.log('Contains "cash":', hasCash);
      console.log('Contains "fast":', hasFast);
      console.log('Contains "value":', hasValue);
      
      // Simple, straightforward content selection by keyword in campaign name
      // Priority: cash > value > fast (as requested)
      if (hasCash) {
        console.log('Campaign name contains "cash" - using CASH template');
        contentTemplate = campaignTemplates.cash;
        templateType = 'CASH';
      } 
      else if (hasValue) {
        console.log('Campaign name contains "value" - using VALUE template');
        contentTemplate = campaignTemplates.value;
        templateType = 'VALUE';
      } 
      else if (hasFast) {
        console.log('Campaign name contains "fast" - using FAST template');
        contentTemplate = campaignTemplates.fast;
        templateType = 'FAST';
      } 
      else {
        // No keyword match
        console.log('No matching keyword in campaign name - using default template');
        contentTemplate = defaultContent;
      }
      
      console.log('Selected template type:', templateType);
    } else {
      // No campaign name at all
      console.log('No campaign name available - using default template');
      contentTemplate = defaultContent;
    }
    
    // If we still don't have a template, use default
    if (!contentTemplate) {
      console.log('No template match found - using default content');
      contentTemplate = defaultContent;
    }
    
    // Apply the selected template and update form state
    console.log('Applying content template:', contentTemplate);
    
    // Create a summary of the decision process
    console.log('Template selection summary:', {
      campaignName,
      matchedKeywords: {
        cash: campaignName && campaignName.toLowerCase().includes('cash'),
        fast: campaignName && campaignName.toLowerCase().includes('fast'),
        value: campaignName && campaignName.toLowerCase().includes('value')
      },
      selectedTemplate: templateType
    });
    
    setFormData(prevData => ({
      ...prevData,
      // Ensure campaign name is stored in form state
      campaign_name: campaignName || prevData.campaign_name,
      // Set dynamic content
      dynamicHeadline: contentTemplate.headline,
      dynamicSubHeadline: contentTemplate.subHeadline,
      thankYouHeadline: contentTemplate.thankYouHeadline || 'Request Completed!',
      thankYouSubHeadline: contentTemplate.thankYouSubHeadline || 'You\'ll be receiving your requested details at your contact number shortly, thank you!',
      buttonText: contentTemplate.buttonText || 'CHECK OFFER',
      templateType: templateType // Store template type for debugging
    }));
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
    const campaign_id = urlParams.get('campaignid') || '';
    const adgroup_id = urlParams.get('adgroupid') || '';
    const device = urlParams.get('device') || '';
    const gclid = urlParams.get('gclid') || '';
    
    // Try to get campaign_name from URL, checking all possible parameter names
    let campaignName = '';
    
    // Check multiple possible parameter names for campaign name
    const possibleParamNames = [
      'campaign_name',
      'campaignname',
      'campaign name',
      'campaign-name',
      'utm_campaign',
      'utmcampaign'
    ];
    
    for (const paramName of possibleParamNames) {
      const value = urlParams.get(paramName);
      if (value) {
        // Properly decode the campaign name to handle any special characters
        try {
          campaignName = decodeURIComponent(value);
        } catch (e) {
          campaignName = value;
          console.warn(`Error decoding campaign name from ${paramName}:`, e);
        }
        console.log(`Found campaign name in parameter "${paramName}": ${campaignName}`);
        break;
      }
    }
    
    // If we have a direct campaign name from the URL, use it
    // Otherwise, determine campaign name based on campaign_id
    if (!campaignName) {
      if (campaign_id === "20196006239") {
        campaignName = "Sell For Cash Form Submit (Google only)";
      } else if (campaign_id === "20490389456") {
        campaignName = "Sell For Cash Form Submit (Search Partners)";
      } else if (campaign_id === "20311247419") {
        campaignName = "Sell Fast, On Own, No Agent, Form Submit (Google only)";
      } else if (campaign_id === "20490511649") {
        campaignName = "Sell Fast, On Own, No Agent, Form Submit (Search Partners)";
      } else {
        campaignName = 'Organic'; 
      }
    }
    
    console.log('Final processed campaign name:', campaignName);
    
    // Check for keywords in the campaign name for debugging
    if (campaignName) {
      const lcName = campaignName.toLowerCase();
      console.log('Campaign name keyword checks:', {
        hasCash: lcName.includes('cash'),
        hasFast: lcName.includes('fast'),
        hasValue: lcName.includes('value')
      });
    }
    
    // Try to get adgroup name directly from URL
    let adgroup_name = urlParams.get('adgroup_name') || '';
    
    // If not present, try alternate format
    if (!adgroup_name) {
      adgroup_name = urlParams.get('adgroupname') || '';
    }
    
    // Normalize adgroup name if needed
    if (adgroup_name.includes('%20')) {
      try {
        adgroup_name = decodeURIComponent(adgroup_name);
      } catch (e) {
        console.warn('Error decoding adgroup name:', e);
      }
    }
    
    // If we don't have an adgroup name from URL, determine it based on adgroup_id
    if (!adgroup_name) {
      if (adgroup_id === "149782006756" || adgroup_id === "151670982418" || 
          adgroup_id === "153325247952" || adgroup_id === "156355988601") {
        adgroup_name = "(exact)";
      } else if (adgroup_id === "153620745798" || adgroup_id === "156658963430" || 
                adgroup_id === "153325247992" || adgroup_id === "156355988761") {
        adgroup_name = "(phrase)";
      }
    }
    
    return {
      keyword,
      campaign_id,
      campaign_name: campaignName,
      adgroup_id,
      adgroup_name,
      device,
      gclid,
      url: window.location.href
    };
  };

  // Helper function to push campaign data to analytics platforms
  const trackCampaignView = (campaignData) => {
    const { keyword, campaign_id, campaign_name, adgroup_id, adgroup_name, device, gclid } = campaignData;
    
    if (campaign_id) {
      // Push event to Google Analytics (gtag)
      if (window.gtag) {
        window.gtag('set', {
          'campaign_id': campaign_id,
          'campaign_name': campaign_name,
          'campaign_source': 'google',
          'campaign_medium': 'cpc',
          'campaign_keyword': keyword,
          'adgroup_id': adgroup_id,
          'adgroup_name': adgroup_name,
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
        'campaign_id': campaign_id,
        'campaign_name': campaign_name,
        'adgroup_id': adgroup_id,
        'adgroup_name': adgroup_name,
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
          traffic_source: parsedData.campaign_id ? 'Google Search' : 'Direct'
        }));
      }
    } catch (e) {
      console.error("Failed to retrieve campaign data from localStorage:", e);
    }
  }, []);
  
  // Initialize dynamic content from URL parameters and setup analytics tracking
  const initFromUrlParams = () => {
    // Log the current URL for debugging
    console.log("Processing URL:", window.location.href);
    
    // Only process URL parameters once per session
    if (urlParamsProcessed) {
      // If we already processed but need to access the campaign data again,
      // return it from our persistent ref
      if (campaignDataRef.current) {
        console.log("Using cached campaign data:", campaignDataRef.current);
      }
      // Force a dynamic content refresh even for cached data
      console.log("==== RE-RUNNING CONTENT MATCHING WITH CACHED DATA ====");
      setDynamicContent(formData.keyword, formData.campaign_id, formData.adgroup_id);
      return true; // Already processed
    }
    
    // Mark as processed immediately to prevent future calls
    setUrlParamsProcessed(true);
    
    // Get URL parameters once
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if we have any campaign parameters
    const hasCampaignParams = urlParams.has('campaignid') || urlParams.has('keyword');
    console.log("Has campaign parameters:", hasCampaignParams);
    
    // If we don't have campaign params in URL but do have them in localStorage, use those
    if (!hasCampaignParams) {
      try {
        const storedData = localStorage.getItem('campaignData');
        if (storedData) {
          console.log("No URL params but found stored campaign data, using that instead");
          const parsedData = JSON.parse(storedData);
          if (parsedData && parsedData.campaign_id) {
            campaignDataRef.current = parsedData;
            
            // Update form state with stored data
            setFormData(prevData => ({
              ...prevData,
              ...parsedData,
              traffic_source: 'Google Search'
            }));
            
            return true;
          }
        }
      } catch (e) {
        console.error("Error reading stored campaign data:", e);
      }
    }
    
    // Extract and process campaign data 
    const campaignData = extractCampaignData(urlParams);
    
    // Check if we found valid campaign data from URL
    const hasValidCampaignData = campaignData && campaignData.campaign_id;
    console.log("Has valid campaign data:", hasValidCampaignData, campaignData);
    
    if (hasValidCampaignData) {
      // Store campaign data in ref for persistence
      campaignDataRef.current = campaignData;
      
      // Track in analytics
      trackCampaignView(campaignData);
      
      // Create update object with campaign data
      const updateObj = {
        ...campaignData,
        traffic_source: 'Google Search'
      };
      
      console.log("Updating form state with campaign data:", updateObj);
      
      // Update form state directly
      setFormData(prevData => {
        const newData = {
          ...prevData,
          ...updateObj
        };
        
        // Store in localStorage for persistence
        try {
          localStorage.setItem('campaignData', JSON.stringify(campaignData));
          console.log("Stored campaign data in localStorage");
        } catch (e) {
          console.error("Failed to store campaign data in localStorage:", e);
        }
        
        return newData;
      });
      
      // Wait a tick for form state to update before setting dynamic content
      setTimeout(() => {
        // Debug the exact campaign name string character by character
        console.log("Raw campaign name before setting dynamic content:", campaignData.campaign_name);
        
        // Now form state should include campaign name from URL
        console.log("Setting dynamic content with campaign name:", campaignData.campaign_name);
        
        // Explicitly call setDynamicContent - this will get the campaign name directly 
        // from URL params and form state, so we don't need to pass it here
        setDynamicContent(campaignData.keyword, campaignData.campaign_id, campaignData.adgroup_id);
      }, 0);
      return true;
    }
    
    console.log("No valid campaign data found");
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