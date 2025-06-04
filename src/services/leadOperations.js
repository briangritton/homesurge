/**
 * Lead Operations Service
 * Handles all CRM/Firebase lead management operations
 */

import { updateLeadInFirebase } from './firebase.js';

class LeadOperationsService {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Get existing lead ID from localStorage or FormContext
   * @returns {string|null} Lead ID
   */
  getLeadId() {
    return localStorage.getItem('leadId') || localStorage.getItem('suggestionLeadId');
  }

  /**
   * Store lead ID in localStorage
   * @param {string} leadId - Lead ID to store
   */
  setLeadId(leadId) {
    localStorage.setItem('leadId', leadId);
    localStorage.setItem('suggestionLeadId', leadId);
  }

  /**
   * Update lead with retry logic
   * @param {string} leadId - Lead ID
   * @param {Object} updates - Data to update
   * @param {number} attempt - Current retry attempt
   * @returns {Promise<boolean>} Success status
   */
  async updateLead(leadId, updates, attempt = 1) {
    if (!leadId) {
      console.warn('No lead ID provided for update');
      return false;
    }

    try {
      console.log(`📝 Updating lead ${leadId} (attempt ${attempt}):`, updates);
      
      const success = await updateLeadInFirebase(leadId, updates);
      
      if (success) {
        console.log('✅ Lead updated successfully');
        return true;
      } else {
        throw new Error('Firebase update returned false');
      }
    } catch (error) {
      console.error(`❌ Lead update failed (attempt ${attempt}):`, error);
      
      // Retry logic
      if (attempt < this.retryAttempts) {
        console.log(`🔄 Retrying lead update in ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay);
        return this.updateLead(leadId, updates, attempt + 1);
      }
      
      console.error('💥 Lead update failed after all retries');
      return false;
    }
  }

  /**
   * Save final address selection with comprehensive data
   * @param {Object} addressData - Formatted address data
   * @param {Object} propertyData - Property lookup data
   * @param {Object} campaignData - Campaign tracking data
   * @param {Object} contactData - Contact information (optional)
   * @returns {Promise<boolean>} Success status
   */
  async saveFinalSelection(addressData, propertyData = {}, campaignData = {}, contactData = {}) {
    const leadId = this.getLeadId();
    
    if (!leadId) {
      console.warn('No lead ID found for final selection save');
      return false;
    }

    // Prepare comprehensive update data
    const updateData = {
      // Address information
      ...addressData,
      leadStage: 'Address Selected',
      
      // Property data (if available)
      ...propertyData,
      
      // Contact data (preserve existing)
      ...contactData,
      
      // Campaign tracking
      ...campaignData,
      
      // Timestamp
      updatedAt: new Date().toISOString()
    };

    console.log('💾 Saving final selection data:', {
      leadId,
      address: addressData.selectedSuggestionAddress,
      propertyValue: propertyData.apiEstimatedValue,
      selectionType: addressData.addressSelectionType
    });

    return this.updateLead(leadId, updateData);
  }

  /**
   * Save autofilled contact data
   * @param {Object} autofillData - Autofilled contact information
   * @returns {Promise<boolean>} Success status
   */
  async saveAutofillData(autofillData) {
    const leadId = this.getLeadId();
    
    if (!leadId) {
      console.warn('No lead ID found for autofill save');
      return false;
    }

    const updateData = {
      ...autofillData,
      leadStage: 'Browser Autofill Detected',
      autofillDetectedAt: new Date().toISOString()
    };

    console.log('🤖 Saving autofill data:', {
      leadId,
      hasName: !!autofillData.autoFilledName,
      hasPhone: !!autofillData.autoFilledPhone,
      hasAddress: !!autofillData.street
    });

    return this.updateLead(leadId, updateData);
  }

  /**
   * Update lead with property data from API lookup
   * @param {Object} propertyData - Property information
   * @returns {Promise<boolean>} Success status
   */
  async savePropertyData(propertyData) {
    const leadId = this.getLeadId();
    
    if (!leadId || !propertyData) {
      return false;
    }

    const updateData = {
      ...propertyData,
      propertyLookupAt: new Date().toISOString(),
      leadStage: 'Property Data Retrieved'
    };

    console.log('🏠 Saving property data:', {
      leadId,
      value: propertyData.apiEstimatedValue,
      owner: propertyData.apiOwnerName
    });

    return this.updateLead(leadId, updateData);
  }

  /**
   * Ensure lead exists, create if needed (should be handled by FormContext)
   * @param {Object} campaignData - Campaign data for lead creation
   * @returns {Promise<string>} Lead ID
   */
  async ensureLeadExists(campaignData = {}) {
    let leadId = this.getLeadId();
    
    if (leadId) {
      console.log('📋 Using existing lead:', leadId);
      return leadId;
    }

    // Lead should be created by FormContext immediate lead creation
    // This is a fallback in case that fails
    console.warn('⚠️ No lead ID found - this should be handled by FormContext');
    
    // Return null to indicate lead creation should be handled elsewhere
    return null;
  }

  /**
   * Save address typing progress (for analytics)
   * @param {string} typedAddress - What user has typed so far
   * @returns {Promise<boolean>} Success status
   */
  async saveAddressTyping(typedAddress) {
    const leadId = this.getLeadId();
    
    if (!leadId || !typedAddress || typedAddress.length < 3) {
      return false;
    }

    const updateData = {
      userTypedAddress: typedAddress,
      leadStage: 'Address Typing',
      lastTypingAt: new Date().toISOString()
    };

    // Don't log this one to avoid spam
    return this.updateLead(leadId, updateData);
  }

  /**
   * Preserve autofilled contact data in updates
   * Helper function to ensure autofilled data isn't lost
   * @param {Object} newData - New data to update
   * @param {Object} existingData - Existing form data
   * @returns {Object} Data with preserved autofill fields
   */
  preserveAutofillData(newData, existingData = {}) {
    return {
      ...newData,
      autoFilledName: newData.autoFilledName || existingData.autoFilledName || '',
      autoFilledPhone: newData.autoFilledPhone || existingData.autoFilledPhone || '',
      nameWasAutofilled: newData.nameWasAutofilled !== undefined 
        ? newData.nameWasAutofilled 
        : existingData.nameWasAutofilled
    };
  }

  /**
   * Utility function for delays
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Save address data independently (Google Places)
   * @param {Object} addressData - Formatted address data from Google Places
   * @returns {Promise<boolean>} Success status
   */
  async saveAddressData(addressData) {
    const leadId = this.getLeadId();
    
    if (!leadId) {
      console.warn('No lead ID found for address data save');
      return false;
    }

    const updateData = {
      ...addressData,
      leadStage: 'Address Selected',
      addressSavedAt: new Date().toISOString()
    };

    console.log('📍 Saving address data to CRM:', {
      leadId,
      address: addressData.selectedSuggestionAddress,
      selectionType: addressData.addressSelectionType
    });

    return this.updateLead(leadId, updateData);
  }

  /**
   * Save Melissa data independently (property value, owner, equity, etc.)
   * @param {Object} melissaData - Melissa API lookup data (value, owner, etc.)
   * @returns {Promise<boolean>} Success status
   */
  async saveMelissaData(melissaData) {
    const leadId = this.getLeadId();
    
    if (!leadId) {
      console.warn('No lead ID found for Melissa data save');
      return false;
    }

    const updateData = {
      ...melissaData,
      leadStage: 'Melissa Data Retrieved',
      melissaDataSavedAt: new Date().toISOString()
    };

    console.log('🏠 Saving Melissa data to CRM:', {
      leadId,
      propertyValue: melissaData.apiEstimatedValue,
      owner: melissaData.apiOwnerName
    });

    return this.updateLead(leadId, updateData);
  }

  /**
   * Save BatchData independently (contact lookup, phones, emails, etc.)
   * @param {Object} batchData - BatchData API lookup data (phones, emails, etc.)
   * @returns {Promise<boolean>} Success status
   */
  async saveBatchData(batchData) {
    const leadId = this.getLeadId();
    
    if (!leadId) {
      console.warn('No lead ID found for BatchData save');
      return false;
    }

    const updateData = {
      ...batchData,
      leadStage: 'BatchData Retrieved',
      batchDataSavedAt: new Date().toISOString()
    };

    console.log('📞 Saving BatchData to CRM:', {
      leadId,
      phoneCount: batchData.phoneNumbers?.length || 0,
      emailCount: batchData.emails?.length || 0
    });

    return this.updateLead(leadId, updateData);
  }

  /**
   * Save user-provided contact info independently (Contact Forms)
   * @param {Object} userContactInfo - User-submitted contact information
   * @returns {Promise<boolean>} Success status
   */
  async saveUserContactInfo(userContactInfo) {
    const leadId = this.getLeadId();
    
    if (!leadId) {
      console.warn('No lead ID found for user contact info save');
      return false;
    }

    const updateData = {
      name: userContactInfo.name,
      phone: userContactInfo.phone,
      email: userContactInfo.email,
      leadStage: 'User Contact Info Provided',
      userContactSavedAt: new Date().toISOString()
    };

    console.log('👤 Saving user contact info to CRM:', {
      leadId,
      hasName: !!userContactInfo.name,
      hasPhone: !!userContactInfo.phone,
      hasEmail: !!userContactInfo.email
    });

    return this.updateLead(leadId, updateData);
  }

  /**
   * Get lead statistics for debugging
   * @returns {Object} Lead operation statistics
   */
  getStats() {
    return {
      leadId: this.getLeadId(),
      hasLead: !!this.getLeadId(),
      retryAttempts: this.retryAttempts,
      retryDelay: this.retryDelay
    };
  }
}

// Export singleton instance
export const leadService = new LeadOperationsService();
export default leadService;