# Facebook Ads Manager & Pixel Implementation Guide

## Overview

This guide outlines the Facebook Pixel and Conversions API implementation for your website. The integration is designed to track user journeys through your form funnel and create custom audiences for retargeting campaigns.

## Implementation Checklist

### 1. Environment Setup

- [ ] Add the Facebook Pixel ID to your environment variables:
  ```
  REACT_APP_FB_PIXEL_ID=your_pixel_id_here
  ```

- [ ] Add the Facebook Access Token to your server environment:
  ```
  FB_ACCESS_TOKEN=EAAOqI5JShIwBO56ny5Dws1125ZCPjwW5pOfOGGAcU6PzE4m1hW4OTeO4Qf8G6p1RQjwZBDkOA7XMZBU6vSQOdpnpKhHJTpBuQtjd7O6MjAVLuG14tNC6tAPLodhyHiXWVPpWPuvKlrUpVIOOQPuqt3d2fX8F54ngFw4kySHPwQl1htHeqSxaZBbUz3dmw3nvbQZDZD
  ```

- [ ] Add the Facebook API version to your server environment:
  ```
  FB_API_VERSION=v17.0
  ```

### 2. Add Facebook Pixel Base Code to `index.html`

Add the following code before the closing `</head>` tag in `public/index.html`:

```html
<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  
  // This will be replaced with your actual Pixel ID from environment variables
  fbq('init', '%REACT_APP_FB_PIXEL_ID%');
  fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
       src="https://www.facebook.com/tr?id=%REACT_APP_FB_PIXEL_ID%&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Pixel Code -->
```

### 3. Install Required Packages

```bash
npm install react-facebook-pixel axios crypto-js dotenv --save
```

### 4. Deploy the Server-Side Component

The `api/facebook-events.js` file should be deployed as a serverless function. This handles the Conversions API implementation for server-side tracking.

For Vercel deployment, this should work automatically as an API route.

### 5. Verify Implementation

- Open the Facebook Events Manager
- Use the Test Events feature to confirm events are being received
- Check both browser (pixel) and server (Conversions API) events

## Events Being Tracked

This implementation tracks the following standard Facebook events:

1. **ViewContent** - Any page view on your site
2. **InitiateCheckout** - When a user enters an address (Form Step 1)
3. **AddPaymentInfo** - When a user provides personal info (Form Step 2)
4. **Lead** - When a user completes the qualifying form (Form Step 3)
5. **CompleteRegistration** - When a user reaches the thank you page (Form Step 4)

## Custom Audience Setup

In Facebook Ads Manager, create the following custom audiences:

1. **Site Visitors**: Anyone who triggered ViewContent
2. **Address Entered**: Anyone who triggered InitiateCheckout
3. **Contact Info Provided**: Anyone who triggered AddPaymentInfo
4. **Form Qualified**: Anyone who triggered Lead
5. **Form Completed**: Anyone who triggered CompleteRegistration

Create additional audience segments based on property value ranges using custom parameters.

## Google Analytics Connection

For better attribution:

1. In Facebook Events Manager, navigate to Settings
2. Select "Connect Data Sources"
3. Choose Google Analytics 4
4. Follow the authentication steps to connect your GA4 account
5. Select the properties you want to connect
6. Enable data sharing between platforms

## Security Considerations

- The access token in `TO_DELETE_fb_config.js` should be converted to environment variables before deploying to production
- Ensure all user data is properly hashed before sending to Facebook
- Remove the temporary configuration file after setup is complete

## Additional Resources

- [Facebook Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel/)
- [Conversions API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api/)
- [Facebook Pixel Helper Chrome Extension](https://developers.facebook.com/docs/facebook-pixel/support/pixel-helper/)