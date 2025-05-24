import React from 'react';

function Results() {
  const testimonials = [
    {
      text: "ValueBoost helped me add $42k in value with under $8k in upgrades. The AI recommendations were spot-on!",
      author: "Sarah M., Atlanta"
    },
    {
      text: "OfferBoost showed me how to outbid without overpaying. We got the house of our dreams!",
      author: "Mike & Jennifer T., Denver"
    },
    {
      text: "HomeSurge's AI thought of things my agent didn't. Game-changing insights.",
      author: "David L., Seattle"
    }
  ];

  return (
    <section className="bf-section">
      <div className="bf-container">
        <h2 className="bf-section-title">The AI Edge: Real People. Real Gains.</h2>
        
        <div className="bf-grid-3">
          <div className="bf-stat">
            <span className="bf-stat-number">$42K</span>
            <span className="bf-stat-label">Average Value Increase</span>
          </div>
          <div className="bf-stat">
            <span className="bf-stat-number">87%</span>
            <span className="bf-stat-label">Offer Success Rate</span>
          </div>
          <div className="bf-stat">
            <span className="bf-stat-number">15</span>
            <span className="bf-stat-label">Days Faster Sales</span>
          </div>
        </div>
        
        <div className="bf-image-placeholder" style={{ margin: '40px 0' }}>
          [Before/After Property Value Comparison Chart]
        </div>
        
        <div className="bf-grid-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bf-testimonial">
              <p className="bf-testimonial-text">{testimonial.text}</p>
              <div className="bf-testimonial-author">— {testimonial.author}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Results;