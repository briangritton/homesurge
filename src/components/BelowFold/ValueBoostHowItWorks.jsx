import React from 'react';

function ValueBoostHowItWorks() {
  return (
    <section className="bf-section">
      <div className="bf-container">
        <h2 className="bf-section-title">ValueBoost™ — Precision Home Value Enhancement</h2>
        <div className="bf-section-subtitle">
          Our AI analyzes millions of data points to identify exactly which improvements will maximize your home's market value
        </div>
        
        <div className="bf-process-grid">
          <div className="bf-process-card">
            <div className="bf-process-number">01</div>
            <div className="bf-process-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <h3 className="bf-process-title">Property Deep Scan</h3>
            <p className="bf-process-text">
              Enter your address and our AI instantly analyzes your property's features, location data, neighborhood comps, and market positioning to establish your baseline value.
            </p>
          </div>
          
          <div className="bf-process-card">
            <div className="bf-process-number">02</div>
            <div className="bf-process-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>
            </div>
            <h3 className="bf-process-title">AI Value Analysis</h3>
            <p className="bf-process-text">
              Our algorithm identifies undervalued features and calculates ROI for potential improvements, comparing against 10+ years of regional sales data and current market trends.
            </p>
          </div>
          
          <div className="bf-process-card">
            <div className="bf-process-number">03</div>
            <div className="bf-process-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
            <h3 className="bf-process-title">Precision Recommendations</h3>
            <p className="bf-process-text">
              Receive a prioritized list of value-boosting improvements with exact cost estimates, ROI projections, and timeline optimization tailored to your local market.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueBoostHowItWorks;