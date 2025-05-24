import React from 'react';

function WhoItsFor() {
  return (
    <section className="bf-section">
      <div className="bf-container">
        <h2 className="bf-section-title">Whether You're Selling or Buying — We've Got You</h2>
        
        <div className="bf-split-layout">
          <div className="bf-card">
            <div className="bf-card-icon">🏡</div>
            <h3 className="bf-card-title">For Sellers</h3>
            <div className="bf-image-placeholder">
              [Happy Seller with Sold Sign]
            </div>
            <ul className="bf-feature-list">
              <li className="bf-feature-item">Want top dollar without over-improving?</li>
              <li className="bf-feature-item">Unsure which upgrades buyers actually want?</li>
              <li className="bf-feature-item">Planning to sell within 3-12 months?</li>
              <li className="bf-feature-item">Need data-driven renovation guidance?</li>
            </ul>
            <button className="bf-button">Start with ValueBoost 🚀</button>
          </div>
          
          <div className="bf-card">
            <div className="bf-card-icon">🏠</div>
            <h3 className="bf-card-title">For Buyers</h3>
            <div className="bf-image-placeholder">
              [Happy Family with House Keys]
            </div>
            <ul className="bf-feature-list">
              <li className="bf-feature-item">Losing out on homes you love?</li>
              <li className="bf-feature-item">Unsure how far your budget can really stretch?</li>
              <li className="bf-feature-item">Want confidence in your next offer?</li>
              <li className="bf-feature-item">Need strategic financing insights?</li>
            </ul>
            <button className="bf-button">Start with OfferBoost 💡</button>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="bf-button-secondary">Try the Tool That's Right for You</button>
        </div>
      </div>
    </section>
  );
}

export default WhoItsFor;