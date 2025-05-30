import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { submitLeadToFirebase, updateLeadInFirebase, updateContactInfo, createImmediateLead } from '../services/firebase';
import { useNotifications } from '../hooks/useNotifications';

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
  dynamicHeadline: 'Need to Sell Your Home Extremely Fast?',
  dynamicSubHeadline: 'Get a great cash offer today. Close in 7 days. No showings, no repairs, no stress',
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
  basementSquareFootage: 1000,   // UI shows default but only sent if user interacts or API sets it
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
  
  // Initialize centralized notification system
  // This automatically monitors formData changes and sends notifications
  const notificationStatus = useNotifications(formData, leadId);
  
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
    
    // SECONDARY SYNC: Auto-sync campaign data to Firebase when it gets updated
    const campaignFields = [
      'campaign_name', 'campaign_id', 'adgroup_id', 'adgroup_name', 
      'keyword', 'device', 'gclid', 'traffic_source', 'matchtype', 'url'
    ];
    
    const hasCampaignUpdates = campaignFields.some(field => updates.hasOwnProperty(field));
    
    if (hasCampaignUpdates) {
      const leadId = localStorage.getItem('leadId');
      if (leadId) {
        // Extract only campaign fields for Firebase update
        const campaignUpdates = {};
        campaignFields.forEach(field => {
          if (updates.hasOwnProperty(field)) {
            campaignUpdates[field] = updates[field];
          }
        });
        
        console.log('🔄 Auto-syncing campaign data to Firebase:', campaignUpdates);
        updateLeadInFirebase(leadId, campaignUpdates)
          .then(() => console.log('✅ Campaign data synced to Firebase'))
          .catch(err => console.error('❌ Campaign sync failed:', err));
      }
    }
  };

  // Handle form step navigation
  const nextStep = () => {
    // Debug logging to help track form navigation
    console.log('FORM NAVIGATION: nextStep() called from FormContext');
    console.log('Current formStep:', formData.formStep);
    
    // Simply move to the next step - tracking will be handled by components
    const newStep = formData.formStep + 1;
    console.log('New formStep will be:', newStep);
    
    setFormData(prev => ({ ...prev, formStep: newStep }));

    // Save current step to localStorage to persist across page refreshes
    localStorage.setItem('formStep', newStep.toString());
    console.log('formStep saved to localStorage:', newStep.toString());
    
    // Return the new step for debugging
    return newStep;
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

  // Helper function to clean data before sending to Firebase
  const prepareDataForFirebase = (data) => {
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
        console.log(`Removed ${field} from Firebase submission - no user interaction`);
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
        console.log(`Removed ${field} from Firebase submission - no value set`);
      }
    });
    
    // Keep interactedFields for Firebase - it will handle it appropriately
    
    return cleanData;
  };

  // Submit initial lead to Firebase
  const submitLead = async () => {
    setFormData(prev => ({ ...prev, submitting: true }));
    
    // Check if we already have a lead ID from the suggestion tracking
    const existingLeadId = localStorage.getItem('suggestionLeadId') || leadId;
    
    // Prepare data by removing uninteracted fields
    const cleanedFormData = prepareDataForFirebase(formData);
    
    // Add enhanced logging for property data and campaign data
    console.log("Submitting lead to Firebase with cleaned form data:", {
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
    
    // Add extra debugging specifically for campaign data and keyword
    console.log("%c CRITICAL - CAMPAIGN & KEYWORD DATA CHECK", "background: #4caf50; color: white; font-size: 14px; padding: 5px;");
    console.log("Campaign data:", {
      keyword: cleanedFormData.keyword || 'NOT SET',
      keywordLength: cleanedFormData.keyword ? cleanedFormData.keyword.length : 0,
      keywordType: typeof cleanedFormData.keyword,
      campaign_id: cleanedFormData.campaign_id || 'NOT SET',
      campaign_name: cleanedFormData.campaign_name || 'NOT SET',
      adgroup_id: cleanedFormData.adgroup_id || 'NOT SET',
      adgroup_name: cleanedFormData.adgroup_name || 'NOT SET',  
      device: cleanedFormData.device || 'NOT SET',
      gclid: cleanedFormData.gclid || 'NOT SET',
      matchtype: cleanedFormData.matchtype || 'NOT SET',
      templateType: cleanedFormData.templateType || 'NOT SET'
    });
    
    try {
      let id;
      
      if (existingLeadId) {
        // If we already have a lead ID, update it instead of creating a new one
        console.log("Updating existing lead in Firebase:", existingLeadId, "with name/phone:", {
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
        
        await updateLeadInFirebase(existingLeadId, updatedData);
        id = existingLeadId;
      } else {
        // If no existing lead, create a new one
        console.log("Creating new lead in Firebase with cleaned data");
        id = await submitLeadToFirebase(cleanedFormData);
      }
      
      console.log("Firebase lead operation successful, ID:", id);
      
      // If we got any ID, save it
      if (id) {
        setLeadId(id);
        // Also store in localStorage right away to ensure it's saved
        localStorage.setItem('leadId', id);
        console.log("Successfully saved Firebase lead ID:", id);
        
        // Lead already exists from immediate creation, no need for visitor upgrade
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
      console.error("Failed to submit lead to Firebase:", error);
      setFormData(prev => ({ 
        ...prev, 
        submitting: false, 
        submissionError: error.message || "Failed to submit. Please try again." 
      }));
      return false;
    }
  };

  // Update lead information in Firebase, or create a new lead if no ID exists
  const updateLead = async () => {
    // Get the existing lead ID from suggestion tracking or regular flow
    const existingLeadId = localStorage.getItem('suggestionLeadId') || leadId;
    
    // Throttle updates to avoid overloading the API
    const now = Date.now();
    if (lastUpdateTime && now - lastUpdateTime < 2000) {
      console.log("Throttling update - too soon after last update");
      return true; // Pretend success but don't actually send the request
    }
    
    setLastUpdateTime(now);
    
    // Clean data by removing uninteracted fields
    const cleanedFormData = prepareDataForFirebase(formData);
    
    // Add detailed logging for campaign data in the update
    console.log("%c UPDATE LEAD IN FIREBASE - CAMPAIGN & KEYWORD DATA CHECK", "background: #9c27b0; color: white; font-size: 14px; padding: 5px;");
    console.log("Campaign data for update:", {
      keyword: cleanedFormData.keyword || 'NOT SET',
      keywordLength: cleanedFormData.keyword ? cleanedFormData.keyword.length : 0,
      keywordType: typeof cleanedFormData.keyword,
      campaign_id: cleanedFormData.campaign_id || 'NOT SET',
      campaign_name: cleanedFormData.campaign_name || 'NOT SET',
      adgroup_id: cleanedFormData.adgroup_id || 'NOT SET',
      adgroup_name: cleanedFormData.adgroup_name || 'NOT SET',  
      device: cleanedFormData.device || 'NOT SET',
      gclid: cleanedFormData.gclid || 'NOT SET',
      matchtype: cleanedFormData.matchtype || 'NOT SET',
      templateType: cleanedFormData.templateType || 'NOT SET'
    });
    
    if (!existingLeadId) {
      console.warn("No lead ID available - will create a new lead in Firebase instead of updating");
      try {
        // Create a new lead instead of updating
        const newLeadId = await submitLeadToFirebase(cleanedFormData);
        if (newLeadId) {
          console.log("Created a new lead in Firebase instead:", newLeadId);
          setLeadId(newLeadId);
          localStorage.setItem('leadId', newLeadId);
          localStorage.setItem('suggestionLeadId', newLeadId);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to create replacement lead in Firebase:", error);
        return false;
      }
    }
    
    try {
      console.log("Updating lead in Firebase with cleaned data:", existingLeadId);
      
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
      
      await updateLeadInFirebase(existingLeadId, cleanedFormData);
      console.log("Lead updated successfully in Firebase");
      return true;
    } catch (error) {
      console.error("Failed to update lead in Firebase:", error);
      return false;
    }
  };

  // ================================================================================
  // DYNAMIC CONTENT SYSTEM - CAMPAIGN-BASED TEMPLATE SELECTION
  // ================================================================================
  // 
  // EDITING INSTRUCTIONS:
  // 1. To add new campaign templates, update the 'campaignTemplates' object below
  // 2. To modify matching logic, update the keyword checks (lines 567-597)
  // 3. To change priority order, modify the if/else chain (lines 578-597)
  // 4. All fallback defaults are in the 'defaultContent' object
  //
  // HOW IT WORKS:
  // - Reads campaign_name from URL parameters (multiple formats supported)
  // - Simplifies campaign name for keyword matching (removes spaces, lowercase)
  // - Matches keywords: "cash" > "value" > "fast" > default
  // - Updates formData with selected template content
  //
  // ================================================================================
  
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
    
    // ================================================================================
    // CAMPAIGN TEMPLATES - ADD NEW TEMPLATES HERE
    // ================================================================================
    // 
    // EDITING INSTRUCTIONS:
    // - To add a new template, copy an existing template and modify the content
    // - Template key should match the keyword you want to detect in campaign names
    // - All templates should include: headline, subHeadline, buttonText, thankYou messages
    //
    // ================================================================================
    
    const campaignTemplates = {
      // CASH TEMPLATE - Triggered by "cash" in campaign name
      "cash": {
        type: 'CASH',
        headline: 'Need to Sell Your Home For Cash Fast?',
        subHeadline: 'Get a great cash offer today. Close in 7 days. No showings, no repairs, no stress',
        thankYouHeadline: 'Cash Offer Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your no obligation cash offer at your contact number shortly, thank you!',
        buttonText: 'CHECK OFFER'
      },
      
      // FAST TEMPLATE - Triggered by "fast" in campaign name  
      "fast": {
        type: 'FAST',
        headline: 'Sell Your Home In 10 Days or Less',
        subHeadline: 'Skip the repairs and listings. Get a no-obligation cash offer today and close on your terms. No fees, no stress',
        thankYouHeadline: 'Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your fast sale details at your contact number shortly, thank you!',
        buttonText: 'CHECK OFFER'
      },
      
      // VALUE TEMPLATE - Triggered by "value" in campaign name
      "value": {
        type: 'VALUE',
        headline: 'Need to Check Your Home Value Fast?',
        subHeadline: 'Find out how much equity you have now.',
        thankYouHeadline: 'Home Value Request Completed!',
        thankYouSubHeadline: 'You\'ll be receiving your home value details at your contact number shortly, thank you!',
        buttonText: 'CHECK VALUE'
      }
    };
    
    // Default content if no campaign matches
    const defaultContent = {
      type: 'DEFAULT',
      headline: 'Need to Sell Your House Extremely Fast?',
      subHeadline: 'Get a great cash offer today. Close in 7 days. No showings, no repairs, no stress',
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

  // Helper function to search for all potential variations of a URL parameter
  const findParameterAllFormats = (urlParams, baseNames) => {
    // Try all the different variations of parameter naming
    for (const baseName of baseNames) {
      // Try with different casings and formats
      const variations = [
        baseName,                       // e.g., "adgroupname"
        baseName.replace(/([A-Z])/g, '_$1').toLowerCase(), // camelCase to snake_case
        baseName.replace(/_/g, '-'),    // snake_case to kebab-case
        baseName.replace(/_/g, ''),     // remove underscores
        'utm_' + baseName.replace(/_/g, '') // UTM format
      ];
      
      // Try all variations
      for (const variant of variations) {
        const value = urlParams.get(variant);
        if (value) {
          console.log(`Found parameter ${baseName} as ${variant}: "${value}"`);
          return value;
        }
      }
    }
    
    console.log(`Parameter not found with any variation of ${baseNames.join(', ')}`);
    return '';
  };

  // Helper function to extract and process campaign data from URL params
  const extractCampaignData = (urlParams) => {
    // Extract URL parameters directly from tracking template format
    // Using snake_case internally for consistency in our system
    
    // Check for keyword with a fallback check to utm_term (another common parameter)
    const keyword = urlParams.get('keyword') || urlParams.get('utm_term') || '';
    
    // Print the keyword to console for debugging
    console.log('KEYWORD FROM URL: "' + keyword + '"');
    
    const campaign_id = urlParams.get('campaignid') || '';
    const adgroup_id = urlParams.get('adgroupid') || '';
    const device = urlParams.get('device') || '';
    const gclid = urlParams.get('gclid') || '';
    const matchtype = urlParams.get('matchtype') || '';
    
    // Get campaign name using our robust parameter finder
    let campaign_name = findParameterAllFormats(urlParams, ['campaignname', 'campaign_name', 'campaignName', 'campaign']);
    
    // Properly decode the campaign name to handle any special characters
    if (campaign_name) {
      try {
        campaign_name = decodeURIComponent(campaign_name);
      } catch (e) {
        console.warn(`Error decoding campaign name:`, e);
      }
      console.log(`Found campaign name in URL: ${campaign_name}`);
    }
    
    // If no campaign name in URL, default to 'Organic'
    if (!campaign_name) {
      campaign_name = 'Organic';
    }
    
    console.log('Final processed campaign name:', campaign_name);
    
    // Check for keywords in the campaign name for debugging
    if (campaign_name) {
      const lcName = campaign_name.toLowerCase();
      console.log('Campaign name keyword checks:', {
        hasCash: lcName.includes('cash'),
        hasFast: lcName.includes('fast'),
        hasValue: lcName.includes('value')
      });
    }
    
    // Get adgroup name using our robust parameter finder
    // This will check all possible variations of the parameter name
    let adgroup_name = findParameterAllFormats(urlParams, ['adgroupname', 'adgroup_name', 'adgroupName', 'adgroup']);
    
    // Log the raw adgroup name for debugging
    console.log('Final adgroup_name from URL:', adgroup_name);
    
    // Normalize adgroup name if needed
    if (adgroup_name.includes('%20')) {
      try {
        adgroup_name = decodeURIComponent(adgroup_name);
        console.log('Decoded adgroup_name:', adgroup_name);
      } catch (e) {
        console.warn('Error decoding adgroup name:', e);
      }
    }
    
    return {
      keyword,
      campaign_id,
      campaign_name,
      adgroup_id,
      adgroup_name,
      device,
      gclid,
      matchtype,
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
        'matchtype': campaignData.matchtype || '',
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
  
  // Track whether immediate lead has been created for this session
  const [immediateLeadCreated, setImmediateLeadCreated] = useState(false);
  
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
    
    // Check if we have any campaign parameters (including UTM parameters as fallback)
    const hasCampaignParams = urlParams.has('campaignid') || 
                             urlParams.has('keyword') || 
                             urlParams.has('utm_campaign') || 
                             urlParams.has('utm_term');
    console.log("Has campaign parameters:", hasCampaignParams);
    
    // Log all URL parameters for debugging
    console.log("ALL URL PARAMETERS:");
    for (const [key, value] of urlParams.entries()) {
      console.log(`URL param - ${key}: "${value}"`);
    }
    
    // Specifically check for adgroup name parameter
    console.log("ADGROUP NAME PARAM CHECK:");
    console.log("adgroupname:", urlParams.get('adgroupname'));
    console.log("adgroup_name:", urlParams.get('adgroup_name'));
    console.log("adgroup-name:", urlParams.get('adgroup-name'));
    console.log("utm_adgroup:", urlParams.get('utm_adgroup'));
    
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
    
    // Create leads for ALL visitors regardless of campaign data
    console.log("Processing visitor with campaign data:", campaignData);
    
    // Always process - no campaign data required
    {
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
        
        // Store in both localStorage and sessionStorage for persistence
        try {
          // Enhanced version with debug info
          const storableData = {
            ...campaignData,
            timestamp: new Date().toISOString(),
            debugInfo: {
              adgroup_nameDetected: !!campaignData.adgroup_name,
              adgroup_nameLength: campaignData.adgroup_name ? campaignData.adgroup_name.length : 0,
              keywordDetected: !!campaignData.keyword,
              keywordLength: campaignData.keyword ? campaignData.keyword.length : 0
            }
          };
          
          // Store in both localStorage (long term) and sessionStorage (for debugging)
          localStorage.setItem('campaignData', JSON.stringify(storableData));
          sessionStorage.setItem('campaignData', JSON.stringify(storableData));
          console.log("Stored campaign data in localStorage and sessionStorage with debug info");
        } catch (e) {
          console.error("Failed to store campaign data in storage:", e);
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
        
        // Create immediate lead for ALL visitors (not just campaign traffic)
        // BUT skip admin/CRM pages
        const currentPath = window.location.pathname;
        const isAdminPage = currentPath.includes('/admin') || currentPath.includes('/crm');
        
        if (isAdminPage) {
          console.log('🚫 Skipping lead creation - admin/CRM page detected:', currentPath);
          return true;
        }
        
        // Check if we already have a leadId for this session
        const existingLeadId = localStorage.getItem('leadId');
        
        // Also check if creation is already in progress using a synchronous flag
        const creationInProgress = localStorage.getItem('leadCreationInProgress');
        
        if (existingLeadId) {
          console.log('🔄 Immediate lead already exists for this session:', existingLeadId);
          setLeadId(existingLeadId);
        } else if (creationInProgress) {
          console.log('⏳ Lead creation already in progress, skipping duplicate');
        } else {
          console.log('📊 Creating immediate lead for visitor (first time this session)');
          
          // Set flag immediately to prevent duplicate creation
          localStorage.setItem('leadCreationInProgress', 'true');
          
          createImmediateLead({
            ...campaignData,
            variant: urlParams.get('variant') || urlParams.get('split_test') || 'AAA'
          }).then(leadId => {
            if (leadId) {
              console.log('✅ Immediate lead created:', leadId);
              setLeadId(leadId);
              localStorage.setItem('leadId', leadId);
              localStorage.setItem('suggestionLeadId', leadId);
              localStorage.removeItem('leadCreationInProgress'); // Clear the flag
            }
          }).catch(error => {
            console.error('❌ Failed to create immediate lead:', error);
            localStorage.removeItem('leadCreationInProgress'); // Clear the flag on error
          });
        }
      }, 0);
      return true;
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
      setDynamicContent,
      initFromUrlParams,
      clearFormData
    }}>
      {children}
    </FormContext.Provider>
  );
}