/**
 * Facebook Conversions API Server-Side Implementation
 * This file should be deployed as a Vercel serverless function
 */

const axios = require('axios');
const crypto = require('crypto');

// Configuration - use environment variables in production
// Temporary config for development - REMOVE in production and use env vars
const FB_PIXEL_ID = process.env.REACT_APP_FB_PIXEL_ID || '';
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN || 'EAAOqI5JShIwBOyRZCpvUS5SUcbWKj1ZCuUDLvF0ZBj5tM4ZCdvEsfNy6Xg3GuC8vov9vV0btOrixPbhurQJEwUrByMmNQR4m68i0SLmmk8Gx6qdZBZBtw9HbG1blI7qbK0V4aSYlXtvxC6MWMZC17ZAUui1EIhj2aNikBzvGKrmgKrmmekMYvk1eajLNxS9JCC7kzQZDZD';
const FB_API_VERSION = process.env.FB_API_VERSION || 'v17.0';
const DEBUG_MODE = process.env.NODE_ENV === 'development';

// API endpoint
const API_ENDPOINT = `https://graph.facebook.com/${FB_API_VERSION}/${FB_PIXEL_ID}/events`;

/**
 * Hash data for Facebook
 * @param {string} data - Data to hash
 * @returns {string} - SHA256 hashed data
 */
function hashData(data) {
  if (!data) return null;
  
  // Normalize and hash
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

/**
 * Prepare user data for sending to Facebook
 * @param {object} userData - User data from form
 * @returns {object} - Prepared user data object
 */
function prepareUserData(userData) {
  const prepared = {
    client_user_agent: userData.userAgent || '',
    client_ip_address: userData.ip || '',
    fbc: userData.fbc || undefined,
    fbp: userData.fbp || undefined,
  };
  
  // Only add fields that exist
  if (userData.email) prepared.em = [hashData(userData.email)];
  if (userData.phone) prepared.ph = [hashData(userData.phone)];
  if (userData.name) prepared.fn = [hashData(userData.name.split(' ')[0])];
  if (userData.name && userData.name.split(' ').length > 1) {
    prepared.ln = [hashData(userData.name.split(' ').slice(1).join(' '))];
  }
  if (userData.zip) prepared.zp = [hashData(userData.zip)];
  if (userData.city) prepared.ct = [hashData(userData.city)];
  if (userData.state) prepared.st = [hashData(userData.state)];
  
  return prepared;
}

/**
 * Send event to Facebook Conversions API
 * @param {object} req - HTTP request
 * @param {object} res - HTTP response
 */
module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check for missing configuration
  if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
    console.error('Missing Facebook configuration');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { eventName, eventTime, eventSourceUrl, userData, customData } = req.body;
    
    // Validate required fields
    if (!eventName || !eventTime) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Prepare event data
    const eventData = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(eventTime / 1000), // Convert to Unix timestamp
          event_source_url: eventSourceUrl || req.headers.referer || '',
          action_source: 'website',
          user_data: prepareUserData(userData || {}),
          custom_data: customData || {}
        }
      ]
    };
    
    // Add optional event ID if provided
    if (req.body.eventId) {
      eventData.data[0].event_id = req.body.eventId;
    }
    
    // Send to Facebook
    const response = await axios.post(
      `${API_ENDPOINT}?access_token=${FB_ACCESS_TOKEN}`,
      eventData
    );
    
    console.log('Facebook CAPI event sent successfully:', {
      eventName,
      result: response.data
    });
    
    return res.status(200).json({ success: true, fbResponse: response.data });
    
  } catch (error) {
    console.error('Error sending event to Facebook:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to send event to Facebook',
      details: error.response?.data || error.message
    });
  }
};