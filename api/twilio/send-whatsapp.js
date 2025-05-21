const twilio = require('twilio');

/**
 * API route for sending WhatsApp notifications via Twilio
 * Environment variables are stored in Vercel:
 * - TWILIO_ACCOUNT_SID: Your Twilio account SID
 * - TWILIO_AUTH_TOKEN: Your Twilio auth token
 * - TWILIO_WHATSAPP_NUMBER: Your Twilio WhatsApp number with format "whatsapp:+14155238886"
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
      !process.env.TWILIO_WHATSAPP_NUMBER || 
      !process.env.ADMIN_PHONE_NUMBER) {
    console.error('Missing required environment variables for Twilio');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { salesRepPhone, salesRepName, templateData } = req.body;
    
    // Validate required inputs
    if (!salesRepPhone || !templateData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID, 
      process.env.TWILIO_AUTH_TOKEN
    );

    // Format phone numbers for WhatsApp
    const formatWhatsAppNumber = (phoneNumber) => {
      // Remove any non-digit characters
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      
      // Ensure it has a country code
      let formattedNumber = digitsOnly;
      if (!digitsOnly.startsWith('1') && digitsOnly.length === 10) {
        // Add US country code if 10 digits without country code
        formattedNumber = `1${digitsOnly}`;
      }
      
      // Add WhatsApp prefix if not already present
      if (!formattedNumber.startsWith('whatsapp:')) {
        formattedNumber = `whatsapp:+${formattedNumber}`;
      }
      
      return formattedNumber;
    };
    
    const toSalesRepWhatsApp = formatWhatsAppNumber(salesRepPhone);
    const toAdminWhatsApp = formatWhatsAppNumber(process.env.ADMIN_PHONE_NUMBER);
    const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;

    // Add whatsapp: prefix if not present
    const whatsappPrefix = fromWhatsApp.startsWith('whatsapp:') ? '' : 'whatsapp:';
    const fromWhatsAppFormatted = `${whatsappPrefix}${fromWhatsApp}`;
    
    // Create message content based on template
    const salesRepMessage = `Your new lead ${templateData.leadName} is now ready in the CRM. Property address: ${templateData.address}. View details: ${templateData.leadURL}`;
    const adminMessage = `Lead ${templateData.leadName} assigned to ${salesRepName}. View details: ${templateData.leadURL}`;
    
    // Send message to sales rep
    const salesRepSMS = await client.messages.create({
      body: salesRepMessage,
      from: fromWhatsAppFormatted,
      to: toSalesRepWhatsApp
    });
    
    // Send message to admin
    const adminSMS = await client.messages.create({
      body: adminMessage,
      from: fromWhatsAppFormatted,
      to: toAdminWhatsApp
    });
    
    console.log('WhatsApp messages sent successfully', { 
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
    console.error('Error sending WhatsApp message:', error);
    return res.status(500).json({ 
      error: 'Failed to send WhatsApp message', 
      details: error.message 
    });
  }
};