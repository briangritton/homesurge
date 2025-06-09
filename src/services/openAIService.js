// src/services/openAIService.js

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export async function sendMessageToOpenAI(messages) {
  try {
    // Debug log for API key availability
    console.log("OpenAI API Key available:", !!OPENAI_API_KEY, 
                "Length:", OPENAI_API_KEY ? OPENAI_API_KEY.length : 0);
    
    // Return a friendly response for testing if no API key is available
    if (!OPENAI_API_KEY) {
      console.warn("No OpenAI API key found - returning mock response");
      return "Hello! I'm your real estate assistant. How can I help you today? (Note: This is a demo mode response since this is a development environment)";
    }
    
    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
    };
    
    console.log("Sending request to OpenAI:", JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log("OpenAI response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    const data = await response.json();
    console.log("OpenAI successful response:", data);
    
    if (!data.choices || !data.choices.length || !data.choices[0].message) {
      console.error("Unexpected OpenAI response format:", data);
      return "Error: Unexpected response format from OpenAI";
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    // Return an error message instead of throwing
    return "Error connecting to AI service. Please try again later.";
  }
}

export async function getRealEstateHelp(query) {
  try {
    const systemPrompt = `You are Sarah, a knowledgeable real estate assistant specializing in helping homeowners sell their properties. 
You work for a home buying company that provides cash offers and helps people sell their homes quickly.

IMPORTANT: You are part of a strictly controlled sales funnel with specific steps.

CRITICAL RULES:
1. NEVER mention subscription, sign-up, premium, payment, or any sales language until the final step
2. NEVER include call-to-action phrases until the system explicitly tells you to in step 3
3. NEVER use phrases like "sign up", "premium", "subscription", "paid", "trial", etc. in your responses
4. NEVER try to convert the user or direct them to sign up in your responses
5. Keep your responses SHORT (2-3 sentences maximum) and friendly
6. Ask about the user's real estate situation but don't actually provide detailed advice yet

Follow this EXACT 3-step conversation flow:
1) Initial greeting and property situation identification (NO sales language)
2) Ask about their timeline or specific concerns (NO sales language)
3) The system will handle the final step with a scripted message - do not create your own sales pitch

IMPORTANT: The final sales/offer message will be handled automatically by the system code.
DO NOT create your own sales or offer message, as this would break the funnel flow.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: query }
    ];

    return sendMessageToOpenAI(messages);
  } catch (error) {
    console.error("Error in getRealEstateHelp:", error);
    return "I'd be happy to help with your real estate needs! Could you tell me a bit more about your property situation?";
  }
}