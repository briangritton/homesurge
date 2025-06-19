import React from 'react';
import LazyImage from '../common/LazyImage';
import familywalkImage from '../../assets/images/familywalkblackwhite.webp';
import familywalkImageFallback from '../../assets/images/familywalkblackwhite.png';

function HowItWorks() {
  return (
    <section className="bf-section">
      <div className="bf-container">
        <h2 className="bf-section-title">We Take the Stress Out of Selling Your Home</h2>
        
        <div className="bf-how-it-works-image">
          <picture>
            <source srcSet={familywalkImage} type="image/webp" />
            <LazyImage src={familywalkImageFallback} alt="Family Walking" className="bf-familywalk-photo" />
          </picture>
        </div>
        
        <div className="bf-grid-3">
          <div className="bf-card">
            <div className="bf-step-number-left">1</div>
            <div className="bf-card-icon">
              🧠
            </div>
            <h3 className="bf-card-title">Enter Your Street Address</h3>
            <p className="bf-card-text">
              We'll get some basic details about your home and perform an AI assisted scan to generate our highest possible cash offer!
            </p>
          </div>
          
          <div className="bf-card">
            <div className="bf-step-number-left">2</div>
            <div className="bf-card-icon">
              🎯
            </div>
            <h3 className="bf-card-title">Get Our Highest Offer</h3>
            <p className="bf-card-text">
Once we process your property details, our experts will contact you to make you an offer that day!            </p>
          </div>
          
          <div className="bf-card">
            <div className="bf-step-number-left">3</div>
            <div className="bf-card-icon">
              🚀
            </div>
            <h3 className="bf-card-title">Choose When to Close</h3>
            <p className="bf-card-text">
              Once we have an offer agreement, we'll set a closing date. Upon closing, we'll send you the full offer
              amount that day!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;