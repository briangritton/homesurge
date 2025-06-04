import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOEm26rN6y-8T3A-SjqMoH4qJtjdi3H1A",
  authDomain: "sell-for-cash-454017.firebaseapp.com",
  projectId: "sell-for-cash-454017",
  storageBucket: "sell-for-cash-454017.firebasestorage.app",
  messagingSenderId: "961913513684",
  appId: "1:961913513684:web:57bd83f1867273bf437d41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Submit new lead to Firebase Firestore
 * @param {Object} formData - The form data to submit
 * @returns {Promise<string>} - The ID of the created lead
 */
/**
 * Create a lead immediately when user lands on page with campaign data
 * This ensures perfect attribution and variant tracking from the start
 */
// Rate limiting for immediate lead creation
let lastLeadCreation = 0;
const LEAD_CREATION_COOLDOWN = 1000; // 1 second between creations

export async function createImmediateLead(campaignData) {
  console.log("%c CREATE IMMEDIATE LEAD ON LANDING", "background: #2196F3; color: white; font-size: 16px; padding: 5px;");
  console.log("Campaign data captured:", campaignData);
  
  // Rate limiting to prevent Firebase overload
  const now = Date.now();
  if (now - lastLeadCreation < LEAD_CREATION_COOLDOWN) {
    console.log("Rate limited: Lead creation too frequent, skipping");
    return null;
  }
  lastLeadCreation = now;
  
  try {
    const db = getFirestore();
    const leadId = uuidv4();
    
    // Create lead document with campaign attribution locked in
    const leadData = {
      // Lead tracking
      id: leadId,
      status: 'New', // Show in sales dashboard immediately
      leadStage: 'Landing Page Visit',
      
      // Campaign attribution (captured immediately)
      campaign_name: campaignData.campaign_name || '',
      campaign_id: campaignData.campaign_id || '',
      adgroup_id: campaignData.adgroup_id || '',
      adgroup_name: campaignData.adgroup_name || '',
      keyword: campaignData.keyword || '',
      matchtype: campaignData.matchtype || '',
      device: campaignData.device || '',
      gclid: campaignData.gclid || '',
      traffic_source: campaignData.traffic_source || 'Direct',
      
      // Variant tracking (route-based system)
      variant: campaignData.variant || 'A1O',
      split_test: campaignData.split_test || campaignData.variant || 'A1O',
      
      // Route-based campaign and variant data
      routeCampaign: campaignData.routeCampaign || '',
      routeVariant: campaignData.routeVariant || campaignData.variant || 'A1O',
      
      // Page data
      url: window.location.href,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      
      // Empty fields to be filled later
      name: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      
      // BatchData fields (initialized empty)
      batchDataPhoneNumbers: [],
      batchDataEmails: [],
      batchDataProcessed: false,
      batchDataProcessedAt: '',
      batchDataReport: null, // Will be populated when BatchData processes
      
      // Activity fields (initialized empty)
      notes: '', // For manual notes entry
      
      // Timestamps
      visitedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Conversion tracking
      converted: false,
      convertedAt: null,
      
      // Assignment tracking (required by Firebase rules)
      assignedTo: null
    };
    
    // Debug: Log exactly what we're sending to Firebase
    console.log("🔍 Lead data being sent to Firebase:", JSON.stringify(leadData, null, 2));
    
    // Save to Firebase
    await setDoc(doc(db, 'leads', leadId), leadData);
    
    console.log("✅ Immediate lead created successfully:", leadId);
    return leadId;
    
  } catch (error) {
    console.error("❌ Failed to create immediate lead:", error);
    throw error;
  }
}

