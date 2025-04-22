// api/zoho-test.js
// Simple test endpoint to verify webhook URL accessibility

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Zoho-Webhook-Token');
  
  // Log the request details
  console.log('====== TEST ENDPOINT RECEIVED REQUEST ======');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', req.body ? JSON.stringify(req.body, null, 2) : 'No body');
  
  // Return a 200 OK for any request method
  return res.status(200).json({
    success: true,
    message: 'Test endpoint is working',
    receivedMethod: req.method,
    receivedHeaders: req.headers,
    receivedBody: req.body || {},
    timestamp: new Date().toISOString()
  });
};