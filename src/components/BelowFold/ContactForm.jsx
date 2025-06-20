import React from 'react';

function ContactForm() {
  return (
    <section className="bf-section bf-contact-form">
      <div className="bf-container">
        <h2 className="bf-section-title">Get Your Cash Offer Today</h2>
        <div className="bf-section-subtitle">
          Don't leave money on the table or settle for less. Whether you're moving on or moving in, HomeSurge gives you the tools to move ahead with clarity, confidence, and real results.
        </div>
        
        <div className="bf-contact-cta">
          <button 
            className="bf-contact-submit-button"
            onClick={(e) => {
              e.preventDefault();
              console.log('Contact button clicked - scrolling to top');
              // Multiple scroll methods for maximum compatibility
              window.scrollTo(0, 0);
              document.body.scrollTop = 0;
              document.documentElement.scrollTop = 0;
            }}
          >
            GET MY CASH OFFER
          </button>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;