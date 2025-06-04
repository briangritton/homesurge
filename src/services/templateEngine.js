/**
 * Template Engine Service
 * Contains EXACT templates extracted from original components
 */

class TemplateEngineService {
  constructor() {
    this.templates = this.initializeTemplates();
  }

  /**
   * Get template for campaign and variant
   * Uses the exact same logic as the original components
   */
  getTemplate(campaign, variant, component = 'addressform') {
    console.log('📋 Template selection:', { campaign, variant, component });
    
    // Use the exact original selection logic
    if (component === 'addressform') {
      return this.getAddressFormTemplate(campaign, variant);
    } else if (component === 'aiprocessing') {
      return this.getAIProcessingTemplate(campaign, variant);
    } else if (component === 'report') {
      return this.getReportTemplate(campaign, variant);
    } else if (component === 'b2step3') {
      return this.getB2Step3Template(campaign, variant);
    }
    
    return this.getAddressFormTemplate('cash', 'A1O');
  }

  /**
   * AddressForm templates - EXACT copy from original
   */
  getAddressFormTemplate(campaign, variant) {
    const templates = {
      // ========== CASH/SELLING CAMPAIGNS A TEMPLATES ==========
      cashA: {
        headline: 'Get an Instant Cash Offer Today and Sell Fast!',
        subheadline: 'Our OfferBoost AI home scan will generate our <strong><em>highest cash offer</em></strong> and opportunity report. Close in 7 days. No showings, no repairs, no stress',
        buttonText: 'CHECK CASH OFFER',
        exampleTag: 'Example OfferBoost Report Increase*',
        potentialHeadline: 'Your OfferBoost Potential:',
        opportunitiesText: '11 OfferBoost opportunities found!',
        percentageText: 'Potential Cash Offer Increase',
        contactHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        contactButtonText: 'GET CASH OFFER',
        contactDisclaimer: '*Example values only. Your cash offer expires soon and will depend on current market conditions and property details. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        disclaimerMain: '*Example values only. Your offer amount will depend on your specific home details and other factors. <span class="disclaimer-link">See Offerboost details</span>. By entering your address, you agree to be contacted at the information details provided and send address details and other available browser autofill information to HomeSurge.AI for the purpose of contacting you with your requested information. <strong>We respect your privacy and will never share your details with anyone. No spam ever.</strong>',
        disclaimerPopup: 'Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible home value increase that might be acheived by various home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes.'
      },

      sellA: {
        headline: 'Want to Sell Your House Fast, Without Repairs?',
        subheadline: 'Our OfferBoost AI home scan will generate our <strong><em>highest cash offer</em></strong> and opportunity report. Close in 7 days. No showings, no repairs, no stress',
        buttonText: 'CHECK CASH OFFER',
        exampleTag: 'Example OfferBoost Report Increase*',
        potentialHeadline: 'Your OfferBoost Potential:',
        opportunitiesText: '11 OfferBoost opportunities found!',
        percentageText: 'Potential Cash Offer Increase',
        contactHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        contactButtonText: 'GET CASH OFFER',
        contactDisclaimer: '*Example values only. Your cash offer expires soon and will depend on current market conditions and property details. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        disclaimerMain: '*Example values only. Your offer amount will depend on your specific home details and other factors. <span class="disclaimer-link">See Offerboost details</span>. By entering your address, you agree to be contacted at the information details provided and send address details and other available browser autofill information to HomeSurge.AI for the purpose of contacting you with your requested information. <strong>We respect your privacy and will never share your details with anyone. No spam ever.</strong>',
        disclaimerPopup: 'Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible home value increase that might be acheived by various home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes.'
      },
      
      valueA: {
        headline: 'See Your Maximum Home Value Potential With ValueBoost AI',
        subheadline: 'Our ValueBoost AI home scan will generate your <strong><em>maximum home value</em></strong> report with FREE AI personalized opportunity recommendations!',
        buttonText: 'GET VALUE REPORT',
        exampleTag: 'Example ValueBoost Report Increase*',
        potentialHeadline: 'Your ValueBoost Potential:',
        opportunitiesText: '11 ValueBoost opportunities found!',
        percentageText: 'Potential Home Value Increase',
        contactHeadline: 'Get Your FREE ValueBoost Max Value Report',
        checkmark1: 'All ValueBoost <strong><i>maximum value</strong></i> opportunities for your property',
        checkmark2: 'Detailed <strong><i>AI powered</strong></i> recommendations that show you expected ROIs',
        checkmark3: '<strong><i>Customized for your unique property,</strong></i> down to the smallest detail',
        contactButtonText: 'GET VALUE REPORT',
        contactDisclaimer: '*Example values only. Your cash offer expires soon and will depend on current market conditions and property details. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        disclaimerMain: '*Example values only. Your offer amount will depend on your specific home details and other factors. <span class="disclaimer-link">See Offerboost details</span>. By entering your address, you agree to be contacted at the information details provided and send address details and other available browser autofill information to HomeSurge.AI for the purpose of contacting you with your requested information. <strong>We respect your privacy and will never share your details with anyone. No spam ever.</strong>',
        disclaimerPopup: 'Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible home value increase that might be acheived by various home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes.'
      },
      
      equityA: {
        headline: 'Unlock Hidden Home Equity',
        subheadline: 'Find out how much equity you could gain with strategic home improvements guided by AI.',
        buttonText: 'UNLOCK EQUITY',
        exampleTag: 'Example ValueBoost Report Increase*',
        potentialHeadline: 'Your ValueBoost Potential:',
        opportunitiesText: '11 ValueBoost opportunities found!',
        percentageText: 'Potential Home Value Increase',
        disclaimerMain: '*Example values only. Your offer amount will depend on your specific home details and other factors. <span class="disclaimer-link">See Offerboost details</span>. By entering your address, you agree to send address details and other available autofill information not displayed to HomeSurge.AI for the purpose of contacting you with your requested information. <strong>We respect your privacy and will never share your details with anyone. No spam ever.</strong>',
        disclaimerPopup: 'Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible home value increase that might be acheived by various home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes.'
      },
      
      // ========== B SECONDARY CONTENT VARIANTS ==========
      cashB2: {
        headline: 'Get an Instant Cash Offer Today and Sell Fast!',
        subheadline: 'Just enter you address and we\'ll give you our <strong><em>highest cash offer</em></strong> in minutes. Close in as little as 7 days. No showings, no repairs, no stress',
        buttonText: 'CHECK CASH OFFER',
        exampleTag: 'Example OfferBoost Report Increase*',
        potentialHeadline: 'Your OfferBoost Potential:',
        opportunitiesText: '11 OfferBoost opportunities found!',
        percentageText: 'Potential Cash Offer Increase',
        contactHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        contactButtonText: 'CHECK CASH OFFER',
        contactDisclaimer: '*Example values only. Your cash offer expires soon and will depend on current market conditions and property details. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        disclaimerMain: '*<strong>We respect your privacy and will never share your details with anyone. No spam ever.</strong> By entering your address, you agree to be contacted at the information details provided and send address details and other available browser autofill information to HomeSurge.AI for the purpose of contacting you with your requested information.',
        disclaimerPopup: 'Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible home value increase that might be acheived by various home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes.'
      },
      
      sellB2: {
        headline: 'Want to Sell Your House Fast, Without Repairs?',
        subheadline: 'Just enter you address to check your <strong><em>highest cash offer</em></strong> in minutes. Close in as little as 7 days. No showings, no repairs, no stress',
        buttonText: 'CHECK CASH OFFER',
        exampleTag: 'Example OfferBoost Report Increase*',
        potentialHeadline: 'Your OfferBoost Potential:',
        opportunitiesText: '11 OfferBoost opportunities found!',
        percentageText: 'Potential Cash Offer Increase',
        contactHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        contactButtonText: 'CHECK CASH OFFER',
        contactDisclaimer: '*Example values only. Your cash offer expires soon and will depend on current market conditions and property details. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        disclaimerMain: '*<strong>We respect your privacy and will never share your details with anyone. No spam ever.</strong> By entering your address, you agree to be contacted at the information details provided and send address details and other available browser autofill information to HomeSurge.AI for the purpose of contacting you with your requested information.',
        disclaimerPopup: 'Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible home value increase that might be acheived by various home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes.'
      },
      
      valueB2: {
        headline: 'See Your Maximum Home Value Potential With ValueBoost AI',
        subheadline: 'Our ValueBoost AI home scan will generate your <strong><em>maximum home value</em></strong> report with FREE AI personalized opportunity recommendations!',
        buttonText: 'CHECK VALUE REPORT',
        exampleTag: 'Example ValueBoost Report Increase*',
        potentialHeadline: 'Your ValueBoost Potential:',
        opportunitiesText: '11 ValueBoost opportunities found!',
        percentageText: 'Potential Home Value Increase',
        contactHeadline: 'Get Your FREE ValueBoost Max Value Report',
        checkmark1: 'All ValueBoost <strong><i>maximum value</strong></i> opportunities for your property',
        checkmark2: 'Detailed <strong><i>AI powered</strong></i> recommendations that show you expected ROIs',
        checkmark3: '<strong><i>Customized for your unique property,</strong></i> down to the smallest detail',
        contactButtonText: 'GET VALUE REPORT',
        contactDisclaimer: '*Example values only. Your cash offer expires soon and will depend on current market conditions and property details. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        disclaimerMain: '*Example values only. Your offer amount will depend on your specific home details and other factors. <span class="disclaimer-link">See Offerboost details</span>. By entering your address, you agree to be contacted at the information details provided and send address details and other available browser autofill information to HomeSurge.AI for the purpose of contacting you with your requested information. <strong>We respect your privacy and will never share your details with anyone. No spam ever.</strong>',
        disclaimerPopup: 'Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible home value increase that might be acheived by various home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes.'
      },
      
      equityB2: {
        headline: 'Discover Hidden Home Wealth',
        subheadline: 'AI-driven analysis uncovers untapped equity potential in your property. Get your wealth-building renovation strategy',
        buttonText: 'DISCOVER WEALTH',
        exampleTag: 'Example ValueBoost Increase*',
        potentialHeadline: 'Your ValueBoost Potential:',
        opportunitiesText: '11 ValueBoost opportunities found!',
        percentageText: 'Potential Home Value Increase'
      },
      
      // ========== DEFAULT FALLBACK ==========
      defaultA: {
        headline: 'Get an Instant Cash Offer Today and Sell Fast!',
        subheadline: 'Our OfferBoost AI home scan will generate our <strong><em>highest cash offer</em></strong> and opportunity report. Close in 7 days. No showings, no repairs, no stress',
        buttonText: 'CHECK CASH OFFER',
        exampleTag: 'Example OfferBoost Report Increase*',
        potentialHeadline: 'Your OfferBoost Potential:',
        opportunitiesText: '11 OfferBoost opportunities found!',
        percentageText: 'Potential Cash Offer Increase',
        contactHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        contactButtonText: 'GET CASH OFFER',
        contactDisclaimer: '*Example values only. Your cash offer expires soon and will depend on current market conditions and property details. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        disclaimerMain: '*Example values only. Your offer amount will depend on your specific home details and other factors. <span class="disclaimer-link">See Offerboost details</span>. By entering your address, you agree to be contacted at the information details provided and send address details and other available browser autofill information to HomeSurge.AI for the purpose of contacting you with your requested information. <strong>We respect your privacy and will never share your details with anyone. No spam ever.</strong>',
        disclaimerPopup: 'Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible home value increase that might be acheived by various home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes.'
      }
    };
    
    // ================= CAMPAIGN MATCHING LOGIC (EXACT COPY) ===================
    console.log('🎯 AddressForm template matching:', { campaign, variant, simplified: campaign ? campaign.toLowerCase().replace(/[\s\-_\.]/g, '') : 'none' });
    
    if (campaign) {
      const simplified = campaign.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      // CASH/SELLING CAMPAIGN MATCHING (Highest priority)
      if (simplified.includes('cash') || simplified.includes('fast')) {
        console.log('🎯 Matched cash/fast campaign');
        return variant === 'B2O' ? templates.cashB2 : templates.cashA;
      }
      if (simplified.includes('sell')) {
        console.log('🎯 Matched sell campaign');
        return variant === 'B2O' ? templates.sellB2 : templates.sellA;
      }
      
      // VALUE/IMPROVEMENT CAMPAIGN MATCHING
      if (simplified.includes('value') || simplified.includes('boost') || simplified.includes('valueboost') || simplified.includes('value_boost')) {
        console.log('🎯 Matched value/boost campaign');
        return variant === 'B2O' ? templates.valueB2 : templates.valueA;
      }
      if (simplified.includes('equity')) {
        console.log('🎯 Matched equity campaign');
        return variant === 'B2O' ? templates.equityB2 : templates.equityA;
      }
    }

    console.log('🎯 Using default AddressForm template');
    return variant === 'B2O' ? templates.cashB2 : templates.defaultA;
  }

