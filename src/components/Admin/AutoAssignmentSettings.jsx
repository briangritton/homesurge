import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { autoAssignAllUnassignedLeads, getSalesRepsWithLoadCount } from '../../services/assignment';

const styles = {
  container: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
  },
  switchContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  switchLabel: {
    marginLeft: '10px',
    fontSize: '14px',
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '60px',
    height: '34px',
  },
  switchInput: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  switchSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ccc',
    transition: '0.4s',
    borderRadius: '34px',
  },
  switchSliderBefore: {
    position: 'absolute',
    content: '""',
    height: '26px',
    width: '26px',
    left: '4px',
    bottom: '4px',
    backgroundColor: 'white',
    transition: '0.4s',
    borderRadius: '50%',
  },
  button: {
    padding: '8px 16px',
    background: '#2e7b7d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px',
  },
  assignButton: {
    background: '#4CAF50',
  },
  loadingButton: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  statsContainer: {
    marginTop: '20px',
    padding: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
  },
  statTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  },
  form: {
    marginTop: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    marginBottom: '5px',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  assignmentsContainer: {
    marginTop: '20px',
    maxHeight: '300px',
    overflowY: 'auto',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '10px',
  },
  assignment: {
    padding: '8px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
  },
  noAssignments: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px',
  },
  saveMessage: {
    marginTop: '10px',
    color: '#4CAF50',
    fontSize: '14px',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginTop: '10px',
  }
};

const AutoAssignmentSettings = () => {
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState(null);
  const [assignmentStats, setAssignmentStats] = useState(null);
  const [salesReps, setSalesReps] = useState([]);
  const [unassignedLeadsCount, setUnassignedLeadsCount] = useState(0);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        
        // Fetch assignment settings
        const settingsDoc = await getDoc(doc(db, 'settings', 'leadAssignment'));
        if (settingsDoc.exists()) {
          const settings = settingsDoc.data();
          setAutoAssignEnabled(settings.autoAssignEnabled || false);
        }
        
        // Fetch sales reps with load counts
        const repsWithLoad = await getSalesRepsWithLoadCount();
        setSalesReps(repsWithLoad);
        
        // Count unassigned leads
        const unassignedLeadsQuery = query(
          collection(db, 'leads'),
          where('assignedTo', '==', null)
        );
        
        const unassignedLeadsSnapshot = await getDocs(unassignedLeadsQuery);
        setUnassignedLeadsCount(unassignedLeadsSnapshot.size);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching assignment settings:', err);
        setError('Failed to load assignment settings');
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaveMessage('');
      
      const db = getFirestore();
      
      // Create or update the settings document
      const settingsRef = doc(db, 'settings', 'leadAssignment');
      const settingsSnapshot = await getDoc(settingsRef);
      
      if (settingsSnapshot.exists()) {
        await updateDoc(settingsRef, {
          autoAssignEnabled,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(settingsRef, {
          autoAssignEnabled,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      setSaveMessage('Settings saved successfully');
      setSaving(false);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
      setSaving(false);
    }
  };
  
  const handleAutoAssignAll = async () => {
    try {
      setAssigning(true);
      setError(null);
      
      const stats = await autoAssignAllUnassignedLeads();
      setAssignmentStats(stats);
      
      // Update unassigned leads count
      const db = getFirestore();
      const unassignedLeadsQuery = query(
        collection(db, 'leads'),
        where('assignedTo', '==', null)
      );
      
      const unassignedLeadsSnapshot = await getDocs(unassignedLeadsQuery);
      setUnassignedLeadsCount(unassignedLeadsSnapshot.size);
      
      // Refresh sales reps with updated load counts
      const repsWithLoad = await getSalesRepsWithLoadCount();
      setSalesReps(repsWithLoad);
      
      setAssigning(false);
    } catch (err) {
      console.error('Error running auto-assignment:', err);
      setError('Failed to auto-assign leads');
      setAssigning(false);
    }
  };
  
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading assignment settings...
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Lead Auto-Assignment</h2>
      </div>
      
      <p style={styles.subtitle}>
        Configure automatic lead assignment to distribute leads evenly among your sales team.
      </p>
      
      <div style={styles.switchContainer}>
        <label style={styles.switch}>
          <input
            type="checkbox"
            checked={autoAssignEnabled}
            onChange={() => setAutoAssignEnabled(!autoAssignEnabled)}
            style={styles.switchInput}
          />
          <span style={{
            ...styles.switchSlider,
            backgroundColor: autoAssignEnabled ? '#2e7b7d' : '#ccc',
            '&:before': {
              ...styles.switchSliderBefore,
              transform: autoAssignEnabled ? 'translateX(26px)' : 'translateX(0)'
            }
          }}></span>
        </label>
        <span style={styles.switchLabel}>
          {autoAssignEnabled ? 'Auto-assignment enabled' : 'Auto-assignment disabled'}
        </span>
      </div>
      
      <div>
        <button
          style={{
            ...styles.button,
            ...(saving ? styles.loadingButton : {})
          }}
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        
        <button
          style={{
            ...styles.button,
            ...styles.assignButton,
            ...(assigning ? styles.loadingButton : {})
          }}
          onClick={handleAutoAssignAll}
          disabled={assigning || salesReps.length === 0}
        >
          {assigning ? 'Assigning...' : `Assign All Unassigned Leads (${unassignedLeadsCount})`}
        </button>
      </div>
      
      {saveMessage && <div style={styles.saveMessage}>{saveMessage}</div>}
      {error && <div style={styles.error}>{error}</div>}
      
      <div style={styles.statsContainer}>
        <h3 style={styles.statTitle}>Sales Team Workload</h3>
        
        {salesReps.length === 0 ? (
          <div style={{ fontStyle: 'italic', color: '#666' }}>
            No active sales representatives found. Add sales reps to enable auto-assignment.
          </div>
        ) : (
          salesReps.map(rep => (
            <div key={rep.id} style={styles.statRow}>
              <span>{rep.name}</span>
              <span><strong>{rep.loadCount}</strong> leads assigned</span>
            </div>
          ))
        )}
      </div>
      
      {assignmentStats && (
        <div style={styles.statsContainer}>
          <h3 style={styles.statTitle}>Last Assignment Results</h3>
          
          <div style={styles.statRow}>
            <span>Total leads processed:</span>
            <strong>{assignmentStats.total}</strong>
          </div>
          
          <div style={styles.statRow}>
            <span>Successfully assigned:</span>
            <strong style={{ color: '#4CAF50' }}>{assignmentStats.assigned}</strong>
          </div>
          
          <div style={styles.statRow}>
            <span>Failed to assign:</span>
            <strong style={{ color: assignmentStats.failed > 0 ? '#F44336' : '#666' }}>
              {assignmentStats.failed}
            </strong>
          </div>
          
          {assignmentStats.assignments && assignmentStats.assignments.length > 0 && (
            <div style={styles.assignmentsContainer}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Assignment Details</h4>
              
              {assignmentStats.assignments.map((assignment, index) => (
                <div key={index} style={styles.assignment}>
                  Lead <strong>{assignment.leadId}</strong> assigned to <strong>{assignment.salesRepName}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoAssignmentSettings;