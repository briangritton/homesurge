import React, { useEffect, useState } from 'react';
import { useFormContext } from '../../contexts/FormContext';

const DebugDisplay = () => {
  const { formData } = useFormContext();
  const [urlParams, setUrlParams] = useState({});
  const [localStorageData, setLocalStorageData] = useState({});
  const [zohoData, setZohoData] = useState(null);
  
  // Extract and display URL parameters
  useEffect(() => {
    // Re-check URL parameters periodically
    const updateParams = () => {
      const search = window.location.search;
      const params = new URLSearchParams(search);
      const paramObject = {};
      
      // Convert URLSearchParams to a plain object
      for (const [key, value] of params.entries()) {
        // Special handling for campaign_name to ensure it's decoded
        if (key === 'campaign_name' || key === 'campaignname') {
          paramObject[key] = decodeURIComponent(value);
        } else {
          paramObject[key] = value;
        }
      }
      
      setUrlParams(paramObject);
      
      // Check localStorage and sessionStorage
      try {
        const campaignData = localStorage.getItem('campaignData');
        const parsedCampaignData = campaignData ? JSON.parse(campaignData) : null;
        
        setLocalStorageData({
          campaignData: parsedCampaignData,
          formDataStored: localStorage.getItem('formData') ? true : false,
          leadId: localStorage.getItem('leadId') || 'Not set'
        });

        // Get Zoho data from sessionStorage
        const zohoDataSent = sessionStorage.getItem('zohoDataSent');
        if (zohoDataSent) {
          setZohoData(JSON.parse(zohoDataSent));
        }
      } catch (e) {
        console.error("Error parsing localStorage/sessionStorage data:", e);
      }
    };
    
    // Initial update
    updateParams();
    
    // Set up periodic refresh
    const interval = setInterval(updateParams, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const debugStyles = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    padding: '10px',
    borderRadius: '5px',
    maxWidth: '450px',
    maxHeight: '500px',
    overflow: 'auto',
    zIndex: 9999,
    fontSize: '12px',
    fontFamily: 'monospace',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
  };
  
  const sectionStyles = {
    marginBottom: '10px',
    borderBottom: '1px solid #555',
    paddingBottom: '5px'
  };
  
  const tabStyles = {
    padding: '5px 10px',
    margin: '0 5px 5px 0',
    display: 'inline-block',
    cursor: 'pointer',
    borderRadius: '3px 3px 0 0',
    fontSize: '11px',
    backgroundColor: '#333'
  };
  
  // Helper to determine if campaign data is present
  const hasCampaignData = formData.campaignId && formData.campaignId !== '';
  const hasZohoData = zohoData !== null;
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('url');
  
  return (
    <div style={debugStyles}>
      <div style={{ marginBottom: '10px' }}>
        <div 
          style={{ ...tabStyles, backgroundColor: activeTab === 'url' ? '#4caf50' : '#333' }}
          onClick={() => setActiveTab('url')}
        >
          URL Params
        </div>
        <div 
          style={{ ...tabStyles, backgroundColor: activeTab === 'campaign' ? '#4caf50' : '#333' }}
          onClick={() => setActiveTab('campaign')}
        >
          Campaign
        </div>
        <div 
          style={{ ...tabStyles, backgroundColor: activeTab === 'content' ? '#4caf50' : '#333' }}
          onClick={() => setActiveTab('content')}
        >
          Dynamic Content
        </div>
        <div 
          style={{ ...tabStyles, backgroundColor: activeTab === 'storage' ? '#4caf50' : '#333' }}
          onClick={() => setActiveTab('storage')}
        >
          Storage
        </div>
        <div 
          style={{ ...tabStyles, backgroundColor: activeTab === 'zoho' ? '#4caf50' : '#333' }}
          onClick={() => setActiveTab('zoho')}
        >
          Zoho
        </div>
      </div>
      
      {activeTab === 'url' && (
        <div style={sectionStyles}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>URL Parameters</h3>
          <pre>{Object.keys(urlParams).length > 0 ? JSON.stringify(urlParams, null, 2) : 'No URL parameters'}</pre>
        </div>
      )}
      
      {activeTab === 'campaign' && (
        <div style={sectionStyles}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: hasCampaignData ? '#4caf50' : '#f44336' }}>
            Campaign Data (FormContext)
          </h3>
          <pre>
            {JSON.stringify({
              campaignId: formData.campaignId || 'Not set',
              campaignName: formData.campaignName || 'Not set',
              adgroupId: formData.adgroupId || 'Not set',
              adgroupName: formData.adgroupName || 'Not set',
              keyword: formData.keyword || 'Not set',
              trafficSource: formData.trafficSource || 'Direct',
              device: formData.device || 'Not set',
              gclid: formData.gclid || 'Not set'
            }, null, 2)}
          </pre>
        </div>
      )}
      
      {activeTab === 'content' && (
        <div style={sectionStyles}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#4caf50' }}>
            Dynamic Content - Template Type: {formData.templateType || 'Not set'}
          </h3>
          <div style={{ fontSize: '11px', marginBottom: '3px', color: '#ffeb3b' }}>
            Campaign Name: "{formData.campaignName || 'Not set'}"
          </div>
          <div style={{ fontSize: '11px', marginBottom: '3px', color: '#ffeb3b' }}>
            Keywords: {formData.campaignName && formData.campaignName.toLowerCase().includes('cash') ? '✓ has "cash"' : '✗ no "cash"'} | 
            {formData.campaignName && formData.campaignName.toLowerCase().includes('fast') ? ' ✓ has "fast"' : ' ✗ no "fast"'} | 
            {formData.campaignName && formData.campaignName.toLowerCase().includes('value') ? ' ✓ has "value"' : ' ✗ no "value"'}
          </div>
          <pre>
            {JSON.stringify({
              dynamicHeadline: formData.dynamicHeadline || 'Not set',
              dynamicSubHeadline: formData.dynamicSubHeadline || 'Not set',
              buttonText: formData.buttonText || 'Not set',
              thankYouHeadline: formData.thankYouHeadline || 'Not set',
              thankYouSubHeadline: formData.thankYouSubHeadline || 'Not set'
            }, null, 2)}
          </pre>
        </div>
      )}
      
      {activeTab === 'storage' && (
        <>
          <div style={sectionStyles}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>localStorage Campaign Data</h3>
            <pre>
              {localStorageData.campaignData ? 
                JSON.stringify(localStorageData.campaignData, null, 2) : 
                'Not set'}
            </pre>
          </div>
          
          <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>Other Info</h3>
            <pre>
              {JSON.stringify({
                leadId: localStorageData.leadId,
                formDataInStorage: localStorageData.formDataStored,
                currentUrl: window.location.href
              }, null, 2)}
            </pre>
          </div>
        </>
      )}
      
      {activeTab === 'zoho' && (
        <div style={sectionStyles}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: hasZohoData ? '#4caf50' : '#f44336' }}>
            Zoho Data Sent {zohoData?.timestamp ? `(${new Date(zohoData.timestamp).toLocaleTimeString()})` : ''}
          </h3>
          {hasZohoData ? (
            <>
              <div style={{ fontSize: '11px', marginBottom: '5px', color: '#ffeb3b' }}>
                Lead Data Summary
              </div>
              <pre style={{ maxHeight: '350px', overflow: 'auto' }}>
                {JSON.stringify(zohoData.leadData, null, 2)}
              </pre>
            </>
          ) : (
            <pre>No Zoho data has been sent yet</pre>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugDisplay;