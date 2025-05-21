import { sendLeadNotificationEmail } from './emailjs';

/**
 * Simplified email notification function that uses EmailJS
 * This replaces the previous Firebase Extension-based email system
 * 
 * @param {string} leadId - The ID of the assigned lead
 * @param {string} salesRepId - The ID of the sales rep assigned to the lead
 * @returns {Promise<boolean>} - Success indicator
 */
export async function sendLeadAssignmentEmail(leadId, salesRepId) {
  try {
    console.log('Using EmailJS for lead assignment notification');
    // This is a stub function that maintains compatibility with existing code
    // Actual email sending is now done directly in PersonalInfoForm using EmailJS
    return true;
  } catch (error) {
    console.error('Error in email notification:', error);
    return false;
  }
}

/**
 * Simplified admin notification function that uses EmailJS
 * This replaces the previous Firebase Extension-based email system
 * 
 * @param {string} leadId - The ID of the new lead
 * @param {string} adminEmail - Admin email to notify
 * @returns {Promise<boolean>} - Success indicator
 */
export async function sendAdminLeadNotificationEmail(leadId, adminEmail) {
  try {
    console.log('Using EmailJS for admin notification');
    // This is a stub function that maintains compatibility with existing code
    // Actual email sending is now done directly in PersonalInfoForm using EmailJS
    return true;
  } catch (error) {
    console.error('Error in admin email notification:', error);
    return false;
  }
}

export default {
  sendLeadAssignmentEmail,
  sendAdminLeadNotificationEmail
};