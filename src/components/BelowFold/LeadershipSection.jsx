import React from 'react';
import LazyImage from '../common/LazyImage';
import myfamilyImage from '../../assets/images/myfamily.jpg';

function LeadershipSection() {
  return (
    <section className="bf-section bf-leadership">
      <div className="bf-container">
        <h2 className="bf-section-title">About HomeSurge Home Services</h2>
        
        <div className="bf-section-subtitle">
          Selling a home can be tough, especially if you are under financial pressure when making the decision. That's why at HomeSurge, we pride ourselves 
          on doing everythng we can to make sure every home selling experience is as stress free and financially beneficial for the home seller as possible. Our absolute
          priority is helping every home seller, in every possible situation have the best possible home selling experience. <br></br><br></br> Whether you are facing financial issues, relocation
          timelines, or any other life event that is making a home sale necessary, we're confident we can help. 
          With years of experience in real estate innovation and cutting-edge AI, HomeSurge ensures a fast, smart, and seamless experience for sellers and buyers alike. If you're looking for an incredible offer on  your home and a stress free experience, you've come to the right place.
        </div>

        <div className="bf-leadership-image">
          <LazyImage src={myfamilyImage} alt="HomeSurge Family" className="bf-family-photo" />
        </div>

        <button 
          className="vb-af-contact-button vb-af-button-flare bf-leadership-cta"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          GET CASH OFFER
        </button>
      </div>
    </section>
  );
}

export default LeadershipSection;