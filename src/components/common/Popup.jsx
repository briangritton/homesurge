import React from 'react';

function Popup({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <h2>{title}</h2>
          <button className="popup-close-button" onClick={onClose}>
            CLOSE X
          </button>
        </div>
        <div className="popup-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Popup;