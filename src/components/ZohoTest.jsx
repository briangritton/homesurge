import React, { useState } from 'react';
import { submitLeadToZoho } from '../services/zoho';
import axios from 'axios';

function ZohoTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testZohoIntegration = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Create test lead data
      const testFormData = {
        name: "Test User",
        phone: "7705551234",
        email: "test@example.com",
        street: "123 Test St, Atlanta, GA 30301",
        city: "Atlanta",
        zip: "30301",
        isPropertyOwner: 'true',
        needsRepairs: 'false',
        workingWithAgent: 'false',
        homeType: 'Single Family',
        remainingMortgage: 200000,
        finishedSquareFootage: 2000,
        trafficSource: 'Test'
      };

      // Submit test lead
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
      // Simple test request to check if the API endpoint exists
      const response = await axios.post('/api/zoho', { action: 'ping' });
      setResult(`API Endpoint Response: ${JSON.stringify(response.data)}`);
    } catch (err) {
      setError(`API Endpoint Error: ${err.message}. Status: ${err.response?.status || 'unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Zoho Integration Test</h2>
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
    </div>
  );
}

export default ZohoTest;