import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  doc 
} from 'firebase/firestore';

const styles = {
  container: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  description: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
    fontStyle: 'italic',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderBottom: '2px solid #dee2e6',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6',
  },
  tableCell: {
    padding: '12px',
    verticalAlign: 'top',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
  },
  deleteButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginLeft: '5px',
  },
  checkbox: {
    marginRight: '8px',
  },
  bulkActions: {
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  bulkDeleteButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  selectAllCheckbox: {
    marginRight: '8px',
  },
  campaignBadge: {
    display: 'inline-block',
    padding: '3px 6px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: 'bold',
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
    marginRight: '5px',
  },
  variantBadge: {
    display: 'inline-block',
    padding: '3px 6px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: 'bold',
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },
  noData: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    fontStyle: 'italic',
  },
};

const ImmediateLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchImmediateLeads();
  }, []);

  const fetchImmediateLeads = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Get leads with status 'Visitor' (immediate leads created on page landing)
      const leadsQuery = query(
        collection(db, 'leads'),
        where('status', '==', 'Visitor'),
        orderBy('createdAt', 'desc')
      );
      
      const leadsSnapshot = await getDocs(leadsQuery);
      const leadsList = leadsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to dates for display
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        visitedAt: doc.data().visitedAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }));
      
      setLeads(leadsList);
    } catch (error) {
      console.error('Error fetching immediate leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLead = (leadId) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
    setSelectAll(newSelected.size === leads.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads(new Set());
      setSelectAll(false);
    } else {
      setSelectedLeads(new Set(leads.map(lead => lead.id)));
      setSelectAll(true);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this immediate lead? This cannot be undone.')) {
      try {
        const db = getFirestore();
        await deleteDoc(doc(db, 'leads', leadId));
        
        // Remove from local state
        setLeads(leads.filter(lead => lead.id !== leadId));
        setSelectedLeads(prev => {
          const newSet = new Set(prev);
          newSet.delete(leadId);
          return newSet;
        });
        
        console.log('Lead deleted successfully:', leadId);
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) {
      alert('Please select leads to delete.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedLeads.size} selected leads? This cannot be undone.`)) {
      try {
        const db = getFirestore();
        
        // Delete all selected leads
        const deletePromises = Array.from(selectedLeads).map(leadId => 
          deleteDoc(doc(db, 'leads', leadId))
        );
        
        await Promise.all(deletePromises);
        
        // Remove from local state
        setLeads(leads.filter(lead => !selectedLeads.has(lead.id)));
        setSelectedLeads(new Set());
        setSelectAll(false);
        
        console.log(`Successfully deleted ${selectedLeads.size} leads`);
      } catch (error) {
        console.error('Error bulk deleting leads:', error);
        alert('Failed to delete some leads. Please try again.');
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const formatAddress = (lead) => {
    if (lead.street) {
      return `${lead.street}, ${lead.city || ''}, ${lead.state || ''} ${lead.zip || ''}`.trim();
    }
    if (lead.userTypedAddress) {
      return lead.userTypedAddress;
    }
    return 'No address';
  };

  if (loading) {
    return <div style={styles.loading}>Loading immediate leads...</div>;
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🚀 Immediate Leads (Visitor Status)</h3>
      <div style={styles.description}>
        These are leads created immediately when users land on the page with campaign data. 
        They have status "Visitor" until contact information is provided.
        Perfect for tracking attribution and split test performance.
      </div>
      
      {leads.length === 0 ? (
        <div style={styles.noData}>
          No immediate leads found. Leads appear here when visitors land on pages with campaign parameters.
        </div>
      ) : (
        <>
          <div style={styles.bulkActions}>
            <input
              type="checkbox"
              style={styles.selectAllCheckbox}
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <label>Select All ({leads.length})</label>
            <span>|</span>
            <span>{selectedLeads.size} selected</span>
            {selectedLeads.size > 0 && (
              <button
                style={styles.bulkDeleteButton}
                onClick={handleBulkDelete}
              >
                🗑️ Delete Selected ({selectedLeads.size})
              </button>
            )}
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Select</th>
                <th style={styles.tableHeader}>Campaign Data</th>
                <th style={styles.tableHeader}>Variant</th>
                <th style={styles.tableHeader}>Address</th>
                <th style={styles.tableHeader}>Page URL</th>
                <th style={styles.tableHeader}>Created</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={selectedLeads.has(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                    />
                  </td>
                  <td style={styles.tableCell}>
                    <div>
                      {lead.campaign_name && (
                        <div style={styles.campaignBadge}>
                          {lead.campaign_name}
                        </div>
                      )}
                      <div style={{fontSize: '11px', color: '#666', marginTop: '4px'}}>
                        {lead.keyword && <div>🔑 {lead.keyword}</div>}
                        {lead.adgroup_name && <div>📁 {lead.adgroup_name}</div>}
                        {lead.gclid && <div>🔗 {lead.gclid.substring(0, 20)}...</div>}
                      </div>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    {lead.variant && (
                      <div style={styles.variantBadge}>
                        {lead.variant}
                      </div>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    <div style={{fontSize: '13px'}}>
                      {formatAddress(lead)}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={{fontSize: '11px', color: '#666', maxWidth: '200px', wordBreak: 'break-all'}}>
                      {lead.url ? lead.url.substring(lead.url.indexOf('?')) : 'N/A'}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={{fontSize: '11px'}}>
                      {formatDate(lead.createdAt)}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDeleteLead(lead.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ImmediateLeads;