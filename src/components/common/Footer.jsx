import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Privacy from './Privacy';
import AboutUs from './AboutUs';
import HowItWorks from './HowItWorks';
import Benefits from './Benefits';
import ContactUs from './ContactUs';
import '../../styles/popup.css';

function Footer() {
  const privacyRef = useRef(null);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const handlePrivacyClick = (action) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    if (action === 'privacy') {
      privacyRef.current.style.display = 'flex';
    } else if (action === 'close-privacy') {
      privacyRef.current.style.display = 'none';
    }
  };

  return (
    <div className="footer">
      {/* <div className="footer-copyright">
        All Rights Reserved © {new Date().getFullYear()} SellForCash.Online
      </div> */}

      <div className="footer-nav-container">
        <ul className="nav-links">
          <div onClick={() => handlePrivacyClick('privacy')}>
            <li className="footer-link">Privacy</li>
          </div>
          <li className="footer-link" onClick={() => setShowAboutUs(true)}>
            About
          </li>
          <li className="footer-link" onClick={() => setShowHowItWorks(true)}>
            How it Works
          </li>
          <li className="footer-link" onClick={() => setShowBenefits(true)}>
            Benefits
          </li>
          <li className="footer-link" onClick={() => setShowContact(true)}>
            Contact
          </li>
        </ul>
      </div>

      <div
        ref={privacyRef}
        style={{ display: 'none' }}
        className="privacy-container"
      >
        <Privacy handleTermsClick={handlePrivacyClick} />
      </div>

      <AboutUs isOpen={showAboutUs} onClose={() => setShowAboutUs(false)} />
      <HowItWorks isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      <Benefits isOpen={showBenefits} onClose={() => setShowBenefits(false)} />
      <ContactUs isOpen={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
}

export default Footer;