import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { trackZohoConversion } from '../services/zoho';
import '../styles/main.css';

function SalesPage() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [leadData, setLeadData] = useState({
    leadId: '',
    firstName: '',
    lastName: '',
    fullName: '',
    address: '',
    phone: ''
  });
  const [transactionValue, setTransactionValue] = useState('');
  const [revenueValue, setRevenueValue] = useState('');
  const [contractSigned, setContractSigned] = useState(false);
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
  const [revenueSubmitted, setRevenueSubmitted] = useState(false);
  const [contractSubmitted, setContractSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Parse URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Extract lead data from URL parameters
    const leadId = searchParams.get('q') || '';
    const firstName = searchParams.get('fname') || '';
    const lastName = searchParams.get('lname') || '';
    const fullName = searchParams.get('name') || '';
    const address = searchParams.get('address') || '';
    const phone = searchParams.get('phone') || '';
    
    setLeadData({
      leadId,
      firstName,
      lastName,
      fullName: fullName || `${firstName} ${lastName}`,
      address,
      phone
    });
    
    // If we have a lead ID, fetch complete lead information
    if (leadId) {
      console.log("Fetching lead details for ID:", leadId);
      fetchLeadDetails(leadId);
    } else {
      setIsLoading(false);
      setError('No lead ID provided. Please ensure the URL contains a valid lead ID.');
    }
  }, [location]);

  // Format currency input
  const formatCurrency = (value) => {
    // Remove non-digit characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Convert to number and format
    if (numericValue) {
      const amount = parseInt(numericValue, 10);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    return '';
  };

  // Handle transaction value change
  const handleTransactionValueChange = (e) => {
    const formattedValue = formatCurrency(e.target.value);
    setTransactionValue(formattedValue);
  };
  
  // Handle revenue value change
  const handleRevenueValueChange = (e) => {
    const formattedValue = formatCurrency(e.target.value);
    setRevenueValue(formattedValue);
  };

  // Fetch lead details from Zoho
  const fetchLeadDetails = async (leadId) => {
    try {
      const response = await axios.post('/api/zoho', {
        action: 'getLead',
        leadId,
        debug: true
      });

      if (response.data && response.data.success && response.data.lead) {
        const lead = response.data.lead;
        
        // Create a clean copy of all important lead fields
        const cleanedLeadData = {};
        
        // Copy ALL lead properties to ensure none are lost
        for (const key in lead) {
          // Skip internal fields that start with $ or _
          if (!key.startsWith('$') && !key.startsWith('_')) {
            cleanedLeadData[key] = lead[key];
          }
        }
        
        // Explicitly preserve critical fields with special handling
        // API data fields
        cleanedLeadData.apiOwnerName = lead.apiOwnerName || lead.API_Owner_Name || "";
        cleanedLeadData.apiEstimatedValue = lead.apiEstimatedValue || lead.API_Estimated_Value || lead.apiHomeValue || lead.API_Home_Value || "";
        cleanedLeadData.apiMaxHomeValue = lead.apiMaxHomeValue || lead.API_Max_Home_Value || "";
        cleanedLeadData.apiEquity = lead.apiEquity || lead.API_Equity || "";
        cleanedLeadData.apiPercentage = lead.apiPercentage || lead.API_Percentage || "";
        
        // Address fields - use all possible variations
        cleanedLeadData.Street = lead.Street || lead.street || lead.selectedSuggestionAddress || lead.userTypedAddress || "";
        cleanedLeadData.City = lead.City || lead.city || "";
        cleanedLeadData.State = lead.State || lead.state || "";
        cleanedLeadData.Zip_Code = lead.Zip_Code || lead.zip || "";
        
        // Contact information
        cleanedLeadData.First_Name = lead.First_Name || lead.firstName || "";
        cleanedLeadData.Last_Name = lead.Last_Name || lead.lastName || "";
        cleanedLeadData.Phone = lead.Phone || lead.phone || "";
        cleanedLeadData.Email = lead.Email || lead.email || "";
        
        // Store the cleaned data for updates
        window.fullLeadData = cleanedLeadData;
        console.log("Preserved lead data for updates:", cleanedLeadData);
        
        // Check if contract is already signed - with more verbose logging
        console.log("Checking contract status:", {
          value: lead.Signed_On_As_Client,
          type: typeof lead.Signed_On_As_Client,
          asString: String(lead.Signed_On_As_Client),
          asBool: Boolean(lead.Signed_On_As_Client)
        });
        
        // More flexible check for truthy values
        if (lead.Signed_On_As_Client === 'true' || 
            lead.Signed_On_As_Client === true || 
            lead.Signed_On_As_Client === 'True' ||
            lead.Signed_On_As_Client === 'yes' ||
            lead.Signed_On_As_Client === 'Yes' ||
            lead.Signed_On_As_Client === 1 ||
            lead.Signed_On_As_Client === '1') {
          console.log("Setting contract as signed");
          setContractSigned(true);
          setContractSubmitted(true);
        }
        
        // Display transaction amount if already set
        if (lead.Transaction_Amount) {
          const formattedAmount = formatCurrency(lead.Transaction_Amount.toString());
          setTransactionValue(formattedAmount);
        }
        
        // Display revenue amount if already set
        if (lead.Revenue_Made) {
          const formattedRevenue = formatCurrency(lead.Revenue_Made.toString());
          setRevenueValue(formattedRevenue);
        }
        
        // Update lead data with fetched values
        setLeadData({
          leadId,
          firstName: lead.First_Name || '',
          lastName: lead.Last_Name || '',
          fullName: lead.Full_Name || lead.Lead_Name || `${lead.First_Name || ''} ${lead.Last_Name || ''}`,
          address: lead.Street || lead.selectedSuggestionAddress || lead.userTypedAddress || '',
          phone: lead.Phone || ''
        });
      } else {
        setError('Unable to fetch lead details. Please verify the lead ID.');
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
      setError('Error fetching lead details. Please verify the lead ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save transaction value to Zoho
  const handleSaveTransaction = async () => {
    setError('');
    setSuccess('');
    
    if (!leadData.leadId) {
      setError('No lead ID available. Cannot save transaction.');
      return;
    }
    
    if (!transactionValue) {
      setError('Please enter a transaction value.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Extract numeric value from formatted string
      const numericValue = transactionValue.replace(/[^0-9]/g, '');
      
      // Create a copy of the full lead data to preserve all fields
      const formData = { ...window.fullLeadData };
      
      // Only override the specific field we want to update
      formData.Transaction_Amount = numericValue;
      
      // Update lead in Zoho with transaction value
      await axios.post('/api/zoho', {
        action: 'update',
        leadId: leadData.leadId,
        formData: formData
      });
      
      // Track conversion event
      await trackZohoConversion(
        'successfullyClosedTransaction', 
        leadData.leadId, 
        'Closed', 
        numericValue,
        { transactionDate: new Date().toISOString().split('T')[0] }
      );
      
      setTransactionSubmitted(true);
      setSuccess('Transaction value saved successfully!');
      
      // Push transaction data to dataLayer for GTM
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'transactionSaved',
          leadId: leadData.leadId,
          transactionValue: numericValue,
          transactionDate: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      setError('Failed to save transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save Revenue made from Client to Zoho
  const handleSaveRevenue = async () => {
    setError('');
    setSuccess('');
    
    if (!leadData.leadId) {
      setError('No lead ID available. Cannot save revenue.');
      return;
    }
    
    if (!revenueValue) {
      setError('Please enter a revenue value.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Extract numeric value from formatted string
      const numericValue = revenueValue.replace(/[^0-9]/g, '');
      
      // Create a copy of the full lead data to preserve all fields
      const formData = { ...window.fullLeadData };
      
      // Only override the specific field we want to update
      formData.Revenue_Made = numericValue;
      
      // Update lead in Zoho with revenue value
      await axios.post('/api/zoho', {
        action: 'update',
        leadId: leadData.leadId,
        formData: formData
      });
      
      // Track conversion event for revenue
      await trackZohoConversion(
        'revenueRecorded', 
        leadData.leadId, 
        'Revenue Recorded', 
        numericValue,
        { revenueDate: new Date().toISOString().split('T')[0] }
      );
      
      setRevenueSubmitted(true);
      setSuccess('Revenue value saved successfully!');
      
      // Push revenue data to dataLayer for GTM
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'revenueSaved',
          leadId: leadData.leadId,
          revenueValue: numericValue,
          revenueDate: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error saving revenue:', error);
      setError('Failed to save revenue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save contract signed status to Zoho
  const handleContractSigned = async () => {
    setError('');
    
    if (!leadData.leadId) {
      setError('No lead ID available. Cannot update contract status.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a copy of the full lead data to preserve all fields
      const formData = { ...window.fullLeadData };
      
      // Only override the specific fields we want to update
      // Try multiple formats to ensure compatibility with Zoho
      formData.Signed_On_As_Client = true; // Boolean value
      formData.Signed_On_As_Client_text = 'true'; // String value as backup
      formData.Status = 'Contract agreement signed';
      
      // Update lead in Zoho with contract signed status
      await axios.post('/api/zoho', {
        action: 'update',
        leadId: leadData.leadId,
        formData: formData
      });
      
      // Track contract signed conversion event
      await trackZohoConversion(
        'successfulClientAgreement', 
        leadData.leadId, 
        'Contract agreement signed'  // Updated status name to match
      );
      
      setContractSubmitted(true);
      setSuccess(prevSuccess => 
        prevSuccess ? `${prevSuccess} Contract status updated!` : 'Contract status updated successfully!'
      );
      
      // Push contract signed event to dataLayer for GTM
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'contractSigned',
          leadId: leadData.leadId,
          contractDate: new Date().toISOString().split('T')[0],
          leadStatus: 'Contract agreement signed'
        });
      }
    } catch (error) {
      console.error('Error updating contract status:', error);
      setError('Failed to update contract status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div style={{ 
        maxWidth: '1000px', 
        width: '90%',
        margin: '0 auto',
        padding: '30px',
        borderRadius: '8px',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginTop: '50px',
        marginBottom: '50px'
      }}>
        <h2 className="form-title" style={{ fontSize: '2.5rem', color: '#3490d1', marginBottom: '30px' }}>Sales Dashboard</h2>
        
        {isLoading ? (
          <div className="loading-indicator">Loading lead information...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {/* Lead Information Display */}
            <div className="qualifying-section" style={{ marginBottom: '30px' }}>
              <h3 className="qualifying-headline">Lead Information</h3>
              <div style={{ 
                backgroundColor: '#f6f9fc', 
                padding: '20px', 
                borderRadius: '8px', 
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                margin: '20px 0'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ textAlign: 'left', padding: '8px', fontSize: '1.2rem' }}>
                    <strong style={{ color: '#3490d1' }}>Lead ID:</strong> {leadData.leadId}
                  </div>
                  <div style={{ textAlign: 'left', padding: '8px', fontSize: '1.2rem' }}>
                    <strong style={{ color: '#3490d1' }}>Name:</strong> {leadData.fullName || `${leadData.firstName} ${leadData.lastName}`}
                  </div>
                  <div style={{ textAlign: 'left', padding: '8px', fontSize: '1.2rem' }}>
                    <strong style={{ color: '#3490d1' }}>Phone:</strong> {leadData.phone}
                  </div>
                  <div style={{ textAlign: 'left', padding: '8px', fontSize: '1.2rem' }}>
                    <strong style={{ color: '#3490d1' }}>Address:</strong> {leadData.address}
                  </div>
                </div>
              </div>
            </div>
            
            {/* All Forms in a more compact layout */}
            <div style={{ marginBottom: '20px' }}>
              {/* Transaction Value Form */}
              <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f7f9fc', borderRadius: '8px' }}>
                <h3 className="qualifying-headline" style={{ marginBottom: '10px' }}>Transaction Details</h3>
                <div className="qualifying-form-container">
                  <div className="qualifying-option-column">
                    <label htmlFor="transactionValue" className="qualifying-question">Transaction Amount:</label>
                    <input
                      type="text"
                      id="transactionValue"
                      className="qualifying-text-input"
                      value={transactionValue}
                      onChange={handleTransactionValueChange}
                      placeholder="Enter amount (e.g. $250,000)"
                      disabled={transactionSubmitted}
                    />
                  </div>
                  
                  <button 
                    onClick={handleSaveTransaction}
                    className="qualifying-button"
                    style={{ marginTop: '10px' }}
                    disabled={isLoading || transactionSubmitted || !transactionValue}
                  >
                    {isLoading ? 'Saving...' : 'Save Transaction Value'}
                  </button>
                  
                  {transactionSubmitted && (
                    <div className="success-message" style={{ marginTop: '10px' }}>Transaction value saved!</div>
                  )}
                </div>
              </div>
              
              {/* Revenue Value Form */}
              <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f7f9fc', borderRadius: '8px' }}>
                <h3 className="qualifying-headline" style={{ marginBottom: '10px' }}>Revenue Details</h3>
                <div className="qualifying-form-container">
                  <div className="qualifying-option-column">
                    <label htmlFor="revenueValue" className="qualifying-question">Revenue made from Client:</label>
                    <input
                      type="text"
                      id="revenueValue"
                      className="qualifying-text-input"
                      value={revenueValue}
                      onChange={handleRevenueValueChange}
                      placeholder="Enter amount (e.g. $25,000)"
                      disabled={revenueSubmitted}
                    />
                  </div>
                  
                  <button 
                    onClick={handleSaveRevenue}
                    className="qualifying-button"
                    style={{ marginTop: '10px' }}
                    disabled={isLoading || revenueSubmitted || !revenueValue}
                  >
                    {isLoading ? 'Saving...' : 'Save Revenue Value'}
                  </button>
                  
                  {revenueSubmitted && (
                    <div className="success-message" style={{ marginTop: '10px' }}>Revenue value saved!</div>
                  )}
                </div>
              </div>
              
              {/* Contract Signed Checkbox */}
              <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f7f9fc', borderRadius: '8px' }}>
                <h3 className="qualifying-headline" style={{ marginBottom: '10px' }}>Contract Status</h3>
                <div className="qualifying-form-container">
                  <div className="qualifying-option-column">
                    <div className="form-check" style={{ margin: '5px 0' }}>
                      <input
                        type="checkbox"
                        id="contractSigned"
                        className="form-check-input"
                        checked={contractSigned}
                        onChange={(e) => setContractSigned(e.target.checked)}
                        disabled={contractSubmitted}
                        style={{ width: '25px', height: '25px' }}
                      />
                      <label className="qualifying-question" htmlFor="contractSigned" style={{ marginLeft: '10px' }}>
                        New client contract agreement signed
                      </label>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleContractSigned}
                    className="qualifying-button"
                    style={{ marginTop: '10px' }}
                    disabled={isLoading || contractSubmitted || !contractSigned}
                  >
                    {isLoading ? 'Updating...' : 'Update Contract Status'}
                  </button>
                  
                  {contractSubmitted && (
                    <div className="success-message" style={{ marginTop: '10px' }}>Contract status updated!</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Success/Error Messages */}
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export default SalesPage;