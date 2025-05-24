import React from 'react';

function LeadershipSection() {
  return (
    <section className="bf-section bf-leadership">
      <div className="bf-container">
        <h2 className="bf-section-title">Leading the AI Revolution in Home Buying & Selling</h2>
        
        <div className="bf-section-subtitle">
          With years of experience in real estate innovation and cutting-edge AI, HomeSurge ensures a fast, smart, and seamless experience for sellers and buyers alike. Whether you're optimizing your home's value or making your best offer, our AI-powered tools simplify the journey.
        </div>
        
        <div className="bf-stats-grid">
          <div className="bf-stat-card">
            <div className="bf-stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="bf-stat-number">100%</div>
            <div className="bf-stat-label">Customer Satisfaction</div>
            <div className="bf-stat-description">Reported improved clarity and confidence</div>
          </div>
          
          <div className="bf-stat-card">
            <div className="bf-stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H18V0h-2v2H8V0H6v2H3.5C2.66 2 2 2.66 2 3.5v16C2 20.34 2.66 21 3.5 21h17c.84 0 1.5-.66 1.5-1.5v-16C22 2.66 21.34 2 20.5 2z"/>
              </svg>
            </div>
            <div className="bf-stat-number">80%</div>
            <div className="bf-stat-label">Deals Closed in Under 14 Days</div>
            <div className="bf-stat-description">When using ValueBoost recommendations</div>
          </div>
          
          <div className="bf-stat-card">
            <div className="bf-stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 15h2c0 1.08 1.37 2 3 2s3-.92 3-2c0-1.1-1.04-1.5-3.24-2.03C9.64 12.44 7 11.78 7 9c0-1.79 1.47-3.31 3.5-3.82V3h3v2.18C15.53 5.69 17 7.21 17 9h-2c0-1.08-1.37-2-3-2s-3 .92-3 2c0 1.1 1.04 1.5 3.24 2.03C14.36 11.56 17 12.22 17 15c0 1.79-1.47 3.31-3.5 3.82V21h-3v-2.18C8.47 18.31 7 16.79 7 15z"/>
              </svg>
            </div>
            <div className="bf-stat-number">$50K+</div>
            <div className="bf-stat-label">Average Cash Value Unlocked</div>
            <div className="bf-stat-description">In added equity or purchasing leverage</div>
          </div>
        </div>
        
        <div className="bf-cta-prompt">
          <p>Fill out our quick form or start your AI scan now to see the difference.</p>
          <button className="bf-button">Get Started Now</button>
        </div>
      </div>
    </section>
  );
}

export default LeadershipSection;