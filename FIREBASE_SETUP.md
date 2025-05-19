# Firebase Project Setup Guide

This guide explains how to set up your Firebase project for the SellForCash CRM system.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "sellforcash-crm")
4. Enable Google Analytics (recommended)
5. Choose your Google Analytics account or create a new one
6. Click "Create project"

## 2. Register Your Web App

1. From the project overview, click the web icon (</>) to add a web app
2. Enter an app nickname (e.g., "SellForCash Web CRM")
3. Check "Also set up Firebase Hosting" if you plan to use it
4. Click "Register app"
5. You'll see the Firebase configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

6. Copy these values to update the configuration in `src/services/firebase.js`

## 3. Set Up Authentication

1. In the Firebase console, go to "Authentication" 
2. Click "Get started"
3. Enable "Email/Password" authentication provider
4. Click the "Email/Password" provider
5. Toggle "Email/Password" to enabled
6. Click "Save"

## 4. Create Firestore Database

1. In the Firebase console, go to "Firestore Database" 
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location closest to your primary users (us-east1, us-central1, etc.)
5. Click "Enable"

## 5. Set Up Firestore Security Rules

1. In the Firestore Database section, go to the "Rules" tab
2. Replace the default rules with the rules from `FIRESTORE_SECURITY_RULES.md`
3. Click "Publish"

## 6. Create Admin User

You have two options to create the admin user:

### Option A: Using the Firebase Console (Easier)

1. Go to the Authentication section in Firebase Console
2. Click "Add User"
3. Enter an email and password for the admin
4. After creating the user, note the UID that was generated
5. Go to Firestore Database
6. Create a new collection called "users" 
7. Add a document with the UID from step 4 as the document ID
8. In this document, add these fields:
   - email: [the admin email]
   - name: "Admin User"
   - role: "admin"
   - createdAt: [click the timestamp icon]
   - updatedAt: [click the timestamp icon]
   - active: true

### Option B: Using a Script (More Technical)

1. Use the following command in your terminal to initialize the Firebase tools:

```bash
npm install -g firebase-tools
firebase login
firebase init
```

2. Select Firestore and Functions
3. Create a new directory called `scripts` in your project root
4. Create a file in that directory called `create-admin.js`
5. Add the following code (you'll need to update it with your Firebase config and desired admin details):

```javascript
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Set the admin details
const adminEmail = 'your-admin-email@example.com';
const adminPassword = 'your-secure-password';
const adminName = 'Admin User';

async function createAdmin() {
  try {
    // Create the admin user in Auth
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(adminEmail, adminPassword);
    
    // Add admin data to Firestore
    await db.collection('users').doc(userCredential.user.uid).set({
      email: adminEmail,
      name: adminName,
      role: 'admin',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      active: true
    });
    
    console.log(`Admin user created with UID: ${userCredential.user.uid}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the connection
    app.delete();
  }
}

createAdmin();
```

6. Run the script to create your admin user:

```bash
node scripts/create-admin.js
```

## 7. Update Firebase Configuration

Now that your Firebase project is set up, update the configuration in `src/services/firebase.js` with your actual Firebase details.

1. Open the file and replace the `firebaseConfig` object with the values from your Firebase project.
2. Test the authentication by logging in with your admin credentials.

## 8. Set Up Index (Optional, as needed)

As your CRM grows, you may need to create indexes for complex queries. When a query requires an index, Firestore will display an error with a direct link to create the required index.

Common indexes you might want to set up:

1. For lead listing with filters and sorting:
   - Collection: `leads`
   - Fields: 
     - `assignedTo` (Ascending)
     - `createdAt` (Descending)

2. For grouping leads by status:
   - Collection: `leads`
   - Fields:
     - `status` (Ascending)
     - `createdAt` (Descending)

## Additional Configuration

### Environment Variables (for Production)

For production deployment, it's recommended to use environment variables for your Firebase configuration instead of hardcoding it. With Vercel, you can set these values in your project settings.

1. Add the following to your `.env.local` file (do not commit this file to git):

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

2. Update your Firebase configuration to use these environment variables:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
```

3. Add these same values to your Vercel environment variables in the project settings.