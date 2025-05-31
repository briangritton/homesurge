import React from 'react';

// Priority information display component for the CRM dashboard
export const formatMatchType = (matchType) => {
  if (matchType === 'e') return 'Exact Match';
  if (matchType === 'p') return 'Phrase Match';
  if (matchType === 'b') return 'Broad Match';
  return matchType || 'N/A';
};

// Component to display priority information fields in Admin view
export default function PriorityInfoFields({ lead }) {
  // Format currency values
  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get the name value (prioritize name over autoFilledName)
  const nameValue = lead.name || lead.autoFilledName || 'N/A';
  
  // Get the phone value (prioritize phone over autoFilledPhone)
  const phoneValue = lead.phone || lead.autoFilledPhone || 'N/A';
  
  // Determine if a field should be shown
  const shouldShowField = (fieldValue) => {
    return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
  };

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '15px',
    },
    fieldGroup: {
      marginBottom: '10px',
    },
    fieldLabel: {
      display: 'block',
      fontSize: '14px',
      color: '#666',
      marginBottom: '5px',
    },
    fieldValue: {
      fontSize: '16px',
      fontWeight: '500',
      wordBreak: 'break-word',
    },
    phoneLink: {
      color: '#2e7b7d',
      textDecoration: 'none',
    }
  };

  return (
    <div style={styles.container} className="priority-info-fields-container">
      <div style={styles.fieldGroup} className="field-group">
        <div style={styles.fieldLabel} className="field-label">Name</div>
        <div style={styles.fieldValue} className="field-value">{nameValue}</div>
      </div>
      
      <div style={styles.fieldGroup} className="field-group">
        <div style={styles.fieldLabel} className="field-label">Phone</div>
        <div style={styles.fieldValue} className="field-value">
          {phoneValue !== 'N/A' ? (
            <a href={`tel:${phoneValue}`} style={styles.phoneLink} className="phone-link">{phoneValue}</a>
          ) : 'N/A'}
          
          {/* BatchData Phone Numbers */}
          {lead.batchDataPhoneNumbers && Array.isArray(lead.batchDataPhoneNumbers) && lead.batchDataPhoneNumbers.length > 0 && (
            <div style={{marginTop: '8px'}}>
              <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>BatchData:</div>
              {lead.batchDataPhoneNumbers.map((phone, index) => (
                <div key={index} style={{marginBottom: '2px'}}>
                  <a href={`tel:${phone}`} style={{...styles.phoneLink, fontSize: '14px'}} className="phone-link">{phone}</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {shouldShowField(lead.apiMaxHomeValue) && (
        <div style={styles.fieldGroup} className="field-group">
          <div style={styles.fieldLabel} className="field-label">API Max Value</div>
          <div style={styles.fieldValue} className="field-value">{formatCurrency(lead.apiMaxHomeValue)}</div>
        </div>
      )}
      
      {shouldShowField(lead.apiEquity) && (
        <div style={styles.fieldGroup} className="field-group">
          <div style={styles.fieldLabel} className="field-label">API Equity</div>
          <div style={styles.fieldValue} className="field-value">{formatCurrency(lead.apiEquity)}</div>
        </div>
      )}
      
      {shouldShowField(lead.apiPercentage) && (
        <div style={styles.fieldGroup} className="field-group">
          <div style={styles.fieldLabel} className="field-label">API Equity Percentage</div>
          <div style={styles.fieldValue} className="field-value">{lead.apiPercentage}%</div>
        </div>
      )}
      
      {shouldShowField(lead.keyword) && (
        <div style={styles.fieldGroup} className="field-group">
          <div style={styles.fieldLabel} className="field-label">Keyword</div>
          <div style={styles.fieldValue} className="field-value">{lead.keyword}</div>
        </div>
      )}
      
      {shouldShowField(lead.matchtype) && (
        <div style={styles.fieldGroup} className="field-group">
          <div style={styles.fieldLabel} className="field-label">Match Type</div>
          <div style={styles.fieldValue} className="field-value">{formatMatchType(lead.matchtype)}</div>
        </div>
      )}
    </div>
  );
}