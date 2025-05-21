/**
 * API route to send Pushover notifications
 * 
 * This endpoint handles sending notifications via the Pushover API
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const {
      token, // Will be ignored, we'll use the server-side token
      user,
      message,
      title,
      url,
      url_title,
      priority,
      sound
    } = req.body;
    
    // Validate required parameters
    if (!user || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: user and message are required' 
      });
    }
    
    // Use server-side token from environment variable
    const pushoverToken = process.env.PUSHOVER_APP_TOKEN;
    
    // Debugging info
    console.log('🔵🔵🔵 PUSHOVER API: Notification request received:', {
      hasUser: !!user,
      hasMessage: !!message,
      hasToken: !!pushoverToken,
      messagePreview: message ? message.substring(0, 30) + '...' : 'N/A',
      requestInfo: {
        method: req.method,
        contentType: req.headers['content-type'],
        bodySize: req.body ? JSON.stringify(req.body).length : 0
      }
    });
    
    if (!pushoverToken) {
      console.error('PUSHOVER_APP_TOKEN environment variable not set');
      return res.status(500).json({ 
        success: false, 
        error: 'Pushover configuration missing on server' 
      });
    }
    
    // Prepare request to Pushover API
    const pushoverPayload = new URLSearchParams();
    pushoverPayload.append('token', pushoverToken);
    pushoverPayload.append('user', user);
    pushoverPayload.append('message', message);
    
    if (title) pushoverPayload.append('title', title);
    if (url) pushoverPayload.append('url', url);
    if (url_title) pushoverPayload.append('url_title', url_title);
    if (priority) pushoverPayload.append('priority', priority);
    if (sound) pushoverPayload.append('sound', sound);
    
    // Send request to Pushover API
    console.log('🔵🔵🔵 PUSHOVER API: Sending request to Pushover API with payload:', Object.fromEntries(pushoverPayload));
    
    const pushoverResponse = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      body: pushoverPayload,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const responseText = await pushoverResponse.text();
    console.log('🔵🔵🔵 PUSHOVER API: Raw response:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('🔵🔵🔵 PUSHOVER API: Parsed response data:', responseData);
    } catch (err) {
      console.error('🔵🔵🔵 PUSHOVER API: Error parsing response:', err);
      return res.status(500).json({
        success: false,
        error: 'Error parsing Pushover API response',
        rawResponse: responseText
      });
    }
    
    if (responseData.status !== 1) {
      console.error('Pushover API error:', responseData);
      return res.status(500).json({ 
        success: false, 
        error: responseData.errors ? responseData.errors.join(', ') : 'Unknown error from Pushover API'
      });
    }
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      data: responseData 
    });
    
  } catch (error) {
    console.error('Error sending Pushover notification:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}