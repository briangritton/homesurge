import React from 'react';

// This component defines the field structure for the CRM dashboard
// It ensures all the fields from Zoho CRM are mirrored in the Firebase CRM

// Priority Information Fields
export const PriorityFields = [
  { id: 'priorityName', label: 'Name', section: 'priority', type: 'special', specialRender: 'priorityName' },
  { id: 'priorityPhone', label: 'Phone', section: 'priority', type: 'special', specialRender: 'priorityPhone' },
  { id: 'apiMaxHomeValue', label: 'API Max Value', section: 'priority', type: 'currency', showOnlyIfExists: true },
  { id: 'apiEquity', label: 'API Equity', section: 'priority', type: 'currency', showOnlyIfExists: true },
  { id: 'apiPercentage', label: 'API Equity Percentage', section: 'priority', type: 'percentage', showOnlyIfExists: true },
  { id: 'keyword', label: 'Keyword', section: 'priority', type: 'text', showOnlyIfExists: true },
  { id: 'matchtype', label: 'Match Type', section: 'priority', type: 'special', specialRender: 'matchType', showOnlyIfExists: true },
];

export const PropertyFields = [
  { id: 'apiOwnerName', label: 'API Owner Name', section: 'property', type: 'text' },
  { id: 'apiEstimatedValue', label: 'API Estimated Value', section: 'property', type: 'currency' },
  { id: 'apiHomeValue', label: 'API Home Value', section: 'property', type: 'currency' },
  { id: 'apiMaxHomeValue', label: 'API Max Home Value', section: 'property', type: 'currency' },
  { id: 'formattedApiEstimatedValue', label: 'Formatted API Value', section: 'property', type: 'text' },
  { id: 'apiEquity', label: 'API Equity', section: 'property', type: 'currency' },
  { id: 'propertyEquity', label: 'Property Equity', section: 'property', type: 'currency' },
  { id: 'apiPercentage', label: 'API Equity Percentage', section: 'property', type: 'percentage' },
  { id: 'equityPercentage', label: 'Equity Percentage', section: 'property', type: 'percentage' },
  { id: 'bedrooms', label: 'Bedrooms', section: 'property', type: 'text' },
  { id: 'bathrooms', label: 'Bathrooms', section: 'property', type: 'text' },
  { id: 'finishedSquareFootage', label: 'Square Footage', section: 'property', type: 'number' },
];

export const MarketingFields = [
  { id: 'campaign_name', label: 'Campaign Name', section: 'marketing', type: 'text' },
  { id: 'campaign_id', label: 'Campaign ID', section: 'marketing', type: 'text' },
  { id: 'adgroup_name', label: 'Ad Group Name', section: 'marketing', type: 'text' },
  { id: 'adgroup_id', label: 'Ad Group ID', section: 'marketing', type: 'text' },
  { id: 'keyword', label: 'Keyword', section: 'marketing', type: 'text' },
  { id: 'matchtype', label: 'Match Type', section: 'marketing', type: 'text' },
  { id: 'gclid', label: 'GCLID', section: 'marketing', type: 'text' },
  { id: 'device', label: 'Device', section: 'marketing', type: 'text' },
  { id: 'traffic_source', label: 'Traffic Source', section: 'marketing', type: 'text' },
  { id: 'templateType', label: 'Template Type', section: 'marketing', type: 'text' },
  { id: 'template_type', label: 'Template Type', section: 'marketing', type: 'text' },
  { id: 'url', label: 'Landing URL', section: 'marketing', type: 'text' },
];

export const AddressFields = [
  { id: 'street', label: 'Street', section: 'address', type: 'text' },
  { id: 'city', label: 'City', section: 'address', type: 'text' },
  { id: 'state', label: 'State', section: 'address', type: 'text' },
  { id: 'zip', label: 'ZIP', section: 'address', type: 'text' },
  { id: 'userTypedAddress', label: 'User Typed Address', section: 'address', type: 'text' },
  { id: 'selectedSuggestionAddress', label: 'Selected Address', section: 'address', type: 'text' },
  { id: 'addressSelectionType', label: 'Selection Type', section: 'address', type: 'text' },
];

export const ContactFields = [
  { id: 'name', label: 'Name', section: 'contact', type: 'text' },
  { id: 'phone', label: 'Phone', section: 'contact', type: 'phone' },
  { id: 'email', label: 'Email', section: 'contact', type: 'email' },
  { id: 'autoFilledName', label: 'Auto Filled Name', section: 'contact', type: 'text' },
  { id: 'autoFilledPhone', label: 'Auto Filled Phone', section: 'contact', type: 'phone' },
  { id: 'batchDataPhoneNumbers', label: 'BatchData Phone Numbers', section: 'contact', type: 'phoneArray', alwaysShow: true },
  { id: 'batchDataEmails', label: 'BatchData Emails', section: 'contact', type: 'emailArray', alwaysShow: true },
  { id: 'batchDataProcessed', label: 'BatchData Processed', section: 'contact', type: 'boolean', alwaysShow: true },
  { id: 'batchDataProcessedAt', label: 'BatchData Processed At', section: 'contact', type: 'text', alwaysShow: true },
];

