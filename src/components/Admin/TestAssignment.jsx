import React, { useState } from 'react';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';

const styles = {
  container: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formRow: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  button: {
    padding: '8px 16px',
    background: '#2e7b7d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  toggleButton: {
    padding: '8px 16px',
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  results: {
    marginTop: '20px',
    padding: '15px',
    background: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
  },
  successMessage: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  errorMessage: {
    color: '#F44336',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  detailItem: {
    margin: '5px 0',
    fontSize: '14px',
  },
  checkbox: {
    marginRight: '5px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
  }
};

const TestAssignment = () => {
  const [testName, setTestName] = useState('Test Lead');
  const [testPhone, setTestPhone] = useState('');
  const [includePhone, setIncludePhone] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleCreateTestLead = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const db = getFirestore();
      
      // Prepare test lead data
      const leadData = {
        name: testName.trim() || 'Test Lead',
        street: '123 Test Street, Atlanta, GA 30301',
        city: 'Atlanta',
        state: 'GA',
        zip: '30301',
        leadSource: 'Assignment Test',
        leadStage: 'New',
        status: 'New',
        assignedTo: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Only include phone if the checkbox is checked
      if (includePhone && testPhone.trim()) {
        leadData.phone = testPhone.trim();
        console.log(`Test lead created with phone: ${testPhone.trim()}`);
      } else {
        console.log('Test lead created without phone number');
      }
      
      // Add the test lead
      const leadRef = await addDoc(collection(db, 'leads'), leadData);
      
      // Wait a moment for assignments to process
      console.log('Waiting for lead auto-assignment to process...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if the lead was assigned
      console.log(`Checking assignment status for lead ${leadRef.id}...`);
      const updatedLeadDoc = await getDoc(doc(db, 'leads', leadRef.id));
      
      if (!updatedLeadDoc.exists()) {
        throw new Error('Lead document not found after creation');
      }
      
      const updatedLead = updatedLeadDoc.data();
      console.log('Updated lead data:', {
        leadId: leadRef.id,
        assignedTo: updatedLead.assignedTo || 'Not assigned',
        assignmentRule: updatedLead.assignmentRule || 'No rule applied',
        status: updatedLead.status,
        hasPhone: Boolean(updatedLead.phone),
        phone: updatedLead.phone || 'No phone'
      });
      
      // Fetch all sales reps with assignment rules to debug
      console.log('Fetching all sales reps to check assignment rules...');
      const salesRepsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'sales_rep')
      );
      const salesRepsSnapshot = await getDocs(salesRepsQuery);
      const salesReps = salesRepsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          autoAssignRule: data.autoAssignRule || 'none',
          active: data.active
        };
      });
      console.log('Available sales reps and their rules:', salesReps);
      
      // If assigned, get details about the sales rep
      let assignedToDetails = null;
      if (updatedLead.assignedTo) {
        console.log(`Lead was assigned to ${updatedLead.assignedTo}, getting details...`);
        const salesRepDoc = await getDoc(doc(db, 'users', updatedLead.assignedTo));
        if (salesRepDoc.exists()) {
          assignedToDetails = salesRepDoc.data();
          console.log('Assigned sales rep details:', {
            id: updatedLead.assignedTo,
            name: assignedToDetails.name,
            rule: assignedToDetails.autoAssignRule || 'none'
          });
        }
      } else {
        console.log('Lead was NOT assigned to any sales rep');
      }
      
      // Set the result
      setResult({
        leadId: leadRef.id,
        lead: updatedLead,
        assigned: !!updatedLead.assignedTo,
        assignmentRule: updatedLead.assignmentRule || 'None',
        salesRep: assignedToDetails
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error creating test lead:', err);
      setError(err.message || 'Failed to create test lead');
      setLoading(false);
    }
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Test Lead Assignment</h2>
      
      <div style={styles.form}>
        <div style={styles.formRow}>
          <input
            type="text"
            placeholder="Test Lead Name"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            style={styles.input}
          />
        </div>
        
        <div style={styles.formRow}>
          <div style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includePhone}
              onChange={(e) => setIncludePhone(e.target.checked)}
              style={styles.checkbox}
              id="includePhone"
            />
            <label htmlFor="includePhone">Include Phone Number</label>
          </div>
          
          <input
            type="tel"
            placeholder="Phone Number"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            style={{
              ...styles.input,
              opacity: includePhone ? 1 : 0.5
            }}
            disabled={!includePhone}
          />
        </div>
        
        <div style={styles.formRow}>
          <button
            style={styles.button}
            onClick={handleCreateTestLead}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Test Lead'}
          </button>
        </div>
      </div>
      
      {error && (
        <div style={styles.results}>
          <div style={styles.errorMessage}>{error}</div>
        </div>
      )}
      
      {result && (
        <div style={styles.results}>
          {result.assigned ? (
            <div style={styles.successMessage}>
              Lead was successfully assigned!
            </div>
          ) : (
            <div style={styles.errorMessage}>
              Lead was NOT assigned to any sales rep.
            </div>
          )}
          
          <div style={styles.detailItem}>
            <strong>Lead ID:</strong> {result.leadId}
          </div>
          
          <div style={styles.detailItem}>
            <strong>Name:</strong> {result.lead.name}
          </div>
          
          <div style={styles.detailItem}>
            <strong>Phone:</strong> {result.lead.phone || 'None'}
          </div>
          
          {result.assigned && (
            <>
              <div style={styles.detailItem}>
                <strong>Assigned To:</strong> {result.salesRep?.name || result.lead.assignedTo}
              </div>
              
              <div style={styles.detailItem}>
                <strong>Assignment Rule:</strong> {result.assignmentRule}
              </div>
              
              <div style={styles.detailItem}>
                <strong>Rep's Auto-Assign Rule:</strong> {result.salesRep?.autoAssignRule || 'Unknown'}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TestAssignment;