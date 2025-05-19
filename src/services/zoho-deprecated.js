// ===============================================================
// DEPRECATED: This file is kept for reference purposes only
// All Zoho functionality has been migrated to Firebase/Firestore
// See src/services/firebase.js for the current implementation
// ===============================================================

// Original contents moved from src/services/zoho.js
// This file is not actively used by the application

import axios from 'axios';

/**
 * Track conversion event in Zoho and for marketing analytics
 * @param {string} event - Event type (e.g., 'appointmentSet', 'successfulContact')
 * @param {string} leadId - The Zoho lead ID
 * @param {string} status - Optional status to update in Zoho
 * @param {number|string} customValue - Optional custom conversion value (e.g., transaction amount)
 * @param {Object} additionalData - Optional additional data to include
 * @returns {Promise<boolean>} Success indicator
 */
export async function trackZohoConversion(event, leadId, status = null, customValue = null, additionalData = {}) {
  console.warn('Zoho CRM integration is deprecated. Use Firebase functions instead.');
  return false;
}

/**
 * Submit new lead to Zoho CRM with only relevant fields
 * @param {Object} formData - The form data to submit
 * @returns {Promise<string>} - The ID of the created lead
 */
export async function submitLeadToZoho(formData) {
  console.warn('Zoho CRM integration is deprecated. Use Firebase functions instead.');
  throw new Error('Zoho CRM integration is deprecated');
}

/**
 * Update existing lead in Zoho CRM
 * @param {string} leadId - The ID of the lead to update
 * @param {Object} formData - The updated form data
 * @returns {Promise<boolean>}
 */
export async function updateLeadInZoho(leadId, formData) {
  console.warn('Zoho CRM integration is deprecated. Use Firebase functions instead.');
  return false;
}

/**
 * Specialized function to update ONLY contact info (name and phone)
 * This ensures these fields are explicitly sent to Zoho
 */
export async function updateContactInfo(leadId, name, phone, email = '') {
  console.warn('Zoho CRM integration is deprecated. Use Firebase functions instead.');
  return false;
}

export async function createSuggestionLead(partialAddress, suggestions, contactInfo = null, addressComponents = null) {
  console.warn('Zoho CRM integration is deprecated. Use Firebase functions instead.');
  return null;
}

// Exports remain the same to prevent breaking changes if this file is accidentally imported
export default {
  trackZohoConversion,
  submitLeadToZoho,
  updateLeadInZoho,
  updateContactInfo,
  createSuggestionLead
};