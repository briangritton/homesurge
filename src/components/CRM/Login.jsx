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
    background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
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
    background: '#4285F4',
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
    background: '#3367D6',
  },
  error: {
    backgroundColor: '#FFEBEE',
    color: '#D32F2F',
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
    color: '#4285F4',
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
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>SellForCash CRM</h1>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
            <div style={styles.forgotPassword}>
              <a 
                style={styles.link} 
                onClick={() => alert('Password reset functionality would be implemented here.')}
              >
                Forgot Password?
              </a>
            </div>
          </div>
          
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(buttonHover ? styles.buttonHover : {}),
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div style={styles.devMessage}>
          <p><strong>Development Environment Notice:</strong></p>
          <p>This login screen connects to Firebase Authentication. You will need to create users in the Firebase Console before you can log in.</p>
          <p>See the FIREBASE_SETUP.md file for instructions on creating your first admin user.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;