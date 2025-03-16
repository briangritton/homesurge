import React, { useState } from 'react';
import { submitLeadToZoho, updateLeadInZoho } from '../services/zoho';
import axios from 'axios';

function ZohoTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [leadId, setLeadId] = useState('');
  const [showFullForm, setShowFullForm] = useState(false);
  const [detailedResponse, setDetailedResponse] = useState(null);
  const [formData, setFormData] = useState({
    // Basic information
    name: "Test User",
    phone: "7705551234",
    email: "test@example.com",
    street: "123 Test St, Atlanta, GA 30301",
    city: "Atlanta",
    zip: "30301",
    
    // Property details
    isPropertyOwner: 'true',
    needsRepairs: 'false', // Note: this matches Zoho's field name
    workingWithAgent: 'false',
    homeType: "Single Family",
    remainingMortgage: "200000", // Send as string to match Zoho's text field
    finishedSquareFootage: "2000", // Send as string
    basementSquareFootage: "500", // Send as string
    bedrooms: "3",
    bathrooms: "2",
    floors: "2",
    
    // Garage information - using correct field names
    garage: "Yes", // This is the field name in Zoho
    garageCars: "2",
    
    // Property condition
    hasHoa: "No", // Correct casing to match Zoho
    planningToBuy: "No",
    hasSolar: "No",
    septicOrSewer: "Sewer",
    knownIssues: "None",
    reasonForSelling: "Relocation",
    
    // Time to sell - this field is important and was missing
    howSoonSell: "ASAP",
    
    // Appointment information
    wantToSetAppointment: "Yes",
    selectedAppointmentDate: "Monday, 3/17",
    selectedAppointmentTime: "10:00 AM",
    
    // Marketing information
    trafficSource: "Test Source",
    campaignName: "Spring Promo",
    adgroupName: "High Intent",
    keyword: "sell house fast",
    device: "Mobile",
    gclid: "test_gclid_123",
    url: "https://sellforcash.online/?test=true",
    
    // Dynamic content
    dynamicHeadline: "Sell Your House Fast",
    dynamicSubHeadline: "Get a cash offer today!",
    thankYouHeadline: "Thank You!",
    thankYouSubHeadline: "We'll be in touch soon",
    
    // API data
    apiOwnerName: "John Doe",
    apiEstimatedValue: "400000",
    apiMaxHomeValue: "450000",
    apiEquity: "0",
    apiPercentage: "0",
    formattedApiEstimatedValue: "$400,000",
    
    // Metadata
    addressSelectionType: "Manual",
    qualifyingQuestionStep: "1",
    userInputtedStreet: ""
  });

  const testApiEndpoint = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setDetailedResponse(null);

    try {
      // Simple test request to check if the API endpoint exists
      const response = await axios.post('/api/zoho', { 
        action: 'ping',
        debug: true 
      });
      setResult(`API Endpoint Response: ${JSON.stringify(response.data.message || 'Success')}`);
      setDetailedResponse(response.data);
    } catch (err) {
      setError(`API Endpoint Error: ${err.message}. Status: ${err.response?.status || 'unknown'}`);
      setDetailedResponse(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const createTestLead = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setDetailedResponse(null);

    try {
      // Submit test lead with debug flag
      const response = await axios.post('/api/zoho', {
        action: 'create',
        formData,
        debug: true
      });
      
      if (response.data && response.data.success) {
        setLeadId(response.data.leadId);
        setResult(`Success! Lead created with ID: ${response.data.leadId}`);
        setDetailedResponse(response.data);
      } else {
        setError(`Error: No lead ID returned`);
        setDetailedResponse(response.data);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setDetailedResponse(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const updateTestLead = async () => {
    if (!leadId) {
      setError("No lead ID available. Please create a lead first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setDetailedResponse(null);

    try {
      // Update test lead with debug flag
      const response = await axios.post('/api/zoho', {
        action: 'update',
        leadId,
        formData,
        debug: true
      });
      
      setResult(`Success! Lead ${leadId} updated`);
      setDetailedResponse(response.data);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setDetailedResponse(err.response?.data);
    } finally {
      setLoading(false);
    }
  };
  
  const createMinimalLead = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setDetailedResponse(null);
    
    try {
      // Create a minimal lead with just required fields
      const response = await axios.post('/api/zoho', {
        action: 'create',
        debug: true,
        formData: {
          name: "Test Minimal Lead",
          phone: "7705551234",
          email: "test@example.com"
        }
      });
      
      if (response.data && response.data.success) {
        setLeadId(response.data.leadId);
        setResult(`Created minimal lead with ID: ${response.data.leadId}`);
        setDetailedResponse(response.data);
      } else {
        setResult('Request successful but no lead ID returned');
        setDetailedResponse(response.data);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setDetailedResponse(err.response?.data);
    } finally {
      setLoading(false);
    }
  };
  
  const getLeadFields = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setDetailedResponse(null);
    
    try {
      const response = await axios.post('/api/zoho', {
        action: 'getFields',
        debug: true
      });
      
      setResult('Retrieved field definitions');
      setDetailedResponse(response.data);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setDetailedResponse(err.response?.data);
    } finally {
      setLoading(false);
    }
  };
  
  const getLead = async () => {
    if (!leadId) {
      setError('Please enter a lead ID');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setError(null);
    setDetailedResponse(null);
    
    try {
      const response = await axios.post('/api/zoho', {
        action: 'getLead',
        debug: true,
        leadId
      });
      
      setResult(`Retrieved lead ${leadId}`);
      setDetailedResponse(response.data);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setDetailedResponse(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLeadIdChange = (e) => {
    setLeadId(e.target.value);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Zoho CRM Integration Test</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={testApiEndpoint}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#cccccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'default' : 'pointer'
          }}
        >
          Test API Endpoint
        </button>
        
        <button 
          onClick={createMinimalLead}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#cccccc' : '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'default' : 'pointer'
          }}
        >
          Create Minimal Lead
        </button>
        
        <button 
          onClick={getLeadFields}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#cccccc' : '#f39c12',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'default' : 'pointer'
          }}
        >
          Get Field Definitions
        </button>
        
        <button 
          onClick={createTestLead}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#cccccc' : '#3490d1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'default' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Full Test Lead'}
        </button>
        
        <button 
          onClick={updateTestLead}
          disabled={loading || !leadId}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#cccccc' : (leadId ? '#e74c3c' : '#cccccc'),
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (loading || !leadId) ? 'default' : 'pointer'
          }}
        >
          {loading ? 'Updating...' : 'Update Test Lead'}
        </button>
        
        <button 
          onClick={getLead}
          disabled={loading || !leadId}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#cccccc' : (leadId ? '#2ecc71' : '#cccccc'),
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (loading || !leadId) ? 'default' : 'pointer'
          }}
        >
          View Lead Details
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Lead ID (for updates/viewing):</label>
        <input 
          type="text" 
          value={leadId} 
          onChange={handleLeadIdChange}
          style={{ 
            padding: '8px',
            width: '100%',
            boxSizing: 'border-box',
            borderRadius: '5px',
            border: '1px solid #ccc'
          }}
          placeholder="Enter Lead ID for updates"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowFullForm(!showFullForm)}
          style={{
            padding: '8px 15px',
            backgroundColor: '#555',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {showFullForm ? 'Hide Form Data' : 'Show Form Data'}
        </button>
      </div>

      {showFullForm && (
        <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
          <h3>Test Form Data</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <h4>Basic Information</h4>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Phone:</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                <input 
                  type="text" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Address:</label>
                <input 
                  type="text" 
                  name="street" 
                  value={formData.street} 
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>City:</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Zip:</label>
                <input 
                  type="text" 
                  name="zip" 
                  value={formData.zip} 
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            
            <div>
              <h4>Property Details</h4>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Property Owner:</label>
                <select
                  name="isPropertyOwner"
                  value={formData.isPropertyOwner}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Needs Repairs:</label>
                <select
                  name="needsRepairs"
                  value={formData.needsRepairs}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Working With Agent:</label>
                <select
                  name="workingWithAgent"
                  value={formData.workingWithAgent}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Home Type:</label>
                <select
                  name="homeType"
                  value={formData.homeType}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                  <option value="Single Family">Single Family</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Multi-Family">Multi-Family</option>
                </select>
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Remaining Mortgage:</label>
                <input 
                  type="text" 
                  name="remainingMortgage" 
                  value={formData.remainingMortgage} 
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Square Footage:</label>
                <input 
                  type="text" 
                  name="finishedSquareFootage" 
                  value={formData.finishedSquareFootage} 
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Garage:</label>
                <select
                  name="garage"
                  value={formData.garage}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>HOA:</label>
                <select
                  name="hasHoa"
                  value={formData.hasHoa}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>How Soon to Sell:</label>
                <select
                  name="howSoonSell"
                  value={formData.howSoonSell}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                  <option value="ASAP">ASAP</option>
                  <option value="0-3 months">0-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e6f7e6', borderRadius: '5px' }}>
          {result}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f7e6e6', borderRadius: '5px' }}>
          {error}
        </div>
      )}
      
      {detailedResponse && (
        <div style={{ marginTop: '20px' }}>
          <h3>Detailed Response:</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            overflowX: 'auto',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {JSON.stringify(detailedResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ZohoTest;