import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

const styles = {
  container: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  description: {
    fontSize: '12px', 
    color: '#666',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
  },
  switchContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  switchLabel: {
    marginLeft: '10px',
    fontSize: '14px',
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '60px',
    height: '34px',
  },
  switchInput: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  switchSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ccc',
    transition: '0.4s',
    borderRadius: '34px',
  },
  switchSliderBefore: {
    position: 'absolute',
    content: '""',
    height: '26px',
    width: '26px',
    left: '4px',
    bottom: '4px',
    backgroundColor: 'white',
    transition: '0.4s',
    borderRadius: '50%',
  },
  button: {
    padding: '8px 16px',
    background: '#2e7b7d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px',
  },
  loadingButton: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  saveMessage: {
    marginTop: '10px',
    color: '#4CAF50',
    fontSize: '14px',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginTop: '10px',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  checkbox: {
    marginRight: '10px',
  },
  divider: {
    margin: '15px 0',
    borderBottom: '1px solid #e0e0e0',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  }
};

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    adminEmail: '',
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: true,
    pushoverNotificationsEnabled: false,
    pushoverAdminUserKey: '',
    notifyOnNewLead: true,
    notifyOnLeadAssignment: true,
    notifyOnAppointment: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        
        // Fetch notification settings
        const settingsDoc = await getDoc(doc(db, 'settings', 'notifications'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setSettings({
            adminEmail: data.adminEmail || '',
            emailNotificationsEnabled: data.emailNotificationsEnabled !== false, // default to true
            smsNotificationsEnabled: data.smsNotificationsEnabled !== false, // default to true
            pushoverNotificationsEnabled: data.pushoverNotificationsEnabled === true, // default to false
            pushoverAdminUserKey: data.pushoverAdminUserKey || '',
            notifyOnNewLead: data.notifyOnNewLead !== false, // default to true
            notifyOnLeadAssignment: data.notifyOnLeadAssignment !== false, // default to true
            notifyOnAppointment: data.notifyOnAppointment !== false // default to true
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notification settings:', err);
        setError('Failed to load notification settings');
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };
  
  const handleSaveSettings = async () => {
    if (settings.adminEmail && !validateEmail(settings.adminEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      setSaveMessage('');
      
      const db = getFirestore();
      
      // Create or update the settings document
      const settingsRef = doc(db, 'settings', 'notifications');
      const settingsSnapshot = await getDoc(settingsRef);
      
      if (settingsSnapshot.exists()) {
        await updateDoc(settingsRef, {
          ...settings,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(settingsRef, {
          ...settings,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      setSaveMessage('Notification settings saved successfully');
      setSaving(false);
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError('Failed to save notification settings');
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading notification settings...
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Notification Settings</h2>
      </div>
      
      <p style={styles.subtitle}>
        Configure how and when notifications are sent for lead activity.
      </p>
      
      <div style={styles.form}>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Email Notifications</div>
          
          <div style={styles.switchContainer}>
            <label style={styles.switch}>
              <input
                type="checkbox"
                name="emailNotificationsEnabled"
                checked={settings.emailNotificationsEnabled}
                onChange={handleInputChange}
                style={styles.switchInput}
              />
              <span style={{
                ...styles.switchSlider,
                backgroundColor: settings.emailNotificationsEnabled ? '#2e7b7d' : '#ccc',
                '&:before': {
                  ...styles.switchSliderBefore,
                  transform: settings.emailNotificationsEnabled ? 'translateX(26px)' : 'translateX(0)'
                }
              }}></span>
            </label>
            <span style={styles.switchLabel}>
              {settings.emailNotificationsEnabled ? 'Email notifications enabled' : 'Email notifications disabled'}
            </span>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Admin Email Address</label>
            <p style={styles.description}>
              Email address to receive admin notifications. This should be your primary administrator email.
            </p>
            <input
              type="email"
              name="adminEmail"
              value={settings.adminEmail}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="admin@example.com"
              disabled={!settings.emailNotificationsEnabled}
            />
          </div>
        </div>
        
        <div style={styles.divider}></div>
        
        <div style={styles.section}>
          <div style={styles.sectionTitle}>WhatsApp Notifications</div>
          
          <div style={styles.switchContainer}>
            <label style={styles.switch}>
              <input
                type="checkbox"
                name="smsNotificationsEnabled"
                checked={settings.smsNotificationsEnabled}
                onChange={handleInputChange}
                style={styles.switchInput}
              />
              <span style={{
                ...styles.switchSlider,
                backgroundColor: settings.smsNotificationsEnabled ? '#2e7b7d' : '#ccc',
                '&:before': {
                  ...styles.switchSliderBefore,
                  transform: settings.smsNotificationsEnabled ? 'translateX(26px)' : 'translateX(0)'
                }
              }}></span>
            </label>
            <span style={styles.switchLabel}>
              {settings.smsNotificationsEnabled ? 'WhatsApp notifications enabled' : 'WhatsApp notifications disabled'}
            </span>
          </div>
          
          <p style={styles.description}>
            WhatsApp notifications are sent to the phone numbers in user profiles. Make sure all sales representatives have valid phone numbers with WhatsApp installed and have opted in to receive messages.
          </p>
        </div>
        
        <div style={styles.divider}></div>
        
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Pushover Notifications</div>
          
          <div style={styles.switchContainer}>
            <label style={styles.switch}>
              <input
                type="checkbox"
                name="pushoverNotificationsEnabled"
                checked={settings.pushoverNotificationsEnabled}
                onChange={handleInputChange}
                style={styles.switchInput}
              />
              <span style={{
                ...styles.switchSlider,
                backgroundColor: settings.pushoverNotificationsEnabled ? '#2e7b7d' : '#ccc',
                '&:before': {
                  ...styles.switchSliderBefore,
                  transform: settings.pushoverNotificationsEnabled ? 'translateX(26px)' : 'translateX(0)'
                }
              }}></span>
            </label>
            <span style={styles.switchLabel}>
              {settings.pushoverNotificationsEnabled ? 'Pushover notifications enabled' : 'Pushover notifications disabled'}
            </span>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Admin Pushover User Key</label>
            <p style={styles.description}>
              Your Pushover user key for receiving admin notifications. Sales reps will need to enter their own Pushover 
              user keys in their profiles.
            </p>
            <input
              type="text"
              name="pushoverAdminUserKey"
              value={settings.pushoverAdminUserKey}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="Enter your Pushover user key"
              disabled={!settings.pushoverNotificationsEnabled}
            />
          </div>
          
          <p style={styles.description}>
            Pushover is a simple app that sends push notifications to your phone or tablet. 
            Sales reps will need to purchase the Pushover app ($4.99 one-time fee) and enter their user key 
            in their profile to receive notifications.
          </p>
        </div>
        
        <div style={styles.divider}></div>
        
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Notification Triggers</div>
          
          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="notifyOnNewLead"
              checked={settings.notifyOnNewLead}
              onChange={handleInputChange}
              style={styles.checkbox}
              id="notifyOnNewLead"
            />
            <label htmlFor="notifyOnNewLead">Notify on new lead creation</label>
          </div>
          
          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="notifyOnLeadAssignment"
              checked={settings.notifyOnLeadAssignment}
              onChange={handleInputChange}
              style={styles.checkbox}
              id="notifyOnLeadAssignment"
            />
            <label htmlFor="notifyOnLeadAssignment">Notify when leads are assigned</label>
          </div>
          
          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="notifyOnAppointment"
              checked={settings.notifyOnAppointment}
              onChange={handleInputChange}
              style={styles.checkbox}
              id="notifyOnAppointment"
            />
            <label htmlFor="notifyOnAppointment">Notify when appointments are set</label>
          </div>
        </div>
        
        <div>
          <button
            style={{
              ...styles.button,
              ...(saving ? styles.loadingButton : {})
            }}
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
        
        {saveMessage && <div style={styles.saveMessage}>{saveMessage}</div>}
        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  );
};

export default NotificationSettings;