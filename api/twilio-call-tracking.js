/**
 * Twilio Call Tracking Webhook
 * Handles call status updates and tracks conversions
 */

export default async function handler(req, res) {
  // Only accept POST requests from Twilio
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📞 Twilio webhook received:', req.body);

    const { 
      CallStatus, 
      CallDuration, 
      From, 
      To, 
      CallSid,
      Direction,
      AnsweredBy 
    } = req.body;

    // Log all call events for debugging
    console.log('Call details:', {
      status: CallStatus,
      duration: CallDuration,
      from: From,
      to: To,
      direction: Direction,
      answeredBy: AnsweredBy,
      callSid: CallSid
    });

    // Track different call statuses
    if (CallStatus === 'ringing') {
      console.log('📱 Call ringing from:', From);
    }

    if (CallStatus === 'in-progress') {
      console.log('📞 Call answered from:', From);
    }

    // Only track completed calls with minimum duration (10+ seconds)
    if (CallStatus === 'completed') {
      const duration = parseInt(CallDuration) || 0;
      console.log(`📞 Call completed: ${duration} seconds`);

      if (duration >= 10 && AnsweredBy !== 'machine_start') {
        // This is a real conversation, track as conversion
        await trackPhoneConversion({
          phoneNumber: From,
          duration: duration,
          callSid: CallSid,
          timestamp: new Date().toISOString(),
          twilioNumber: To // Your (888) 874-3302 number
        });
      } else if (duration < 10) {
        console.log('⚠️ Call too short, not tracking as conversion');
      } else if (AnsweredBy === 'machine_start') {
        console.log('🤖 Voicemail detected, not tracking as conversion');
      }
    }

    // Respond to Twilio that we received the webhook
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed',
      callStatus: CallStatus 
    });

  } catch (error) {
    console.error('❌ Twilio webhook error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
}

/**
 * Track phone conversion using server-side analytics
 * Since this runs on the server, we'll use Firebase/database logging
 * and trigger client-side events when possible
 */
async function trackPhoneConversion(callData) {
  console.log('🎯 Tracking phone conversion:', callData);

  try {
    // Option 1: Log to a database/Firebase (you can add this later)
    // await logCallToFirebase(callData);

    // Option 2: Send to GA4 via Measurement Protocol (server-side)
    await sendToGA4(callData);

    // Option 3: Trigger notifications to your team
    await notifyTeam(callData);

    console.log('✅ Phone conversion tracked successfully');
  } catch (error) {
    console.error('❌ Phone conversion tracking failed:', error);
  }
}

/**
 * Send call conversion to GA4 via Measurement Protocol
 */
async function sendToGA4(callData) {
  // You'll need to add your GA4 Measurement ID and API Secret
  const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID; // G-XXXXXXXXXX
  const GA4_API_SECRET = process.env.GA4_API_SECRET;

  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    console.log('⚠️ GA4 credentials not set, skipping GA4 tracking');
    return;
  }

  const payload = {
    client_id: `phone-${callData.callSid}`, // Unique identifier
    events: [
      {
        name: 'phone_call_conversion',
        params: {
          event_category: 'engagement',
          event_label: 'phone_call',
          value: 1,
          phone_number: callData.phoneNumber.replace(/[^\d]/g, ''), // Clean phone number
          call_duration: callData.duration,
          call_sid: callData.callSid,
          twilio_number: '8888743302'
        }
      }
    ]
  };

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    if (response.ok) {
      console.log('✅ GA4 event sent successfully');
    } else {
      console.error('❌ GA4 event failed:', response.status);
    }
  } catch (error) {
    console.error('❌ GA4 request failed:', error);
  }
}

/**
 * Notify team about the phone call (using your existing notification system)
 */
async function notifyTeam(callData) {
  try {
    // Use your existing notification system
    const notificationData = {
      type: 'phone_call',
      phoneNumber: callData.phoneNumber,
      duration: `${callData.duration} seconds`,
      timestamp: callData.timestamp,
      message: `📞 Phone call received from ${callData.phoneNumber} - Duration: ${callData.duration}s`
    };

    // You can extend this to use your existing Pushover/EmailJS services
    console.log('📬 Would notify team:', notificationData);
    
    // TODO: Integrate with your existing notification services
    // await sendPushoverNotification(notificationData);
    // await sendEmailNotification(notificationData);

  } catch (error) {
    console.error('❌ Team notification failed:', error);
  }
}