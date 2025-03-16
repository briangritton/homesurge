import React, { useState } from 'react';
import { submitLeadToZoho } from '../services/zoho';
import axios from 'axios';

function ZohoTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port,
    fullUrl: window.location.href
  });

  const testZohoIntegration = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Create test lead data with field names matching Zoho CRM
      const testFormData = {
        name: "Test User 2",
        phone: "7705551235",
        email: "test2@example.com",
        street: "124 Test St, Atlanta, GA 30301",
        city: "Atlanta",
        zip: "30301",
        isPropertyOwner: 'true',            
        needsRepairs: 'false',              
        workingWithAgent: 'false',          
        homeType: 'Single Family',          
        remainingMortgage: 200000,          
        finishedSquareFootage: 2000,        
        basementSquareFootage: 1000,        
        howSoonSell: "ASAP",                
        reasonForSelling: "Moving",         
        garage: "Yes",                      
        garageCars: "2",                    
        hasHoa: "No",                       
        hasSolar: "No",                     
        planningToBuy: "Yes",               
        septicOrSewer: "Sewer",             
        knownIssues: "None",                
        wantToSetAppointment: "false",      
        selectedAppointmentDate: "",        
        selectedAppointmentTime: "",        
        bedrooms: "3",                      
        bathrooms: "2",                     
        floors: "2",                        
        trafficSource: 'Test'               
      };

      // In local development, use mock data
      if (window.location.hostname === 'localhost') {
        console.log("Using mock data for local testing");
        console.log("Would submit form data:", testFormData);
        
        // Simulate a delay for realism
        setTimeout(() => {
          setResult(`Success! Lead ID: mock-${Date.now()}`);
          setLoading(false);
        }, 1000);
        
        return;
      }

      // This will only run in production
      const leadId = await submitLeadToZoho(testFormData);
      setResult(`Success! Lead ID: ${leadId}`);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiEndpoint = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // In local development, use mock data instead of making the API call
      if (window.location.hostname === 'localhost') {
        console.log("Using mock data for local testing");
        
        // Simulate a delay for realism
        setTimeout(() => {
          setResult(`API Endpoint Response (Mock): { "success": true, "message": "API endpoint is working" }`);
          setLoading(false);
        }, 500);
        
        return;
      }
      
      // This will only run in production
      console.log("Attempting to call API at:", '/api/zoho');
      const response = await axios.post('/api/zoho', { 
        action: 'ping' 
      });
      
      console.log("API response:", response);
      setResult(`API Endpoint Response: ${JSON.stringify(response.data)}`);
    } catch (err) {
      console.error("API Error:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        stack: err.stack
      });
      
      setError(`API Endpoint Error: ${err.message}. Status: ${err.response?.status || 'unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Zoho Integration Test {window.location.hostname === 'localhost' ? '(Mock Mode)' : ''}</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
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
          onClick={testZohoIntegration}
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
          {loading ? 'Testing...' : 'Test Zoho Integration'}
        </button>
      </div>

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

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Debug Info</h3>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>
    </div>
  );
}

export default ZohoTest;