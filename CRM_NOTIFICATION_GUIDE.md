# CRM Notification System Guide

This guide explains the different notification methods available in your SellForCash CRM system and how to set them up.

## Notification Methods

### 1. WhatsApp Notifications via Twilio (Primary Method)

WhatsApp notifications are sent to sales representatives and administrators when a lead is assigned. We've chosen WhatsApp as the primary notification channel due to its better deliverability, rich features, and simpler compliance requirements compared to SMS.

**Setup Requirements:**
- Twilio account with WhatsApp Business API access
- Environment variables set in Vercel:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_WHATSAPP_NUMBER`
  - `ADMIN_PHONE_NUMBER`
- Valid phone numbers with WhatsApp installed for all sales reps

### 2. Email Notifications via Firebase Extensions

Email notifications are sent for various lead events. These provide more detailed information than WhatsApp and can include links to the CRM.

**Setup Requirements:**
- Firebase Extension "Trigger Email" installed in your Firebase project
- Email templates created in the Firebase Extension:
  - `lead-assignment` - For notifying sales reps of new assignments
  - `admin-new-lead` - For notifying admins of new leads
- Admin email configured in Notification Settings

### 3. SMS Notifications (Future Alternative)

Traditional SMS can be implemented later if needed, but requires additional compliance work for US numbers (10DLC registration).

### 4. In-App Notifications (Future Enhancement)

Real-time in-app notifications can be implemented using Firebase Firestore listeners, allowing users to see notifications while using the CRM.

### 5. Firebase Cloud Messaging (Web Push)

Browser push notifications can be implemented using Firebase Cloud Messaging (FCM) to notify users even when they don't have the CRM open.

### 6. Webhook Integrations (Future Enhancement)

Webhooks can be used to send notifications to external systems like Slack, Discord, or other business tools.

## Configuration

### Admin Dashboard Settings

1. **Auto-Assignment Settings:**
   - Enable/disable auto-assignment
   - Configure lead distribution logic
   - Manually trigger assignment for unassigned leads

2. **Notification Settings:**
   - Configure admin email address
   - Enable/disable email notifications
   - Enable/disable WhatsApp notifications
   - Select which events trigger notifications

### User Management

Each sales representative should have:
- A valid phone number with WhatsApp installed (with country code)
- A valid email address for email notifications
- Opt-in to receive WhatsApp messages from your business number

## Notification Workflows

### New Lead Creation

1. Lead is submitted through website form
2. Lead is created in Firebase
3. If auto-assignment is enabled, lead is assigned to a sales rep
4. Admin receives email notification of new lead
5. If assigned, sales rep receives WhatsApp and email notifications

### Lead Assignment

1. Admin manually assigns a lead or auto-assignment occurs
2. Sales rep receives WhatsApp notification with lead details and CRM link
3. Sales rep receives email notification with complete lead details
4. Admin receives notification confirming the assignment

## Setting Up Firebase Email Extension

To enable email notifications, you'll need to install the "Trigger Email" extension in your Firebase project:

1. Go to Firebase Console → Extensions
2. Find and install "Trigger Email"
3. Configure SMTP settings (can use SendGrid, Mailgun, etc.)
4. Create email templates:

**Lead Assignment Template:**
```html
<h2>New Lead Assigned</h2>
<p>Hello {{salesRepName}},</p>
<p>A new lead has been assigned to you:</p>
<ul>
  <li><strong>Name:</strong> {{leadName}}</li>
  <li><strong>Address:</strong> {{leadAddress}}</li>
  <li><strong>Phone:</strong> {{leadPhone}}</li>
  <li><strong>Email:</strong> {{leadEmail}}</li>
</ul>
<p><a href="{{leadURL}}">View lead details in CRM</a></p>
<p>Assigned on: {{assignedDate}}</p>
```

**Admin New Lead Template:**
```html
<h2>New Lead Created</h2>
<p>A new lead has been created in your CRM:</p>
<ul>
  <li><strong>Name:</strong> {{leadName}}</li>
  <li><strong>Address:</strong> {{leadAddress}}</li>
  <li><strong>Phone:</strong> {{leadPhone}}</li>
  <li><strong>Email:</strong> {{leadEmail}}</li>
  <li><strong>Source:</strong> {{leadSource}}</li>
  <li><strong>Campaign:</strong> {{campaignName}}</li>
</ul>
<p><a href="{{leadURL}}">View lead details in CRM</a></p>
<p>Created on: {{createdDate}}</p>
```

## Troubleshooting

### WhatsApp Notifications

If WhatsApp notifications aren't working:
- Ensure recipients have WhatsApp installed on their phones
- Verify recipients have opted in to receive messages
- Check if your message templates are approved (for first contact)
- Verify phone numbers are in E.164 format (e.g., +15551234567)
- Check Twilio logs for delivery issues

### Email Notifications

If email notifications aren't working:
- Verify Firebase Extension "Trigger Email" is properly installed
- Check email templates exist and are correctly formatted
- Ensure admin email is correctly set in Notification Settings
- Check Firebase functions logs for any errors

## Advantages of WhatsApp Over SMS

1. **No 10DLC Registration**: Avoid complex US carrier registration
2. **Higher Deliverability**: Better reliable delivery rates
3. **Rich Messages**: Support for images, documents, quick reply buttons
4. **Read Receipts**: Know when messages are delivered and read
5. **No Character Limits**: Send longer, more detailed notifications
6. **Cost-Effective**: Often cheaper, especially for international numbers

## Future Enhancements

The notification system is designed to be extensible. Some planned future enhancements:

1. **Notification Preferences** - Allow users to set their preferred notification methods
2. **Notification History** - Track and display notification history
3. **Custom Notifications** - Allow creating custom notification triggers
4. **Mobile App Notifications** - Add push notifications for mobile apps
5. **Scheduled Notifications** - Add follow-up reminders for leads