import React from 'react';
import Popup from './Popup';

function ContactUs({ isOpen, onClose }) {
  return (
    <Popup isOpen={isOpen} onClose={onClose} title="CONTACT US">
      <div className="contact-us-content">
        <p>
          We're here to help with all your home selling needs. Whether you have questions
          about our process, want to get a cash offer, or need assistance with any aspect
          of selling your home, our team is ready to assist you.
        </p>
        
        <h3>Get in Touch</h3>
        <p><strong>Phone:</strong> 770-765-7969</p>
        <p><strong>Email:</strong> contact@SellForCash.Online</p>
        
        <p>
          Our team is available to answer your calls and emails promptly. We understand
          that selling your home is a big decision, and we're committed to making the
          process as smooth and stress-free as possible.
        </p>
        
        <h3>How We Can Help</h3>
        <p>We can assist you with:</p>
        <p>• Getting a cash offer for your home</p>
        <p>• Discussing your selling timeline</p>
        <p>• Answering questions about our buying process</p>
        <p>• Providing information about closing and paperwork</p>
        <p>• Assisting with moving and relocation</p>
        
        <p>
          Fill out the form on our website or give us a call today to get started!
        </p>
      </div>
    </Popup>
  );
}

export default ContactUs;