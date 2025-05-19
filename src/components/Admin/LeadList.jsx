import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter 
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
  },
  searchContainer: {
    display: 'flex',
    gap: '10px',
  },
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    width: '300px',
  },
  filterContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
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
    background: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  secondaryButton: {
    padding: '8px 16px',
    background: 'white',
    color: '#4285F4',
    border: '1px solid #4285F4',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginLeft: '10px',
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
    background: '#4285F4',
    color: 'white',
    border: '1px solid #4285F4',
  },
  noResults: {
    textAlign: 'center',
    padding: '30px',
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

const LeadList = ({ onSelectLead }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [lastVisible, setLastVisible] = useState(null);
  const [pageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, sortBy, sortDirection, currentPage]);

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
        const countQuery = statusFilter !== 'All' 
          ? query(leadsRef, where('status', '==', statusFilter))
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

  const filteredLeads = leads.filter(lead => {
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Lead Management</h2>
        <button style={styles.button}>+ Add New Lead</button>
      </div>
      
      <div style={styles.controls}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name, email, phone, or address..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            style={styles.searchInput}
          />
          <button style={styles.button} onClick={handleSearch}>
            Search
          </button>
        </div>
        
        <div style={styles.filterContainer}>
          <span>Status:</span>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Appointment">Appointment</option>
            <option value="Offer">Offer</option>
            <option value="Contract">Contract</option>
            <option value="Closed">Closed</option>
            <option value="Dead">Dead</option>
          </select>
          
          <span>Sort by:</span>
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
        <p>Loading leads...</p>
      ) : error ? (
        <p>{error}</p>
      ) : filteredLeads.length === 0 ? (
        <div style={styles.noResults}>
          <p>No leads found matching your criteria.</p>
        </div>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Address</th>
                <th style={styles.tableHeader}>Phone</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Created</th>
                <th style={styles.tableHeader}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr 
                  key={lead.id} 
                  style={{
                    ...styles.tableRow,
                    ...(hoveredRow === lead.id ? styles.tableRowHover : {})
                  }}
                  onClick={() => onSelectLead && onSelectLead(lead.id)}
                  onMouseEnter={() => setHoveredRow(lead.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={styles.tableCell}>{lead.name || 'N/A'}</td>
                  <td style={styles.tableCell}>
                    {lead.street ? `${lead.street}, ${lead.city || ''}, ${lead.state || ''} ${lead.zip || ''}` : 'N/A'}
                  </td>
                  <td style={styles.tableCell}>{lead.phone || 'N/A'}</td>
                  <td style={styles.tableCell}>{lead.email || 'N/A'}</td>
                  <td style={styles.tableCell}>
                    {renderStatusBadge(lead.status || 'New')}
                  </td>
                  <td style={styles.tableCell}>{formatDate(lead.createdAt)}</td>
                  <td style={styles.tableCell}>{formatDate(lead.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={styles.pagination}>
            <div style={styles.pageInfo}>
              Showing {filteredLeads.length} of {totalLeads} leads
              {statusFilter !== 'All' ? ` with status "${statusFilter}"` : ''}
            </div>
            <div style={styles.pageButtons}>
              <button 
                style={{
                  ...styles.pageButton,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>Page {currentPage}</span>
              <button 
                style={{
                  ...styles.pageButton,
                  opacity: filteredLeads.length < pageSize ? 0.5 : 1,
                  cursor: filteredLeads.length < pageSize ? 'not-allowed' : 'pointer'
                }}
                onClick={handleNextPage}
                disabled={filteredLeads.length < pageSize}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeadList;