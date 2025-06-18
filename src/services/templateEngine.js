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
    } else if (component === 'livechat') {
      return this.getLiveChatTemplate(campaign, variant);
    }
    
    return this.getAddressFormTemplate('cash', 'A1O');
  }

  /**
   * Live Chat templates - adapted from stickyPopupMessage content
   */
  getLiveChatTemplate(campaign, variant) {
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
      },
      default: {
        available: 'Live chat offer available!',
        connecting: 'Offer agent connecting, just a sec...'
      }
    };

    // Match campaign type
    const simplified = (campaign || '').toLowerCase();
    
    if (simplified.includes('cash') || simplified.includes('fast')) {
      return templates.cash;
    } else if (simplified.includes('sell') || simplified.includes('selling')) {
      return templates.sell;
    } else if (simplified.includes('value') || simplified.includes('boost')) {
      return templates.value;
    }
    
    return templates.default;
  }

  /**
   * AddressForm templates - EXACT copy from original
   */
  getAddressFormTemplate(campaign, variant) {
    const templates = {
      // ========== CASH/SELLING CAMPAIGNS A TEMPLATES ==========
      cashA: {
        headline: 'Want To Increase Your Cash Offer? Get Your FREE OfferBoost AI Home Report to View Your Options',
        // headline: 'WANT TO INCREASE YOUR CASH OFFER? Get Your OfferBoost AI Home Report to View Your Options',


        subheadline: 'Our <strong><em>FREE</strong></i> OfferBoost AI home tool will generate your <strong><em>highest cash offer</em></strong> strategy report. Get your highest possible offer. <strong><i>Don\'t take less than you deserve.</strong></i>',
        buttonText: 'GET FREE REPORT',
        exampleTag: 'Example OfferBoost Report Increase*',
        potentialHeadline: 'Your OfferBoost Potential:',
        opportunitiesText: '11 OfferBoost opportunities found!',
        percentageText: 'Potential Cash Offer Increase',
        contactHeadline: '<i>HomeSurge OfferBoost Benefits:</i>',
        checkmark1: '<strong>Don\'t accept lowball offers!</strong> See how to increase your cash offer potential.',
        checkmark2: '<strong>No hidden fees.</strong> You accept an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'See how to close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        contactButtonText: 'GET FREE REPORT',
        contactDisclaimer: '*Example values only. Your cash offer expires soon and will depend on current market conditions and property details. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        disclaimerMain: '*Example values only. Your offer amount will depend on your specific home details and other factors. <span class="disclaimer-link">See Offerboost details</span>.',
        disclaimerPopup: 'Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible offer increase that might be acheived by various negotiation tactics, market factors, home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes.'
      },

      sellA: {
        headline: 'Don\'t Leave Money on the Table When You Sell! Get Your FREE OfferBoost Strategy Report',
        subheadline: 'Our <strong><em>FREE</strong></em> OfferBoost AI Report will generate your personalized <strong><em>maximum selling price strategy</em></strong>. Learn how to sell for the <strong><i>highest possible price</i></strong> and get <strong><i>multiple offers fast!</i></strong> <strong><i>Don\'t undersell your home.</strong></i>',
        buttonText: 'GET FREE REPORT',
        exampleTag: 'Example OfferBoost Strategy Increase*',
        potentialHeadline: 'Your OfferBoost Potential:',
        opportunitiesText: '15 OfferBoost opportunities found!',
        percentageText: 'Potential Selling Price Increase',
        contactHeadline: '<i>HomeSurge OfferBoost Benefits:</i>',
        checkmark1: '<strong>Don\'t undersell your home!</strong> Learn the exact steps to <strong><em>maximize your selling price</em></strong>.',
        checkmark2: '<strong>Get multiple offers fast!</strong> Our proven strategies help you <strong><em>create bidding wars</em></strong>.',
        checkmark3: '<strong>Sell prepared, not panicked!</strong> Know exactly what to do <strong><em>before you list</em></strong> to maximize profit.',
        contactButtonText: 'GET FREE REPORT',
        contactDisclaimer: '*Example strategies only. Your selling results will depend on current market conditions, property details, and strategy implementation. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
       disclaimerMain: '*Example values only. Your selling price will depend on your specific home details, market conditions, and strategy implementation. <span class="disclaimer-link">See OfferBoost details</span>.',
        disclaimerPopup: 'OfferBoost by HomeSurge.AI analyzes your home using various data resources, and provides personalized selling strategies that might help maximize your selling price through proper preparation, timing, pricing, and marketing tactics custom to your specific property and local market. All numbers are for example only and represent possible outcomes.'
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
        disclaimerMain: '*Example values only. Your value will depend on your specific home details and other factors. <span class="disclaimer-link">See ValueBoost details</span>.',
        disclaimerPopup: 'Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible offer increase that might be acheived by various negotiation tactics, market factors, home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes.'
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
        disclaimerMain: '',
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
        disclaimerMain: '',
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
        disclaimerMain: '*Example values only. Your offer amount will depend on your specific home details and other factors. <span class="disclaimer-link">See Offerboost details</span>.',
        disclaimerPopup: 'Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible offer increase that might be acheived by various negotiation tactics, market factors, home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes.'
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
 headline: 'Want To Increase Your Cash Offer? Get Your FREE OfferBoost AI Home Report to View Your Options',        // headline: 'WANT TO INCREASE YOUR CASH OFFER? Get Your OfferBoost AI Home Report to View Your Options',


        subheadline: 'Our <strong><em>FREE</strong></i> OfferBoost AI home tool will generate your <strong><em>highest cash offer</em></strong> strategy report. Get your highest possible offer. <strong><i>Don\'t take less than you deserve.</strong></i>',
        buttonText: 'GET FREE REPORT',
        exampleTag: 'Example OfferBoost Report Increase*',
        potentialHeadline: 'Your OfferBoost Potential:',
        opportunitiesText: '11 OfferBoost opportunities found!',
        percentageText: 'Potential Cash Offer Increase',
        contactHeadline: '<i>HomeSurge OfferBoost Benefits:</i>',
        checkmark1: '<strong>Don\'t accept lowball offers!</strong> See how to increase your cash offer potential.',
        checkmark2: '<strong>No hidden fees.</strong> You accept an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'See how to close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        contactButtonText: 'GET FREE REPORT',
        contactDisclaimer: '*Example values only. Your cash offer expires soon and will depend on current market conditions and property details. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        disclaimerMain: '*Example values only. Your offer amount will depend on your specific home details and other factors. <span class="disclaimer-link">See Offerboost details</span>.',
        disclaimerPopup: 'Offerboost and Valueboost by HomeSurge.AI scan your home using various data resources, and project a possible offer increase that might be acheived by various negotiation tactics, market factors, home improvements and other opportunities custom to your specific property. All numbers are for example only and are simply possible outcomes.'
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
      
      sell: {
        headline: 'Generating Your OfferBoost Strategy...',
        subheadline: 'AI is analyzing your home to create your personalized selling strategy',
        completionText: 'OfferBoost Strategy Complete!',
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
      
      sellB2: {
        headline: 'Creating Your Selling Strategy...',
        subheadline: 'AI is building your custom strategy to sell for maximum price',
        completionText: 'OfferBoost Strategy Ready!',
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
      if (simplified.includes('sell')) return variant === 'B2O' ? templates.sellB2 : templates.sell;
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
        readyHeadline: 'Next, where do you want us to send your <strong><i>no obligation cash offer?</i></strong> ',
        readySubheadline: 'We\'ll send you our highest possible offer, and you choose how fast to close! <strong><i>No spam ever, and we\'ll never share your details </strong></i>',
        unlockHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        unlockSubtext: 'Time-sensitive analysis - get your complete cash offer before rates change',
        checkmark1: '<strong><i>No stress closing!</i></strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong><i>No hidden fees.</i></strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        buttonText: 'GET CASH OFFER',
        disclaimer: '<strong> No spam ever. </strong>We respect your privacy and will never share your details with anyone. By submitting your information, you consent to receive offer details via calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list.'
      },
      
      sellB2: {
        readyHeadline: 'Next, where do you want us to send your <strong><i>no obligation cash offer?</i></strong> ',
        readySubheadline: 'We\'ll send you our highest possible offer, and you choose how fast to close! <strong><i>No spam ever, and we\'ll never share your details </strong></i>',
        unlockHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        unlockSubtext: 'Time-sensitive analysis - get your complete cash offer before rates change',
        checkmark1: '<strong><i>No stress closing!</i></strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong><i>No hidden fees.</i></strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        buttonText: 'GET CASH OFFER',
        disclaimer: '<strong> No spam ever. </strong>We respect your privacy and will never share your details with anyone. By submitting your information, you consent to receive offer details via calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list.'
      },
      
      valueB2: {
        readyHeadline: 'Next, where do you want us to send your ValueBoost report?',
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
        readyHeadline: 'Next, where do you want us to send your <strong><i>no obligation cash offer?</i></strong> ',
        readySubheadline: 'We\'ll send you our highest possible offer, and you choose how fast to close! <strong><i>No spam ever, and we\'ll never share your details </strong></i>',
        unlockHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        unlockSubtext: 'Time-sensitive analysis - get your complete cash offer before rates change',
        checkmark1: '<strong><i>No stress closing!</i></strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong><i>No hidden fees.</i></strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        buttonText: 'GET CASH OFFER',
        disclaimer: '<strong> No spam ever. </strong>We respect your privacy and will never share your details with anyone. By submitting your information, you consent to receive offer details via calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list.'
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
        readyHeadline: 'Next, where do you want us to send your <strong><i>FREE OfferBoost report?</strong></i>',
        reportHeadline: 'Your OfferBoost Report is Processing',
        readySubheadline: 'We\'ll send you your OfferBoost AI <strong><em>highest cash offer</em></strong> strategy report. Get your highest possible offer. <strong><i>Don\'t take less than you deserve.</strong></i>',

        loadingMessage: 'Processing Your OfferBoost Report Details...',
        potentialHeadline: 'Your OfferBoost Potential:',
        recommendationsTitle: 'Your Top 10 OfferBoost Strategies',
        recommendationsSubtitle: 'Maximize your cash offer with these proven strategies',
        unlockHeadline: '<i>HomeSurge OfferBoost Report Benefits</i>',
        timeoutUnlockHeadline: 'HomeSurge OfferBoost Report Benefits',
        checkmark1: '<strong>Higher potential offers!</strong> Learn how you can leverage the highest cash offer',
        checkmark2: '<strong>No hidden fees.</strong> See how to structure offers so that you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        conciergeHeadline: 'Want Expert Help Maximizing Your Cash Offer?',
        buttonText: 'GET FREE REPORT',
        timeoutHeadline: 'Report generated! Watch your messages, we\'ll be sending a text with your OfferBoost report shortly!',
        disclaimer: 'By submitting your information, you consent to receive your OfferBoost details via call, text, or email from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        stickyPopupMessage: 'Want to maximize your cash offer? I have connections with some of the industry\'s best negotiation experts and can help you leverage the <em><strong>highest possible offer.</strong></em> Give me a call or shoot me a text!'
      },

      sellA: {
        readyHeadline: 'Your FREE OfferBoost Selling Strategy Is Ready!',
        reportHeadline: 'Your OfferBoost Maximum Selling Strategy Is Ready!',
        readySubheadline: 'Get your <strong><i>complete selling strategy</i></strong> with our most powerful AI recommendations for <strong><i>maximizing your selling price</i></strong> and <strong><i>selling fast!</i></strong> Learn the exact steps to prepare, price, and market your home like a pro.',
        loadingMessage: 'Generating Your OfferBoost Strategy Report...',
        potentialHeadline: 'Your OfferBoost Potential:',
        recommendationsTitle: 'Your Top 12 OfferBoost Selling Strategies',
        recommendationsSubtitle: 'Maximize your selling price and speed with these proven preparation tactics',
        unlockHeadline: '<i>Get Your Complete OfferBoost Selling Strategy:</i>',
        timeoutUnlockHeadline: 'HomeSurge OfferBoost Strategy Benefits:',
        checkmark1: '<strong>Don\'t undersell your home!</strong> Learn exactly how to <strong><em>maximize your selling price</em></strong>.',
        checkmark2: '<strong>Get multiple offers fast!</strong> Our proven prep strategies help you <strong><em>create bidding wars</em></strong>.',
        checkmark3: '<strong>Sell like a pro!</strong> Know exactly what to fix, stage, and price <strong><em>before you list</em></strong>.',
        conciergeHeadline: 'Want Expert Help Implementing Your OfferBoost Strategy?',
        buttonText: 'GET FREE REPORT',
        timeoutHeadline: 'Report generated! Watch your messages, we\'ll be sending a text with your complete OfferBoost strategy shortly!',
        disclaimer: 'By submitting your information, you consent to receive your OfferBoost strategy details via call, text, or email from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        stickyPopupMessage: 'Don\'t leave money on the table! I can help you implement your OfferBoost strategy and connect you with my trusted network to get you <em><strong>multiple offers and top dollar.</strong></em> Most sellers miss out - don\'t be one of them! Call or text me now!'
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
        timeoutHeadline: 'Report generated! Watch your messages, we\'ll be sending a text with your ValueBoost report shortly!',
        disclaimer: 'By submitting your information, you consent to receive your ValueBoost details via call, text, or email from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        stickyPopupMessage: 'Selling and want to see if your home qualifies to have these value add upgrades done <em>ABSOLUTELY FREE?</em> Give me a call or shoot me a text!'
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
        readyHeadline: 'Next, where do you want us to send your <strong><i>FREE OfferBoost report?</strong></i>',
        reportHeadline: 'Your OfferBoost Report is Processing',
        readySubheadline: 'We\'ll send you your OfferBoost AI <strong><em>highest cash offer</em></strong> strategy report. Get your highest possible offer. <strong><i>Don\'t take less than you deserve.</strong></i>',

        loadingMessage: 'Processing Your OfferBoost Report Details...',
        potentialHeadline: 'Your OfferBoost Potential:',
        recommendationsTitle: 'Your Top 10 OfferBoost Strategies',
        recommendationsSubtitle: 'Maximize your cash offer with these proven strategies',
        unlockHeadline: '<i>HomeSurge OfferBoost Report Benefits</i>',
        timeoutUnlockHeadline: 'HomeSurge OfferBoost Report Benefits',
        checkmark1: '<strong><i>Higher potential offers!</i></strong> Learn how you can leverage the highest cash offer',
        checkmark2: '<strong><i>No hidden fees.</i></strong> See how to structure offers so that you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        conciergeHeadline: 'Want Expert Help Maximizing Your Cash Offer?',
        buttonText: 'GET FREE REPORT',
        timeoutHeadline: 'Report generated! Watch your messages, we\'ll be sending a text with your OfferBoost report shortly!',
        disclaimer: 'By submitting your information, you consent to receive your OfferBoost details via call, text, or email from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.',
        stickyPopupMessage: 'Want to maximize your cash offer? I have connections with some of the industry\'s best negotiation experts and can help you leverage the highest possible offer. Give me a call or shoot me a text!'
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