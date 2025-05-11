import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import additionalStrategies from './additionalStrategies';
import { calculatePropertySpecificCost, calculatePropertySpecificROI } from './costCalculator';

function ValueBoostReport() {
  const { formData, updateFormData, updateLead } = useFormContext();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [unlocked, setUnlocked] = useState(false); // Track if recommendations are unlocked
  const [formErrors, setFormErrors] = useState({});
  
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
  const recommendations = formData.recommendations || generateRecommendations();
  
  // Store recommendations in form data if not already there
  if (!formData.recommendations) {
    updateFormData({
      recommendations: recommendations
    });
  }
  
  // Calculate property-specific value increase based on property attributes
  const calculatePotentialValueIncrease = () => {
    // Use stored value if available
    if (formData.potentialValueIncrease) {
      return formData.potentialValueIncrease;
    }

    // Get current property value
    const currentValue = formData.apiEstimatedValue || 300000;

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
  const potentialIncrease = formData.potentialValueIncrease || calculatePotentialValueIncrease();
  
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
  
  // Validate contact form fields
  const validateForm = () => {
    const errors = {};

    if (!contactInfo.name || contactInfo.name.trim() === '') {
      errors.name = 'Name is required';
    }

    if (!contactInfo.phone || contactInfo.phone.trim() === '') {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$|^\(\d{3}\)\s?\d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}$/.test(contactInfo.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!contactInfo.email || contactInfo.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle contact form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Update form data with contact info
    updateFormData({
      name: contactInfo.name,
      phone: contactInfo.phone,
      email: contactInfo.email,
      leadStage: 'ValueBoost Report Qualified'
    });

    try {
      // Send lead data to Zoho
      await updateLead();

      // After successful submission
      setIsSubmitting(false);
      setSubmitted(true);
      setUnlocked(true); // Unlock the recommendations

      // Track conversion if gtag is available
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-123456789/AbC-D_efG-h12345', // Replace with actual conversion ID
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
          {/* Header */}
          <div className="vb-headline">
            Value Scan Complete For:
          </div>
          <div className="vb-subheadline" style={{ marginBottom: '10px' }}>
            {formData.street || '123 Main St'}
          </div>

          {/* Property size details */}
          <div style={{ fontSize: '16px', color: '#555', marginBottom: '25px', textAlign: 'center' }}>
            {formData.bedrooms && formData.bathrooms ? (
              <p style={{ margin: '5px 0' }}>
                {formData.bedrooms} beds, {formData.bathrooms} baths, {formData.finishedSquareFootage?.toLocaleString() || '1,500'} sq ft
              </p>
            ) : (
              <p style={{ margin: '5px 0' }}>Single Family Home</p>
            )}
          </div>

          {/* Combined Value Boost Summary Box */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            padding: '25px',
            backgroundColor: '#e8f4ff',
            borderRadius: '10px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            <h2 style={{ fontSize: '26px', marginBottom: '15px', color: '#0066cc' }}>
              Your Total Value Boost Potential
            </h2>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#28a745',
              marginBottom: '20px'
            }}>
              {formData.formattedApiEstimatedValue || '$500,000'} (current Value)
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#0066cc',
              marginBottom: '25px'
            }}>
              {
                (() => {
                  try {
                    // Get numeric values only, not strings
                    let currentValue;
                    if (typeof formData.apiEstimatedValue === 'number') {
                      currentValue = formData.apiEstimatedValue;
                    } else {
                      // Parse from formatted value if needed
                      currentValue = parseInt((formData.formattedApiEstimatedValue || '').replace(/\D/g, ''));
                      // Fallback
                      if (isNaN(currentValue)) currentValue = 500000;
                    }

                    let increaseValue;
                    if (typeof formData.potentialValueIncrease === 'number') {
                      increaseValue = formData.potentialValueIncrease;
                    } else {
                      // Try to parse from formatted value
                      increaseValue = parseInt((formData.formattedPotentialIncrease || '').replace(/\D/g, ''));
                      // Fallback
                      if (isNaN(increaseValue)) increaseValue = 150000;
                    }

                    // Ensure both are numbers and calculate
                    const newValue = Number(currentValue) + Number(increaseValue);

                    console.log('Value calculation:', {
                      currentValue,
                      increaseValue,
                      newValue
                    });

                    return new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(newValue);
                  } catch (e) {
                    console.error('Error calculating new value:', e);
                    return '$650,000';
                  }
                })()
              } (+ Value Boost Potential: {formData.formattedPotentialIncrease || '$150,000'})
            </div>
            <p style={{ fontSize: '18px', color: '#444', marginBottom: '25px' }}>
              <strong>{recommendations.length}</strong> value-boosting improvements identified by AI
            </p>
          </div>

          {/* Display recommendations */}
          <div id="recommendations-section" style={{ marginBottom: '30px', position: 'relative' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '5px', fontSize: '22px' }}>
              Top 10 Value-Boosting Recommendations
            </h2>
            <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '16px', color: '#666' }}>
              Highest-impact improvements ranked by ROI for your property
            </p>

            {/* Container for recommendations with relative positioning */}
            <div style={{ position: 'relative' }}>
              {/* Primary recommendations */}
              {primaryRecs.map((rec, index) => (
                <div key={index} style={{
                  marginBottom: '20px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  filter: unlocked ? 'none' : 'blur(5px)'
                }}
                onMouseOver={(e) => unlocked && (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseOut={(e) => unlocked && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{
                      flex: '0 0 40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#007bff',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: '1' }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#007bff' }}>{rec.strategy}</h3>
                      <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#555' }}>{rec.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        <div style={{ marginRight: '20px', marginBottom: '5px' }}>
                          <span style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>Est. Cost:</span>
                          <span style={{ fontSize: '14px', marginLeft: '5px' }}>{rec.costEstimate}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>Est. ROI:</span>
                          <span style={{ fontSize: '14px', marginLeft: '5px' }}>{rec.roiEstimate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Secondary recommendations section (only shown when unlocked) */}
              {unlocked && secondaryRecs.length > 0 && (
                <>
                  <h3 style={{ textAlign: 'center', marginTop: '40px', marginBottom: '15px', fontSize: '20px', color: '#666' }}>
                    Additional Value-Boosting Opportunities
                  </h3>

                  {secondaryRecs.map((rec, index) => (
                    <div key={index} style={{
                      marginBottom: '15px',
                      border: '1px solid #e8e8e8',
                      borderRadius: '8px',
                      padding: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{
                          flex: '0 0 30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '15px',
                          fontWeight: 'bold',
                          fontSize: '14px'
                        }}>
                          {primaryRecs.length + index + 1}
                        </div>
                        <div style={{ flex: '1' }}>
                          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#6c757d' }}>{rec.strategy}</h3>
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>{rec.description}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '13px' }}>
                            <div style={{ marginRight: '20px', marginBottom: '5px' }}>
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
                    </div>
                  ))}
                </>
              )}

              {/* Locked overlay - only shown when not unlocked */}
              {!unlocked && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backdropFilter: 'blur(7px)',
                  borderRadius: '10px',
                  zIndex: 10,
                  padding: '30px',
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    backgroundColor: '#e8f4ff',
                    marginBottom: '20px',
                    boxShadow: '0 5px 15px rgba(0, 102, 204, 0.2)'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      color: '#0066cc',
                      animation: 'pulseLock 2s infinite alternate'
                    }}>
                      🔒
                    </div>
                  </div>
                  <h3 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '20px',
                    color: '#0066cc'
                  }}>
                    Unlock Your Full Value Boost Report
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '10px',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    borderRadius: '8px',
                    padding: '10px 15px',
                    maxWidth: '500px',
                    width: '100%'
                  }}>
                    <div style={{ fontSize: '22px', marginRight: '15px' }}>✓</div>
                    <p style={{ margin: 0, fontSize: '16px', textAlign: 'left' }}>
                      <strong>All {recommendations.length} value-boosting recommendations</strong> for your property
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '10px',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    borderRadius: '8px',
                    padding: '10px 15px',
                    maxWidth: '500px',
                    width: '100%'
                  }}>
                    <div style={{ fontSize: '22px', marginRight: '15px' }}>✓</div>
                    <p style={{ margin: 0, fontSize: '16px', textAlign: 'left' }}>
                      <strong>Detailed ROI calculations</strong> for each improvement
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '25px',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    borderRadius: '8px',
                    padding: '10px 15px',
                    maxWidth: '500px',
                    width: '100%'
                  }}>
                    <div style={{ fontSize: '22px', marginRight: '15px' }}>✓</div>
                    <p style={{ margin: 0, fontSize: '16px', textAlign: 'left' }}>
                      <strong>Customized for your property</strong> at {formData.street}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowContactForm(true);
                    }}
                    style={{
                      backgroundColor: '#0066cc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '15px 30px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)',
                      transition: 'all 0.2s ease',
                      maxWidth: '500px',
                      width: '100%',
                      marginBottom: '15px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0052a3'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
                  >
                    Create Free Account to Unlock
                  </button>

                  <div style={{ fontSize: '14px', color: '#666', textAlign: 'center', maxWidth: '400px' }}>
                    Your information is secure and we'll never share it with third parties.
                  </div>

                  {/* Add animation style */}
                  <style jsx="true">{`
                    @keyframes pulseLock {
                      0% { transform: scale(1); }
                      100% { transform: scale(1.1); }
                    }
                  `}</style>
                </div>
              )}
            </div>
          </div>
          
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
              <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', color: '#0066cc' }}>
                Want These Upgrades Done At No Upfront Cost?
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '16px' }}>
                Our concierge service can implement these improvements to maximize your home's value,
                with no payment until your home sells.
              </p>
              <button
                style={{
                  backgroundColor: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '12px 25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  setShowContactForm(true);
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0052a3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
              >
                Check If I Qualify
              </button>
            </div>
          ) : null}

          {/* Success message after form submission */}
          {submitted ? (
            <div style={{
              backgroundColor: '#f0fff0',
              borderRadius: '10px',
              padding: '30px',
              textAlign: 'center',
              marginBottom: '30px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              border: '1px solid #c8e6c9'
            }}>
              <div style={{
                fontSize: '50px',
                marginBottom: '15px',
                animation: 'successCheck 0.5s ease-in-out'
              }}>✅</div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '24px', color: '#2e7d32' }}>
                Thank You, {contactInfo.name.split(' ')[0]}!
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                maxWidth: '500px',
                margin: '0 auto 20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  padding: '12px',
                  backgroundColor: 'rgba(46, 125, 50, 0.08)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '22px', marginRight: '15px', color: '#2e7d32' }}>🔓</div>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
                      Full Report Unlocked
                    </p>
                    <p style={{ margin: '0', fontSize: '15px', color: '#555' }}>
                      All {recommendations.length} value-boosting recommendations are now available below
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  padding: '12px',
                  backgroundColor: 'rgba(46, 125, 50, 0.08)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '22px', marginRight: '15px', color: '#2e7d32' }}>📧</div>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
                      Email Sent
                    </p>
                    <p style={{ margin: '0', fontSize: '15px', color: '#555' }}>
                      A copy of your report has been sent to {contactInfo.email}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  padding: '12px',
                  backgroundColor: 'rgba(46, 125, 50, 0.08)',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '22px', marginRight: '15px', color: '#2e7d32' }}>📱</div>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
                      Expert Consultation
                    </p>
                    <p style={{ margin: '0', fontSize: '15px', color: '#555' }}>
                      A home value specialist will contact you within 24 hours to discuss your options
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.scrollTo({ top: document.getElementById('recommendations-section').offsetTop - 50, behavior: 'smooth' })}
                style={{
                  backgroundColor: '#2e7d32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(46, 125, 50, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1b5e20'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2e7d32'}
              >
                View My Recommendations Now
              </button>

              {/* Add animation */}
              <style jsx="true">{`
                @keyframes successCheck {
                  0% { transform: scale(0.5); opacity: 0; }
                  60% { transform: scale(1.2); }
                  100% { transform: scale(1); opacity: 1; }
                }
              `}</style>
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
              <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#0066cc', textAlign: 'center' }}>
                Create Your Free Account
              </h3>
              <p style={{ margin: '0 0 25px 0', fontSize: '16px', textAlign: 'center', color: '#555' }}>
                Unlock your full property value report with all {recommendations.length} personalized recommendations
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
                    placeholder="(555) 123-4567"
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
                      backgroundColor: isSubmitting ? '#7fb8ff' : '#0066cc',
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
                <div style={{ marginTop: '15px', fontSize: '13px', color: '#777', textAlign: 'center' }}>
                  By signing up, you agree to our terms of service and privacy policy.
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
          
          {/* Additional information */}
          <div style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '20px' }}>
            <p>
              This report is based on current market conditions and property data, but actual results may vary.
              Recommendations are personalized based on your specific property attributes and location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValueBoostReport;