import React from 'react';
import LazyImage from '../common/LazyImage';
import myfamilyImageWebP from '../../assets/images/myfamilyblackwhite.webp';
import myfamilyImagePng from '../../assets/images/myfamilyblackwhite.png';

function LeadershipSection() {
  return (
    <section className="bf-section bf-leadership">
      <div className="bf-container">
        <div className="bf-leadership-header">
          <h2 className="bf-section-title">About HomeSurge Real Estate</h2>
        </div>
        
        <div className="bf-leadership-columns">
          <div className="bf-leadership-content">
            <div className="bf-section-subtitle">
              Selling a home can be tough, especially if you are under financial pressure when making the decision. That's why at HomeSurge, we pride ourselves 
              on doing everythng we can to make sure every home selling experience is as stress free and financially beneficial for the home seller as possible. Our absolute
              priority is helping every home seller, in every possible situation have the best possible home selling experience. <br></br><br></br> Whether you are facing financial issues, relocation
              timelines, or any other life event that is making a home sale necessary, we're confident we can help. 
              With years of experience in real estate innovation and cutting-edge AI, HomeSurge ensures a fast, smart, and seamless experience for sellers and buyers alike. If you're looking for an incredible offer on  your home and a stress free experience, you've come to the right place.
            </div>
          </div>
          
          <div className="bf-leadership-image">
            <picture className="bf-family-photo">
              <source srcSet={myfamilyImageWebP} type="image/webp" />
              <LazyImage src={myfamilyImagePng} alt="HomeSurge Family" className="bf-family-photo" />
            </picture>
          </div>
        </div>

        <div className="bf-leadership-footer">
          <button 
            className="vb-af-contact-button vb-af-button-flare bf-leadership-cta"
            onClick={(e) => {
              e.preventDefault();
              console.log('Leadership contact button clicked!');
              // Multiple scroll methods for maximum compatibility
              window.scrollTo(0, 0);
              document.body.scrollTop = 0;
              document.documentElement.scrollTop = 0;
            }}
          >
            GET CASH OFFER
          </button>
        </div>
      </div>
    </section>
  );
}

export default LeadershipSection;