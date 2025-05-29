import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  deleteDoc,
  doc,
  writeBatch
} from 'firebase/firestore';

const styles = {
  container: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginBottom: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  filters: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666',
  },
  select: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  campaignGrid: {
    display: 'grid',
    gap: '20px',
  },
  campaignCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: '#fafafa',
  },
  campaignTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#09a5c8',
  },
  variantTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderBottom: '2px solid #dee2e6',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  td: {
    padding: '8px 10px',
    borderBottom: '1px solid #dee2e6',
  },
  conversionRate: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  highRate: {
    backgroundColor: '#d4edda',
  },
  mediumRate: {
    backgroundColor: '#fff3cd',
  },
  lowRate: {
    backgroundColor: '#f8d7da',
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  summaryCard: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '6px',
    textAlign: 'center',
  },
  summaryNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#09a5c8',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px',
  },
  dataManagement: {
    marginTop: '30px',
    padding: '20px',
    background: '#fff5f5',
    border: '1px solid #fed7d7',
    borderRadius: '8px',
  },
  dataManagementTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#c53030',
    marginBottom: '15px',
  },
  actionButton: {
    padding: '8px 16px',
    margin: '5px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: '#e53e3e',
    color: 'white',
  },
  warningButton: {
    backgroundColor: '#d69e2e',
    color: 'white',
  },
  confirmButton: {
    backgroundColor: '#c53030',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#718096',
    color: 'white',
  },
  confirmDialog: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 1000,
    minWidth: '400px',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  }
};

const ConversionAnalytics = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7'); // days
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Calculate date filter
      const daysAgo = parseInt(timeframe);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      
      // Get visitors (page visits/clicks) - ONLY with GCLID to filter out testing
      const visitorsQuery = query(
        collection(db, 'visitors'),
        where('visitedAt', '>=', startDate),
        where('gclid', '!=', ''), // Only include visitors with GCLID (real Google Ads traffic)
        orderBy('visitedAt', 'desc')
      );
      const visitorsSnapshot = await getDocs(visitorsQuery);
      
      // Get converted leads - ONLY with GCLID to filter out testing  
      const leadsQuery = query(
        collection(db, 'leads'),
        where('createdAt', '>=', startDate),
        where('gclid', '!=', ''), // Only include leads with GCLID (real Google Ads traffic)
        orderBy('createdAt', 'desc')
      );
      const leadsSnapshot = await getDocs(leadsQuery);
      
      // Process data
      const analytics = {};
      
      // Process visitors (clicks)
      visitorsSnapshot.docs.forEach(doc => {
        const visitor = doc.data();
        const campaign = visitor.campaign_name || 'Unknown';
        const variant = visitor.variant || 'Unknown';
        
        if (!analytics[campaign]) {
          analytics[campaign] = {};
        }
        if (!analytics[campaign][variant]) {
          analytics[campaign][variant] = {
            clicks: 0,
            conversions: 0,
            contactConversions: 0
          };
        }
        
        analytics[campaign][variant].clicks++;
      });
      
      // Process leads (conversions)
      leadsSnapshot.docs.forEach(doc => {
        const lead = doc.data();
        const campaign = lead.campaign_name || 'Unknown';
        const variant = getVariantFromUrl(lead.url) || 'Unknown';
        
        if (!analytics[campaign]) {
          analytics[campaign] = {};
        }
        if (!analytics[campaign][variant]) {
          analytics[campaign][variant] = {
            clicks: 0,
            conversions: 0,
            contactConversions: 0
          };
        }
        
        analytics[campaign][variant].conversions++;
        
        // Count contact conversions (name + phone provided)
        if (lead.name && lead.name !== 'Property Lead' && lead.phone) {
          analytics[campaign][variant].contactConversions++;
        }
      });
      
      // Calculate conversion rates
      Object.keys(analytics).forEach(campaign => {
        Object.keys(analytics[campaign]).forEach(variant => {
          const stats = analytics[campaign][variant];
          stats.conversionRate = stats.clicks > 0 ? 
            ((stats.conversions / stats.clicks) * 100).toFixed(1) : '0.0';
          stats.contactConversionRate = stats.clicks > 0 ? 
            ((stats.contactConversions / stats.clicks) * 100).toFixed(1) : '0.0';
        });
      });
      
      setData(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVariantFromUrl = (url) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('variant') || 
             urlObj.searchParams.get('split_test') || 
             'AAA';
    } catch {
      return null;
    }
  };

  const getConversionRateClass = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate >= 15) return styles.highRate;
    if (numRate >= 5) return styles.mediumRate;
    if (numRate > 0) return styles.lowRate;
    return {};
  };

  // All possible variants for split testing
  const allVariants = ['AAA', 'AAB', 'ABA', 'ABB', 'BAA', 'BAB', 'BBA', 'BBB'];
  
  // Expected campaigns - you can modify this list
  const expectedCampaigns = ['cash', 'fast', 'value'];

  const calculateTotals = () => {
    let totalClicks = 0;
    let totalConversions = 0;
    let totalContactConversions = 0;
    
    Object.values(data).forEach(campaign => {
      Object.values(campaign).forEach(variant => {
        totalClicks += variant.clicks;
        totalConversions += variant.conversions;
        totalContactConversions += variant.contactConversions;
      });
    });
    
    return {
      totalClicks,
      totalConversions,
      totalContactConversions,
      overallConversionRate: totalClicks > 0 ? 
        ((totalConversions / totalClicks) * 100).toFixed(1) : '0.0',
      contactConversionRate: totalClicks > 0 ? 
        ((totalContactConversions / totalClicks) * 100).toFixed(1) : '0.0'
    };
  };

  // Get campaigns to display - merge actual data with expected campaigns
  const getCampaignsToDisplay = () => {
    const actualCampaigns = Object.keys(data);
    const allCampaigns = [...new Set([...expectedCampaigns, ...actualCampaigns])];
    
    if (selectedCampaign === 'all') {
      return allCampaigns;
    } else {
      return allCampaigns.filter(campaign => campaign === selectedCampaign);
    }
  };

  // Get variant data for a campaign, with defaults for missing variants
  const getVariantData = (campaign) => {
    const campaignData = data[campaign] || {};
    const variantData = {};
    
    // Ensure all variants exist with default values
    allVariants.forEach(variant => {
      variantData[variant] = campaignData[variant] || {
        clicks: 0,
        conversions: 0,
        contactConversions: 0,
        conversionRate: '0.0',
        contactConversionRate: '0.0'
      };
    });
    
    return variantData;
  };

  // Clear all visitor data (not leads)
  const clearAllVisitorData = async () => {
    try {
      setActionLoading(true);
      const db = getFirestore();
      
      // Get all visitors
      const visitorsSnapshot = await getDocs(collection(db, 'visitors'));
      
      // Delete in batches
      const batch = writeBatch(db);
      let batchCount = 0;
      
      for (const docSnapshot of visitorsSnapshot.docs) {
        batch.delete(doc(db, 'visitors', docSnapshot.id));
        batchCount++;
        
        // Firestore batch limit is 500
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
      
      // Commit remaining items
      if (batchCount > 0) {
        await batch.commit();
      }
      
      console.log(`Deleted ${visitorsSnapshot.size} visitor records`);
      
      // Refresh data
      await fetchAnalyticsData();
      
      alert(`Successfully deleted ${visitorsSnapshot.size} visitor records. Leads were not affected.`);
    } catch (error) {
      console.error('Error clearing visitor data:', error);
      alert('Error clearing visitor data: ' + error.message);
    } finally {
      setActionLoading(false);
      setConfirmDialog(null);
    }
  };

  // Delete all visitor data for a specific campaign
  const deleteCampaignVisitorData = async (campaignName) => {
    try {
      setActionLoading(true);
      const db = getFirestore();
      
      // Get visitors for this campaign
      const visitorsQuery = query(
        collection(db, 'visitors'),
        where('campaign_name', '==', campaignName)
      );
      const visitorsSnapshot = await getDocs(visitorsQuery);
      
      // Delete in batches
      const batch = writeBatch(db);
      let batchCount = 0;
      
      for (const docSnapshot of visitorsSnapshot.docs) {
        batch.delete(doc(db, 'visitors', docSnapshot.id));
        batchCount++;
        
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
      
      if (batchCount > 0) {
        await batch.commit();
      }
      
      console.log(`Deleted ${visitorsSnapshot.size} visitor records for campaign: ${campaignName}`);
      
      // Refresh data
      await fetchAnalyticsData();
      
      alert(`Successfully deleted ${visitorsSnapshot.size} visitor records for campaign "${campaignName}". Leads were not affected.`);
    } catch (error) {
      console.error('Error deleting campaign visitor data:', error);
      alert('Error deleting campaign visitor data: ' + error.message);
    } finally {
      setActionLoading(false);
      setConfirmDialog(null);
    }
  };

  // Remove campaign card from display
  const deleteCampaignCard = async (campaignName) => {
    try {
      setActionLoading(true);
      
      // Remove campaign from current data to hide the card
      const newData = { ...data };
      delete newData[campaignName];
      setData(newData);
      
      alert(`Campaign card "${campaignName}" has been removed from display.`);
    } catch (error) {
      console.error('Error removing campaign card:', error);
      alert('Error removing campaign card: ' + error.message);
    } finally {
      setActionLoading(false);
      setConfirmDialog(null);
    }
  };

  // Show confirmation dialog
  const showConfirmation = (action, campaignName = null) => {
    setConfirmDialog({ action, campaignName });
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (confirmDialog.action === 'clearAll') {
      clearAllVisitorData();
    } else if (confirmDialog.action === 'deleteCampaign') {
      deleteCampaignVisitorData(confirmDialog.campaignName);
    } else if (confirmDialog.action === 'deleteCampaignCard') {
      deleteCampaignCard(confirmDialog.campaignName);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading conversion analytics...</div>;
  }

  const totals = calculateTotals();
  const campaigns = Object.keys(data).filter(campaign => 
    selectedCampaign === 'all' || campaign === selectedCampaign
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📊 Conversion Rate Analytics</h3>
      <div style={{fontSize: '12px', color: '#666', marginBottom: '15px', fontStyle: 'italic'}}>
        ⚡ Showing only traffic with GCLID (real Google Ads traffic) - excludes testing
      </div>
      
      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Timeframe:</label>
          <select 
            style={styles.select}
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.label}>Campaign:</label>
          <select 
            style={styles.select}
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            <option value="all">All Campaigns</option>
            {Object.keys(data).map(campaign => (
              <option key={campaign} value={campaign}>{campaign}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Summary */}
      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryNumber}>{totals.totalClicks}</div>
          <div style={styles.summaryLabel}>Total Clicks</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryNumber}>{totals.totalConversions}</div>
          <div style={styles.summaryLabel}>Address Submissions</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryNumber}>{totals.totalContactConversions}</div>
          <div style={styles.summaryLabel}>Contact Conversions</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryNumber}>{totals.overallConversionRate}%</div>
          <div style={styles.summaryLabel}>Overall Rate</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryNumber}>{totals.contactConversionRate}%</div>
          <div style={styles.summaryLabel}>Contact Rate</div>
        </div>
      </div>
      
      {/* Campaign Details */}
      <div style={styles.campaignGrid}>
        {campaigns.length === 0 ? (
          <div style={styles.loading}>No data found for selected timeframe</div>
        ) : (
          campaigns.map(campaign => {
            // Get variant data for this campaign, ensuring all 8 variants are shown
            const campaignData = getVariantData(campaign);
            
            return (
              <div key={campaign} style={styles.campaignCard}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                  <h4 style={{...styles.campaignTitle, margin: 0}}>
                    {campaign === 'Unknown' ? 'Direct Traffic' : campaign}
                  </h4>
                  <div style={{display: 'flex', gap: '10px'}}>
                    {campaign !== 'Unknown' && (
                      <button
                        style={{...styles.actionButton, ...styles.warningButton, fontSize: '12px', padding: '6px 12px'}}
                        onClick={() => showConfirmation('deleteCampaign', campaign)}
                        disabled={actionLoading}
                      >
                        🧹 Clear Data
                      </button>
                    )}
                    {campaign !== 'Unknown' && (
                      <button
                        style={{...styles.actionButton, ...styles.dangerButton, fontSize: '12px', padding: '6px 12px'}}
                        onClick={() => showConfirmation('deleteCampaignCard', campaign)}
                        disabled={actionLoading}
                      >
                        🗑️ Delete Card
                      </button>
                    )}
                  </div>
                </div>
                
                <table style={styles.variantTable}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Variant</th>
                      <th style={styles.th}>Clicks</th>
                      <th style={styles.th}>Address Submits</th>
                      <th style={styles.th}>Contact Info</th>
                      <th style={styles.th}>Address Rate</th>
                      <th style={styles.th}>Contact Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allVariants.map(variant => {
                      const stats = campaignData[variant];
                      return (
                        <tr key={variant} style={getConversionRateClass(stats.contactConversionRate)}>
                          <td style={styles.td}><strong>{variant}</strong></td>
                          <td style={styles.td}>{stats.clicks}</td>
                          <td style={styles.td}>{stats.conversions}</td>
                          <td style={styles.td}>{stats.contactConversions}</td>
                          <td style={styles.td}>
                            <span style={styles.conversionRate}>{stats.conversionRate}%</span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.conversionRate}>{stats.contactConversionRate}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>
      
      
      {/* Confirmation Dialog */}
      {confirmDialog && (
        <>
          <div style={styles.overlay} onClick={() => setConfirmDialog(null)} />
          <div style={styles.confirmDialog}>
            <h3 style={{color: '#c53030', marginBottom: '15px'}}>⚠️ Confirm Action</h3>
            
            {confirmDialog.action === 'deleteCampaign' ? (
              <div>
                <p><strong>You are about to delete visitor data for campaign:</strong></p>
                <p style={{fontSize: '18px', fontWeight: 'bold', color: '#c53030'}}>
                  "{confirmDialog.campaignName}"
                </p>
                <p>This will clear this campaign's analytics data but not affect actual leads.</p>
                <p>Type <strong>"DELETE {confirmDialog.campaignName?.toUpperCase()}"</strong> to confirm:</p>
              </div>
            ) : (
              <div>
                <p><strong>You are about to remove the campaign card:</strong></p>
                <p style={{fontSize: '18px', fontWeight: 'bold', color: '#c53030'}}>
                  "{confirmDialog.campaignName}"
                </p>
                <p>This will remove this campaign card from the display.</p>
                <p>Type <strong>"REMOVE {confirmDialog.campaignName?.toUpperCase()}"</strong> to confirm:</p>
              </div>
            )}
            
            <input
              type="text"
              placeholder={
                confirmDialog.action === 'deleteCampaign'
                  ? `DELETE ${confirmDialog.campaignName?.toUpperCase()}`
                  : `REMOVE ${confirmDialog.campaignName?.toUpperCase()}`
              }
              style={{
                width: '100%',
                padding: '10px',
                margin: '10px 0',
                border: '2px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const expectedText = confirmDialog.action === 'deleteCampaign'
                    ? `DELETE ${confirmDialog.campaignName?.toUpperCase()}`
                    : `REMOVE ${confirmDialog.campaignName?.toUpperCase()}`;
                  
                  if (e.target.value === expectedText) {
                    handleConfirm();
                  }
                }
              }}
            />
            
            <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
              <button
                style={{...styles.actionButton, ...styles.confirmButton}}
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="DELETE"], input[placeholder*="REMOVE"]');
                  const expectedText = confirmDialog.action === 'deleteCampaign'
                    ? `DELETE ${confirmDialog.campaignName?.toUpperCase()}`
                    : `REMOVE ${confirmDialog.campaignName?.toUpperCase()}`;
                  
                  if (input?.value === expectedText) {
                    handleConfirm();
                  } else {
                    alert('Please type the exact confirmation text.');
                  }
                }}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm Delete'}
              </button>
              
              <button
                style={{...styles.actionButton, ...styles.cancelButton}}
                onClick={() => setConfirmDialog(null)}
                disabled={actionLoading}
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

export default ConversionAnalytics;