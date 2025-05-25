import React from 'react';
import Popup from './Popup';

function AboutUs({ isOpen, onClose }) {
  return (
    <Popup isOpen={isOpen} onClose={onClose} title="ABOUT US">
      <div className="about-us-content">
        <p>
          At HomeSurge.AI, we've revolutionized the home selling process with
          AI-powered property valuations and instant cash offers. No more realtor meetings, repairs,
          endless costs, or complicated closings. We pride ourselves in
          providing accurate market valuations and competitive cash offers to anyone looking to get out of
          their house as quickly or as easily as possible. No matter
          what condition your house is in or what your timeline is, we
          can help!
        </p>
        <p>
          HomeSurge.AI is a technology-driven real estate company that
          started in Atlanta, GA, and has expanded nationwide. Our
          absolute priority is giving our clients accurate AI-powered valuations and an excellent home
          selling experience, no matter the timeline or condition of the
          home. Reach out to us, we'd love to help in any way we can!
        </p>
      </div>
    </Popup>
  );
}

export default AboutUs;