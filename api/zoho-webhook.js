// api/zoho-webhook.js
const axios = require('axios');
const crypto = require('crypto');

// Configuration
const GTM_CONTAINER_ID = process.env.GTM_CONTAINER_ID || 'GTM-NGC4HNKG';
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || '';
const GA4_API_SECRET = process.env.GA4_API_SECRET || '';
const WEBHOOK_SECRET = process.env.ZOHO_WEBHOOK_SECRET || 'your-webhook-secret'; // For validating Zoho requests

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Zoho-Webhook-Token');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Log webhook payload for debugging (remove in production)
    console.log('Received Zoho webhook payload:', JSON.stringify(req.body, null, 2));
    
    // Verify webhook authenticity (optional but recommended)
    // In production, uncomment this code and configure a proper secret
    /*
    const signature = req.headers['x-zoho-webhook-token'];
    if (!verifyWebhook(signature, JSON.stringify(req.body), WEBHOOK_SECRET)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    */
    
    // Extract data from webhook payload
    const { event, leadId, status, value, timestamp, gclid } = req.body;
    
    if (!event || !leadId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get conversion value (either provided or default)
    const conversionValue = value ? parseFloat(value) : getDefaultValueForEvent(event);
    
    // Create a standardized event payload
    const eventData = {
      event: 'zohoConversion',
      zohoEvent: event,
      leadId: leadId,
      status: status || '',
      conversionValue: conversionValue,
      timestamp: timestamp || new Date().toISOString(),
      gclid: gclid || '',
      conversionName: getConversionNameForEvent(event)
    };
    
    // Send to analytics platforms in parallel
    await Promise.all([
      // Option 1: Send to GTM server-side (if configured)
      pushToGTM(eventData),
      
      // Option 2: Send directly to GA4 Measurement Protocol (if configured)
      sendToGA4MeasurementProtocol(eventData)
      
      // You could add more tracking services here as needed
    ]);
    
    // Log success for debugging
    console.log('Successfully processed conversion event:', event, 'for lead:', leadId);

    // Return success response
    return res.status(200).json({
      success: true,
      message: `Successfully processed ${event} conversion for lead ${leadId}`,
      processedEvent: eventData
    });
    
  } catch (error) {
    console.error('Error processing Zoho webhook:', error);
    
    return res.status(500).json({
      error: 'Failed to process webhook',
      details: error.message
    });
  }
};

/**
 * Verify webhook signature from Zoho
 * @param {string} signature - The signature from Zoho
 * @param {string} payload - The webhook payload as a string
 * @param {string} secret - The shared secret to verify with
 * @returns {boolean} - Whether the signature is valid
 */
function verifyWebhook(signature, payload, secret) {
  if (!signature || !secret) return false;
  
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac.update(payload).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

/**
 * Get default conversion value based on event type
 * @param {string} event - The conversion event type
 * @returns {number} - The default conversion value
 */
function getDefaultValueForEvent(event) {
  // Default values for different conversion types
  switch (event) {
    case 'successfulContact':
      return 25;
    case 'appointmentSet':
      return 50;
    case 'notInterested':
      return 5;
    case 'wrongNumber':
      return 2;
    case 'successfullyClosedTransaction':
    case 'closed':
      return 500;
    default:
      return 10;
  }
}

/**
 * Get human-readable conversion name for events
 * @param {string} event - The conversion event type
 * @returns {string} - Human readable conversion name
 */
function getConversionNameForEvent(event) {
  switch (event) {
    case 'successfulContact':
      return 'Lead Successfully Contacted';
    case 'appointmentSet':
      return 'Appointment Scheduled';
    case 'notInterested':
      return 'Lead Not Interested';
    case 'wrongNumber':
      return 'Wrong Number';
    case 'successfullyClosedTransaction':
    case 'closed':
      return 'Deal Closed';
    default:
      return 'Zoho Lead Event';
  }
}

/**
 * Push data to Google Tag Manager server-side
 * @param {Object} data - The data to push to GTM
 */
async function pushToGTM(data) {
  // This implementation uses the GTM server-side client ID
  // for demonstration purposes only
  
  // Log data that would be sent (for debugging/dev environments)
  console.log('Would push to GTM server-side:', data);
  
  // For actual GTM server-side implementation:
  if (process.env.NODE_ENV === 'production' && data.gclid) {
    try {
      // This is a sample implementation for GTM server-side
      // You would need to customize this based on your specific setup
      await axios.post(`https://gtm-server.${process.env.DOMAIN || 'sellforcash.online'}/api/collect`, {
        container_id: GTM_CONTAINER_ID,
        client_id: data.leadId, // or generate a proper client ID
        events: [{
          name: 'conversion',
          params: {
            conversion_id: data.leadId,
            event_category: 'Lead',
            event_action: data.zohoEvent,
            event_label: data.status,
            value: data.conversionValue,
            gclid: data.gclid,
            currency: 'USD',
            send_to: 'G-CONVERSION_ID', // Replace with your actual GA4 conversion ID
            transaction_id: data.leadId,
            timestamp: data.timestamp
          }
        }]
      });
      return true;
    } catch (error) {
      console.error('Error sending to GTM server:', error.message);
      return false;
    }
  }
  
  return true; // Return success in development mode
}

/**
 * Send event directly to GA4 Measurement Protocol
 * @param {Object} data - The event data to send
 */
async function sendToGA4MeasurementProtocol(data) {
  // Skip if no API secret or measurement ID is configured
  if (!GA4_API_SECRET || !GA4_MEASUREMENT_ID) {
    return false;
  }
  
  try {
    // Generate a unique client ID based on lead ID
    const clientId = data.leadId || generateClientId();
    
    // Prepare the event payload
    const payload = {
      client_id: clientId,
      non_personalized_ads: false,
      events: [{
        name: 'conversion',
        params: {
          conversion_type: data.zohoEvent,
          value: data.conversionValue,
          currency: 'USD',
          transaction_id: data.leadId,
          lead_id: data.leadId,
          status: data.status,
          engagement_time_msec: 1000,
          gclid: data.gclid || undefined // Only include if present
        }
      }]
    };
    
    // Log what would be sent in development
    console.log('Would send to GA4 Measurement Protocol:', payload);
    
    // Only send in production with proper credentials
    if (process.env.NODE_ENV === 'production' && GA4_API_SECRET) {
      const response = await axios.post(
        `https://www.google-analytics.com/mp/collect?api_secret=${GA4_API_SECRET}&measurement_id=${GA4_MEASUREMENT_ID}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 204 || response.status === 200) {
        console.log('Successfully sent event to GA4 Measurement Protocol');
        return true;
      }
    }
    
    return true; // Return success in development mode
  } catch (error) {
    console.error('Error sending to GA4 Measurement Protocol:', error.message);
    return false;
  }
}

/**
 * Generate a random client ID for GA4
 * @returns {string} - A random client ID
 */
function generateClientId() {
  return crypto.randomUUID ? 
    crypto.randomUUID() : // Node.js 16+
    Math.random().toString(36).substring(2) + Date.now().toString(36);
}