import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import AdminDashboard from '../Admin/Dashboard';
import LeadList from '../Admin/LeadList';
import LeadDetail from '../Admin/LeadDetail';
import SalesRepDashboard from '../SalesRep/Dashboard';
import Login from './Login';
import logo from '../../assets/images/homesurge.png';

// CSS for the CRM app
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    background: '#4285F4',
    color: 'white',
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4285F4',
    fontWeight: 'bold',
  },
  button: {
    padding: '6px 12px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  content: {
    flex: 1,
    padding: '20px',
  },
  nav: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  navLink: {
    padding: '8px 16px',
    background: 'white',
    color: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  activeNavLink: {
    background: '#4285F4',
    color: 'white',
  },
  footer: {
    textAlign: 'center',
    padding: '15px',
    background: '#fff',
    borderTop: '1px solid #e0e0e0',
    fontSize: '12px',
    color: '#666',
  },
  loadingMessage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    fontSize: '16px',
    color: '#666',
  },
};

const CRMApp = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleAdsPaused, setGoogleAdsPaused] = useState(false);
  const [facebookAdsPaused, setFacebookAdsPaused] = useState(false);
  const [adsPauseLoading, setAdsPauseLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user role from Firestore
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || 'sales_rep'); // Default to sales_rep if no role specified
            console.log('User role fetched:', userData.role);
          } else {
            console.warn('User document not found in Firestore');
            setUserRole('sales_rep'); // Default role
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('sales_rep'); // Default role on error
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeadId(leadId);
    setActiveView('leadDetail');
    
    // Update the URL hash for deep linking (optional)
    window.location.hash = `lead-${leadId}`;
  };
  
  // Make the handleSelectLead function available globally for navigation
  // This is a workaround for cross-component communication
  window.handleSelectLead = handleSelectLead;
  
  // Also make navigation to leads view available globally
  window.navigateToLeads = () => {
    setActiveView('leads');
    setSelectedLeadId(null);
  };

  const handleBackToLeads = () => {
    setSelectedLeadId(null);
    setActiveView('leads');
  };
  
  // Function to pause Google Ads
  const handlePauseGoogleAds = async () => {
    if (adsPauseLoading) return;
    
    try {
      setAdsPauseLoading(true);
      const response = await fetch('/api/pause-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: process.env.REACT_APP_ADS_API_KEY || 'test-api-key',
          platform: 'google'
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGoogleAdsPaused(true);
        alert('Google Ads have been paused successfully.');
      } else {
        alert(`Failed to pause Google Ads: ${result.message}`);
      }
    } catch (error) {
      console.error('Error pausing Google Ads:', error);
      alert('An error occurred while trying to pause Google Ads.');
    } finally {
      setAdsPauseLoading(false);
    }
  };
  
  // Function to pause Facebook Ads
  const handlePauseFacebookAds = async () => {
    if (adsPauseLoading) return;
    
    try {
      setAdsPauseLoading(true);
      const response = await fetch('/api/pause-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: process.env.REACT_APP_ADS_API_KEY || 'test-api-key',
          platform: 'facebook'
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFacebookAdsPaused(true);
        alert('Facebook Ads have been paused successfully.');
      } else {
        alert(`Failed to pause Facebook Ads: ${result.message}`);
      }
    } catch (error) {
      console.error('Error pausing Facebook Ads:', error);
      alert('An error occurred while trying to pause Facebook Ads.');
    } finally {
      setAdsPauseLoading(false);
    }
  };

  // If still loading auth state
  if (loading) {
    return (
      <div style={styles.loadingMessage}>
        Loading...
      </div>
    );
  }

  // If not logged in, show login screen
  if (!user) {
    return <Login />;
  }
  
  // Log the current user role for debugging
  console.log('CRMApp - User Role:', userRole);

  return (
    <div className="crm-container">
      <header className="crm-header">
        <img src={logo} alt="HomeSurge.AI" className="crm-logo" />
        <span className="crm-title-text">
          {userRole === 'admin' ? 'Admin' : 'Sales Rep'}
        </span>
        <div className="crm-user-info">
          <div className="crm-avatar">
            {user.email ? user.email[0].toUpperCase() : 'U'}
          </div>
          <button className="crm-logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      
      <div className="crm-content">
        {/* Skip navigation when viewing lead detail */}
        {activeView !== 'leadDetail' && userRole === 'admin' && (
          <nav className="crm-nav crm-main-navigation">
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`crm-nav-link crm-nav-item ${activeView === 'dashboard' ? 'crm-active-nav-link' : ''}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveView('leads')}
              className={`crm-nav-link crm-nav-item ${activeView === 'leads' ? 'crm-active-nav-link' : ''}`}
            >
              Leads
            </button>
            <button 
              onClick={handlePauseGoogleAds}
              disabled={googleAdsPaused || adsPauseLoading}
              className={`crm-ads-pause-btn ${googleAdsPaused ? 'paused' : 'active'}`}
              style={{ 
                opacity: adsPauseLoading ? 0.7 : 1,
                cursor: googleAdsPaused || adsPauseLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {googleAdsPaused ? 'Google Paused' : 'Pause Google'}
            </button>
            <button 
              onClick={handlePauseFacebookAds}
              disabled={facebookAdsPaused || adsPauseLoading}
              className={`crm-ads-pause-btn ${facebookAdsPaused ? 'paused' : 'active'}`}
              style={{ 
                opacity: adsPauseLoading ? 0.7 : 1,
                cursor: facebookAdsPaused || adsPauseLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {facebookAdsPaused ? 'Facebook Paused' : 'Pause Facebook'}
            </button>
          </nav>
        )}
        
        {/* Render different dashboard based on user role */}
        {activeView === 'dashboard' && userRole === 'admin' && (
          <AdminDashboard />
        )}
        
        {activeView === 'dashboard' && userRole === 'sales_rep' && (
          <SalesRepDashboard />
        )}
        
        {activeView === 'leads' && userRole === 'admin' && (
          <LeadList onSelectLead={handleSelectLead} />
        )}
        
        {activeView === 'leadDetail' && selectedLeadId && (
          <LeadDetail 
            leadId={selectedLeadId} 
            onBack={userRole === 'admin' ? handleBackToLeads : () => setActiveView('dashboard')}
            isAdmin={userRole === 'admin'}
          />
        )}
      </div>
      
      <footer className="crm-footer">
        © {new Date().getFullYear()} HomeSurge.AI CRM | Firebase Edition
      </footer>
    </div>
  );
};

export default CRMApp;