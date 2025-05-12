import React, { useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { trackFormSubmission, trackFormStepComplete } from '../../services/analytics';
import { trackZohoConversion } from '../../services/zoho';

function ThankYou() {
  const { formData, leadId } = useFormContext();
  
  // Track successful form completion on page load
  useEffect(() => {
    // Track just ONE completion event - we'll use trackFormSubmission which includes
    // both Lead and CompleteRegistration events
    trackFormSubmission(formData);
    
    // Track conversion in Zoho based on appointment status
    if (leadId) {
      // If appointment was set, track that specific conversion
      if (formData.wantToSetAppointment === 'true' && 
          formData.selectedAppointmentDate && 
          formData.selectedAppointmentTime) {
        console.log('Tracking appointment set conversion for lead:', leadId);
        trackZohoConversion('appointmentSet', leadId, 'Appointment Set');
      } else {
        // Otherwise track a standard lead submission conversion
        console.log('Tracking lead submission conversion for lead:', leadId);
        trackZohoConversion('successfulContact', leadId, 'Lead Submitted');
      }
    }
    
    // Push dataLayer event for Thank You page view with enhanced campaign data
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'GaFastOfferHeroTYPageView',
        title: 'ThankYou.jsx',
        leadData: {
          address: formData.street,
          propertyOwner: formData.isPropertyOwner,
          needsRepairs: formData.needsRepairs,
          homeType: formData.homeType,
          timeframe: formData.howSoonSell,
          appointment: formData.wantToSetAppointment === 'true' ? 'Yes' : 'No',
          appointmentDate: formData.selectedAppointmentDate,
          appointmentTime: formData.selectedAppointmentTime,
          estimatedValue: formData.formattedApiEstimatedValue || 'Not Available'
        },
        campaignData: {
          campaignId: formData.campaignId || '',
          campaignName: formData.campaignName || '',
          adgroupId: formData.adgroupId || '',
          adgroupName: formData.adgroupName || '',
          keyword: formData.keyword || '',
          device: formData.device || '',
          gclid: formData.gclid || '',
          trafficSource: formData.trafficSource || 'Direct'
        },
        conversionValue: formData.apiEstimatedValue ? Math.round(formData.apiEstimatedValue / 1000) : 0
      });
    }
    
    // Clear form step in localStorage to prevent returning to form
    localStorage.setItem('formStep', '1');
    
    // Scroll to top
    window.scrollTo(0, 0);
  }, [formData, leadId]);
  
  return (
    <div className="thank-you-section">
      <div className="thank-you-headline">
        {formData.thankYouHeadline || 'Request Completed!'}
      </div>
      <div className="thank-you-text">
        {formData.thankYouSubHeadline || 'You\'ll be receiving your requested details at your contact number shortly, thank you!'}
      </div>
      
      {/* Display appointment information if scheduled */}
      {formData.wantToSetAppointment === 'true' && formData.selectedAppointmentDate && formData.selectedAppointmentTime && (
        <div className="thank-you-text" style={{ marginTop: '30px' }}>
          <strong>Your appointment is scheduled for:</strong><br />
          {formData.selectedAppointmentDate} at {formData.selectedAppointmentTime}
        </div>
      )}
      
      {/* Property information section */}
      {(formData.formattedApiEstimatedValue && formData.formattedApiEstimatedValue !== '$0') ? (
        <div className="thank-you-text" style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          <strong>Property Estimate:</strong><br />
          Estimated Value: {formData.formattedApiEstimatedValue}<br />
          {formData.street}<br />
          {formData.city || ''}{formData.city && formData.state ? ', ' : ''}{formData.state || ''} {formData.zip || ''}
        </div>
      ) : formData.street ? (
        <div className="thank-you-text" style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          <strong>Property Address:</strong><br />
          {formData.street}<br />
          {formData.city || ''}{formData.city && formData.state ? ', ' : ''}{formData.state || ''} {formData.zip || ''}
        </div>
      ) : null}
    </div>
  );
}

export default ThankYou;