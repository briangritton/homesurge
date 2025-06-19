# Firebase Live Chat Integration Documentation

## Overview
This document outlines the implementation of a real-time live chat system that allows customers to chat directly with Spencer (or sales team) using Firebase Realtime Database, with integrated Pushover notifications and dynamic messaging based on campaign types.

## Architecture

### Core Components

#### 1. **LiveChat Component** (`src/components/LiveChat/LiveChat.jsx`)
- **Purpose**: Main chat interface for both customers and sales representatives
- **Key Features**:
  - Real-time messaging via Firebase Realtime Database
  - Role-based UI (customer vs sales)
  - Spencer connection flow with timeout logic
  - Text message fallback options
  - Auto-scrolling message history

#### 2. **Firebase Configuration** (`src/services/firebase.js`)
- **Database**: Firebase Realtime Database for real-time messaging
- **Authentication**: Configured with persistence for session management
- **Structure**: Messages stored under `chats/{leadId}/messages`

#### 3. **Notification System** (`src/services/notifications.js`)
- **Function**: `sendLiveChatNotification(chatData)`
- **Integration**: Uses centralized notification service
- **Pushover**: Sends high-priority notifications to Spencer
- **Types**: "Live Chat Request" and "Chat interaction"

#### 4. **API Endpoint** (`api/live-chat-notification.js`)
- **Purpose**: Server-side notification handling
- **Method**: Direct Pushover API calls
- **Environment**: Uses `PUSHOVER_APP_TOKEN` environment variable

#### 5. **Template Engine Integration** (`src/services/templateEngine.js`)
- **Function**: `getLiveChatTemplate(campaign, variant)`
- **Dynamic Text**: Campaign-specific messaging
- **Campaigns**: cash, sell, value, buy, fsbo

#### 6. **Header Components** (Currently Hidden)
- **Files**: `Header.jsx` and `ValueBoostHeader.jsx`
- **Feature**: Pulsing chat bubble icons with dynamic text
- **Status**: Temporarily commented out for troubleshooting

## Data Flow

### 1. Chat Initiation
```
Customer clicks "Chat with Spencer" → 
Notification sent to Spencer → 
"Connecting..." message displayed → 
10-second timeout starts
```

### 2. Message Flow
```
User types message → 
Firebase Realtime Database → 
Real-time update to all connected clients → 
First customer message triggers "Chat interaction" notification
```

### 3. Spencer Connection
```
Spencer clicks "Join Chat" → 
hasJoined state updated → 
Timeout cleared → 
Real-time chat begins
```

### 4. Timeout Scenario
```
10 seconds pass without Spencer joining → 
Fallback message displayed → 
Text message options shown → 
Customer can choose SMS communication
```

## Firebase Database Structure

```
chats/
  {leadId}/
    messages/
      {messageId}/
        message: "Message content"
        sender: "customer" | "sales" | "bot"
        senderName: "Display name"
        timestamp: 1234567890
```

## Notification Types

### 1. Live Chat Request
- **Trigger**: Customer clicks "Chat with Spencer" button
- **Message**: "{customerName} wants to chat with Spencer!"
- **Priority**: High (1)
- **Sound**: Persistent

### 2. Chat Interaction
- **Trigger**: Customer sends their first message
- **Message**: "{customerName} sent their first chat message!"
- **Content**: Includes the actual message content
- **Priority**: High (1)

## CSS Classes and Styling

All chat styling is defined in `src/styles/valueboost.css`:

### Chat Container Classes
- `.livechat-container` - Main chat wrapper
- `.livechat-header` - Chat header with title and join button
- `.livechat-messages` - Scrollable messages area
- `.livechat-input-container` - Input area wrapper

### Message Classes
- `.livechat-message` - Base message wrapper
- `.livechat-message-customer` - Customer message alignment
- `.livechat-message-sales` - Sales message alignment
- `.livechat-message-bot` - Bot message alignment
- `.livechat-bubble-*` - Message bubble styling by sender type

### Interactive Elements
- `.livechat-connect-spencer-button` - Spencer connection button
- `.livechat-text-options` - Fallback text message options
- `.livechat-send-button` - Send message button
- `.livechat-join-button` - Sales rep join chat button

### Header Elements (Currently Hidden)
- `.header-chat-container` - Chat bubble wrapper
- `.header-chat-icon` - Chat icon with pulsing animation
- `.header-chat-text` - Dynamic text below icon
- `@keyframes chatPulse` - Pulsing glow animation

## Campaign Integration

### Dynamic Text Based on Campaign Type
```javascript
const templates = {
  cash: {
    available: 'Live cash offer expert available!',
    connecting: 'Offer agent connecting, just a sec...'
  },
  sell: {
    available: 'Live selling expert available!',
    connecting: 'Offer agent connecting, just a sec...'
  },
  value: {
    available: 'Live value expert available!',
    connecting: 'Value agent connecting, just a sec...'
  }
};
```

### Campaign Detection
- **URL Path**: `/analysis/{campaign}/`
- **URL Parameters**: `campaign_name`, `campaignname`, `utm_campaign`
- **Fallback**: Defaults to "cash" campaign

## Environment Variables Required

```
PUSHOVER_APP_TOKEN=your_pushover_app_token
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FIREBASE_PROJECT_ID=your_project_id
```

## Usage Examples

### For Customers
1. Navigate to any page with the LiveChat component
2. Click "💬 Chat with Spencer Now" button
3. Wait for connection or timeout
4. Send messages in real-time
5. Use text options if Spencer unavailable

### For Sales Team
1. Receive Pushover notification when chat requested
2. Open admin panel or direct chat link
3. Click "Join Chat" button
4. Send real-time messages to customer
5. Access full message history

## Key Features

### Real-time Messaging
- Instant message delivery using Firebase Realtime Database
- Auto-scrolling to latest messages
- Message history persistence
- Connection status indicators

### Smart Notifications
- Immediate notification when chat requested
- Follow-up notification on first customer interaction
- High-priority Pushover alerts with sound
- Direct links to join chat session

### Timeout Handling
- 10-second window for Spencer to join
- Graceful fallback to text messaging options
- Clear communication about connection status
- No hanging "connecting" states

### Campaign Awareness
- Dynamic messaging based on detected campaign
- Appropriate expert type (cash, selling, value)
- Context-aware connection messages
- Consistent branding per campaign

## Current Status

### ✅ Implemented
- Complete LiveChat component with all features
- Firebase Realtime Database integration
- Pushover notification system
- API endpoints for server-side notifications
- CSS styling with classes (no inline styles)
- Template engine integration
- Timeout and fallback logic
- Campaign-specific messaging

### 🚧 Temporarily Disabled
- Header chat bubble icons (commented out for troubleshooting)
- Pulsing animations and dynamic text in headers

### 🔄 Ready for Testing
- End-to-end chat flow
- Notification delivery
- Timeout scenarios
- Multi-user chat sessions
- Campaign detection

## Troubleshooting

### Common Issues
1. **Firebase Connection**: Check environment variables and network connectivity
2. **Notifications Not Sending**: Verify PUSHOVER_APP_TOKEN and user keys
3. **Messages Not Appearing**: Check Firebase database rules and authentication
4. **Timeout Not Working**: Verify JavaScript timer logic and state management

### Debug Tools
- Browser console for Firebase connection status
- Network tab for API call monitoring
- Firebase console for database structure verification
- Pushover delivery receipts for notification confirmation

## Future Enhancements

### Potential Improvements
- File/image sharing capabilities
- Typing indicators
- Read receipts
- Chat history export
- Multi-agent support
- Mobile app notifications
- Integration with CRM systems
- Automated bot responses
- Chat analytics and reporting

### Integration Opportunities
- Twilio SMS for fallback messaging
- Calendar integration for appointment scheduling
- Lead scoring based on chat engagement
- Automated follow-up sequences
- Integration with existing funnel analytics