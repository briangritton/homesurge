import OpenAI from 'openai';

// Lazy initialization - only create client when needed
let openai = null;

function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured - using fallback template');
    }
    
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  }
  
  return openai;
}

/**
 * Generate a comprehensive AI property report using complete property data
 * Report type varies by campaign: value, cash, fsbo, sell, or buy
 * @param {Object} melissaData - Complete Melissa API property data
 * @param {string} campaignType - Campaign type: 'value', 'cash', 'fsbo', 'sell', or 'buy'
 */
export async function generateAIValueBoostReport(melissaData, campaignType = 'value') {
  try {
    console.log('🤖 Starting comprehensive OpenAI ValueBoost report generation...');
    
    if (!melissaData || !melissaData.propertyRecord) {
      throw new Error('No property data provided for AI analysis');
    }

    const record = melissaData.propertyRecord;
    const address = record.PropertyAddress?.Address + ', ' + record.PropertyAddress?.City + ', ' + record.PropertyAddress?.State;
    
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(melissaData.apiEstimatedValue || 0);

    // Extract top 20 most relevant property details for AI analysis
    const propertyAge = new Date().getFullYear() - parseInt(record.PropertyUseInfo?.YearBuilt || 1980);
    const hasBasement = parseInt(record.PropertySize?.BasementArea || 0) > 0;
    const basementFinished = parseInt(record.PropertySize?.BasementAreaFinished || 0) > 0;
    const hasFireplace = record.IntAmenities?.Fireplace === 'Yes';
    const hasPorch = record.ExtAmenities?.PorchCode === 'Porch';
    const porchSize = parseInt(record.ExtAmenities?.PorchArea || 0);
    const lotSize = parseFloat(record.PropertySize?.AreaLotAcres || 0);

    // =================================================================
    // CAMPAIGN-SPECIFIC PROMPTS AND ANALYSIS
    // =================================================================
    
    const prompt = getCampaignSpecificPrompt(campaignType, record, melissaData, address, formattedValue, propertyAge, hasBasement, basementFinished, hasFireplace, hasPorch, porchSize, lotSize);

    const openaiClient = getOpenAIClient();
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4", // Use GPT-4 for better quality recommendations
      messages: [
        {
          role: "system",
          content: "You are an expert real estate improvement analyst specializing in maximizing property values through strategic renovations. You provide detailed, actionable recommendations with realistic cost estimates and ROI projections."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7, // Some creativity but still professional
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    const aiReport = completion.choices[0]?.message?.content;
    
    if (!aiReport) {
      throw new Error('No response received from OpenAI');
    }

    console.log('✅ OpenAI ValueBoost report generated successfully');
    return aiReport;

  } catch (error) {
    console.error('❌ Error generating OpenAI ValueBoost report:', error);
    
    // Return fallback template if OpenAI fails
    return generateFallbackReport(melissaData);
  }
}

/**
 * Fallback template report in case OpenAI fails
 * Uses property-specific data when available
 */
function generateFallbackReport(melissaData) {
  console.log('🔄 Using fallback template report with property data');
  
  if (!melissaData || !melissaData.propertyRecord) {
    return generateBasicFallbackReport();
  }

  const record = melissaData.propertyRecord;
  const address = record.PropertyAddress?.Address + ', ' + record.PropertyAddress?.City + ', ' + record.PropertyAddress?.State;
  const propertyAge = new Date().getFullYear() - parseInt(record.PropertyUseInfo?.YearBuilt || 1980);
  const hasBasement = parseInt(record.PropertySize?.BasementArea || 0) > 0;
  const basementFinished = parseInt(record.PropertySize?.BasementAreaFinished || 0) > 0;

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(melissaData.apiEstimatedValue || 0);

  return `ValueBoost AI Analysis Report

Welcome to your personalized property analysis for your ${propertyAge}-year-old ${record.ExtStructInfo?.StructureStyle || 'home'} at ${address}. Based on comprehensive analysis of your ${record.IntRoomInfo?.BedroomsCount || ''}-bedroom, ${record.IntRoomInfo?.BathCount || ''}-bathroom property worth ${formattedValue}, we've identified strategic improvement opportunities tailored to your home's specific characteristics.

Property Analysis: ${address}
Current Estimated Value: ${formattedValue}
Year Built: ${record.PropertyUseInfo?.YearBuilt || 'Unknown'} (${propertyAge} years old)
Property Type: ${record.ExtStructInfo?.StructureStyle || 'Residential'} with ${record.ExtStructInfo?.Exterior1Code || 'Standard'} exterior

TOP IMPROVEMENT OPPORTUNITIES:

1. Kitchen Modernization ($${propertyAge > 20 ? '18,000-30,000' : '12,000-22,000'})
   - Age-appropriate cabinet updates for ${propertyAge}-year-old home
   - Countertop upgrade to match property value tier
   - Energy-efficient appliance package
   Expected ROI: ${propertyAge > 30 ? '85-90%' : '75-80%'}

2. ${record.ExtStructInfo?.Exterior1Code === 'Brick' ? 'Brick Maintenance & Enhancement' : 'Exterior Upgrade'} ($${record.ExtStructInfo?.Exterior1Code === 'Brick' ? '3,000-8,000' : '8,000-15,000'})
   - ${record.ExtStructInfo?.Exterior1Code || 'Exterior'} specific maintenance and improvements
   - ${record.ExtStructInfo?.StructureStyle || 'Architectural'} style enhancements
   Expected ROI: 70-75%

3. HVAC System ${propertyAge > 25 ? 'Replacement' : 'Optimization'} ($${propertyAge > 25 ? '8,000-15,000' : '3,000-8,000'})
   - ${record.Utilities?.HVACHeatingDetail || 'Current'} system ${propertyAge > 25 ? 'replacement' : 'efficiency improvements'}
   - ${record.Utilities?.HVACHeatingFuel || 'Energy'} efficiency upgrades
   Expected ROI: ${propertyAge > 25 ? '65-70%' : '50-60%'}

${hasBasement && !basementFinished ? `4. Basement Finishing Opportunity ($15,000-35,000)
   - Transform ${record.PropertySize?.BasementArea || 'basement'} sq ft of unfinished space
   - Additional living/recreation area
   - Significant square footage value addition
   Expected ROI: 60-75%

` : ''}4. Bathroom ${propertyAge > 30 ? 'Renovation' : 'Updates'} ($${propertyAge > 30 ? '12,000-20,000' : '6,000-12,000'})
   - Age-appropriate fixture and finish updates
   - ${record.IntRoomInfo?.BathPartialCount > 0 ? 'Consider powder room enhancement' : 'Modern functionality improvements'}
   Expected ROI: 70-80%

5. Energy Efficiency Package ($4,000-12,000)
   - ${propertyAge}-year-old home specific efficiency improvements
   - Insulation and weatherization upgrades
   - Smart home technology integration
   Expected ROI: 50-65%

This analysis considers your property's ${propertyAge}-year age, ${record.ExtStructInfo?.StructureStyle || 'architectural'} style, and ${record.PropertyAddress?.City}, ${record.PropertyAddress?.State} market conditions.`;
}

/**
 * Basic fallback when no property data is available
 */
function generateBasicFallbackReport() {
  return `ValueBoost AI Analysis Report

We're preparing your personalized property analysis. While we gather comprehensive data about your home, here are general improvement opportunities that typically provide strong returns on investment:

TOP IMPROVEMENT OPPORTUNITIES:

1. Kitchen Modernization ($15,000-25,000)
   Expected ROI: 80-85%

2. Bathroom Renovation ($8,000-15,000)
   Expected ROI: 70-75%

3. Exterior Improvements ($5,000-12,000)
   Expected ROI: 65-70%

4. HVAC Optimization ($4,000-10,000)
   Expected ROI: 50-60%

Please provide your property details for a more specific analysis.`;
}

// =================================================================
// CAMPAIGN-SPECIFIC PROMPT GENERATOR
// =================================================================

/**
 * Generate campaign-specific prompts for different report types
 */
function getCampaignSpecificPrompt(campaignType, record, melissaData, address, formattedValue, propertyAge, hasBasement, basementFinished, hasFireplace, hasPorch, porchSize, lotSize) {
  
  // Common property details section used by all campaigns
  const propertyDetails = `
PROPERTY DETAILS:
- Address: ${address}
- Current Estimated Value: ${formattedValue}
- Year Built: ${record.PropertyUseInfo?.YearBuilt || 'Unknown'} (${propertyAge} years old)
- Square Footage: ${record.PropertySize?.AreaBuilding || 'Unknown'} sq ft
- Bedrooms: ${record.IntRoomInfo?.BedroomsCount || 'Unknown'}
- Bathrooms: ${record.IntRoomInfo?.BathCount || 'Unknown'} full, ${record.IntRoomInfo?.BathPartialCount || 0} partial
- Stories: ${record.IntRoomInfo?.StoriesCount || 'Unknown'}
- Construction: ${record.IntStructInfo?.Construction || 'Unknown'}
- Exterior Material: ${record.ExtStructInfo?.Exterior1Code || 'Unknown'}
- Roof Material: ${record.ExtStructInfo?.RoofMaterial || 'Unknown'}
- Architectural Style: ${record.ExtStructInfo?.StructureStyle || 'Unknown'}
- Heating System: ${record.Utilities?.HVACHeatingDetail || 'Unknown'} (${record.Utilities?.HVACHeatingFuel || 'Unknown'})
- Garage: ${record.PropertySize?.ParkingGarage || 'Unknown'} (${record.Parking?.ParkingSpaceCount || 0} spaces)
- Basement: ${hasBasement ? `Yes, ${record.PropertySize?.BasementArea} sq ft` : 'No'} ${basementFinished ? '(Finished)' : hasBasement ? '(Unfinished)' : ''}
- Fireplace: ${hasFireplace ? 'Yes' : 'No'}
- Porch: ${hasPorch ? `Yes, ${porchSize} sq ft` : 'No'}
- Lot Size: ${lotSize} acres (${record.PropertySize?.AreaLotSF || 'Unknown'} sq ft)
- Topography: ${record.YardGardenInfo?.TopographyCode || 'Unknown'}
- Market Value: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(record.Tax?.MarketValueTotal || 0)} (Tax Assessment)
- Confidence Score: ${record.EstimatedValue?.ConfidenceScore || 'Unknown'}%
- Equity Position: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(melissaData.apiEquity || 0)}
- Last Sale: ${record.SaleInfo?.DeedLastSaleDate ? new Date(record.SaleInfo.DeedLastSaleDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).getFullYear() : 'Unknown'} for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(record.SaleInfo?.DeedLastSalePrice || 0)}`;

  switch (campaignType.toLowerCase()) {
    
    // =================================================================
    // 1. VALUE CAMPAIGN - PROPERTY IMPROVEMENT RECOMMENDATIONS
    // =================================================================
    case 'value':
      return `You are a professional real estate improvement analyst creating a comprehensive ValueBoost report. Analyze this property data and provide specific, actionable improvement recommendations with realistic costs and ROI calculations.

${propertyDetails}

ANALYSIS REQUIREMENTS:
1. Consider the property's age (${propertyAge} years) when recommending improvements
2. Factor in the ${record.ExtStructInfo?.Exterior1Code || 'unknown'} exterior and ${record.ExtStructInfo?.StructureStyle || 'unknown'} style
3. Address the ${record.Utilities?.HVACHeatingDetail || 'unknown'} heating system efficiency
4. ${hasBasement && !basementFinished ? 'Evaluate basement finishing potential' : ''}
5. Consider lot size (${lotSize} acres) for outdoor improvements
6. Provide specific cost estimates based on the ${formattedValue} home value tier
7. Calculate realistic ROI percentages for each recommendation
8. IMPORTANT: Calculate the total potential value increase by adding up all recommendation values

REQUIRED OUTPUT FORMAT:
ValueBoost AI Analysis Report

[PERSONALIZED INTRODUCTION: 
If architectural style and exterior details are available, use: "Let's cover your ValueBoost potential for your ${propertyAge}-year-old ${record.ExtStructInfo?.StructureStyle || 'home'} at ${address} with ${record.ExtStructInfo?.Exterior1Code || 'standard'} exterior, currently valued at ${formattedValue}."

If architectural style OR exterior details are missing/unknown/not classified, use this simplified version instead: "Let's cover your ValueBoost potential improvements for ${address}!"

Do NOT use phrases like "As you already know" or mention "not explicitly classified" or "not classified" - keep it positive and straightforward.]

Property Analysis: ${address}
Current Estimated Value: ${formattedValue}

TOP IMPROVEMENT OPPORTUNITIES:
[Generate 5-7 specific improvement recommendations with costs, ROI, and timelines]

TOTAL IMPROVEMENT VALUE CALCULATION:
[Add up all the recommended improvement costs and calculate the total potential value increase. Format as: "Total Investment Required: $XX,XXX" and "Total Potential Value Increase: $XX,XXX"]

MARKET STRATEGY SUMMARY:
[Brief paragraph about maximizing value for this property type and location]`;

    // =================================================================
    // 2. CASH CAMPAIGN - MAXIMUM CASH OFFER NEGOTIATION GUIDE
    // =================================================================
    case 'cash':
      return `You are a real estate negotiation expert creating a Maximum Cash Offer Guide. Help this homeowner leverage their property's strengths to negotiate the highest possible cash offer from investors and cash buyers.

${propertyDetails}

CASH OFFER NEGOTIATION STRATEGY:
Focus on what makes this property attractive to cash buyers and investors:

1. PROPERTY LEVERAGE POINTS:
- High equity position (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(melissaData.apiEquity || 0)}) provides strong negotiating position
- ${propertyAge}-year-old property ${propertyAge > 30 ? 'offers value-add renovation opportunities investors seek' : 'is in prime condition for rental or flip potential'}
- ${lotSize} acre lot ${lotSize > 0.25 ? 'provides expansion opportunities and higher investor appeal' : 'offers standard development potential'}
- ${record.PropertyAddress?.City}, ${record.PropertyAddress?.State} market trends and investor demand

2. CASH BUYER PSYCHOLOGY:
- What investors look for in ${record.ExtStructInfo?.StructureStyle || 'this property type'}
- How to highlight the property's renovation potential vs. current condition
- Timing strategies for maximum leverage
- Multiple offer scenarios and competitive bidding

REQUIRED OUTPUT FORMAT:
Maximum Cash Offer Negotiation Guide

[PERSONALIZED INTRODUCTION: Address their ${propertyAge}-year-old property with strong equity position]

Property Analysis: ${address}
Current Estimated Value: ${formattedValue}
Equity Position: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(melissaData.apiEquity || 0)}

YOUR NEGOTIATION ADVANTAGES:
[List 5-7 specific property features that increase cash offer potential]

CASH BUYER NEGOTIATION TACTICS:
[Specific strategies for maximizing offers from investors]

MARKET LEVERAGE STRATEGY:
[How to use market conditions and property characteristics for maximum cash offers]`;

    // =================================================================
    // 3. FSBO CAMPAIGN - FOR SALE BY OWNER COMPLETE GUIDE
    // =================================================================
    case 'fsbo':
      return `You are a FSBO (For Sale By Owner) expert creating a comprehensive DIY selling guide. Provide step-by-step guidance for selling this property without an agent, including legal requirements, marketing, and negotiation strategies.

${propertyDetails}

FSBO STRATEGY FOR THIS PROPERTY:
Consider the property's characteristics for self-selling approach:

1. PROPERTY PREPARATION FOR FSBO:
- ${propertyAge}-year-old ${record.ExtStructInfo?.StructureStyle || 'home'} specific preparation needs
- Quick fixes vs. major improvements for ${formattedValue} price point
- Staging strategies for ${record.IntRoomInfo?.BedroomsCount || 'multi'}-bedroom layout

2. LEGAL AND DOCUMENTATION REQUIREMENTS:
- ${record.PropertyAddress?.State || 'State'}-specific disclosure requirements
- Required paperwork and contracts for FSBO sales
- Title and escrow process without agent representation
- Inspection and appraisal coordination

3. MARKETING AND PRICING STRATEGY:
- Competitive pricing analysis for ${record.PropertyAddress?.City} market
- DIY photography and listing creation
- FSBO-specific marketing channels and platforms

REQUIRED OUTPUT FORMAT:
Complete FSBO Selling Guide

[PERSONALIZED INTRODUCTION: Address their decision to sell their ${formattedValue} ${record.ExtStructInfo?.StructureStyle || 'home'} themselves]

Property Analysis: ${address}
Current Estimated Value: ${formattedValue}

FSBO PREPARATION CHECKLIST:
[Step-by-step property preparation specific to this home]

LEGAL AND PAPERWORK REQUIREMENTS:
[${record.PropertyAddress?.State || 'State'}-specific legal requirements and documentation]

DIY MARKETING STRATEGY:
[Complete marketing plan for FSBO success]

NEGOTIATION AND CLOSING GUIDE:
[How to handle offers, negotiations, and closing without an agent]`;

    // =================================================================
    // 4. SELL CAMPAIGN - GENERAL SELLER'S MAXIMIZATION GUIDE
    // =================================================================
    case 'sell':
      return `You are a real estate selling strategist creating a comprehensive seller's guide. Provide strategies for maximizing sale price and finding the best selling approach, whether with an agent or FSBO.

${propertyDetails}

SELLING STRATEGY FOR THIS PROPERTY:
Analyze the best approach for selling this specific property:

1. QUICK FIXES FOR IMMEDIATE IMPACT:
- ${propertyAge}-year-old home specific quick improvements
- Low-cost, high-impact updates for ${formattedValue} price range
- Staging and presentation strategies for ${record.IntRoomInfo?.BedroomsCount || 'multi'}-bedroom home

2. MAJOR IMPROVEMENTS FOR MAXIMUM RETURN:
- Strategic renovations that maximize sale price for this property type
- ROI analysis for major improvements in ${record.PropertyAddress?.City} market
- When to improve vs. sell as-is analysis

3. AGENT SELECTION AND WORKING RELATIONSHIP:
- How to find the best selling agent for ${record.ExtStructInfo?.StructureStyle || 'this property type'}
- Interview questions and criteria for agent selection
- Commission negotiation and service expectations
- When FSBO might be better vs. using an agent

REQUIRED OUTPUT FORMAT:
Complete Seller's Maximization Guide

[PERSONALIZED INTRODUCTION: Address selling their ${propertyAge}-year-old ${formattedValue} ${record.ExtStructInfo?.StructureStyle || 'home'}]

Property Analysis: ${address}
Current Estimated Value: ${formattedValue}

QUICK WINS FOR IMMEDIATE IMPACT:
[5-7 quick, low-cost improvements specific to this property]

MAJOR IMPROVEMENTS ANALYSIS:
[Strategic renovation recommendations with ROI analysis]

SELLING APPROACH RECOMMENDATIONS:
[Agent vs. FSBO analysis for this specific property and market]

AGENT SELECTION GUIDE:
[How to find and work with the best selling agent for maximum results]`;

    // =================================================================
    // 5. BUY CAMPAIGN - HOME BUYER'S MAXIMIZATION GUIDE
    // =================================================================
    case 'buy':
      return `You are a home buying strategist creating a comprehensive buyer's guide. Help maximize buying power, minimize costs, and get the most house for their money using this property as a case study.

${propertyDetails}

BUYER MAXIMIZATION STRATEGY:
Use this property as an example for buying optimization:

1. BUYING POWER MAXIMIZATION:
- Credit optimization strategies to qualify for better rates
- Down payment strategies and assistance programs
- Pre-approval tactics for maximum loan amount
- Debt-to-income optimization techniques

2. COST MINIMIZATION STRATEGIES:
- Interest rate negotiation and lender shopping
- Closing cost reduction techniques
- PMI removal strategies and alternatives
- Long-term cost analysis (15 vs 30-year mortgages)

3. PROPERTY VALUE MAXIMIZATION:
- How to identify undervalued properties like this ${propertyAge}-year-old ${record.ExtStructInfo?.StructureStyle || 'home'}
- Negotiation tactics for properties with ${record.EstimatedValue?.ConfidenceScore || 'unknown'}% confidence score
- Future appreciation potential analysis for ${record.PropertyAddress?.City} area
- Hidden value opportunities in older properties

REQUIRED OUTPUT FORMAT:
Complete Home Buyer's Maximization Guide

[PERSONALIZED INTRODUCTION: Using this ${formattedValue} property as an example of smart buying strategies]

Property Case Study: ${address}
Estimated Value: ${formattedValue}
Market Analysis: ${record.PropertyAddress?.City}, ${record.PropertyAddress?.State}

MAXIMIZE YOUR BUYING POWER:
[Specific strategies to qualify for more house/better rates]

MINIMIZE YOUR COSTS:
[Tactics to reduce interest rates, fees, and long-term costs]

SMART PROPERTY SELECTION:
[How to identify the best value properties like this example]

NEGOTIATION AND CLOSING STRATEGIES:
[Advanced tactics for getting the best deal and terms]`;

    // =================================================================
    // DEFAULT CASE - VALUE CAMPAIGN
    // =================================================================
    default:
      return getCampaignSpecificPrompt('value', record, melissaData, address, formattedValue, propertyAge, hasBasement, basementFinished, hasFireplace, hasPorch, porchSize, lotSize);
  }
}