import React from 'react';

function AITools() {
  return (
    <section className="bf-section bf-section-alt">
      <div className="bf-container">
        <h2 className="bf-section-title">Meet the Tools Fueling Your Home Surge</h2>
        
        <div className="bf-split-layout">
          <div className="bf-tool-card">
            <div className="bf-tool-title">🏡 ValueBoost™</div>
            <div className="bf-tool-subtitle">AI-Driven Value Enhancement Plan</div>
            <div className="bf-image-placeholder">
              [ValueBoost Dashboard Screenshot]
            </div>
            <ul className="bf-feature-list">
              <li className="bf-feature-item">Analyze your home's features, location, and market conditions</li>
              <li className="bf-feature-item">AI pinpoints undervalued features and ROI-positive upgrades</li>
              <li className="bf-feature-item">Cost-effective renovation suggestions with timeline optimization</li>
              <li className="bf-feature-item">Predictive pricing: Know exactly how much your value will increase</li>
            </ul>
            <button className="bf-button">Try ValueBoost</button>
          </div>
          
          <div className="bf-tool-card">
            <div className="bf-tool-title">🏠 OfferBoost™</div>
            <div className="bf-tool-subtitle">Smart Offer & Purchase Power Amplifier</div>
            <div className="bf-image-placeholder">
              [OfferBoost Interface Screenshot]
            </div>
            <ul className="bf-feature-list">
              <li className="bf-feature-item">Analyze your budget, mortgage options, and local market trends</li>
              <li className="bf-feature-item">AI suggests the most efficient loan and payment structures</li>
              <li className="bf-feature-item">Smart offer strategy with AI-generated acceptance scoring</li>
              <li className="bf-feature-item">Uncover seller concessions, grants, and creative financing tools</li>
            </ul>
            <button className="bf-button">Try OfferBoost</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AITools;