export const ActivityFields = [
  { id: 'notes', label: 'Notes', section: 'activity', type: 'text', alwaysShow: true },
  { id: 'aiHomeReport', label: 'AI Home Report', section: 'activity', type: 'object' },
  { id: 'batchDataReport', label: 'BatchData Report', section: 'activity', type: 'object' },
];

export const LeadFields = [
  { id: 'leadStage', label: 'Lead Stage', section: 'lead', type: 'text' },
  { id: 'leadSource', label: 'Lead Source', section: 'lead', type: 'text' },
  { id: 'status', label: 'Status', section: 'lead', type: 'text' },
  { id: 'createdAt', label: 'Created', section: 'lead', type: 'date' },
  { id: 'updatedAt', label: 'Updated', section: 'lead', type: 'date' },
];

// Helper function to render field based on type
export const renderFieldValue = (lead, field) => {
  // Check if field should only be shown if it has a value
  if (field.showOnlyIfExists && (!lead || lead[field.id] === undefined || lead[field.id] === null || lead[field.id] === '')) {
    return null;
  }

  if (!lead || lead[field.id] === undefined || lead[field.id] === null) {
    return '-';
  }

  // Special handling for array fields and boolean fields that should show even when empty
  if (field.alwaysShow && (field.type === 'phoneArray' || field.type === 'emailArray' || field.type === 'boolean')) {
    // These fields should always render, even when empty
  } else if (lead[field.id] === '') {
    return '-';
  }

  // Handle special render cases
  if (field.type === 'special') {
    switch (field.specialRender) {
      case 'priorityName':
        // Use name if available, otherwise use autoFilledName
        return lead.name || lead.autoFilledName || '-';
      
      case 'priorityPhone':
        // Use phone if available, otherwise use autoFilledPhone
        const phone = lead.phone || lead.autoFilledPhone || '-';
        return phone !== '-' ? <a href={`tel:${phone}`} className="crm-phone-link">{phone}</a> : '-';
      
      case 'matchType':
        // Format match type: e to exact, p to phrase match, b to broad match
        const matchType = lead.matchtype;
        if (matchType === 'e') return 'Exact Match';
        if (matchType === 'p') return 'Phrase Match';
        if (matchType === 'b') return 'Broad Match';
        return matchType || '-';
        
      default:
        return lead[field.id];
    }
  }

  switch (field.type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(parseFloat(lead[field.id]));
    
    case 'percentage':
      return `${lead[field.id]}%`;
    
    case 'date':
      if (lead[field.id]?.toDate) {
        return lead[field.id].toDate().toLocaleString();
      }
      return lead[field.id];
    
    case 'phone':
      return <a href={`tel:${lead[field.id]}`} className="crm-phone-link">{lead[field.id]}</a>;
    
    case 'email':
      return <a href={`mailto:${lead[field.id]}`} className="crm-email-link">{lead[field.id]}</a>;
    
    case 'phoneArray':
      if (Array.isArray(lead[field.id]) && lead[field.id].length > 0) {
        return (
          <div className="crm-array-field">
            {lead[field.id].map((phone, index) => (
              <div key={index} className="crm-array-item">
                <a href={`tel:${phone}`} className="crm-phone-link">{phone}</a>
              </div>
            ))}
          </div>
        );
      }
      return '-';
    
    case 'emailArray':
      if (Array.isArray(lead[field.id]) && lead[field.id].length > 0) {
        return (
          <div className="crm-array-field">
            {lead[field.id].map((email, index) => (
              <div key={index} className="crm-array-item">
                <a href={`mailto:${email}`} className="crm-email-link">{email}</a>
              </div>
            ))}
          </div>
        );
      }
      return '-';
    
    case 'boolean':
      return lead[field.id] === true ? 'Yes' : 'No';
    
    case 'object':
      if (typeof lead[field.id] === 'object' && lead[field.id] !== null) {
        return (
          <div className="crm-object-field">
            <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(lead[field.id], null, 2)}
            </pre>
          </div>
        );
      }
      return '-';
    
    default:
      return lead[field.id];
  }
};

// Export all fields for easy access
export const AllFields = [
  ...PriorityFields,
  ...ContactFields,
  ...AddressFields,
  ...PropertyFields,
  ...MarketingFields,
  ...LeadFields,
  ...ActivityFields
];

export default function LeadDetailFields() {
  return null; // This is just a utility component that exports field definitions
}