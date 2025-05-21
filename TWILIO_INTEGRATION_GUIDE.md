# Twilio SMS Integration Guide for SellForCash CRM

This guide explains how to set up and use the Twilio SMS notification system for your SellForCash CRM. The system sends SMS notifications to sales representatives and administrators when leads are assigned.

## Setup Requirements

### 1. Create a Twilio Account

1. Sign up for a Twilio account at https://www.twilio.com/try-twilio
2. Purchase a Twilio phone number (or use a trial number for testing)
3. Note your:
   - Twilio Account SID
   - Twilio Auth Token
   - Twilio Phone Number

### 2. Configure Vercel Environment Variables

Add the following environment variables to your Vercel project settings:

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Your Twilio account SID | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Your Twilio auth token | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number with country code | `+15551234567` |
| `ADMIN_PHONE_NUMBER` | Admin's phone number to receive notifications | `+15557654321` |

To add these variables:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable and its value
5. Deploy your project to apply the changes

### 3. User Setup

Ensure all sales representatives have valid phone numbers in their user profiles:

1. Navigate to the "Sales Representatives" section in your admin dashboard
2. Make sure each sales rep has a valid phone number with country code (e.g., +1 for US)
3. If a sales rep doesn't have a phone number, add one using the "Add Sales Rep" button or update their existing profile

## How It Works

### SMS Notification Flow

1. **Lead Assignment**: When an admin assigns a lead to a sales rep in the CRM
2. **Notification Trigger**: The system detects the assignment change
3. **SMS Notification**: Two SMS messages are sent:
   - To the assigned sales rep with lead details and a link to view the lead
   - To the admin confirming the assignment

### SMS Format

The sales rep receives:
```
New lead assigned to you: [Lead Name] at [Address]. View details: [CRM Lead URL]
```

The admin receives:
```
Lead [Lead Name] assigned to [Sales Rep Name]. View details: [CRM Lead URL]
```

## Testing the Integration

To test the SMS notification system:

1. Ensure your Twilio account is active and funded (or in trial mode)
2. Create a test sales rep with a valid phone number
3. Assign a lead to this sales rep from the admin dashboard
4. Both the sales rep and admin should receive SMS notifications
5. Check your Twilio dashboard to verify SMS delivery and any errors

## Troubleshooting

If SMS notifications aren't working:

1. **Check Logs**: Review your Vercel function logs for any errors
2. **Verify Credentials**: Ensure your Twilio credentials are correct in Vercel environment variables
3. **Phone Format**: Confirm all phone numbers are in E.164 format (e.g., +15551234567)
4. **Twilio Balance**: Make sure your Twilio account has sufficient funds
5. **Sales Rep Phone**: Verify the sales rep has a valid phone number in their profile

## Cost Considerations

- Twilio charges per SMS sent (typically $0.0075 per message for US numbers)
- Two messages are sent per lead assignment (one to sales rep, one to admin)
- Consider implementing daily limits or batching notifications if you assign many leads

## Security Considerations

- Twilio credentials are stored securely in Vercel environment variables
- No sensitive credentials are exposed in client-side code
- Phone numbers are formatted to E.164 standard before sending
- All API requests are authenticated with your Twilio credentials

---

For additional support or questions, contact your development team or refer to the [Twilio Documentation](https://www.twilio.com/docs/sms).