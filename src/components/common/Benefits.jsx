import React from 'react';
import Popup from './Popup';

function Benefits({ isOpen, onClose }) {
  return (
    <Popup isOpen={isOpen} onClose={onClose} title="BENEFITS">
      <div className="benefits-content">
        <div className="benefits-point">
          <span className="benefit-number">1.</span>
          <span className="benefit-title">No Repairs, Closing Costs, or Time Consuming Listings</span>
          <p>
            We'll make you a cash offer for your house "as is" within 24
            hours. No contingencies, repairs, or listing prep necessary.
            You can receive cash for your home in as little as 14 days.
          </p>
        </div>
        
        <div className="benefits-point">
          <span className="benefit-number">2.</span>
          <span className="benefit-title">Quick Transactions</span>
          <p>
            No more waiting for buyers to get approved for financing. We
            have the cash to buy your house without any need for loan
            approval or any other time consuming processes.
          </p>
        </div>
        
        <div className="benefits-point">
          <span className="benefit-number">3.</span>
          <span className="benefit-title">Packing, Moving, and Relocation Assistance</span>
          <p>
            Not only will we buy your house, but we can also help you with
            the moving process. We can help you pack, move, and even help
            you find a new place, whether you plan on buying or renting.
          </p>
        </div>
        
        <p className="summary-text">
          Choosing Sell For Cash Online means selling your house fast and
          for a great price, without the hassle.
        </p>
      </div>
    </Popup>
  );
}

export default Benefits;