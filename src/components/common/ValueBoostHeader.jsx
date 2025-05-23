import React from 'react';
import { BsTelephoneFill } from 'react-icons/bs';
import gradientArrowSmall from '../../assets/images/gradient-arrow-small.png';

function ValueBoostHeader() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="valueboost-logo">
          <div className="valueboost-text">
            <span className="valueboost-brand">ValueBoost</span>
          </div>
          <div className="valueboost-gradient-image">
            <img 
              src={gradientArrowSmall} 
              alt="ValueBoost gradient arrow" 
              style={{
                height: '20px',
                width: 'auto',
                marginLeft: '4px',
                verticalAlign: 'middle'
              }}
            />
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