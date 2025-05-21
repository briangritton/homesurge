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
      leadStage: formData.leadStage || 'New',
      
      // System fields
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'New',
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
    
    // Include basic fields in updateData
    const updateData = {
      // IMPORTANT: Basic user info
      name: formData.name || '',
      phone: formData.phone || '',
      email: formData.email || '',
      firstName: firstName,
      lastName: lastName || "Contact",
      
      // Include autofilled values if available
      autoFilledName: formData.autoFilledName || '',
      autoFilledPhone: formData.autoFilledPhone || '',
      
      // Address tracking
      userTypedAddress: formData.userTypedAddress || '',
      selectedSuggestionAddress: formData.selectedSuggestionAddress || '',
      
      // Basic address info if updated - using internal field names
      street: formData.street || '',
      city: formData.city || '',
      state: formData.state || '',
      zip: formData.zip || '',
      
      // Property data from Melissa API (in case they weren't in initial creation)
      apiOwnerName: formData.apiOwnerName || '',
      apiEstimatedValue: formData.apiEstimatedValue?.toString() || '',
      apiMaxHomeValue: formData.apiMaxHomeValue?.toString() || '',
      apiHomeValue: formData.apiEstimatedValue?.toString() || '',
      apiEquity: formData.apiEquity?.toString() || '',
      apiPercentage: formData.apiPercentage?.toString() || '',
      
      // CRITICAL: Include all campaign data in every update
      campaign_name: formData.campaign_name || '',
      campaign_id: formData.campaign_id || '',
      adgroup_id: formData.adgroup_id || '',
      adgroup_name: formData.adgroup_name || '',
      keyword: formData.keyword || '',
      matchtype: formData.matchtype || '',
      gclid: formData.gclid || '',
      device: formData.device || '',
      traffic_source: formData.traffic_source || '',
      templateType: formData.templateType || '',
      url: formData.url || '',
      
      // Dynamic content data
      dynamicHeadline: formData.dynamicHeadline || '',
      dynamicSubHeadline: formData.dynamicSubHeadline || '',
      
      // Lead tracking info
      leadSource: formData.leadSource || '',
      leadStage: formData.leadStage || '',
      addressSelectionType: formData.addressSelectionType || '',
      
      // Progress tracking
      qualifyingQuestionStep: formData.qualifyingQuestionStep?.toString() || '',
      
      // System fields
      updatedAt: serverTimestamp()
    };
    
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
      data: {
        needsRepairs: updateData.needsRepairs,
        wantToSetAppointment: updateData.wantToSetAppointment,
        selectedAppointmentDate: updateData.selectedAppointmentDate,
        selectedAppointmentTime: updateData.selectedAppointmentTime,
        apiEquity: updateData.apiEquity,
        apiPercentage: updateData.apiPercentage,
        selectedSuggestionAddress: updateData.selectedSuggestionAddress,
        userTypedAddress: updateData.userTypedAddress,
        leadStage: updateData.leadStage
      } 
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
 * Create a lead from partial address and suggestions
 * @param {string} partialAddress - User-typed partial address
 * @param {Array} suggestions - Address suggestions
 * @param {Object} contactInfo - Optional contact info with name, phone, leadId
 * @param {Object} addressComponents - Optional address components if selection made
 * @returns {Promise<string>} - ID of created or updated lead
 */
