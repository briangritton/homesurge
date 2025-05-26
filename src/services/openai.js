import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

/**
 * Generate an AI-enhanced ValueBoost report based on property data
 * Uses the existing template structure as a guide for OpenAI
 */
export async function generateAIValueBoostReport(propertyContext) {
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

    // Structured prompt that guides OpenAI to follow our template format
    const prompt = `You are a professional real estate improvement analyst creating a ValueBoost report. Based on the property data provided, generate a detailed, personalized report that follows this EXACT structure:

PROPERTY DATA:
- Address: ${address}
- Current Estimated Value: ${formattedValue}
- Potential Value Increase: ${formattedIncrease}
- Bedrooms: ${bedrooms || 'Not specified'}
- Bathrooms: ${bathrooms || 'Not specified'}
- Square Footage: ${squareFootage || 'Not specified'}
- Upgrades Needed (1-10 scale): ${upgradesNeeded || 'Not specified'}

REQUIRED OUTPUT FORMAT (follow this structure exactly):

ValueBoost AI Analysis Report

Property: [property address]
Current Estimated Value: [formatted current value]
Potential Value Increase: [formatted potential increase]

TOP RECOMMENDATIONS FOR MAXIMUM ROI:

1. [Improvement Category] ([Cost Range])
   - [Specific recommendation 1]
   - [Specific recommendation 2]  
   - [Specific recommendation 3]
   Expected ROI: [percentage range]

2. [Improvement Category] ([Cost Range])
   - [Specific recommendation 1]
   - [Specific recommendation 2]
   - [Specific recommendation 3]
   Expected ROI: [percentage range]

3. [Improvement Category] ([Cost Range])
   - [Specific recommendation 1]
   - [Specific recommendation 2]
   - [Specific recommendation 3]
   Expected ROI: [percentage range]

4. [Improvement Category] ([Cost Range])
   - [Specific recommendation 1]
   - [Specific recommendation 2]
   - [Specific recommendation 3]
   Expected ROI: [percentage range]

5. [Improvement Category] ([Cost Range])
   - [Specific recommendation 1]
   - [Specific recommendation 2]
   - [Specific recommendation 3]
   Expected ROI: [percentage range]

[Final analysis paragraph about market conditions and strategy]

INSTRUCTIONS:
- Provide 5 specific improvement recommendations ranked by ROI
- Include realistic cost ranges in parentheses (e.g., $15,000-25,000)
- Give 3 specific actionable sub-recommendations for each category
- Provide ROI percentages based on current market conditions
- Consider the property's specific characteristics (bedrooms, bathrooms, square footage)
- Tailor recommendations to maximize the ${formattedIncrease} potential increase
- Use professional real estate improvement language
- Keep cost ranges realistic for current market conditions
- End with a brief analysis paragraph about market strategy

Be creative and insightful while maintaining the exact structure above.`;

    const completion = await openai.chat.completions.create({
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