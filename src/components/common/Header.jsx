import React, { useState, useEffect } from 'react';
import { BsTelephoneFill, BsChatDotsFill } from 'react-icons/bs';
import logo from '../../../src/assets/images/homesurge.png';
import { templateService } from '../../services/templateEngine';

function Header() {
  const [chatConnecting, setChatConnecting] = useState(false);
  const [chatText, setChatText] = useState({ available: 'Live chat offer available!', connecting: 'Offer agent connecting, just a sec...' });

  // Get dynamic chat text based on campaign
  useEffect(() => {
    const getCampaignFromRoute = () => {
      const path = window.location.pathname;
      if (path.includes('/analysis/')) {
        const pathParts = path.split('/');
        return pathParts[2] || 'cash'; // cash, sell, value, buy, fsbo
      }
      
      // Check URL params
      const urlParams = new URLSearchParams(window.location.search);
      const campaignName = urlParams.get('campaign_name') || urlParams.get('campaignname') || urlParams.get('utm_campaign') || '';
      
      if (campaignName.toLowerCase().includes('sell')) return 'sell';
      if (campaignName.toLowerCase().includes('value')) return 'value';
      if (campaignName.toLowerCase().includes('buy')) return 'buy';
      
      return 'cash'; // default
    };

    const campaign = getCampaignFromRoute();
    const dynamicChatText = templateService.getTemplate(campaign, 'A1O', 'livechat');
    setChatText(dynamicChatText);
  }, []);

  // Handle chat icon click
  const handleChatClick = async () => {
    if (chatConnecting) return;
    
    setChatConnecting(true);
    
    try {
      // Send notification to Spencer
      await fetch('/api/live-chat-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: localStorage.getItem('leadId') || 'header-chat',
          customerName: 'Website Visitor',
          message: 'Customer clicked chat from header',
          notificationType: 'Live Chat Request'
        }),
      });
      
      // Show chat widget after notification is sent
      console.log('Chat request sent to Spencer');
      
      // You can add chat widget logic here or redirect to a chat page
      // For now, we'll show the connecting state until Spencer joins
      
    } catch (error) {
      console.error('Failed to send chat request:', error);
      setChatConnecting(false);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} className="header-logo" alt="HomeSurge.AI" />
      </div>

      <div className="header-right">
        {/* Chat bubble icon - TEMPORARILY HIDDEN */}
        {/* <div className="header-chat-container" onClick={handleChatClick}>
          <div className="header-chat-icon">
            <BsChatDotsFill />
          </div>
          <div className="header-chat-text">
            {chatConnecting ? chatText.connecting : chatText.available}
          </div>
        </div> */}

        {/* Phone icon */}
        <a href="tel:+14046714628" className="header-phone-link">
          <div className="number-positioner">
            <div className="header-phone-icon">
              <BsTelephoneFill />
            </div>
            <div className="header-call-number">(404) 671-4628</div>
          </div>
        </a>
      </div>
    </header>
  );
}

export default Header;