export async function createSuggestionLead(partialAddress, suggestions, contactInfo = null, addressComponents = null, formData = null) {
  try {
    // If we already have contactInfo containing a leadId, use update, otherwise create
    const leadId = contactInfo?.leadId || null;
    
    // Extract campaign data from contactInfo or formData if available
    // This ensures campaign parameters are captured in the initial lead creation
    const campaignData = formData || (contactInfo && contactInfo.formData) || {};
    
    // Format the data for Firebase
    const preparedData = {
      // Only include userTypedAddress, not the official street address
      userTypedAddress: partialAddress || '',
      
      // Lead classification
      leadSource: campaignData.leadSource || 'Address Entry',
      leadStage: 'Address Typing',
      addressSelectionType: 'Partial',
      
      // Use provided name/phone from contactInfo if available, otherwise defaults
      name: contactInfo?.name || 'Property Lead',
      phone: contactInfo?.phone || '',
      autoFilledName: contactInfo?.autoFilledName || contactInfo?.name || '',
      autoFilledPhone: contactInfo?.autoFilledPhone || contactInfo?.phone || '',
      
      // CRITICAL: Include ALL campaign tracking parameters from formData
      campaign_name: campaignData.campaign_name || '',
      campaign_id: campaignData.campaign_id || '',
      adgroup_name: campaignData.adgroup_name || '',
      adgroup_id: campaignData.adgroup_id || '',
      keyword: campaignData.keyword || '',
      device: campaignData.device || '',
      gclid: campaignData.gclid || '',
      traffic_source: campaignData.traffic_source || 'Direct',
      matchtype: campaignData.matchtype || '',
      templateType: campaignData.templateType || campaignData.template_type || '',
      template_type: campaignData.template_type || campaignData.templateType || '',
      url: campaignData.url || window.location.href || '',
      
      // Include dynamic content information if available
      dynamicHeadline: campaignData.dynamicHeadline || '',
      dynamicSubHeadline: campaignData.dynamicSubHeadline || '',
      buttonText: campaignData.buttonText || '',
      
      // Include API property data if available - ensure ALL fields are included
      apiOwnerName: campaignData.apiOwnerName || '',
      apiEstimatedValue: campaignData.apiEstimatedValue?.toString() || '',
      apiMaxHomeValue: campaignData.apiMaxHomeValue?.toString() || '',
      apiHomeValue: campaignData.apiEstimatedValue?.toString() || '',  // Add this for consistency
      formattedApiEstimatedValue: campaignData.formattedApiEstimatedValue || '',
      apiEquity: campaignData.apiEquity?.toString() || '',
      apiPercentage: campaignData.apiPercentage?.toString() || '',
      propertyEquity: campaignData.apiEquity?.toString() || '',        // Add this for consistency
      equityPercentage: campaignData.apiPercentage?.toString() || ''   // Add this for consistency
    };
    
    console.log("Creating suggestion lead with campaign data:", {
      campaign_name: preparedData.campaign_name,
      campaign_id: preparedData.campaign_id,
      adgroup_name: preparedData.adgroup_name,
      keyword: preparedData.keyword
    });
    
    // Only add address components if explicitly provided and this is a final selection
    if (addressComponents && addressComponents.city) {
      preparedData.city = addressComponents.city;
      preparedData.state = addressComponents.state || 'GA';
      preparedData.zip = addressComponents.zip || '';
      preparedData.street = partialAddress; // Only set street if we have other components
      preparedData.leadStage = 'Address Selected'; // Update the stage
    }
    
    // System fields
    preparedData.updatedAt = serverTimestamp();
    
    if (leadId) {
      // Update existing lead
      console.log(`Updating suggestion lead with ID: ${leadId}`);
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, preparedData);
      return leadId;
    } else {
      // Create new lead
      console.log(`Creating new suggestion lead with partial address: "${partialAddress}"`);
      preparedData.createdAt = serverTimestamp();
      preparedData.status = 'New';
      preparedData.assignedTo = null;
      preparedData.conversions = [];
      
      // Create a new lead document with auto-generated ID
      const leadsCollection = collection(db, 'leads');
      const newLeadDoc = doc(leadsCollection);
      
      // Add lead ID to prepared data for reference
      preparedData.id = newLeadDoc.id;
      
      // Store in Firestore
      await setDoc(newLeadDoc, preparedData);
      
      console.log(`Successfully created suggestion lead with ID: ${newLeadDoc.id}`);
      return newLeadDoc.id;
    }
  } catch (error) {
    console.error("Error in suggestion lead operation:", error.message);
    // Return the existing leadId if there was an error, to maintain continuity
    return contactInfo?.leadId || null;
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
export async function createUser(email, password, name, phone = '', role = 'sales_rep') {
  try {
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    const userData = {
      email,
      name,
      phone, // Add phone field for SMS notifications
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
  createSuggestionLead,
  updateContactInfo,
  // Authentication
  login,
  logout,
  getCurrentUser,
  createUser,
  // Lead deletion
  deleteLeadFromFirebase
};