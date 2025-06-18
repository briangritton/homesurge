import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, push, onValue, off } from 'firebase/database';
import '../../styles/valueboost.css';

const LiveChat = ({ leadId, leadName, userRole = 'sales', userName = 'Sales Rep', prefilledGreeting = '' }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [greetingSent, setGreetingSent] = useState(false);
  const [waitingForSales, setWaitingForSales] = useState(false);
  const [salesTimeout, setSalesTimeout] = useState(false);
  const [firstInteractionSent, setFirstInteractionSent] = useState(false);
  const messagesEndRef = useRef(null);
  const database = getDatabase();
  const waitTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!leadId) return;

    // Listen for messages
    const messagesRef = ref(database, `chats/${leadId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messagesList);
        setIsActive(messagesList.length > 0);
        
        // Auto-scroll to bottom when new messages arrive
        setTimeout(scrollToBottom, 100);
      } else {
        setMessages([]);
        setIsActive(false);
      }
    });

    return () => off(messagesRef, 'value', unsubscribe);
  }, [leadId, database]);

  // Connect Spencer function
  const connectSpencer = async () => {
    if (!leadId) return;
    
    setWaitingForSales(true);
    
    try {
      // Send bot message about connecting Spencer
      const messagesRef = ref(database, `chats/${leadId}/messages`);
      await push(messagesRef, {
        message: "Let me check, it looks like Spencer has a free minute now! I'll let you two go from here and you can either ask any questions you have now or schedule a later time for more in-depth questions if you need it! Just a second let me get him connected...",
        sender: 'bot',
        senderName: 'Assistant',
        timestamp: Date.now(),
      });

      // Send notification to sales team
      try {
        await fetch('/api/notify-live-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            customerName: leadName,
            message: 'Customer requested to chat with Spencer',
          }),
        });
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
      }

      // Set 10-second timeout for Spencer to join
      waitTimeoutRef.current = setTimeout(async () => {
        if (!hasJoined) {
          setSalesTimeout(true);
          setWaitingForSales(false);
          
          // Send timeout message
          await push(messagesRef, {
            message: "Okay great! It looks like he's finishing up with another client, what's the best number he'll send you a quick text to schedule a better time.",
            sender: 'bot',
            senderName: 'Assistant',
            timestamp: Date.now(),
          });
        }
      }, 10000); // 10 seconds

    } catch (error) {
      console.error('Error connecting Spencer:', error);
      setWaitingForSales(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !leadId) return;

    try {
      const messagesRef = ref(database, `chats/${leadId}/messages`);
      await push(messagesRef, {
        message: newMessage.trim(),
        sender: userRole,
        senderName: userName,
        timestamp: Date.now(),
      });

      // Send "Chat interaction" notification for customer's first message
      if (userRole === 'customer' && !firstInteractionSent) {
        setFirstInteractionSent(true);
        try {
          await fetch('/api/notify-live-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              leadId,
              customerName: leadName,
              message: newMessage.trim(),
              notificationType: 'Chat interaction'
            }),
          });
        } catch (notificationError) {
          console.error('Failed to send first interaction notification:', notificationError);
        }
      }

      // Mark that sales has joined the chat and clear timeout
      if (userRole === 'sales' && !hasJoined) {
        setHasJoined(true);
        setWaitingForSales(false);
        setSalesTimeout(false);
        if (waitTimeoutRef.current) {
          clearTimeout(waitTimeoutRef.current);
        }
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Join chat function
  const joinChat = async () => {
    setHasJoined(true);
    setWaitingForSales(false);
    setSalesTimeout(false);
    
    // Clear the timeout if Spencer joins in time
    if (waitTimeoutRef.current) {
      clearTimeout(waitTimeoutRef.current);
    }
    
    // Send prefilled greeting if provided and not already sent
    if (prefilledGreeting && !greetingSent && userRole === 'sales') {
      try {
        const messagesRef = ref(database, `chats/${leadId}/messages`);
        await push(messagesRef, {
          message: prefilledGreeting,
          sender: userRole,
          senderName: userName,
          timestamp: Date.now(),
        });
        setGreetingSent(true);
      } catch (error) {
        console.error('Error sending greeting:', error);
      }
    }
    
    // Focus on input
    setTimeout(() => {
      document.querySelector('.livechat-input')?.focus();
    }, 100);
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // If no chat activity and user hasn't joined
  if (!isActive && userRole === 'sales') {
    return (
      <div className="livechat-container">
        <div className="livechat-header">
          💬 Live Chat - {leadName || 'Customer'}
        </div>
        <div className="livechat-no-chat">
          No active chat session with this customer.
        </div>
      </div>
    );
  }

  return (
    <div className="livechat-container">
      <div className="livechat-header">
        <div className="livechat-status-indicator"></div>
        💬 Live Chat - {leadName || 'Customer'}
        {userRole === 'sales' && !hasJoined && isActive && (
          <button className="livechat-join-button" onClick={joinChat}>
            Join Chat
          </button>
        )}
      </div>

      <div className="livechat-messages">
        {messages.length === 0 ? (
          <div className="livechat-no-chat">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`livechat-message ${
                msg.sender === 'customer' 
                  ? 'livechat-message-customer' 
                  : msg.sender === 'bot' 
                  ? 'livechat-message-bot' 
                  : 'livechat-message-sales'
              }`}
            >
              <div
                className={`livechat-bubble ${
                  msg.sender === 'customer' 
                    ? 'livechat-bubble-customer' 
                    : msg.sender === 'bot' 
                    ? 'livechat-bubble-bot' 
                    : 'livechat-bubble-sales'
                }`}
              >
                {msg.message}
              </div>
              <div className="livechat-message-time">
                {msg.senderName || (msg.sender === 'customer' ? 'Customer' : msg.sender === 'bot' ? 'Assistant' : 'Sales Rep')} • {formatTime(msg.timestamp)}
              </div>
            </div>
          ))
        )}
        
        {/* Show "Connect Spencer" button if customer and no active connection attempt */}
        {userRole === 'customer' && !waitingForSales && !hasJoined && !salesTimeout && (
          <button className="livechat-connect-spencer-button" onClick={connectSpencer}>
            💬 Chat with Spencer Now
          </button>
        )}
        
        {/* Show text options if Spencer didn't join in time */}
        {salesTimeout && userRole === 'customer' && (
          <div className="livechat-text-options">
            <button className="livechat-text-option-button">
              📱 Send me a text
            </button>
            <button className="livechat-text-option-button">
              📞 I'll text you
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {(userRole === 'customer' || hasJoined) && (
        <div className="livechat-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={userRole === 'customer' ? 'Type your message...' : 'Reply to customer...'}
            className="livechat-input"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`livechat-send-button ${!newMessage.trim() ? 'livechat-send-button-disabled' : ''}`}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveChat;