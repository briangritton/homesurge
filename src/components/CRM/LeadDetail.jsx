import React, { useState } from 'react';
import { 
  PropertyFields, 
  MarketingFields, 
  AddressFields,
  ContactFields,
  LeadFields,
  PriorityFields,
  ActivityFields,
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
      // Always show fields marked with alwaysShow flag
      if (field.alwaysShow) {
        return true;
      }
      if (field.showOnlyIfExists) {
        return lead[field.id] !== undefined && lead[field.id] !== null && lead[field.id] !== '';
      }
      return lead[field.id] !== undefined && lead[field.id] !== null && lead[field.id] !== '';
    };

    return (
      <div className="lead-detail-fields crm-lead-detail-fields">
        {fields.filter(shouldShowField).map(field => {
          const fieldValue = renderFieldValue(lead, field);
          // Skip fields that return null (conditionally hidden)
          if (fieldValue === null) return null;
          
          return (
            <div className={`field-row crm-field-row ${field.id.includes('autoFilled') ? 'crm-auto-filled-field' : ''}`} key={field.id}>
              <div className="field-label crm-field-label">{field.label}:</div>
              <div className="field-value crm-field-value">{fieldValue}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="lead-detail-container crm-lead-detail-container">
      <h2 className="crm-lead-title">Lead: {lead.name || 'Unnamed Lead'}</h2>
      
      {/* Priority Information Card */}
      <div className="crm-priority-card">
        <h3 className="crm-section-title">Priority Information</h3>
        {renderFields(PriorityFields)}
      </div>
      
      {/* Tabs for different sections */}
      <div className="lead-tabs crm-lead-tabs crm-lead-detail-tabs">
        <button 
          className={`crm-tab-button crm-lead-detail-tab ${activeTab === 'contact' ? 'active crm-tab-active crm-lead-detail-tab-active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact Info
        </button>
        <button 
          className={`crm-tab-button crm-lead-detail-tab ${activeTab === 'address' ? 'active crm-tab-active crm-lead-detail-tab-active' : ''}`}
          onClick={() => setActiveTab('address')}
        >
          Address
        </button>
        <button 
          className={`crm-tab-button crm-lead-detail-tab ${activeTab === 'property' ? 'active crm-tab-active crm-lead-detail-tab-active' : ''}`}
          onClick={() => setActiveTab('property')}
        >
          Property Info
        </button>
        <button 
          className={`crm-tab-button crm-lead-detail-tab ${activeTab === 'marketing' ? 'active crm-tab-active crm-lead-detail-tab-active' : ''}`}
          onClick={() => setActiveTab('marketing')}
        >
          Marketing Data
        </button>
        <button 
          className={`crm-tab-button crm-lead-detail-tab ${activeTab === 'lead' ? 'active crm-tab-active crm-lead-detail-tab-active' : ''}`}
          onClick={() => setActiveTab('lead')}
        >
          Lead Details
        </button>
        <button 
          className={`crm-tab-button crm-lead-detail-tab ${activeTab === 'activity' ? 'active crm-tab-active crm-lead-detail-tab-active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity & Reports
        </button>
      </div>
      
      {/* Content for the active tab */}
      <div className="tab-content crm-tab-content crm-lead-detail-content">
        <div className="crm-tab-panel" style={{ display: activeTab === 'contact' ? 'block' : 'none' }}>
          <h3 className="crm-section-title">Contact Information</h3>
          {renderFields(ContactFields)}
        </div>
        <div className="crm-tab-panel" style={{ display: activeTab === 'address' ? 'block' : 'none' }}>
          <h3 className="crm-section-title">Address Information</h3>
          {renderFields(AddressFields)}
        </div>
        <div className="crm-tab-panel" style={{ display: activeTab === 'property' ? 'block' : 'none' }}>
          <h3 className="crm-section-title">Property Information</h3>
          {renderFields(PropertyFields)}
        </div>
        <div className="crm-tab-panel" style={{ display: activeTab === 'marketing' ? 'block' : 'none' }}>
          <h3 className="crm-section-title">Marketing Data</h3>
          {renderFields(MarketingFields)}
        </div>
        <div className="crm-tab-panel" style={{ display: activeTab === 'lead' ? 'block' : 'none' }}>
          <h3 className="crm-section-title">Lead Details</h3>
          {renderFields(LeadFields)}
        </div>
        <div className="crm-tab-panel" style={{ display: activeTab === 'activity' ? 'block' : 'none' }}>
          <h3 className="crm-section-title">Activity & Reports</h3>
          {renderFields(ActivityFields)}
        </div>
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
        
        .crm-array-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .crm-array-item {
          padding: 3px 0;
        }
        
        .crm-phone-link,
        .crm-email-link {
          color: #2e7b7d;
          text-decoration: none;
        }
        
        .crm-phone-link:hover,
        .crm-email-link:hover {
          text-decoration: underline;
        }
        
        .crm-priority-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .crm-priority-card .crm-section-title {
          margin-top: 0;
          color: #2e7b7d;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 8px;
          margin-bottom: 15px;
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