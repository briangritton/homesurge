import React, { useState } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import additionalStrategies from './additionalStrategies';
import { calculatePropertySpecificCost, calculatePropertySpecificROI } from './costCalculator';

function ValueBoostReport() {
  const { formData, updateFormData } = useFormContext();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
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

    // Take top strategies based on the upgrades needed count
    const count = formData.upgradesNeeded || 5;
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
  
  // Handle contact form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Update form data with contact info
    updateFormData({
      name: contactInfo.name,
      phone: contactInfo.phone,
      email: contactInfo.email,
      leadStage: 'ValueBoost Report Qualified'
    });
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };
  
  return (
    <div className="hero-section" style={{ minHeight: '100vh', padding: '20px 0' }}>
      <div className="hero-middle-container" style={{ maxWidth: '900px' }}>
        <div className="hero-content fade-in">
          {/* Header */}
          <div className="hero-headline" style={{ textAlign: 'center', marginBottom: '10px' }}>
            Your AI-Powered Home Value Boost Plan
          </div>
          
          {/* Property info summary */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '30px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ flex: '1 1 300px', minWidth: '300px', marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Property Details</h3>
              <p style={{ margin: '5px 0', fontSize: '15px' }}><strong>Address:</strong> {formData.street || '123 Main St'}</p>
              {formData.bedrooms && formData.bathrooms && (
                <p style={{ margin: '5px 0', fontSize: '15px' }}>
                  <strong>Size:</strong> {formData.bedrooms} beds, {formData.bathrooms} baths, {formData.finishedSquareFootage?.toLocaleString() || '1,500'} sq ft
                </p>
              )}
              <p style={{ margin: '5px 0', fontSize: '15px' }}>
                <strong>Current Value:</strong> {formData.formattedApiEstimatedValue || formatCurrency(formData.apiEstimatedValue) || '$325,000'}
              </p>
            </div>
            
            <div style={{ flex: '1 1 300px', minWidth: '300px', backgroundColor: '#e8f4ff', padding: '15px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#0066cc' }}>Value Boost Potential</h3>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ flex: '0 0 auto', fontSize: '28px', marginRight: '10px' }}>📈</div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '22px', color: '#0066cc' }}>
                    {formData.formattedPotentialIncrease || formatCurrency(potentialIncrease)}
                  </p>
                  <p style={{ margin: '0', fontSize: '14px' }}>Potential increase with recommended improvements</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: '0 0 auto', fontSize: '22px', marginRight: '10px' }}>✨</div>
                <div>
                  <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', fontSize: '16px' }}>
                    {formData.valueIncreasePercentage || '18'}% Value Boost
                  </p>
                  <p style={{ margin: '0', fontSize: '14px' }}>
                    {recommendations.length} customized recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Display recommendations */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '22px' }}>
              Your Customized Value-Boosting Recommendations
            </h2>
            
            {recommendations.map((rec, index) => (
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
                flexDirection: 'column'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
          </div>
          
          {/* CTA section */}
          {!showContactForm && !submitted ? (
            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '10px',
              padding: '25px',
              textAlign: 'center',
              marginBottom: '30px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
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
                onClick={() => setShowContactForm(true)}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0052a3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
              >
                Check If I Qualify
              </button>
            </div>
          ) : submitted ? (
            <div style={{
              backgroundColor: '#f0fff0',
              borderRadius: '10px',
              padding: '25px',
              textAlign: 'center',
              marginBottom: '30px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '50px', marginBottom: '15px' }}>✅</div>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', color: '#2e7d32' }}>
                Thank You for Your Interest!
              </h3>
              <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                A home value specialist will contact you shortly to discuss your value boost options.
              </p>
              <p style={{ margin: '0', fontSize: '16px' }}>
                We've also emailed a copy of this report to {contactInfo.email}
              </p>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '10px',
              padding: '25px',
              marginBottom: '30px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#0066cc', textAlign: 'center' }}>
                Check If You Qualify for Our Concierge Service
              </h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '15px', fontWeight: 'bold' }}>
                    Name
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={contactInfo.name} 
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '5px',
                      border: '1px solid #ccc'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '15px', fontWeight: 'bold' }}>
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={contactInfo.phone} 
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '5px',
                      border: '1px solid #ccc'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '15px', fontWeight: 'bold' }}>
                    Email
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={contactInfo.email} 
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '5px',
                      border: '1px solid #ccc'
                    }}
                  />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: isSubmitting ? '#7fb8ff' : '#0066cc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '12px 30px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: isSubmitting ? 'default' : 'pointer',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Check Qualification'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
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