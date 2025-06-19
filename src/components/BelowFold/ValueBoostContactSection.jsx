import React, { useState, useEffect } from 'react';
import { BsTelephoneFill } from 'react-icons/bs';
import { templateService } from '../../services/templateEngine';
import LazyImage from '../common/LazyImage';
import homesellImage from '../../assets/images/homesell.webp';
import homesellImageFallback from '../../assets/images/homesell.png';

function ValueBoostContactSection() {
  const [dynamicContent, setDynamicContent] = useState({
    contactHeadline: 'Ready to Maximize Your Home\'s Value?',
    checkmark1: 'Expert property analysis',
    checkmark2: 'Personalized improvement recommendations',
    checkmark3: 'Maximum value optimization strategies',
    contactButtonText: 'GET YOUR FREE ANALYSIS'
  });

  // Get dynamic content based on current route/campaign
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

    const getVariantFromRoute = () => {
      const path = window.location.pathname;
      if (path.includes('/analysis/')) {
        const pathParts = path.split('/');
        return pathParts[3] || 'A1O'; // A1O, A1I, A2O, B2O
      }
      return 'A1O'; // default
    };

    const campaign = getCampaignFromRoute();
    const variant = getVariantFromRoute();
    const content = templateService.getTemplate(campaign, variant);
    setDynamicContent(content);
  }, []);

  return (
    <div className="vb-af-contact-section-wrapper">
      <div className="vb-af-contact-header">
        <h3 className="vb-af-contact-headline" dangerouslySetInnerHTML={{ __html: dynamicContent.contactHeadline }}></h3>
      </div>
      <div className="vb-af-contact-columns">
        <div className="vb-af-contact-content">
          <div className="vb-af-features-bubble">
            <div className="vb-af-feature-item">
              <div className="vb-af-feature-icon">✓</div>
              <p className="vb-af-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark1 }}></p>
            </div>
            <div className="vb-af-feature-item">
              <div className="vb-af-feature-icon">✓</div>
              <p className="vb-af-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark2 }}></p>
            </div>
            <div className="vb-af-feature-item">
              <div className="vb-af-feature-icon">✓</div>
              <p className="vb-af-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark3 }}></p>
            </div>
          </div>
        </div>
        <div className="vb-af-contact-image">
          <picture>
            <source srcSet={homesellImage} type="image/webp" />
            <LazyImage src={homesellImageFallback} alt="Home selling services" />
          </picture>
        </div>
      </div>
      <div className="vb-af-contact-footer">
        <button 
          className="vb-af-contact-button vb-af-button-flare"
          onClick={(e) => {
            e.preventDefault();
            console.log('ValueBoost contact button clicked!');
            // Multiple scroll methods for maximum compatibility
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
          }}
        >
          {dynamicContent.contactButtonText}
        </button>
        <div className="vb-af-phone-section">
          <a href="tel:+14046714628" className="vb-af-phone-link">
            <div className="vb-af-phone-container">
              <div className="vb-af-phone-icon">
                <BsTelephoneFill />
              </div>
              <div className="vb-af-phone-number">(404) 671-4628</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default ValueBoostContactSection;