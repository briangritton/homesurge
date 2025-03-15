import React from 'react';
import { BsTelephoneFill } from '../../../node_modules/react-icons/bs';
import logo from '../../../src/assets/images/logo.png';

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} className="header-logo" alt="logo" />
        <div className="header-logo-text">SELL FOR CASH</div>
      </div>

      <a href="tel:+17707657969">
        <div className="header-right">
          <div className="number-positioner">
            <div className="header-phone-icon">
              <BsTelephoneFill />
            </div>
            <div className="header-call-number">770-765-7969</div>
          </div>
        </div>
      </a>
    </header>
  );
}

export default Header;