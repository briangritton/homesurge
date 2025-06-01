import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where 
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
  campaignSection: {
    marginBottom: '25px',
    padding: '15px',
    border: '1px solid #f0f0f0',
    borderRadius: '6px',
    backgroundColor: '#fafafa',
  },
  campaignTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#09a5c8',
  },
  variantGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
  },
  variantCard: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '12px',
  },
  variantName: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  variantStats: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px',
  },
  percentage: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#09a5c8',
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
  },
  description: {
    fontSize: '12px',
    color: '#888',
    fontStyle: 'italic',
    marginTop: '5px',
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
    width: '16.67%', // Evenly distribute 6 columns
    wordWrap: 'break-word',
    whiteSpace: 'normal',
  },
  td: {
    padding: '8px 10px',
    borderBottom: '1px solid #dee2e6',
    width: '16.67%', // Evenly distribute 6 columns
    wordWrap: 'break-word',
    whiteSpace: 'normal',
    textAlign: 'left',
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
  }
};

const VariantAnalytics = () => {
  const [variantData, setVariantData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState('all');
  
  // Date preset functions
  const getDatePresets = () => {
    const now = new Date();
    const presets = {
      'all': { start: null, end: null, label: 'All Time' },
      'last7': { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now, label: 'Last 7 Days' },
      'last30': { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now, label: 'Last 30 Days' },
      'thisMonth': { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now, label: 'This Month' },
      'lastMonth': { 
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1), 
        end: new Date(now.getFullYear(), now.getMonth(), 0), 
        label: 'Last Month' 
      }
    };
    return presets;
  };
  
  const applyDatePreset = (preset) => {
    const presets = getDatePresets();
    setDatePreset(preset);
    
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else {
      const presetData = presets[preset];
      setStartDate(presetData.start ? presetData.start.toISOString().split('T')[0] : '');
      setEndDate(presetData.end ? presetData.end.toISOString().split('T')[0] : '');
    }
  };
  
  // Filter data by date range
  const isWithinDateRange = (timestamp) => {
    if (!startDate && !endDate) return true;
    
    const date = new Date(timestamp);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate + 'T23:59:59') : null;
    
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  };

  // Route-based variant descriptions for easier understanding
  const variantDescriptions = {
    'A1O': 'A text + Original layout + Skip AI',
    'A1I': 'A text + Original layout + Include AI', 
    'A2O': 'A text + Streamlined layout + Skip AI',
    'B2O': 'B text + Streamlined layout + Skip AI'
  };

  useEffect(() => {
    const fetchVariantData = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        
        // Get all leads (which now represent both page visits and conversions)
        const leadsQuery = query(collection(db, 'leads'));
        const leadsSnapshot = await getDocs(leadsQuery);
        
        const variantStats = {};
        
        // Process leads (both page visits and conversions are now in one collection)
        leadsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const campaignName = data.campaign_name || 'Unknown';
          // Use route-based variant from Firebase, fallback to URL parsing for old leads
          const variant = data.variant || getVariantFromUrl(data.url) || getVariantFromPath(data.url) || 'Unknown';
          
          // Filter out any campaigns with "test" in the URL
          if (data.url && data.url.toLowerCase().includes('test')) {
            return; // Skip this lead entirely
          }
          
          // Also filter out campaigns with "test" in the campaign name
          if (campaignName && campaignName.toLowerCase().includes('test')) {
            return; // Skip this lead entirely
          }
          
          // Filter by date range
          if (data.createdAt && !isWithinDateRange(data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt)) {
            return; // Skip if outside date range
          }
          
          if (!variantStats[campaignName]) {
            variantStats[campaignName] = {};
          }
          
          if (!variantStats[campaignName][variant]) {
            variantStats[campaignName][variant] = {
              clicks: 0,
              count: 0,
              contactInfo: 0,
              appointed: 0
            };
          }
          
          // Every lead represents a page visit/click (since we create leads immediately)
          variantStats[campaignName][variant].clicks++;
          
          // Only count if they reached step 2 or beyond (actual form progression, not just autofill)
          if (data.formStep && data.formStep >= 2) {
            variantStats[campaignName][variant].count++;
          }
          
          // Count leads with contact info provided (require both fields AND exclude autofill-only cases)
          if (data.name && data.name !== 'Property Lead' && data.phone && 
              (data.leadStage === 'Contact Info Provided' || data.submitted === true)) {
            variantStats[campaignName][variant].contactInfo++;
          }
          
          // Count leads with appointments
          if (data.selectedAppointmentDate) {
            variantStats[campaignName][variant].appointed++;
          }
        });
        
        // Calculate conversion rates
        Object.keys(variantStats).forEach(campaign => {
          Object.keys(variantStats[campaign]).forEach(variant => {
            const stats = variantStats[campaign][variant];
            stats.addressConversionRate = stats.clicks > 0 ? 
              ((stats.count / stats.clicks) * 100).toFixed(1) : '0.0';
            stats.contactConversionRate = stats.clicks > 0 ? 
              ((stats.contactInfo / stats.clicks) * 100).toFixed(1) : '0.0';
          });
        });
        
        setVariantData(variantStats);
      } catch (err) {
        console.error('Error fetching variant data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVariantData();
  }, [startDate, endDate]); // Refetch when date range changes

  // Extract variant from URL parameters (legacy method)
  const getVariantFromUrl = (url) => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('variant') || 
             urlObj.searchParams.get('split_test') || 
             null;
    } catch {
      return null;
    }
  };

  // Extract variant from URL path (new route-based method)
  const getVariantFromPath = (url) => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Check for /analysis/{campaign}/{variant} structure
      if (pathParts[1] === 'analysis' && pathParts.length >= 4) {
        return pathParts[3].toUpperCase(); // a1o -> A1O
      }
      
      // Check for legacy /valueboost paths
      if (urlObj.pathname.includes('/valueboost/')) {
        if (urlObj.pathname.includes('/a1o')) return 'A1O';
        if (urlObj.pathname.includes('/a1i')) return 'A1I';
        if (urlObj.pathname.includes('/a2o')) return 'A2O';
        if (urlObj.pathname.includes('/b2o')) return 'B2O';
      }
      
      return null;
    } catch {
      return null;
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading variant analytics...</div>;
  }

  if (error) {
    return <div style={styles.loading}>Error loading data: {error}</div>;
  }

  // Calculate combined analytics across all campaigns
  const calculateCombinedAnalytics = () => {
    const combinedVariants = {};
    const allVariants = [
      // Route-based variants (4 combinations)
      'A1O', 'A1I', 'A2O', 'B2O'
    ];
    
    // Initialize all variants
    allVariants.forEach(variant => {
      combinedVariants[variant] = {
        clicks: 0,
        count: 0,
        contactInfo: 0,
        appointed: 0
      };
    });
    
    // Aggregate data across all campaigns
    Object.values(variantData).forEach(campaignVariants => {
      Object.entries(campaignVariants).forEach(([variant, stats]) => {
        if (combinedVariants[variant]) {
          combinedVariants[variant].clicks += stats.clicks || 0;
          combinedVariants[variant].count += stats.count || 0;
          combinedVariants[variant].contactInfo += stats.contactInfo || 0;
          combinedVariants[variant].appointed += stats.appointed || 0;
        }
      });
    });
    
    // Calculate conversion rates
    Object.keys(combinedVariants).forEach(variant => {
      const stats = combinedVariants[variant];
      stats.addressConversionRate = stats.clicks > 0 ? 
        ((stats.count / stats.clicks) * 100).toFixed(1) : '0.0';
      stats.contactConversionRate = stats.clicks > 0 ? 
        ((stats.contactInfo / stats.clicks) * 100).toFixed(1) : '0.0';
    });
    
    return combinedVariants;
  };

  const combinedAnalytics = Object.keys(variantData).length > 0 ? calculateCombinedAnalytics() : {};

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🧪 Split Test Variant Analytics</h3>
      
      {/* Date Range Controls */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap'}}>
          <strong style={{color: '#333'}}>Date Range:</strong>
          
          {/* Quick Presets */}
          {Object.entries(getDatePresets()).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyDatePreset(key)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: datePreset === key ? '#09a5c8' : 'white',
                color: datePreset === key ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {preset.label}
            </button>
          ))}
          
          {/* Custom Date Inputs */}
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <label style={{fontSize: '12px', color: '#666'}}>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset('custom');
              }}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            <label style={{fontSize: '12px', color: '#666'}}>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset('custom');
              }}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
          </div>
        </div>
      </div>
      
      {Object.keys(variantData).length === 0 ? (
        <div style={styles.loading}>No variant data found</div>
      ) : (
        <>
          {/* Combined Analytics Table */}
          <div style={styles.campaignSection}>
            <h4 style={{...styles.campaignTitle, margin: 0, marginBottom: '15px'}}>
              📊 Combined Analytics - All Campaigns
            </h4>
            
            <table style={styles.variantTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Variant</th>
                  <th style={styles.th}>Clicks</th>
                  <th style={styles.th}>Address Conversions</th>
                  <th style={styles.th}>Address Rate</th>
                  <th style={styles.th}>Contact Conversions</th>
                  <th style={styles.th}>Contact Rate</th>
                </tr>
              </thead>
              <tbody>
                {['A1O', 'A1I', 'A2O', 'B2O'].map(variant => {
                  const stats = combinedAnalytics[variant] || {
                    clicks: 0,
                    count: 0,
                    contactInfo: 0,
                    addressConversionRate: '0.0',
                    contactConversionRate: '0.0'
                  };
                  
                  const getConversionRateClass = (rate) => {
                    const numRate = parseFloat(rate);
                    if (numRate >= 15) return styles.highRate;
                    if (numRate >= 5) return styles.mediumRate;
                    if (numRate > 0) return styles.lowRate;
                    return {};
                  };
                  
                  const variantDescriptions = {
                    'A1O': 'A text + Original layout + Skip AI',
                    'A1I': 'A text + Original layout + Include AI', 
                    'A2O': 'A text + Streamlined layout + Skip AI',
                    'B2O': 'B text + Streamlined layout + Skip AI'
                  };
                  
                  return (
                    <tr key={variant} style={getConversionRateClass(stats.contactConversionRate)}>
                      <td style={styles.td}>
                        <strong>{variant}</strong>
                        <div style={{fontSize: '11px', color: '#666', marginTop: '2px'}}>
                          {variantDescriptions[variant]}
                        </div>
                      </td>
                      <td style={styles.td}>{stats.clicks}</td>
                      <td style={styles.td}>{stats.count}</td>
                      <td style={styles.td}>
                        <span style={styles.conversionRate}>{stats.addressConversionRate}%</span>
                      </td>
                      <td style={styles.td}>{stats.contactInfo}</td>
                      <td style={styles.td}>
                        <span style={styles.conversionRate}>{stats.contactConversionRate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Individual Campaign Tables */}
          {Object.entries(variantData).map(([campaign, variants]) => {
          // All possible variants for this campaign (route-based system)
          const allVariants = [
            'A1O', 'A1I', 'A2O', 'B2O'
          ];
          
          return (
            <div key={campaign} style={styles.campaignSection}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                <h4 style={{...styles.campaignTitle, margin: 0}}>
                  {campaign === 'Unknown' ? 'No Campaign' : campaign} Campaign
                </h4>
                <div style={{display: 'flex', gap: '10px'}}>
                  {campaign !== 'Unknown' && (
                    <>
                      <button
                        style={{
                          backgroundColor: 'white',
                          border: '1px solid #ffc107',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '6px 12px',
                          color: '#856404'
                        }}
                        onClick={() => {
                          if (window.confirm(`Clear all data for campaign "${campaign}"? This will reset all click and conversion counts to zero.`)) {
                            if (window.confirm(`Are you absolutely sure? This action cannot be undone.`)) {
                              // Clear the campaign data while keeping the structure
                              const newData = { ...variantData };
                              const allVariants = ['A1O', 'A1I', 'A2O', 'B2O'];
                              newData[campaign] = {};
                              allVariants.forEach(variant => {
                                newData[campaign][variant] = {
                                  clicks: 0,
                                  count: 0,
                                  contactInfo: 0,
                                  appointed: 0,
                                  addressConversionRate: '0.0',
                                  contactConversionRate: '0.0'
                                };
                              });
                              setVariantData(newData);
                            }
                          }
                        }}
                      >
                        🧹 Clear Data
                      </button>
                      <button
                        style={{
                          backgroundColor: 'white',
                          border: '1px solid #dc3545',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '6px 12px',
                          color: '#c53030'
                        }}
                        onClick={() => {
                          if (window.confirm(`Remove campaign card "${campaign}" from display?`)) {
                            if (window.confirm(`Are you absolutely sure? This will completely remove the campaign card.`)) {
                              const newData = { ...variantData };
                              delete newData[campaign];
                              setVariantData(newData);
                            }
                          }
                        }}
                      >
                        🗑️ Delete Card
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <table style={styles.variantTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Variant</th>
                    {/* <th style={styles.th}>Description</th> */}
                    <th style={styles.th}>Clicks</th>
                    <th style={styles.th}>Address Conversions</th>
                    <th style={styles.th}>Address Rate</th>
                    <th style={styles.th}>Contact Conversions</th>
                    <th style={styles.th}>Contact Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {allVariants.map(variant => {
                    const stats = variants[variant] || {
                      clicks: 0,
                      count: 0,
                      contactInfo: 0,
                      appointed: 0,
                      addressConversionRate: '0.0',
                      contactConversionRate: '0.0'
                    };
                    
                    const getConversionRateClass = (rate) => {
                      const numRate = parseFloat(rate);
                      if (numRate >= 15) return styles.highRate;
                      if (numRate >= 5) return styles.mediumRate;
                      if (numRate > 0) return styles.lowRate;
                      return {};
                    };
                    
                    return (
                      <tr key={variant} style={getConversionRateClass(stats.contactConversionRate)}>
                        <td style={styles.td}><strong>{variant}</strong></td>
                        {/* <td style={{...styles.td, fontSize: '11px', color: '#666'}}>
                          {variantDescriptions[variant] || 'Custom variant'}
                        </td> */}
                        <td style={styles.td}>{stats.clicks}</td>
                        <td style={styles.td}>{stats.count}</td>
                        <td style={styles.td}>
                          <span style={styles.conversionRate}>{stats.addressConversionRate}%</span>
                        </td>
                        <td style={styles.td}>{stats.contactInfo}</td>
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
        })}
        </>
      )}
      
      <div style={styles.description}>
        <strong>Legend:</strong> A/B = Text variant (A=Primary, B=Secondary), 
        1/2 = Layout (1=Original, 2=Streamlined), O/I = AI Processing (O=Skip, I=Include).<br/>
        <strong>Route Format:</strong> /analysis/[campaign]/[variant] - Example: /analysis/cash/a1o = Cash campaign, A text, Original layout, Skip AI
      </div>
    </div>
  );
};

export default VariantAnalytics;