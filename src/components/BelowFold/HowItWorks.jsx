import React from 'react';

function HowItWorks() {
  return (
    <section className="bf-section">
      <div className="bf-container">
        <h2 className="bf-section-title">How It Works — Smarter Moves in 3 Steps</h2>
        
        <div className="bf-grid-3">
          <div className="bf-card">
            <div className="bf-step-number">1</div>
            <div className="bf-card-icon">
              🧠
            </div>
            <h3 className="bf-card-title">Scan & Analyze with AI</h3>
            <p className="bf-card-text">
              Instantly scan your property or financing details. Our AI learns your unique goals and constraints to deliver personalized insights.
            </p>
          </div>
          
          <div className="bf-card">
            <div className="bf-step-number">2</div>
            <div className="bf-card-icon">
              🎯
            </div>
            <h3 className="bf-card-title">Boost with Precision</h3>
            <p className="bf-card-text">
              Receive laser-focused recommendations to either raise your home's market value or stretch your buying power beyond expectations.
            </p>
          </div>
          
          <div className="bf-card">
            <div className="bf-step-number">3</div>
            <div className="bf-card-icon">
              🚀
            </div>
            <h3 className="bf-card-title">Surge Ahead</h3>
            <p className="bf-card-text">
              Make confident, data-driven moves that give you a competitive edge in today's dynamic real estate market.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;