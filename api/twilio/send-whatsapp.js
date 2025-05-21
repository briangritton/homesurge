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
      !process.env.ADMIN_PHONE_NUMBER ||
      !process.env.TWILIO_TEMPLATE_SID) {
    console.error('Missing required environment variables for Twilio');
    return res.status(500).json({ error: 'Server configuration error - Make sure TWILIO_TEMPLATE_SID is set with your approved template' });
  }

  try {
    const { salesRepPhone, salesRepName, templateData, notificationSettings } = req.body;
    
    // Validate required inputs
    if (!salesRepPhone || !templateData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if WhatsApp notifications are enabled based on settings passed from frontend
    if (notificationSettings && notificationSettings.smsNotificationsEnabled === false) {
      return res.status(200).json({ 
        success: true, 
        skipped: true,
        reason: 'WhatsApp notifications are disabled in settings'
      });
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
    
    // Use the approved WhatsApp template with variables
    // Prepare the messages array and tracking for successful messages
    const messages = [];
    const results = {
      success: true,
      messages: {}
    };
    
    // Send message to sales rep if rep notifications are not explicitly disabled
    if (!notificationSettings || notificationSettings.notifyRepOnAssignment !== false) {
      const salesRepSMS = await client.messages.create({
        from: fromWhatsAppFormatted,
        to: toSalesRepWhatsApp,
        // Use templateId for your approved template
        contentSid: process.env.TWILIO_TEMPLATE_SID || '',
        contentVariables: JSON.stringify({
          1: templateData.leadName || 'New Lead',
          2: templateData.address || 'Address not available',
          3: templateData.phone || 'Phone not available',
          4: templateData.leadURL || window.location.origin + '/crm'
        })
      });
      results.messages.salesRep = salesRepSMS.sid;
    }
    
    // Send message to admin if admin notifications are not explicitly disabled
    if (!notificationSettings || notificationSettings.notifyAdminOnAssignment !== false) {
      const adminSMS = await client.messages.create({
        from: fromWhatsAppFormatted,
        to: toAdminWhatsApp,
        // Use templateId for your approved template
        contentSid: process.env.TWILIO_TEMPLATE_SID || '',
        contentVariables: JSON.stringify({
          1: `${templateData.leadName} (assigned to ${salesRepName})`,
          2: templateData.address || 'Address not available',
          3: templateData.phone || 'Phone not available',
          4: templateData.leadURL || window.location.origin + '/crm'
        })
      });
      results.messages.admin = adminSMS.sid;
    }
    
    console.log('WhatsApp messages sent successfully', results.messages);
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return res.status(500).json({ 
      error: 'Failed to send WhatsApp message', 
      details: error.message 
    });
  }
};