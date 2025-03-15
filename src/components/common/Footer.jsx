import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import Privacy from './Privacy';

function Footer() {
  const privacyRef = useRef(null);

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
      <div className="footer-copyright">
        All Rights Reserved © {new Date().getFullYear()} SellForCash.Online
      </div>

      <div className="footer-nav-container">
        <ul className="nav-links">
          <div onClick={() => handlePrivacyClick('privacy')}>
            <li>Privacy Policy</li>
          </div>
          <li>
            <a href="#about">About Us</a>
          </li>
          <li>
            <a href="#how-it-works">How it Works</a>
          </li>
          <li>
            <a href="#benefits">Benefits</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
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
    </div>
  );
}

export default Footer;