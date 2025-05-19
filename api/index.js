/**
 * API routes index for Vercel serverless functions
 * This file provides an overview of available API endpoints
 */

module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Return information about available API routes
  return res.status(200).json({
    message: 'SellForCash API',
    available_routes: [
      // Zoho endpoints have been deprecated in favor of Firebase
      // {
      //   path: '/api/zoho',
      //   methods: ['POST'],
      //   description: 'Zoho CRM integration for lead management (deprecated)'
      // },
      // {
      //   path: '/api/zoho-webhook',
      //   methods: ['POST'],
      //   description: 'Webhook endpoint for receiving events from Zoho (deprecated)'
      // },
      {
        path: '/api/facebook-events',
        methods: ['POST'],
        description: 'Send events to Facebook Conversions API'
      }
    ],
    documentation: 'Refer to implementation-guide.md for details about API usage'
  });
};