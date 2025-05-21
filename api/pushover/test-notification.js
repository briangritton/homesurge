/**
 * API route to test Pushover notifications
 * 
 * This endpoint allows for direct testing of the Pushover API
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { user_key } = req.body;
    
    // Validate required parameters
    if (!user_key) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameter: user_key' 
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
    pushoverPayload.append('user', user_key);
    pushoverPayload.append('message', 'This is a test notification from SellForCash CRM');
    pushoverPayload.append('title', 'Notification Test');
    pushoverPayload.append('priority', 1);
    pushoverPayload.append('sound', 'persistent');
    
    console.log('Sending test notification to Pushover API:', {
      user: user_key,
      token_provided: pushoverToken ? 'Yes' : 'No'
    });
    
    // Send request to Pushover API
    const pushoverResponse = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      body: pushoverPayload,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const responseData = await pushoverResponse.json();
    console.log('Pushover API response:', responseData);
    
    if (responseData.status !== 1) {
      console.error('Pushover API error:', responseData);
      return res.status(500).json({ 
        success: false, 
        error: responseData.errors ? responseData.errors.join(', ') : 'Unknown error from Pushover API',
        response: responseData
      });
    }
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      data: responseData 
    });
    
  } catch (error) {
    console.error('Error sending test notification:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}