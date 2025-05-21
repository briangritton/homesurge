const twilio = require('twilio');

/**
 * API route for sending SMS notifications via Twilio
 * Environment variables are stored in Vercel:
 * - TWILIO_ACCOUNT_SID: Your Twilio account SID
 * - TWILIO_AUTH_TOKEN: Your Twilio auth token
 * - TWILIO_PHONE_NUMBER: Your Twilio phone number
 * - ADMIN_PHONE_NUMBER: The admin's phone number for notifications
 */
module.exports = async (req, res) => {
  // Ensure this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check that all environment variables are set
  if (!process.env.TWILIO_ACCOUNT_SID || 
      !process.env.TWILIO_AUTH_TOKEN || 
      !process.env.TWILIO_PHONE_NUMBER || 
      !process.env.ADMIN_PHONE_NUMBER) {
    console.error('Missing required environment variables for Twilio');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { salesRepPhone, salesRepMessage, adminMessage } = req.body;
    
    // Validate required inputs
    if (!salesRepPhone || !salesRepMessage || !adminMessage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID, 
      process.env.TWILIO_AUTH_TOKEN
    );
    
    // Send message to sales rep
    const salesRepSMS = await client.messages.create({
      body: salesRepMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: salesRepPhone
    });
    
    // Send message to admin
    const adminSMS = await client.messages.create({
      body: adminMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.ADMIN_PHONE_NUMBER
    });
    
    console.log('SMS sent successfully', { 
      salesRepSid: salesRepSMS.sid,
      adminSid: adminSMS.sid
    });
    
    return res.status(200).json({ 
      success: true, 
      messages: {
        salesRep: salesRepSMS.sid,
        admin: adminSMS.sid
      }
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return res.status(500).json({ 
      error: 'Failed to send SMS', 
      details: error.message 
    });
  }
};