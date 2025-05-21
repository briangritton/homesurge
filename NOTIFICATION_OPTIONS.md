# CRM Notification Options Guide

This document outlines various notification methods for the SellForCash CRM system, each with implementation details, complexity, and use cases.

## Notification Methods Summary

| Method | Complexity | Setup Time | Compliance | Mobile Support | User Experience |
|--------|------------|------------|------------|----------------|-----------------|
| Firebase Cloud Messaging | Medium | 2-3 hours | None | Excellent | High |
| Email (Firebase) | Low | 1 hour | Low | Medium | Medium |
| WhatsApp (Twilio) | High | 3-4 hours | High | Excellent | High |
| SMS (Twilio) | High | 2-3 hours | Very High | Excellent | Medium |
| Slack Integration | Low | 30 min | None | Good | Medium |
| Discord Webhook | Very Low | 15 min | None | Good | Medium |
| Telegram Bot | Low | 1 hour | None | Excellent | High |

## 1. Firebase Cloud Messaging (FCM)

**Summary:** Browser and mobile push notifications using Firebase.

**Key Benefits:**
- Works when browser is closed
- Native mobile experience with PWA
- No compliance requirements
- Already using Firebase infrastructure

**Implementation Components:**
1. Service worker in `/public/firebase-messaging-sw.js`
2. FCM token management in Firestore
3. Mobile-optimized subscription UI
4. Backend service to send notifications

**Mobile Experience:**
- Install as PWA for best experience
- Background notifications on Android
- Limited iOS support (Safari only, requires iOS 16.4+)

**Environment Variables Needed:**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## 2. Email Notifications (Firebase Extensions)

**Summary:** Email notifications via Firebase Extensions.

**Key Benefits:**
- Simple implementation
- Works across all devices
- Low maintenance

**Implementation Components:**
1. Firebase Extension "Trigger Email"
2. Email templates in Firestore
3. SMTP configuration (SendGrid recommended)

**Setup Steps:**
1. Install "Trigger Email" extension in Firebase
2. Create email templates in Firestore
3. Configure SMTP settings

**Limitations:**
- Not as immediate as push notifications
- Less engaging than mobile notifications
- May end up in spam

## 3. WhatsApp Notifications (Twilio)

**Summary:** WhatsApp Business API via Twilio.

**Key Benefits:**
- High visibility and engagement
- Multimedia support
- Read receipts

**Implementation Components:**
1. Twilio WhatsApp Business API integration
2. Approved message templates
3. Phone number management in user profiles

**Compliance Requirements:**
- Business verification
- Template approval process
- User opt-in required

**Environment Variables Needed:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`
- `ADMIN_PHONE_NUMBER`

**Current Status:**
- WhatsApp Business API set up
- Template approval pending
- Integration code implemented

## 4. SMS Notifications (Twilio)

**Summary:** Traditional SMS via Twilio.

**Key Benefits:**
- Works on all phones
- No app installation required
- High open rates

**Implementation Components:**
1. Twilio SMS API integration
2. 10DLC registration for US numbers
3. Phone number management in user profiles

**Compliance Challenges:**
- 10DLC registration complex process
- Carrier fees and requirements
- Content restrictions

**Environment Variables Needed:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `ADMIN_PHONE_NUMBER`

## 5. Slack Integration

**Summary:** Notifications to a Slack channel/workspace.

**Key Benefits:**
- Quick setup
- No compliance issues
- Mobile notifications via Slack app

**Implementation Components:**
1. Slack API client (`@slack/web-api`)
2. Slack app with appropriate permissions
3. Workspace and channel management

**Setup Steps:**
1. Create Slack workspace and invite team
2. Create Slack app in developer portal
3. Generate API token with chat:write scope
4. Add environment variable for Slack token

**Code Example:**
```javascript
import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_TOKEN);

