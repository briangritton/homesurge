import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { trackFirebaseConversion, deleteLeadFromFirebase } from '../../services/firebase';
import { sendLeadAssignmentSMS } from '../../services/twilio';
import PriorityInfoFields from './PriorityInfoFields';
import LiveChat from '../LiveChat/LiveChat';

// CSS for the lead detail view
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    margin: 0,
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#45bc97',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  content: {
    display: 'flex',
    gap: '30px',
  },
  mainColumn: {
    flex: '2',
  },
  sideColumn: {
    flex: '1',
  },
  section: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  prioritySection: {
    background: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #f0f0f0',
  },
  fieldGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
  },
  value: {
    fontSize: '16px',
    wordBreak: 'break-word',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '10px',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    background: 'white',
    marginBottom: '10px',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    minHeight: '100px',
    resize: 'vertical',
    marginBottom: '10px',
  },
  button: {
    padding: '8px 16px',
    background: '#45bc97',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px',
    boxShadow: '0 4px 12px rgba(69, 188, 151, 0.3)',
    transition: 'all 0.3s ease',
  },
  dangerButton: {
    padding: '8px 16px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  conversionButton: {
    padding: '8px 16px',
    background: 'white',
    color: '#45bc97',
    border: '1px solid #45bc97',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px',
    marginBottom: '10px',
    transition: 'all 0.3s ease',
  },
  activityLog: {
    maxHeight: '300px',
    overflowY: 'auto',
    border: '1px solid #f0f0f0',
    borderRadius: '4px',
    padding: '10px',
  },
  activityItem: {
    padding: '10px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
  },
  timestamp: {
    fontSize: '12px',
    color: '#999',
    marginTop: '5px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  addNoteForm: {
    marginTop: '20px',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '10px',
  },
  noData: {
    color: '#999',
    fontStyle: 'italic',
  },
  assignedTo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#2e7b7d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    marginRight: '10px',
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '50px',
    color: '#666',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e0e0e0',
    marginBottom: '20px',
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    borderBottom: '2px solid #45bc97',
    fontWeight: 'bold',
    color: '#45bc97',
  },
  navLink: {
    background: 'none',
    border: 'none',
    color: '#45bc97',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    textDecoration: 'none',
    marginLeft: '20px',
  },
  navLinkDisabled: {
    color: '#ccc',
    cursor: 'not-allowed',
  },
};

// Status color mapping
const statusColors = {
  'Unassigned': { background: '#45bc97', color: 'white' },
  'New': { background: '#45bc97', color: 'white' }, // Legacy support - treat as Unassigned
  'Called In': { background: '#4CAF50', color: 'white' }, // Green for incoming calls
  'Contacted': { background: '#C8E6C9', color: '#1B5E20' },
  'Qualified': { background: '#FFF9C4', color: '#F57F17' },
  'Appointment': { background: '#FFE0B2', color: '#E65100' },
  'Offer': { background: '#FFCCBC', color: '#BF360C' },
  'Contract': { background: '#D1C4E9', color: '#4527A0' },
  'Closed': { background: '#B2DFDB', color: '#004D40' },
  'Dead': { background: '#FFCDD2', color: '#B71C1C' },
};

// Conversion events configuration
const conversionEvents = [
  { id: 'successfulContact', label: 'Successful Contact', status: 'Contacted' },
  { id: 'appointmentSet', label: 'Appointment Set', status: 'Appointment' },
  { id: 'offerMade', label: 'Offer Made', status: 'Offer' },
  { id: 'contractSigned', label: 'Contract Signed', status: 'Contract' },
  { id: 'successfullyClosedTransaction', label: 'Deal Closed', status: 'Closed' },
  { id: 'notInterested', label: 'Not Interested', status: 'Dead' },
  { id: 'wrongNumber', label: 'Wrong Number', status: 'Dead' },
];

