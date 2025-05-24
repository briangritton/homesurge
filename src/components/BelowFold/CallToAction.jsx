import React from 'react';

function CallToAction() {
  return (
    <section className="bf-section">
      <div className="bf-container">
        <div className="bf-cta-section">
          <h2 className="bf-cta-title">Your Next Move Starts With Intelligence</h2>
          <p className="bf-cta-text">
            Don't leave money on the table or settle for less. Whether you're moving on or moving in, HomeSurge gives you the tools to surge ahead with clarity, confidence, and real results.
          </p>
          <div className="bf-cta-buttons">
            <button className="bf-cta-button">🚀 Start with ValueBoost</button>
            <button className="bf-cta-button">💡 Start with OfferBoost</button>
          </div>
        </div>
        
        <div className="bf-image-placeholder" style={{ margin: '40px 0' }}>
          [Success Illustration - Person with Key/House/Growth Chart]
        </div>
      </div>
    </section>
  );
}

export default CallToAction;