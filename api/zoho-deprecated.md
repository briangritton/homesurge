# Zoho CRM Integration (Deprecated)

This document is provided to explain the deprecation of the Zoho CRM integration in favor of Firebase.

## Deprecated Files

The following files have been deprecated but are kept for reference:

1. `/api/zoho.js` - API endpoint for Zoho CRM integration
2. `/api/zoho-webhook.js` - Webhook endpoint for Zoho CRM events
3. `/src/services/zoho.js` - Frontend service for Zoho CRM interactions

## Migration to Firebase

The application has been migrated to use Firebase/Firestore directly for CRM functionality. This provides several benefits:

- Simplified architecture with direct client-side access to the database
- Reduced API complexity and latency
- Better customization options for the CRM functionality
- Easier management of leads and user permissions
- No need for webhook integrations

## Firebase Implementation

The Firebase implementation includes:

1. Direct Firestore database access for lead storage
2. Firebase Authentication for user management
3. Security rules to control access to leads and other data
4. Real-time updates for lead status changes

All functionality previously provided by Zoho CRM is now implemented using Firebase services.

## Notes for Developers

If you need to reactivate Zoho integration for any reason:

1. Review the deprecated files for implementation details
2. Update the API endpoints in `/api/index.js`
3. Replace Firebase service calls in the frontend code with Zoho service calls

However, it is strongly recommended to continue using the Firebase implementation for all CRM functionality.
