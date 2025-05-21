# WhatsApp Template Notification Setup

This guide explains how to set up WhatsApp notifications using your approved Twilio template.

## Prerequisites

1. Twilio account with WhatsApp Business API access
2. Approved WhatsApp template in Twilio

## Environment Variables

Add the following environment variables to your Vercel project:

- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_WHATSAPP_NUMBER`: Your Twilio WhatsApp number with format "+14155238886" (or with "whatsapp:" prefix)
- `ADMIN_PHONE_NUMBER`: The admin's phone number for notifications (with country code)
- `TWILIO_TEMPLATE_SID`: The SID of your approved WhatsApp template

## Finding Your Template SID

1. Login to your Twilio console (https://console.twilio.com/)
2. Navigate to "Messaging" → "Try it out" → "Send a WhatsApp message"
3. Select your WhatsApp sender
4. Under "Message Content", find "Choose a Template" dropdown
5. Select your approved template
6. The Template SID will be displayed or can be found in the URL

## Template Variables

The WhatsApp notification system expects your template to have four variables:

1. Lead name
2. Property address
3. Lead phone number
4. CRM link

Make sure your approved template includes these variables in the correct order.

## Example Template

An example of what your approved template might look like:

```
Your new lead {{1}} is ready in the CRM. 

Property address: {{2}}
Contact: {{3}}

View details: {{4}}
```

## Testing

To test your WhatsApp notification system:

1. Set all environment variables in Vercel
2. Create a test lead with a valid property address
3. Assign the lead to a sales rep with a valid WhatsApp-enabled phone number
4. Check that both the sales rep and admin receive WhatsApp notifications

## Troubleshooting

If WhatsApp notifications aren't working:

1. Verify all environment variables are set correctly in Vercel
2. Check that the Template SID is correct and points to an approved template
3. Ensure recipients have WhatsApp installed on their phones
4. Verify recipients have opted in to receive messages from your WhatsApp business number
5. Check Twilio logs for any delivery issues or errors
6. Verify phone numbers are in the correct format with country code (e.g., +15551234567)