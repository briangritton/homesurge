import React from 'react';

function WeBuyHomes() {
  return (
    <section className="bf-section bf-we-buy">
      <div className="bf-container">
        <h2 className="bf-section-title">We'll Buy Almost Anything!</h2>
        <div className="bf-section-subtitle">
          Our advanced AI systems and in-depth tools mean we can see the beauty in almost any property, no matter what the condition. Where others see problems, we see potential.
        </div>
        
        <div className="bf-property-types">
          <div className="bf-property-grid">
            <div className="bf-property-item">
              <div className="bf-property-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <span>Fixer-Uppers</span>
            </div>
            
            <div className="bf-property-item">
              <div className="bf-property-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 7h-1V6a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-1h1a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM6 4h8a2 2 0 0 1 2 2v1H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
                </svg>
              </div>
              <span>Distressed Properties</span>
            </div>
            
            <div className="bf-property-item">
              <div className="bf-property-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span>Move-In Ready</span>
            </div>
            
            <div className="bf-property-item">
              <div className="bf-property-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span>Inherited Homes</span>
            </div>
            
            <div className="bf-property-item">
              <div className="bf-property-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
              </div>
              <span>Unique Properties</span>
            </div>
            
            <div className="bf-property-item">
              <div className="bf-property-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <span>Any Location</span>
            </div>
          </div>
        </div>
        
        <div className="bf-buy-benefits">
          <div className="bf-benefit-grid">
            <div className="bf-benefit-item">
              <div className="bf-benefit-icon">⚡</div>
              <h4>Fast Cash Offers</h4>
              <p>Get a competitive cash offer in 24 hours or less</p>
            </div>
            
            <div className="bf-benefit-item">
              <div className="bf-benefit-icon">🏠</div>
              <h4>As-Is Condition</h4>
              <p>No repairs, cleaning, or staging required</p>
            </div>
            
            <div className="bf-benefit-item">
              <div className="bf-benefit-icon">📋</div>
              <h4>No Fees or Commissions</h4>
              <p>Keep more money in your pocket</p>
            </div>
            
            <div className="bf-benefit-item">
              <div className="bf-benefit-icon">🗓️</div>
              <h4>Flexible Closing</h4>
              <p>Close on your timeline, as fast as 7 days</p>
            </div>
          </div>
        </div>
        
        <div className="bf-cta-prompt">
          <button className="bf-button">Get My Cash Offer</button>
        </div>
      </div>
    </section>
  );
}

export default WeBuyHomes;