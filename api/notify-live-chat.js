/**
 * Live Chat Notification API
 * Sends Pushover notification when customer wants to chat with Spencer
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { leadId, customerName, message, notificationType = 'Live Chat Request' } = req.body;

    console.log('🔔 Live chat notification request:', {
      leadId,
      customerName,
      message,
      notificationType
    });

    // Send Pushover notification
    const pushoverToken = process.env.PUSHOVER_APP_TOKEN;
    const pushoverUser = "um62xd21dr7pfugnwanooxi6mqxc3n";
    
    if (!pushoverToken) {
      console.error('❌ PUSHOVER_APP_TOKEN environment variable not set');
      return res.status(500).json({ error: 'Pushover not configured' });
    }

    // Different notification messages based on type
    let notificationTitle, notificationMessage;
    
    if (notificationType === 'Chat interaction') {
      notificationTitle = "💬 Chat Interaction";
      notificationMessage = `${customerName || 'Customer'} sent their first chat message!\n\nMessage: "${message}"\n\nClick to respond: ${process.env.VERCEL_URL || 'https://homesurge.ai'}/admin/lead/${leadId}`;
    } else {
      notificationTitle = "💬 Live Chat Request";
      notificationMessage = `${customerName || 'Customer'} wants to chat with Spencer!\n\nMessage: ${message}\n\nClick to join: ${process.env.VERCEL_URL || 'https://homesurge.ai'}/admin/lead/${leadId}`;
    }

    console.log('🔔 Sending Pushover notification:', {
      title: notificationTitle,
      type: notificationType,
      message: notificationMessage.substring(0, 100) + '...'
    });

    // Call Pushover API
    const pushoverPayload = new URLSearchParams();
    pushoverPayload.append('token', pushoverToken);
    pushoverPayload.append('user', pushoverUser);
    pushoverPayload.append('message', notificationMessage);
    pushoverPayload.append('title', notificationTitle);
    pushoverPayload.append('priority', '1'); // High priority
    pushoverPayload.append('sound', 'persistent');
    pushoverPayload.append('url', `${process.env.VERCEL_URL || 'https://homesurge.ai'}/admin/lead/${leadId}`);
    pushoverPayload.append('url_title', 'Join Chat');

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
      console.log('✅ Live chat notification sent successfully');
      res.status(200).json({ 
        success: true, 
        message: 'Notification sent successfully',
        leadId 
      });
    } else {
      console.error('❌ Pushover API error:', responseData);
      res.status(500).json({ 
        error: 'Failed to send notification',
        details: responseData 
      });
    }

  } catch (error) {
    console.error('❌ Live chat notification error:', error);
    res.status(500).json({ 
      error: 'Notification processing failed',
      message: error.message 
    });
  }
}