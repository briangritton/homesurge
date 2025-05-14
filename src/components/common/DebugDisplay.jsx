import React, { useEffect, useState } from 'react';
import { useFormContext } from '../../contexts/FormContext';

const DebugDisplay = () => {
  const { formData } = useFormContext();
  const [urlParams, setUrlParams] = useState({});
  const [localStorageData, setLocalStorageData] = useState({});
  
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
      
      // Also check localStorage
      try {
        const campaignData = localStorage.getItem('campaignData');
        const parsedCampaignData = campaignData ? JSON.parse(campaignData) : null;
        
        setLocalStorageData({
          campaignData: parsedCampaignData,
          formDataStored: localStorage.getItem('formData') ? true : false,
          leadId: localStorage.getItem('leadId') || 'Not set'
        });
      } catch (e) {
        console.error("Error parsing localStorage data:", e);
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
    maxHeight: '400px',
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
  
  // Helper to determine if campaign data is present
  const hasCampaignData = formData.campaignId && formData.campaignId !== '';
  
  return (
    <div style={debugStyles}>
      <div style={sectionStyles}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>URL Parameters</h3>
        <pre>{Object.keys(urlParams).length > 0 ? JSON.stringify(urlParams, null, 2) : 'No URL parameters'}</pre>
      </div>
      
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
            trafficSource: formData.trafficSource || 'Direct'
          }, null, 2)}
        </pre>
      </div>
      
      <div style={sectionStyles}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#4caf50' }}>
          Dynamic Content - Template Type: {formData.templateType || 'Not set'}
        </h3>
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
    </div>
  );
};

export default DebugDisplay;