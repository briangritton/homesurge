# Twilio Messaging Integration Guide for SellForCash CRM

This guide explains how to set up and use the Twilio messaging notification system for your SellForCash CRM. The system sends notifications to sales representatives and administrators when leads are assigned.

## WhatsApp Business API (Primary Method)

We've chosen WhatsApp as our primary notification channel due to its better deliverability, rich features, and simpler compliance requirements compared to SMS.

### Setup Requirements

#### 1. Create a Twilio Account & Configure WhatsApp

1. Sign up for a Twilio account at https://www.twilio.com/try-twilio
2. Navigate to Messaging > Try WhatsApp
3. Follow Twilio's WhatsApp Business Profile setup process
4. Create and get approval for message templates
5. Note your:
   - Twilio Account SID
   - Twilio Auth Token
   - Twilio WhatsApp Sender (usually begins with "whatsapp:+14155238886")

#### 2. Configure Vercel Environment Variables

Add the following environment variables to your Vercel project settings:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Your Twilio account SID | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Your Twilio auth token | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_WHATSAPP_NUMBER` | Your Twilio WhatsApp number | `whatsapp:+14155238886` |
| `ADMIN_PHONE_NUMBER` | Admin's phone number (with WhatsApp) | `+15557654321` |

To add these variables:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable and its value
5. Deploy your project to apply the changes

#### 3. Message Templates

For WhatsApp, you need pre-approved message templates for initial outreach. These templates need approval from WhatsApp. Example templates:

**Lead Assignment Template**:
```
Your new lead {{1}} is now ready in the CRM. Property address: {{2}}. View details: {{3}}
```

#### 4. User Setup

Ensure all sales representatives:
1. Have valid phone numbers in their user profiles (with country code)
2. Have WhatsApp installed and active on these numbers
3. Have opted in to receive WhatsApp messages from your business

## SMS Integration (Future Alternative)

While we're starting with WhatsApp, SMS integration can be added later. However, note that SMS in the US requires:

- 10DLC registration for business messaging
- Carrier fees and compliance requirements
- Potentially higher costs for high-volume sending

## How It Works

### Notification Flow

1. **Lead Assignment**: Admin assigns a lead to a sales rep in the CRM
2. **Notification Trigger**: System detects the assignment change
3. **WhatsApp Notification**: Messages are sent to:
   - The assigned sales rep with lead details and CRM link
   - The admin confirming the assignment

### Message Format

The sales rep receives:
```
Your new lead [Lead Name] is now ready in the CRM. Property address: [Address]. View details: [CRM Lead URL]
```

The admin receives:
```
Lead [Lead Name] assigned to [Sales Rep Name]. View details: [CRM Lead URL]
```

## Testing the Integration

To test the WhatsApp notification system:

1. Ensure your Twilio WhatsApp Business account is properly configured
2. Create a test sales rep with a valid WhatsApp-enabled phone number
3. Have the sales rep opt in to receive messages (by sending a message to your Twilio WhatsApp number)
4. Assign a lead to this sales rep from the admin dashboard
5. Verify message delivery in the Twilio dashboard

## Troubleshooting

If notifications aren't working:

1. **Check Logs**: Review your Vercel function logs for errors
2. **Verify Opt-In**: Ensure recipients have opted in to receive WhatsApp messages
3. **Template Issues**: Verify your message matches approved templates for first contact
4. **Phone Format**: Confirm phone numbers are in E.164 format (e.g., +15551234567)
5. **WhatsApp Status**: Check if recipients have active WhatsApp accounts

## Advantages of WhatsApp Over SMS

1. **No 10DLC Registration**: Avoid complex US carrier registration
2. **Higher Deliverability**: Better reliable delivery rates
3. **Rich Messages**: Support for images, documents, quick reply buttons
4. **Read Receipts**: Know when messages are delivered and read
5. **No Character Limits**: Send longer, more detailed notifications
6. **Cost-Effective**: Often cheaper, especially for international numbers

## Security Considerations

- Twilio credentials are stored securely in Vercel environment variables
- No sensitive credentials are exposed in client-side code
- End-to-end encryption for all WhatsApp messages
- Authentication with Twilio credentials for all API requests

---

For additional support or questions, contact your development team or refer to the [Twilio WhatsApp API Documentation](https://www.twilio.com/docs/whatsapp/api).