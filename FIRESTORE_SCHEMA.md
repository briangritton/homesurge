# Firestore Data Schema for SellForCash CRM

This document outlines the data schema for the SellForCash CRM system built on Firebase Firestore. The schema is designed to be flexible, allowing for custom fields while maintaining a structured approach for core functionality.

## Collections Overview

The database consists of the following main collections:

1. `leads` - All lead information and history
2. `users` - System users (admin, sales reps)
3. `conversations` - Call and message history
4. `settings` - System configuration settings

## Schema Details

### 1. Leads Collection

Each document in the `leads` collection represents a single lead with all related information.

```
leads/{leadId}
```

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | The document ID (same as leadId) |
| `name` | String | Full name of the contact |
| `firstName` | String | First name (parsed from name) |
| `lastName` | String | Last name (parsed from name) |
| `phone` | String | Contact phone number |
| `email` | String | Contact email address |
| `autoFilledName` | String | Name collected from browser autofill |
| `autoFilledPhone` | String | Phone collected from browser autofill |
| `street` | String | Street address |
| `city` | String | City |
| `state` | String | State |
| `zip` | String | ZIP code |
| `status` | String | Current lead status (New, Contacted, Qualified, Appointment, Offer, Contract, Closed, Dead) |
| `leadStage` | String | More detailed stage in sales process |
| `leadSource` | String | Source of the lead (Website, Referral, etc.) |
| `assignedTo` | String | UID of assigned sales rep |
| `createdAt` | Timestamp | When the lead was created |
| `updatedAt` | Timestamp | When the lead was last updated |
| `conversions` | Array | Array of conversion events (see below) |
| `notes` | Array | Array of note objects with text and timestamp |

#### Property Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `isPropertyOwner` | String | Whether they own the property ("Yes", "No") |
| `needsRepairs` | String | Repair status of the property |
| `workingWithAgent` | String | Whether they're working with an agent |
| `homeType` | String | Type of home (Single Family, etc.) |
| `remainingMortgage` | String | Remaining mortgage amount |
| `finishedSquareFootage` | String | Square footage of home |
| `basementSquareFootage` | String | Basement square footage |
| `bedrooms` | String | Number of bedrooms |
| `bathrooms` | String | Number of bathrooms |
| `howSoonSell` | String | Timeframe for selling |
| `wantToSetAppointment` | String | Whether they want to set an appointment |

#### API Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `apiOwnerName` | String | Owner name from property API |
| `apiEstimatedValue` | String | Estimated value from API |
| `apiMaxHomeValue` | String | Maximum value from API |
| `apiEquity` | String | Equity estimate from API |
| `apiPercentage` | String | Equity percentage from API |
| `formattedApiEstimatedValue` | String | Formatted value for display |

#### Address Selection Fields

| Field | Type | Description |
|-------|------|-------------|
| `userTypedAddress` | String | What the user initially typed |
| `selectedSuggestionAddress` | String | The suggestion they selected |
| `suggestionOne` | String | First address suggestion |
| `suggestionTwo` | String | Second address suggestion |
| `suggestionThree` | String | Third address suggestion |
| `suggestionFour` | String | Fourth address suggestion |
| `suggestionFive` | String | Fifth address suggestion |
| `addressSelectionType` | String | How the address was selected |
| `location` | String | JSON string of location data |

#### Campaign Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `traffic_source` | String | Traffic source |
| `url` | String | Landing URL |
| `gclid` | String | Google Click ID |
| `device` | String | Device type |
| `campaign_name` | String | Campaign name |
| `campaign_id` | String | Campaign ID |
| `adgroup_name` | String | Ad group name |
| `adgroup_id` | String | Ad group ID |
| `keyword` | String | Keyword |
| `matchtype` | String | Match type |
| `templateType` | String | Template variant |
| `dynamicHeadline` | String | Dynamic headline used |
| `dynamicSubHeadline` | String | Dynamic sub-headline used |

#### Appointment Fields

| Field | Type | Description |
|-------|------|-------------|
| `selectedAppointmentDate` | String | Selected appointment date |
| `selectedAppointmentTime` | String | Selected appointment time |
| `appointmentDate` | String | Appointment date (alternate field) |
| `appointmentTime` | String | Appointment time (alternate field) |

#### Conversion Events Structure

Each item in the `conversions` array has the following structure:

```json
{
  "event": "appointmentSet",
  "timestamp": Timestamp,
  "value": 50,
  "status": "Appointment",
  "notes": "Optional notes"
}
```

### 2. Users Collection

Each document in the `users` collection represents a system user (admin or sales rep).

```
users/{userId}
```

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `uid` | String | User ID (same as document ID) |
| `email` | String | User email address |
| `name` | String | User's full name |
| `role` | String | User role (admin, sales_rep) |
| `createdAt` | Timestamp | When the user was created |
| `updatedAt` | Timestamp | When the user was last updated |
| `active` | Boolean | Whether the user is active |
| `phone` | String | User's phone number |
| `photoURL` | String | URL to user's profile photo |
| `lastLogin` | Timestamp | Last login timestamp |
| `preferences` | Map | User preferences |

### 3. Conversations Collection

Each document in the `conversations` collection represents a call or message exchange with a lead.

```
conversations/{conversationId}
```

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Conversation ID (same as document ID) |
| `leadId` | String | Reference to the lead |
| `userId` | String | User who initiated/received the conversation |
| `type` | String | Type (call, sms, email) |
| `direction` | String | Inbound or outbound |
| `startTime` | Timestamp | When the conversation started |
| `endTime` | Timestamp | When the conversation ended |
| `duration` | Number | Duration in seconds (for calls) |
| `status` | String | Status (completed, missed, failed) |
| `notes` | String | Notes about the conversation |
| `recordingURL` | String | URL to call recording (if available) |
| `messages` | Array | Array of message objects (for SMS/email) |

#### Message Structure

Each item in the `messages` array has the following structure:

```json
{
  "content": "Message text",
  "timestamp": Timestamp,
  "sender": "user" or "lead"
}
```

### 4. Settings Collection

The `settings` collection contains system-wide configuration settings.

```
settings/{settingId}
```

#### Lead Status Settings

```
settings/leadStatuses
```

| Field | Type | Description |
|-------|------|-------------|
| `statuses` | Array | Array of available lead statuses |

Each status in the array:

```json
{
  "id": "New",
  "label": "New",
  "color": "#42A5F5",
  "order": 1
}
```

#### Event Types Settings

```
settings/eventTypes
```

| Field | Type | Description |
|-------|------|-------------|
| `events` | Array | Array of conversion event types |

Each event in the array:

```json
{
  "id": "appointmentSet",
  "label": "Appointment Set",
  "defaultValue": 50,
  "leadsToStatus": "Appointment",
  "color": "#66BB6A"
}
```

#### Message Templates Settings

```
settings/messageTemplates
```

| Field | Type | Description |
|-------|------|-------------|
| `templates` | Array | Array of message templates |

Each template in the array:

```json
{
  "id": "follow_up_1",
  "title": "Initial Follow-up",
  "content": "Hi {{name}}, this is {{rep_name}} following up about your property at {{address}}. Would you be available to talk today?",
  "category": "Follow-up"
}
```

## Indexes

The following indexes should be created in Firestore for optimal performance:

1. Leads by assignedTo and status:
   - Collection: `leads`
   - Fields: `assignedTo` (Ascending), `status` (Ascending)

2. Leads by createdAt:
   - Collection: `leads`
   - Fields: `createdAt` (Descending)

3. Conversations by leadId and startTime:
   - Collection: `conversations`
   - Fields: `leadId` (Ascending), `startTime` (Descending)

## Access Patterns

The schema supports these key access patterns:

1. Find all leads assigned to a specific sales rep
2. Find all leads in a specific status
3. Find a lead's complete history (conversions and conversations)
4. Find all recent conversations for a lead
5. List all active sales reps
6. Get all configuration settings for the system

## Schema Evolution Considerations

1. **Adding Fields**: New fields can be added to any document without affecting existing functionality
2. **Renaming Fields**: Should be avoided; instead, add a new field and deprecate the old one
3. **Removing Fields**: Mark as deprecated before removal to ensure all clients are updated

## Migration Notes

When migrating from Zoho CRM, map the fields as follows:

1. Maintain the same field names where possible for lead data
2. Create new users in the `users` collection for each sales rep
3. Assign existing leads to their current sales reps
4. Import historical activity as conversion events where possible