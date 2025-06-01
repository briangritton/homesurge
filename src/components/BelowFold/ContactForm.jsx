import React, { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Phone validation function
  const validateAndCleanPhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length === 10) {
      const formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
      return { isValid: true, cleaned: formatted };
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      const withoutCountryCode = digitsOnly.slice(1);
      const formatted = `(${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(3, 6)}-${withoutCountryCode.slice(6)}`;
      return { isValid: true, cleaned: formatted };
    }
    
    return { isValid: false, cleaned: phone };
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      const phoneValidation = validateAndCleanPhone(formData.phone);
      if (!phoneValidation.isValid) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Clean the phone number
      const phoneValidation = validateAndCleanPhone(formData.phone);
      const cleanedPhone = phoneValidation.isValid ? phoneValidation.cleaned : formData.phone;
      
      // Here you would integrate with your existing lead submission system
      console.log('Contact form submitted:', {
        ...formData,
        phone: cleanedPhone
      });
      
      setSubmitted(true);
      setIsSubmitting(false);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: ''
        });
        setSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setIsSubmitting(false);
      setFormErrors({ submit: 'Failed to submit your information. Please try again.' });
    }
  };

  if (submitted) {
    return (
      <section className="bf-section bf-contact-form">
        <div className="bf-container">
          <div className="bf-contact-success">
            <h2 className="bf-section-title">Thank You!</h2>
            <p className="bf-success-message">
              We've received your information and will contact you shortly with your cash offer details.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bf-section bf-contact-form">
      <div className="bf-container">
        <h2 className="bf-section-title">Get Your Cash Offer Today</h2>
        <div className="bf-section-subtitle">
Don't leave money on the table or settle for less. Whether you're moving on or moving in, HomeSurge gives you the tools to move ahead with clarity, confidence, and real results.        </div>
        
        <div className="bf-contact-form-container">
          <form onSubmit={handleSubmit} className="bf-contact-form-fields">
            <div className="bf-form-row">
              <div className="bf-form-field">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className={`bf-form-input ${formErrors.name ? 'bf-form-input-error' : ''}`}
                />
                {formErrors.name && (
                  <div className="bf-form-error">{formErrors.name}</div>
                )}
              </div>
              
              <div className="bf-form-field">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className={`bf-form-input ${formErrors.phone ? 'bf-form-input-error' : ''}`}
                />
                {formErrors.phone && (
                  <div className="bf-form-error">{formErrors.phone}</div>
                )}
              </div>
            </div>
            
            <div className="bf-form-row">
              <div className="bf-form-field">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className={`bf-form-input ${formErrors.email ? 'bf-form-input-error' : ''}`}
                />
                {formErrors.email && (
                  <div className="bf-form-error">{formErrors.email}</div>
                )}
              </div>
              
              <div className="bf-form-field">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Property Address"
                  className={`bf-form-input ${formErrors.address ? 'bf-form-input-error' : ''}`}
                />
                {formErrors.address && (
                  <div className="bf-form-error">{formErrors.address}</div>
                )}
              </div>
            </div>
            
            {formErrors.submit && (
              <div className="bf-form-error bf-form-error-general">
                {formErrors.submit}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="bf-contact-submit-button"
            >
              {isSubmitting ? 'Submitting...' : 'GET MY CASH OFFER'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;