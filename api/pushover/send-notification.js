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
    const pushoverResponse = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      body: pushoverPayload,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const responseData = await pushoverResponse.json();
    
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