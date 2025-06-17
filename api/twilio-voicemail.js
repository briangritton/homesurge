/**
 * Twilio Voicemail Webhook - Handles voicemail recordings
 * This endpoint is called when someone leaves a voicemail
 */

export default async function handler(req, res) {
  // Only accept POST requests from Twilio
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📧 Voicemail received:', req.body);

    const { 
      From, 
      To, 
      CallSid,
      RecordingUrl,
      RecordingDuration,
      CallDuration
    } = req.body;

    // Log voicemail details
    console.log('Voicemail details:', {
      from: From,
      to: To,
      callSid: CallSid,
      recordingUrl: RecordingUrl,
      recordingDuration: RecordingDuration,
      callDuration: CallDuration
    });

    // TODO: Send notification to your team about the voicemail
    await notifyTeamAboutVoicemail({
      phoneNumber: From,
      recordingUrl: RecordingUrl,
      duration: RecordingDuration,
      callSid: CallSid,
      timestamp: new Date().toISOString()
    });

    // Return TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Thank you for your message. We'll get back to you soon. Goodbye!</Say>
</Response>`;

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml);

  } catch (error) {
    console.error('❌ Voicemail webhook error:', error);
    
    // Return simple TwiML on error
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Thank you. Goodbye!</Say>
</Response>`;
    
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(errorTwiml);
  }
}

/**
 * Notify team about new voicemail
 */
async function notifyTeamAboutVoicemail(voicemailData) {
  try {
    console.log('📬 Notifying team about voicemail:', voicemailData);
    
    // TODO: Integrate with your existing notification services
    // You can use your existing Pushover, EmailJS, or other notification systems
    
    const notificationData = {
      type: 'voicemail',
      phoneNumber: voicemailData.phoneNumber,
      recordingUrl: voicemailData.recordingUrl,
      duration: `${voicemailData.duration} seconds`,
      timestamp: voicemailData.timestamp,
      message: `📧 Voicemail received from ${voicemailData.phoneNumber} - Duration: ${voicemailData.duration}s`
    };

    console.log('Would send notification:', notificationData);
    
    // Example: Send via your existing systems
    // await sendPushoverNotification(notificationData);
    // await sendEmailNotification(notificationData);

  } catch (error) {
    console.error('❌ Voicemail notification failed:', error);
  }
}