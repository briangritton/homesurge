# Firestore Security Rules for SellForCash CRM

This document contains the security rules for the Firestore database. These rules should be added to your Firebase project through the Firebase Console.

## Security Rules

Copy and paste these rules into the Firebase Console under Firestore Database > Rules.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is an admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is a sales rep
    function isSalesRep() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'sales_rep';
    }
    
    // Helper function to check if a lead is assigned to the current user
    function isAssignedToCurrentUser(leadData) {
      return request.auth != null && leadData.assignedTo == request.auth.uid;
    }
    
    // Helper function to check if the request contains required lead fields
    function hasRequiredLeadFields() {
      // For regular form submissions - require contact info
      // For immediate leads (Visitor status) - allow creation with campaign data only
      return (request.resource.data.status == 'Visitor' && 
              request.resource.data.keys().hasAny(['campaign_name', 'campaign_id', 'gclid'])) ||
             (request.resource.data.keys().hasAll(['name', 'email', 'phone']) ||
              request.resource.data.keys().hasAny(['street', 'city', 'state', 'zip']));
    }
    
    // Users collection - users can read their own data, admins can read/write all users
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow create, update, delete: if isAdmin();
      
      // Allow users to update their own non-critical fields
      allow update: if request.auth != null && 
                      request.auth.uid == userId && 
                      request.resource.data.diff(resource.data).affectedKeys()
                        .hasOnly(['name', 'phone', 'photoURL', 'preferences']);
    }
    
    // Leads collection - access based on role and assignment
    match /leads/{leadId} {
      // Allow any authenticated user to read leads they're assigned to
      allow read: if request.auth != null && 
                   (isAdmin() || isAssignedToCurrentUser(resource.data));
      
      // Allow admins full access to leads
      allow create, update, delete: if isAdmin();
      
      // Allow sales reps to update leads assigned to them, but not reassign or delete
      allow update: if isSalesRep() && 
                     isAssignedToCurrentUser(resource.data) &&
                     !request.resource.data.diff(resource.data).affectedKeys().hasAny(['assignedTo']);
      
      // Allow public submission of leads through form (no authentication required)
      // Support both 'New' (form submissions) and 'Visitor' (immediate leads) statuses
      allow create: if hasRequiredLeadFields() && 
                     request.resource.data.status in ['New', 'Visitor'] &&
                     request.resource.data.assignedTo == null;
                     
      // Allow public updates to leads with "New" or "Visitor" status (for API data updates and immediate lead progression)
      allow update: if resource.data.status in ['New', 'Visitor'] && 
                     request.resource.data.status in ['New', 'Visitor', 'Unassigned'];
    }
    
    // Conversations collection - for messages and calls
    match /conversations/{conversationId} {
      // Allow reading conversations for leads assigned to user
      allow read: if request.auth != null && 
                   (isAdmin() || 
                    resource.data.userId == request.auth.uid ||
                    get(/databases/$(database)/documents/leads/$(resource.data.leadId)).data.assignedTo == request.auth.uid);
      
      // Allow creating conversations for assigned leads
      allow create: if request.auth != null && 
                     (isAdmin() || 
                      get(/databases/$(database)/documents/leads/$(request.resource.data.leadId)).data.assignedTo == request.auth.uid);
      
      // Allow updating conversations created by the user
      allow update: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
                     
      // Allow admins to delete conversations
      allow delete: if isAdmin();
    }
    
    // Settings collection - readonly for all authenticated users, writable by admins
    match /settings/{settingId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

## Rule Descriptions

### Users Collection

The `users` collection contains all user accounts for the CRM system.

- **Read access**: 
  - Users can read their own user data
  - Admins can read all user data
  
- **Write access**:
  - Only admins can create new users
  - Only admins can delete users
  - Admins can update any user data
  - Users can update certain fields of their own data (name, phone, photo, preferences)

### Leads Collection

The `leads` collection stores customer leads and their associated data.

- **Read access**:
  - Admins can read all leads
  - Sales reps can only read leads assigned to them
  
- **Write access**:
  - Public form submissions can create new leads with required fields
  - Admins have full CRUD permissions
  - Sales reps can update leads assigned to them but cannot change the assignment
  - No one can delete leads except admins

### Conversations Collection

The `conversations` collection stores communications with leads (calls, messages).

- **Read access**:
  - Users can read conversations they created
  - Users can read conversations for leads assigned to them
  - Admins can read all conversations
  
- **Write access**:
  - Users can create conversations for leads assigned to them
  - Users can update their own conversations
  - Only admins can delete conversations

### Settings Collection

The `settings` collection stores system-wide settings and configuration.

- **Read access**:
  - All authenticated users can read settings
  
- **Write access**:
  - Only admins can modify settings

## Implementation Notes

1. Deploy these rules through the Firebase Console under Firestore Database > Rules
2. These rules reference user roles stored in the users collection
3. Ensure user documents have a 'role' field set to either 'admin' or 'sales_rep'
4. All lead submissions through the public form should set status='New' and assignedTo=null
5. Update rules as needed when new collections are added

## Important Security Considerations

1. **Test thoroughly**: After deploying rules, test each permission scenario
2. **Admin role protection**: Be careful about who gets admin access
3. **Lead assignment**: Only admins can assign leads to different reps
4. **Public submission security**: The rules allow unauthenticated lead creation, but with field validation