/**
 * Twilio Voice Whisper Handler
 * This plays the whisper message to the sales person when they answer
 */

export default function handler(req, res) {
  // Set proper content type for TwiML
  res.setHeader('Content-Type', 'text/xml');
  
  // Get caller information from Twilio request
  const callerName = req.body.CallerName || '';
  const callerNumber = req.body.Caller || req.body.From || '';
  
  console.log('🔔 Whisper message for:', { callerName, callerNumber });
  
  // Create personalized whisper message
  let whisperText = 'Real Estate Lead';
  if (callerName && callerName !== callerNumber) {
    whisperText = `Real Estate Lead from ${callerName}`;
  } else if (callerNumber) {
    whisperText = `Real Estate Lead from ${callerNumber}`;
  }
  
  // Return TwiML XML for whisper message
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${whisperText}</Say>
</Response>`;

  res.status(200).send(twiml);
}