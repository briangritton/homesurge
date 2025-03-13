# Setup Guide for Zoho CRM Integration

This guide will help you complete the setup of your simplified lead form application with Zoho CRM integration.

## 1. Setting up the API Endpoints

The current implementation uses placeholder URLs in `src/services/zoho.js`:

```javascript
const API_ENDPOINTS = {
  CREATE_LEAD: 'https://leads.goinsightmarketing.com/api/re/RegisterReUser',
  UPDATE_LEAD: 'https://leads.goinsightmarketing.com/api/re/RegisterReUser',
  SAVE_RECORD: 'https://leads.goinsightmarketing.com/api/re/saverecord'
};
```

You'll need to update these with your actual Zoho API endpoints. There are two approaches you can take:

### Option 1: Keep using your existing API proxy

If you prefer to continue using the existing API endpoints that forward to Zoho, you can keep these URLs as they are. Make sure the API is still active and accepting requests.

### Option 2: Direct Zoho CRM API integration

For a more direct integration with Zoho CRM API:

1. Create a Zoho Developer account at https://api-console.zoho.com/
2. Create a new Server-Based Application
3. Generate a self-client and obtain OAuth credentials
4. Update the `zoho.js` file to use the official Zoho CRM API endpoints

Example update for direct Zoho integration:

```javascript
// Add these imports
import axios from 'axios';

// Configuration
const ZOHO_CLIENT_ID = process.env.REACT_APP_ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.REACT_APP_ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.REACT_APP_ZOHO_REFRESH_TOKEN;
let ZOHO_ACCESS_TOKEN = '';

// Function to get access token
async function getAccessToken() {
  if (ZOHO_ACCESS_TOKEN) return ZOHO_ACCESS_TOKEN;
  
  const response = await axios.post(
    'https://accounts.zoho.com/oauth/v2/token',
    null,
    {
      params: {
        refresh_token: ZOHO_REFRESH_TOKEN,
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }
    }
  );
  
  ZOHO_ACCESS_TOKEN = response.data.access_token;
  return ZOHO_ACCESS_TOKEN;
}

// Updated function to create lead in Zoho CRM
export async function submitLeadToZoho(formData) {
  try {
    const accessToken = await getAccessToken();
    
    const payload = {
      data: [
        {
          Name: formData.name,
          Phone: formData.phone,
          Email: formData.email,
          Street: formData.street,
          City: formData.city,
          Zip_Code: formData.zip,
          Lead_Source: formData.trafficSource,
          // Map all other fields accordingly
        }
      ]
    };
    
    const response = await axios.post(
      'https://www.zohoapis.com/crm/v2/Leads',
      payload,
      {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.data[0].id;
  } catch (error) {
    console.error('Error creating lead in Zoho:', error);
    throw error;
  }
}

// Similar updates for updateLeadInZoho function
```

## 2. Field Mapping

Ensure that the fields you're sending to Zoho CRM match the field names in your Zoho CRM setup. You'll need to map the form fields to the corresponding Zoho fields:

1. Go to Zoho CRM > Setup > Customization > Modules and Fields
2. Select the "Leads" module
3. Review the fields and make note of their API names (these will be different from the display names)
4. Update the data payloads in the Zoho service to use the correct field names:

```javascript
// Example payload with mapped field names
const payload = {
  data: [
    {
      // Standard fields
      Last_Name: formData.name, // Zoho requires Last_Name at minimum
      Phone: formData.phone,
      Email: formData.email,
      
      // Address fields
      Street: formData.street,
      City: formData.city,
      Zip: formData.zip,
      State: "GA", // default state
      
      // Custom fields (use the exact API names from your Zoho setup)
      addressSelectionType: formData.addressSelectionType,
      isPropertyOwner: formData.isPropertyOwner,
      needsRepairs: formData.needsRepairs,
      workingWithAgent: formData.workingWithAgent,
      homeType: formData.homeType,
      remainingMortgage: formData.remainingMortgage,
      // Map all other fields...
      
      // Campaign tracking
      Lead_Source: formData.trafficSource,
      campaignName: formData.campaignName,
      adgroupName: formData.adgroupName,
      keyword: formData.keyword,
      device: formData.device,
      gclid: formData.gclid
    }
  ]
};
```

## 3. Google Maps API Setup

To enable the address autocomplete functionality:

1. Visit the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Places API" and "Maps JavaScript API"
4. Create an API key with appropriate restrictions
5. Add the API key to your `.env` file:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
6. Update the HTML file to load the Google Maps script:

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- other head content -->
    <script src="https://maps.googleapis.com/maps/api/js?key=%REACT_APP_GOOGLE_MAPS_API_KEY%&libraries=places"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## 4. Analytics Setup

### Google Analytics

1. Create or access your Google Analytics account
2. Get your Measurement ID (starts with G-)
3. Add it to your `.env` file:
   ```
   REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
   ```

### Facebook Pixel

1. Create or access your Facebook Business account
2. Create a pixel or get the ID of an existing one
3. Add it to your `.env` file:
   ```
   REACT_APP_FB_PIXEL_ID=XXXXXXXXXX
   ```

### Google Tag Manager

1. Create or access your Google Tag Manager account
2. Get your GTM container ID
3. Add it to your `.env` file:
   ```
   REACT_APP_GTM_ID=GTM-XXXXXXX
   ```
4. Set up tags in GTM for tracking form submissions and other events

## 5. Firebase Setup

For hosting your application on Firebase:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Login to Firebase: `firebase login`
4. Initialize Firebase in your project: `firebase init`
   - Select "Hosting"
   - Choose your Firebase project
   - Set "build" as your public directory
   - Configure as a single-page app
5. Build your project: `npm run build`
6. Deploy to Firebase: `firebase deploy`

## 6. Vercel Setup

As an alternative to Firebase, you can deploy on Vercel:

1. Create a Vercel account at [vercel.com](https://vercel.com/)
2. Install Vercel CLI: `npm install -g vercel`
3. Login to Vercel: `vercel login`
4. Deploy your app: `vercel`
5. For production deployment: `vercel --prod`

## 7. GitHub Integration

To set up continuous deployment from GitHub:

1. Create a GitHub repository
2. Push your code to the repository:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```
3. Connect your GitHub repository to Vercel or Firebase for automatic deployments
4. Set up environment variables in your deployment platform's dashboard

## 8. Testing the Integration

Before going live, thoroughly test the integration:

1. Start with the local development server: `npm start`
2. Submit test leads through the form
3. Verify that leads appear correctly in Zoho CRM
4. Check that all fields are mapped correctly
5. Test the different form steps and qualification questions
6. Verify analytics tracking is working

## 9. Going Live

Once testing is complete:

1. Deploy the final version to your hosting platform
2. Configure your domain name if you have one
3. Set up HTTPS (Firebase and Vercel handle this automatically)
4. Monitor initial submissions to ensure everything works in production

## 10. Maintenance

Regular maintenance tasks:

1. Keep dependencies updated: `npm update`
2. Monitor Zoho CRM API for any changes
3. Check analytics data regularly
4. Back up your code and configuration
5. Update content as needed (headlines, questions, etc.)

## Troubleshooting

If you encounter issues:

1. Check browser console for JavaScript errors
2. Verify API endpoints are accessible
3. Ensure your API keys and tokens are valid
4. Review network requests to identify API call failures
5. Check Zoho CRM logs for API issues
6. Verify your environment variables are set correctly

For any additional assistance or customizations, refer to the documentation or reach out for support.