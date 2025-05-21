import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Send a Pushover notification when a lead is assigned
 * @param {string} leadId - The ID of the assigned lead
 * @param {string} salesRepId - The ID of the sales rep assigned to the lead
 * @returns {Promise<boolean>} - Success indicator
 */
export async function sendLeadAssignmentNotification(leadId, salesRepId) {
  try {
    const db = getFirestore();
    
    // Check notification settings first
    const settingsDoc = await getDoc(doc(db, 'settings', 'notifications'));
    
    // If notification settings exist and Pushover notifications are disabled, skip sending
    if (settingsDoc.exists() && settingsDoc.data().pushoverNotificationsEnabled === false) {
      console.log('Pushover notifications are disabled in settings, skipping notification');
      return false;
    }
    
    // Get lead details
    const leadDoc = await getDoc(doc(db, 'leads', leadId));
    if (!leadDoc.exists()) {
      console.error('Lead not found:', leadId);
      return false;
    }
    
    const lead = leadDoc.data();
    
    // Get sales rep details including Pushover user key
    const salesRepDoc = await getDoc(doc(db, 'users', salesRepId));
    if (!salesRepDoc.exists()) {
      console.error('Sales rep not found:', salesRepId);
      return false;
    }
    
    const salesRep = salesRepDoc.data();
    
    // Check if sales rep has a Pushover user key
    if (!salesRep.pushoverUserKey) {
      console.error('Sales rep has no Pushover user key:', salesRepId);
      return false;
    }
    
    // Check if this specific notification event is enabled
    if (settingsDoc.exists()) {
      const settings = settingsDoc.data();
      // Check if lead assignment notifications are enabled
      if (settings.notifyOnLeadAssignment === false) {
        console.log('Lead assignment notifications are disabled in settings, skipping notification');
        return false;
      }
    }
    
    // Create lead URL for the CRM
    const leadURL = `${window.location.origin}/crm?leadId=${leadId}`;
    
    // Format address
    const address = [
      lead.street || 'No address',
      lead.city || '',
      lead.state || '',
      lead.zip || ''
    ].filter(Boolean).join(', ');
    
    // Create message content
    const message = `New lead assigned: ${lead.name || 'Unnamed Lead'}\nAddress: ${address}${lead.phone ? `\nPhone: ${lead.phone}` : ''}`;
    
    // Prepare the request payload for Pushover API
    const payload = {
      // Do not include token here - it will be added by the API endpoint
      user: salesRep.pushoverUserKey,
      message: message,
      title: "New Lead Assigned",
      url: leadURL,
      url_title: "View in CRM",
      priority: 1, // High priority but not emergency
      sound: "persistent", // Distinctive sound
    };
    
    // Log the notification attempt for debugging
    console.log('Attempting to send Pushover notification:', {
      salesRepId,
      salesRepName: salesRep.name,
      userKey: salesRep.pushoverUserKey?.substring(0, 5) + '...' // Only show first few chars for security
    });
    
    // Send notification via API endpoint 
    const response = await fetch('/api/pushover/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending Pushover notification:', errorData);
      return false;
    }
    
    const result = await response.json();
    
    // Check if we should also notify admin
    if (settingsDoc.exists() && settingsDoc.data().notifyAdminOnAssignment !== false && settingsDoc.data().pushoverAdminUserKey) {
      // Send admin notification
      const adminPayload = {
        ...payload,
        user: settingsDoc.data().pushoverAdminUserKey,
        title: `Lead Assigned to ${salesRep.name}`,
      };
      
      await fetch('/api/pushover/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminPayload)
      });
    }
    
    return result.success;
  } catch (error) {
    console.error('Error sending Pushover notification:', error);
    return false;
  }
}

/**
 * Store a user's Pushover key in their profile
 * @param {string} userId - The user ID
 * @param {string} pushoverUserKey - The Pushover user key
 * @returns {Promise<boolean>} - Success indicator
 */
export async function storePushoverUserKey(userId, pushoverUserKey) {
  try {
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      pushoverUserKey: pushoverUserKey
    });
    
    return true;
  } catch (error) {
    console.error('Error storing Pushover user key:', error);
    return false;
  }
}

export default {
  sendLeadAssignmentNotification,
  storePushoverUserKey
};