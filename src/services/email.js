import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Send email notification for lead assignment
 * @param {string} leadId - The ID of the assigned lead
 * @param {string} salesRepId - The ID of the sales rep assigned to the lead
 * @returns {Promise<boolean>} - Success indicator
 */
export async function sendLeadAssignmentEmail(leadId, salesRepId) {
  try {
    const db = getFirestore();
    
    // Get lead details
    const leadDoc = await getDoc(doc(db, 'leads', leadId));
    if (!leadDoc.exists()) {
      console.error('Lead not found:', leadId);
      return false;
    }
    
    const lead = leadDoc.data();
    
    // Get sales rep details
    const salesRepDoc = await getDoc(doc(db, 'users', salesRepId));
    if (!salesRepDoc.exists()) {
      console.error('Sales rep not found:', salesRepId);
      return false;
    }
    
    const salesRep = salesRepDoc.data();
    
    // Check if sales rep has an email
    if (!salesRep.email) {
      console.error('Sales rep has no email:', salesRepId);
      return false;
    }
    
    // Create lead URL for the CRM
    const leadURL = `${window.location.origin}/crm?leadId=${leadId}`;
    
    // Create the email data for the Firebase Extension
    const emailData = {
      to: salesRep.email,
      template: {
        name: 'lead-assignment',
        data: {
          salesRepName: salesRep.name,
          leadName: lead.name || 'Unnamed Lead',
          leadAddress: `${lead.street || 'No address'}, ${lead.city || ''} ${lead.state || ''} ${lead.zip || ''}`,
          leadPhone: lead.phone || 'No phone',
          leadEmail: lead.email || 'No email',
          leadURL,
          assignedDate: new Date().toLocaleString()
        }
      },
      message: {
        subject: `New Lead Assigned: ${lead.name || 'Unnamed Lead'}`,
      }
    };
    
    // Store in the mail collection to trigger the Firebase Extension
    const mailsCollection = collection(db, 'mail');
    const emailDoc = doc(mailsCollection);
    
    await setDoc(emailDoc, {
      ...emailData,
      created: serverTimestamp()
    });
    
    console.log('Email notification added to queue:', emailDoc.id);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

/**
 * Send admin notification email for a new lead
 * @param {string} leadId - The ID of the new lead
 * @param {string} adminEmail - Admin email to notify
 * @returns {Promise<boolean>} - Success indicator
 */
export async function sendAdminLeadNotificationEmail(leadId, adminEmail) {
  try {
    const db = getFirestore();
    
    // Get lead details
    const leadDoc = await getDoc(doc(db, 'leads', leadId));
    if (!leadDoc.exists()) {
      console.error('Lead not found:', leadId);
      return false;
    }
    
    const lead = leadDoc.data();
    
    // Create lead URL for the CRM
    const leadURL = `${window.location.origin}/crm?leadId=${leadId}`;
    
    // Create the email data for the Firebase Extension
    const emailData = {
      to: adminEmail,
      template: {
        name: 'admin-new-lead',
        data: {
          leadName: lead.name || 'Unnamed Lead',
          leadAddress: `${lead.street || 'No address'}, ${lead.city || ''} ${lead.state || ''} ${lead.zip || ''}`,
          leadPhone: lead.phone || 'No phone',
          leadEmail: lead.email || 'No email',
          leadSource: lead.leadSource || 'Website',
          campaignName: lead.campaign_name || 'Direct',
          leadURL,
          createdDate: new Date().toLocaleString()
        }
      },
      message: {
        subject: `New Lead Created: ${lead.name || 'Unnamed Lead'}`,
      }
    };
    
    // Store in the mail collection to trigger the Firebase Extension
    const mailsCollection = collection(db, 'mail');
    const emailDoc = doc(mailsCollection);
    
    await setDoc(emailDoc, {
      ...emailData,
      created: serverTimestamp()
    });
    
    console.log('Admin email notification added to queue:', emailDoc.id);
    return true;
  } catch (error) {
    console.error('Error sending admin email notification:', error);
    return false;
  }
}

export default {
  sendLeadAssignmentEmail,
  sendAdminLeadNotificationEmail
};