  /**
   * AIProcessing templates - EXACT copy from original
   */
  getAIProcessingTemplate(campaign, variant) {
    const templates = {
      // ========== CASH/SELLING CAMPAIGNS ==========
      cash: {
        headline: 'Analyzing Your OfferBoost Maximum Offer...',
        subheadline: 'Our AI is calculating your optimal cash offer and timeline',
        completionText: 'OfferBoost Analysis Complete!',
        estimateLabel: 'OfferBoost Estimate:'
      },
      
      fast: {
        headline: 'Analyzing Your OfferBoost Maximum Offer...',
        subheadline: 'Determining the fastest path to close your home',
        completionText: 'OfferBoost Strategy Ready!',
        estimateLabel: 'OfferBoost Estimate:'
      },
      
      sellfast: {
        headline: 'Lightning-Fast OfferBoost Analysis...',
        subheadline: 'Calculating your instant cash offer potential',
        completionText: 'OfferBoost Ready!',
        estimateLabel: 'OfferBoost Estimate:'
      },
      
      // ========== VALUE/IMPROVEMENT CAMPAIGNS ==========
      value: {
        headline: 'AI Value Analysis In Progress...',
        subheadline: 'Discovering hidden value opportunities in your home',
        completionText: 'Value Enhancement Report Ready!',
        estimateLabel: 'ValueBoost Estimate:'
      },
      
      valueboost: {
        headline: 'Finding Maximum Value...',
        subheadline: 'AI is analyzing your property\'s improvement potential',
        completionText: 'ValueBoost Report Complete!',
        estimateLabel: 'ValueBoost Estimate:'
      },
      
      boost: {
        headline: 'Boosting Your Home Value...',
        subheadline: 'Identifying the highest-impact improvements for your property',
        completionText: 'Value Boost Strategy Ready!',
        estimateLabel: 'ValueBoost Estimate:'
      },
      
      equity: {
        headline: 'Unlocking Your Home Equity...',
        subheadline: 'Calculating your maximum equity potential',
        completionText: 'Equity Analysis Complete!',
        estimateLabel: 'ValueBoost Estimate:'
      },
      
      // ========== B SECONDARY CONTENT VARIANTS ==========
      cashB2: {
        headline: 'Analyzing Your OfferBoost Maximum Offer...',
        subheadline: 'Our AI is calculating your optimal cash offer and timeline',
        completionText: 'OfferBoost Analysis Complete!',
        estimateLabel: 'OfferBoost Estimate:'
      },
      
      fastB2: {
        headline: 'Analyzing Your OfferBoost Maximum Offer...',
        subheadline: 'Our AI is calculating your optimal cash offer and timeline',
        completionText: 'OfferBoost Analysis Complete!',
        estimateLabel: 'OfferBoost Estimate:'
      },
      
      sellfastB2: {
        headline: 'Rapid OfferBoost Calculation...',
        subheadline: 'AI is creating your express sale strategy',
        completionText: 'Express Strategy Complete!',
        estimateLabel: 'Express Offer Estimate:'
      },
      
      valueB2: {
        headline: 'Discovering Your Home\'s True Worth...',
        subheadline: 'Deep AI analysis revealing your property\'s maximum market potential',
        completionText: 'True Value Report Generated!',
        estimateLabel: 'True Value Estimate:'
      },
      
      valueboostB2: {
        headline: 'Optimizing Investment Returns...',
        subheadline: 'AI is calculating maximum ROI renovation strategies',
        completionText: 'Investment Strategy Optimized!',
        estimateLabel: 'Investment Estimate:'
      },
      
      boostB2: {
        headline: 'Transforming Value Potential...',
        subheadline: 'Revolutionary AI creating your personalized enhancement blueprint',
        completionText: 'Transformation Plan Ready!',
        estimateLabel: 'Transformation Estimate:'
      },
      
      equityB2: {
        headline: 'Discovering Hidden Wealth...',
        subheadline: 'AI wealth analysis uncovering untapped property potential',
        completionText: 'Wealth Discovery Complete!',
        estimateLabel: 'Wealth Estimate:'
      },
      
      // ========== DEFAULT FALLBACK ==========
      default: {
        headline: 'Analyzing Your OfferBoost Options...',
        subheadline: 'Our AI is calculating your optimal cash offer and timeline',
        completionText: 'OfferBoost Analysis Complete!',
        estimateLabel: 'OfferBoost Estimate:'
      }
    };
    
    // Campaign matching logic with A/B content variants
    console.log('🎯 AIProcessing template matching:', { campaign, variant });
    
    if (campaign) {
      const simplified = campaign.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      // CASH/SELLING CAMPAIGN MATCHING (Highest priority)
      if (simplified.includes('cash')) return variant === 'B2O' ? templates.cashB2 : templates.cash;
      if (simplified.includes('sellfast') || simplified.includes('sell_fast')) return variant === 'B2O' ? templates.sellfastB2 : templates.sellfast;
      if (simplified.includes('fast')) return variant === 'B2O' ? templates.fastB2 : templates.fast;
      
      // VALUE/IMPROVEMENT CAMPAIGN MATCHING
      if (simplified.includes('valueboost') || simplified.includes('value_boost')) return variant === 'B2O' ? templates.valueboostB2 : templates.valueboost;
      if (simplified.includes('value')) return variant === 'B2O' ? templates.valueB2 : templates.value;
      if (simplified.includes('boost')) return variant === 'B2O' ? templates.boostB2 : templates.boost;
      if (simplified.includes('equity')) return variant === 'B2O' ? templates.equityB2 : templates.equity;
    }

    console.log('🎯 Using default AIProcessing template');
    return templates.default;
  }