const LeadDetail = ({ leadId, onBack, isAdmin = true }) => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [salesReps, setSalesReps] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Navigation state
  const [allFilteredLeads, setAllFilteredLeads] = useState([]);
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [showAllPageVisits] = useState(false); // Fixed to false since filter is not displayed
  
  useEffect(() => {
    if (leadId) {
      fetchLead(leadId);
      fetchSalesReps();
      fetchAllFilteredLeads(leadId);
    }
  }, [leadId, showAllPageVisits]); // fetchAllFilteredLeads is defined below and stable
  
  const fetchLead = async (id, retryCount = 0) => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Add timeout to prevent hanging
      const leadDocPromise = getDoc(doc(db, 'leads', id));
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase timeout')), 10000)
      );
      
      const leadDoc = await Promise.race([leadDocPromise, timeoutPromise]);
      
      if (leadDoc.exists()) {
        const leadData = {
          id: leadDoc.id,
          ...leadDoc.data(),
          // Convert timestamps to dates for display
          createdAt: leadDoc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: leadDoc.data().updatedAt?.toDate?.() || new Date()
        };
        
        setLead(leadData);
        setFormData(leadData);
      } else {
        setError("Lead not found");
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching lead:', err);
      
      // Retry logic for Firebase timeouts/connection issues
      if (retryCount < 2 && (err.message.includes('timeout') || err.message.includes('network'))) {
        console.log(`Retrying lead fetch (attempt ${retryCount + 1})`);
        setTimeout(() => fetchLead(id, retryCount + 1), 1000);
        return;
      }
      
      setError('Failed to load lead details. Please try again.');
      setLoading(false);
    }
  };
  
  const fetchSalesReps = async () => {
    try {
      const db = getFirestore();
      const salesRepsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'sales_rep'),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(salesRepsQuery);
      const reps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSalesReps(reps);
    } catch (err) {
      console.error('Error fetching sales reps:', err);
    }
  };
  
  const fetchAllFilteredLeads = async (currentLeadId) => {
    try {
      const db = getFirestore();
      
      // Build query to get all leads with proper ordering
      let leadsRef = collection(db, 'leads');
      let constraints = [orderBy('createdAt', 'desc')]; // Same order as LeadList
      
      const leadsQuery = query(leadsRef, ...constraints);
      const snapshot = await getDocs(leadsQuery);
      
      // Transform data same as LeadList
      const leadsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }));
      
      // Apply the same filter logic as LeadList
      const filteredLeads = leadsList.filter(lead => {
        // Apply form submission filter same as LeadList
        if (!showAllPageVisits) {
          const hasSubmittedForm = lead.submittedAny === true;
          const hasContactInfo = lead.name || lead.phone || lead.email;
          
          if (!hasSubmittedForm && !hasContactInfo) {
            return false;
          }
        }
        return true;
      });
      
      setAllFilteredLeads(filteredLeads);
      
      // Find current lead index in filtered list
      const currentIndex = filteredLeads.findIndex(lead => lead.id === currentLeadId);
      setCurrentLeadIndex(currentIndex >= 0 ? currentIndex : 0);
      
    } catch (err) {
      console.error('Error fetching filtered leads for navigation:', err);
    }
  };
  
  const navigateToLead = async (direction) => {
    if (navigationLoading || allFilteredLeads.length === 0) return;
    
    let newIndex = currentLeadIndex;
    if (direction === 'next' && currentLeadIndex < allFilteredLeads.length - 1) {
      newIndex = currentLeadIndex + 1;
    } else if (direction === 'prev' && currentLeadIndex > 0) {
      newIndex = currentLeadIndex - 1;
    } else {
      return; // No navigation possible
    }
    
    const targetLead = allFilteredLeads[newIndex];
    if (!targetLead) return;
    
    setNavigationLoading(true);
    
    try {
      // Update the current lead data
      await fetchLead(targetLead.id);
      setCurrentLeadIndex(newIndex);
      
      // Clear any edit mode when navigating
      setEditMode(false);
      setNote('');
      
      // Update URL hash for deep linking
      window.location.hash = `lead-${targetLead.id}`;
      
    } catch (error) {
      console.error('Error navigating to lead:', error);
    } finally {
      setNavigationLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async () => {
    try {
      setSaving(true);
      const db = getFirestore();
      const leadRef = doc(db, 'leads', leadId);
      
      // Check if assignedTo field has changed and is not empty
      const isNewAssignment = formData.assignedTo && formData.assignedTo !== lead.assignedTo;
      
      // Prepare update data
      const updateData = {
        ...formData,
        updatedAt: serverTimestamp()
      };
      
      // Remove id field (it's the document ID, not a field)
      delete updateData.id;
      
      // Remove createdAt timestamp field (keep updatedAt)
      delete updateData.createdAt;
      
      await updateDoc(leadRef, updateData);
      
      // If this is a new assignment, send SMS notification
      if (isNewAssignment) {
        console.log(`Sending SMS notification for lead ${leadId} assigned to ${formData.assignedTo}`);
        try {
          const smsResult = await sendLeadAssignmentSMS(leadId, formData.assignedTo);
          if (smsResult) {
            console.log('SMS notification sent successfully');
          } else {
            console.warn('Failed to send SMS notification');
          }
        } catch (smsError) {
          console.error('Error sending SMS notification:', smsError);
          // Don't fail the whole operation if SMS fails
        }
      }
      
      // Refresh lead data
      fetchLead(leadId);
      
      // Exit edit mode
      setEditMode(false);
      setSaving(false);
    } catch (err) {
      console.error('Error updating lead:', err);
      setError('Failed to save changes. Please try again.');
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    // Reset form data to original lead data
    setFormData(lead);
    setEditMode(false);
  };
  
  const handleRecordConversion = async (eventId) => {
    try {
      setSaving(true);
      
      // Find the event config
      const event = conversionEvents.find(e => e.id === eventId);
      if (!event) {
        throw new Error('Invalid event type');
      }
      
      // Record conversion
      const result = await trackFirebaseConversion(
        eventId,
        leadId,
        event.status,
        null, // custom value
        { note: `Event ${event.label} recorded by admin` }
      );
      
      if (result) {
        // Refresh lead data
        fetchLead(leadId);
      } else {
        setError('Failed to record conversion event');
      }
      
      setSaving(false);
    } catch (err) {
      console.error('Error recording conversion:', err);
      setError('Failed to record conversion. Please try again.');
      setSaving(false);
    }
  };
  
  const handleAddNote = async () => {
    if (!note.trim()) return;
    
    try {
      setSaving(true);
      const db = getFirestore();
      const leadRef = doc(db, 'leads', leadId);
      
      // Get current notes
      const notes = lead.notes || [];
      
      // Add new note
      const newNote = {
        text: note,
        timestamp: new Date(),
        userId: 'admin', // In a real app, this would be the current user's ID
        userName: 'Admin' // In a real app, this would be the current user's name
      };
      
      await updateDoc(leadRef, {
        notes: [...notes, newNote],
        updatedAt: serverTimestamp()
      });
      
      // Refresh lead data
      fetchLead(leadId);
      
      // Clear note input
      setNote('');
      setSaving(false);
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note. Please try again.');
      setSaving(false);
    }
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const renderStatusBadge = (status) => {
    const statusStyle = statusColors[status] || { background: '#e0e0e0', color: '#333' };
    const displayStatus = status === 'New' ? 'Unassigned' : status;
    
    return (
      <span 
        style={{ 
          ...styles.statusBadge, 
          background: statusStyle.background, 
          color: statusStyle.color 
        }}
      >
        {displayStatus}
      </span>
    );
  };
  
  if (loading) {
    return (
      <div style={styles.loadingMessage}>
        Loading lead details...
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={onBack}>
            ← Back to Leads
          </button>
        </div>
        <div style={styles.section}>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }
  
  if (!lead) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={onBack}>
            ← Back to Leads
          </button>
        </div>
        <div style={styles.section}>
          <p>Lead not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={onBack}>
            ← Back to Leads
          </button>
          <h1 style={styles.title}>
            {lead.name || 'Unnamed Lead'} {renderStatusBadge(lead.status || 'Unassigned')}
          </h1>
        </div>
        
        <div style={{display: 'flex', alignItems: 'center'}}>
          <button 
            style={{
              ...styles.navLink,
              ...(currentLeadIndex === 0 || navigationLoading ? styles.navLinkDisabled : {})
            }}
            onClick={() => navigateToLead('prev')}
            disabled={currentLeadIndex === 0 || navigationLoading}
          >
            ← Previous Lead
          </button>
          
          <button 
            style={{
              ...styles.navLink,
              ...(currentLeadIndex === allFilteredLeads.length - 1 || navigationLoading ? styles.navLinkDisabled : {})
            }}
            onClick={() => navigateToLead('next')}
            disabled={currentLeadIndex === allFilteredLeads.length - 1 || navigationLoading}
          >
            Next Lead →
          </button>
        </div>
      </div>

      {/* Live Chat Section */}
      <LiveChat 
        leadId={leadId} 
        leadName={lead.name || 'Customer'} 
        userRole="sales" 
        userName="Spencer"
        // prefilledGreeting="Hey this is Spencer, I actually have a second now to see if this might be a good fit so I thought I'd jump right on and say hi! How are you today?"
      />

      {/* Priority Information Section */}
      <div style={styles.prioritySection} className="crm-lead-section crm-lead-priority-section">
        <h3 style={styles.sectionTitle}>Priority Information</h3>
        <PriorityInfoFields lead={lead} />
      </div>
      
      <div style={styles.tabs} className="crm-lead-detail-tabs">
        <div 
          style={{
            ...styles.tab, 
            ...(activeTab === 'details' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('details')}
          className={`crm-lead-detail-tab ${activeTab === 'details' ? 'crm-lead-detail-tab-active' : ''}`}
        >
          Lead Details
        </div>
        <div 
          style={{
            ...styles.tab, 
            ...(activeTab === 'activity' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('activity')}
          className={`crm-lead-detail-tab ${activeTab === 'activity' ? 'crm-lead-detail-tab-active' : ''}`}
        >
          Activity History
        </div>
        <div 
          style={{
            ...styles.tab, 
            ...(activeTab === 'property' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('property')}
          className={`crm-lead-detail-tab ${activeTab === 'property' ? 'crm-lead-detail-tab-active' : ''}`}
        >
          Property Info
        </div>
        {isAdmin && (
          <div 
            style={{
              ...styles.tab, 
              ...(activeTab === 'tracking' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('tracking')}
            className={`crm-lead-detail-tab ${activeTab === 'tracking' ? 'crm-lead-detail-tab-active' : ''}`}
          >
            Marketing Data
          </div>
        )}
      </div>
      
      <div style={styles.content} className="crm-lead-detail-content">
        <div style={styles.mainColumn} className="crm-lead-main-column">
          {activeTab === 'details' && (
            <div style={styles.section} className="crm-lead-section crm-lead-contact-info-section">
              <h3 style={styles.sectionTitle}>Contact Information</h3>
              
              {editMode ? (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Auto Filled Name</label>
                    <input
                      type="text"
                      name="autoFilledName"
                      value={formData.autoFilledName || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Auto Filled Phone</label>
                    <input
                      type="text"
                      name="autoFilledPhone"
                      value={formData.autoFilledPhone || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  {/* BatchData Fields - Display Only in Edit Mode */}
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>BatchData Phone Numbers (Read Only)</label>
                    <div style={{...styles.input, backgroundColor: '#f5f5f5', padding: '8px 12px'}}>
                      {formData.batchDataPhoneNumbers && Array.isArray(formData.batchDataPhoneNumbers) && formData.batchDataPhoneNumbers.length > 0 
                        ? formData.batchDataPhoneNumbers.join(', ') 
                        : 'N/A'}
                    </div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>BatchData Emails (Read Only)</label>
                    <div style={{...styles.input, backgroundColor: '#f5f5f5', padding: '8px 12px'}}>
                      {formData.batchDataEmails && Array.isArray(formData.batchDataEmails) && formData.batchDataEmails.length > 0 
                        ? formData.batchDataEmails.join(', ') 
                        : 'N/A'}
                    </div>
                  </div>
                  
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>BatchData Processed At (Read Only)</label>
                    <div style={{...styles.input, backgroundColor: '#f5f5f5', padding: '8px 12px'}}>
                      {formData.batchDataProcessedAt || 'N/A'}
                    </div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Status</label>
                    <select
                      name="status"
                      value={formData.status || 'Unassigned'}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      <option value="Unassigned">Unassigned</option>
                      <option value="Called In">Called In</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Appointment">Appointment</option>
                      <option value="Offer">Offer</option>
                      <option value="Contract">Contract</option>
                      <option value="Closed">Closed</option>
                      <option value="Dead">Dead</option>
                    </select>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Lead Stage</label>
                    <input
                      type="text"
                      name="leadStage"
                      value={formData.leadStage || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  {isAdmin && (
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Assigned To</label>
                      <select
                        name="assignedTo"
                        value={formData.assignedTo || ''}
                        onChange={handleInputChange}
                        style={styles.select}
                      >
                        <option value="">Unassigned</option>
                        {salesReps.map(rep => (
                          <option key={rep.id} value={rep.id}>
                            {rep.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Save/Cancel buttons for edit mode */}
                  <div className="crm-button-row">
                    <button 
                      className="crm-success-button"
                      onClick={handleSubmit}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      className="crm-danger-button"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Name</div>
                    <div style={styles.value}>{lead.name || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Auto Filled Name</div>
                    <div style={styles.value}>{lead.autoFilledName || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Phone</div>
                    <div style={styles.value}>{lead.phone || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Auto Filled Phone</div>
                    <div style={styles.value}>{lead.autoFilledPhone || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Email</div>
                    <div style={styles.value}>{lead.email || 'N/A'}</div>
                  </div>
                  
                  {/* BatchData Fields */}
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>BatchData Phone Numbers</div>
                    <div style={styles.value}>
                      {lead.batchDataPhoneNumbers && Array.isArray(lead.batchDataPhoneNumbers) && lead.batchDataPhoneNumbers.length > 0 ? (
                        lead.batchDataPhoneNumbers.map((phone, index) => (
                          <div key={index}>
                            <a href={`tel:${phone}`} className="crm-phone-link">{phone}</a>
                          </div>
                        ))
                      ) : 'N/A'}
                    </div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>BatchData Emails</div>
                    <div style={styles.value}>
                      {lead.batchDataEmails && Array.isArray(lead.batchDataEmails) && lead.batchDataEmails.length > 0 ? (
                        lead.batchDataEmails.map((email, index) => (
                          <div key={index}>
                            <a href={`mailto:${email}`} className="crm-email-link">{email}</a>
                          </div>
                        ))
                      ) : 'N/A'}
                    </div>
                  </div>
                  
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>BatchData Processed At</div>
                    <div style={styles.value}>{lead.batchDataProcessedAt || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Status</div>
                    <div>{renderStatusBadge(lead.status || 'Unassigned')}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Lead Stage</div>
                    <div style={styles.value}>{lead.leadStage || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Lead Source</div>
                    <div style={styles.value}>{lead.leadSource || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Assigned To</div>
                    {lead.assignedTo ? (
                      <div style={styles.assignedTo}>
                        <div style={styles.avatar}>
                          {(salesReps.find(rep => rep.id === lead.assignedTo)?.name || 'A')[0]}
                        </div>
                        <span>{salesReps.find(rep => rep.id === lead.assignedTo)?.name || 'Unknown'}</span>
                      </div>
                    ) : (
                      <div style={styles.value}>Unassigned</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'details' && (
            <div style={styles.section} className="crm-lead-section crm-lead-address-section">
              <h3 style={styles.sectionTitle}>Address Information</h3>
              
              {editMode ? (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>ZIP Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Street Address</div>
                    <div style={styles.value}>{lead.street || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>City</div>
                    <div style={styles.value}>{lead.city || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>State</div>
                    <div style={styles.value}>{lead.state || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>ZIP Code</div>
                    <div style={styles.value}>{lead.zip || 'N/A'}</div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Reports Section in Lead Details Tab */}
          {activeTab === 'details' && (
            <div style={styles.section} className="crm-lead-section crm-lead-reports-section">
              <h3 style={styles.sectionTitle}>Reports & Activity</h3>
              
              {/* Conversion Events Summary */}
              <h4 style={{...styles.sectionTitle, fontSize: '14px', marginBottom: '10px'}}>Latest Conversion Events</h4>
              {lead.conversions && lead.conversions.length > 0 ? (
                <div style={styles.activityLog}>
                  {lead.conversions.slice(0, 3).map((conversion, index) => (
                    <div key={index} style={styles.activityItem}>
                      <strong>{conversion.event}</strong>
                      {conversion.status && ` - ${conversion.status}`}
                      {conversion.value && ` (Value: $${conversion.value})`}
                      <div style={styles.timestamp}>
                        {conversion.timestamp?.toDate 
                          ? formatDate(conversion.timestamp.toDate()) 
                          : 'No timestamp'}
                      </div>
                    </div>
                  ))}
                  {lead.conversions.length > 3 && (
                    <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
                      ... and {lead.conversions.length - 3} more events
                    </div>
                  )}
                </div>
              ) : (
                <p style={styles.noData}>No conversion events recorded yet.</p>
              )}
              
              {/* Record Conversion Event Section */}
              <h4 style={{...styles.sectionTitle, fontSize: '14px', marginBottom: '10px', marginTop: '20px'}}>Record Conversion Event</h4>
              <div className="crm-lead-conversion-buttons" style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                {conversionEvents.map(event => (
                  <button
                    key={event.id}
                    style={styles.conversionButton}
                    onClick={() => handleRecordConversion(event.id)}
                    disabled={saving}
                  >
                    {event.label}
                  </button>
                ))}
              </div>
              
              {/* BatchData Report Section */}
              {lead.batchDataReport && (
                <>
                  <h4 style={{...styles.sectionTitle, fontSize: '14px', marginBottom: '10px', marginTop: '20px'}}>BatchData Skip Trace Report</h4>
                  <div style={{
                    background: '#f8fff8',
                    border: '1px solid #e0f0e0',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '10px',
                      fontStyle: 'italic'
                    }}>
                      Generated on: {lead.batchDataProcessedAt 
                        ? formatDate(new Date(lead.batchDataProcessedAt))
                        : 'Unknown date'}
                    </div>
                    <div style={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      fontSize: '12px',
                      lineHeight: '1.4',
                      color: '#333',
                      background: 'white',
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {JSON.stringify(lead.batchDataReport, null, 2)}
                    </div>
                  </div>
                </>
              )}
              
              {/* AI Home Report Section */}
              {lead.aiHomeReport && (
                <>
                  <h4 style={{...styles.sectionTitle, fontSize: '14px', marginBottom: '10px', marginTop: '20px'}}>AI Home Enhancement Report</h4>
                  <div style={{
                    background: '#f8faff',
                    border: '1px solid #e0e8f0',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '10px',
                      fontStyle: 'italic'
                    }}>
                      Generated on: {lead.aiReportGeneratedAt 
                        ? formatDate(new Date(lead.aiReportGeneratedAt))
                        : 'Unknown date'}
                    </div>
                    <div style={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      fontSize: '12px',
                      lineHeight: '1.4',
                      color: '#333',
                      background: 'white',
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {lead.aiHomeReport}
                    </div>
                  </div>
                </>
              )}
              
              {/* Notes Section */}
              <h4 style={{...styles.sectionTitle, fontSize: '14px', marginBottom: '10px', marginTop: '20px'}}>Notes</h4>
              <div className="crm-lead-notes-container">
              
              {lead.notes && lead.notes.length > 0 ? (
                <div style={styles.activityLog}>
                  {lead.notes.map((note, index) => (
                    <div key={index} style={styles.activityItem}>
                      <div>{note.text}</div>
                      <div style={styles.timestamp}>
                        {note.userName || 'Anonymous'} - 
                        {note.timestamp?.toDate 
                          ? formatDate(note.timestamp.toDate())
                          : formatDate(note.timestamp) || 'No timestamp'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noData}>No notes have been added yet.</p>
              )}
              
              </div>
              <div style={styles.addNoteForm} className="crm-lead-add-note-form">
                <textarea
                  placeholder="Add a note..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={styles.textarea}
                  disabled={saving}
                />
                <div style={styles.buttonRow}>
                  <button
                    style={styles.button}
                    onClick={handleAddNote}
                    disabled={!note.trim() || saving}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'property' && (
            <div style={styles.section} className="crm-lead-section crm-lead-property-section">
              <h3 style={styles.sectionTitle}>Property Information</h3>
              
              {editMode ? (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Property Owner</label>
                    <select
                      name="isPropertyOwner"
                      value={formData.isPropertyOwner || ''}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      <option value="">-- Select --</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Needs Repairs</label>
                    <select
                      name="needsRepairs"
                      value={formData.needsRepairs || ''}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      <option value="">-- Select --</option>
                      <option value="Minor">Minor Repairs</option>
                      <option value="Major">Major Repairs</option>
                      <option value="None">No Repairs Needed</option>
                    </select>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Working With Agent</label>
                    <select
                      name="workingWithAgent"
                      value={formData.workingWithAgent || ''}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      <option value="">-- Select --</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Home Type</label>
                    <select
                      name="homeType"
                      value={formData.homeType || ''}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      <option value="">-- Select --</option>
                      <option value="Single Family">Single Family</option>
                      <option value="Multi Family">Multi Family</option>
                      <option value="Condo">Condo</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Mobile Home">Mobile Home</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Bedrooms</label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Bathrooms</label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Square Footage</label>
                    <input
                      type="number"
                      name="finishedSquareFootage"
                      value={formData.finishedSquareFootage || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Estimated Value</label>
                    <input
                      type="text"
                      name="apiEstimatedValue"
                      value={formData.apiEstimatedValue || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Max Home Value</label>
                    <input
                      type="text"
                      name="apiMaxHomeValue"
                      value={formData.apiMaxHomeValue || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Property Equity</label>
                    <input
                      type="text"
                      name="apiEquity"
                      value={formData.apiEquity || formData.propertyEquity || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Equity Percentage</label>
                    <input
                      type="text"
                      name="apiPercentage"
                      value={formData.apiPercentage || formData.equityPercentage || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Property Owner</div>
                    <div style={styles.value}>{lead.isPropertyOwner || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Needs Repairs</div>
                    <div style={styles.value}>{lead.needsRepairs || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Working With Agent</div>
                    <div style={styles.value}>{lead.workingWithAgent || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Home Type</div>
                    <div style={styles.value}>{lead.homeType || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Bedrooms</div>
                    <div style={styles.value}>{lead.bedrooms || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Bathrooms</div>
                    <div style={styles.value}>{lead.bathrooms || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Square Footage</div>
                    <div style={styles.value}>{lead.finishedSquareFootage || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Estimated Value</div>
                    <div style={styles.value}>
                      {lead.formattedApiEstimatedValue || (lead.apiEstimatedValue ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(lead.apiEstimatedValue) : 'N/A')}
                    </div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>API Owner Name</div>
                    <div style={styles.value}>{lead.apiOwnerName || 'N/A'}</div>
                  </div>

                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Max Home Value</div>
                    <div style={styles.value}>
                      {lead.apiMaxHomeValue ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(lead.apiMaxHomeValue) : 'N/A'}
                    </div>
                  </div>

                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Property Equity</div>
                    <div style={styles.value}>
                      {lead.apiEquity || lead.propertyEquity ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(lead.apiEquity || lead.propertyEquity) : 'N/A'}
                    </div>
                  </div>

                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Equity Percentage</div>
                    <div style={styles.value}>
                      {lead.apiPercentage || lead.equityPercentage ? `${lead.apiPercentage || lead.equityPercentage}%` : 'N/A'}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'tracking' && (
            <div style={styles.section} className="crm-lead-section crm-lead-marketing-section">
              <h3 style={styles.sectionTitle}>Marketing Data</h3>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>Traffic Source</div>
                <div style={styles.value}>{lead.traffic_source || 'N/A'}</div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>Campaign Name</div>
                <div style={styles.value}>{lead.campaign_name || 'N/A'}</div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>Campaign ID</div>
                <div style={styles.value}>{lead.campaign_id || 'N/A'}</div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>Ad Group Name</div>
                <div style={styles.value}>{lead.adgroup_name || 'N/A'}</div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>Ad Group ID</div>
                <div style={styles.value}>{lead.adgroup_id || 'N/A'}</div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>Keyword</div>
                <div style={styles.value}>{lead.keyword || 'N/A'}</div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>Match Type</div>
                <div style={styles.value}>{lead.matchtype || 'N/A'}</div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>Device</div>
                <div style={styles.value}>{lead.device || 'N/A'}</div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>GCLID</div>
                <div style={styles.value}>{lead.gclid || 'N/A'}</div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>Form Submitted</div>
                <div style={styles.value}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: lead.submittedAny ? '#4CAF50' : '#f5f5f5',
                    color: lead.submittedAny ? 'white' : '#666'
                  }}>
                    {lead.submittedAny ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>Split Test Variant</div>
                <div style={styles.value}>
                  {(() => {
                    // Extract variant from route-based fields or legacy URL/stored fields
                    const routeVariant = lead.routeVariant;
                    const routeCampaign = lead.routeCampaign;
                    const legacyVariant = lead.variant || lead.split_test || (() => {
                      if (lead.url) {
                        try {
                          const urlObj = new URL(lead.url);
                          // Check route path first
                          const pathParts = urlObj.pathname.split('/');
                          if (pathParts[1] === 'analysis' && pathParts.length >= 4) {
                            return pathParts[3].toUpperCase(); // a1o -> A1O
                          }
                          // Fallback to URL parameters
                          return urlObj.searchParams.get('variant') || urlObj.searchParams.get('split_test');
                        } catch {
                          return null;
                        }
                      }
                      return null;
                    })();
                    
                    const variant = routeVariant || legacyVariant;
                    
                    if (variant) {
                      // Route-based variant descriptions
                      const variantDescriptions = {
                        'A1O': 'A text + Original layout + Skip AI',
                        'A1I': 'A text + Original layout + Include AI', 
                        'A2O': 'A text + Streamlined layout + Skip AI',
                        'B2O': 'B text + Streamlined layout + Skip AI',
                        // Legacy descriptions for backward compatibility
                        'AAA': 'Show Box + Show Step2 + Default Step3 (Legacy)',
                        'AAB': 'Show Box + Show Step2 + Alt Step3 (Legacy)',
                        'ABA': 'Show Box + Skip Step2 + Default Step3 (Legacy)',
                        'ABB': 'Show Box + Skip Step2 + Alt Step3 (Legacy)',
                        'BAA': 'Hide Box + Show Step2 + Default Step3 (Legacy)',
                        'BAB': 'Hide Box + Show Step2 + Alt Step3 (Legacy)',
                        'BBA': 'Hide Box + Skip Step2 + Default Step3 (Legacy)',
                        'BBB': 'Hide Box + Skip Step2 + Alt Step3 (Legacy)',
                      };
                      
                      const description = variantDescriptions[variant] || 'Custom variant';
                      
                      return (
                        <div>
                          <strong style={{color: '#45bc97'}}>{variant}</strong>
                          {routeCampaign && (
                            <span style={{color: '#666', marginLeft: '8px', fontSize: '14px'}}>
                              (Campaign: {routeCampaign})
                            </span>
                          )}
                          <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
                            {description}
                          </div>
                        </div>
                      );
                    }
                    
                    return 'N/A';
                  })()}
                </div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>Template Type</div>
                <div style={styles.value}>{lead.templateType || 'N/A'}</div>
              </div>
              
              <div style={styles.fieldGroup}>
                <div style={styles.label}>Landing URL</div>
                <div style={styles.value}>{lead.url || 'N/A'}</div>
              </div>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div style={styles.section} className="crm-lead-section crm-lead-conversion-section">
              <h3 style={styles.sectionTitle}>Conversion Events</h3>
              
              {lead.conversions && lead.conversions.length > 0 ? (
                <div style={styles.activityLog}>
                  {lead.conversions.map((conversion, index) => (
                    <div key={index} style={styles.activityItem}>
                      <strong>{conversion.event}</strong>
                      {conversion.status && ` - ${conversion.status}`}
                      {conversion.value && ` (Value: $${conversion.value})`}
                      {conversion.note && <div>{conversion.note}</div>}
                      <div style={styles.timestamp}>
                        {conversion.timestamp?.toDate 
                          ? formatDate(conversion.timestamp.toDate()) 
                          : 'No timestamp'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noData}>No conversion events recorded yet.</p>
              )}
              
              <h3 style={styles.sectionTitle}>Record Conversion Event</h3>
              <div className="crm-lead-conversion-buttons">
                {conversionEvents.map(event => (
                  <button
                    key={event.id}
                    style={styles.conversionButton}
                    onClick={() => handleRecordConversion(event.id)}
                    disabled={saving}
                  >
                    {event.label}
                  </button>
                ))}
              </div>
              
              {/* BatchData Report Section */}
              {lead.batchDataReport && (
                <>
                  <h3 style={styles.sectionTitle}>BatchData Skip Trace Report</h3>
                  <div style={{
                    ...styles.section,
                    background: '#f8fff8',
                    border: '1px solid #e0f0e0',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '10px',
                      fontStyle: 'italic'
                    }}>
                      Generated on: {lead.batchDataProcessedAt 
                        ? formatDate(new Date(lead.batchDataProcessedAt))
                        : 'Unknown date'}
                    </div>
                    <div style={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: '#333',
                      background: 'white',
                      padding: '15px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {JSON.stringify(lead.batchDataReport, null, 2)}
                    </div>
                  </div>
                </>
              )}
              
              {/* AI Home Report Section */}
              {lead.aiHomeReport && (
                <>
                  <h3 style={styles.sectionTitle}>AI Home Enhancement Report</h3>
                  <div style={{
                    ...styles.section,
                    background: '#f8faff',
                    border: '1px solid #e0e8f0',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '10px',
                      fontStyle: 'italic'
                    }}>
                      Generated on: {lead.aiReportGeneratedAt 
                        ? formatDate(new Date(lead.aiReportGeneratedAt))
                        : 'Unknown date'}
                    </div>
                    <div style={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: '#333',
                      background: 'white',
                      padding: '15px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {lead.aiHomeReport}
                    </div>
                  </div>
                </>
              )}
              
              <h3 style={styles.sectionTitle}>Notes</h3>
              <div className="crm-lead-notes-container">
              
              {lead.notes && lead.notes.length > 0 ? (
                <div style={styles.activityLog}>
                  {lead.notes.map((note, index) => (
                    <div key={index} style={styles.activityItem}>
                      <div>{note.text}</div>
                      <div style={styles.timestamp}>
                        {note.userName || 'Anonymous'} - 
                        {note.timestamp?.toDate 
                          ? formatDate(note.timestamp.toDate())
                          : formatDate(note.timestamp) || 'No timestamp'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noData}>No notes have been added yet.</p>
              )}
              
              </div>
              <div style={styles.addNoteForm} className="crm-lead-add-note-form">
                <textarea
                  placeholder="Add a note..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={styles.textarea}
                  disabled={saving}
                />
                <div style={styles.buttonRow}>
                  <button
                    style={styles.button}
                    onClick={handleAddNote}
                    disabled={!note.trim() || saving}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div style={styles.sideColumn} className="crm-lead-side-column">
          <div style={styles.section} className="crm-lead-section crm-lead-info-section">
            <h3 style={styles.sectionTitle}>Lead Information</h3>
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Created</div>
              <div style={styles.value}>{formatDate(lead.createdAt)}</div>
            </div>
            
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Last Updated</div>
              <div style={styles.value}>{formatDate(lead.updatedAt)}</div>
            </div>
            
            <div style={styles.fieldGroup}>
              <div style={styles.label}>Lead ID</div>
              <div style={styles.value}>{lead.id}</div>
            </div>
          </div>
          
          <div style={styles.section} className="crm-lead-section crm-lead-actions-section">
            <h3 style={styles.sectionTitle}>Quick Actions</h3>
            {!editMode && (
              <>
                <button 
                  style={{...styles.button, width: '100%', marginBottom: '10px'}}
                  onClick={() => setEditMode(true)}
                >
                  {isAdmin ? 'Edit Lead' : 'Update Status'}
                </button>
                
                <button 
                  style={{...styles.button, width: '100%', marginBottom: '10px'}}
                  onClick={() => window.open(`tel:${lead.phone}`)}
                  disabled={!lead.phone}
                >
                  Call Lead
                </button>
                
                <button 
                  style={{...styles.button, width: '100%', marginBottom: '10px'}}
                  onClick={() => window.open(`mailto:${lead.email}`)}
                  disabled={!lead.email}
                >
                  Email Lead
                </button>
                
                {isAdmin && (
                  <button 
                    style={{
                      padding: '8px 16px',
                      background: 'white',
                      color: '#2e7b7d',
                      border: '1px solid #2e7b7d',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      width: '100%'
                    }}
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Lead'}
                  </button>
                )}
                
                {/* Delete confirmation modal */}
                {showDeleteConfirm && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                  }}>
                    <div style={{
                      backgroundColor: 'white',
                      padding: '20px',
                      borderRadius: '8px',
                      maxWidth: '400px',
                      width: '100%'
                    }}>
                      <h3 style={{marginTop: 0}}>Confirm Delete</h3>
                      <p>Are you sure you want to delete this lead? This action cannot be undone.</p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                        marginTop: '20px'
                      }}>
                        <button 
                          style={{
                            padding: '8px 16px',
                            background: '#e0e0e0',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleting}
                        >
                          Cancel
                        </button>
                        <button 
                          style={{
                            padding: '8px 16px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={async () => {
                            try {
                              setDeleting(true);
                              const success = await deleteLeadFromFirebase(leadId);
                              if (success) {
                                setShowDeleteConfirm(false);
                                onBack(); // Go back to leads list after successful deletion
                              } else {
                                setError('Failed to delete lead. Please try again.');
                                setDeleting(false);
                                setShowDeleteConfirm(false);
                              }
                            } catch (err) {
                              console.error('Error deleting lead:', err);
                              setError('An error occurred while deleting the lead.');
                              setDeleting(false);
                              setShowDeleteConfirm(false);
                            }
                          }}
                          disabled={deleting}
                        >
                          {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;