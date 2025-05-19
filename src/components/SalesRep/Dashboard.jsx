import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// CSS for the dashboard
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
    marginBottom: '30px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  statsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '30px',
  },
  statBox: {
    flex: '1 1 200px',
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  statTitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
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
  button: {
    padding: '8px 16px',
    background: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  noLeads: {
    textAlign: 'center',
    padding: '30px',
    color: '#666',
    fontStyle: 'italic',
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
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

const SalesRepDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    newLeads: 0,
    appointments: 0,
    closedDeals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  useEffect(() => {
    // Get current user ID
    const auth = getAuth();
    if (auth.currentUser) {
      setCurrentUserId(auth.currentUser.uid);
      console.log('Set current user ID for SalesRepDashboard:', auth.currentUser.uid);
    }
  }, []);
  
  useEffect(() => {
    if (currentUserId) {
      console.log('Fetching leads for sales rep with ID:', currentUserId);
      fetchLeads();
    }
  }, [currentUserId]);
  
  const fetchLeads = async () => {
    if (!currentUserId) {
      console.error('Cannot fetch leads: No current user ID');
      setError('User ID not available. Please log out and log in again.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const db = getFirestore();
      
      console.log('Running query for leads with assignedTo:', currentUserId);
      
      // Try to fetch leads without the orderBy first (simpler query)
      try {
        const simpleLeadsQuery = query(
          collection(db, 'leads'),
          where('assignedTo', '==', currentUserId)
        );
        
        const snapshot = await getDocs(simpleLeadsQuery);
        console.log(`Found ${snapshot.docs.length} leads assigned to this sales rep (simple query)`);
        
        const leadsList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Convert timestamps to dates for display safely
            createdAt: data.createdAt ? 
              (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : new Date()) 
              : new Date(),
            updatedAt: data.updatedAt ? 
              (typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : new Date()) 
              : new Date()
          };
        });
        
        // Log the lead data for debugging
        console.log('Lead data (first lead):', 
          leadsList.length > 0 ? {
            id: leadsList[0].id,
            name: leadsList[0].name,
            status: leadsList[0].status,
            assignedTo: leadsList[0].assignedTo,
            createdAt: leadsList[0].createdAt
          } : 'No leads found');
        
        // Sort the leads by creation date (newest first) on the client side
        leadsList.sort((a, b) => b.createdAt - a.createdAt);
        
        setLeads(leadsList);
        
        // Calculate stats
        const totalAssigned = leadsList.length;
        const newLeads = leadsList.filter(lead => lead.status === 'New').length;
        const appointments = leadsList.filter(lead => lead.status === 'Appointment').length;
        const closedDeals = leadsList.filter(lead => lead.status === 'Closed').length;
        
        setStats({
          totalAssigned,
          newLeads,
          appointments,
          closedDeals
        });
        
        setLoading(false);
      } catch (simpleQueryError) {
        // Log the error but try the original query as a fallback
        console.error('Error with simple query:', simpleQueryError);
        
        // Try the original query with orderBy as a fallback
        const fallbackLeadsQuery = query(
          collection(db, 'leads'),
          where('assignedTo', '==', currentUserId),
          orderBy('createdAt', 'desc')
        );
        
        const fallbackSnapshot = await getDocs(fallbackLeadsQuery);
        console.log(`Found ${fallbackSnapshot.docs.length} leads with fallback query`);
        
        const fallbackLeadsList = fallbackSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          };
        });
        
        setLeads(fallbackLeadsList);
        
        // Calculate stats for fallback results
        const totalAssigned = fallbackLeadsList.length;
        const newLeads = fallbackLeadsList.filter(lead => lead.status === 'New').length;
        const appointments = fallbackLeadsList.filter(lead => lead.status === 'Appointment').length;
        const closedDeals = fallbackLeadsList.filter(lead => lead.status === 'Closed').length;
        
        setStats({
          totalAssigned,
          newLeads,
          appointments,
          closedDeals
        });
        
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching leads (outer try block):', err);
      // More descriptive error for debugging
      setError(`Failed to load leads: ${err.message || 'Unknown error'}`);
      setLoading(false);
      
      // Default to empty leads list in case of error
      setLeads([]);
      setStats({
        totalAssigned: 0,
        newLeads: 0,
        appointments: 0,
        closedDeals: 0
      });
    }
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      <div style={styles.container}>
        <div style={styles.loadingMessage}>
          Loading your assigned leads...
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ 
          color: 'red', 
          padding: '20px', 
          background: '#ffeeee', 
          borderRadius: '4px',
          marginBottom: '20px' 
        }}>
          {error}
        </div>
        <button 
          style={{
            padding: '10px 20px',
            background: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          onClick={fetchLeads}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Dashboard</h1>
        <button 
          style={{
            padding: '8px 16px',
            background: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onClick={fetchLeads}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Leads'}
        </button>
      </div>
      
      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <div style={styles.statTitle}>Assigned Leads</div>
          <div style={styles.statValue}>{stats.totalAssigned}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statTitle}>New Leads</div>
          <div style={styles.statValue}>{stats.newLeads}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statTitle}>Appointments</div>
          <div style={styles.statValue}>{stats.appointments}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statTitle}>Closed Deals</div>
          <div style={styles.statValue}>{stats.closedDeals}</div>
        </div>
      </div>
      
      <h2 style={styles.sectionTitle}>My Assigned Leads</h2>
      
      {leads.length === 0 ? (
        <div style={styles.noLeads}>
          You don't have any leads assigned to you yet. Contact your administrator.
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Name</th>
              <th style={styles.tableHeader}>Address</th>
              <th style={styles.tableHeader}>Phone</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Updated</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{lead.name || 'N/A'}</td>
                <td style={styles.tableCell}>
                  {lead.street ? `${lead.street}, ${lead.city}, ${lead.state} ${lead.zip}` : 'N/A'}
                </td>
                <td style={styles.tableCell}>{lead.phone || 'N/A'}</td>
                <td style={styles.tableCell}>
                  {renderStatusBadge(lead.status || 'New')}
                </td>
                <td style={styles.tableCell}>{formatDate(lead.updatedAt)}</td>
                <td style={styles.tableCell}>
                  <button 
                    style={styles.button}
                    onClick={() => {
                      // Find parent component's handleSelectLead function
                      if (window.handleSelectLead) {
                        window.handleSelectLead(lead.id);
                      } else {
                        console.log('Lead ID for manual navigation:', lead.id);
                        alert('View lead: ' + lead.id + ' - Please implement lead detail view');
                      }
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SalesRepDashboard;