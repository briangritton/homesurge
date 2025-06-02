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
 * Generate an AI-enhanced ValueBoost report that enhances existing template recommendations
 * @param {Object} propertyContext - Property data from Melissa API
 * @param {Array} templateRecommendations - Generated template recommendations to enhance
 */
export async function generateAIValueBoostReport(propertyContext, templateRecommendations = []) {
  try {
    console.log('🤖 Starting OpenAI ValueBoost report generation...');
    
    const { address, estimatedValue, bedrooms, bathrooms, squareFootage, potentialIncrease, upgradesNeeded } = propertyContext;
    
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(estimatedValue || 0);

    const formattedIncrease = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(potentialIncrease || 0);

    // Create template recommendations summary for AI enhancement
    const templateSummary = templateRecommendations.length > 0 
      ? templateRecommendations.map((rec, index) => 
          `${index + 1}. ${rec.strategy} (${rec.costEstimate}) - ${rec.description} - Expected ROI: ${rec.roiEstimate}`
        ).join('\n')
      : 'No template recommendations provided';

    // Enhanced prompt that personalizes template recommendations
    const prompt = `You are a professional real estate improvement analyst creating a personalized ValueBoost report. Based on the property data and template recommendations provided, enhance and personalize the content.

PROPERTY DATA:
- Address: ${address}
- Current Estimated Value: ${formattedValue}
- Potential Value Increase: ${formattedIncrease}
- Bedrooms: ${bedrooms || 'Not specified'}
- Bathrooms: ${bathrooms || 'Not specified'}
- Square Footage: ${squareFootage || 'Not specified'}
- Upgrades Needed (1-10 scale): ${upgradesNeeded || 'Not specified'}

TEMPLATE RECOMMENDATIONS TO ENHANCE:
${templateSummary}

REQUIRED OUTPUT FORMAT (follow this structure exactly):

ValueBoost AI Analysis Report

[PERSONALIZED INTRODUCTION: Write a warm, personalized introduction that explains this is their custom ValueBoost/OfferBoost report. Reference their specific property at ${address} and mention that you've analyzed their ${bedrooms ? bedrooms + '-bedroom' : ''} ${bathrooms ? bathrooms + '-bathroom' : ''} home worth ${formattedValue}. Explain that the AI has identified specific opportunities to potentially increase their home's value by ${formattedIncrease}. Make it personal and welcoming.]

Property: ${address}
Current Estimated Value: ${formattedValue}
Potential Value Increase: ${formattedIncrease}

AI-ENHANCED RECOMMENDATIONS:

[Take the template recommendations above and enhance each one with specific, personalized details for this property. Keep the same general categories but make them more specific to the property's characteristics, location, and value range. Add property-specific insights and local market considerations.]

[MARKET STRATEGY SUMMARY: End with a brief paragraph about the local market conditions and overall strategy for maximizing value on this specific property.]

INSTRUCTIONS:
- Enhance and personalize the template recommendations provided above
- Keep the same general improvement categories but add specific details
- Reference the property's specific characteristics (bedrooms, bathrooms, square footage, value range)
- Add insights about the local market for properties in this value range
- Make cost estimates more specific to the property's value tier
- Provide property-specific implementation tips
- Keep the professional tone but make it personal to their home
- The introduction should feel like it was written specifically for this homeowner

Be insightful and specific while enhancing the existing template structure.`;

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
    return generateFallbackReport(propertyContext);
  }
}

/**
 * Fallback template report in case OpenAI fails
 * Uses the original template structure
 */
function generateFallbackReport(propertyContext) {
  console.log('🔄 Using fallback template report');
  
  const { address, estimatedValue, bedrooms, bathrooms, squareFootage, potentialIncrease, upgradesNeeded } = propertyContext;
  
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(estimatedValue || 0);

  const formattedIncrease = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(potentialIncrease || 0);

  return `ValueBoost AI Analysis Report

Welcome to your personalized ValueBoost report for ${address}! This AI-powered analysis has been specifically tailored to your unique property characteristics to identify the most effective opportunities for increasing your home's value. Using advanced market data and proven renovation strategies, we've compiled strategic recommendations that are optimized for your specific property type and location.

Property: ${address}
Current Estimated Value: ${formattedValue}
Potential Value Increase: ${formattedIncrease}

TOP RECOMMENDATIONS FOR MAXIMUM ROI:

1. Kitchen Modernization ($15,000-25,000)
   - Update cabinets with soft-close hardware
   - Install quartz countertops
   - Upgrade to stainless steel appliances
   Expected ROI: 80-85%

2. Bathroom Renovation ($8,000-15,000)
   - Modern vanity and fixtures
   - Tile shower upgrade
   - Improved lighting and ventilation
   Expected ROI: 70-75%

3. Flooring Enhancement ($5,000-12,000)
   - Luxury vinyl plank or hardwood
   - Consistent flooring throughout main areas
   Expected ROI: 65-70%

4. Exterior Curb Appeal ($3,000-8,000)
   - Fresh paint (exterior)
   - Landscaping improvements
   - Front door and hardware upgrade
   Expected ROI: 60-70%

5. HVAC System Optimization ($4,000-10,000)
   - Energy-efficient HVAC upgrade
   - Smart thermostat installation
   Expected ROI: 50-60%

This analysis is based on current market conditions, comparable sales, and proven value-add strategies for your area.`;
}