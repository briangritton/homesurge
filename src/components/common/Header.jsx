import React from 'react';
import { BsTelephoneFill } from 'react-icons/bs';
import logo from '../../../src/assets/images/homesurge.png';

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} className="header-logo" alt="HomeSurge.AI" />
      </div>

      <a href="tel:+18888743302">
        <div className="header-right">
          <div className="number-positioner">
            <div className="header-phone-icon">
              <BsTelephoneFill />
            </div>
            <div className="header-call-number">(888) 874-3302</div>
          </div>
        </div>
      </a>
    </header>
  );
}

export default Header;