  /**
   * B2Step3 templates - EXACT copy from original
   */
  getB2Step3Template(campaign) {
    const templates = {
      cashB2: {
        readyHeadline: 'Next, where do you want us to text your cash offer?',
        readySubheadline: 'We\'ll send you our strongest <strong><i>no obligation cash offer</i></strong>, and you choose how fast to close! ',
        unlockHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        unlockSubtext: 'Time-sensitive analysis - get your complete cash offer before rates change',
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        buttonText: 'GET CASH OFFER',
        disclaimer: '<strong> No spam ever. </strong>We respect your privacy and will never share your details with anyone. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list.'
      },
      
      sellB2: {
        readyHeadline: 'Next, where do you want us to text your cash offer?',
        readySubheadline: 'We\'ll send you our strongest <strong><i>no obligation cash offer</i></strong>, and you choose how fast to close! ',        
        unlockHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        unlockSubtext: 'Time-sensitive analysis - get your complete cash offer before rates change',
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        buttonText: 'GET CASH OFFER',
        disclaimer: '<strong> No spam ever. </strong>We respect your privacy and will never share your details with anyone. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list.'
      },
      
      valueB2: {
        readyHeadline: 'Next, where do you want us to text a copy your ValueBoost report?',
        readySubheadline: 'We\'ll send you a detailed <strong><i>maximum home value</strong></i>, report with FREE AI personalized opportunity recommendations! ',
        unlockHeadline: 'Get Your FREE ValueBoost Max Value Report',
        timeoutUnlockHeadline: 'HomeSurge ValueBoost Report Benefits:',
        unlockSubtext: 'Unlock your full property value report with all personalized recommendations',
        checkmark1: 'All ValueBoost <strong><i>maximum value</strong></i> opportunities for your property',
        checkmark2: 'Detailed <strong><i>AI powered</strong></i> recommendations that show you expected ROIs',
        checkmark3: '<strong><i>Customized for your unique property,</strong></i> down to the smallest detail',
        buttonText: 'GET VALUE REPORT',
        disclaimer: '<strong> No spam ever. </strong>We respect your privacy and will never share your details with anyone. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list.'
      },
      
      default: {
        readyHeadline: 'Next, where do you want us to text your cash offer?',
        readySubheadline: 'We\'ll send you our strongest <strong><i>no obligation cash offer</i></strong>, and you choose how fast to close! ',
        unlockHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        unlockSubtext: 'Time-sensitive analysis - get your complete cash offer before rates change',
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        buttonText: 'GET CASH OFFER',
        disclaimer: '<strong> No spam ever. </strong>We respect your privacy and will never share your details with anyone. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list.'
      }
    };
    
    // Campaign matching logic for B2 variants
    console.log('🎯 B2Step3 template matching:', { campaign });
    
    if (campaign) {
      const simplified = campaign.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      // CASH/SELLING CAMPAIGN MATCHING
      if (simplified.includes('cash')) return templates.cashB2;
      if (simplified.includes('sell')) return templates.sellB2;
      
      // VALUE/IMPROVEMENT CAMPAIGN MATCHING
      if (simplified.includes('value')) return templates.valueB2;
      if (simplified.includes('equity')) return templates.valueB2; // Use valueB2 for equity campaigns
    }

    return templates.default;
  }

