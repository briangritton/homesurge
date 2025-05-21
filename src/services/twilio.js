import { getFirestore, doc, getDoc } from 'firebase/firestore';

/**
 * Send WhatsApp notification when a lead is assigned
 * @param {string} leadId - The ID of the assigned lead
 * @param {string} salesRepId - The ID of the sales rep assigned to the lead
 * @returns {Promise<boolean>} - Success indicator
 */
export async function sendLeadAssignmentMessage(leadId, salesRepId) {
  try {
    const db = getFirestore();
    
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
    
    // Create lead URL for the CRM
    const leadURL = `${window.location.origin}/crm?leadId=${leadId}`;
    
    // Create data for WhatsApp template
    const templateData = {
      leadName: lead.name || 'Unnamed Lead',
      address: `${lead.street || 'No address'}, ${lead.city || ''} ${lead.state || ''} ${lead.zip || ''}`,
      leadURL
    };
    
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
        templateData
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