async function sendLeadNotification(leadId, salesRepId, leadData) {
  try {
    const message = {
      channel: '#lead-notifications',
      text: `New lead assigned to <@${salesRepId}>!`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*New Lead Assigned*\n*Name:* ${leadData.name}\n*Address:* ${leadData.address}\n*Phone:* ${leadData.phone}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Lead'
              },
              url: `https://sellforcash.online/crm?leadId=${leadId}`
            }
          ]
        }
      ]
    };
    
    await slack.chat.postMessage(message);
    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}
```

## 6. Discord Webhook

**Summary:** Easiest implementation using Discord webhooks.

**Key Benefits:**
- Zero compliance requirements
- Extremely fast setup
- Free for all usage levels

**Implementation Components:**
1. Discord server and channel
2. Webhook URL from channel settings
3. Simple HTTP POST implementation

**Setup Steps:**
1. Create Discord server
2. Create channel for notifications
3. Channel Settings → Integrations → Create Webhook
4. Copy webhook URL to environment variable

**Code Example:**
```javascript
async function sendDiscordNotification(leadId, salesRepName, leadData) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    const message = {
      content: `New lead assigned to ${salesRepName}!`,
      embeds: [
        {
          title: leadData.name || 'New Lead',
          description: `**Address:** ${leadData.address}\n**Phone:** ${leadData.phone}`,
          color: 5814783, // Teal color
          url: `https://sellforcash.online/crm?leadId=${leadId}`,
          footer: {
            text: 'SellForCash CRM'
          }
        }
      ]
    };
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    return false;
  }
}
```

## 7. Telegram Bot

**Summary:** Notifications via Telegram Bot API.

**Key Benefits:**
- Excellent mobile experience
- No compliance requirements
- Simple API

**Implementation Components:**
1. Bot creation via BotFather
2. User subscription system
3. Message sending service

**Setup Steps:**
1. Message @BotFather on Telegram to create a bot
2. Get the API token
3. Configure environment variable
4. Have users start a chat with the bot

**Code Example:**
```javascript
import TelegramBot from 'node-telegram-bot-api';

// Create bot instance
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Store chat IDs in Firestore
async function storeTelegramChatId(userId, chatId) {
  const db = getFirestore();
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    telegramChatId: chatId
  });
}

// Send lead notification
async function sendTelegramNotification(salesRepId, leadData) {
  try {
    // Get user's Telegram chat ID from Firestore
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, 'users', salesRepId));
    
    if (!userDoc.exists() || !userDoc.data().telegramChatId) {
      return false;
    }
    
    const chatId = userDoc.data().telegramChatId;
    
    // Create message with inline keyboard for actions
    const message = `🏠 *New Lead Assigned*\n\n` +
      `*Name:* ${leadData.name || 'N/A'}\n` +
      `*Address:* ${leadData.address || 'N/A'}\n` +
      `*Phone:* ${leadData.phone || 'N/A'}`;
    
    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'View in CRM', url: `https://sellforcash.online/crm?leadId=${leadData.id}` }],
          [{ text: 'Call Lead', url: `tel:${leadData.phone}` }]
        ]
      }
    };
    
    await bot.sendMessage(chatId, message, options);
    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}
```

## Choosing the Right Option

### For Immediate Implementation

**Discord Webhook** provides the fastest path to working notifications:
- 15-minute setup time
- Zero compliance hurdles
- Works on mobile via Discord app
- No approval processes

### For Best Long-Term Solution

**Firebase Cloud Messaging** offers the best balance:
- Native mobile experience
- No compliance requirements
- Works when browser is closed
- Consistent with current Firebase architecture

### For Comprehensive Coverage

A multi-channel approach combining:
1. FCM for web/mobile push notifications
2. Email for reliable delivery and record-keeping
3. Slack/Discord for team visibility

## Implementation Strategy

1. **Start Simple**: Implement Discord webhook notifications (15 min setup)
2. **Add Email**: Set up Firebase email extension (1 hour setup)
3. **Add FCM**: Implement push notifications for mobile (2-3 hour setup)
4. **Messaging Apps**: Add Telegram/WhatsApp as needed (depends on compliance)

This staged approach ensures you always have working notifications while improving the user experience over time.