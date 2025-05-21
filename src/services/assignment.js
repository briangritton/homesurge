import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { sendLeadAssignmentSMS } from './twilio';
import { sendLeadAssignmentEmail, sendAdminLeadNotificationEmail } from './email';

/**
 * Assign a lead to a specific sales rep
 * @param {string} leadId - The ID of the lead to assign
 * @param {string} salesRepId - The ID of the sales rep to assign to
 * @returns {Promise<boolean>} - Success indicator
 */
export async function assignLeadToSalesRep(leadId, salesRepId) {
  try {
    const db = getFirestore();
    const leadRef = doc(db, 'leads', leadId);
    
    // Update the lead with the new assignment
    await updateDoc(leadRef, {
      assignedTo: salesRepId,
      status: 'Assigned',
      updatedAt: serverTimestamp()
    });
    
    // Send notifications (SMS and Email)
    try {
      // Send SMS notification
      await sendLeadAssignmentSMS(leadId, salesRepId);
      
      // Send email notification to sales rep
      await sendLeadAssignmentEmail(leadId, salesRepId);
      
      // Get admin email for notification
      const settingsDoc = await getDoc(doc(db, 'settings', 'notifications'));
      if (settingsDoc.exists() && settingsDoc.data().adminEmail) {
        await sendAdminLeadNotificationEmail(leadId, settingsDoc.data().adminEmail);
      }
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't fail the assignment if notifications fail
    }
    
    return true;
  } catch (error) {
    console.error('Error assigning lead:', error);
    return false;
  }
}

/**
 * Get active sales reps sorted by assigned lead count (lowest first)
 * @returns {Promise<Array>} - Array of sales reps with loadCount property
 */
export async function getSalesRepsWithLoadCount() {
  try {
    const db = getFirestore();
    
    // Get all sales reps without filtering for active status
    const salesRepsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'sales_rep')
    );
    
    // Execute the query for all sales reps
    const salesRepsSnapshot = await getDocs(salesRepsQuery);
    const salesReps = salesRepsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Log found sales reps for debugging
    console.log(`Found ${salesReps.length} sales reps`);
    
    // For each sales rep, count their assigned leads
    const repsWithLoadCount = await Promise.all(salesReps.map(async (rep) => {
      const leadsQuery = query(
        collection(db, 'leads'),
        where('assignedTo', '==', rep.id)
      );
      
      const leadsSnapshot = await getDocs(leadsQuery);
      
      return {
        ...rep,
        loadCount: leadsSnapshot.size
      };
    }));
    
    // Sort by load count (lowest first)
    return repsWithLoadCount.sort((a, b) => a.loadCount - b.loadCount);
  } catch (error) {
    console.error('Error getting sales reps with load count:', error);
    throw error;
  }
}

/**
 * Auto-assign a lead to the next available sales rep using round-robin
 * @param {string} leadId - The ID of the lead to assign
 * @returns {Promise<Object>} - The assigned sales rep or null
 */
export async function autoAssignLead(leadId) {
  try {
    const db = getFirestore();
    
    // Get the lead to make sure it's not already assigned
    const leadDoc = await getDoc(doc(db, 'leads', leadId));
    if (!leadDoc.exists()) {
      throw new Error(`Lead not found: ${leadId}`);
    }
    
    const lead = leadDoc.data();
    if (lead.assignedTo) {
      console.log(`Lead ${leadId} is already assigned to ${lead.assignedTo}`);
      return null;
    }
    
    // Get sales reps sorted by current load
    const repsWithLoad = await getSalesRepsWithLoadCount();
    
    if (repsWithLoad.length === 0) {
      console.warn('No active sales reps available for auto-assignment');
      return null;
    }
    
    // Assign to the sales rep with the lowest load
    const targetRep = repsWithLoad[0];
    const success = await assignLeadToSalesRep(leadId, targetRep.id);
    
    if (success) {
      console.log(`Lead ${leadId} auto-assigned to ${targetRep.name} (${targetRep.id})`);
      return targetRep;
    } else {
      console.error(`Failed to auto-assign lead ${leadId}`);
      return null;
    }
  } catch (error) {
    console.error('Error in auto-assignment:', error);
    return null;
  }
}

/**
 * Auto-assign all unassigned leads
 * @returns {Promise<Object>} - Stats about the assignment
 */
export async function autoAssignAllUnassignedLeads() {
  try {
    const db = getFirestore();
    
    // Get all unassigned leads
    const unassignedLeadsQuery = query(
      collection(db, 'leads'),
      where('assignedTo', '==', null),
      orderBy('createdAt', 'asc')
    );
    
    const unassignedLeadsSnapshot = await getDocs(unassignedLeadsQuery);
    const unassignedLeads = unassignedLeadsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${unassignedLeads.length} unassigned leads`);
    
    if (unassignedLeads.length === 0) {
      return { 
        total: 0, 
        assigned: 0, 
        failed: 0 
      };
    }
    
    // Get sales reps with load counts once
    const repsWithLoad = await getSalesRepsWithLoadCount();
    
    if (repsWithLoad.length === 0) {
      console.warn('No active sales reps available for auto-assignment');
      return { 
        total: unassignedLeads.length, 
        assigned: 0, 
        failed: unassignedLeads.length,
        error: 'No active sales reps available'
      };
    }
    
    // Clone the reps array to update load counts as we go
    let dynamicReps = [...repsWithLoad];
    
    // Track stats
    const stats = {
      total: unassignedLeads.length,
      assigned: 0,
      failed: 0,
      assignments: []
    };
    
    // Assign each lead
    for (const lead of unassignedLeads) {
      // Sort to get the rep with the lowest load
      dynamicReps.sort((a, b) => a.loadCount - b.loadCount);
      const targetRep = dynamicReps[0];
      
      try {
        const success = await assignLeadToSalesRep(lead.id, targetRep.id);
        
        if (success) {
          // Update the rep's load count
          targetRep.loadCount += 1;
          
          stats.assigned += 1;
          stats.assignments.push({
            leadId: lead.id,
            salesRepId: targetRep.id,
            salesRepName: targetRep.name
          });
        } else {
          stats.failed += 1;
        }
      } catch (error) {
        console.error(`Error assigning lead ${lead.id}:`, error);
        stats.failed += 1;
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error in bulk auto-assignment:', error);
    throw error;
  }
}

export default {
  assignLeadToSalesRep,
  getSalesRepsWithLoadCount,
  autoAssignLead,
  autoAssignAllUnassignedLeads
};