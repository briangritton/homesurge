import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Send WhatsApp notification when a lead is assigned
 * @param {string} leadId - The ID of the assigned lead
 * @param {string} salesRepId - The ID of the sales rep assigned to the lead
 * @returns {Promise<boolean>} - Success indicator
 */
export async function sendLeadAssignmentMessage(leadId, salesRepId) {
  try {
    const db = getFirestore();
    
    // Check notification settings first
    const settingsDoc = await getDoc(doc(db, 'settings', 'notifications'));
    
    // If notification settings exist and WhatsApp notifications are disabled, skip sending
    if (settingsDoc.exists() && settingsDoc.data().smsNotificationsEnabled === false) {
      console.log('WhatsApp notifications are disabled in settings, skipping notification');
      return false;
    }
    
    // Get lead details
    const leadDoc = await getDoc(doc(db, 'leads', leadId));
    if (!leadDoc.exists()) {
      console.error('Lead not found:', leadId);
      return false;
    }
    
    const lead = leadDoc.data();
    
    // Get sales rep details including phone number
    const salesRepDoc = await getDoc(doc(db, 'users', salesRepId));
    if (!salesRepDoc.exists()) {
      console.error('Sales rep not found:', salesRepId);
      return false;
    }
    
    const salesRep = salesRepDoc.data();
    
    // Check if sales rep has a phone number
    if (!salesRep.phone) {
      console.error('Sales rep has no phone number:', salesRepId);
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
    
    // Create data for WhatsApp template
    const templateData = {
      leadName: lead.name || 'Unnamed Lead',
      address: `${lead.street || 'No address'}, ${lead.city || ''} ${lead.state || ''} ${lead.zip || ''}`,
      phone: lead.phone || null,
      leadURL
    };
    
    // Get notification settings from Firestore to pass to API
    const notificationSettings = settingsDoc.exists() ? {
      smsNotificationsEnabled: settingsDoc.data().smsNotificationsEnabled !== false,
      notifyOnLeadAssignment: settingsDoc.data().notifyOnLeadAssignment !== false,
      notifyOnNewLead: settingsDoc.data().notifyOnNewLead !== false,
      notifyRepOnAssignment: true, // Default to true if not specified
      notifyAdminOnAssignment: true // Default to true if not specified
    } : null;
    
    // Send WhatsApp message via API endpoint
    const response = await fetch('/api/twilio/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        leadId,
        salesRepId,
        salesRepPhone: salesRep.phone,
        salesRepName: salesRep.name,
        templateData,
        notificationSettings
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending WhatsApp message:', errorData);
      return false;
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use sendLeadAssignmentMessage instead
 */
export const sendLeadAssignmentSMS = sendLeadAssignmentMessage;

export default {
  sendLeadAssignmentMessage,
  sendLeadAssignmentSMS // For backwards compatibility
};