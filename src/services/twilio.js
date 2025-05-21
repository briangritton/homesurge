import { getFirestore, doc, getDoc } from 'firebase/firestore';

/**
 * Send SMS notification when a lead is assigned
 * @param {string} leadId - The ID of the assigned lead
 * @param {string} salesRepId - The ID of the sales rep assigned to the lead
 * @returns {Promise<boolean>} - Success indicator
 */
export async function sendLeadAssignmentSMS(leadId, salesRepId) {
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
    
    // Message to sales rep
    const salesRepMessage = `New lead assigned to you: ${lead.name || 'Unnamed Lead'} at ${lead.street || 'No address'}, ${lead.city || ''} ${lead.state || ''} ${lead.zip || ''}. View details: ${leadURL}`;
    
    // Message to admin (using the admin phone from environment)
    const adminMessage = `Lead ${lead.name || 'Unnamed Lead'} assigned to ${salesRep.name}. View details: ${leadURL}`;
    
    // Send SMS via API endpoint
    const response = await fetch('/api/twilio/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        leadId,
        salesRepId,
        salesRepPhone: salesRep.phone,
        salesRepMessage,
        adminMessage
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending SMS:', errorData);
      return false;
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
}

export default {
  sendLeadAssignmentSMS
};