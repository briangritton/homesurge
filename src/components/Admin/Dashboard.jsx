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
import AutoAssignmentSettings from './AutoAssignmentSettings';
import NotificationSettings from './NotificationSettings';
import TestAssignment from './TestAssignment';
import TestPushover from './TestPushover';
import VariantAnalytics from './VariantAnalytics';
import ConversionAnalytics from './ConversionAnalytics';
import ImmediateLeads from './ImmediateLeads';

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
    borderBottom: '2px solid #2e7b7d',
    fontWeight: 'bold',
    color: '#2e7b7d',
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
    background: '#45bc97',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(69, 188, 151, 0.3)',
    transition: 'all 0.3s ease',
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
  'Unassigned': { background: '#45bc97', color: 'white' },
  'New': { background: '#45bc97', color: 'white' }, // Legacy support - treat as Unassigned
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
          where('status', '==', 'Unassigned')
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
          where('status', '==', 'Unassigned')
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
    <div style={styles.container} className="crm-dashboard-container">
      <div style={styles.header} className="crm-dashboard-header">
        <h1 style={styles.title} className="crm-dashboard-title">CRM Dashboard</h1>
        <button 
          className="crm-button"
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
      
      <div style={styles.statsContainer} className="crm-dashboard-stats-container">
        <div style={styles.statBox} className="crm-dashboard-stat-box">
          <div style={styles.statTitle} className="crm-dashboard-stat-title">Total Leads</div>
          <div style={styles.statValue} className="crm-dashboard-stat-value">{stats.totalLeads}</div>
        </div>
        <div style={styles.statBox} className="crm-dashboard-stat-box">
          <div style={styles.statTitle} className="crm-dashboard-stat-title">Unassigned Leads</div>
          <div style={styles.statValue} className="crm-dashboard-stat-value">{stats.newLeads}</div>
        </div>
        <div style={styles.statBox} className="crm-dashboard-stat-box">
          <div style={styles.statTitle} className="crm-dashboard-stat-title">Appointments</div>
          <div style={styles.statValue} className="crm-dashboard-stat-value">{stats.appointmentsSet}</div>
        </div>
        <div style={styles.statBox} className="crm-dashboard-stat-box">
          <div style={styles.statTitle} className="crm-dashboard-stat-title">Closed Deals</div>
          <div style={styles.statValue} className="crm-dashboard-stat-value">{stats.closedDeals}</div>
        </div>
      </div>
      
      <div style={styles.tabContainer} className="crm-dashboard-tab-container">
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'leads' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('leads')}
          className={`crm-dashboard-tab-button ${activeTab === 'leads' ? 'crm-dashboard-tab-active' : ''}`}
        >
          Leads
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'sales_reps' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('sales_reps')}
          className={`crm-dashboard-tab-button ${activeTab === 'sales_reps' ? 'crm-dashboard-tab-active' : ''}`}
        >
          Sales Reps
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'reports' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('reports')}
          className={`crm-dashboard-tab-button ${activeTab === 'reports' ? 'crm-dashboard-tab-active' : ''}`}
        >
          Reports
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'analytics' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('analytics')}
          className={`crm-dashboard-tab-button ${activeTab === 'analytics' ? 'crm-dashboard-tab-active' : ''}`}
        >
          Split Tests
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'immediate_leads' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('immediate_leads')}
          className={`crm-dashboard-tab-button ${activeTab === 'immediate_leads' ? 'crm-dashboard-tab-active' : ''}`}
        >
          🚀 Visitor Leads
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'settings' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('settings')}
          className={`crm-dashboard-tab-button ${activeTab === 'settings' ? 'crm-dashboard-tab-active' : ''}`}
        >
          Settings
        </button>
      </div>
      
      <div className="crm-dashboard-content">
      {loading ? (
        <p className="crm-dashboard-loading">Loading data...</p>
      ) : error ? (
        <p className="crm-dashboard-error">{error}</p>
      ) : (
        activeTab === 'leads' && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <div>
                <strong>Recent Leads</strong> (showing last 10)
              </div>
              <button
                className="crm-button"
                onClick={() => {
                  // Navigate to full Lead Management view using the global navigation function
                  if (window.navigateToLeads) {
                    window.navigateToLeads();
                  } else {
                    // Fallback for direct navigation
                    window.location.hash = 'leads';
                    window.location.reload();
                  }
                }}
              >
                View All Leads →
              </button>
            </div>
            <table style={styles.table} className="crm-dashboard-table">
              <thead className="crm-dashboard-table-head">
                <tr className="crm-dashboard-table-row">
                  <th style={styles.tableHeader} className="crm-dashboard-table-header">Name</th>
                  <th style={styles.tableHeader} className="crm-dashboard-table-header">Address</th>
                  <th style={styles.tableHeader} className="crm-dashboard-table-header">Phone</th>
                  <th style={styles.tableHeader} className="crm-dashboard-table-header">Status</th>
                  <th style={styles.tableHeader} className="crm-dashboard-table-header">Created</th>
                  <th style={styles.tableHeader} className="crm-dashboard-table-header">Actions</th>
                </tr>
              </thead>
            <tbody className="crm-dashboard-table-body">
              {leads.map(lead => (
                <tr key={lead.id} style={styles.tableRow} className="crm-dashboard-table-row">
                  <td style={styles.tableCell} className="crm-dashboard-table-cell">{lead.name || 'N/A'}</td>
                  <td style={styles.tableCell} className="crm-dashboard-table-cell">
                    {lead.street ? `${lead.street}, ${lead.city}, ${lead.state} ${lead.zip}` : 'N/A'}
                  </td>
                  <td style={styles.tableCell} className="crm-dashboard-table-cell">{lead.phone || 'N/A'}</td>
                  <td style={styles.tableCell} className="crm-dashboard-table-cell">
                    {renderStatusBadge(lead.status || 'Unassigned')}
                  </td>
                  <td style={styles.tableCell} className="crm-dashboard-table-cell">{formatDate(lead.createdAt)}</td>
                  <td style={styles.tableCell} className="crm-dashboard-table-cell">
                    <button 
                      className="crm-button"
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
          </>
        )
      )}
      
      {activeTab === 'sales_reps' && (
        <div className="crm-dashboard-sales-reps">
          <SalesRepsList />
        </div>
      )}
      
      {activeTab === 'reports' && (
        <div className="crm-dashboard-reports">
          <p className="crm-dashboard-placeholder">Reports content will be implemented here.</p>
        </div>
      )}
      
      {activeTab === 'analytics' && (
        <div className="crm-dashboard-analytics">
          <ConversionAnalytics />
          <VariantAnalytics />
        </div>
      )}
      
      {activeTab === 'immediate_leads' && (
        <div className="crm-dashboard-immediate-leads">
          <ImmediateLeads />
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div className="crm-dashboard-settings">
          <AutoAssignmentSettings />
          <NotificationSettings />
          <TestAssignment />
          <TestPushover />
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;