# EmailJS Notification System

This document explains the current notification system using EmailJS.

## Overview

The application uses EmailJS to send notifications when a new lead submits their contact information. This implementation replaces the previous Firebase Extension-based approach with a simpler, more direct method.

## Configuration

The EmailJS service is configured with the following information:

- **Public Key**: `afTroSYel0GQS1oMc`
- **Service ID**: `service_zeuf0n8`
- **Template ID**: `template_kuv08p4`

## How It Works

1. When the app starts, it initializes EmailJS with the public key in `App.jsx`.

2. When a user submits the PersonalInfoForm with their name and phone number, the following happens:
   - The form data is saved to Firebase as usual
   - The `sendLeadNotificationEmail()` function is called with the lead's information
   - EmailJS sends the notification to the designated recipients (configured in the EmailJS template)

3. The following data is sent to the email template:
   - Lead name (`{{lead_name}}`)
   - Lead phone number (`{{lead_phone}}`)
   - Property address (`{{lead_address}}`)
   - Lead email (`{{lead_email}}`, if provided)
   - Lead source (`{{lead_source}}`)
   - Campaign information (`{{campaign_name}}`, `{{utm_source}}`, etc.)
   - Submission time (`{{submission_time}}`)
   - **CRM Link** (`{{crm_link}}`) - Direct link to view the lead in the CRM

## Advantages Over Previous Method

- **Simpler setup**: No need for Firebase Extensions or complex SMTP configuration
- **Direct integration**: No intermediate services or dependencies
- **Easy maintenance**: Email templates can be edited in the EmailJS dashboard
- **Reliable delivery**: Uses EmailJS's dedicated email delivery service

## Customizing Templates

To modify the email templates:

1. Log in to the [EmailJS dashboard](https://dashboard.emailjs.com/templates)
2. Select the template with ID `template_kuv08p4`
3. Edit the template design, subject line, or recipient list
4. Save changes - they will take effect immediately

### Adding Clickable Links

In your template, you can now add clickable links for both the CRM and phone number:

```html
<!-- Clickable CRM Link -->
<p><strong>View Lead in CRM:</strong> <a href="{{crm_link}}">Click here to view lead details</a></p>

<!-- Clickable Phone Number -->
<p><strong>Phone:</strong> <a href="tel:{{lead_phone}}">{{lead_phone}}</a></p>
```

These will generate clickable links that:
- Take the recipient directly to the lead's page in the CRM system
- Allow for one-tap calling of the lead's phone number (especially useful on mobile devices)

## Troubleshooting

If notifications are not being received:

1. Check the browser console for any errors related to EmailJS
2. Verify that the correct Service ID and Template ID are being used
3. Check the EmailJS dashboard for any failed sends
4. Ensure the template has valid recipient email addresses
5. Verify your EmailJS account is active and hasn't hit any sending limits
