import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// CSS for the login page
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #2e7b7d 0%, #1e5253 100%)',
    padding: '20px',
  },
  formContainer: {
    background: 'white',
    borderRadius: '8px',
    padding: '30px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    marginBottom: '30px',
    width: '180px',
    alignSelf: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    color: '#555',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: '#2e7b7d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s',
    marginTop: '20px',
  },
  buttonHover: {
    background: '#1e5253',
  },
  error: {
    backgroundColor: '#FFEBEE',
    color: '#2e7b7d',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  footer: {
    marginTop: '30px',
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
  },
  devMessage: {
    marginTop: '20px',
    padding: '10px',
    background: 'rgba(0,0,0,0.05)',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#555',
  },
  forgotPassword: {
    textAlign: 'right',
    fontSize: '14px',
    marginTop: '5px',
  },
  link: {
    color: '#2e7b7d',
    textDecoration: 'none',
    cursor: 'pointer',
  },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      
      // Auth state listener in parent component will handle successful login
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="crm-login-container">
      <div className="crm-form-container">
        <h1 className="crm-login-title">SellForCash CRM</h1>
        
        {error && <div className="crm-error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="crm-form-group">
            <label className="crm-login-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="crm-login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>
          
          <div className="crm-form-group">
            <label className="crm-login-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="crm-login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
            <div className="crm-forgot-password">
              <a 
                className="crm-link" 
                onClick={() => alert('Password reset functionality would be implemented here.')}
              >
                Forgot Password?
              </a>
            </div>
          </div>
          
          <button
            type="submit"
            className="crm-login-button"
            disabled={loading}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="crm-dev-message">
          <p><strong>Development Environment Notice:</strong></p>
          <p>This login screen connects to Firebase Authentication. You will need to create users in the Firebase Console before you can log in.</p>
          <p>See the FIREBASE_SETUP.md file for instructions on creating your first admin user.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;