import React, { useState } from 'react';
import { createUser } from '../../services/firebase';

const styles = {
  formContainer: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    color: '#333',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    background: 'white',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  button: {
    padding: '10px 20px',
    background: '#2e7b7d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    color: 'red',
    marginTop: '20px',
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginTop: '20px',
    textAlign: 'center',
  },
  phoneInfo: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px',
  },
  required: {
    color: 'red',
    marginLeft: '3px',
  }
};

const UserForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'sales_rep',
    active: true, // Always set new users as active by default
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    // Clear previous errors
    setError(null);
    
    // Check for required fields
    if (!formData.email || !formData.password || !formData.name) {
      setError('Please fill in all required fields');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password length check
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    // Password match check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Phone number format (if provided)
    if (formData.phone) {
      // Simple regex for U.S. phone format
      const phoneRegex = /^\+?1?\d{10,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
        setError('Please enter a valid phone number');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Format phone number (ensure it has country code for Twilio)
      let formattedPhone = formData.phone.replace(/\D/g, '');
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        // Add US country code if not present
        formattedPhone = formattedPhone.startsWith('1') 
          ? `+${formattedPhone}` 
          : `+1${formattedPhone}`;
      }
      
      // Create user in Firebase
      await createUser(
        formData.email,
        formData.password,
        formData.name,
        formattedPhone,
        formData.role
      );
      
      // Show success message
      setSuccess(true);
      
      // Reset form after success
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        role: 'sales_rep',
      });
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Error creating user:', err);
      
      // Parse Firebase error messages
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use. Please try a different email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError('Failed to create user. Please try again.');
      }
    }
  };
  
  return (
    <div style={styles.formContainer}>
      <h2 style={styles.title}>Add New User</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Email<span style={styles.required}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="user@example.com"
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Password<span style={styles.required}>*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="••••••••"
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Confirm Password<span style={styles.required}>*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="••••••••"
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Full Name<span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="John Doe"
            required
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Phone Number<span style={styles.required}>*</span> (for WhatsApp notifications)
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="+1 (555) 123-4567"
            required
          />
          <div style={styles.phoneInfo}>
            Phone number must have WhatsApp installed and include country code (e.g., +1 for US)
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            style={styles.select}
          >
            <option value="sales_rep">Sales Representative</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        
        <div style={styles.buttonRow}>
          <button 
            type="button" 
            style={styles.cancelButton}
            onClick={onComplete}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
      
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>User created successfully!</div>}
    </div>
  );
};

export default UserForm;