/**
 * Test endpoint to verify call notifications work
 */

export default async function handler(req, res) {
  try {
    console.log('🧪 Testing call notification...');
    
    // Test the push notification function
    await sendPushoverNotification({
      message: "📞 TEST: Real Estate Lead calling from (555) 123-4567",
      title: "Test Call Notification",
      priority: 1,
      sound: "persistent"
    });

    res.status(200).json({ 
      success: true, 
      message: 'Test notification sent' 
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({ 
      error: 'Test failed',
      details: error.message 
    });
  }
}

/**
 * Send Pushover notification using existing API endpoint
 */
async function sendPushoverNotification(data) {
  const PUSHOVER_USER = "um62xd21dr7pfugnwanooxi6mqxc3n";

  try {
    const response = await fetch(`https://homesurge.ai/api/pushover/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: PUSHOVER_USER,
        message: data.message,
        title: data.title || "Real Estate Call",
        priority: data.priority || 0,
        sound: data.sound || "pushover"
      })
    });

    console.log('📱 Pushover response status:', response.status);
    const responseText = await response.text();
    console.log('📱 Pushover response:', responseText);

    if (response.ok) {
      console.log('✅ Test notification sent successfully');
    } else {
      console.error('❌ Test notification failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Test notification failed:', error);
    throw error;
  }
}