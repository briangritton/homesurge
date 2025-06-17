# Twilio Voice Call Tracking Setup Guide

This guide explains how to fix the "thanks for the call, configure your number's voice URL to change this message" issue and set up proper call tracking for your Twilio phone number.

## Problem Diagnosis

The default Twilio message occurs when:
1. **Voice URL returns non-TwiML content** (JSON instead of XML)
2. **Voice URL endpoint doesn't exist or returns errors**
3. **TwiML syntax errors in the response**
4. **Voice URL timeout** (Twilio waits 15 seconds max)
5. **Incorrect Content-Type header** (should be `text/xml` or `application/xml`)

## Solution Overview

We've created three separate endpoints to handle different aspects of call management:

1. **`/api/twilio-voice.js`** - Handles incoming calls and returns TwiML
2. **`/api/twilio-call-tracking.js`** - Tracks call analytics and conversions
3. **`/api/twilio-voicemail.js`** - Handles voicemail recordings

## Configuration Steps

### Step 1: Set Environment Variables

Add these to your Vercel environment variables:

```env
BUSINESS_PHONE_NUMBER=+15551234567  # Your actual business phone number
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+18888743302    # Your Twilio number
GA4_MEASUREMENT_ID=G-XXXXXXXXXX     # Optional: for call tracking
GA4_API_SECRET=xxxxxxxxxxxxxx       # Optional: for call tracking
```

### Step 2: Configure Twilio Phone Number

1. Log into your [Twilio Console](https://console.twilio.com/)
2. Go to **Phone Numbers** > **Manage** > **Active numbers**
3. Click on your phone number (e.g., (888) 874-3302)
4. In the **Voice Configuration** section:
   - **A call comes in**: Webhook
   - **URL**: `https://yourdomain.vercel.app/api/twilio-voice`
   - **HTTP Method**: POST
   - **Primary Handler Fails**: Leave blank or set to a fallback URL

### Step 3: Test the Setup

#### Test 1: Basic Call Flow
1. Call your Twilio number from any phone
2. You should hear: "Hello! Thank you for calling SellForCash..."
3. The call should forward to your business number
4. Check Vercel logs for debugging info

#### Test 2: Verify TwiML Response
Use curl to test the voice endpoint directly:

```bash
curl -X POST https://yourdomain.vercel.app/api/twilio-voice \
  -d "From=%2B15551234567" \
  -d "To=%2B18888743302" \
  -d "CallSid=CA1234567890abcdef"
```

Expected response:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Hello! Thank you for calling SellForCash. Please hold while we connect you to our team.</Say>
    <Dial action="/api/twilio-call-tracking" method="POST" timeout="30" callerId="+18888743302">
        <Number>+15551234567</Number>
    </Dial>
    <Say voice="alice">Sorry, we're unable to take your call right now. Please leave a message after the beep or visit our website at sellforCash dot com.</Say>
    <Record maxLength="60" action="/api/twilio-voicemail" />
</Response>
```

## Call Flow Explanation

1. **Incoming Call** → `/api/twilio-voice` (returns TwiML)
2. **Call Greeting** → Plays welcome message
3. **Call Forwarding** → Dials your business number
4. **Answered Call** → Tracks conversion via `/api/twilio-call-tracking`
5. **Unanswered Call** → Records voicemail via `/api/twilio-voicemail`

## Debugging Common Issues

### Issue 1: Still Getting Default Message

**Possible Causes:**
- Voice URL not updated in Twilio Console
- Endpoint returning wrong Content-Type
- TwiML syntax errors

**Solutions:**
1. Verify Voice URL is exactly: `https://yourdomain.vercel.app/api/twilio-voice`
2. Check Vercel function logs for errors
3. Test endpoint manually with curl

### Issue 2: Call Not Forwarding

**Possible Causes:**
- BUSINESS_PHONE_NUMBER not set
- Invalid phone number format
- Twilio account permissions

**Solutions:**
1. Set BUSINESS_PHONE_NUMBER environment variable
2. Use E.164 format: +1XXXXXXXXXX
3. Verify your Twilio account can make outbound calls

### Issue 3: No Call Tracking

**Possible Causes:**
- `/api/twilio-call-tracking` endpoint errors
- Missing analytics configuration
- Webhook not receiving data

**Solutions:**
1. Check Vercel logs for the tracking endpoint
2. Verify GA4 credentials if using analytics
3. Test with minimum 10-second call duration

## Advanced Configuration

### Custom Greeting Message
Edit the `<Say>` content in `/api/twilio-voice.js`:

```xml
<Say voice="alice">Your custom greeting message here.</Say>
```

### Different Business Hours
Add time-based logic to route calls differently:

```javascript
const now = new Date();
const hour = now.getHours();
const isBusinessHours = hour >= 9 && hour <= 17; // 9 AM to 5 PM

if (isBusinessHours) {
    // Forward to business number
} else {
    // Go straight to voicemail
}
```

### Multiple Forwarding Numbers
Use multiple `<Number>` tags for failover:

```xml
<Dial action="/api/twilio-call-tracking" method="POST" timeout="15">
    <Number>+15551234567</Number>
    <Number>+15559876543</Number>
</Dial>
```

## Monitoring and Analytics

### Call Volume Tracking
- Check Twilio Console for call logs
- Review Vercel function logs
- Monitor GA4 events (if configured)

### Conversion Tracking
- Calls ≥10 seconds = conversion
- Automatic voicemail detection
- Team notifications for qualified calls

## Troubleshooting Checklist

- [ ] Voice URL configured in Twilio Console
- [ ] Environment variables set in Vercel
- [ ] Business phone number in E.164 format
- [ ] TwiML endpoint returns `text/xml` Content-Type
- [ ] All three endpoints deployed successfully
- [ ] Test call completes full flow
- [ ] Call tracking data appears in logs

## Support

If you're still experiencing issues:

1. **Check Vercel Logs**: Go to your Vercel dashboard → Functions → View logs
2. **Check Twilio Logs**: Go to Twilio Console → Monitor → Logs → Errors
3. **Test Endpoints**: Use curl to test each endpoint manually
4. **Verify Configuration**: Double-check all environment variables and URLs

The key fix is ensuring your Voice URL points to `/api/twilio-voice` (not `/api/twilio-call-tracking`) and that it returns proper TwiML XML with the correct Content-Type header.