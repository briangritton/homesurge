import React, { useState, useEffect, useMemo } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import additionalStrategies from './additionalStrategies';
import { calculatePropertySpecificCost, calculatePropertySpecificROI } from './costCalculator';
// Notifications are now handled automatically by the centralized notification system
// in FormContext via the useNotifications hook
import { trackPropertyValue } from '../../../services/facebook';
import { trackPhoneNumberLead, trackFormStepComplete, trackFormSubmission } from '../../../services/analytics';
import { doc, updateDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import gradientArrow from '../../../assets/images/gradient-arrow.png';

function ValueBoostReport({ campaign, variant }) {
  const { formData, updateFormData, nextStep } = useFormContext();
  const db = getFirestore();
  
  // ================================================================================
  // ENHANCED DYNAMIC CONTENT SYSTEM - UNIVERSAL CAMPAIGN SUPPORT
  // ================================================================================
  // 
  // EDITING INSTRUCTIONS:
  // - Supports both ValueBoost and Form funnel campaigns
  // - All content templates are defined here in this component
  // - To add new templates, add them to the templates object below
  // - Campaign matching logic matches AddressForm and AIProcessing
  //
  // ================================================================================
  
  const getDynamicContent = () => {
    // Use campaign prop from route (e.g., /analysis/cash/a1o)
    const campaignName = campaign || 'cash';
    
    // UNIVERSAL REPORT TEMPLATES - Both Value and Cash campaigns
    const templates = {
      // ========== CASH/SELLING CAMPAIGNS ==========
      cashA: {
        // Header content
        readyHeadline: 'Next, where do you want us to text your cash offer and FREE OfferBoost report?',
        reportHeadline: 'Your OfferBoost Highest Cash Offer Is Ready!:',
        readySubheadline: 'We\'ll send you our strongest <strong><i>no obligation cash offer</i></strong>, ' +
                      'and you choose how fast to close! No obligation, no strings attached'+
                      ' AND get your <strong><i>FREE OfferBoost report</i></strong> below, with our most powerful AI recommendations ' +
                      'for increasing your cash offer potential!',
        loadingMessage: 'Processing Your Cash Offer Details...',
        // Value display
        potentialHeadline: 'Your OfferBoost Potential:',
        
        // Recommendations section
        recommendationsTitle: 'Your Top 10 OfferBoost Strategies',
        recommendationsSubtitle: 'Maximize your cash offer with these proven strategies',
        
         // Unlock form content
        unlockHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        timeoutUnlockHeadline: 'HomeSurge Cash Offer Benefits:',
        // unlockSubtext: 'Time-sensitive analysis - get your complete cash offer before rates change',
        
        // Checkmark lines
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        
        // CTA section
        conciergeHeadline: 'Want Expert Help Maximizing Your Cash Offer?',
        buttonText: 'GET CASH OFFER',
        
        // Timeout/failure message
        timeoutHeadline: 'Watch your messages, we\'ll be sending a text with your cash offer shortly!',
        
        // Disclaimer (at bottom)
        disclaimer: '*Example values only. Your offer amount will depend on your specific home details and other factors. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.'
      },


     
      // ========== WIDE CAMPAIGN ==========
      sellA: {
        // Header content
        readyHeadline: 'Next, where do you want us to text your cash offer and FREE OfferBoost report?',
        reportHeadline: 'Your OfferBoost Highest Cash Offer Is Ready!:',
        readySubheadline: 'We\'ll send you our strongest <strong><i>no obligation cash offer</i></strong>, ' +
                      'and you choose how fast to close! No obligation, no strings attached'+
                      ' AND get your <strong><i>FREE OfferBoost report</i></strong> below, with our most powerful AI recommendations ' +
                      'for increasing your cash offer potential!',
        loadingMessage: 'Processing Your Cash Offer Details...',
        // Value display
        potentialHeadline: 'Your OfferBoost Potential:',
        
        // Recommendations section
        recommendationsTitle: 'Your Top 10 OfferBoost Strategies',
        recommendationsSubtitle: 'Maximize your cash offer with these proven strategies',
        
         // Unlock form content
        unlockHeadline: '<i>HomeSurge Cash Offer Benefits:</i>',
        timeoutUnlockHeadline: 'HomeSurge Cash Offer Benefits:',
        // unlockSubtext: 'Time-sensitive analysis - get your complete cash offer before rates change',
        
        // Checkmark lines
        checkmark1: '<strong>No stress closing!</strong> No repairs, inspections, commision, or closing costs.',
        checkmark2: '<strong>No hidden fees.</strong> We make an offer, you get the <em><strong>exact amount</strong></em> in cash.',
        checkmark3: 'Close in as little as <strong><em>7 days</em></strong>, or at any later date, <strong>you choose your timeline!</strong>',
        
        // CTA section
        conciergeHeadline: 'Want Expert Help Maximizing Your Cash Offer?',
        buttonText: 'GET CASH OFFER',
        
        // Timeout/failure message
        timeoutHeadline: 'Watch your messages, we\'ll be sending a text with your cash offer shortly!',
        
        // Disclaimer (at bottom)
        disclaimer: '*Example values only. Your offer amount will depend on your specific home details and other factors. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a do not call list. We respect your privacy and will never share your details with anyone. No spam ever.'
      },
      
 
      // ========== VALUE/IMPROVEMENT CAMPAIGNS ==========
      valueA: {
        // Header content
        readyHeadline: 'Your ValueBoost Report is Ready!',
        reportHeadline: 'ValueBoost Report Ready:',
        readySubheadline: 'Check your <strong>maximum home value</strong> with FREE AI personalized ' +
                      'opportunity recommendations below! See your home\'s true potential value.',
        loadingMessage: 'Processing Your ValueBoost Analysis...',
        
        // Value display
        potentialHeadline: 'Your ValueBoost Potential:',
        
        // Recommendations section
        recommendationsTitle: 'Your Top 10 ValueBoost Recommendations',
        recommendationsSubtitle: 'Here are the Highest impact AI generated opportunities for your home',
        
          // Unlock form content
        unlockHeadline: 'Get Your FREE ValueBoost Max Value Report',
        timeoutUnlockHeadline: 'HomeSurge ValueBoost Report Benefits:',
        
        // Checkmark lines
        checkmark1: 'All ValueBoost <strong><i>maximum value</strong></i> opportunities for your property',
        checkmark2: 'Detailed <strong><i>AI powered</strong></i> recommendations that show you expected ROIs',
        checkmark3: '<strong><i>Customized for your unique property,</strong></i> down to the smallest detail',
        
        // CTA section
        buttonText: 'GET VALUE REPORT',
        
        // Timeout/failure message
        timeoutHeadline: 'Watch your messages, we\'ll be sending a text with your ValueBoost report shortly!',
        
        // Disclaimer (at bottom)
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
        readySubheadline: 'Check your <strong>maximum home value</strong> with FREE AI personalized ' +
                      'opportunity recommendations below! See your home\'s true potential value.',
        loadingMessage: 'Processing Your ValueBoost Equity Analysis...',
        readyHeadline: 'Your ValueBoost Equity Analysis is Ready!'
      },
 
   
      
   
   
      // ========== DEFAULT FALLBACK (MATCHES CASH THEME) ==========
      default: {
        reportHeadline: 'Your OfferBoost Highest Cash Offer Is Ready!:',
        potentialHeadline: 'Your OfferBoost Potential:',
        recommendationsTitle: 'Your Top 10 OfferBoost Strategies',
        recommendationsSubtitle: 'Maximize your cash offer with these proven strategies',
        unlockHeadline: 'Get Your FREE OfferBoost Maximum Cash Report',
        timeoutUnlockHeadline: 'HomeSurge Cash Offer Benefits:',
        unlockSubtext: 'Get your complete cash offer strategy with market insights and opportunities',
        conciergeHeadline: 'Want Expert Help Maximizing Your Cash Offer?',
        
        // Timeout/failure message (default for cash campaigns)
        timeoutHeadline: 'Watch your messages, we\'ll be sending a text with your cash offer shortly!',

        checkmark1: '*All OfferBoost cash offer opportunities for your property',
        checkmark2: 'Detailed maximum OfferBoost calculations for maximizing home value',
        checkmark3: 'Customized for your property',


        buttonText: 'CHECK CASH OFFER',
        readySubheadline: 'Check your OfferBoost cash offer below, and unlock your FREE AI powered ' +
                      'custom home value and offer optimization report. No obligation, no strings attached.',
        loadingMessage: 'Processing Your OfferBoost Cash Offer Analysis...',
        readyHeadline: 'Your OfferBoost Highest Cash Offer is Ready!'
      }
    };
    
    // Use variant prop from route
    console.log('ValueBoostReport - Using variant prop:', variant);
    
    // Campaign matching logic with A/B content variants (consistent with AddressForm and AIProcessing)
    if (campaignName) {
      const simplified = campaignName.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      // CASH/SELLING CAMPAIGN MATCHING (Highest priority)
      if (simplified.includes('cash')) return templates.cashA;
      if (simplified.includes('sell')) return templates.sellA;
      
      // VALUE/IMPROVEMENT CAMPAIGN MATCHING
      if (simplified.includes('value')) return templates.valueA;
      if (simplified.includes('equity')) return templates.equity;
    }

    return templates.default;
  };
  
  const dynamicContent = useMemo(() => getDynamicContent(), [campaign, variant]);
  
  // State declarations first - moved before usage
  const [aiReport, setAiReport] = useState(null); // Store AI-generated report content
  
  // Extract AI introduction from the generated report
  const extractAIIntroduction = (reportText) => {
    if (!reportText) return null;
    
    // Look for the introduction paragraph in the AI report
    // The introduction should be after "ValueBoost AI Analysis Report" and before "Property:"
    const lines = reportText.split('\n');
    let introStart = -1;
    let introEnd = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Find the start of introduction (after the title)
      if (line.includes('ValueBoost AI Analysis Report') || line.includes('OfferBoost AI Analysis Report')) {
        introStart = i + 1;
      }
      
      // Find the end of introduction (before property details)
      if (introStart > -1 && (line.startsWith('Property:') || line.includes('Current Estimated Value:'))) {
        introEnd = i;
        break;
      }
    }
    
    if (introStart > -1 && introEnd > introStart) {
      const introLines = lines.slice(introStart, introEnd)
        .filter(line => line.trim().length > 0) // Remove empty lines
        .map(line => line.trim());
      
      return introLines.join(' ');
    }
    
    return null;
  };
  
  // Clean AI report content by removing unwanted signatures
  const cleanAiReport = (reportText) => {
    if (!reportText) return reportText;
    
    // Remove "Best Regards, [Your Name]" and similar signatures
    return reportText
      .replace(/Best Regards,?\s*\[?Your Name\]?/gi, '')
      .replace(/Best Regards,?\s*$/gmi, '')
      .replace(/Sincerely,?\s*\[?Your Name\]?/gi, '')
      .replace(/Sincerely,?\s*$/gmi, '')
      .trim();
  };
  
  // Get AI introduction if available (memoized to prevent re-calculation)
  const aiIntroduction = useMemo(() => {
    return aiReport ? extractAIIntroduction(aiReport) : null;
  }, [aiReport]);
  
  // State declarations
  const [unlocked, setUnlocked] = useState(false); // Track if recommendations are unlocked
  const [processingTimeout, setProcessingTimeout] = useState(false); // Track if processing has timed out
  const [aiReportTimeout, setAiReportTimeout] = useState(false); // Track if AI report has timed out after unlock
  const [processingStartTime] = useState(Date.now()); // Track when processing started
  
  // Debug logging for AI report
  useEffect(() => {
    console.log('🤖 AI report state check in ValueBoostReport:', {
      hasAiReportState: !!aiReport,
      aiReportLength: aiReport ? aiReport.length : 0,
      hasLocalStorage: !!localStorage.getItem('aiHomeReport'),
      localStorageLength: localStorage.getItem('aiHomeReport') ? localStorage.getItem('aiHomeReport').length : 0,
      hasIntroduction: !!aiIntroduction,
      unlocked: unlocked
    });
  }, [aiReport, aiIntroduction, unlocked]);

  // AI report timeout after unlock (7 seconds)
  useEffect(() => {
    if (unlocked && !aiReport && !aiReportTimeout) {
      console.log('⏰ Starting 7-second AI report timeout after unlock');
      const timeout = setTimeout(() => {
        console.log('⏰ AI report timeout reached - showing fallback message');
        setAiReportTimeout(true);
      }, 7000); // 7 seconds

      return () => clearTimeout(timeout);
    }
  }, [unlocked, aiReport, aiReportTimeout]);
  
  // Scroll to top when component loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // TESTING TOGGLE: Comment/uncomment the lines below to enable/disable dummy data for step 3
  const ENABLE_DUMMY_DATA = false; // Set to true for testing
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Use dummy data if enabled and on localhost and no API data available
  const testFormData = (ENABLE_DUMMY_DATA && isLocalhost && (!formData.apiEstimatedValue || formData.apiEstimatedValue === 0)) ? {
    ...formData,
    apiEstimatedValue: 485000,
    formattedApiEstimatedValue: '$485,000',
    potentialValueIncrease: 116400,
    formattedPotentialIncrease: '$116,400',
    valueIncreasePercentage: 24,
    street: formData.street || '123 Maple Street, Atlanta, GA 30309'
  } : formData;

  // Handle 15-second timeout for processing - placed after testFormData definition
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Only set timeout if we still don't have API value and no AI report
      if (!testFormData.apiEstimatedValue && !aiReport) {
        console.log('⏰ Processing timeout reached - no API data or AI report after 15 seconds');
        setProcessingTimeout(true);
      }
    }, 15000); // 15 seconds

    // Clear timeout if we get API data or AI report
    if (testFormData.apiEstimatedValue || aiReport) {
      clearTimeout(timeout);
      setProcessingTimeout(false);
    }

    return () => clearTimeout(timeout);
  }, [testFormData.apiEstimatedValue, aiReport]);

  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '', // Always start empty - no autofill from step 1
    phone: '', // Always start empty - no autofill from step 1
    email: formData.email || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [reportLoading, setReportLoading] = useState(true);
  const [showReportReady, setShowReportReady] = useState(false);
  const [showAddressRetry, setShowAddressRetry] = useState(false);
  const [contactFormCompleted, setContactFormCompleted] = useState(false);
  const [reportStateLockedIn, setReportStateLockedIn] = useState(false); // Prevent flickering back to processing

  // Simple AI report loading - no polling, no Firebase reads
  useEffect(() => {
    // Get from FormContext (live state) or localStorage (persistence)
    const reportFromContext = formData.aiHomeReport;
    const reportFromStorage = localStorage.getItem('aiHomeReport');
    const availableReport = reportFromContext || reportFromStorage;
    
    if (availableReport && availableReport !== aiReport) {
      console.log('📄 AI report loaded:', {
        source: reportFromContext ? 'FormContext' : 'localStorage',
        reportLength: availableReport.length,
        preview: availableReport.substring(0, 100) + '...'
      });
      setAiReport(availableReport);
      
      // Sync FormContext if needed
      if (!reportFromContext && reportFromStorage) {
        updateFormData({ aiHomeReport: reportFromStorage });
      }
    }
  }, [formData.aiHomeReport]); // Only watch FormContext changes

  // Update contact info when data becomes available - preserve user input
  useEffect(() => {
    setContactInfo(prevState => ({
      ...prevState,
      // Keep user-entered name and phone values, no autofill
      name: prevState.name,
      phone: prevState.phone,
      email: formData.email || prevState.email
    }));
  }, [formData.email]);

  // Report loading timeout logic - reduced to 2.5 seconds for faster UX
  useEffect(() => {
    let loadingTimeoutId = null;
    
    // Check if we have essential data for the report
    const hasReportData = formData.apiEstimatedValue && formData.apiEstimatedValue > 0;
    
    // Check if user is returning from address retry (preserve unlocked state)
    const isReturnFromRetry = formData.addressSelectionType === 'AddressRetry-Google' || 
                             formData.leadStage === 'Address Retry - Selected' ||
                             localStorage.getItem('valueboost_unlocked') === 'true';
    
    if (isReturnFromRetry) {
      // User is returning from retry - unlock immediately regardless of API data
      setReportLoading(false);
      setShowReportReady(false);
      setShowAddressRetry(false);
      setContactFormCompleted(true);
      setUnlocked(true);
      setReportStateLockedIn(true); // Lock in this state
      localStorage.setItem('valueboost_unlocked', 'true');
      return;
    }
    
    // Don't change states if already locked in
    if (reportStateLockedIn) {
      return;
    }
    
    // Always show loading first, then "report ready" with contact form
    // Contact form is ALWAYS required regardless of API status
    setReportLoading(true);
    setShowReportReady(false);
    setShowAddressRetry(false);
    
    // Set timeout to show "report ready" message + contact form after 2.5 seconds
    loadingTimeoutId = setTimeout(() => {
      // After 2.5 seconds, always show "report ready" + contact form
      // API status doesn't matter - contact form is always required
      setReportLoading(false);
      setShowReportReady(true);
      setReportStateLockedIn(true); // Lock in this state to prevent flickering
      
      // Set up a listener to detect when APIs complete (for retry logic only)
      const dataCheckInterval = setInterval(() => {
        // This just monitors API completion for potential retry logic
        // But doesn't change the UI - contact form still required
        if (formData.apiEstimatedValue && formData.apiEstimatedValue > 0) {
          console.log('✅ API data received, but contact form still required');
          // Don't change UI - keep showing contact form
        }
      }, 1000);
      
      // Clean up the interval after 30 seconds
      setTimeout(() => clearInterval(dataCheckInterval), 30000);
    }, 2500); // 2.5 seconds minimum loading time
    
    // Handle data arriving during the loading phase - show immediately when ready
    if (!isReturnFromRetry && !reportStateLockedIn) {
      const earlyDataCheck = setInterval(() => {
        if (formData.apiEstimatedValue && formData.apiEstimatedValue > 0) {
          // API data is ready - show report immediately, skip loading delay
          console.log('✅ API data received early - showing report immediately');
          clearTimeout(loadingTimeoutId); // Cancel the 2.5 second delay
          setReportLoading(false);
          setShowReportReady(true);
          setReportStateLockedIn(true); // Lock in this state to prevent flickering
          clearInterval(earlyDataCheck);
        }
      }, 500); // Check every 500ms
      
      // Clean up interval after 5 seconds
      setTimeout(() => clearInterval(earlyDataCheck), 5000);
    }
    
    return () => {
      if (loadingTimeoutId) clearTimeout(loadingTimeoutId);
    };
  }, [formData.apiEstimatedValue, formData.addressSelectionType, formData.leadStage, reportStateLockedIn]);
  
  // Generate property-specific recommendations based on Melissa data
  const generateRecommendations = () => {
    // All potential value boost strategies (base strategies + additional ones)
    const allStrategies = [
      // Core strategies
      
      { strategy: "Paint Interior with Neutral Colors",
        description: "Applying fresh, neutral paint colors throughout the interior can dramatically increase appeal and perceived value.",
        costEstimate: "$1,500 - $3,800",
        roiEstimate: "1.5 - 2x investment",
        tags: ["interior", "cosmetic", "quick", "universal", "visual-appeal", "low-cost"] },
      { strategy: "Refresh Landscaping & Curb Appeal",
        description: "Strategic landscaping improvements create a strong first impression and can significantly boost perceived value.",
        costEstimate: "$800 - $2,500",
        roiEstimate: "1.3 - 2x investment",
        tags: ["exterior", "curb-appeal", "first-impression", "quick", "visual-appeal"] },
      { strategy: "Deep Clean & Declutter Entire Home",
        description: "Professional deep cleaning and decluttering make spaces appear larger and better maintained.",
        costEstimate: "$400 - $1,200",
        roiEstimate: "3 - 5x investment",
        tags: ["interior", "quick", "universal", "low-cost", "high-roi"] },
      { strategy: "Replace or Modernize Light Fixtures",
        description: "Updated lighting fixtures provide a modern aesthetic and improved functionality to living spaces.",
        costEstimate: "$500 - $2,000",
        roiEstimate: "1.5 - 2x investment",
        tags: ["interior", "fixtures", "electrical", "visual-appeal", "older-home"] },
      { strategy: "Stage Living and Primary Bedroom",
        description: "Professional staging in key rooms helps buyers visualize the space and creates emotional connections.",
        costEstimate: "$800 - $3,000",
        roiEstimate: "1.5 - 3x investment",
        tags: ["interior", "marketing", "luxury", "empty-home", "quick"] },
      { strategy: "Refinish or Replace Flooring",
        description: "Refreshed or new flooring in high-traffic areas significantly improves visual appeal and perceived quality.",
        costEstimate: "$2,000 - $8,000",
        roiEstimate: "1.2 - 1.7x investment",
        tags: ["interior", "flooring", "high-impact", "older-home"] },
      { strategy: "Kitchen Cosmetic Upgrades",
        description: "Strategic updates to countertops, hardware, or backsplash can transform the kitchen without a full renovation.",
        costEstimate: "$1,500 - $5,000",
        roiEstimate: "1.3 - 2x investment",
        tags: ["kitchen", "cosmetic", "high-impact", "dated-features"] },
      { strategy: "Bathroom Touch-Ups",
        description: "Affordable updates to fixtures, hardware, and caulking refresh these high-value spaces.",
        costEstimate: "$800 - $3,000",
        roiEstimate: "1.4 - 2x investment",
        tags: ["bathroom", "cosmetic", "fixtures", "dated-features"] },
      { strategy: "Fresh Exterior Paint or Power Wash",
        description: "A refreshed exterior significantly improves curb appeal and first impressions.",
        costEstimate: "$1,800 - $5,000",
        roiEstimate: "1.3 - 1.8x investment",
        tags: ["exterior", "curb-appeal", "paint", "older-home", "high-impact"] },
      { strategy: "Update Entry Door or Garage Door",
        description: "These high-visibility upgrades create immediate visual impact and perceived quality.",
        costEstimate: "$1,000 - $3,500",
        roiEstimate: "1.3 - 2.1x investment",
        tags: ["exterior", "curb-appeal", "high-impact", "doors"] },
      { strategy: "Fix Inspection Red Flags Preemptively",
        description: "Addressing potential inspection issues before listing prevents buyer negotiations and deal delays.",
        costEstimate: "Varies",
        roiEstimate: "1.5 - 3x investment",
        tags: ["repairs", "older-home", "structural", "systems", "high-roi"] },
      { strategy: "Highlight Energy-Efficient Features",
        description: "Showcasing or adding energy-efficient elements appeals to cost-conscious and environmentally-minded buyers.",
        costEstimate: "$300 - $1,500",
        roiEstimate: "1.3 - 2x investment",
        tags: ["marketing", "energy", "systems", "modern-buyers"] },
      { strategy: "Upgrade Appliances",
        description: "New, matching appliances create a cohesive, modern kitchen that appeals to most buyers.",
        costEstimate: "$2,500 - $8,000",
        roiEstimate: "1.1 - 1.5x investment",
        tags: ["kitchen", "appliances", "dated-features", "high-impact"] },
      { strategy: "Minor Kitchen Layout Tweaks",
        description: "Strategic adjustments to improve kitchen flow without full renovation can yield significant value.",
        costEstimate: "$2,000 - $7,000",
        roiEstimate: "1.2 - 1.8x investment",
        tags: ["kitchen", "layout", "high-impact", "older-home"] },
      { strategy: "Organize Closets & Storage Areas",
        description: "Maximizing storage efficiency addresses a top buyer concern and showcases space potential.",
        costEstimate: "$300 - $1,200",
        roiEstimate: "2 - 4x investment",
        tags: ["interior", "storage", "quick", "low-cost", "high-roi"] },
      { strategy: "Paint/Refinish Front Door",
        description: "A striking entry door creates memorable first impressions at minimal cost.",
        costEstimate: "$200 - $500",
        roiEstimate: "2 - 5x investment",
        tags: ["exterior", "curb-appeal", "doors", "quick", "low-cost", "high-roi"] },
      { strategy: "Install Modern House Numbers & Fixtures",
        description: "These small details contribute to a cohesive, updated exterior appearance.",
        costEstimate: "$100 - $400",
        roiEstimate: "2 - 4x investment",
        tags: ["exterior", "curb-appeal", "quick", "low-cost", "details"] },
      { strategy: "Add a Home Office Setup/Space",
        description: "Dedicated workspace has become increasingly valuable to today's buyers.",
        costEstimate: "$500 - $2,000",
        roiEstimate: "1.3 - 2x investment",
        tags: ["interior", "layout", "modern-buyers", "repurpose"] },
      { strategy: "Replace Worn Baseboards or Trim",
        description: "Fresh trim provides a clean, maintained appearance throughout the home.",
        costEstimate: "$800 - $2,800",
        roiEstimate: "1.3 - 1.7x investment",
        tags: ["interior", "details", "cosmetic", "older-home"] },
      { strategy: "Mention Recent Upgrades in Marketing Materials",
        description: "Highlighting improvements in marketing helps buyers understand and appreciate added value.",
        costEstimate: "$0 - $200",
        roiEstimate: "5 - 10x investment",
        tags: ["marketing", "universal", "low-cost", "high-roi", "quick"] },

      // Include all additional strategies
      ...additionalStrategies
    ];

    // Extract property data to inform recommendations
    const propertyRecord = formData.propertyRecord || {};
    console.log("Property record for recommendations:", propertyRecord);

    // Extract year built
    const yearBuilt = propertyRecord.PropertyUseInfo?.YearBuilt || propertyRecord.YearBuilt || 1980;
    const propertyAge = new Date().getFullYear() - yearBuilt;

    // Extract square footage
    const squareFootage = formData.finishedSquareFootage ||
                        (propertyRecord.PropertySize?.AreaBuilding) || 1500;

    // Extract room counts
    const bedrooms = formData.bedrooms ||
                   (propertyRecord.IntRoomInfo?.BedroomsCount) || 3;

    const bathrooms = formData.bathrooms ||
                    (propertyRecord.IntRoomInfo?.BathCount) || 2;

    // Extract lot size
    const lotSize = propertyRecord.PropertySize?.AreaLot || 0;

    // Extract sale history
    const lastSaleDate = propertyRecord.SaleInfo?.AssessorLastSaleDate || propertyRecord.CurrentDeed?.SaleDate || '';
    const lastSaleYear = lastSaleDate ? parseInt(lastSaleDate.substring(0, 4)) : 0;
    const yearsSinceLastSale = lastSaleYear ? new Date().getFullYear() - lastSaleYear : 10;

    // Extract property type
    const propertyType = propertyRecord.PropertyUseInfo?.PropertyUseStandardized ||
                        propertyRecord.PropertyType?.Description || 'Single Family';

    // Extract property use
    const isOwnerOccupied = (propertyRecord.OwnerAddress?.OwnerOccupied || '').includes('Owner occupied') ||
                          propertyRecord.OwnerOccupied === 'Y';

    // Extract basement information
    const basementArea = parseInt(propertyRecord.PropertySize?.BasementArea) || 0;
    const basementFinishedArea = parseInt(propertyRecord.PropertySize?.BasementAreaFinished) || 0;
    const hasUnfinishedBasement = basementArea > 0 && (basementFinishedArea === 0 || basementArea > basementFinishedArea);

    // Extract exterior information
    const exteriorMaterial = propertyRecord.ExtStructInfo?.Exterior1Code || '';
    const isBrick = (exteriorMaterial || '').toLowerCase().includes('brick');

    // Extract fireplace information
    const hasFireplace = propertyRecord.IntAmenities?.Fireplace === 'Yes';

    // Extract porch information
    const hasPorch = propertyRecord.ExtAmenities?.PorchCode !== 'Unknown or not provided' &&
                    propertyRecord.ExtAmenities?.PorchCode !== '';

    // Extract roof information
    const roofMaterial = propertyRecord.ExtStructInfo?.RoofMaterial || '';
    const roofAge = propertyAge; // Assume roof age is similar to property age unless specified

    // Extract stories information
    const storiesCount = propertyRecord.IntRoomInfo?.StoriesCount || '';
    const isMultiStory = storiesCount &&
                        (storiesCount.includes('+') ||
                         storiesCount.includes('2') ||
                         parseInt(storiesCount) > 1);

    // Extract fence information
    const hasFence = propertyRecord.YardGardenInfo?.FenceCode !== 'Unknown or not provided' &&
                    propertyRecord.YardGardenInfo?.FenceCode !== '';

    // Initialize score tracking for strategies
    const strategyScores = allStrategies.map((strategy, index) => ({
      index,
      strategy,
      score: 0
    }));

    // Score strategies based on property attributes
    strategyScores.forEach(item => {
      const strategy = item.strategy;
      const tags = strategy.tags;

      // Older homes (>20 years) need more updates to systems, fixtures, etc.
      if (propertyAge > 20 && tags.includes('older-home')) {
        item.score += 25;
      }

      // Newer homes benefit more from cosmetic and marketing focused strategies
      if (propertyAge < 10 && (tags.includes('cosmetic') || tags.includes('marketing'))) {
        item.score += 20;
      }

      // For mid-age homes (10-20 years), focus on refreshing dated features
      if (propertyAge >= 10 && propertyAge <= 20 && tags.includes('dated-features')) {
        item.score += 20;
      }

      // Larger homes (>2000 sq ft) benefit more from staging and organization
      if (squareFootage > 2000 && (tags.includes('staging') || tags.includes('storage'))) {
        item.score += 15;
      }

      // Smaller homes benefit from space optimization strategies
      if (squareFootage < 1500 && tags.includes('layout')) {
        item.score += 15;
      }

      // Homes with larger lots benefit more from landscaping
      if (lotSize > 8000 && tags.includes('curb-appeal')) {
        item.score += 15;
      }

      // Empty/non-owner occupied homes benefit more from staging
      if (!isOwnerOccupied && tags.includes('empty-home')) {
        item.score += 20;
      }

      // Homes sold long ago likely need more updates
      if (yearsSinceLastSale > 7) {
        item.score += 10;
      }

      // Kitchen-focused strategies for homes with dated kitchens (proxy: older homes)
      if (propertyAge > 15 && tags.includes('kitchen')) {
        item.score += 25;
      }

      // Bathroom-focused strategies for homes with multiple bathrooms
      if (bathrooms >= 2 && tags.includes('bathroom')) {
        item.score += 15;
      }

      // Universal high-impact strategies always score well
      if (tags.includes('high-impact')) {
        item.score += 10;
      }

      // High ROI strategies always score well
      if (tags.includes('high-roi')) {
        item.score += 10;
      }

      // New scoring rules for additional property attributes

      // Basement finishing recommendations for homes with unfinished basement
      if (hasUnfinishedBasement && tags.includes('basement')) {
        item.score += 35; // Very high score for this targeted improvement
      }

      // Brick exterior improvement recommendations
      if (isBrick && tags.includes('brick')) {
        item.score += 30;
      }

      // Fireplace enhancement recommendations
      if (hasFireplace && tags.includes('fireplace')) {
        item.score += 25;
      }

      // Porch improvement recommendations
      if (hasPorch && tags.includes('porch')) {
        item.score += 25;
      }

      // Roof improvement recommendations for older roofs
      if (roofAge > 15 && tags.includes('roof')) {
        item.score += 30;
      }

      // Multi-level home optimization
      if (isMultiStory && tags.includes('multi-story')) {
        item.score += 20;
      }

      // Fencing recommendations for unfenced properties
      if (!hasFence && tags.includes('yard') && strategy.strategy.includes('Fence')) {
        item.score += 30;
      }

      // Outdoor living space for larger lots
      if (lotSize > 10000 && tags.includes('entertainment')) {
        item.score += 25;
      }

      // Premium upgrades for higher-value homes
      if (formData.apiEstimatedValue > 500000 && tags.includes('luxury')) {
        item.score += 20;
      }

      // HVAC improvements for older homes
      if (propertyAge > 15 && tags.includes('systems') && strategy.strategy.includes('HVAC')) {
        item.score += 25;
      }
    });

    // Sort by score (highest first)
    strategyScores.sort((a, b) => b.score - a.score);

    // Calculate the total potential value increase from recommendations
    // and determine optimal number of recommendations to show
    const calculateOptimalRecommendationCount = () => {
      // Default to a higher number of recommendations (8-10)
      let recommendationCount = formData.upgradesNeeded || 8;

      // Sort strategies by score for evaluation
      const sortedStrategies = [...strategyScores].sort((a, b) => b.score - a.score);

      // Current home value
      const currentValue = formData.apiEstimatedValue || 300000;

      // Track cumulative value increase
      let cumulativeValueIncrease = 0;
      let cumulativeValueIncreasePercent = 0;
      const MAX_VALUE_INCREASE_PERCENT = 40; // Cap at 40% total value increase

      // Determine how many recommendations to include before hitting value cap
      for (let i = 0; i < sortedStrategies.length && i < 12; i++) {
        // Estimate value increase for this strategy (rough approximation)
        // Using the strategy name to estimate impact
        const strategy = sortedStrategies[i].strategy;
        let estimatedValueIncreasePercent = 0;

        // Assign estimated value increase percentages based on improvement type
        if (strategy.strategy.includes("Kitchen")) estimatedValueIncreasePercent = 5;
        else if (strategy.strategy.includes("Bathroom")) estimatedValueIncreasePercent = 4;
        else if (strategy.strategy.includes("Basement")) estimatedValueIncreasePercent = 8;
        else if (strategy.strategy.includes("Exterior") || strategy.strategy.includes("Curb Appeal")) estimatedValueIncreasePercent = 4;
        else if (strategy.strategy.includes("Flooring")) estimatedValueIncreasePercent = 3;
        else if (strategy.strategy.includes("Paint")) estimatedValueIncreasePercent = 2;
        else if (strategy.strategy.includes("HVAC")) estimatedValueIncreasePercent = 2;
        else if (strategy.strategy.includes("Roof")) estimatedValueIncreasePercent = 3;
        else estimatedValueIncreasePercent = 2; // Default for other improvements

        // Add to cumulative increase
        cumulativeValueIncreasePercent += estimatedValueIncreasePercent;

        // If we've reached our cap, set the count and break
        if (cumulativeValueIncreasePercent >= MAX_VALUE_INCREASE_PERCENT) {
          recommendationCount = i + 1; // Include this one
          break;
        }
      }

      // Ensure we always show at least 5 recommendations
      return Math.max(5, recommendationCount);
    };

    // Determine optimal number of recommendations
    const count = calculateOptimalRecommendationCount();
    console.log(`Showing ${count} recommendations based on value impact analysis`);

    // Take top strategies based on determined count
    const topStrategies = strategyScores.slice(0, count).map(item => {
      // Add property-specific customization to descriptions
      const strategy = {...item.strategy};

      // Create property-specific descriptions
      if (strategy.strategy === "Paint Interior with Neutral Colors") {
        strategy.description = `For this ${propertyAge}-year-old home, fresh neutral paint will dramatically brighten interior spaces and maximize perceived value.`;

        // Calculate dynamic cost based on home size
        const ageFactor = propertyAge > 20 ? 1.1 : 1.0; // Older homes may need more prep work
        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 1500, 3800,
          { customFactor: ageFactor }
        );

        // Calculate dynamic ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.5, 2.0
        );

      } else if (strategy.strategy === "Refresh Landscaping & Curb Appeal") {
        strategy.description = `Enhanced curb appeal through strategic landscaping will make this ${lotSize > 6000 ? 'larger' : 'standard'} lot property stand out in online listings and first viewings.`;

        // Calculate dynamic cost based on lot size
        const lotSizeFactor = lotSize > 10000 ? 1.4 : lotSize > 6000 ? 1.2 : 1.0;
        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 800, 2500,
          { customFactor: lotSizeFactor }
        );

        // Calculate dynamic ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.3, 2.0
        );

      } else if (strategy.strategy === "Replace or Modernize Light Fixtures") {
        strategy.description = `Updating light fixtures from the ${yearBuilt < 2000 ? 'older style' : 'basic builder-grade'} currently in the home will immediately modernize the space.`;

        // Calculate dynamic cost based on home age
        const ageFactor = propertyAge > 20 ? 1.2 : 1.0;
        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 500, 2000,
          { customFactor: ageFactor }
        );

        // Calculate dynamic ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.5, 2.0
        );

      } else if (strategy.strategy === "Kitchen Cosmetic Upgrades") {
        strategy.description = `Strategic updates to this ${propertyAge > 15 ? 'older' : ''} kitchen's countertops, hardware, or backsplash will transform this critical space without a full renovation.`;

        // Calculate dynamic cost based on home age
        const ageFactor = propertyAge > 20 ? 1.3 : propertyAge > 10 ? 1.1 : 1.0;
        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 1500, 5000,
          { customFactor: ageFactor }
        );

        // Calculate dynamic ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.3, 2.0
        );

      } else if (strategy.strategy === "Fix Inspection Red Flags Preemptively") {
        strategy.description = `In a ${propertyAge}-year-old home, addressing potential inspection issues before listing can prevent negotiations and deal delays.`;

        // Costs vary too much by issue type for specific calculations
        strategy.costEstimate = 'Varies by issue';

        // Calculate dynamic ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.5, 3.0,
          { ageFactor: propertyAge > 25 ? 1.2 : 1.0 }
        );

      } else if (strategy.strategy === "Organize Closets & Storage Areas") {
        strategy.description = `In this ${bedrooms}-bedroom home, maximizing storage efficiency will address a top buyer concern and showcase space potential.`;

        // Calculate dynamic cost based on bedroom count
        const bedroomFactor = bedrooms > 3 ? 1.3 : 1.0;
        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 300, 1200,
          { customFactor: bedroomFactor }
        );

        // Calculate dynamic ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 2.0, 4.0
        );
      }
      // New property-specific descriptions for additional strategies
      else if (strategy.strategy === "Finish Unfinished Basement Space") {
        const potentialArea = basementArea - basementFinishedArea;
        strategy.description = `Transform your ${potentialArea} sq ft of unfinished basement into valuable living space, potentially adding $${Math.round((potentialArea * 75)/1000)*1000} to your home's value.`;

        // Calculate dynamic cost based on basement size
        const costPerSqFt = 65; // Average cost per sq ft for basic finishing
        const costMin = Math.round((potentialArea * costPerSqFt * 0.8) / 1000) * 1000;
        const costMax = Math.round((potentialArea * costPerSqFt * 1.2) / 1000) * 1000;
        strategy.costEstimate = `$${costMin.toLocaleString()} - $${costMax.toLocaleString()}`;

        // Calculate dynamic ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.2, 1.6
        );

      } else if (strategy.strategy === "Add Property Fence for Privacy & Appeal") {
        strategy.description = `Installing a quality fence on this ${lotSize > 10000 ? 'large' : lotSize > 6000 ? 'medium' : 'standard'} lot will define boundaries, add privacy, and enhance curb appeal.`;

        // Calculate dynamic cost based on lot perimeter
        const estPerimeter = Math.sqrt(lotSize) * 4; // Rough estimate of perimeter in feet
        const costPerFoot = 30; // Average cost per foot
        const lotSizeFactor = lotSize > 10000 ? 1.3 : lotSize > 6000 ? 1.1 : 0.9;

        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 3000, 8000,
          { customFactor: lotSizeFactor }
        );

        // Calculate dynamic ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.1, 1.5
        );

      } else if (strategy.strategy === "Upgrade HVAC System Efficiency") {
        strategy.description = `Replacing your ${propertyAge > 20 ? 'aging' : 'current'} HVAC system will improve energy efficiency and appeal to today's eco-conscious buyers.`;

        // Calculate dynamic cost based on home size and system age
        const agingSystemFactor = propertyAge > 20 ? 1.2 : 1.0;

        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 4000, 9000,
          { customFactor: agingSystemFactor }
        );

        // Calculate dynamic ROI - older systems replaced show better ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.1, 1.3,
          { ageFactor: propertyAge > 15 ? 1.2 : 1.0 }
        );

      } else if (strategy.strategy === "Enhance Fireplace Aesthetics") {
        strategy.description = `Modernizing your fireplace with an updated surround and mantel will create a stunning focal point in your living space.`;

        // Calculate dynamic cost based on property value tier
        const propertyValueFactor = formData.apiEstimatedValue > 500000 ? 1.3 : 1.0;

        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 800, 3000,
          { customFactor: propertyValueFactor }
        );

        // Calculate dynamic ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.3, 1.8
        );

      } else if (strategy.strategy === "Improve Exterior Brick Appearance") {
        strategy.description = `Refreshing your brick exterior with techniques like ${propertyAge > 30 ? 'limewashing or german smear' : 'strategic accent painting'} will dramatically update your home's appearance.`;

        // Calculate dynamic cost based on home size
        const wallArea = Math.sqrt(squareFootage) * 10 * 2; // Very rough wall area estimate
        const ageFactor = propertyAge > 30 ? 1.2 : 1.0; // Older brick needs more work

        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 2500, 7500,
          { customFactor: ageFactor }
        );

        // Calculate dynamic ROI - older homes see better ROI from facade updates
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.2, 1.7,
          { ageFactor: propertyAge > 20 ? 1.2 : 1.0 }
        );

      } else if (strategy.strategy === "Add or Refresh Porch Appeal") {
        const porchArea = parseInt(propertyRecord.ExtAmenities?.PorchArea) || 150;
        strategy.description = `Enhancing your ${porchArea} sq ft porch with new railings, flooring, and ceiling features will create an inviting entrance and boost curb appeal.`;

        // Calculate dynamic cost based on porch size
        const porchSizeFactor = porchArea > 200 ? 1.3 : porchArea > 100 ? 1.0 : 0.8;

        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 1200, 5000,
          { customFactor: porchSizeFactor }
        );

        // Calculate dynamic ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.3, 2.0
        );

      } else if (strategy.strategy === "Optimize Multi-Level Living Space") {
        strategy.description = `Creating better flow between your home's ${storiesCount || 'multiple'} levels with consistent design elements will enhance the living experience for prospective buyers.`;

        // Calculate dynamic cost based on home complexity
        const levelsFactor = storiesCount && parseInt(storiesCount.charAt(0)) > 2 ? 1.3 : 1.0;

        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 1500, 4000,
          { customFactor: levelsFactor }
        );

        // Calculate dynamic ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.2, 1.6
        );

      } else if (strategy.strategy === "Update Roof Appearance") {
        strategy.description = `Refreshing your ${roofAge > 15 ? 'aging' : ''} ${roofMaterial.toLowerCase()} roof will not only enhance protection but dramatically improve curb appeal.`;

        // Calculate dynamic cost based on home size
        const roofArea = squareFootage * 1.2; // Rough roof area estimate
        const roofAgeFactor = roofAge > 15 ? 1.2 : 1.0;

        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 5000, 12000,
          { customFactor: roofAgeFactor }
        );

        // Calculate dynamic ROI - older roofs replaced show better ROI improvement
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.1, 1.5,
          { ageFactor: roofAge > 15 ? 1.2 : 1.0 }
        );

      } else if (strategy.strategy === "Install Modern Water Features") {
        strategy.description = `Adding elegant water elements to your ${lotSize > 10000 ? 'spacious' : ''} yard will create a tranquil atmosphere that appeals to luxury buyers in this price range.`;

        // Calculate dynamic cost based on property value tier
        const luxuryFactor = formData.apiEstimatedValue > 750000 ? 1.5 :
                             formData.apiEstimatedValue > 500000 ? 1.2 : 1.0;

        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 1500, 6000,
          { customFactor: luxuryFactor }
        );

        // Calculate dynamic ROI - more effective for luxury properties
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.2, 1.5
        );

      } else if (strategy.strategy === "Create or Enhance Outdoor Entertainment Area") {
        strategy.description = `Developing a dedicated outdoor living space on your ${lotSize > 10000 ? 'large' : lotSize > 6000 ? 'nicely sized' : ''} lot will attract buyers seeking a modern indoor-outdoor lifestyle.`;

        // Calculate dynamic cost based on lot size and property value
        const lotSizeFactor = lotSize > 10000 ? 1.3 : lotSize > 6000 ? 1.1 : 0.9;
        const propertyValueFactor = formData.apiEstimatedValue > 500000 ? 1.2 : 1.0;
        const combinedFactor = lotSizeFactor * propertyValueFactor;

        strategy.costEstimate = calculatePropertySpecificCost(
          formData, propertyRecord, 2500, 8000,
          { customFactor: combinedFactor }
        );

        // Calculate dynamic ROI
        strategy.roiEstimate = calculatePropertySpecificROI(
          formData, propertyRecord, 1.3, 1.7
        );
      }

      return strategy;
    });

    console.log("Generated property-specific recommendations:", topStrategies);
    return topStrategies;
  };
  
  // Get recommendations (either from form data or generate new ones)
  const recommendations = testFormData.recommendations || generateRecommendations();
  
  // Store recommendations in form data if not already there
  if (!testFormData.recommendations) {
    updateFormData({
      recommendations: recommendations
    });
  }
  
  // Calculate property-specific value increase based on property attributes
  const calculatePotentialValueIncrease = () => {
    // Use stored value if available
    if (testFormData.potentialValueIncrease) {
      return testFormData.potentialValueIncrease;
    }

    // Get current property value
    const currentValue = testFormData.apiEstimatedValue || 300000;

    // Extract property data
    const propertyRecord = formData.propertyRecord || {};

    // Calculate base increase percentage based on property age
    const yearBuilt = propertyRecord.YearBuilt || 1980;
    const propertyAge = new Date().getFullYear() - yearBuilt;

    let baseIncreasePercentage = 0.15; // Default 15% increase

    // Older homes have higher improvement potential
    if (propertyAge > 30) {
      baseIncreasePercentage = 0.22; // 22% increase potential
    } else if (propertyAge > 15) {
      baseIncreasePercentage = 0.18; // 18% increase potential
    } else if (propertyAge < 5) {
      baseIncreasePercentage = 0.12; // 12% increase potential (newer homes)
    }

    // Adjust based on home size
    const squareFootage = formData.finishedSquareFootage ||
                         (propertyRecord.PropertySize?.AreaBuilding) || 1500;

    // Larger homes typically see smaller percentage gains but larger absolute gains
    if (squareFootage > 3000) {
      baseIncreasePercentage -= 0.02;
    } else if (squareFootage < 1200) {
      baseIncreasePercentage += 0.03;
    }

    // Adjust based on neighborhood value/price point
    // Higher-priced homes typically see smaller percentage increases
    if (currentValue > 750000) {
      baseIncreasePercentage -= 0.03;
    } else if (currentValue < 200000) {
      baseIncreasePercentage += 0.04;
    }

    // Calculate the final increase amount
    const increaseAmount = Math.round(currentValue * baseIncreasePercentage);

    // Update value increase percentage in form data
    if (!formData.valueIncreasePercentage) {
      updateFormData({
        valueIncreasePercentage: Math.round(baseIncreasePercentage * 100)
      });
    }

    return increaseAmount;
  };

  // Get potential value increase
  const potentialIncrease = testFormData.potentialValueIncrease || calculatePotentialValueIncrease();
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    if (!value) return '';

    // If already formatted, return as-is
    if (value.includes('(') && value.includes(')') && value.includes('-')) {
      return value;
    }

    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Handle 11-digit numbers by taking last 10 digits
    const workingDigits = digits.length === 11 && digits[0] === '1' 
      ? digits.slice(1) 
      : digits.slice(0, 10);
    
    // Format progressively as user types
    if (workingDigits.length <= 3) {
      return workingDigits;
    } else if (workingDigits.length <= 6) {
      return `(${workingDigits.slice(0, 3)}) ${workingDigits.slice(3)}`;
    } else {
      return `(${workingDigits.slice(0, 3)}) ${workingDigits.slice(3, 6)}-${workingDigits.slice(6)}`;
    }
  };

  // Handle contact form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Format phone number as user types
      const formattedPhone = formatPhoneNumber(value);
      setContactInfo({
        ...contactInfo,
        [name]: formattedPhone
      });
    } else {
      setContactInfo({
        ...contactInfo,
        [name]: value
      });
    }
  };
  
  // Helper function to validate and clean phone numbers
  const validateAndCleanPhone = (phone) => {
    if (!phone || phone.trim() === '') {
      return { isValid: false, cleaned: '', error: 'Please tell us where to text your ValueBoost report details. We respect your privacy - No spam ever' };
    }

    // Remove all non-digit characters
    let cleanedPhone = phone.replace(/\D/g, '');
    
    // Handle common cases:
    // 1. Leading +1 (e.g., +14804858488)
    // 2. Leading 1 (e.g., 14804858488) 
    // 3. Just 10 digits (e.g., 4804858488)
    if (cleanedPhone.startsWith('1') && cleanedPhone.length === 11) {
      // Remove leading 1 for US numbers
      cleanedPhone = cleanedPhone.substring(1);
    }
    
    // Check if we have exactly 10 digits after cleaning
    if (cleanedPhone.length === 10) {
      // Format as (XXX) XXX-XXXX for display
      const formatted = `(${cleanedPhone.substring(0, 3)}) ${cleanedPhone.substring(3, 6)}-${cleanedPhone.substring(6)}`;
      return { isValid: true, cleaned: cleanedPhone, formatted: formatted, error: null };
    } else {
      return { isValid: false, cleaned: cleanedPhone, error: 'Please enter a valid 10-digit phone number' };
    }
  };

  // Validate contact form fields
  const validateForm = () => {
    const errors = {};

    // Name is no longer required - commented out
    // if (!contactInfo.name || contactInfo.name.trim() === '') {
    //   errors.name = 'Name is required';
    // }

    // Validate phone number - this is the only required field
    const phoneValidation = validateAndCleanPhone(contactInfo.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error;
    }

    // Email is optional

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle contact form submission
  const handleSubmit = async (e) => {
    console.log('🔥 VALUEBOOST FORM SUBMIT STARTED');
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      console.log('🔥 Form validation failed, stopping submission');
      return;
    }

    console.log('🔥 Form validation passed, proceeding with submission');
    setIsSubmitting(true);

    // Clean the input values
    console.log("Raw contact info before cleaning:", contactInfo);
    let cleanName = contactInfo.name ? contactInfo.name.trim() : '';
    const phoneValidation = validateAndCleanPhone(contactInfo.phone);
    const cleanedPhone = phoneValidation.isValid ? phoneValidation.cleaned : contactInfo.phone;
    console.log("Cleaned values:", { cleanName, cleanedPhone, phoneValid: phoneValidation.isValid });

    // If the name had the autofill tag, remove it when user confirms
    if (cleanName.includes('(Autofilled by browser)')) {
      cleanName = cleanName.replace(' (Autofilled by browser)', '');
    }

    // Update form data with contact info and wait for it to complete
    console.log("🔥 UPDATING FORM DATA WITH FRESH CONTACT INFO");
    updateFormData({
      name: cleanName,
      phone: cleanedPhone,
      email: contactInfo.email,
      nameWasAutofilled: false, // Clear the autofill flag - COPIED FROM MAIN FORM
      leadStage: 'ValueBoost Report Qualified'
    });
    
    // Wait a moment for updateFormData to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      console.log("🔥🔥🔥 FIREBASE SECTION STARTING - MAIN HANDLESUBMIT PATH");
      
      // Update contact info in CRM first
      const leadId = localStorage.getItem('leadId');
      const existingLeadId = leadId;
      
      console.log("🔍 LEAD ID CHECK:", { leadId, existingLeadId });
      
      if (existingLeadId) {
        console.log("🔥 DIRECT CONTACT UPDATE FOR LEADID:", existingLeadId);
        console.log("🔥 Updating contact info with:", { cleanName, cleanedPhone, email: contactInfo.email || '' });
        
        try {
          // Use a custom update that preserves autofilled data
          const leadRef = doc(db, 'leads', existingLeadId);
          
          // Split name into first/last
          let firstName = '';
          let lastName = '';
          if (cleanName) {
            const nameParts = cleanName.split(' ');
            if (nameParts.length >= 2) {
              firstName = nameParts[0];
              lastName = nameParts.slice(1).join(' ');
            } else {
              lastName = cleanName;
            }
          }
          
          // Update only the manually entered contact fields, preserve autofilled data
          const contactUpdateData = {
            name: cleanName || '',
            phone: cleanedPhone || '',
            email: contactInfo.email || '',
            firstName: firstName,
            lastName: lastName || 'Contact',
            nameWasAutofilled: false,
            leadStage: 'Contact Info Provided',
            updatedAt: serverTimestamp()
            // Deliberately NOT updating autoFilledName and autoFilledPhone
          };
          
          await updateDoc(leadRef, contactUpdateData);
          console.log("✅ Manual contact update SUCCESS (preserved autofilled data)");
        } catch (contactError) {
          console.error("❌ updateContactInfo FAILED:", contactError);
        }
      } else {
        console.log("❌ No existing lead ID found for contact update");
      }
      
      // Skip updateLead() call to prevent overwriting contact info
      console.log("🔥 SKIPPING updateLead to prevent overwriting contact info");
      console.log("✅ Contact update completed - no additional updateLead needed");

      // Send notifications (non-blocking background execution) - MATCHING MAIN FORM PATTERN
      setTimeout(() => {
        console.log('🔍🔍🔍 VALUEBOOST NOTIFICATION TRACKING: Starting background notification section');
        
        const leadData = {
          name: cleanName,
          phone: cleanedPhone,
          address: testFormData.street,
          email: contactInfo.email || '',
          leadSource: 'ValueBoost Funnel',
          campaign_name: formData.campaign_name || 'ValueBoost',
          utm_source: formData.utm_source || '',
          utm_medium: formData.utm_medium || '',
          utm_campaign: formData.utm_campaign || '',
          id: formData.leadId || localStorage.getItem('leadId') || ''
        };

        console.log('🔍🔍🔍 VALUEBOOST NOTIFICATION TRACKING: Lead data ready for notifications', {
          name: leadData.name,
          phone: leadData.phone,
          address: leadData.address,
          leadId: leadData.id
        });
        
        // Note: Notifications are now handled automatically by the centralized notification system
        // in FormContext via the useNotifications hook
      }, 0);

      // After successful submission
      setIsSubmitting(false);
      setSubmitted(true);
      setUnlocked(true); // Unlock the recommendations
      setContactFormCompleted(true); // Mark contact form as completed
      localStorage.setItem('valueboost_unlocked', 'true'); // Persist unlocked state
      
      // Force reload AI report when unlocking
      setTimeout(() => {
        const storedReport = localStorage.getItem('aiHomeReport');
        if (storedReport && !aiReport) {
          console.log('🔄 Force-loading AI report after unlock');
          setAiReport(storedReport);
        }
      }, 100);
      
      // Check if we should show address retry option (after form completion, if no API data)
      setTimeout(() => {
        if (!formData.apiEstimatedValue || formData.apiEstimatedValue === 0) {
          setShowAddressRetry(true);
        }
      }, 3000); // Show retry option 3 seconds after form submission

      // ================================================================================
      // COMPREHENSIVE TRACKING - MATCHING MAIN FORM FUNNEL
      // ================================================================================
      
      // 1. PHONE LEAD TRACKING - EXACT MATCH TO MAIN FORM
      console.log('🔥 About to call trackPhoneNumberLead() from ValueBoost');
      trackPhoneNumberLead();
      console.log('🔥 trackPhoneNumberLead() call completed from ValueBoost');
      
      // 2. FORM STEP COMPLETION TRACKING
      trackFormStepComplete(3, 'ValueBoost Report Unlocked', formData);
      
      // 3. FORM SUBMISSION TRACKING
      trackFormSubmission({
        ...formData,
        funnelType: 'valueboost',
        conversionType: 'report_unlocked'
      });
      
      // 4. FACEBOOK PIXEL TRACKING
      trackPropertyValue({
        address: testFormData.street,
        currentValue: testFormData.apiEstimatedValue,
        potentialIncrease: testFormData.potentialValueIncrease || 0,
        name: cleanName,
        phone: cleanedPhone,
        email: contactInfo.email || '',
        funnel: 'valueboost',
        campaign_name: formData.campaign_name || '',
        utm_source: formData.utm_source || '',
        utm_medium: formData.utm_medium || '',
        utm_campaign: formData.utm_campaign || ''
      });
      
      // 5. COMPREHENSIVE DATALAYER EVENTS
      if (window.dataLayer) {
        // ValueBoost completion event
        window.dataLayer.push({
          event: 'ValueBoostReportCompleted',
          leadData: {
            address: testFormData.street,
            currentValue: testFormData.apiEstimatedValue,
            potentialIncrease: testFormData.potentialValueIncrease,
            upgradesRecommended: testFormData.upgradesNeeded || recommendations.length,
            funnelType: 'valueboost'
          },
          campaignData: {
            campaignId: formData.campaign_id || '',
            campaignName: formData.campaign_name || '',
            utmSource: formData.utm_source || '',
            utmMedium: formData.utm_medium || '',
            utmCampaign: formData.utm_campaign || '',
            keyword: formData.keyword || '',
            device: formData.device || '',
            gclid: formData.gclid || ''
          },
          conversionValue: testFormData.potentialValueIncrease ? Math.round(testFormData.potentialValueIncrease / 1000) : 0,
          timestamp: new Date().toISOString()
        });
      }
      
      // 6. GOOGLE ANALYTICS CONVERSION TRACKING
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-123456789/AbC-D_efG-h12345', // Replace with actual conversion ID
          'event_category': 'valueboost_lead',
          'event_label': 'ValueBoost Report Unlocked',
          'value': testFormData.potentialValueIncrease ? testFormData.potentialValueIncrease / 1000 : 1,
          'currency': 'USD'
        });
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      setIsSubmitting(false);
      setFormErrors({ submit: 'Failed to submit your information. Please try again.' });
    }
  };

  // Function to split recommendations into primary and secondary groups
  const splitRecommendations = () => {
    // Primary recommendations are top 10
    const primaryCount = 10;
    const primaryRecs = recommendations.slice(0, primaryCount);

    // Secondary recommendations are the rest
    const secondaryRecs = recommendations.slice(primaryCount);

    return { primaryRecs, secondaryRecs };
  };

  // Get split recommendations
  const { primaryRecs, secondaryRecs } = splitRecommendations();
  
  // Create a style to override the ::before pseudo-element
  const contentStyle = {
    position: 'relative'
  };

  // Function to clean address by removing USA/United States
  const cleanAddress = (address) => {
    if (!address) return '';
    
    return address
      .replace(/,?\s*(USA|United States|US)$/i, '') // Remove USA, United States, or US at the end
      .replace(/,\s*$/, '') // Remove trailing comma if any
      .trim();
  };

  // Add a ::before override with empty content
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .valueboost-content.hero-content::before {
        content: none !important;
        display: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="vb-report-section">
      <div className="vb-report-container">
        <div className="vb-content vb-fade-in" style={contentStyle}>
          
          {/* Loading State - show while waiting for API data */}
          {reportLoading && (
            <div className="vb-loading-container">
              <div className="vb-af1-hero-headline">
                {dynamicContent.loadingMessage}
              </div>
              
              {/* Animated dots */}
              <div className="vb-loading-dots">
                <span className="vb-dot"></span>
                <span className="vb-dot"></span>
                <span className="vb-dot"></span>
              </div>
            </div>
          )}
          
          {/* Report Ready State - show after timeout if still no data */}
          {showReportReady && !showAddressRetry && (
            <div className="vb-ready-container">
              <div className="vb-af1-hero-headline">
                {dynamicContent.readyHeadline}
              </div>
              <div className="vb-af1-hero-subheadline" dangerouslySetInnerHTML={{ __html: dynamicContent.readySubheadline }}>
              </div>
            </div>
          )}
          
          {/* Address Retry Button - show after contact form completion if no API data */}
          {showAddressRetry && (
            <div className="vb-retry-container">
              <div className="vb-af1-hero-headline">
                Having Trouble Finding Your Property Data?
              </div>
              <div className="vb-af1-hero-subheadline" style={{ marginBottom: '20px' }}>
                Let's try a different address format to get your accurate property information
              </div>
              <button 
                className="vb-retry-button"
                onClick={() => {
                  // Navigate to AddressRetry step
                  updateFormData({ formStep: 4 }); // Assuming AddressRetry is step 4
                }}
              >
                Try Different Address
              </button>
            </div>
          )}
          
          
          {/* Header - only show if API provided a valid value */}
          {!reportLoading && !showReportReady && !!(testFormData.apiEstimatedValue && testFormData.apiEstimatedValue > 0) && (
          <>
            <div className="vb-af1-hero-headline">
              {dynamicContent.reportHeadline}
            </div>
            <div className="vb-af1-hero-subheadline " style={{ marginBottom: '10px' }}>
              {cleanAddress(testFormData.street) || '123 Main St'}
            </div>
            
            {/* Property Values Summary - always show if we have Melissa data */}
            {false && testFormData.apiEstimatedValue && (
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '2px solid #09a5c8',
                borderRadius: '10px',
                padding: '20px',
                margin: '20px 0',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#09a5c8',
                  marginBottom: '15px'
                }}>
                  📊 Property Analysis Summary
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#333',
                      marginBottom: '5px'
                    }}>
                      {testFormData.formattedApiEstimatedValue || `$${testFormData.apiEstimatedValue?.toLocaleString()}`}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      fontWeight: '500'
                    }}>
                      Current Property Value
                    </div>
                  </div>
                  
                  {testFormData.potentialValueIncrease && (
                    <>
                      <div style={{
                        fontSize: '30px',
                        color: '#09a5c8'
                      }}>
                        →
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#28a745',
                          marginBottom: '5px'
                        }}>
                          {(() => {
                            const currentValue = testFormData.apiEstimatedValue || 0;
                            const increase = testFormData.potentialValueIncrease || 0;
                            const maxValue = currentValue + increase;
                            return new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(maxValue);
                          })()}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#666',
                          fontWeight: '500'
                        }}>
                          Maximum Property Value
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div style={{
                  marginTop: '15px',
                  fontSize: '14px',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  Based on Melissa API property data and market analysis
                </div>
              </div>
            )}

            {/* AI Report Section - Full report when unlocked, loading when not ready */}
            {unlocked && (
              <div style={{
                backgroundColor: '#f8faff',
                border: '2px solid #e6f3ff',
                borderRadius: '12px',
                padding: '20px',
                margin: '20px 0',
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#333'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#09a5c8',
                  marginBottom: '15px',
                  textAlign: 'center',
                  borderBottom: '1px solid #e6f3ff',
                  paddingBottom: '10px'
                }}>
                  🤖 Your Personalized {(campaign === 'cash' || campaign === 'sell') ? 'OfferBoost' : 'ValueBoost'} AI Report
                </div>
                
                {aiReport ? (
                  <div style={{
                    whiteSpace: 'pre-wrap',
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    {cleanAiReport(aiReport)}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      marginBottom: '10px'
                    }}>
                      🔄 AI report almost finished, just a moment...
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#888'
                    }}>
                      Our AI is putting the finishing touches on your personalized analysis
                    </div>
                    {/* Debug info for troubleshooting - remove in production */}
                    <div style={{
                      fontSize: '12px',
                      color: '#999',
                      marginTop: '10px',
                      fontFamily: 'monospace'
                    }}>
                      Debug: localStorage check = {localStorage.getItem('aiHomeReport') ? 'found' : 'missing'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
          )}

          {/* ========================================= */}
          {/* SPLIT TEST AREA - STEP 3 BOX VISIBILITY - HIDDEN FOR NOW */}
          {/* Position 3: A=Show Box, B=Hide Box       */}
          {/* ========================================= */}
          {/* COMMENTED OUT - ValueBoost Box Hidden */}
          {false && (() => {
            // Show value boost box for "1" variants (original layout), hide for "2" variants (streamlined layout)
            const showStep3Box = variant === 'A1O' || variant === 'A1I';
            
            
            // Check if returning from retry
            const isReturnFromRetry = formData.addressSelectionType === 'AddressRetry-Google' || 
                                     formData.leadStage === 'Address Retry - Selected' ||
                                     localStorage.getItem('valueboost_unlocked') === 'true';
            
            // Case A: Show ValueBoost box if API data available OR if returning from retry
            // Case B: Never show ValueBoost box
            const shouldShowBox = showStep3Box && (
              // Show if we have API data and not in loading state
              (!reportLoading && !!(testFormData.apiEstimatedValue && testFormData.apiEstimatedValue > 0)) ||
              // OR if returning from retry (regardless of API data)
              isReturnFromRetry
            );
            
            return false; // Hide ValueBoost box in all cases
          })() && (
          <div className="vb-value-boost-box">
            <h2 className="vb-box-headline">
              {dynamicContent.potentialHeadline}
            </h2>

            {/* Responsive container for values */}
            <div className="vb-value-container">
              {/* Current Value */}
              <div className="vb-value-item">
                <div className="vb-value-amount vb-current-value">
                  {testFormData.formattedApiEstimatedValue || '$554,000'}
                </div>
                <div className="vb-value-label">
                  Current Value
                </div>
              </div>

              {/* Arrow - responsive */}
              <div className="vb-value-arrow">
                <img 
                  src={gradientArrow}
                  alt="Value boost arrow"
                  className="vb-arrow-horizontal"
                />
                <img 
                  src={gradientArrow}
                  alt="Value boost arrow"
                  className="vb-arrow-vertical"
                />
              </div>

              {/* Value Boost Potential - separate from new total */}
              <div className="vb-value-item">
                <div className="vb-value-amount vb-boost-value">
                  {testFormData.formattedPotentialIncrease || '$121,880'}
                </div>
                <div className="vb-value-label">
                  Value Boost Potential
                </div>
              </div>
            </div>

            {/* New Total Value - shown below */}
            <div className="vb-new-total">
              <div className="vb-new-total-label">
                New Total Value
              </div>
              <div className="vb-new-total-amount">
                {
                  (() => {
                    try {
                      // Get numeric values only, not strings
                      let currentValue;
                      if (typeof testFormData.apiEstimatedValue === 'number') {
                        currentValue = testFormData.apiEstimatedValue;
                      } else {
                        // Parse from formatted value if needed
                        currentValue = parseInt((testFormData.formattedApiEstimatedValue || '').replace(/\D/g, ''));
                        // Fallback
                        if (isNaN(currentValue)) currentValue = 554000;
                      }

                      let increaseValue;
                      if (typeof testFormData.potentialValueIncrease === 'number') {
                        increaseValue = testFormData.potentialValueIncrease;
                      } else {
                        // Try to parse from formatted value
                        increaseValue = parseInt((testFormData.formattedPotentialIncrease || '').replace(/\D/g, ''));
                        // Fallback
                        if (isNaN(increaseValue)) increaseValue = 121880;
                      }

                      // Ensure both are numbers and calculate
                      const newValue = Number(currentValue) + Number(increaseValue);

                      return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(newValue);
                    } catch (e) {
                      console.error('Error calculating new value:', e);
                      return '$675,880';
                    }
                  })()
                }
              </div>
            </div>

            <p className="vb-opportunities-text">
              <strong>{recommendations.length || '11'} {dynamicContent.reportHeadline.includes('OfferBoost') ? 'OfferBoost' : 'ValueBoost'} opportunities found!</strong>
            </p>
            <p className="vb-percentage-text">
              Potential Home Value Increase: {testFormData.valueIncreasePercentage || '22'}%
            </p>

            {/* Responsive styles for different screen sizes */}
            <style jsx="true">{`
              @media (max-width: 360px) {
                .value-container {
                  flex-direction: column !important;
                  gap: 15px !important;
                }
                .value-boost-arrow .horizontal-arrow {
                  display: none !important;
                }
                .value-boost-arrow .vertical-arrow {
                  display: block !important;
                }
                .value-boost-arrow {
                  transform: scaleY(1.2) !important;
                }
              }
              @media (max-width: 700px) and (min-width: 361px) {
                .value-container {
                  gap: 5px !important;
                }
                .value-boost-arrow {
                  padding: 0 2px !important;
                }
                .value-boost-arrow img {
                  width: 30px !important;
                }
              }
              @media (max-width: 768px) {
                .value-boost-results-box {
                  margin: 0 10px 40px !important;
                  padding: 20px 15px !important;
                  max-width: calc(100vw - 20px) !important;
                }
              }
            `}</style>
          </div>
          )}
          {/* END COMMENTED OUT - ValueBoost Box Hidden */}
          {/* ========================================= */}
          {/* END SPLIT TEST AREA - STEP 3 BOX         */}
          {/* ========================================= */}

          {/* Down arrow to guide user to recommendations - COMMENTED OUT */}
          {/* 
          {!!(testFormData.apiEstimatedValue && testFormData.apiEstimatedValue > 0) && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '-40px 0 -30px 0',
              position: 'relative',
              zIndex: 10
            }}>
              <img 
                src={gradientArrow}
                alt="Continue to recommendations"
                style={{
                  width: '80px',
                  height: 'auto',
                  transform: 'rotate(90deg)',
                  filter: 'drop-shadow(0 2px 8px rgba(0, 184, 230, 0.3))'
                }}
              />
            </div>
          )}
          */}

          {/* TEMPLATE RECOMMENDATIONS SECTION HIDDEN - Show only AI report behind lock screen */}
          {false && ((testFormData.apiEstimatedValue && testFormData.apiEstimatedValue > 0) || showReportReady) && (
          <div id="recommendations-section" className={`vb-recommendations-section ${!(testFormData.apiEstimatedValue && testFormData.apiEstimatedValue > 0) ? 'no-border' : ''}`}>
            {/* Add section divider when unlocked to separate AI report from template */}
            {unlocked && (
              <div style={{
                backgroundColor: '#fafbfc',
                border: '1px solid #e8ecf0',
                borderRadius: '8px',
                padding: '15px',
                margin: '20px 0',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#09a5c8',
                  marginBottom: '5px'
                }}>
                  📋 Comprehensive Strategy Guide
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666'
                }}>
                  Complete template strategies and additional opportunities
                </div>
              </div>
            )}
            
            <h2 className="vb-recommendations-title">
              {dynamicContent.recommendationsTitle}
            </h2>
            <p className="vb-recommendations-subtitle">
              {dynamicContent.recommendationsSubtitle}
            </p>

            {/* Container for recommendations with relative positioning */}
            <div className="vb-recommendations-container">
              {/* Primary recommendations */}
              {primaryRecs.map((rec, index) => (
                <div key={index} className="vb-recommendation-item" style={{
                  filter: unlocked ? 'none' : 'blur(5px)'
                }}
                onMouseOver={(e) => unlocked && (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseOut={(e) => unlocked && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div className="vb-recommendation-content">
                    <h3 className="vb-recommendation-title">
                      <span className="vb-recommendation-number">
                        {index + 1}.
                      </span>
                      {rec.strategy}
                    </h3>
                    <p className="vb-recommendation-description">{rec.description}</p>
                    <div className="vb-recommendation-details">
                      <div className="vb-recommendation-cost">
                        <span className="vb-detail-label">Est. Cost:</span>
                        <span className="vb-detail-value">{rec.costEstimate}</span>
                      </div>
                      <div className="vb-recommendation-roi">
                        <span className="vb-detail-label">Est. ROI:</span>
                        <span className="vb-detail-value">{rec.roiEstimate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Secondary recommendations section (only shown when unlocked) */}
              {unlocked && secondaryRecs.length > 0 && (
                <>
                  <h3 style={{ 
                    textAlign: 'center', 
                    marginTop: '40px', 
                    marginBottom: '15px', 
                    fontSize: '20px',
                    background: 'linear-gradient(135deg, #00b8e6 0%, #236b6d 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 'bold'
                  }}>
                    Additional Value-Boosting Opportunities
                  </h3>

                  {secondaryRecs.map((rec, index) => (
                    <div key={index} style={{
                      marginBottom: '15px',
                      border: '1px solid rgba(0, 184, 230, 0.15)',
                      borderRadius: '10px',
                      padding: '16px',
                      boxShadow: '0 2px 8px rgba(0, 184, 230, 0.08)',
                      backgroundColor: 'rgba(0, 184, 230, 0.02)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <h3 style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '18px',
                          background: 'linear-gradient(135deg, #00b8e6 0%, #236b6d 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{
                            fontSize: '20px',
                            fontWeight: '900',
                            fontStyle: 'italic',
                            color: '#00a3d1',
                            marginRight: '10px',
                            lineHeight: '1'
                          }}>
                            {primaryRecs.length + index + 1}.
                          </span>
                          {rec.strategy}
                        </h3>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666', textAlign: 'center' }}>{rec.description}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '13px', justifyContent: 'center', gap: '15px' }}>
                          <div style={{ marginBottom: '5px' }}>
                            <span style={{ color: '#777', fontWeight: 'bold' }}>Est. Cost:</span>
                            <span style={{ marginLeft: '5px' }}>{rec.costEstimate}</span>
                          </div>
                          <div>
                            <span style={{ color: '#777', fontWeight: 'bold' }}>Est. ROI:</span>
                            <span style={{ marginLeft: '5px' }}>{rec.roiEstimate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Locked overlay - only shown when not unlocked AND (API data ready OR timeout expired) */}
              {!unlocked && ((testFormData.apiEstimatedValue && testFormData.apiEstimatedValue > 0) || showReportReady) && (
                <div className="vb-locked-overlay">
                  {/* Opaque background wrapper for the unlock section */}
                  <div className="vb-unlock-section-wrapper">
                    <div className="vb-unlock-header">
                      {(() => {
                        // Check if this is a B2 variant - if so, hide lock icon
                        const urlParams = new URLSearchParams(window.location.search);
                        const variant = urlParams.get('variant') || urlParams.get('split_test') || localStorage.getItem('assignedVariant') || 'B2OB2';
                        const step3Content = variant.substring(3, 5);  // A1, A2, or B2
                        const isB2Variant = step3Content === 'B2';
                        
                        // Only show lock icon if NOT B2 variant
                        if (!isB2Variant) {
                          return (
                            <div className="vb-lock-icon-container">
                              <div className="vb-lock-icon">
                                🔒
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <h3 className="vb-unlock-headline" dangerouslySetInnerHTML={{ __html: dynamicContent.unlockHeadline }}>
                      </h3>
                    </div>
                    <div className="vb-features-bubble">
                      <div className="vb-feature-item">
                        <div className="vb-feature-icon">✓</div>
                        <p className="vb-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark1 }}>
                        </p>
                      </div>
                      <div className="vb-feature-item">
                        <div className="vb-feature-icon">✓</div>
                        <p className="vb-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark2 }}>
                        </p>
                      </div>
                      <div className="vb-feature-item">
                        <div className="vb-feature-icon">✓</div>
                        <p className="vb-feature-text" dangerouslySetInnerHTML={{ 
                          __html: dynamicContent.checkmark3 + (() => {
                            // Check if this is a B2 variant using the same logic as getDynamicContent
                            const urlParams = new URLSearchParams(window.location.search);
                            const variant = urlParams.get('variant') || urlParams.get('split_test') || localStorage.getItem('assignedVariant') || 'B2OB2';
                            const step3Content = variant.substring(3, 5);  // A1, A2, or B2
                            
                            // If it's a B2 variant, don't show address
                            const isB2Variant = step3Content === 'B2';
                            
                            return isB2Variant ? '' : ` at ${formData.street}`;
                          })()
                        }}>
                        </p>
                      </div>
                    </div>

                    {/* Inline form fields */}
                    <div className="vb-unlock-form-container">
                      <div className="vb-optin-form-fields">
                        {/* Name field - starts empty, no autofill */}
                        <input
                          type="text"
                          name="name"
                          value={contactInfo.name}
                          onChange={handleInputChange}
                          placeholder="Name"
                          className={`vb-unlock-input ${formErrors.name ? 'vb-unlock-input-error' : ''}`}
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={contactInfo.phone}
                          onChange={handleInputChange}
                          placeholder="Phone (Get a text copy)"
                          className={`vb-unlock-input ${formErrors.phone ? 'vb-unlock-input-error' : ''}`}
                        />
                      </div>
                      {formErrors.phone && (
                        <div className="vb-unlock-form-error">
                          {formErrors.phone}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!validateForm()) {
                          return;
                        }
                        setIsSubmitting(true);
                        
                        // Clean the input values
                        console.log("Raw contact info before cleaning (overlay):", contactInfo);
                        let cleanName = contactInfo.name ? contactInfo.name.trim() : '';
                        const phoneValidation = validateAndCleanPhone(contactInfo.phone);
                        const cleanedPhone = phoneValidation.isValid ? phoneValidation.cleaned : contactInfo.phone;
                        console.log("Cleaned values (overlay):", { cleanName, cleanedPhone, phoneValid: phoneValidation.isValid });
                        
                        // If the name had the autofill tag, remove it when user confirms
                        if (cleanName.includes('(Autofilled by browser)')) {
                          cleanName = cleanName.replace(' (Autofilled by browser)', '');
                        }
                        
                        // Update formData first and wait for it to complete
                        console.log("🔥 UPDATING FORM DATA WITH FRESH CONTACT INFO");
                        updateFormData({
                          name: cleanName,
                          phone: cleanedPhone,
                          email: contactInfo.email || '',
                          nameWasAutofilled: false, // Clear the autofill flag - COPIED FROM MAIN FORM
                          leadStage: 'ValueBoost Report Qualified'
                        });
                        
                        // Wait a moment for updateFormData to complete
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        try {
                          console.log("🔥🔥🔥 FIREBASE SECTION STARTING - OVERLAY PATH");
                          
                          // Update contact info in CRM first
                          const leadId = localStorage.getItem('leadId');
                          const existingLeadId = leadId;
                          
                          console.log("🔍 LEAD ID CHECK:", { leadId, existingLeadId });
                          
                          if (existingLeadId) {
                            console.log("🔥 DIRECT CONTACT UPDATE FOR LEADID:", existingLeadId);
                            console.log("🔥 Updating contact info with:", { cleanName, cleanedPhone, email: contactInfo.email || '' });
                            
                            try {
                              // Use a custom update that preserves autofilled data
                              const leadRef = doc(db, 'leads', existingLeadId);
                              
                              // Split name into first/last
                              let firstName = '';
                              let lastName = '';
                              if (cleanName) {
                                const nameParts = cleanName.split(' ');
                                if (nameParts.length >= 2) {
                                  firstName = nameParts[0];
                                  lastName = nameParts.slice(1).join(' ');
                                } else {
                                  lastName = cleanName;
                                }
                              }
                              
                              // Update only the manually entered contact fields, preserve autofilled data
                              const contactUpdateData = {
                                name: cleanName || '',
                                phone: cleanedPhone || '',
                                email: contactInfo.email || '',
                                firstName: firstName,
                                lastName: lastName || 'Contact',
                                nameWasAutofilled: false,
                                leadStage: 'Contact Info Provided',
                                updatedAt: serverTimestamp()
                                // Deliberately NOT updating autoFilledName and autoFilledPhone
                              };
                              
                              await updateDoc(leadRef, contactUpdateData);
                              console.log("✅ Manual contact update SUCCESS (preserved autofilled data)");
                            } catch (contactError) {
                              console.error("❌ updateContactInfo FAILED:", contactError);
                            }
                          } else {
                            console.log("❌ No existing lead ID found for contact update");
                          }
                          
                          // Skip updateLead() call to prevent overwriting contact info
                          console.log("🔥 SKIPPING updateLead to prevent overwriting contact info");
                          console.log("✅ Contact update completed - no additional updateLead needed");
                          
                          // ================================================================================
                          // ADD MISSING TRACKING AND NOTIFICATIONS - SAME AS handleSubmit
                          // ================================================================================
                          
                          // Send notifications (non-blocking background execution) - MATCHING MAIN FORM PATTERN
                          setTimeout(() => {
                            console.log('🔍🔍🔍 VALUEBOOST OVERLAY NOTIFICATION TRACKING: Starting background notification section');
                            
                            const leadData = {
                              name: cleanName,
                              phone: cleanedPhone,
                              address: testFormData.street,
                              email: contactInfo.email || '',
                              leadSource: 'ValueBoost Funnel',
                              campaign_name: formData.campaign_name || 'ValueBoost',
                              utm_source: formData.utm_source || '',
                              utm_medium: formData.utm_medium || '',
                              utm_campaign: formData.utm_campaign || '',
                              id: formData.leadId || localStorage.getItem('leadId') || ''
                            };

                            console.log('🔍🔍🔍 VALUEBOOST OVERLAY NOTIFICATION TRACKING: Lead data ready for notifications', {
                              name: leadData.name,
                              phone: leadData.phone,
                              address: leadData.address,
                              leadId: leadData.id
                            });
                            
                            // Note: Notifications are now handled automatically by the centralized notification system
                            // in FormContext via the useNotifications hook
                          }, 0);
                          
                          setIsSubmitting(false);
                          setSubmitted(true);
                          setUnlocked(true);
                          
                          // Force reload AI report when unlocking (overlay)
                          setTimeout(() => {
                            const storedReport = localStorage.getItem('aiHomeReport');
                            if (storedReport && !aiReport) {
                              console.log('🔄 Force-loading AI report after overlay unlock');
                              setAiReport(storedReport);
                            }
                          }, 100);
                          
                          // ================================================================================
                          // COMPREHENSIVE TRACKING - MATCHING MAIN FORM FUNNEL (FROM handleSubmit)
                          // ================================================================================
                          
                          // 1. PHONE LEAD TRACKING - EXACT MATCH TO MAIN FORM
                          console.log('🔥 About to call trackPhoneNumberLead() from ValueBoost OVERLAY');
                          trackPhoneNumberLead();
                          console.log('🔥 trackPhoneNumberLead() call completed from ValueBoost OVERLAY');
                          
                          // 2. FORM STEP COMPLETION TRACKING
                          trackFormStepComplete(3, 'ValueBoost Report Unlocked', formData);
                          
                          // 3. FORM SUBMISSION TRACKING
                          trackFormSubmission({
                            ...formData,
                            funnelType: 'valueboost',
                            conversionType: 'report_unlocked'
                          });
                          
                          // 4. FACEBOOK PIXEL TRACKING
                          trackPropertyValue({
                            address: testFormData.street,
                            currentValue: testFormData.apiEstimatedValue,
                            potentialIncrease: testFormData.potentialValueIncrease || 0,
                            name: cleanName,
                            phone: cleanedPhone,
                            email: contactInfo.email || '',
                            funnel: 'valueboost',
                            campaign_name: formData.campaign_name || '',
                            utm_source: formData.utm_source || '',
                            utm_medium: formData.utm_medium || '',
                            utm_campaign: formData.utm_campaign || ''
                          });
                          
                          // Check if we have valid API data after unlocking
                          if (!(testFormData.apiEstimatedValue && testFormData.apiEstimatedValue > 0)) {
                            // No valid API data - navigate to AddressRetry (step 4)
                            console.log('No valid API data found - navigating to AddressRetry');
                            updateFormData({ formStep: 4 }); // Go to step 4
                            return;
                          }
                          
                          if (window.gtag) {
                            window.gtag('event', 'conversion', {
                              'send_to': 'AW-123456789/AbC-D_efG-h12345',
                              'event_category': 'lead',
                              'event_label': 'ValueBoost Report Unlocked',
                              'value': formData.apiEstimatedValue ? formData.apiEstimatedValue / 100 : 1,
                              'currency': 'USD'
                            });
                          }
                        } catch (error) {
                          console.error('Error submitting lead:', error);
                          setIsSubmitting(false);
                          setFormErrors({ submit: 'Failed to submit your information. Please try again.' });
                        }
                      }}
                      disabled={isSubmitting}
                      className="vb-unlock-button vb-button-flare"
                    >
                      {isSubmitting ? 'Unlocking...' : dynamicContent.buttonText}
                    </button>

                    <div className="vb-unlock-security-text">
                      Your information is secure and we'll never share it with third parties.
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
          )}

          {/* NEW AI REPORT SECTION - Show when API data is ready OR timeout expired */}
          {((testFormData.apiEstimatedValue && testFormData.apiEstimatedValue > 0) || showReportReady) && (
          <div id="ai-report-section" className="vb-recommendations-section">
            
            {/* AI Report Content */}
            <div className="vb-recommendations-container">
              
              {/* Show timeout message - either processing timeout OR 7-second AI report timeout after unlock */}
              {(processingTimeout && unlocked) || (aiReportTimeout && unlocked) ? (
                <div className="vb-timeout-container">
                  <div className="vb-timeout-icon">
                    📱
                  </div>
                  <div className="vb-timeout-headline">
                    {dynamicContent.timeoutHeadline || 'Watch your messages, we\'ll be sending a text with your cash offer shortly!'}
                  </div>
                  <div className="vb-timeout-message">
                    AI report generated! You'll receive a text at the number you provided with the full report. We look forward to helping you however we can!
                  </div>
                </div>
              ) : (
                <>
                  {/* ALWAYS show content behind the overlay - either loading message or AI report */}
                  <div 
                    className="ai-report-container"
                    style={{
                      textAlign: 'center',
                      padding: '20px 20px 60px',
                      backgroundColor: 'rgb(240, 249, 255)',
                      borderRadius: '12px',
                      border: '1px solid rgb(9, 165, 200)',
                      filter: unlocked ? 'none' : 'blur(3px)'
                    }}
                  >
                    {!aiReport ? (
                      <>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#333',
                          marginBottom: '15px'
                        }}>
                          Maximum home value: {testFormData.formattedApiEstimatedValue ? testFormData.formattedApiEstimatedValue : (
                            <span style={{ color: '#666', fontWeight: 'normal' }}>
                              Processing
                              <span style={{
                                animation: 'dots 1.5s infinite',
                                display: 'inline-block',
                                width: '20px',
                                textAlign: 'left'
                              }}>
                                ...
                              </span>
                            </span>
                          )}
                        </div>
                        
                        {/* Modern loader animation */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          margin: '30px 0'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #e9ecef',
                            borderTop: '4px solid #09a5c8',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                        </div>
                        
                        <div style={{
                          fontSize: '18px',
                          color: '#666',
                          marginBottom: '10px'
                        }}>
                          🤖 AI {dynamicContent.reportHeadline.includes('OfferBoost') ? 'OfferBoost' : 'ValueBoost'} report generating, just a moment...
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#999'
                        }}>
                          Analyzing your property and market data to create your personalized report
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#09a5c8',
                          marginBottom: '20px',
                          paddingBottom: '10px'
                        }}>
                          🤖 Your Personalized {(campaign === 'cash' || campaign === 'sell') ? 'OfferBoost' : 'ValueBoost'} AI Report
                        </div>
                        
                        <div style={{
                          whiteSpace: 'pre-wrap',
                          fontSize: '16px',
                          lineHeight: '1.6',
                          textAlign: 'left',
                          backgroundColor: '#fff',
                          padding: '20px',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef'
                        }}>
                          {cleanAiReport(aiReport)}
                        </div>
                      </>
                    )}
                    
                    {/* Debug information - only show when NOT in timeout state */}
                    {(isLocalhost || ENABLE_DUMMY_DATA) && !processingTimeout && (
                      <div style={{
                        fontSize: '12px',
                        color: '#999',
                        marginTop: '10px',
                        fontFamily: 'monospace',
                        textAlign: 'left',
                        backgroundColor: '#f9f9f9',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #eee'
                      }}>
                        <div>Debug Info:</div>
                        <div>• localStorage aiHomeReport = {localStorage.getItem('aiHomeReport') ? 'found' : 'missing'}</div>
                        <div>• aiReport state = {aiReport ? 'loaded' : 'null'}</div>
                        <div>• unlocked = {unlocked ? 'true' : 'false'}</div>
                        <div>• showReportReady = {showReportReady ? 'true' : 'false'}</div>
                        <div>• apiEstimatedValue = {testFormData.apiEstimatedValue || 'null'}</div>
                        <div>• processingTimeout = {processingTimeout ? 'true' : 'false'}</div>
                        <div>• Section condition = {((testFormData.apiEstimatedValue && testFormData.apiEstimatedValue > 0) || showReportReady) ? 'true' : 'false'}</div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Locked overlay for AI report - ALWAYS shown when not unlocked */}
              {!unlocked && (
                <div className="vb-locked-overlay">
                  {/* Opaque background wrapper for the unlock section */}
                  <div className="vb-unlock-section-wrapper">
                    <div className="vb-unlock-header">
                      {(() => {
                        // Check if this is a B2 variant - if so, hide lock icon
                        const urlParams = new URLSearchParams(window.location.search);
                        const variant = urlParams.get('variant') || urlParams.get('split_test') || localStorage.getItem('assignedVariant') || 'B2OB2';
                        const step3Content = variant.substring(3, 5);  // A1, A2, or B2
                        const isB2Variant = step3Content === 'B2';
                        
                        // Only show lock icon if NOT B2 variant
                        if (!isB2Variant) {
                          return (
                            <div className="vb-lock-icon-container">
                              <div className="vb-lock-icon">
                                🔒
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <h3 className="vb-unlock-headline" dangerouslySetInnerHTML={{ 
                        __html: processingTimeout 
                          ? dynamicContent.timeoutUnlockHeadline
                          : dynamicContent.unlockHeadline 
                      }}>
                      </h3>
                    </div>
                    <div className="vb-features-bubble">
                      <div className="vb-feature-item">
                        <div className="vb-feature-icon">✓</div>
                        <p className="vb-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark1 }}>
                        </p>
                      </div>
                      <div className="vb-feature-item">
                        <div className="vb-feature-icon">✓</div>
                        <p className="vb-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark2 }}>
                        </p>
                      </div>
                      <div className="vb-feature-item">
                        <div className="vb-feature-icon">✓</div>
                        <p className="vb-feature-text" dangerouslySetInnerHTML={{ __html: dynamicContent.checkmark3 }}>
                        </p>
                      </div>
                    </div>

                    <p className="vb-unlock-subtext">
                      {dynamicContent.unlockSubtext}
                    </p>

                    {/* Inline form fields */}
                    <div className="vb-unlock-form-container">
                      <div className="vb-optin-form-fields">
                        {/* Name field - starts empty, no autofill */}
                        <input
                          type="text"
                          name="name"
                          value={contactInfo.name}
                          onChange={handleInputChange}
                          placeholder="Name"
                          className={`vb-unlock-input ${formErrors.name ? 'vb-unlock-input-error' : ''}`}
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={contactInfo.phone}
                          onChange={handleInputChange}
                          placeholder="Phone (Get a text copy)"
                          className={`vb-unlock-input ${formErrors.phone ? 'vb-unlock-input-error' : ''}`}
                        />
                      </div>
                      {formErrors.phone && (
                        <div className="vb-unlock-form-error">
                          {formErrors.phone}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!validateForm()) {
                          return;
                        }
                        setIsSubmitting(true);
                        
                        // Clean the input values
                        console.log("Raw contact info before cleaning (overlay):", contactInfo);
                        let cleanName = contactInfo.name ? contactInfo.name.trim() : '';
                        const phoneValidation = validateAndCleanPhone(contactInfo.phone);
                        const cleanedPhone = phoneValidation.isValid ? phoneValidation.cleaned : contactInfo.phone;
                        console.log("Cleaned values (overlay):", { cleanName, cleanedPhone, phoneValid: phoneValidation.isValid });
                        
                        // If the name had the autofill tag, remove it when user confirms
                        if (cleanName.includes('(Autofilled by browser)')) {
                          cleanName = cleanName.replace(' (Autofilled by browser)', '');
                        }
                        
                        // Update formData first and wait for it to complete
                        console.log("🔥 UPDATING FORM DATA WITH FRESH CONTACT INFO FROM OVERLAY");
                        updateFormData({
                          name: cleanName,
                          phone: cleanedPhone,
                          email: contactInfo.email,
                          nameWasAutofilled: false,
                          leadStage: 'ValueBoost Report Qualified'
                        });
                        
                        // Wait a moment for updateFormData to complete
                        await new Promise(resolve => setTimeout(resolve, 100));

                        // BULLETPROOF CONTACT SUBMISSION - NEVER BLOCKS USER
                        
                        // ALWAYS unlock report immediately for user experience
                        setSubmitted(true);
                        setUnlocked(true);
                        setIsSubmitting(false);
                        console.log("🔓 Report unlocked immediately for user");
                        
                        // Background contact submission with aggressive retry
                        const submitContactInBackground = async () => {
                          const maxRetries = 10; // More aggressive retry
                          let attempt = 0;
                          
                          const contactData = {
                            name: cleanName || '',
                            phone: cleanedPhone || '',
                            email: contactInfo.email || '',
                            firstName: cleanName ? cleanName.split(' ')[0] : '',
                            lastName: cleanName ? (cleanName.split(' ').length >= 2 ? cleanName.split(' ').slice(1).join(' ') : cleanName) : 'Contact',
                            nameWasAutofilled: false,
                            leadStage: 'ValueBoost Report Qualified',
                            updatedAt: serverTimestamp()
                          };
                          
                          const trySubmission = async () => {
                            try {
                              const leadId = localStorage.getItem('leadId');
                              if (!leadId) {
                                console.error('❌ No leadId found for contact submission');
                                return false;
                              }
                              
                              const leadRef = doc(db, 'leads', leadId);
                              await updateDoc(leadRef, contactData);
                              
                              console.log(`✅ Contact submission SUCCESS on attempt ${attempt + 1}`);
                              
                              // Clear any pending retry
                              localStorage.removeItem('pendingContactSubmission');
                              return true;
                              
                            } catch (error) {
                              console.error(`❌ Contact submission failed (attempt ${attempt + 1}):`, error);
                              
                              // Store for retry
                              localStorage.setItem('pendingContactSubmission', JSON.stringify({
                                ...contactData,
                                leadId: localStorage.getItem('leadId'),
                                timestamp: Date.now(),
                                attempts: attempt + 1
                              }));
                              
                              return false;
                            }
                          };
                          
                          // Try submission with exponential backoff
                          while (attempt < maxRetries) {
                            const success = await trySubmission();
                            if (success) break;
                            
                            attempt++;
                            const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 second delay
                            console.log(`🔄 Retrying contact submission in ${delay}ms (attempt ${attempt}/${maxRetries})`);
                            
                            await new Promise(resolve => setTimeout(resolve, delay));
                          }
                          
                          if (attempt >= maxRetries) {
                            console.error('💥 Contact submission failed after all retries - stored locally');
                          }
                        };
                        
                        // Start background submission (non-blocking)
                        submitContactInBackground();
                        
                        // Also trigger notifications in background
                        setTimeout(() => {
                          console.log('🔔 Triggering notifications for contact submission');
                        }, 0);
                      }}
                      disabled={isSubmitting}
                      className="vb-unlock-button vb-button-flare"
                    >
                      {isSubmitting ? 'Unlocking...' : dynamicContent.buttonText}
                    </button>

                    <div className="vb-unlock-security-text">
                      Your information is secure and we'll never share it with third parties.
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
          )}
          
          {/* CTA section - only shown when not already showing contact form and not already submitted */}
          {!showContactForm && !submitted ? (
            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '10px',
              padding: '25px',
              textAlign: 'center',
              marginBottom: '30px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              display: unlocked ? 'block' : 'none' // Only show when recommendations are unlocked
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', color: '#16899d' }}>
                Want These Upgrades Done At No Upfront Cost?
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '16px' }}>
                Our concierge service can implement these improvements to maximize your home's value,
                with no payment until your home sells.
              </p>
              <button
                className="vb-button-flare"
                style={{
                  backgroundColor: '#236b6d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '12px 25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  zIndex: 2
                }}
                onClick={(e) => {
                  e.preventDefault();
                  // Scroll to AI report section since form is now inline
                  document.getElementById('ai-report-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#236869'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#236b6d'}
              >
                Check If I Qualify
              </button>
            </div>
          ) : null}


          {/* OLD MODAL CONTACT FORM REMOVED - Now using inline form in overlay */}
          {false && showContactForm && !submitted ? (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '20px'
            }}>
            <div id="contact-form-section" style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '10px',
              padding: '30px',
              boxShadow: '0 4px 25px rgba(0,0,0,0.15)',
              maxWidth: '500px',
              width: '100%',
              position: 'relative',
              animation: 'modalFadeIn 0.3s ease-out'
            }}>
              <button
                onClick={() => setShowContactForm(false)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '5px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#16899d', textAlign: 'center' }}>
                Create Your Free Account
              </h3>
              <p style={{ margin: '0 0 25px 0', fontSize: '16px', textAlign: 'center', color: '#555' }}>
                {dynamicContent.unlockSubtext}
              </p>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={contactInfo.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your name"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      border: formErrors.name ? '1px solid #ff4d4f' : '1px solid #ccc',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                  {formErrors.name && (
                    <div style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '5px' }}>{formErrors.name}</div>
                  )}
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={contactInfo.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Phone (We'll text you a copy, no spam ever)"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      border: formErrors.phone ? '1px solid #ff4d4f' : '1px solid #ccc',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                  {formErrors.phone && (
                    <div style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '5px' }}>{formErrors.phone}</div>
                  )}
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleInputChange}
                    required
                    placeholder="you@example.com"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      border: formErrors.email ? '1px solid #ff4d4f' : '1px solid #ccc',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                  {formErrors.email && (
                    <div style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '5px' }}>{formErrors.email}</div>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {formErrors.submit && (
                    <div style={{ color: '#ff4d4f', fontSize: '14px', marginBottom: '10px', textAlign: 'left' }}>{formErrors.submit}</div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: isSubmitting ? '#95d8c0' : '#236b6d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '15px 30px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: isSubmitting ? 'default' : 'pointer',
                      transition: 'background-color 0.3s ease',
                      width: '100%',
                      boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)'
                    }}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Get My Full Report'}
                  </button>
                </div>
                <div className="vb-disclaimer-text vb-modal-disclaimer">
                  {dynamicContent.disclaimer}
                </div>
              </form>

              <style jsx="true">{`
                @keyframes modalFadeIn {
                  from { opacity: 0; transform: translateY(-20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </div>
            </div>
          ) : null}
          
          {/* Additional information - only show when API data is ready OR timeout expired */}
          {((testFormData.apiEstimatedValue && testFormData.apiEstimatedValue > 0) || showReportReady) && (
          <div className="vb-report-disclaimer">
            <p>
              This report is based on current market conditions and property data, but actual results may vary.
              Recommendations are personalized based on your specific property attributes and location.
            </p>
          </div>
          )}
        </div>
      </div>

      {/* CSS Animations for loading states */}
      <style jsx="true">{`
        .ai-report-container {
          text-align: center;
          padding: 20px 20px 60px;
          background-color: rgb(240, 249, 255);
          border-radius: 12px;
          border: 1px solid rgb(9, 165, 200);
        }
        
        .vb-feature-text {
          font-weight: normal;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes dots {
          0%, 20% { 
            opacity: 0;
          }
          40% { 
            opacity: 1;
          }
          60% { 
            opacity: 0;
          }
          80%, 100% { 
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default ValueBoostReport;