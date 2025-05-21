import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc,
  updateDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import UserForm from './UserForm';

const styles = {
  container: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: '#f5f5f5',
    textAlign: 'left',
    padding: '12px 15px',
    fontWeight: 'bold',
    borderBottom: '1px solid #e0e0e0',
  },
  tableRow: {
    borderBottom: '1px solid #e0e0e0',
  },
  tableCell: {
    padding: '12px 15px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  button: {
    padding: '8px 16px',
    background: '#2e7b7d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#2e7b7d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    marginRight: '10px',
  },
  userDisplay: {
    display: 'flex',
    alignItems: 'center',
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },
  emptyMessage: {
    textAlign: 'center',
    padding: '30px 20px',
    color: '#666',
    fontStyle: 'italic',
  },
};

const SalesRepsList = () => {
  const [salesReps, setSalesReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  
  useEffect(() => {
    const fetchSalesReps = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        
        // Query for sales reps - removing active filter to show all sales reps
        const salesRepsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'sales_rep')
          // Note: No orderBy to avoid index requirements
        );
        
        const snapshot = await getDocs(salesRepsQuery);
        const repsList = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Sales rep data:', doc.id, data);
          return {
            id: doc.id,
            ...data,
            // Convert timestamps to dates for display
            createdAt: data.createdAt?.toDate?.() || new Date(),
            lastLogin: data.lastLogin?.toDate?.() || null
          };
        });
        
        console.log('Processed sales reps:', repsList);
        setSalesReps(repsList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sales reps:', err);
        setError('Failed to load sales representatives. Please try again.');
        setLoading(false);
      }
    };
    
    fetchSalesReps();
  }, []);
  
  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Function to get assigned lead count (for a full implementation)
  const getLeadCount = async (repId) => {
    try {
      const db = getFirestore();
      const leadsQuery = query(
        collection(db, 'leads'),
        where('assignedTo', '==', repId)
      );
      
      const snapshot = await getDocs(leadsQuery);
      return snapshot.size;
    } catch (err) {
      console.error('Error getting lead count:', err);
      return 0;
    }
  };
  
  // Handle changing the auto-assign rule for a sales rep
  const handleRuleChange = async (repId, newRule) => {
    try {
      setLoading(true);
      const db = getFirestore();
      const userRef = doc(db, 'users', repId);
      
      // Build update object
      const updateData = {
        autoAssignRule: newRule,
        updatedAt: serverTimestamp()
      };
      
      console.log(`Updating sales rep ${repId} with rule:`, updateData);
      
      // Update the user document with the new rule
      await updateDoc(userRef, updateData);
      console.log(`Firestore update complete for rep ${repId}`);
      
      // Update the local state
      setSalesReps(prevReps => {
        const newReps = prevReps.map(rep => 
          rep.id === repId ? { ...rep, autoAssignRule: newRule } : rep
        );
        console.log('Updated local state:', newReps.find(r => r.id === repId));
        return newReps;
      });
      
      // Verify the document was updated by reading it again
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        console.log(`Verified update for ${repId}:`, updatedDoc.data());
      }
      
      // Show a temporary success message
      setError(`Assignment rule updated for sales rep to "${newRule}"`);
      setTimeout(() => setError(null), 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating assignment rule:', err);
      setError('Failed to update assignment rule. Please try again.');
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingMessage}>Loading sales representatives...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ color: 'red' }}>{error}</div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      {showAddUserForm ? (
        <UserForm onComplete={() => {
          setShowAddUserForm(false);
          // Refresh sales reps list after adding a new user
          const fetchSalesReps = async () => {
            try {
              setLoading(true);
              const db = getFirestore();
              
              // Query for sales reps - removing active filter to show all sales reps
              const salesRepsQuery = query(
                collection(db, 'users'),
                where('role', '==', 'sales_rep')
                // Note: No orderBy to avoid index requirements
              );
              
              const snapshot = await getDocs(salesRepsQuery);
              const repsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert timestamps to dates for display
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                lastLogin: doc.data().lastLogin?.toDate?.() || null
              }));
              
              setSalesReps(repsList);
              setLoading(false);
            } catch (err) {
              console.error('Error fetching sales reps:', err);
              setError('Failed to load sales representatives. Please try again.');
              setLoading(false);
            }
          };
          
          fetchSalesReps();
        }} />
      ) : (
        <>
          <div style={styles.header}>
            <h2 style={styles.title}>Sales Representatives</h2>
            <button 
              style={styles.button}
              onClick={() => setShowAddUserForm(true)}
            >
              Add Sales Rep
            </button>
          </div>
          
          {salesReps.length === 0 ? (
            <div style={styles.emptyMessage}>
              No sales representatives found. Add some to get started.
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Email</th>
                  <th style={styles.tableHeader}>Phone</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Created</th>
                  <th style={styles.tableHeader}>Last Login</th>
                  <th style={styles.tableHeader}>Auto-Assign Rule</th>
                  <th style={styles.tableHeader}>Assigned Leads</th>
                </tr>
              </thead>
              <tbody>
                {salesReps.map(rep => (
                  <tr key={rep.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.userDisplay}>
                        <div style={styles.avatar}>
                          {rep.name ? rep.name[0].toUpperCase() : 'S'}
                        </div>
                        {rep.name || 'Unnamed Rep'}
                      </div>
                    </td>
                    <td style={styles.tableCell}>{rep.email || 'N/A'}</td>
                    <td style={styles.tableCell}>
                      {(() => {
                        console.log(`Phone check for ${rep.name}:`, {
                          phoneValue: rep.phone,
                          phoneType: typeof rep.phone,
                          hasPhone: Boolean(rep.phone),
                          phoneLength: rep.phone ? rep.phone.length : 0,
                          phoneTrimmed: rep.phone ? rep.phone.trim() : null,
                          hasTrimmedPhone: rep.phone && rep.phone.trim() ? true : false
                        });
                        
                        return rep.phone && rep.phone.trim() ? (
                          <a 
                            href={`tel:${rep.phone}`} 
                            style={{ color: '#2e7b7d', textDecoration: 'none' }}
                          >
                            {rep.phone} {/* Phone: {JSON.stringify(rep.phone)} */}
                          </a>
                        ) : (
                          <span style={{ color: 'red' }}>No phone (SMS unavailable) {/* Debug: {JSON.stringify(rep.phone)} */}</span>
                        );
                      })()}
                    </td>
                    <td style={styles.tableCell}>
                      <span 
                        style={{
                          ...styles.statusBadge,
                          background: rep.active ? '#C8E6C9' : '#FFCDD2',
                          color: rep.active ? '#1B5E20' : '#B71C1C',
                        }}
                      >
                        {rep.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{formatDate(rep.createdAt)}</td>
                    <td style={styles.tableCell}>{formatDate(rep.lastLogin)}</td>
                    <td style={styles.tableCell}>
                      <select
                        style={{
                          padding: '5px 10px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          background: '#f5f5f5'
                        }}
                        value={rep.autoAssignRule || 'none'}
                        onChange={(e) => {
                          console.log(`Changing rule for ${rep.name} from ${rep.autoAssignRule || 'none'} to ${e.target.value}`);
                          handleRuleChange(rep.id, e.target.value);
                        }}
                      >
                        <option value="none">No Auto-Assign</option>
                        <option value="all">All Leads</option>
                        <option value="hasPhone">Has Phone</option>
                      </select>
                    </td>
                    <td style={styles.tableCell}>
                      {/* In a full implementation, we would fetch this count */}
                      {/* For demo purposes, let's just show a link */}
                      <a href="#" style={{ color: '#2e7b7d', textDecoration: 'none' }}>
                        View Leads
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default SalesRepsList;