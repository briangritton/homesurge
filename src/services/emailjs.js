import emailjs from '@emailjs/browser';

/**
 * Initialize EmailJS with your User ID
 * Call this function in your App component or entry point
 * @param {string} userId - Your EmailJS User ID
 */
export const initEmailJS = (userId) => {
  emailjs.init(userId);
};

/**
 * Send notification email when a new lead is created
 * @param {object} leadData - The lead data to send in the notification
 * @param {string} serviceId - Your EmailJS service ID
 * @param {string} templateId - Your EmailJS template ID
 * @returns {Promise} - Promise resolving to the emailjs response
 */
export const sendLeadNotificationEmail = async (leadData, serviceId, templateId) => {
  try {
    // Prepare the template parameters
    // Create the CRM URL for the lead
    const leadId = leadData.id || leadData.leadId || ''; 
    const baseUrl = window.location.origin || 'https://sellforcash.online';
    const crmLink = leadId ? `${baseUrl}/crm?leadId=${leadId}` : `${baseUrl}/crm`;
    
    const templateParams = {
      lead_name: leadData.name || 'New Lead',
      lead_phone: leadData.phone || 'N/A',
      lead_address: leadData.street || 'N/A',
      lead_email: leadData.email || 'N/A',
      lead_source: leadData.leadSource || 'Website',
      submission_time: new Date().toLocaleString(),
      campaign_name: leadData.campaign_name || 'Direct',
      utm_source: leadData.utm_source || 'N/A',
      utm_medium: leadData.utm_medium || 'N/A',
      utm_campaign: leadData.utm_campaign || 'N/A',
      crm_link: crmLink
    };

    console.log('Sending email notification with data:', templateParams);
    
    // Send the email
    const response = await emailjs.send(
      serviceId, 
      templateId, 
      templateParams
    );
    
    console.log('Email notification sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Error sending email notification:', error);
    return { success: false, error };
  }
};

export default {
  initEmailJS,
  sendLeadNotificationEmail
};