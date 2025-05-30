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

  // Variant descriptions for easier understanding
  const variantDescriptions = {
    'AAA': 'Show Box + Show Step2 + Default Step3',
    'AAB': 'Show Box + Show Step2 + Alt Step3',
    'ABA': 'Show Box + Skip Step2 + Default Step3',
    'ABB': 'Show Box + Skip Step2 + Alt Step3',
    'BAA': 'Hide Box + Show Step2 + Default Step3',
    'BAB': 'Hide Box + Show Step2 + Alt Step3',
    'BBA': 'Hide Box + Skip Step2 + Default Step3',
    'BBB': 'Hide Box + Skip Step2 + Alt Step3',
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
          const variant = data.variant || getVariantFromUrl(data.url) || 'Unknown';
          
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
          variantStats[campaignName][variant].count++;
          
          // Count leads with contact info provided
          if (data.name && data.name !== 'Property Lead' && data.phone) {
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
  }, []);

  // Extract variant from URL parameters
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

  if (loading) {
    return <div style={styles.loading}>Loading variant analytics...</div>;
  }

  if (error) {
    return <div style={styles.loading}>Error loading data: {error}</div>;
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🧪 Split Test Variant Analytics</h3>
      
      {Object.keys(variantData).length === 0 ? (
        <div style={styles.loading}>No variant data found</div>
      ) : (
        Object.entries(variantData).map(([campaign, variants]) => {
          // All possible variants for this campaign
          const allVariants = ['AAA', 'AAB', 'ABA', 'ABB', 'BAA', 'BAB', 'BBA', 'BBB'];
          
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
                              const allVariants = ['AAA', 'AAB', 'ABA', 'ABB', 'BAA', 'BAB', 'BBA', 'BBB'];
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
        })
      )}
      
      <div style={styles.description}>
        <strong>Legend:</strong> Position 1 = Step 1 box (A=show, B=hide), 
        Position 2 = Step 2 interstitial (A=show, B=skip), 
        Position 3 = Step 3 variation (A=default, B=alt)
      </div>
    </div>
  );
};

export default VariantAnalytics;