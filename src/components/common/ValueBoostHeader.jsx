import React from 'react';
import { BsTelephoneFill } from 'react-icons/bs';

function ValueBoostHeader() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="valueboost-logo">
          <div className="valueboost-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Lightning/Arrow combination */}
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#00b8e6'}} />
                  <stop offset="100%" style={{stopColor: '#236b6d'}} />
                </linearGradient>
              </defs>
              
              {/* Upward arrow shaft */}
              <path d="M22 40 L22 12 L26 12 L26 40 Z" fill="url(#logoGradient)" />
              
              {/* Arrow head */}
              <path d="M14 20 L24 8 L34 20 L29 20 L24 15 L19 20 Z" fill="url(#logoGradient)" />
              
              {/* Lightning zigzag overlay */}
              <path d="M28 16 L32 24 L28 24 L30 32 L26 24 L30 24 L28 16 Z" fill="url(#logoGradient)" opacity="0.8" />
              
              {/* Subtle glow effect */}
              <circle cx="24" cy="24" r="20" fill="none" stroke="url(#logoGradient)" strokeWidth="1" opacity="0.3" />
            </svg>
          </div>
          <div className="valueboost-text">
            <span className="valueboost-brand">VALUE</span>
            <span className="valueboost-boost">BOOST</span>
          </div>
        </div>
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

export default ValueBoostHeader;