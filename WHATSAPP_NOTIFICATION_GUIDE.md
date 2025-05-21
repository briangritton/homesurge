# WhatsApp Notification System Guide

This document explains how the WhatsApp notification system works with the notification settings in the CRM.

## Overview

The application uses Twilio's WhatsApp Business API to send notifications when:
1. A new lead is created
2. A lead is assigned to a sales representative

These notifications can be controlled via the Notification Settings in the CRM admin dashboard.

## Notification Settings

The following settings in the CRM dashboard affect WhatsApp notifications:

1. **WhatsApp Notifications Enabled/Disabled** - Master toggle for all WhatsApp notifications
2. **Notify on new lead creation** - Controls notifications for new leads
3. **Notify when leads are assigned** - Controls notifications for lead assignments
4. **Notify when appointments are set** - Controls notifications for appointments

## How It Works

1. When a lead is assigned to a sales rep, the system checks the notification settings
2. If WhatsApp notifications are disabled, no messages are sent
3. If WhatsApp notifications are enabled, the system checks if lead assignment notifications are enabled
4. If all conditions are met, WhatsApp messages are sent to:
   - The assigned sales representative (with lead details)
   - The admin (with lead details and assignment information)

## Technical Implementation

The notification system respects the settings stored in Firestore:
- `settings/notifications` document contains all notification preferences
- `smsNotificationsEnabled` controls the master WhatsApp toggle
- `notifyOnLeadAssignment` controls notifications for lead assignments
- `notifyOnNewLead` controls notifications for new leads

## Customizing Recipients

Currently, notifications are sent to:
1. The assigned sales representative
2. The administrator specified in the `ADMIN_PHONE_NUMBER` environment variable

To modify who receives notifications, you'll need to update:
1. The `src/services/twilio.js` file for the frontend logic
2. The `/api/twilio/send-whatsapp.js` file for the API endpoint

## Troubleshooting

If WhatsApp notifications aren't working as expected:

1. Check the Notification Settings in the CRM admin dashboard
2. Verify the toggles are set correctly for your desired notification behavior
3. Check the browser console and server logs for any errors
4. Ensure the environment variables are set correctly in Vercel
5. Verify the phone numbers are in the correct format with country codes

## Future Enhancements

Potential improvements to the notification system:
1. Per-user notification preferences
2. Additional notification events (status changes, comments, etc.)
3. Scheduled notifications for follow-ups
4. Customizable notification templates per event type