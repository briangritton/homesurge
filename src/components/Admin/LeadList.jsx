import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  deleteDoc,
  doc,
  writeBatch
} from 'firebase/firestore';

// CSS for the lead list
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
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  searchContainer: {
    display: 'flex',
    gap: '10px',
    flex: '0 1 auto',
    minWidth: '0',
  },
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    flex: '1',
    minWidth: '0',
    maxWidth: '100%',
    height: '36px',
    boxSizing: 'border-box',
  },
  filterContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: '0 1 auto',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    background: 'white',
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
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  tableRowHover: {
    backgroundColor: '#f9f9f9',
  },
  tableCell: {
    padding: '12px 15px',
  },
  button: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #09a5c8 0%, #236b6d 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(0, 184, 230, 0.3)',
    transition: 'all 0.3s ease',
    height: '36px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #09a5c8 0%, #236b6d 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    marginLeft: '10px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 184, 230, 0.3)',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
  },
  pageInfo: {
    color: '#666',
    fontSize: '14px',
  },
  pageButtons: {
    display: 'flex',
    gap: '10px',
  },
  pageButton: {
    padding: '5px 10px',
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  activePageButton: {
    background: 'linear-gradient(135deg, #09a5c8 0%, #236b6d 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0, 184, 230, 0.3)',
  },
  noResults: {
    textAlign: 'center',
    padding: '30px',
    color: '#666',
  },
  bulkActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  bulkButton: {
    padding: '8px 16px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  },
  bulkButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  confirmDialog: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    zIndex: 1000,
    minWidth: '400px',
    maxWidth: '500px',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
};

// Status color mapping
const statusColors = {
  'Unassigned': { background: '#09a5c8', color: 'white' },
  'New': { background: '#09a5c8', color: 'white' }, // Legacy support - treat as Unassigned
  'Contacted': { background: '#C8E6C9', color: '#1B5E20' },
  'Qualified': { background: '#E0F2F1', color: '#00695C' },
  'Appointment': { background: '#E0F7FA', color: '#006064' },
  'Offer': { background: '#B3E5FC', color: '#01579B' },
  'Contract': { background: '#BBDEFB', color: '#0D47A1' },
  'Closed': { background: '#C5CAE9', color: '#303F9F' },
  'Dead': { background: '#FFCDD2', color: '#B71C1C' },
};

const LeadList = ({ onSelectLead }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAllPageVisits, setShowAllPageVisits] = useState(false); // Default to false - only show form submissions
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [lastVisible, setLastVisible] = useState(null);
  const [pageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, showAllPageVisits, sortBy, sortDirection, currentPage]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Build query
      let leadsRef = collection(db, 'leads');
      let constraints = [];
      
      // Apply filters
      if (statusFilter !== 'All') {
        constraints.push(where('status', '==', statusFilter));
      }
      
      // Apply form submission filter - by default only show leads with form submissions or contact info
      // This handles cases where submittedAny field might not exist on older leads
      if (!showAllPageVisits) {
        // Show leads that either have submittedAny=true OR have contact information (name or phone)
        // We'll filter this in memory since Firestore doesn't support OR across different fields easily
        // For now, let's use a simpler approach and filter in JavaScript after getting results
      }
      
      // Apply sorting
      constraints.push(orderBy(sortBy, sortDirection));
      
      // Apply pagination
      constraints.push(limit(pageSize));
      
      // Apply cursor if not on first page
      if (currentPage > 1 && lastVisible) {
        constraints.push(startAfter(lastVisible));
      } else if (currentPage > 1 && !lastVisible) {
        // If we don't have a cursor but trying to access later pages,
        // reset to page 1
        setCurrentPage(1);
        return;
      }
      
      const leadsQuery = query(leadsRef, ...constraints);
      const snapshot = await getDocs(leadsQuery);
      
      // Get total count for pagination
      if (currentPage === 1) {
        // This is a simple way to get count - but note for large collections
        // a better approach using Firestore aggregation would be needed
        let countConstraints = [];
        
        if (statusFilter !== 'All') {
          countConstraints.push(where('status', '==', statusFilter));
        }
        
        // Note: We'll filter the form submissions in JavaScript, so don't add Firestore constraint here
        // if (!showAllPageVisits) {
        //   countConstraints.push(where('submittedAny', '==', true));
        // }
        
        const countQuery = countConstraints.length > 0 
          ? query(leadsRef, ...countConstraints)
          : query(leadsRef);
        
        const countSnapshot = await getDocs(countQuery);
        setTotalLeads(countSnapshot.size);
      }
      
      // Save last document for pagination
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);
      
      // Transform data
      const leadsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to dates for display
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }));
      
      setLeads(leadsList);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads. Please try again.');
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Reset to first page when searching
    setCurrentPage(1);
    setLastVisible(null);
    fetchLeads();
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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

  const filteredLeads = leads.filter(lead => {
    // First apply the form submission filter
    if (!showAllPageVisits) {
      // Show only leads that have submitted a form OR have contact information
      const hasSubmittedForm = lead.submittedAny === true;
      const hasContactInfo = lead.name || lead.phone || lead.email;
      
      if (!hasSubmittedForm && !hasContactInfo) {
        return false; // Hide page visit leads without contact info
      }
    }
    
    // Then apply search filter
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (lead.name?.toLowerCase().includes(searchLower)) ||
      (lead.email?.toLowerCase().includes(searchLower)) ||
      (lead.phone?.includes(searchTerm)) ||
      (lead.street?.toLowerCase().includes(searchLower)) ||
      (lead.city?.toLowerCase().includes(searchLower))
    );
  });

  // Bulk selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      const allLeadIds = new Set(filteredLeads.map(lead => lead.id));
      setSelectedLeads(allLeadIds);
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectLead = (leadId, checked) => {
    const newSelection = new Set(selectedLeads);
    if (checked) {
      newSelection.add(leadId);
    } else {
      newSelection.delete(leadId);
    }
    setSelectedLeads(newSelection);
  };

  const handleBulkDelete = () => {
    if (selectedLeads.size === 0) return;
    setShowDeleteConfirm(true);
    setDeleteConfirmText('');
  };

  const confirmBulkDelete = async () => {
    const expectedText = `DELETE ${selectedLeads.size} LEADS`;
    if (deleteConfirmText !== expectedText) {
      alert(`Please type exactly: ${expectedText}`);
      return;
    }

    try {
      setDeleting(true);
      const db = getFirestore();
      
      // Delete leads in batches (Firestore limit is 500 per batch)
      const batch = writeBatch(db);
      let batchCount = 0;
      
      for (const leadId of selectedLeads) {
        batch.delete(doc(db, 'leads', leadId));
        batchCount++;
        
        // Commit batch if we reach 500 operations
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
      
      // Commit remaining operations
      if (batchCount > 0) {
        await batch.commit();
      }
      
      console.log(`Successfully deleted ${selectedLeads.size} leads`);
      
      // Clear selection and refresh leads
      setSelectedLeads(new Set());
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      
      // Refresh the leads list
      await fetchLeads();
      
      alert(`Successfully deleted ${selectedLeads.size} leads.`);
      
    } catch (error) {
      console.error('Error deleting leads:', error);
      alert('Error deleting leads: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const cancelBulkDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
  };

  const isAllSelected = filteredLeads.length > 0 && filteredLeads.every(lead => selectedLeads.has(lead.id));
  const isPartiallySelected = selectedLeads.size > 0 && !isAllSelected;

  return (
    <div style={styles.container} className="crm-lead-list-container">
      <div style={styles.header} className="crm-lead-list-header">
        <h2 style={styles.title} className="crm-lead-list-title">Lead Management</h2>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          {/* Page Visit Filter Checkbox */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', backgroundColor: '#f8f9fa'}}>
            <input
              type="checkbox"
              id="showAllPageVisits"
              checked={showAllPageVisits}
              onChange={(e) => {
                setShowAllPageVisits(e.target.checked);
                setCurrentPage(1);
                setLastVisible(null);
              }}
              style={styles.checkbox}
            />
            <label htmlFor="showAllPageVisits" style={{cursor: 'pointer', fontWeight: '500'}}>
              Show all page visit leads
            </label>
          </div>
          <button style={styles.button} className="crm-lead-list-add-button">+ Add New Lead</button>
        </div>
      </div>
      
      <div style={styles.controls} className="crm-lead-list-controls">
        <div style={styles.searchContainer} className="crm-lead-list-search-container">
          <input
            type="text"
            placeholder="Search by name, email, phone, or address..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={styles.searchInput}
            className="crm-lead-list-search-input"
          />
          <button style={styles.button} onClick={handleSearch} className="crm-lead-list-search-button">
            Search
          </button>
        </div>
        
        <div style={styles.filterContainer} className="crm-lead-list-filter-container">
          <span className="crm-lead-list-filter-label">Status:</span>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={styles.select}
            className="crm-lead-list-status-filter"
          >
            <option value="All">All Statuses</option>
            <option value="Unassigned">Unassigned</option>
            <option value="New">New (Legacy)</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Appointment">Appointment</option>
            <option value="Offer">Offer</option>
            <option value="Contract">Contract</option>
            <option value="Closed">Closed</option>
            <option value="Dead">Dead</option>
          </select>
          
          <span className="crm-lead-list-filter-label">Sort by:</span>
          <select 
            value={`${sortBy}-${sortDirection}`} 
            onChange={e => {
              const [field, direction] = e.target.value.split('-');
              setSortBy(field);
              setSortDirection(direction);
              setCurrentPage(1);
              setLastVisible(null);
            }}
            style={styles.select}
            className="crm-lead-list-sort-filter"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="updatedAt-desc">Recently Updated</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <p className="crm-lead-list-loading">Loading leads...</p>
      ) : error ? (
        <p className="crm-lead-list-error">{error}</p>
      ) : filteredLeads.length === 0 ? (
        <div style={styles.noResults} className="crm-lead-list-no-results">
          <p>No leads found matching your criteria.</p>
        </div>
      ) : (
        <>
          {/* Bulk Actions Bar */}
          <div style={styles.bulkActions}>
            <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'}}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={isAllSelected}
                ref={checkbox => {
                  if (checkbox) checkbox.indeterminate = isPartiallySelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              Select All ({filteredLeads.length} leads)
            </label>
            
            {selectedLeads.size > 0 && (
              <>
                <span style={{fontSize: '14px', color: '#666'}}>
                  {selectedLeads.size} lead{selectedLeads.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  style={{
                    ...styles.bulkButton,
                    ...(deleting ? styles.bulkButtonDisabled : {})
                  }}
                  onClick={handleBulkDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : `🗑️ Delete ${selectedLeads.size} Lead${selectedLeads.size !== 1 ? 's' : ''}`}
                </button>
              </>
            )}
          </div>

          <table style={styles.table} className="crm-lead-list-table">
            <thead className="crm-lead-list-table-head">
              <tr className="crm-lead-list-table-row">
                <th style={{...styles.tableHeader, width: '40px'}} className="crm-lead-list-table-header">
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={isAllSelected}
                    ref={checkbox => {
                      if (checkbox) checkbox.indeterminate = isPartiallySelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th style={styles.tableHeader} className="crm-lead-list-table-header">Name</th>
                <th style={styles.tableHeader} className="crm-lead-list-table-header">Address</th>
                <th style={styles.tableHeader} className="crm-lead-list-table-header">Phone</th>
                <th style={styles.tableHeader} className="crm-lead-list-table-header">Email</th>
                <th style={styles.tableHeader} className="crm-lead-list-table-header">Status</th>
                <th style={styles.tableHeader} className="crm-lead-list-table-header">Created</th>
                <th style={styles.tableHeader} className="crm-lead-list-table-header">Updated</th>
              </tr>
            </thead>
            <tbody className="crm-lead-list-table-body">
              {filteredLeads.map(lead => (
                <tr 
                  key={lead.id} 
                  style={{
                    ...styles.tableRow,
                    ...(hoveredRow === lead.id ? styles.tableRowHover : {}),
                    ...(selectedLeads.has(lead.id) ? {backgroundColor: '#e3f2fd'} : {})
                  }}
                  onMouseEnter={() => setHoveredRow(lead.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`crm-lead-list-table-row ${hoveredRow === lead.id ? 'crm-lead-list-table-row-hover' : ''}`}
                >
                  <td style={styles.tableCell} className="crm-lead-list-table-cell">
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={selectedLeads.has(lead.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectLead(lead.id, e.target.checked);
                      }}
                    />
                  </td>
                  <td 
                    style={{...styles.tableCell, cursor: 'pointer'}} 
                    className="crm-lead-list-table-cell" 
                    data-label="Name"
                    onClick={() => onSelectLead && onSelectLead(lead.id)}
                  >
                    {lead.name || 'N/A'}
                  </td>
                  <td 
                    style={{...styles.tableCell, cursor: 'pointer'}} 
                    className="crm-lead-list-table-cell" 
                    data-label="Address"
                    onClick={() => onSelectLead && onSelectLead(lead.id)}
                  >
                    {lead.street ? `${lead.street}, ${lead.city || ''}, ${lead.state || ''} ${lead.zip || ''}` : 'N/A'}
                  </td>
                  <td 
                    style={{...styles.tableCell, cursor: 'pointer'}} 
                    className="crm-lead-list-table-cell" 
                    data-label="Phone"
                    onClick={() => onSelectLead && onSelectLead(lead.id)}
                  >
                    {lead.phone || 'N/A'}
                  </td>
                  <td 
                    style={{...styles.tableCell, cursor: 'pointer'}} 
                    className="crm-lead-list-table-cell" 
                    data-label="Email"
                    onClick={() => onSelectLead && onSelectLead(lead.id)}
                  >
                    {lead.email || 'N/A'}
                  </td>
                  <td 
                    style={{...styles.tableCell, cursor: 'pointer'}} 
                    className="crm-lead-list-table-cell crm-lead-list-status-cell" 
                    data-label="Status"
                    onClick={() => onSelectLead && onSelectLead(lead.id)}
                  >
                    <div className="crm-lead-list-status-wrapper">{renderStatusBadge(lead.status || 'Unassigned')}</div>
                  </td>
                  <td 
                    style={{...styles.tableCell, cursor: 'pointer'}} 
                    className="crm-lead-list-table-cell" 
                    data-label="Created"
                    onClick={() => onSelectLead && onSelectLead(lead.id)}
                  >
                    {formatDate(lead.createdAt)}
                  </td>
                  <td 
                    style={{...styles.tableCell, cursor: 'pointer'}} 
                    className="crm-lead-list-table-cell" 
                    data-label="Updated"
                    onClick={() => onSelectLead && onSelectLead(lead.id)}
                  >
                    {formatDate(lead.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={styles.pagination} className="crm-lead-list-pagination">
            <div style={styles.pageInfo} className="crm-lead-list-page-info">
              Showing {filteredLeads.length} of {totalLeads} leads
              {statusFilter !== 'All' ? ` with status "${statusFilter}"` : ''}
              {!showAllPageVisits ? ' (form submissions only)' : ' (including page visits)'}
            </div>
            <div style={styles.pageButtons} className="crm-lead-list-page-buttons">
              <button 
                style={{
                  ...styles.pageButton,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="crm-lead-list-page-button crm-lead-list-prev-button"
              >
                Previous
              </button>
              <span style={styles.pageInfo} className="crm-lead-list-page-number">Page {currentPage}</span>
              <button 
                style={{
                  ...styles.pageButton,
                  opacity: filteredLeads.length < pageSize ? 0.5 : 1,
                  cursor: filteredLeads.length < pageSize ? 'not-allowed' : 'pointer'
                }}
                onClick={handleNextPage}
                disabled={filteredLeads.length < pageSize}
                className="crm-lead-list-page-button crm-lead-list-next-button"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <>
          <div style={styles.overlay} onClick={cancelBulkDelete} />
          <div style={styles.confirmDialog}>
            <h3 style={{color: '#dc3545', marginBottom: '15px', fontSize: '18px'}}>
              ⚠️ Confirm Bulk Delete
            </h3>
            
            <div style={{marginBottom: '20px'}}>
              <p><strong>You are about to permanently delete {selectedLeads.size} lead{selectedLeads.size !== 1 ? 's' : ''}.</strong></p>
              <p style={{color: '#666', fontSize: '14px'}}>This action cannot be undone. All lead data, history, and associated records will be permanently removed.</p>
              
              <p style={{marginTop: '15px'}}>Type <strong>"DELETE {selectedLeads.size} LEADS"</strong> to confirm:</p>
            </div>
            
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={`DELETE ${selectedLeads.size} LEADS`}
              style={{
                width: '100%',
                padding: '10px',
                margin: '10px 0',
                border: '2px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  confirmBulkDelete();
                }
              }}
            />
            
            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
              <button
                style={{
                  ...styles.bulkButton,
                  backgroundColor: '#dc3545',
                  ...(deleting ? styles.bulkButtonDisabled : {})
                }}
                onClick={confirmBulkDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              
              <button
                style={{
                  ...styles.bulkButton,
                  backgroundColor: '#6c757d'
                }}
                onClick={cancelBulkDelete}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeadList;