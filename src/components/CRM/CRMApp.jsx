import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import AdminDashboard from '../Admin/Dashboard';
import LeadList from '../Admin/LeadList';
import LeadDetail from '../Admin/LeadDetail';
import SalesRepDashboard from '../SalesRep/Dashboard';
import Login from './Login';

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
  };
  
  // Make the handleSelectLead function available globally for navigation
  // This is a workaround for cross-component communication
  window.handleSelectLead = handleSelectLead;

  const handleBackToLeads = () => {
    setSelectedLeadId(null);
    setActiveView('leads');
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
        <h1 className="crm-title">
          SellForCash CRM {userRole === 'admin' ? '(Admin)' : '(Sales Rep)'}
        </h1>
        <div className="crm-user-info">
          <div className="crm-avatar">
            {user.email ? user.email[0].toUpperCase() : 'U'}
          </div>
          <span>{user.email}</span>
          <button className="crm-header-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      
      <div className="crm-content">
        {/* Skip navigation when viewing lead detail */}
        {activeView !== 'leadDetail' && userRole === 'admin' && (
          <nav className="crm-nav">
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`crm-nav-link ${activeView === 'dashboard' ? 'crm-active-nav-link' : ''}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveView('leads')}
              className={`crm-nav-link ${activeView === 'leads' ? 'crm-active-nav-link' : ''}`}
            >
              Leads
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
        © {new Date().getFullYear()} SellForCash CRM | Firebase Edition
      </footer>
    </div>
  );
};

export default CRMApp;