import React, { useState } from 'react';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold'
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px'
  },
  select: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px'
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  cancelButton: {
    padding: '10px 15px',
    background: '#f5f5f5',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  submitButton: {
    padding: '10px 15px',
    background: '#2e7b7d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginTop: '10px'
  }
};

const NewLeadForm = ({ onClose, onLeadCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    status: 'New',
    leadSource: 'Manual Entry',
    leadStage: 'New'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!formData.phone.trim() && !formData.email.trim()) {
      setError('Either phone or email is required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const db = getFirestore();
      const leadsCollection = collection(db, 'leads');
      const newLeadRef = doc(leadsCollection);
      
      const leadData = {
        ...formData,
        id: newLeadRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        assignedTo: null,
        conversions: []
      };
      
      await setDoc(newLeadRef, leadData);
      
      setLoading(false);
      
      // Notify parent component
      if (onLeadCreated) {
        onLeadCreated(newLeadRef.id);
      }
      
      // Close the form
      onClose();
    } catch (err) {
      console.error('Error creating lead:', err);
      setError('Failed to create lead. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add New Lead</h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Full Name"
              required
            />
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              placeholder="(555) 555-5555"
            />
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="email@example.com"
            />
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Street Address</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              style={styles.input}
              placeholder="123 Main St"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ ...styles.fieldGroup, flex: 2 }}>
              <label style={styles.label}>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                style={styles.input}
                placeholder="City"
              />
            </div>
            
            <div style={{ ...styles.fieldGroup, flex: 1 }}>
              <label style={styles.label}>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                style={styles.input}
                placeholder="State"
              />
            </div>
            
            <div style={{ ...styles.fieldGroup, flex: 1 }}>
              <label style={styles.label}>ZIP</label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                style={styles.input}
                placeholder="ZIP"
              />
            </div>
          </div>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
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
            <label style={styles.label}>Lead Source</label>
            <select
              name="leadSource"
              value={formData.leadSource}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="Manual Entry">Manual Entry</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.buttonRow}>
            <button 
              type="button" 
              style={styles.cancelButton} 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLeadForm;