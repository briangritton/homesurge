import React, { useState } from 'react';
import { 
  PropertyFields, 
  MarketingFields, 
  AddressFields,
  ContactFields,
  LeadFields,
  renderFieldValue
} from './LeadDetailFields';

// Sample lead detail component to display lead information
export default function LeadDetail({ lead }) {
  const [activeTab, setActiveTab] = useState('contact');

  if (!lead) {
    return <div>Loading lead details...</div>;
  }

  // Function to render fields for a specific section
  const renderFields = (fields) => {
    // Make sure all fields from the lead are displayed even if they aren't
    // explicitly defined in the field arrays
    const shouldShowField = (field) => {
      return lead[field.id] !== undefined && lead[field.id] !== null && lead[field.id] !== '';
    };

    return (
      <div className="lead-detail-fields crm-lead-detail-fields">
        {fields.filter(shouldShowField).map(field => (
          <div className={`field-row crm-field-row ${field.id.includes('autoFilled') ? 'crm-auto-filled-field' : ''}`} key={field.id}>
            <div className="field-label crm-field-label">{field.label}:</div>
            <div className="field-value crm-field-value">{renderFieldValue(lead, field)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="lead-detail-container crm-lead-detail-container">
      <h2 className="crm-lead-title">Lead: {lead.name || 'Unnamed Lead'}</h2>
      
      {/* Tabs for different sections */}
      <div className="lead-tabs crm-lead-tabs">
        <button 
          className={`crm-tab-button ${activeTab === 'contact' ? 'active crm-tab-active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact Info
        </button>
        <button 
          className={`crm-tab-button ${activeTab === 'address' ? 'active crm-tab-active' : ''}`}
          onClick={() => setActiveTab('address')}
        >
          Address
        </button>
        <button 
          className={`crm-tab-button ${activeTab === 'property' ? 'active crm-tab-active' : ''}`}
          onClick={() => setActiveTab('property')}
        >
          Property Info
        </button>
        <button 
          className={`crm-tab-button ${activeTab === 'marketing' ? 'active crm-tab-active' : ''}`}
          onClick={() => setActiveTab('marketing')}
        >
          Marketing Data
        </button>
        <button 
          className={`crm-tab-button ${activeTab === 'lead' ? 'active crm-tab-active' : ''}`}
          onClick={() => setActiveTab('lead')}
        >
          Lead Details
        </button>
      </div>
      
      {/* Content for the active tab */}
      <div className="tab-content crm-tab-content">
        {activeTab === 'contact' && renderFields(ContactFields)}
        {activeTab === 'address' && renderFields(AddressFields)}
        {activeTab === 'property' && renderFields(PropertyFields)}
        {activeTab === 'marketing' && renderFields(MarketingFields)}
        {activeTab === 'lead' && renderFields(LeadFields)}
      </div>

      {/* CSS for the component */}
      <style jsx>{`
        .lead-detail-container {
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .lead-tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .lead-tabs button {
          background: none;
          border: none;
          padding: 10px 15px;
          cursor: pointer;
          font-size: 14px;
          color: #555;
        }
        
        .lead-tabs button.active {
          border-bottom: 2px solid #2e7b7d;
          color: #2e7b7d;
          font-weight: bold;
        }
        
        .lead-detail-fields {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        
        .field-row {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid #f5f5f5;
        }
        
        .field-label {
          flex: 0 0 150px;
          font-weight: bold;
          color: #555;
        }
        
        .field-value {
          flex: 1;
        }
        
        @media (min-width: 768px) {
          .lead-detail-fields {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}