import React from 'react';
import Popup from './Popup';

function AboutUs({ isOpen, onClose }) {
  return (
    <Popup isOpen={isOpen} onClose={onClose} title="ABOUT US">
      <div className="about-us-content">
        <p>
          At Sell For Cash Online, we've simplified and streamlined the
          home selling process. No more realtor meetings, repairs,
          endless costs, or complicated closings. We pride ourselves in
          providing great cash offers to anyone looking to get out of
          their house as quickly or as easily as possible. No matter
          what condition your house is in or what your timeline is, we
          can help!
        </p>
        <p>
          Sell For Cash Online is a family run business that
          started in Atlanta, GA, and has expanded nationwide. Our
          absolute priority is giving our clients an excellent home
          selling experience, no matter the timeline or condition of the
          home. Reach out to us, we'd love to help in any way we can!
        </p>
      </div>
    </Popup>
  );
}

export default AboutUs;