export async function submitLeadToFirebase(formData) {
  console.log("%c SUBMIT LEAD TO FIREBASE CALLED", "background: #4caf50; color: white; font-size: 16px; padding: 5px;");
  console.log("Form data provided:", {
    name: formData.name,
    address: formData.street,
    campaign_name: formData.campaign_name,
    campaign_id: formData.campaign_id,
    adgroup_name: formData.adgroup_name,
    adgroup_id: formData.adgroup_id,
    keyword: formData.keyword,
    matchtype: formData.matchtype,
    templateType: formData.templateType
  });
  
  try {
    // Get list of fields that should only be sent if they have been interacted with
    const qualifyingFields = [
      'isPropertyOwner',
      'needsRepairs', 
      'workingWithAgent',
      'homeType',
      'remainingMortgage',
      'finishedSquareFootage',
      'basementSquareFootage',
      'howSoonSell',
      'wantToSetAppointment'
    ];
    
    // Create cleaned data object
    const preparedData = {
      // Basic user info - always include these
      name: formData.name || '',
      phone: formData.phone || '',
      email: formData.email || '',
      
      // Add autofilled values if available
      autoFilledName: formData.autoFilledName || '',
      autoFilledPhone: formData.autoFilledPhone || '',
      
      // Address info - always include these
      street: formData.street || '',
      city: formData.city || '',
      zip: formData.zip || '',
      state: formData.state || 'GA',
      
      // Address tracking - always include these
      userTypedAddress: formData.userTypedAddress || '',
      selectedSuggestionAddress: formData.selectedSuggestionAddress || '',
      
      // Property data from Melissa API - include if available
      apiOwnerName: formData.apiOwnerName || '',
      apiEstimatedValue: formData.apiEstimatedValue?.toString() || '0',
      apiMaxHomeValue: formData.apiMaxHomeValue?.toString() || '0',
      formattedApiEstimatedValue: formData.formattedApiEstimatedValue || '$0',
      
      // New equity data - include if available
      apiEquity: formData.apiEquity?.toString() || '0',
      apiPercentage: formData.apiPercentage?.toString() || '0',
      
      // Location data - include if available
      location: formData.location ? JSON.stringify(formData.location) : '',
      
      // Tracking parameters - always include these
      traffic_source: formData.traffic_source || 'Direct',
      url: formData.url || '',
      gclid: formData.gclid || '',
      device: formData.device || '',
      campaign_name: formData.campaign_name || '',
      adgroup_name: formData.adgroup_name || '',
      keyword: formData.keyword || '',
      matchtype: formData.matchtype || '',
      campaign_id: formData.campaign_id || '',
      adgroup_id: formData.adgroup_id || '',
      templateType: formData.templateType || '',
      
      // Include dynamic content information
      dynamicHeadline: formData.dynamicHeadline || '',
      dynamicSubHeadline: formData.dynamicSubHeadline || '',
      
      // Metadata and selection type
      addressSelectionType: formData.addressSelectionType || 'Manual',
      leadSource: formData.leadSource || 'Website',
      leadStage: formData.leadStage || 'Unassigned',
      
      // System fields
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'Unassigned',
      assignedTo: null,
      // Default value for conversion tracking
      conversions: []
    };
    
    // Only add qualifying fields if they have values set or have been interacted with
    qualifyingFields.forEach(field => {
      const hasValidValue = formData[field] !== undefined && formData[field] !== '';
      const hasBeenInteractedWith = formData.interactedFields && formData.interactedFields[field];
      
      if (hasValidValue || hasBeenInteractedWith) {
        // For numeric fields, add toString() to ensure proper format
        if (typeof formData[field] === 'number') {
          preparedData[field] = formData[field].toString();
        } else {
          preparedData[field] = formData[field];
        }
      } else {
        // Log fields we're NOT sending
        console.log(`Not sending field ${field} to Firebase - no value set or user interaction`);
      }
    });
    
    // Additional fields to include only if they have valid values
    if (formData.selectedAppointmentDate) {
      preparedData.selectedAppointmentDate = formData.selectedAppointmentDate;
    }
    
    if (formData.selectedAppointmentTime) {
      preparedData.selectedAppointmentTime = formData.selectedAppointmentTime;
    }
    
    if (formData.bedrooms) {
      preparedData.bedrooms = formData.bedrooms.toString();
    }
    
    if (formData.bathrooms) {
      preparedData.bathrooms = formData.bathrooms.toString();
    }
    
    console.log("Creating lead in Firebase with data:", {
      needsRepairs: preparedData.needsRepairs,
      appointmentDate: preparedData.selectedAppointmentDate,
      appointmentTime: preparedData.selectedAppointmentTime,
      apiOwnerName: preparedData.apiOwnerName,
      apiEstimatedValue: preparedData.apiEstimatedValue,
      apiMaxHomeValue: preparedData.apiMaxHomeValue,
      apiEquity: preparedData.apiEquity,
      apiPercentage: preparedData.apiPercentage
    });
    
    // Create a new lead document with auto-generated ID
    const leadsCollection = collection(db, 'leads');
    const newLeadDoc = doc(leadsCollection);
    
    // Add lead ID to prepared data for reference
    preparedData.id = newLeadDoc.id;
    
    // Store lead in Firestore
    await setDoc(newLeadDoc, preparedData);
    
    // Push data to dataLayer for GTM tracking
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'leadCreated',
        leadId: newLeadDoc.id,
        formData: {
          name: preparedData.name,
          phone: preparedData.phone,
          email: preparedData.email,
          address: preparedData.street,
          city: preparedData.city,
          state: preparedData.state,
          zip: preparedData.zip
        },
        campaignData: {
          campaign_name: preparedData.campaign_name,
          campaign_id: preparedData.campaign_id,
          adgroup_name: preparedData.adgroup_name,
          adgroup_id: preparedData.adgroup_id,
          keyword: preparedData.keyword,
          matchtype: preparedData.matchtype,
          gclid: preparedData.gclid,
          device: preparedData.device,
          templateType: preparedData.templateType
        }
      });
    }
    
    // HARDCODED ASSIGNMENT TO SPECIFIC SALES REP
    console.log('%c FORCE HARDCODED ASSIGNMENT TO SPECIFIC SALES REP', 'background: #ff9800; color: black; font-size: 14px; padding: 5px;');
    
    try {
      // Pre-load the assignment module to avoid dynamic import timing issues
      const assignmentModule = await import('./assignment');
      
      // Get all sales reps
      const db = getFirestore();
      const salesRepsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'sales_rep')
      );
      
      const salesRepsSnapshot = await getDocs(salesRepsQuery);
      const allReps = salesRepsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Found ${allReps.length} total sales reps`);
      
      if (allReps.length > 0) {
        // TEMPORARY SOLUTION: Always use the first sales rep
        const targetRep = allReps[0];
        
        console.log(`HARDCODED ASSIGNMENT: Always assigning to first sales rep: ${targetRep.name} (${targetRep.id})`);
        
        // Directly use assignLeadToSalesRep for the assignment
        const success = await assignmentModule.assignLeadToSalesRep(newLeadDoc.id, targetRep.id);
        
        if (success) {
          console.log(`Hardcoded assignment SUCCESSFUL - lead ${newLeadDoc.id} assigned to ${targetRep.name}`);
        } else {
          console.error(`Hardcoded assignment FAILED - lead ${newLeadDoc.id} not assigned to ${targetRep.name}`);
        }
      } else {
        console.log('No sales reps found to assign lead to');
      }
    } catch (assignmentError) {
      console.error('Error during hardcoded assignment:', assignmentError);
    }
    
    // Skip the old assignment code - we've already done synchronous assignment earlier
    try {
      // Notification handling only - assignment is now done synchronously right after lead creation
      console.log('%c ASSIGNMENT ALREADY HANDLED - SENDING NOTIFICATIONS ONLY', 'background: #4CAF50; color: white; font-size: 14px; padding: 5px;');
      
      // Check notification settings for admin email notification
      const notificationSettingsDoc = await getDoc(doc(db, 'settings', 'notifications'));
      
      // Check if we should send email notification
      if (notificationSettingsDoc.exists() && 
          notificationSettingsDoc.data().emailNotificationsEnabled &&
          notificationSettingsDoc.data().notifyOnNewLead &&
          notificationSettingsDoc.data().adminEmail) {
        
        try {
          // Load email service synchronously to ensure it completes
          const emailService = await import('./email');
          
          // Wait for the notification to complete
          await emailService.sendAdminLeadNotificationEmail(
            newLeadDoc.id, 
            notificationSettingsDoc.data().adminEmail
          );
          console.log(`Admin notification email sent for new lead ${newLeadDoc.id}`);
        } catch (emailError) {
          console.error('Error sending admin email notification:', emailError);
        }
      } else {
        console.log(`Admin email notification skipped for lead ${newLeadDoc.id} - not configured`);
      }

      // ALWAYS send Pushover notification for new leads (temporarily hard-coded)
      try {
        console.log('🔴🔴🔴 PUSHOVER DEBUG: Starting hard-coded Pushover notification process'); 
        
        // Get admin Pushover user key from notification settings
        const adminPushoverUserKey = notificationSettingsDoc.exists() ? 
          notificationSettingsDoc.data().pushoverAdminUserKey : null;
        
        console.log('🔴🔴🔴 PUSHOVER DEBUG: Admin user key found?', !!adminPushoverUserKey);
        
        if (adminPushoverUserKey) {
          console.log(`🔴🔴🔴 PUSHOVER DEBUG: Sending hard-coded Pushover notification for new lead ${newLeadDoc.id}`);
          
          // Format address
          const address = [
            preparedData.street || 'No address',
            preparedData.city || '',
            preparedData.state || '',
            preparedData.zip || ''
          ].filter(Boolean).join(', ');
          
          // Determine campaign type and create appropriate title and message
          const campaignName = preparedData.campaign_name || '';
          const keyword = preparedData.keyword || '';
          const isCashOrFast = campaignName.toLowerCase().includes('cash') || campaignName.toLowerCase().includes('fast');
          
          // Create title based on campaign type
          const notificationTitle = isCashOrFast ? "New Address Lead" : "New Lead Created";
          
          // Build message with keyword if available
          let message = `New lead created: ${preparedData.name || 'Unnamed Lead'}\nAddress: ${address}`;
          if (preparedData.phone) {
            message += `\nPhone: ${preparedData.phone}`;
          }
          if (keyword) {
            message += `\nKeyword: ${keyword}`;
          }
          if (campaignName && !isCashOrFast) {
            message += `\nCampaign: ${campaignName}`;
          }
          
          // Send Pushover notification directly to API endpoint
          const response = await fetch('/api/pushover/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: adminPushoverUserKey,
              message: message,
              title: notificationTitle,
              priority: 1,
              sound: "persistent"
            })
          });
          
          const result = await response.json();
          console.log('Pushover notification result:', result);
        } else {
          console.error('Cannot send Pushover notification: No admin user key found in settings');
        }
      } catch (pushoverError) {
        console.error('Error sending hard-coded Pushover notification:', pushoverError);
      }
    } catch (settingsError) {
      console.error('Error checking settings:', settingsError);
      // Don't block lead creation if settings checks fail
    }
    
    console.log("Successfully created lead in Firebase with ID:", newLeadDoc.id);
    return newLeadDoc.id;
  } catch (error) {
    console.error("Error submitting lead to Firebase:", error);
    throw new Error(error.message || 'Failed to submit lead');
  }
}

/**
 * Update existing lead in Firebase Firestore
 * @param {string} leadId - The ID of the lead to update
 * @param {Object} formData - The updated form data
 * @returns {Promise<boolean>}
 */
export async function updateLeadInFirebase(leadId, formData) {
  if (!leadId) {
    console.error("Cannot update lead: Missing lead ID");
    return false;
  }
  
  // Add detailed logging for campaign data
  console.log("%c UPDATE LEAD IN FIREBASE - Campaign Data Check", "background: #673ab7; color: white; font-size: 14px; padding: 5px;");
  console.log("Campaign data in update:", {
    campaign_name: formData.campaign_name || 'NOT PROVIDED',
    campaign_id: formData.campaign_id || 'NOT PROVIDED',
    adgroup_name: formData.adgroup_name || 'NOT PROVIDED', 
    adgroupName: formData.adgroupName || 'NOT PROVIDED', // Check both spellings
    adgroup_id: formData.adgroup_id || 'NOT PROVIDED',
    keyword: formData.keyword || 'NOT PROVIDED',
    matchtype: formData.matchtype || 'NOT PROVIDED',
    gclid: formData.gclid || 'NOT PROVIDED',
    device: formData.device || 'NOT PROVIDED',
    templateType: formData.templateType || 'NOT PROVIDED',
    dataSourceComplete: formData.dataSourceComplete || false
  });
  
  try {
    // List of fields that should only be sent if they have been explicitly set
    const qualifyingFields = [
      'isPropertyOwner',
      'needsRepairs', 
      'workingWithAgent',
      'homeType',
      'howSoonSell',
      'wantToSetAppointment'
    ];
    
    // List of fields that should only be sent if they have a numeric value
    const valueRequiredFields = [
      'remainingMortgage',
      'finishedSquareFootage',
      'basementSquareFootage'
    ];
    
    // Process name field - need to split into first/last
    let firstName = '';
    let lastName = '';
    
    // If name is provided, extract first and last name
    if (formData.name) {
      const nameParts = formData.name.split(' ');
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        // If only one name provided, use it as last name
        lastName = formData.name;
      }
    }
    
    // Explicitly log contact info to debug
    console.log("CONTACT INFO FOR FIREBASE UPDATE:", {
      name: formData.name,
      firstName: firstName,
      lastName: lastName,
      phone: formData.phone || ''
    });
    
    // Start with system fields that must always be included
    const updateData = {
      // System fields always included
      updatedAt: serverTimestamp()
    };
    
    // Only include contact fields if they have actual values (prevent overwriting existing data with blanks)
    if (formData.name && formData.name.trim() !== '') {
      updateData.name = formData.name;
      updateData.firstName = firstName;
      updateData.lastName = lastName || "Contact";
    }
    
    if (formData.phone && formData.phone.trim() !== '') {
      updateData.phone = formData.phone;
    }
    
    if (formData.email && formData.email.trim() !== '') {
      updateData.email = formData.email;
    }
    
    // Helper function to add field only if it has a meaningful value
    const addFieldIfNotEmpty = (field, value) => {
      if (value !== undefined && value !== null && value !== '') {
        updateData[field] = value;
      }
    };
    
    // Helper function to add string field (converts to string if not empty)
    const addStringFieldIfNotEmpty = (field, value) => {
      if (value !== undefined && value !== null && value !== '') {
        updateData[field] = value.toString();
      }
    };
    
    // Add fields only if they have meaningful values
    addFieldIfNotEmpty('autoFilledName', formData.autoFilledName);
    addFieldIfNotEmpty('autoFilledPhone', formData.autoFilledPhone);
    addFieldIfNotEmpty('userTypedAddress', formData.userTypedAddress);
    addFieldIfNotEmpty('selectedSuggestionAddress', formData.selectedSuggestionAddress);
    
    // Always add submittedAny flag for tracking
    updateData.submittedAny = true;
    
    // Basic address info (only if provided)
    addFieldIfNotEmpty('street', formData.street);
    addFieldIfNotEmpty('city', formData.city);
    addFieldIfNotEmpty('state', formData.state);
    addFieldIfNotEmpty('zip', formData.zip);
    
    // Property data from APIs (only if provided)
    addFieldIfNotEmpty('apiOwnerName', formData.apiOwnerName);
    addStringFieldIfNotEmpty('apiEstimatedValue', formData.apiEstimatedValue);
    addStringFieldIfNotEmpty('apiMaxHomeValue', formData.apiMaxHomeValue);
    addStringFieldIfNotEmpty('apiHomeValue', formData.apiEstimatedValue);
    addStringFieldIfNotEmpty('apiEquity', formData.apiEquity);
    addStringFieldIfNotEmpty('apiPercentage', formData.apiPercentage);
    
    // Campaign data (only include if not "NOT PROVIDED" or empty)
    if (formData.campaign_name && formData.campaign_name !== 'NOT PROVIDED') {
      updateData.campaign_name = formData.campaign_name;
    }
    if (formData.campaign_id && formData.campaign_id !== 'NOT PROVIDED') {
      updateData.campaign_id = formData.campaign_id;
    }
    if (formData.adgroup_id && formData.adgroup_id !== 'NOT PROVIDED') {
      updateData.adgroup_id = formData.adgroup_id;
    }
    if (formData.adgroup_name && formData.adgroup_name !== 'NOT PROVIDED') {
      updateData.adgroup_name = formData.adgroup_name;
    }
    if (formData.keyword && formData.keyword !== 'NOT PROVIDED') {
      updateData.keyword = formData.keyword;
    }
    if (formData.matchtype && formData.matchtype !== 'NOT PROVIDED') {
      updateData.matchtype = formData.matchtype;
    }
    if (formData.gclid && formData.gclid !== 'NOT PROVIDED') {
      updateData.gclid = formData.gclid;
    }
    if (formData.device && formData.device !== 'NOT PROVIDED') {
      updateData.device = formData.device;
    }
    
    // Other tracking fields (only if provided)
    addFieldIfNotEmpty('traffic_source', formData.traffic_source);
    addFieldIfNotEmpty('templateType', formData.templateType);
    addFieldIfNotEmpty('url', formData.url);
    addFieldIfNotEmpty('dynamicHeadline', formData.dynamicHeadline);
    addFieldIfNotEmpty('dynamicSubHeadline', formData.dynamicSubHeadline);
    addFieldIfNotEmpty('leadSource', formData.leadSource);
    addFieldIfNotEmpty('leadStage', formData.leadStage);
    addFieldIfNotEmpty('addressSelectionType', formData.addressSelectionType);
    addStringFieldIfNotEmpty('qualifyingQuestionStep', formData.qualifyingQuestionStep);
    
    // AI report fields (only if provided)
    addFieldIfNotEmpty('aiHomeReport', formData.aiHomeReport);
    addFieldIfNotEmpty('aiReportGeneratedAt', formData.aiReportGeneratedAt);
    
    // BatchData fields (preserve existing data - non-destructive updates)
    addFieldIfNotEmpty('batchDataPhoneNumbers', formData.batchDataPhoneNumbers);
    addFieldIfNotEmpty('batchDataEmails', formData.batchDataEmails);
    addFieldIfNotEmpty('batchDataReport', formData.batchDataReport);
    addFieldIfNotEmpty('batchDataProcessed', formData.batchDataProcessed);
    addFieldIfNotEmpty('batchDataProcessedAt', formData.batchDataProcessedAt);
    
    // Only include qualifying fields if they have values or have been interacted with
    qualifyingFields.forEach(field => {
      const hasValidValue = formData[field] !== undefined && formData[field] !== '';
      const hasBeenInteractedWith = formData.interactedFields && formData.interactedFields[field];
      
      if (hasValidValue || hasBeenInteractedWith) {
        // Include the field with its value
        updateData[field] = formData[field];
      } else {
        // Log fields we're excluding
        console.log(`Not including ${field} in update - no value set or user interaction`);
      }
    });
    
    // Only include value-required fields if they have numeric values or API set them
    valueRequiredFields.forEach(field => {
      const hasValidValue = formData[field] !== undefined && 
          formData[field] !== '' && 
          formData[field] !== null && 
          !isNaN(formData[field]) && 
          Number(formData[field]) > 0;
      
      const hasBeenInteractedWith = formData.interactedFields && formData.interactedFields[field];
      
      if (hasValidValue || hasBeenInteractedWith) {
        updateData[field] = formData[field].toString();
      } else {
        console.log(`Not including ${field} in update - no valid numeric value or user interaction`);
      }
    });
    
    // Include appointment fields only if they have values
    if (formData.selectedAppointmentDate) {
      updateData.selectedAppointmentDate = formData.selectedAppointmentDate;
      updateData.appointmentDate = formData.selectedAppointmentDate;
    }
    
    if (formData.selectedAppointmentTime) {
      updateData.selectedAppointmentTime = formData.selectedAppointmentTime;
      updateData.appointmentTime = formData.selectedAppointmentTime;
    }
    
    console.log("Updating lead in Firebase:", { 
      leadId, 
      data: updateData // Show FULL update data to see if BatchData fields are being overwritten
    });
    
    // Update lead in Firestore
    const leadRef = doc(db, 'leads', leadId);
    await updateDoc(leadRef, updateData);
    
    // Push update to dataLayer for GTM tracking
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'leadUpdated',
        leadId: leadId,
        formData: {
          name: updateData.name,
          phone: updateData.phone,
          email: updateData.email,
          address: updateData.street,
          city: updateData.city,
          state: updateData.state,
          zip: updateData.zip
        },
        leadStage: updateData.leadStage
      });
    }
    
    console.log("Successfully updated lead in Firebase with ID:", leadId);
    return true;
  } catch (error) {
    console.error("Error updating lead in Firebase:", error);
    return false; // Don't interrupt the user flow on update errors
  }
}

/**
 * Track conversion event in Firebase and for marketing analytics
 * @param {string} event - Event type (e.g., 'appointmentSet', 'successfulContact')
 * @param {string} leadId - The lead ID
 * @param {string} status - Optional status to update
 * @param {number|string} customValue - Optional custom conversion value (e.g., transaction amount)
 * @param {Object} additionalData - Optional additional data to include
 * @returns {Promise<boolean>} Success indicator
 */
export async function trackFirebaseConversion(event, leadId, status = null, customValue = null, additionalData = {}) {
  if (!leadId) {
    console.warn('Cannot track conversion: Missing lead ID');
    return false;
  }
  
  try {
    // Get conversion value based on event type
    const conversionValue = getConversionValue(event, customValue);
    
    // Create conversion event object
    const conversionEvent = {
      event: event,
      timestamp: serverTimestamp(),
      value: conversionValue,
      status: status || ''
    };
    
    // Include any additional data
    if (additionalData && typeof additionalData === 'object') {
      Object.keys(additionalData).forEach(key => {
        conversionEvent[key] = additionalData[key];
      });
    }
    
    // Get the lead document
    const leadRef = doc(db, 'leads', leadId);
    const leadSnap = await getDoc(leadRef);
    
    if (!leadSnap.exists()) {
      console.error(`Lead not found: ${leadId}`);
      return false;
    }
    
    const leadData = leadSnap.data();
    
    // Update data object
    const updateData = {
      updatedAt: serverTimestamp(),
      // Add new conversion event to array
      conversions: [...(leadData.conversions || []), conversionEvent]
    };
    
    // Update status if provided
    if (status) {
      updateData.status = status;
    }
    
    // Update lead in Firestore
    await updateDoc(leadRef, updateData);
    
    // Also push to dataLayer for GTM tracking
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'crmConversion',
        crmEvent: event,
        leadId: leadId,
        status: status || '',
        conversionValue: conversionValue,
        customValue: customValue,
        ...additionalData
      });
      
      console.log(`Pushed conversion event to dataLayer: ${event} with value: ${conversionValue}`);
    }
    
    console.log(`Successfully tracked conversion: ${event} for lead ${leadId}`);
    return true;
  } catch (error) {
    console.error('Error tracking conversion:', error);
    
    // Still try to push to dataLayer even if the Firestore update fails
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'crmConversion',
        crmEvent: event,
        leadId: leadId,
        status: status || '',
        conversionValue: getConversionValue(event, customValue),
        customValue: customValue,
        ...additionalData
      });
    }
    
    return false;
  }
}


/**
 * Specialized function to update ONLY contact info (name and phone)
 * @param {string} leadId - Lead ID
 * @param {string} name - Contact name
 * @param {string} phone - Contact phone
 * @param {string} email - Contact email
 * @returns {Promise<boolean>} - Success status
 */
export async function updateContactInfo(leadId, name, phone, email = '') {
  if (!leadId) {
    console.error("Cannot update contact: Missing lead ID");
    return false;
  }
  
  try {
    // Process name field for splitting into parts
    let firstName = '';
    let lastName = '';
    
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        lastName = name;
      }
    }
    
    // Contact data only
    const contactData = {
      name: name || '',
      phone: phone || '',
      email: email || '',
      firstName: firstName,
      lastName: lastName || 'Contact',
      nameWasAutofilled: false, // Clear the autofill flag
      
      // Store autofilled values separately
      autoFilledName: name || '',
      autoFilledPhone: phone || '',
      
      // Update lead stage and timestamp
      leadStage: 'Contact Info Provided',
      updatedAt: serverTimestamp()
    };
    
    console.log("DIRECT CONTACT UPDATE:", {
      leadId,
      name,
      firstName,
      lastName,
      phone
    });
    
    // Update lead in Firestore
    const leadRef = doc(db, 'leads', leadId);
    await updateDoc(leadRef, contactData);
    
    console.log("Contact info update successful");
    return true;
  } catch (error) {
    console.error("Error updating contact info:", error);
    return false;
  }
}

// Authentication methods

/**
 * Log in a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User object with role and permissions
 */
export async function login(email, password) {
  try {
    console.log('Attempting login for:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      console.warn('User authenticated but no Firestore record found, creating default record');
      
      // Create a default user document with basic permissions
      const defaultUserData = {
        email: userCredential.user.email,
        name: userCredential.user.displayName || email.split('@')[0],
        role: 'sales_rep', // Default role
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: true,
      };
      
      // Save the default user data
      await setDoc(doc(db, 'users', userCredential.user.uid), defaultUserData);
      
      // Return the default user data with the UID
      return {
        uid: userCredential.user.uid,
        ...defaultUserData
      };
    }
    
    const userData = userDoc.data();
    console.log('User data retrieved:', { 
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      role: userData.role || 'sales_rep',
      name: userData.name || ''
    });
    
    // Update last login timestamp
    await updateDoc(doc(db, 'users', userCredential.user.uid), {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Return user info with role
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      role: userData.role || 'sales_rep',
      name: userData.name || '',
      ...userData
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Log out the current user
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * Get the current authenticated user
 * @returns {Object|null} - User object or null if not authenticated
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Create a new user with role
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User's full name
 * @param {string} phone - User's phone number (for SMS notifications)
 * @param {string} role - User role (admin, sales_rep)
 * @returns {Promise<Object>} - Created user object
 */
export async function createUser(email, password, name, phone = '', role = 'sales_rep', pushoverUserKey = '') {
  try {
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    const userData = {
      email,
      name,
      phone, // Add phone field for SMS notifications
      pushoverUserKey, // Add Pushover user key for mobile notifications
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      active: true
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    
    return {
      uid: userCredential.user.uid,
      email,
      name,
      phone,
      pushoverUserKey,
      role
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Helper function to get conversion value based on event type
 * @param {string} event - Event type
 * @param {number|string} customValue - Custom value
 * @returns {number} - Conversion value
 */
function getConversionValue(event, customValue = null) {
  // If a custom value is provided, use it
  if (customValue !== null && !isNaN(parseFloat(customValue))) {
    return parseFloat(customValue);
  }
  
  // Default values for different conversion types
  switch (event) {
    case 'successfulContact':
      return 25;
    case 'appointmentSet':
      return 50;
    case 'notInterested':
      return 5;
    case 'wrongNumber':
      return 2;
    case 'successfulClientAgreement':
      return 200;
    case 'successfullyClosedTransaction':
    case 'closed':
      return 500;
    case 'offerMade':
      return 100;
    case 'contractSigned':
      return 200;
    default:
      return 10;
  }
}

/**
 * Delete a lead from Firebase Firestore
 * @param {string} leadId - The ID of the lead to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteLeadFromFirebase(leadId) {
  if (!leadId) {
    console.error("Cannot delete lead: Missing lead ID");
    return false;
  }
  
  try {
    const db = getFirestore();
    const leadRef = doc(db, 'leads', leadId);
    
    // Get the lead document first to confirm it exists
    const leadSnap = await getDoc(leadRef);
    
    if (!leadSnap.exists()) {
      console.error(`Lead not found: ${leadId}`);
      return false;
    }
    
    // Delete the lead document
    await deleteDoc(leadRef);
    
    // Push delete event to dataLayer for GTM tracking if needed
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'leadDeleted',
        leadId: leadId
      });
    }
    
    console.log(`Successfully deleted lead with ID: ${leadId}`);
    return true;
  } catch (error) {
    console.error("Error deleting lead from Firebase:", error);
    return false;
  }
}

export default {
  app,
  db,
  auth,
  // Lead Management
  submitLeadToFirebase,
  updateLeadInFirebase,
  trackFirebaseConversion,
  updateContactInfo,
  // Authentication
  login,
  logout,
  getCurrentUser,
  createUser,
  // Lead deletion
  deleteLeadFromFirebase
};