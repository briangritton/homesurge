import { sendLeadNotificationEmail } from './emailjs.js';

/**
 * Centralized notification service for sending lead notifications
 * Combines Pushover and EmailJS notifications in one reusable service
 */

// ================= GLOBAL ADDITIONAL RECIPIENTS CONTROL ==================
// To disable ALL Spencer notifications across the entire system:
// 1. Comment out the arrays below
// ============================================================================

const GLOBAL_ADDITIONAL_RECIPIENTS = {

  additionalPushoverUsers: [
    "uh5nkfdqcz161r35e6uy55j295to5y", // Spencer Pushover - DISABLED
    // "ufrb12nxavarvmx4vuct15ibz2augo", // Allison user key - COMMENTED OUT
  ],
  additionalEmailTemplates: [
    {
      serviceId: 'service_zeuf0n8',
      templateId: 'template_85tw59u' // Spencer EmailJS - DISABLED
    }
  ]

};

// ================= END GLOBAL RECIPIENTS CONTROL ======================

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
    id: leadData.id || leadData.leadId || localStorage.getItem('leadId') || localStorage.getItem('suggestionLeadId') || '',
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
 * Determine if notifications should be sent based on campaign and data conditions
 * @param {Object} leadData - Lead data to evaluate
 * @param {string} notificationType - Type of notification ('contact_info', 'address_submit', 'autofill')
 * @returns {boolean} - Whether to send notifications
 */
function shouldSendNotification(leadData, notificationType) {
  // Get campaign name from multiple possible sources
  const campaignName = leadData.campaign_name || leadData.campaignName || '';
  const campaignLower = campaignName.toLowerCase();
  
  console.log(`🔔 Checking notification conditions:`, {
    notificationType,
    campaignName,
    hasName: !!leadData.name,
    hasPhone: !!leadData.phone,
    hasAddress: !!(leadData.address || leadData.street)
  });
  
  switch (notificationType) {
    case 'contact_info':
      // ALWAYS send when we get phone - FOR ALL CAMPAIGNS (name optional)
      const hasContactInfo = leadData.phone && leadData.phone !== '';
      if (hasContactInfo) {
        console.log('✅ Sending contact_info notification - ALL CAMPAIGNS: has phone');
        return true;
      }
      break;
      
    case 'autofill':
      // ALWAYS send when we get autofilled phone - FOR ALL CAMPAIGNS (name optional)
      const hasAutofillData = leadData.phone && leadData.phone !== '';
      if (hasAutofillData) {
        console.log('✅ Sending autofill notification - ALL CAMPAIGNS: has autofilled phone');
        return true;
      }
      break;
      
    case 'address_submit':
      // ONLY send for campaigns containing "fast", "cash", or "sell"
      const isFastCashOrSellCampaign = campaignLower.includes('fast') || campaignLower.includes('cash') || campaignLower.includes('sell');
      const hasAddress = leadData.address || leadData.street;
      
      if (isFastCashOrSellCampaign && hasAddress) {
        console.log('✅ Sending address_submit notification - FAST/CASH/SELL campaign with address:', campaignName);
        return true;
      } else if (hasAddress && !isFastCashOrSellCampaign) {
        console.log('❌ NOT sending address_submit notification - not a fast/cash/sell campaign:', campaignName);
        return false;
      } else if (!hasAddress) {
        console.log('❌ NOT sending address_submit notification - no address provided');
        return false;
      }
      break;
      
    default:
      console.log('❌ Unknown notification type:', notificationType);
      return false;
  }
  
  console.log('❌ Notification conditions not met');
  return false;
}

/**
 * Smart notification handler that checks conditions before sending
 * @param {Object} leadData - Lead data from form
 * @param {string} notificationType - Type of notification trigger
 * @param {Object} customOptions - Additional options to override defaults
 * @returns {Promise<Object|null>} - Notification results or null if not sent
 */
export async function sendConditionalNotifications(leadData, notificationType, customOptions = {}) {
  // Check if we should send notifications based on conditions
  if (!shouldSendNotification(leadData, notificationType)) {
    console.log(`🚫 Skipping ${notificationType} notification due to campaign/data conditions`);
    return null;
  }
  
  // Determine title based on notification type and campaign
  const campaignName = leadData.campaign_name || leadData.campaignName || 'Direct';
  let pushoverTitle = "New Lead Notification";
  let source = "Website Form";
  
  switch (notificationType) {
    case 'contact_info':
      pushoverTitle = "New Contact Info Lead";
      source = "Contact Form";
      break;
    case 'autofill':
      pushoverTitle = "New Autofill Lead";
      source = "Autofill Detection";
      break;
    case 'address_submit':
      pushoverTitle = `New Address Lead - ${campaignName}`;
      source = "Address Submission";
      break;
  }
  
  // Merge custom options with defaults + global additional recipients
  const options = {
    source,
    pushoverTitle,
    // Use global additional recipients
    ...GLOBAL_ADDITIONAL_RECIPIENTS,
    // Add campaign info to the notification context
    additionalContext: {
      notificationType,
      campaignName
    },
    ...customOptions
  };
  
  console.log(`📤 Sending ${notificationType} notification for campaign: ${campaignName}`);
  return sendLeadNotifications(leadData, options);
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
    // Use global additional recipients (currently commented out for ValueBoost)
    // ...GLOBAL_ADDITIONAL_RECIPIENTS,
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
    // Use global additional recipients
    ...GLOBAL_ADDITIONAL_RECIPIENTS,
  });
}

