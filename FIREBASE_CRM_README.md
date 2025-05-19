# SellForCash Firebase CRM

A custom-built CRM solution for SellForCash built using Firebase. This lightweight, purpose-built CRM replaces the previous Zoho integration with a simpler, more customized solution.

## Overview

The SellForCash Firebase CRM is a web-based customer relationship management system built specifically for lead management in the real estate industry. It provides:

- Lead tracking and management
- Sales rep assignment and activity monitoring
- Conversion event tracking
- Integration with existing website forms
- GTM/analytics compatibility

## Repository Structure

- `/src/components/CRM` - Main CRM components
- `/src/components/Admin` - Admin interface components  
- `/src/services/firebase.js` - Firebase service for lead management
- `FIREBASE_CRM_IMPLEMENTATION_PLAN.md` - Detailed implementation plan
- `FIREBASE_SETUP.md` - Guide for setting up the Firebase project
- `FIRESTORE_SCHEMA.md` - Detailed database schema documentation
- `FIRESTORE_SECURITY_RULES.md` - Security rules for Firestore
- `ZOHO_TO_FIREBASE_TRANSITION.md` - Guide for transitioning from Zoho to Firebase

## Prerequisites

- Node.js 14+ and npm
- Firebase account
- Vercel account (for deployment)

## Setup Instructions

Follow these steps to set up the CRM:

1. **Firebase Project Setup**
   - Follow the detailed instructions in `FIREBASE_SETUP.md`
   - Create a Firebase project
   - Configure Authentication
   - Set up Firestore database
   - Apply security rules
   - Create admin user

2. **Environment Configuration**
   - Create `.env.local` with Firebase configuration (see `FIREBASE_SETUP.md`)

3. **Install Dependencies**
   ```
   npm install
   ```

4. **Local Development**
   ```
   npm run dev
   ```

5. **Deploy to Vercel**
   ```
   vercel
   ```

## Accessing the CRM

- Local development: http://localhost:3000/crm
- Production: https://your-domain.com/crm

## Features

### Lead Management

- Create and update leads
- Track lead status and conversion events
- Assign leads to sales representatives
- View lead history and activity

### Admin Features

- Dashboard with key metrics
- Lead listing with filtering and sorting
- User management
- System configuration

### Sales Rep Features

- View assigned leads
- Update lead status
- Record customer interactions
- Set appointments

## Technical Implementation

### Firebase Services Used

- **Authentication** - User management and login
- **Firestore** - Database for leads and users
- **Security Rules** - Access control for collections

### Front-end Stack

- React for UI components
- React Router for navigation
- CSS-in-JS for styling

### Key Integration Points

1. **Form Integration**
   - The `submitLeadToFirebase` function in `/src/services/firebase.js` replaces the previous Zoho function
   - Updates needed in address and info forms

2. **Analytics**
   - All conversion events push to dataLayer for GTM
   - Event format matches previous Zoho implementation

## Customization

### Adding Custom Fields

1. Update the schema in `FIRESTORE_SCHEMA.md`
2. Add fields to the form components
3. Update the corresponding fields in firebase.js service

### Modifying Lead Status Options

1. Update the status options in `LeadDetail.jsx` and `LeadList.jsx`
2. Update the status color mapping

## Troubleshooting

### Common Issues

1. **Authentication Problems**
   - Verify Firebase configuration
   - Check user accounts in Firebase Console

2. **Missing Leads**
   - Check security rules
   - Verify form submission code

3. **Permission Errors**
   - Check user roles in Firestore
   - Verify security rules match the schema

### Support

For technical support or questions:
- Check the documentation in this repository
- Review [Firebase documentation](https://firebase.google.com/docs)

## Future Enhancements

Potential future additions:
- Mobile app for on-the-go access
- Email integration for automated follow-ups
- SMS notifications for new leads
- Advanced reporting and forecasting

## License

This project is proprietary and confidential to SellForCash.