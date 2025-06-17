/**
 * Twilio Voice Handler - Returns TwiML XML
 * This endpoint should be set as your Voice URL in Twilio Console
 */

export default function handler(req, res) {
  // Set proper content type for TwiML
  res.setHeader('Content-Type', 'text/xml');
  
  // Your business phone number (the number calls should forward to)
  const businessPhone = process.env.BUSINESS_PHONE_NUMBER || '+14805168560';
  
  // Your webhook URL for call tracking
  const webhookUrl = `https://${req.headers.host}/api/twilio-call-tracking`;
  
  console.log('📞 Voice call received, returning TwiML');
  
  // Return TwiML XML
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Hello! Thank you for calling. Please hold while we connect you to a real estate specialist.</Say>
    <Dial action="${webhookUrl}" method="POST" timeout="30">${businessPhone}</Dial>
    <Say voice="alice">Sorry, we're unable to take your call right now. Please leave a message after the beep.</Say>
    <Record maxLength="60" action="${webhookUrl}" method="POST" />
</Response>`;

  res.status(200).send(twiml);
}