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
  const [contractSigned, setContractSigned] = useState(false);
  const [transactionSubmitted, setTransactionSubmitted] = useState(false);
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
      
      // Update lead in Zoho with transaction value
      await axios.post('/api/zoho', {
        action: 'update',
        leadId: leadData.leadId,
        formData: {
          Transaction_Amount: numericValue
        }
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

  // Save contract signed status to Zoho
  const handleContractSigned = async () => {
    setError('');
    
    if (!leadData.leadId) {
      setError('No lead ID available. Cannot update contract status.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update lead in Zoho with contract signed status
      await axios.post('/api/zoho', {
        action: 'update',
        leadId: leadData.leadId,
        formData: {
          Contract_Signed: 'true'
        }
      });
      
      // Track contract signed conversion event
      await trackZohoConversion(
        'successfulClientAgreement', 
        leadData.leadId, 
        'Agreement Signed'
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
          contractDate: new Date().toISOString().split('T')[0]
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
      <div className="form-section">
        <h2 className="form-title">Sales Portal</h2>
        
        {isLoading ? (
          <div className="loading-indicator">Loading lead information...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {/* Lead Information Display */}
            <div className="lead-info-section">
              <h3>Lead Information</h3>
              <div className="lead-info-container">
                <div className="lead-info-item">
                  <strong>Lead ID:</strong> {leadData.leadId}
                </div>
                <div className="lead-info-item">
                  <strong>Name:</strong> {leadData.fullName || `${leadData.firstName} ${leadData.lastName}`}
                </div>
                <div className="lead-info-item">
                  <strong>Phone:</strong> {leadData.phone}
                </div>
                <div className="lead-info-item">
                  <strong>Address:</strong> {leadData.address}
                </div>
              </div>
            </div>
            
            {/* Transaction Value Form */}
            <div className="transaction-section">
              <h3>Transaction Details</h3>
              <div className="form-group">
                <label htmlFor="transactionValue">Transaction Amount:</label>
                <input
                  type="text"
                  id="transactionValue"
                  className="form-control"
                  value={transactionValue}
                  onChange={handleTransactionValueChange}
                  placeholder="Enter amount (e.g. $250,000)"
                  disabled={transactionSubmitted}
                />
              </div>
              
              <button 
                onClick={handleSaveTransaction}
                className="btn btn-primary"
                disabled={isLoading || transactionSubmitted || !transactionValue}
              >
                {isLoading ? 'Saving...' : 'Save Transaction Value'}
              </button>
              
              {transactionSubmitted && (
                <div className="success-message">Transaction value saved!</div>
              )}
            </div>
            
            {/* Contract Signed Checkbox */}
            <div className="contract-section">
              <h3>Contract Status</h3>
              <div className="form-check">
                <input
                  type="checkbox"
                  id="contractSigned"
                  className="form-check-input"
                  checked={contractSigned}
                  onChange={(e) => setContractSigned(e.target.checked)}
                  disabled={contractSubmitted}
                />
                <label className="form-check-label" htmlFor="contractSigned">
                  New client contract agreement signed
                </label>
              </div>
              
              <button 
                onClick={handleContractSigned}
                className="btn btn-secondary"
                disabled={isLoading || contractSubmitted || !contractSigned}
              >
                {isLoading ? 'Updating...' : 'Update Contract Status'}
              </button>
              
              {contractSubmitted && (
                <div className="success-message">Contract status updated!</div>
              )}
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