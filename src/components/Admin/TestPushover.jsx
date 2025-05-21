import React, { useState } from 'react';

const styles = {
  container: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '15px',
  },
  button: {
    padding: '10px 20px',
    background: '#2e7b7d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px',
  },
  successMessage: {
    color: 'green',
    marginTop: '15px',
  },
  errorMessage: {
    color: 'red',
    marginTop: '15px',
  },
  responseContainer: {
    marginTop: '20px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
    overflow: 'auto',
    maxHeight: '300px',
  },
  responseTitle: {
    fontWeight: 'bold',
    marginBottom: '5px',
  }
};

const TestPushover = () => {
  const [userKey, setUserKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

  const handleSendTest = async () => {
    if (!userKey) {
      setError('Please enter a Pushover User Key');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setResponse(null);

    try {
      const response = await fetch('/api/pushover/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_key: userKey })
      });

      const data = await response.json();
      setResponse(data);

      if (data.success) {
        setSuccess(true);
        setError('');
      } else {
        setError(data.error || 'Failed to send notification');
        setSuccess(false);
      }
    } catch (err) {
      setError('Error sending test notification: ' + err.message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Test Pushover Notifications</h2>
      <p>
        Use this tool to test if Pushover notifications are correctly configured.
        Enter a Pushover User Key below to send a test notification.
      </p>

      <input
        type="text"
        placeholder="Enter Pushover User Key"
        value={userKey}
        onChange={(e) => setUserKey(e.target.value)}
        style={styles.input}
      />

      <button
        onClick={handleSendTest}
        disabled={loading}
        style={styles.button}
      >
        {loading ? 'Sending...' : 'Send Test Notification'}
      </button>

      {success && (
        <div style={styles.successMessage}>
          Test notification sent successfully! Check your device.
        </div>
      )}

      {error && (
        <div style={styles.errorMessage}>
          Error: {error}
        </div>
      )}

      {response && (
        <div style={styles.responseContainer}>
          <div style={styles.responseTitle}>API Response:</div>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestPushover;