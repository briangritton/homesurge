import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { trackFirebaseConversion } from '../../services/firebase';

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
    color: '#4285F4',
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
    background: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px',
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
    color: '#4285F4',
    border: '1px solid #4285F4',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px',
    marginBottom: '10px',
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
    backgroundColor: '#4285F4',
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
    borderBottom: '2px solid #4285F4',
    fontWeight: 'bold',
    color: '#4285F4',
  },
};

// Status color mapping
const statusColors = {
  'New': { background: '#BBDEFB', color: '#0D47A1' },
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
  
  useEffect(() => {
    if (leadId) {
      fetchLead(leadId);
      fetchSalesReps();
    }
  }, [leadId]);
  
  const fetchLead = async (id) => {
    try {
      setLoading(true);
      const db = getFirestore();
      const leadDoc = await getDoc(doc(db, 'leads', id));
      
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
      
      // Prepare update data
      const updateData = {
        ...formData,
        updatedAt: serverTimestamp()
      };
      
      // Remove id field (it's the document ID, not a field)
      delete updateData.id;
      
      // Remove timestamp fields (they will be handled by Firestore)
      delete updateData.createdAt;
      delete updateData.updatedAt;
      
      await updateDoc(leadRef, updateData);
      
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
    
    return (
      <span 
        style={{ 
          ...styles.statusBadge, 
          background: statusStyle.background, 
          color: statusStyle.color 
        }}
      >
        {status}
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
            {lead.name || 'Unnamed Lead'} {renderStatusBadge(lead.status || 'New')}
          </h1>
        </div>
        
        <div>
          {!editMode ? (
            <button 
              style={styles.button} 
              onClick={() => setEditMode(true)}
              disabled={saving}
            >
              {isAdmin ? 'Edit Lead' : 'Update Status'}
            </button>
          ) : (
            <>
              <button 
                style={{...styles.button, background: '#4CAF50'}} 
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                style={{...styles.button, background: '#F44336'}} 
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
      
      <div style={styles.tabs}>
        <div 
          style={{
            ...styles.tab, 
            ...(activeTab === 'details' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('details')}
        >
          Lead Details
        </div>
        <div 
          style={{
            ...styles.tab, 
            ...(activeTab === 'activity' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('activity')}
        >
          Activity History
        </div>
        <div 
          style={{
            ...styles.tab, 
            ...(activeTab === 'property' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('property')}
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
          >
            Marketing Data
          </div>
        )}
      </div>
      
      <div style={styles.content}>
        <div style={styles.mainColumn}>
          {activeTab === 'details' && (
            <div style={styles.section}>
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
                    <label style={styles.label}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Status</label>
                    <select
                      name="status"
                      value={formData.status || 'New'}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      <option value="New">New</option>
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
                </>
              ) : (
                <>
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Name</div>
                    <div style={styles.value}>{lead.name || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Phone</div>
                    <div style={styles.value}>{lead.phone || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Email</div>
                    <div style={styles.value}>{lead.email || 'N/A'}</div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>Status</div>
                    <div>{renderStatusBadge(lead.status || 'New')}</div>
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
            <div style={styles.section}>
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
          
          {activeTab === 'property' && (
            <div style={styles.section}>
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
                      {lead.formattedApiEstimatedValue || lead.apiEstimatedValue || 'N/A'}
                    </div>
                  </div>
                  
                  <div style={styles.fieldGroup}>
                    <div style={styles.label}>API Owner Name</div>
                    <div style={styles.value}>{lead.apiOwnerName || 'N/A'}</div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'tracking' && (
            <div style={styles.section}>
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
            <div style={styles.section}>
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
              <div>
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
              
              <h3 style={styles.sectionTitle}>Notes</h3>
              
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
              
              <div style={styles.addNoteForm}>
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
        
        <div style={styles.sideColumn}>
          <div style={styles.section}>
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
          
          <div style={styles.section}>
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
                    style={{...styles.dangerButton, width: '100%'}}
                    onClick={() => {
                      // In a real app, this would have a confirmation dialog
                      alert('This feature is not implemented in this demo.');
                    }}
                  >
                    Delete Lead
                  </button>
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