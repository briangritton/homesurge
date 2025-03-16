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
      // Create test lead data with field names matching Zoho CRM
      const testFormData = {
        name: "Test User 2",
        phone: "7705551235",
        email: "test2@example.com",
        street: "124 Test St, Atlanta, GA 30301",
        city: "Atlanta",
        zip: "30301",
        isPropertyOwner: 'true',            // Maps to "Are you the property owner?"
        needsRepairs: 'false',              // Maps to "Does the property need any major repairs?"
        workingWithAgent: 'false',          // Maps to "Are you working with a real estate agent?"
        homeType: 'Single Family',          // Maps to "What type of property is it?"
        remainingMortgage: 200000,          // Maps to "What is your remaining mortgage amount?"
        finishedSquareFootage: 2000,        // Maps to "What is your finished square footage?"
        basementSquareFootage: 1000,        // Maps to "What is your unfinished basement square footage?"
        howSoonSell: "ASAP",                // Maps to "How soon do you want to sell?"
        reasonForSelling: "Moving",         // Maps to "Why are you selling?"
        garage: "Yes",                      // Maps to "Do you have a garage?"
        garageCars: "2",                    // Maps to "How many cars can fit in your garage?"
        hasHoa: "No",                       // Maps to "Do you have an HOA?"
        hasSolar: "No",                     // Maps to "Does your home have solar panels?"
        planningToBuy: "Yes",               // Maps to "Are you planning to buy a home?"
        septicOrSewer: "Sewer",             // Maps to "Do you have septic or sewer?"
        knownIssues: "None",                // Maps to "Does your home have any known issues or necessary"
        wantToSetAppointment: "false",      // Maps to "Do you want to set a virtual appointment?"
        selectedAppointmentDate: "",        // Maps to "Select your preferred appointment date."
        selectedAppointmentTime: "",        // Maps to "Select your preferred appointment time ?"
        bedrooms: "3",                      // Maps to "Number of bedrooms?"
        bathrooms: "2",                     // Maps to "Number of bathrooms?"
        floors: "2",                        // Maps to "How many floor does your home have?"
        trafficSource: 'Test'               // Maps to "trafficSource"
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