  /**
   * ValueBoostReport templates - EXACT copy from original
   */
  getReportTemplate(campaign) {
    const templates = {
      cashA: {
        readyHeadline: 'Next, where do you want us to text your cash offer and FREE OfferBoost report?',
        reportHeadline: 'Your OfferBoost Highest Cash Offer Is Ready!:',
        readySubheadline: 'We\'ll send you our strongest <strong><i>no obligation cash offer</i></strong>, and you choose how fast to close! No obligation, no strings attached AND get your <strong><i>FREE OfferBoost report</i></strong> below, with our most powerful AI recommendations for increasing your cash offer potential!',
        loadingMessage: 'Processing Your Cash Offer Details...',
        potentialHeadline: 'Your OfferBoost Potential:',
        recommendationsTitle: 'Your Top 10 OfferBoost Strategies',
        recommendationsSubtitle: 'Maximize your cash offer with these proven strategies',
        unlockHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        timeoutUnlockHeadline: 'HomeSurge Cash Offer Benefits:',
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        conciergeHeadline: 'Want Expert Help Maximizing Your Cash Offer?',
        buttonText: 'GET CASH OFFER',
        timeoutHeadline: 'Watch your messages, we\'ll be sending a text with your cash offer shortly!',
        disclaimer: '*Example values only. Your offer amount will depend on your specific home details and other factors. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.'
      },

      sellA: {
        readyHeadline: 'Next, where do you want us to text your cash offer and FREE OfferBoost report?',
        reportHeadline: 'Your OfferBoost Highest Cash Offer Is Ready!:',
        readySubheadline: 'We\'ll send you our strongest <strong><i>no obligation cash offer</i></strong>, and you choose how fast to close! No obligation, no strings attached AND get your <strong><i>FREE OfferBoost report</i></strong> below, with our most powerful AI recommendations for increasing your cash offer potential!',
        loadingMessage: 'Processing Your Cash Offer Details...',
        potentialHeadline: 'Your OfferBoost Potential:',
        recommendationsTitle: 'Your Top 10 OfferBoost Strategies',
        recommendationsSubtitle: 'Maximize your cash offer with these proven strategies',
        unlockHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        timeoutUnlockHeadline: 'HomeSurge Cash Offer Benefits:',
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        conciergeHeadline: 'Want Expert Help Maximizing Your Cash Offer?',
        buttonText: 'GET CASH OFFER',
        timeoutHeadline: 'Watch your messages, we\'ll be sending a text with your cash offer shortly!',
        disclaimer: '*Example values only. Your offer amount will depend on your specific home details and other factors. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.'
      },

      valueA: {
        readyHeadline: 'Your ValueBoost Report is Ready!',
        reportHeadline: 'ValueBoost Report Ready:',
        readySubheadline: 'Check your <strong>maximum home value</strong> with FREE AI personalized opportunity recommendations below! See your home\'s true potential value.',
        loadingMessage: 'Processing Your ValueBoost Analysis...',
        potentialHeadline: 'Your ValueBoost Potential:',
        recommendationsTitle: 'Your Top 10 ValueBoost Recommendations',
        recommendationsSubtitle: 'Here are the Highest impact AI generated opportunities for your home',
        unlockHeadline: 'Get Your FREE ValueBoost Max Value Report',
        timeoutUnlockHeadline: 'HomeSurge ValueBoost Report Benefits:',
        checkmark1: 'All ValueBoost <strong><i>maximum value</strong></i> opportunities for your property',
        checkmark2: 'Detailed <strong><i>AI powered</strong></i> recommendations that show you expected ROIs',
        checkmark3: '<strong><i>Customized for your unique property,</strong></i> down to the smallest detail',
        buttonText: 'GET VALUE REPORT',
        timeoutHeadline: 'Watch your messages, we\'ll be sending a text with your ValueBoost report shortly!',
        disclaimer: '*Example values only. Your value increase will depend on your specific home details and market conditions. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.'
      },

      equity: {
        reportHeadline: 'Your Equity Analysis Ready:',
        potentialHeadline: 'Your Hidden Equity Potential:',
        recommendationsTitle: 'Your Top 10 Equity Unlocking Strategies',
        recommendationsSubtitle: 'Strategic improvements to maximize your home equity',
        unlockHeadline: 'Get Your FREE Equity Maximizer Report',
        timeoutUnlockHeadline: 'HomeSurge ValueBoost Report Benefits:',
        unlockSubtext: 'Get your complete equity enhancement plan with growth projections',
        conciergeHeadline: 'Want Expert Help Unlocking Your Home Equity?',
        buttonText: 'GET VALUE REPORT',
        readySubheadline: 'Check your <strong>maximum home value</strong> with FREE AI personalized opportunity recommendations below! See your home\'s true potential value.',
        loadingMessage: 'Processing Your ValueBoost Equity Analysis...',
        readyHeadline: 'Your ValueBoost Equity Analysis is Ready!'
      },

      default: {
        reportHeadline: 'Your OfferBoost Highest Cash Offer Is Ready!:',
        potentialHeadline: 'Your OfferBoost Potential:',
        recommendationsTitle: 'Your Top 10 OfferBoost Strategies',
        recommendationsSubtitle: 'Maximize your cash offer with these proven strategies',
        unlockHeadline: 'Get Your FREE OfferBoost Maximum Cash Report',
        timeoutUnlockHeadline: 'HomeSurge Cash Offer Benefits:',
        unlockSubtext: 'Get your complete cash offer strategy with market insights and opportunities',
        conciergeHeadline: 'Want Expert Help Maximizing Your Cash Offer?',
        timeoutHeadline: 'Watch your messages, we\'ll be sending a text with your cash offer shortly!',
        checkmark1: '*All OfferBoost cash offer opportunities for your property',
        checkmark2: 'Detailed maximum OfferBoost calculations for maximizing home value',
        checkmark3: 'Customized for your property',
        buttonText: 'CHECK CASH OFFER',
        readySubheadline: 'Check your OfferBoost cash offer below, and unlock your FREE AI powered custom home value and offer optimization report. No obligation, no strings attached.',
        loadingMessage: 'Processing Your OfferBoost Cash Offer Analysis...',
        readyHeadline: 'Your OfferBoost Highest Cash Offer is Ready!'
      }
    };
    
    // Campaign matching logic
    console.log('🎯 ValueBoostReport template matching:', { campaign });
    
    if (campaign) {
      const simplified = campaign.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      // CASH/SELLING CAMPAIGN MATCHING (Highest priority)
      if (simplified.includes('cash')) return templates.cashA;
      if (simplified.includes('sell')) return templates.sellA;
      
      // VALUE/IMPROVEMENT CAMPAIGN MATCHING
      if (simplified.includes('value')) return templates.valueA;
      if (simplified.includes('equity')) return templates.equity;
    }

    return templates.default;
  }

  /**
   * Legacy method for backward compatibility
   */
  initializeTemplates() {
    return {
      defaultA: this.getAddressFormTemplate('cash', 'A1O')
    };
  }
}

// Export singleton instance
export const templateService = new TemplateEngineService();