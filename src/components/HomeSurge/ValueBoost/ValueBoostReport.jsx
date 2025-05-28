import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import additionalStrategies from './additionalStrategies';
import { calculatePropertySpecificCost, calculatePropertySpecificROI } from './costCalculator';
import { sendValueBoostNotifications } from '../../../services/notifications';
import { trackPropertyValue } from '../../../services/facebook';
import { trackPhoneNumberLead, trackFormStepComplete, trackFormSubmission } from '../../../services/analytics';
import gradientArrow from '../../../assets/images/gradient-arrow.png';

function ValueBoostReport() {
  const { formData, updateFormData, updateLead, nextStep } = useFormContext();
  
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
    // Read campaign name directly from URL
    const urlParams = new URLSearchParams(window.location.search);
    const possibleParamNames = ['campaign_name', 'campaignname', 'campaign-name', 'utm_campaign'];
    
    let campaignName = '';
    for (const paramName of possibleParamNames) {
      const value = urlParams.get(paramName);
      if (value) {
        campaignName = value;
        break;
      }
    }
    
    // UNIVERSAL REPORT TEMPLATES - Both Value and Cash campaigns
    const templates = {
      // ========== CASH/SELLING CAMPAIGNS ==========
      cash: {
        reportHeadline: 'Your OfferBoost Cash Offer Analysis is Ready!:',
        potentialHeadline: 'Your OfferBoost Potential:',
        recommendationsTitle: 'Your Top 10 OfferBoost Strategies',
        recommendationsSubtitle: 'Maximize your cash offer with these proven strategies',
        unlockHeadline: 'Get Your FREE OfferBoost Cash Offer Report',
        unlockSubtext: 'Get your complete cash offer analysis with all selling strategies',
        conciergeHeadline: 'Want Expert Help Maximizing Your Cash Offer?',
        buttonText: 'GET CASH OFFER'
      },
      
      fast: {
        reportHeadline: 'Your OfferBoost Strategy Ready:',
        potentialHeadline: 'Your OfferBoost Potential:',
        recommendationsTitle: 'Your Top 10 OfferBoost Accelerators',
        recommendationsSubtitle: 'Speed up your sale with these time-tested strategies',
        unlockHeadline: 'Get Your FREE OfferBoost Cash Offer Report',
        unlockSubtext: 'Get your complete fast sale strategy with timeline optimization',
        conciergeHeadline: 'Want Expert Help Selling Lightning Fast?',
        buttonText: 'CHECK FAST OFFER'
      },
      
      sellfast: {
        reportHeadline: 'Your OfferBoost Fast Offer Analysis is Ready!',
        potentialHeadline: 'Your OfferBoost Potential:',
        recommendationsTitle: 'Your Top 10 OfferBoost Tactics',
        recommendationsSubtitle: 'Get cash fast with these immediate action strategies',
        unlockHeadline: 'Get Your FREE OfferBoost Cash Offer Report',
        unlockSubtext: 'Get your complete instant sale guide with cash offer optimization',
        conciergeHeadline: 'Want Expert Help Getting Cash Now?',
        buttonText: 'GET CASH OFFER'
      },
      
      // ========== VALUE/IMPROVEMENT CAMPAIGNS ==========
      value: {
        reportHeadline: 'ValueBoost Report Ready:',
        potentialHeadline: 'Your ValueBoost Potential:',
        recommendationsTitle: 'Your Top 10 ValueBoost Recommendations',
        recommendationsSubtitle: 'Here are the Highest impact AI generated opportunities for your home',
        unlockHeadline: 'Get Your FREE ValueBoost Report',
        unlockSubtext: 'Unlock your full property value report with all personalized recommendations',
        conciergeHeadline: 'Want Expert Help Implementing These Improvements?',
        buttonText: 'GET VALUE REPORT'
      },
      
      valueboost: {
        reportHeadline: 'Your Value Maximization Report Ready:',
        potentialHeadline: 'Your Maximum Value Potential:',
        recommendationsTitle: 'Your Top 10 Value Maximizers',
        recommendationsSubtitle: 'AI-powered strategies to unlock your property\'s hidden value',
        unlockHeadline: 'Get Your FREE Value Maximization Report',
        unlockSubtext: 'Get your complete value enhancement plan with ROI projections',
        conciergeHeadline: 'Want Expert Help Maximizing Your Property Value?',
        buttonText: 'GET VALUE REPORT'
      },
      
      boost: {
        reportHeadline: 'Your Value Boost Analysis Ready:',
        potentialHeadline: 'Your Property Boost Potential:',
        recommendationsTitle: 'Your Top 10 Value Boosters',
        recommendationsSubtitle: 'Proven improvements that deliver maximum value increase',
        unlockHeadline: 'Get Your FREE Value Boost Report',
        unlockSubtext: 'Get your complete value boost strategy with investment priorities',
        conciergeHeadline: 'Want Expert Help Boosting Your Home Value?',
        buttonText: 'GET VALUE REPORT'
      },
      
      equity: {
        reportHeadline: 'Your Equity Analysis Ready:',
        potentialHeadline: 'Your Hidden Equity Potential:',
        recommendationsTitle: 'Your Top 10 Equity Unlocking Strategies',
        recommendationsSubtitle: 'Strategic improvements to maximize your home equity',
        unlockHeadline: 'Get Your FREE Equity Maximizer Report',
        unlockSubtext: 'Get your complete equity enhancement plan with growth projections',
        conciergeHeadline: 'Want Expert Help Unlocking Your Home Equity?',
        buttonText: 'GET VALUE REPORT'
      },
      
      // ========== DEFAULT FALLBACK ==========
      default: {
        reportHeadline: 'ValueBoost Report Ready:',
        potentialHeadline: 'Your ValueBoost Potential:',
        recommendationsTitle: 'Your Top 10 ValueBoost Recommendations',
        recommendationsSubtitle: 'Here are the Highest impact AI generated opportunities for your home',
        unlockHeadline: 'Get Your FREE ValueBoost Report',
        unlockSubtext: 'Unlock your full property value report with all personalized recommendations',
        conciergeHeadline: 'Want Expert Help Implementing These Improvements?',
        buttonText: 'GET VALUE REPORT'
      }
    };
    
    // Campaign matching logic (consistent with AddressForm and AIProcessing)
    if (campaignName) {
      const simplified = campaignName.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      // CASH/SELLING CAMPAIGN MATCHING (Highest priority)
      if (simplified.includes('cash')) return templates.cash;
      if (simplified.includes('sellfast') || simplified.includes('sell_fast')) return templates.sellfast;
      if (simplified.includes('fast')) return templates.fast;
      
      // VALUE/IMPROVEMENT CAMPAIGN MATCHING
      if (simplified.includes('valueboost') || simplified.includes('value_boost')) return templates.valueboost;
      if (simplified.includes('value')) return templates.value;
      if (simplified.includes('boost')) return templates.boost;
      if (simplified.includes('equity')) return templates.equity;
    }

    return templates.default;
  };
  
  const dynamicContent = getDynamicContent();
  
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
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '', // Always empty - name field is commented out
    phone: '', // Always start empty - no autofill
    email: formData.email || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [unlocked, setUnlocked] = useState(false); // Track if recommendations are unlocked
  const [formErrors, setFormErrors] = useState({});
  const [reportLoading, setReportLoading] = useState(true);
  const [showReportReady, setShowReportReady] = useState(false);
  const [showAddressRetry, setShowAddressRetry] = useState(false);
  const [contactFormCompleted, setContactFormCompleted] = useState(false);

  // Update contact info when data becomes available - NO PHONE AUTOFILL
  useEffect(() => {
    setContactInfo(prevState => ({
      ...prevState,
      name: '', // Always keep empty - name field is commented out
      phone: prevState.phone, // Keep user-entered value, no autofill
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
      localStorage.setItem('valueboost_unlocked', 'true');
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
    if (!isReturnFromRetry) {
      const earlyDataCheck = setInterval(() => {
        if (formData.apiEstimatedValue && formData.apiEstimatedValue > 0) {
          // API data is ready - show report immediately, skip loading delay
          console.log('✅ API data received early - showing report immediately');
          clearTimeout(loadingTimeoutId); // Cancel the 2.5 second delay
          setReportLoading(false);
          setShowReportReady(true);
          clearInterval(earlyDataCheck);
        }
      }, 500); // Check every 500ms
      
      // Clean up interval after 5 seconds
      setTimeout(() => clearInterval(earlyDataCheck), 5000);
    }
    
    return () => {
      if (loadingTimeoutId) clearTimeout(loadingTimeoutId);
    };
  }, [formData.apiEstimatedValue, formData.addressSelectionType, formData.leadStage]);
  
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
  
  // Handle contact form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: value
    });
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

    // Clean the input values - MODIFIED: name always empty for Firebase rules compliance
    let cleanName = ''; // Always send empty string for name to satisfy Firebase rules
    const phoneValidation = validateAndCleanPhone(contactInfo.phone);
    const cleanedPhone = phoneValidation.isValid ? phoneValidation.cleaned : contactInfo.phone;

    // Name field is no longer used - commented out autofill logic
    // if (cleanName.includes('(Autofilled by browser)')) {
    //   cleanName = cleanName.replace(' (Autofilled by browser)', '');
    // }

    // Update form data with contact info
    updateFormData({
      name: cleanName,
      phone: cleanedPhone,
      email: contactInfo.email,
      nameWasAutofilled: false, // Clear the autofill flag - COPIED FROM MAIN FORM
      leadStage: 'ValueBoost Report Qualified'
    });

    try {
      // Send lead data to Zoho
      await updateLead();

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
        
        // Send notifications using centralized service (non-blocking background execution)
        (async () => {
          try {
            console.log('🔔 Sending ValueBoost lead notifications...');
            const notificationResults = await sendValueBoostNotifications(leadData);
            
            if (notificationResults.summary.totalNotificationsSent > 0) {
              console.log('✅ ValueBoost notifications sent successfully');
            } else {
              console.warn('⚠️ Some ValueBoost notifications may have failed');
            }
          } catch (error) {
            console.error('❌ Error sending ValueBoost notifications:', error);
            // Don't block the form submission if notifications fail
          }
        })();
      }, 0);

      // After successful submission
      setIsSubmitting(false);
      setSubmitted(true);
      setUnlocked(true); // Unlock the recommendations
      setContactFormCompleted(true); // Mark contact form as completed
      localStorage.setItem('valueboost_unlocked', 'true'); // Persist unlocked state
      
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
                {(() => {
                  // Dynamic loading headline based on campaign type
                  const urlParams = new URLSearchParams(window.location.search);
                  const possibleParamNames = ['campaign_name', 'campaignname', 'campaign-name', 'utm_campaign'];
                  
                  let campaignName = '';
                  for (const paramName of possibleParamNames) {
                    const value = urlParams.get(paramName);
                    if (value) {
                      campaignName = value;
                      break;
                    }
                  }
                  
                  if (campaignName) {
                    const simplified = campaignName.toLowerCase().replace(/[\s\-_\.]/g, '');
                    
                    // CASH/SELLING CAMPAIGN LOADING MESSAGES
                    if (simplified.includes('cash') || simplified.includes('sellfast') || simplified.includes('sell_fast') || simplified.includes('fast')) {
                      return 'Processing Your OfferBoost Cash Offer Analysis...';
                    }
                  }
                  
                  // Default to ValueBoost for value/improvement campaigns
                  return 'Generating Your ValueBoost Report...';
                })()}
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
                {(() => {
                  // Dynamic ready headline based on campaign type
                  const urlParams = new URLSearchParams(window.location.search);
                  const possibleParamNames = ['campaign_name', 'campaignname', 'campaign-name', 'utm_campaign'];
                  
                  let campaignName = '';
                  for (const paramName of possibleParamNames) {
                    const value = urlParams.get(paramName);
                    if (value) {
                      campaignName = value;
                      break;
                    }
                  }
                  
                  if (campaignName) {
                    const simplified = campaignName.toLowerCase().replace(/[\s\-_\.]/g, '');
                    
                    // CASH/SELLING CAMPAIGN READY MESSAGES
                    if (simplified.includes('cash') || simplified.includes('sellfast') || simplified.includes('sell_fast') || simplified.includes('fast')) {
                      return 'Your OfferBoost Cash Offer Analysis is Ready!';
                    }
                  }
                  
                  // Default to ValueBoost for value/improvement campaigns
                  return 'Your ValueBoost Report is Ready!';
                })()}
              </div>
              <div className="vb-af1-hero-subheadline">
               Check your OfferBoost cash offer below, and unlock your FREE AI powered custom home value and offer optimization report. No obligation, no strings attached..
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
          </>
          )}

          {/* ========================================= */}
          {/* SPLIT TEST AREA - STEP 3 BOX VISIBILITY  */}
          {/* Position 3: A=Show Box, B=Hide Box       */}
          {/* ========================================= */}
          {(() => {
            // Check split test parameters from URL
            const urlParams = new URLSearchParams(window.location.search);
            const splitTest = urlParams.get('split_test') || urlParams.get('variant') || 'AAA'; // Default to show everything
            const showStep3Box = splitTest[2] === 'A'; // Position 3 controls Step 3 box
            
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
            
            return shouldShowBox;
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

          {/* Display recommendations - only show when API data is ready OR timeout expired */}
          {((testFormData.apiEstimatedValue && testFormData.apiEstimatedValue > 0) || showReportReady) && (
          <div id="recommendations-section" className={`vb-recommendations-section ${!(testFormData.apiEstimatedValue && testFormData.apiEstimatedValue > 0) ? 'no-border' : ''}`}>
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
                      <div className="vb-lock-icon-container">
                        <div className="vb-lock-icon">
                          🔒
                        </div>
                      </div>
                      <h3 className="vb-unlock-headline">
                        {dynamicContent.unlockHeadline}
                      </h3>
                    </div>
                    <div className="vb-features-bubble">
                      <div className="vb-feature-item">
                        <div className="vb-feature-icon">✓</div>
                        <p className="vb-feature-text">
                          <strong>All {dynamicContent.reportHeadline.includes('OfferBoost') ? 'OfferBoost cash offer' : 'ValueBoost'} opportunities</strong> for your property
                        </p>
                      </div>
                      <div className="vb-feature-item">
                        <div className="vb-feature-icon">✓</div>
                        <p className="vb-feature-text">
                          <strong>Detailed maximum {dynamicContent.reportHeadline.includes('OfferBoost') ? 'OfferBoost' : 'ValueBoost'} calculations</strong> for maximizing home value
                        </p>
                      </div>
                      <div className="vb-feature-item">
                        <div className="vb-feature-icon">✓</div>
                        <p className="vb-feature-text">
                          <strong>Customized for your property</strong> at {formData.street}
                        </p>
                      </div>
                    </div>

                    {/* Inline form fields */}
                    <div className="vb-unlock-form-container">
                      <div className="vb-optin-form-fields">
                        {/* Name field commented out - only phone required */}
                        {/* <input
                          type="text"
                          name="name"
                          value={contactInfo.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
                          className={`vb-unlock-input ${formErrors.name ? 'vb-unlock-input-error' : ''}`}
                        /> */}
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
                        
                        // Clean the input values - MODIFIED: name always empty for Firebase rules compliance
                        let cleanName = ''; // Always send empty string for name to satisfy Firebase rules
                        const phoneValidation = validateAndCleanPhone(contactInfo.phone);
                        const cleanedPhone = phoneValidation.isValid ? phoneValidation.cleaned : contactInfo.phone;
                        
                        // Name field is no longer used - commented out autofill logic
                        // if (cleanName.includes('(Autofilled by browser)')) {
                        //   cleanName = cleanName.replace(' (Autofilled by browser)', '');
                        // }
                        
                        updateFormData({
                          name: cleanName,
                          phone: cleanedPhone,
                          email: contactInfo.email || '',
                          nameWasAutofilled: false, // Clear the autofill flag - COPIED FROM MAIN FORM
                          leadStage: 'ValueBoost Report Qualified'
                        });
                        try {
                          await updateLead();
                          
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
                            
                            // Send notifications using centralized service (non-blocking background execution)
                            (async () => {
                              try {
                                console.log('🔔 Sending ValueBoost lead notifications from OVERLAY...');
                                const notificationResults = await sendValueBoostNotifications(leadData);
                                
                                if (notificationResults.summary.totalNotificationsSent > 0) {
                                  console.log('✅ ValueBoost overlay notifications sent successfully');
                                } else {
                                  console.warn('⚠️ Some ValueBoost overlay notifications may have failed');
                                }
                              } catch (error) {
                                console.error('❌ Error sending ValueBoost overlay notifications:', error);
                                // Don't block the form submission if notifications fail
                              }
                            })();
                          }, 0);
                          
                          setIsSubmitting(false);
                          setSubmitted(true);
                          setUnlocked(true);
                          
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
              <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', color: '#236b6d' }}>
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
                  setShowContactForm(true);
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#236869'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#236b6d'}
              >
                Check If I Qualify
              </button>
            </div>
          ) : null}


          {/* Contact form - shown as a modal when user clicks to unlock */}
          {showContactForm && !submitted ? (
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
              <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#236b6d', textAlign: 'center' }}>
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
                <div className="vb-disclaimer-text" style={{ marginTop: '15px', fontSize: '13px', color: '#999', textAlign: 'center', lineHeight: '1.4', maxWidth: '400px', margin: '15px auto 0', padding: '0 20px' }}>
                  *Example values only. Your offer amount will depend on your specific home details and other factors. By submitting your information, you consent to receive calls, texts, and emails from HomeSurge.AI, even if you are on a Do Not Call list. <strong>We respect your privacy and will never share your details with anyone. No spam ever.</strong>
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
          <div style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '20px' }}>
            <p>
              This report is based on current market conditions and property data, but actual results may vary.
              Recommendations are personalized based on your specific property attributes and location.
            </p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ValueBoostReport;