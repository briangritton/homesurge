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
import NewLeadForm from './NewLeadForm';
import SalesRepsList from './SalesRepsList';

// CSS for the admin dashboard
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
  tabContainer: {
    marginBottom: '20px',
  },
  tabButton: {
    background: 'none',
    border: 'none',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginRight: '20px',
  },
  activeTab: {
    borderBottom: '2px solid #4285F4',
    fontWeight: 'bold',
    color: '#4285F4',
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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    appointmentsSet: 0,
    closedDeals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        
        // Get recent leads
        const leadsQuery = query(
          collection(db, 'leads'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const leadsSnapshot = await getDocs(leadsQuery);
        const leadsList = leadsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert timestamps to dates for display
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
        }));
        
        setLeads(leadsList);
        
        // Get stats
        const allLeadsQuery = query(collection(db, 'leads'));
        const allLeadsSnapshot = await getDocs(allLeadsQuery);
        
        const newLeadsQuery = query(
          collection(db, 'leads'),
          where('status', '==', 'New')
        );
        const newLeadsSnapshot = await getDocs(newLeadsQuery);
        
        const appointmentsQuery = query(
          collection(db, 'leads'),
          where('status', '==', 'Appointment')
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        
        const closedQuery = query(
          collection(db, 'leads'),
          where('status', '==', 'Closed')
        );
        const closedSnapshot = await getDocs(closedQuery);
        
        setStats({
          totalLeads: allLeadsSnapshot.size,
          newLeads: newLeadsSnapshot.size,
          appointmentsSet: appointmentsSnapshot.size,
          closedDeals: closedSnapshot.size,
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lead data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, []);

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

  const handleLeadCreated = (leadId) => {
    // Refresh leads data after a new lead is created
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        
        // Get recent leads
        const leadsQuery = query(
          collection(db, 'leads'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const leadsSnapshot = await getDocs(leadsQuery);
        const leadsList = leadsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert timestamps to dates for display
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
        }));
        
        setLeads(leadsList);
        
        // Update stats
        const allLeadsQuery = query(collection(db, 'leads'));
        const allLeadsSnapshot = await getDocs(allLeadsQuery);
        
        const newLeadsQuery = query(
          collection(db, 'leads'),
          where('status', '==', 'New')
        );
        const newLeadsSnapshot = await getDocs(newLeadsQuery);
        
        const appointmentsQuery = query(
          collection(db, 'leads'),
          where('status', '==', 'Appointment')
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        
        const closedQuery = query(
          collection(db, 'leads'),
          where('status', '==', 'Closed')
        );
        const closedSnapshot = await getDocs(closedQuery);
        
        setStats({
          totalLeads: allLeadsSnapshot.size,
          newLeads: newLeadsSnapshot.size,
          appointmentsSet: appointmentsSnapshot.size,
          closedDeals: closedSnapshot.size,
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lead data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchLeads();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>CRM Dashboard</h1>
        <button 
          style={styles.button}
          onClick={() => setShowNewLeadForm(true)}
        >
          + New Lead
        </button>
      </div>
      
      {showNewLeadForm && (
        <NewLeadForm 
          onClose={() => setShowNewLeadForm(false)}
          onLeadCreated={handleLeadCreated}
        />
      )}
      
      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <div style={styles.statTitle}>Total Leads</div>
          <div style={styles.statValue}>{stats.totalLeads}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statTitle}>New Leads</div>
          <div style={styles.statValue}>{stats.newLeads}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statTitle}>Appointments</div>
          <div style={styles.statValue}>{stats.appointmentsSet}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statTitle}>Closed Deals</div>
          <div style={styles.statValue}>{stats.closedDeals}</div>
        </div>
      </div>
      
      <div style={styles.tabContainer}>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'leads' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('leads')}
        >
          Leads
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'sales_reps' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('sales_reps')}
        >
          Sales Reps
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'reports' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'settings' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        activeTab === 'leads' && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Address</th>
                <th style={styles.tableHeader}>Phone</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Created</th>
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
                  <td style={styles.tableCell}>{formatDate(lead.createdAt)}</td>
                  <td style={styles.tableCell}>
                    <button 
                      style={styles.button}
                      onClick={() => {
                        // Find the parent CRMApp component's handleSelectLead function
                        // This is a bit of a workaround - ideally we'd use proper state management
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
              {leads.length === 0 && (
                <tr>
                  <td colSpan="6" style={{...styles.tableCell, textAlign: 'center'}}>
                    No leads found. Start by adding a new lead.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )
      )}
      
      {activeTab === 'sales_reps' && (
        <SalesRepsList />
      )}
      
      {activeTab === 'reports' && (
        <div>
          <p>Reports content will be implemented here.</p>
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div>
          <p>Settings content will be implemented here.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;