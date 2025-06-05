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
 * Generate a comprehensive AI ValueBoost report using complete property data
 * @param {Object} melissaData - Complete Melissa API property data
 */
export async function generateAIValueBoostReport(melissaData) {
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

    // Enhanced prompt with comprehensive property data
    const prompt = `You are a professional real estate improvement analyst creating a comprehensive ValueBoost report. Analyze this property data and provide specific, actionable improvement recommendations with realistic costs and ROI calculations.

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

ANALYSIS REQUIREMENTS:
1. Consider the property's age (${propertyAge} years) when recommending improvements
2. Factor in the ${record.ExtStructInfo?.Exterior1Code || 'unknown'} exterior and ${record.ExtStructInfo?.StructureStyle || 'unknown'} style
3. Address the ${record.Utilities?.HVACHeatingDetail || 'unknown'} heating system efficiency
4. ${hasBasement && !basementFinished ? 'Evaluate basement finishing potential' : ''}
5. Consider lot size (${lotSize} acres) for outdoor improvements
6. Provide specific cost estimates based on the ${formattedValue} home value tier
7. Calculate realistic ROI percentages for each recommendation

ENHANCED MARKET & INVESTMENT ANALYSIS:
8. Analyze recent sale trends - Last sold ${record.SaleInfo?.DeedLastSaleDate ? new Date(record.SaleInfo.DeedLastSaleDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).getFullYear() : 'Unknown'} for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(record.SaleInfo?.DeedLastSalePrice || 0)} vs current ${formattedValue}
9. Consider tax assessment gap - Market value ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(record.Tax?.MarketValueTotal || 0)} vs estimated ${formattedValue}
10. Factor in ${record.PropertyAddress?.City || 'local'}, ${record.PropertyAddress?.State || ''} market conditions and ${record.Parcel?.CBSAName || 'metro area'} trends
11. Owner-occupied property - prioritize livability improvements alongside ROI
12. High equity position (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(melissaData.apiEquity || 0)}) enables larger investment opportunities
13. Multi-story layout (${record.IntRoomInfo?.StoriesCount || 'multi-level'}) creates vertical space optimization potential
14. Large lot (${lotSize} acres) offers significant outdoor development and landscaping value-add opportunities
15. ${record.IntStructInfo?.Construction || 'Current'} construction requires material-specific improvement approaches
16. Georgia climate considerations for energy efficiency and seasonal optimization improvements
17. ${record.Utilities?.HVACHeatingFuel || 'Current'} heating system and utility cost reduction strategies
18. Confidence score of ${record.EstimatedValue?.ConfidenceScore || 'Unknown'}% suggests ${parseInt(record.EstimatedValue?.ConfidenceScore || 0) > 85 ? 'reliable' : 'moderate'} ROI prediction accuracy

REQUIRED OUTPUT FORMAT (follow this structure exactly):

ValueBoost AI Analysis Report

[PERSONALIZED INTRODUCTION: Write a warm, personalized introduction explaining this is their custom property analysis. Reference specific details like the ${propertyAge}-year-old ${record.ExtStructInfo?.StructureStyle || 'home'} with ${record.ExtStructInfo?.Exterior1Code || 'exterior'} exterior. Mention analyzing their ${record.IntRoomInfo?.BedroomsCount || 'multi'}-bedroom, ${record.IntRoomInfo?.BathCount || 'multi'}-bathroom home worth ${formattedValue}. Keep it personal and professional.]

Property Analysis: ${address}
Current Estimated Value: ${formattedValue}
Year Built: ${record.PropertyUseInfo?.YearBuilt || 'Unknown'} (${propertyAge} years old)
Property Type: ${record.ExtStructInfo?.StructureStyle || 'Residential'} with ${record.ExtStructInfo?.Exterior1Code || 'Standard'} exterior

TOP IMPROVEMENT OPPORTUNITIES:

[Generate 5-7 specific improvement recommendations based on the property details provided. Consider:
- Age-appropriate upgrades for a ${propertyAge}-year-old home
- Exterior material maintenance/enhancement for ${record.ExtStructInfo?.Exterior1Code || 'the current'} exterior
- HVAC efficiency improvements for the ${record.Utilities?.HVACHeatingDetail || 'current'} system
- ${hasBasement && !basementFinished ? 'Basement finishing opportunity with ' + record.PropertySize?.BasementArea + ' sq ft of space' : ''}
- ${hasPorch ? 'Porch enhancement/expansion options with current ' + porchSize + ' sq ft' : 'Outdoor living space additions'}
- Kitchen and bathroom modernization appropriate for the home's value tier
- Energy efficiency improvements for a ${propertyAge}-year-old home

For each recommendation, provide:
- Specific improvement description
- Estimated cost range
- Expected ROI percentage
- Implementation timeline
- Why this improvement makes sense for THIS specific property]

MARKET STRATEGY SUMMARY:
[Brief paragraph about maximizing value for this specific property type, age, and location. Consider the home's ${formattedValue} value tier and ${record.PropertyAddress?.City}, ${record.PropertyAddress?.State} market.]

Make every recommendation specific to the property's actual characteristics, age, and features.`;

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