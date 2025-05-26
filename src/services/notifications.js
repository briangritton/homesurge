import { sendLeadNotificationEmail } from './emailjs.js';

/**
 * Centralized notification service for sending lead notifications
 * Combines Pushover and EmailJS notifications in one reusable service
 */

/**
 * Send comprehensive lead notifications (Pushover + EmailJS)
 * @param {Object} leadData - The lead data object
 * @param {Object} options - Configuration options for notifications
 * @returns {Promise<Object>} - Results from both notification services
 */
export async function sendLeadNotifications(leadData, options = {}) {
  const {
    // Pushover configuration
    pushoverUserKey = "um62xd21dr7pfugnwanooxi6mqxc3n", // Primary user key
    additionalPushoverUsers = [], // Array of additional user keys
    
    // EmailJS configuration  
    emailServiceId = 'service_zeuf0n8',
    emailTemplateId = 'template_kuv08p4',
    additionalEmailTemplates = [], // Array of {serviceId, templateId} objects
    
    // Notification customization
    pushoverTitle = "New Lead Notification",
    pushoverSound = "persistent",
    pushoverPriority = 1,
    
    // Source identification
    source = "Website Form" // Help identify where notification came from
  } = options;

  console.log(`🔔 Sending lead notifications from: ${source}`);
  
  // Prepare lead data with fallbacks
  const processedLeadData = {
    name: leadData.name || 'New Lead',
    phone: leadData.phone || 'N/A',
    address: leadData.address || leadData.street || 'No address',
    email: leadData.email || '',
    leadSource: leadData.leadSource || source,
    campaign_name: leadData.campaign_name || leadData.campaignName || 'Direct',
    utm_source: leadData.utm_source || '',
    utm_medium: leadData.utm_medium || '',
    utm_campaign: leadData.utm_campaign || '',
    id: leadData.id || leadData.leadId || localStorage.getItem('leadId') || '',
    street: leadData.street || leadData.address || 'No address'
  };

  // Create CRM URL for easy access
  const leadId = processedLeadData.id;
  const baseUrl = window.location.origin || 'https://sellforcash.online';
  const crmUrl = leadId ? `${baseUrl}/crm?leadId=${leadId}` : `${baseUrl}/crm`;

  const results = {
    pushover: { success: false, results: [] },
    emailjs: { success: false, results: null },
    summary: { totalNotificationsSent: 0, errors: [] }
  };

  // Run notifications in parallel but capture all results
  const notificationPromises = [];

  // 1. PUSHOVER NOTIFICATIONS
  notificationPromises.push(
    sendPushoverNotifications(processedLeadData, {
      primaryUserKey: pushoverUserKey,
      additionalUsers: additionalPushoverUsers,
      crmUrl,
      title: pushoverTitle,
      sound: pushoverSound,
      priority: pushoverPriority
    }).then(result => {
      results.pushover = result;
      return result;
    }).catch(error => {
      results.pushover.error = error;
      results.summary.errors.push(`Pushover: ${error.message}`);
      return { success: false, error };
    })
  );

  // 2. EMAILJS NOTIFICATIONS  
  notificationPromises.push(
    sendLeadNotificationEmail(
      processedLeadData,
      emailServiceId,
      emailTemplateId,
      additionalEmailTemplates
    ).then(result => {
      results.emailjs = result;
      return result;
    }).catch(error => {
      results.emailjs.error = error;
      results.summary.errors.push(`EmailJS: ${error.message}`);
      return { success: false, error };
    })
  );

  // Wait for all notifications to complete
  await Promise.allSettled(notificationPromises);

  // Calculate summary
  results.summary.totalNotificationsSent = 
    (results.pushover.success ? results.pushover.sentCount || 1 : 0) +
    (results.emailjs.success ? 1 : 0);

  console.log(`📊 Notification Summary:`, {
    pushoverSuccess: results.pushover.success,
    emailjsSuccess: results.emailjs.success,
    totalSent: results.summary.totalNotificationsSent,
    errors: results.summary.errors
  });

  return results;
}

/**
 * Send Pushover notifications to multiple recipients
 * @param {Object} leadData - Processed lead data
 * @param {Object} config - Pushover configuration
 * @returns {Promise<Object>} - Pushover results
 */
async function sendPushoverNotifications(leadData, config) {
  const { primaryUserKey, additionalUsers, crmUrl, title, sound, priority } = config;
  
  // Prepare message content
  const message = `New lead: ${leadData.name}\nPhone: ${leadData.phone}\nAddress: ${leadData.address}\nLead ID: ${leadData.id || 'N/A'}`;
  
  // Base request payload
  const basePayload = {
    message,
    title,
    priority,
    sound,
    url: crmUrl,
    url_title: "View in CRM"
  };

  // Collect all user keys to notify
  const allUserKeys = [primaryUserKey, ...additionalUsers].filter(Boolean);
  
  const pushoverResults = [];
  let successCount = 0;

  // Send to each user key
  for (const userKey of allUserKeys) {
    try {
      const payload = { ...basePayload, user: userKey };
      
      const response = await fetch('/api/pushover/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        pushoverResults.push({ userKey: userKey.substring(0, 5) + '...', success: true, result });
        successCount++;
      } else {
        const error = await response.json();
        pushoverResults.push({ userKey: userKey.substring(0, 5) + '...', success: false, error });
      }
    } catch (error) {
      pushoverResults.push({ userKey: userKey.substring(0, 5) + '...', success: false, error: error.message });
    }
  }

  return {
    success: successCount > 0,
    sentCount: successCount,
    totalAttempted: allUserKeys.length,
    results: pushoverResults
  };
}

/**
 * Quick helper for ValueBoost funnel notifications with default settings
 * @param {Object} leadData - Lead data from ValueBoost form
 * @returns {Promise<Object>} - Notification results
 */
export async function sendValueBoostNotifications(leadData) {
  return sendLeadNotifications(leadData, {
    source: "ValueBoost Funnel",
    pushoverTitle: "New ValueBoost Lead",
    // Use default settings for other options
  });
}

/**
 * Quick helper for main form notifications with default settings  
 * @param {Object} leadData - Lead data from main form
 * @returns {Promise<Object>} - Notification results
 */
export async function sendMainFormNotifications(leadData) {
  return sendLeadNotifications(leadData, {
    source: "Main Form",
    pushoverTitle: "New Lead Notification",
    // Use default settings for other options
  });
}

