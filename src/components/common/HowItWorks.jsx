import React from 'react';
import Popup from './Popup';

function HowItWorks({ isOpen, onClose }) {
  return (
    <Popup isOpen={isOpen} onClose={onClose} title="HOW IT WORKS">
      <div className="how-it-works-content">
        <div className="how-it-works-step">
          <span className="step-number">1.</span>
          <span className="step-title">Enter Your Address</span>
          <p>
            Enter your address in the form to get started. Our AI instantly analyzes
            your property and provides an accurate market valuation. We'll ask you a
            few questions about your house to refine your offer.
          </p>
        </div>
        
        <div className="how-it-works-step">
          <span className="step-number">2.</span>
          <span className="step-title">Get Your AI-Powered Offer</span>
          <p>
            Receive your AI-generated cash offer instantly, refined by our
            expert team within 24 hours. If you accept the offer, we'll set up a closing to
            complete the transaction. It's that easy!
          </p>
        </div>
        
        <div className="how-it-works-step">
          <span className="step-number">3.</span>
          <span className="step-title">Close Quickly</span>
          <p>
            Tired of waiting months to sell your house? We can close in as
            little as 7 days from the date you accept our offer. We can
            even help you with moving and relocation services!
          </p>
        </div>
        
        <p className="summary-text">
          At HomeSurge.AI we want to take the stress out of selling with AI-powered accuracy.
        </p>
      </div>
    </Popup>
  );
}

export default HowItWorks;