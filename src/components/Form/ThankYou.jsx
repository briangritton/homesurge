import React, { useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { trackFormSubmission } from '../../services/analytics';

function ThankYou() {
  const { formData } = useFormContext();
  
  // Track successful form completion on page load
  useEffect(() => {
    // Track one last time with all completed data
    trackFormSubmission(formData);
    
    // Push dataLayer event for Thank You page view
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'GaFastOfferHeroTYPageView',
        title: 'ThankYou.jsx',
      });
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
  }, [formData]);
  
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
    </div>
  );
}

export default ThankYou;