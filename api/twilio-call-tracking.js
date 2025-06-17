/**
 * Twilio Call Tracking Webhook
 * Handles call status updates and tracks conversions
 * Also handles Dial action callbacks from the voice webhook
 */

// Initialize Firebase for server-side use
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOEm26rN6y-8T3A-SjqMoH4qJtjdi3H1A",
  authDomain: "sell-for-cash-454017.firebaseapp.com",
  projectId: "sell-for-cash-454017",
  storageBucket: "sell-for-cash-454017.firebasestorage.app",
  messagingSenderId: "961913513684",
  appId: "1:961913513684:web:57bd83f1867273bf437d41"
};

// Initialize Firebase if not already initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export default async function handler(req, res) {
  // Accept both GET and POST requests from Twilio
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle both GET and POST request data
    const requestData = req.method === 'GET' ? req.query : req.body;
    console.log('📞 Twilio webhook received:', requestData);

    const { 
      CallStatus, 
      CallDuration, 
      From, 
      To, 
      CallSid,
      Direction,
      AnsweredBy,
      DialCallStatus,
      DialCallDuration,
      CallerName
    } = requestData;

    // Log all call events for debugging
    console.log('Call details:', {
      status: CallStatus,
      duration: CallDuration,
      from: From,
      to: To,
      direction: Direction,
      answeredBy: AnsweredBy,
      callSid: CallSid,
      dialCallStatus: DialCallStatus,
      dialCallDuration: DialCallDuration
    });

    // Handle Dial action callbacks (when call forwarding completes)
    if (DialCallStatus) {
      console.log(`📞 Dial action completed: ${DialCallStatus}, Duration: ${DialCallDuration}s`);
      
      // ALWAYS track incoming calls when we see DialCallStatus (this means call was attempted)
      console.log('📊 TRACKING INCOMING CALL - DialCallStatus detected');
      try {
        await sendToGA4({
          phoneNumber: From,
          callSid: CallSid,
          duration: 0,
          timestamp: new Date().toISOString(),
          twilioNumber: To,
          type: 'incoming_call'
        });
        console.log('✅ Incoming call GA4 event sent');
      } catch (error) {
        console.error('❌ Incoming call GA4 failed:', error);
      }

      // Send Pushover notification for incoming call
      console.log('📱 SENDING PUSHOVER for incoming call');
      try {
        await sendCallNotification({
          phoneNumber: From,
          status: 'incoming',
          twilioNumber: To,
          callSid: CallSid
        });
        console.log('✅ Pushover notification sent');
      } catch (error) {
        console.error('❌ Pushover notification failed:', error);
      }

      // Update lead in CRM if phone number matches, or create new lead
      console.log('🔍 CHECKING FOR MATCHING LEAD OR CREATING NEW');
      try {
        const leadUpdateResult = await updateLeadFromCall(From, CallSid, 'incoming', CallerName);
        if (leadUpdateResult.matched) {
          if (leadUpdateResult.created) {
            console.log('🆕 NEW LEAD CREATED:', leadUpdateResult.leadName, '- ID:', leadUpdateResult.leadId);
          } else {
            console.log('✅ EXISTING LEAD UPDATED:', leadUpdateResult.leadName, '- Status:', leadUpdateResult.newStatus);
          }
        } else {
          console.log('ℹ️ Lead operation failed for phone:', From);
        }
      } catch (error) {
        console.error('❌ Lead operation failed:', error);
      }
      
      if (DialCallStatus === 'completed' && parseInt(DialCallDuration) >= 10) {
        // Track successful forwarded call
        console.log('📊 TRACKING COMPLETED CALL');
        await trackPhoneConversion({
          phoneNumber: From,
          duration: parseInt(DialCallDuration),
          callSid: CallSid,
          timestamp: new Date().toISOString(),
          twilioNumber: To,
          type: 'forwarded_call'
        });
        
        // Track completion in GA4
        await sendToGA4({
          phoneNumber: From,
          callSid: CallSid,
          duration: parseInt(DialCallDuration),
          timestamp: new Date().toISOString(),
          twilioNumber: To,
          type: 'completed_call'
        });
        console.log('✅ Completed call GA4 event sent');
      }

      // Return empty TwiML for Dial action callbacks
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }

    // Track different call statuses
    console.log('🔍 Checking call statuses - CallStatus:', CallStatus, 'DialCallStatus:', DialCallStatus);
    
    // Check for both ringing and in-progress status for notifications
    if (CallStatus === 'ringing' || CallStatus === 'in-progress') {
      console.log('📱 Call detected from:', From, 'Status:', CallStatus);
      
      // Only send notification and track GA4 on first in-progress (not for subsequent events)
      if (CallStatus === 'ringing' || (CallStatus === 'in-progress' && !DialCallStatus)) {
        console.log('📱 Processing incoming call - notification + GA4 tracking');
        
        // Send Pushover notification directly (like your working notifications)
        await sendCallNotification({
          phoneNumber: From,
          status: 'incoming',
          twilioNumber: To,
          callSid: CallSid
        });
        
        // Track incoming call in GA4 via Measurement Protocol
        await sendToGA4({
          phoneNumber: From,
          callSid: CallSid,
          duration: 0,
          timestamp: new Date().toISOString(),
          twilioNumber: To,
          type: 'incoming_call'
        });
      } else {
        console.log('📱 Skipping notification - dial already in progress');
      }
    }

    // Also check for DialCallStatus (which we're seeing in the logs)
    if (DialCallStatus === 'completed') {
      console.log('📞 Dial completed from:', From);
      console.log('📊 ATTEMPTING GA4 tracking for completed call');
      
      try {
        // Track completed call in GA4
        await sendToGA4({
          phoneNumber: From,
          callSid: CallSid,
          duration: parseInt(DialCallDuration) || 0,
          timestamp: new Date().toISOString(),
          twilioNumber: To,
          type: 'completed_call'
        });
        console.log('✅ GA4 tracking completed');
      } catch (error) {
        console.error('❌ GA4 tracking failed:', error);
      }
    }

    // Let's also try CallStatus completed as backup
    if (CallStatus === 'completed' && !DialCallStatus) {
      console.log('📞 Call completed from:', From);
      
      await sendCallNotification({
        phoneNumber: From,
        status: 'completed',
        twilioNumber: To,
        callSid: CallSid
      });
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
  // Use existing GA4 credentials from Vercel environment
  const GA4_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || process.env.REACT_APP_GA_TRACKING_ID;
  const GA4_API_SECRET = process.env.GA_API_SECRET;

  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    console.log('⚠️ GA4 credentials not set, skipping GA4 tracking');
    console.log('Debug - GA4_MEASUREMENT_ID:', GA4_MEASUREMENT_ID ? 'Present' : 'Missing');
    console.log('Debug - GA4_API_SECRET:', GA4_API_SECRET ? 'Present' : 'Missing');
    return;
  }

  const eventName = callData.type === 'incoming_call' ? 'phone_call_started' : 'phone_call_conversion';
  const eventValue = callData.type === 'incoming_call' ? 1 : (callData.duration >= 10 ? 10 : 1);

  console.log('📊 Sending GA4 event with credentials:', {
    measurementId: GA4_MEASUREMENT_ID,
    hasApiSecret: !!GA4_API_SECRET,
    eventName: eventName,
    callType: callData.type
  });

  const payload = {
    client_id: `phone-${callData.callSid}`, // Unique identifier
    events: [
      {
        name: eventName,
        params: {
          event_category: 'engagement',
          event_label: callData.type || 'phone_call',
          value: eventValue,
          phone_number: callData.phoneNumber.replace(/[^\d]/g, ''), // Clean phone number
          call_duration: callData.duration || 0,
          call_sid: callData.callSid,
          call_type: callData.type || 'unknown',
          twilio_number: '4046714628'
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
 * Update lead in CRM when phone call matches (server-side version)
 */
async function updateLeadFromCall(phoneNumber, callSid, callStatus = 'incoming', callerName = null) {
  try {
    console.log('🔍 Searching for lead with phone number:', phoneNumber);

    if (!phoneNumber) {
      return { success: false, matched: false, error: 'No phone number provided' };
    }

    // Use Firebase functions (Firebase already initialized at top)
    console.log('🔧 Getting Firebase database...');
    const { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, addDoc } = await import('firebase/firestore');
    
    // Use the same Firebase instance as the rest of the app
    const db = getFirestore();
    console.log('✅ Firebase database ready');
    
    // Test the database connection
    try {
      const testCollection = collection(db, 'leads');
      console.log('✅ Collection reference created successfully');
    } catch (testError) {
      console.error('❌ Collection test failed:', testError);
      throw new Error('Firebase collection creation failed: ' + testError.message);
    }
    
    // Clean the phone number for matching (remove all non-digits)
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    
    // Try different phone number formats for matching
    const phoneVariations = [
      phoneNumber, // Original format (+16786323811)
      cleanPhone, // Digits only (16786323811)
      `+1${cleanPhone}`, // With country code (+116786323811)
      cleanPhone.startsWith('1') ? cleanPhone.substring(1) : cleanPhone, // Remove leading 1 (6786323811)
      `(${cleanPhone.substring(1, 4)}) ${cleanPhone.substring(4, 7)}-${cleanPhone.substring(7)}`, // Formatted (678) 632-3811
    ].filter((phone, index, arr) => arr.indexOf(phone) === index); // Remove duplicates

    console.log('🔍 Searching for phone variations:', phoneVariations);

    let matchingLead = null;

    // Search for leads with matching phone numbers
    const leadsCollection = collection(db, 'leads');
    
    for (const phoneVariation of phoneVariations) {
      const leadsQuery = query(
        leadsCollection,
        where('phone', '==', phoneVariation)
      );
      
      const snapshot = await getDocs(leadsQuery);
      
      if (!snapshot.empty) {
        matchingLead = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        };
        console.log('✅ Found matching lead:', matchingLead.id, 'for phone:', phoneVariation);
        break;
      }
    }

    if (!matchingLead) {
      console.log('❌ No matching lead found for phone:', phoneNumber);
      console.log('🆕 Creating new lead for incoming call');
      
      // Create a new lead for the calling number
      console.log('🔧 Preparing to create new lead with data...');
      
      const newLeadData = {
        phone: phoneNumber,
        name: callerName || '', // Use caller ID name if available
        callerIdName: callerName || '', // Store original caller ID name
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        status: 'Called In',
        leadStage: 'Called In',
        leadSource: 'Phone Call',
        traffic_source: 'Phone Call',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastCallDate: serverTimestamp(),
        lastCallSid: callSid,
        callCount: 1,
        submittedAny: false, // They haven't filled out forms yet
        notes: `Incoming call from ${phoneNumber}${callerName ? ` (${callerName})` : ''} at ${new Date().toLocaleString()}`
      };
      
      try {
        const docRef = await addDoc(leadsCollection, newLeadData);
        console.log('✅ Created new lead for phone call:', {
          leadId: docRef.id,
          phoneNumber: phoneNumber,
          status: 'Called In'
        });
        
        return {
          success: true,
          matched: true,
          created: true,
          leadId: docRef.id,
          leadName: `Phone Lead: ${phoneNumber}`,
          oldStatus: null,
          newStatus: 'Called In',
          callCount: 1
        };
      } catch (createError) {
        console.error('❌ Failed to create new lead:', createError);
        return { 
          success: false, 
          matched: false, 
          error: 'Failed to create new lead: ' + createError.message 
        };
      }
    }

    // Prepare update data
    const updateData = {
      lastCallDate: serverTimestamp(),
      lastCallSid: callSid,
      updatedAt: serverTimestamp(), // This moves lead to top of list
      callCount: (matchingLead.callCount || 0) + 1,
      leadStage: 'Called In'
    };

    // Add caller ID name if available and not already set
    if (callerName && !matchingLead.callerIdName) {
      updateData.callerIdName = callerName;
      // Only update the name field if it's currently empty
      if (!matchingLead.name) {
        updateData.name = callerName;
        console.log('📞 Adding caller ID name to lead:', callerName);
      }
    }

    // Only update status if it's currently 'Unassigned' or 'New' or empty
    if (!matchingLead.status || matchingLead.status === 'Unassigned' || matchingLead.status === 'New') {
      updateData.status = 'Called In';
      console.log('📞 Updating lead status to "Called In"');
    } else {
      console.log('📞 Lead already has status:', matchingLead.status, '- not changing status');
    }

    // Update the lead
    const leadRef = doc(db, 'leads', matchingLead.id);
    await updateDoc(leadRef, updateData);

    console.log('✅ Updated lead with call information:', {
      leadId: matchingLead.id,
      name: matchingLead.name,
      oldStatus: matchingLead.status,
      newStatus: updateData.status || matchingLead.status,
      callCount: updateData.callCount
    });

    return {
      success: true,
      matched: true,
      leadId: matchingLead.id,
      leadName: matchingLead.name,
      oldStatus: matchingLead.status,
      newStatus: updateData.status || matchingLead.status,
      callCount: updateData.callCount
    };

  } catch (error) {
    console.error('❌ Error updating lead from phone call:', error);
    return { 
      success: false, 
      matched: false, 
      error: error.message 
    };
  }
}

/**
 * Trigger client-side analytics events (follows your existing GTM pattern)
 */
async function triggerClientSideAnalytics(callData) {
  try {
    console.log('📊 Triggering client-side analytics for call:', callData);
    
    // Get the correct domain 
    const domain = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.homesurge.ai';
    const apiUrl = `${domain}/api/analytics/trigger-phone-event`;
    
    console.log('📊 Calling analytics trigger at:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callData)
    });
    
    if (response.ok) {
      console.log('✅ Client-side analytics triggered successfully');
    } else {
      console.error('❌ Client-side analytics failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Client-side analytics error:', error);
  }
}

/**
 * Send immediate call notification directly to Pushover API
 */
async function sendCallNotification(callData) {
  try {
    console.log('🔔 Attempting to send call notification:', callData);
    
    const pushoverToken = process.env.PUSHOVER_APP_TOKEN;
    const pushoverUser = "um62xd21dr7pfugnwanooxi6mqxc3n";
    
    if (!pushoverToken) {
      console.error('❌ PUSHOVER_APP_TOKEN environment variable not set');
      return;
    }
    
    const cleanPhoneNumber = callData.phoneNumber ? callData.phoneNumber.replace(/[^\d]/g, '') : 'Unknown';
    const formattedNumber = cleanPhoneNumber.length === 10 ? 
      `(${cleanPhoneNumber.substr(0,3)}) ${cleanPhoneNumber.substr(3,3)}-${cleanPhoneNumber.substr(6,4)}` : 
      callData.phoneNumber || 'Unknown Number';

    const message = callData.status === 'completed' ? 
      `📞 Call completed from ${formattedNumber}` :
      `📞 Real Estate Lead calling from ${formattedNumber}`;

    const title = callData.status === 'completed' ? 
      "Call Completed" : 
      "Incoming Call from Website";

    console.log('🔔 Sending notification with message:', message);
    console.log('🔔 Using token:', pushoverToken ? 'Present' : 'Missing');

    // Call Pushover API directly to avoid self-calling issues
    const pushoverPayload = new URLSearchParams();
    pushoverPayload.append('token', pushoverToken);
    pushoverPayload.append('user', pushoverUser);
    pushoverPayload.append('message', message);
    pushoverPayload.append('title', title);
    pushoverPayload.append('priority', '1');
    pushoverPayload.append('sound', 'persistent');

    console.log('🔔 Calling Pushover API directly');

    const response = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      body: pushoverPayload,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const responseData = await response.json();
    console.log('🔔 Pushover API response:', responseData);

    if (responseData.status === 1) {
      console.log('✅ Call notification sent successfully');
    } else {
      console.error('❌ Pushover API error:', responseData);
    }

  } catch (error) {
    console.error('❌ Call notification failed:', error);
  }
}

/**
 * Notify team about completed phone call
 */
async function notifyTeam(callData) {
  try {
    const cleanPhoneNumber = callData.phoneNumber.replace(/[^\d]/g, '');
    const formattedNumber = cleanPhoneNumber.length === 10 ? 
      `(${cleanPhoneNumber.substr(0,3)}) ${cleanPhoneNumber.substr(3,3)}-${cleanPhoneNumber.substr(6,4)}` : 
      callData.phoneNumber;

    // Send completion notification using the same infrastructure
    await sendCallNotification({
      phoneNumber: callData.phoneNumber,
      callSid: callData.callSid,
      status: 'completed',
      duration: callData.duration
    });

    console.log('✅ Team notification sent');
  } catch (error) {
    console.error('❌ Team notification failed:', error);
  }
}

