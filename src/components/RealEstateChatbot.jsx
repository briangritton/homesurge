// src/components/RealEstateChatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
// import { sendMessageToOpenAI } from "../services/openAIService"; // Commented out - using scripted responses
import { trackFormStepComplete } from "../services/analytics";
import { googlePlacesService } from "../services/googlePlaces";
import { agentReportService } from "../services/agentReportService";
import { createImmediateLead } from "../services/firebase";
import { leadService } from "../services/leadOperations";
import { propertyService } from "../services/propertyLookup";
import "./RealEstateChatbot.css";

const RealEstateChatbot = () => {
  // Dynamic headline based on URL parameter
  const [headline, setHeadline] = useState(
    "Find the Best Real Estate Agent in Your Area"
  );
  const [subheadline, setSubheadline] = useState(
    "Get AI-powered agent recommendations based on millions of reviews and performance data"
  );

  // Chat state
  const [messages, setMessages] = useState([]);
  const [conversationFlow, setConversationFlow] = useState([]);
  const [conversationIndex, setConversationIndex] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [query, setQuery] = useState("");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Data collection state
  const [userZipCode, setUserZipCode] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userName, setUserName] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [zipValidationAttempts, setZipValidationAttempts] = useState(0);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [addressInputValue, setAddressInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Lead tracking state (like AddressForm)
  const [leadId, setLeadId] = useState(null);
  const [campaignData, setCampaignData] = useState({});
  const [leadCreated, setLeadCreated] = useState(false);

  // OpenAI integration state (DISABLED - using scripted responses only)
  const [useOpenAI, setUseOpenAI] = useState(false); // Disabled for agent review bot
  const [openAIAttempted, setOpenAIAttempted] = useState(false);
  const [openAIFailed, setOpenAIFailed] = useState(false);
  const [nonsenseCount, setNonsenseCount] = useState(0);
  const [openAIMessages, setOpenAIMessages] = useState([]);
  const [conversationStage, setConversationStage] = useState(0);

  // Agent report state
  const [showAgentList, setShowAgentList] = useState(false);
  const [agentReportData, setAgentReportData] = useState(null);
  const [loadingAgentReport, setLoadingAgentReport] = useState(false);
  const [agentReportTimeout, setAgentReportTimeout] = useState(false);
  const [agentReportReady, setAgentReportReady] = useState(false);
  const [collectingContactInfo, setCollectingContactInfo] = useState(false);

  // Refs
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Setup headlines and create immediate lead (like AddressForm)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const area = urlParams.get("area");
    const propertyType = urlParams.get("type");

    // Extract campaign data from URL (same as AddressForm)
    const extractedCampaignData = {
      campaign_name: urlParams.get('campaign_name') || '',
      campaign_id: urlParams.get('campaign_id') || '',
      adgroup_id: urlParams.get('adgroup_id') || '',
      adgroup_name: urlParams.get('adgroup_name') || '',
      keyword: urlParams.get('keyword') || '',
      matchtype: urlParams.get('matchtype') || '',
      device: urlParams.get('device') || '',
      gclid: urlParams.get('gclid') || '',
      traffic_source: urlParams.get('utm_source') || 'Direct',
      variant: 'agent-chat', // Specific variant for this chatbot
      split_test: 'agent-chat',
      routeCampaign: 'agent-finder',
      routeVariant: 'chat',
      url: window.location.href,
      referrer: document.referrer || ''
    };

    setCampaignData(extractedCampaignData);

    // Create immediate lead (same pattern as AddressForm)
    const createLead = async () => {
      if (!leadCreated) {
        try {
          console.log('🎯 Creating immediate lead for agent chat');
          const newLeadId = await createImmediateLead(extractedCampaignData);
          if (newLeadId) {
            setLeadId(newLeadId);
            setLeadCreated(true);
            leadService.setLeadId(newLeadId); // Store in localStorage like AddressForm
            console.log('✅ Immediate lead created:', newLeadId);
          }
        } catch (error) {
          console.error('❌ Failed to create immediate lead:', error);
        }
      }
    };

    createLead();

    // Set headlines based on URL parameters
    if (area) {
      const capitalizedArea = area
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      setHeadline(`Selling Your Home in ${capitalizedArea}? Get Expert Local Guidance!`);
      setSubheadline(`Connect with our ${capitalizedArea} real estate specialist for personalized selling advice`);
    } else if (propertyType) {
      const capitalizedType = propertyType.charAt(0).toUpperCase() + propertyType.slice(1).toLowerCase();
      setHeadline(`Need Help Selling Your ${capitalizedType}? Get Expert Guidance Now!`);
    }
  }, [location, leadCreated]);

  // Setup conversation flows - Agent Review Bot
  useEffect(() => {
    const agentReviewFlow = {
      default: [
        {
          assistant:
            "<p class='re-message-text'>" +
            "Hi, I'm your Real Estate Agent Review Assistant! Our HomeSurge.AI agent review system has been trained on millions of datapoints, and has access to a vast amount of data on local realtors reviews and performance in your area, so we can confidently point you to your top local agents! First, can I get the zip code you would like to search reviews of agents in?" +
            "</p>",
        },
        {
          assistant:
            "<p class='re-message-text'>" +
            "Perfect, next let's get the address of the property you'd like to sell so I can recommend agents who have had the most success selling homes similar to yours the past year. Start typing and just click from the drop down suggestions..." +
            "</p>",
          showAddressInput: true,
        },
        {
          assistant:
            "<p class='re-message-text'>" +
            "Great! Give me just a sec...." +
            "</p>",
          showTyping: true,
          isProcessing: true,
        },
        {
          assistant:
            "<p class='re-message-text'>" +
            "Perfect, I have compiled a list of the top 10 agents in " + (userZipCode || "your zip code") + " for you to review. My top priority recommendation for your specific home, is Spencer Gritton. He has sold over 2.5 million dollars of luxury lakefront property alone this year, all in only a few days on the market, so I would feel very confident that he is the best agent to help you sell your home for its highest value with a quick turnaround.<br><br>" +
            "He's accepting a few new clients, but he keeps his client list limited so he can stay highly personally focused on each listing under his team. Let's get you connected over chat, absolutely no obligation and no pressure, so the two of you can see if it might be a good fit. How would you like to connect?" +
            "</p>",
          isFinal: true,
          showActionButtons: true,
        },
      ],
    };

    setConversationFlow(agentReviewFlow.default);

    // Set initial welcome message
    const welcomeMessage = {
      assistant:
        "<p class='re-message-text'>Hi, I'm your Real Estate Agent Review Assistant! Our HomeSurge.AI agent review system has been trained on millions of datapoints, and has access to a vast amount of data on local realtors reviews and performance in your area, so we can confidently point you to your top local agents! First, can I get the zip code you would like to search reviews of agents in?</p>",
    };

    setMessages([welcomeMessage]);
  }, [location, userZipCode]);

  // Initialize Google Places API
  useEffect(() => {
    const initializeGooglePlaces = async () => {
      try {
        console.log('🗺️ Initializing Google Places API for chatbot...');
        const initialized = await googlePlacesService.initialize();
        setGoogleApiLoaded(initialized);
        console.log('🗺️ Google Places API initialized:', initialized);
      } catch (error) {
        console.error('❌ Failed to initialize Google Places API:', error);
        setGoogleApiLoaded(false);
      }
    };
    
    initializeGooglePlaces();
  }, []);

  // OpenAI initialization (COMMENTED OUT - Using scripted responses only)
  /*
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const area = urlParams.get("area") || "";

    setOpenAIMessages([
      {
        role: "system",
        content: `You are a Real Estate Agent Review Assistant specializing in ${
          area || "agent recommendations"
        }.
        
        IMPORTANT: You are part of a strictly controlled agent review funnel.
        
        CRITICAL RULES:
        1. Collect zip code first, then address
        2. Keep responses SHORT (2-3 sentences maximum) and friendly
        3. Focus on agent review context, not property selling
        4. The final recommendation will be handled by scripted message
        
        Follow this EXACT 3-step conversation flow:
        1) Collect zip code for agent search
        2) Collect address for personalized recommendations
        3) The system will handle the final step with Spencer recommendation
        
        IMPORTANT: The final agent recommendation will be handled automatically by the system code.`,
      },
    ]);
  }, [location]);
  */

  // UI behavior effects
  useEffect(() => {
    if (!initialLoadComplete && messages.length > 0) {
      setInitialLoadComplete(true);
    }
    
    if (initialLoadComplete && messages.length > 0) {
      const conversationContainer = document.querySelector('.re-conversation-container');
      if (conversationContainer) {
        conversationContainer.scrollTop = conversationContainer.scrollHeight;
      }
    }
  }, [messages, initialLoadComplete]);

  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
      }
    }, 300);

    return () => clearTimeout(focusTimeout);
  }, []);

  // Helper functions
  const isValidZipCode = (input) => {
    // US zip code: 5 digits or 5+4 format (12345 or 12345-1234)
    const zipPattern = /^\d{5}(-\d{4})?$/;
    return zipPattern.test(input.trim());
  };

  const isValidAddress = (input) => {
    // Check if input looks like an address (has numbers and letters)
    const addressPattern = /\d+.*[a-zA-Z]|[a-zA-Z].*\d/;
    return addressPattern.test(input.trim()) && input.trim().length > 5;
  };

  // Handle address input changes and fetch suggestions
  const handleAddressInputChange = async (value) => {
    setAddressInputValue(value);
    
    if (!value || value.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!googleApiLoaded || !window.google?.maps?.places) {
      return;
    }

    try {
      const service = new window.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(
        {
          input: value,
          types: ['address'],
          componentRestrictions: { country: 'us' }
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setAddressSuggestions(predictions.slice(0, 5)); // Show max 5 suggestions
            setShowSuggestions(true);
          } else {
            setAddressSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion) => {
    setAddressInputValue(suggestion.description);
    setShowSuggestions(false);
    
    try {
      // Get place details
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      service.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ['formatted_address', 'address_components', 'geometry', 'place_id', 'name']
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            handleAddressSelect(place);
          } else {
            console.error('Failed to get place details:', status);
          }
        }
      );
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  // Handle address selection
  const handleAddressSelect = async (place) => {
    console.log('📍 Processing address selection:', place.formatted_address);
    
    // Set the selected address
    setUserAddress(place.formatted_address);
    setSelectedPlace(place);
    
    // Extract address components (like AddressForm)
    const addressComponents = googlePlacesService.formatAddressComponents(place);
    
    // Update lead with address data (like AddressForm)
    const updateLeadWithAddress = async () => {
      try {
        const addressData = {
          street: place.formatted_address,
          city: addressComponents.city,
          state: addressComponents.state,
          zip: addressComponents.zip || userZipCode,
          selectedSuggestionAddress: place.formatted_address,
          addressSelectionType: 'Google Places',
          leadStage: 'Address Selected',
          location: JSON.stringify({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }),
          ...campaignData
        };
        
        await leadService.updateLead(leadService.getLeadId(), addressData);
        console.log('✅ Lead updated with address data');
        
        // Start property API calls in background (non-blocking like AddressForm)
        propertyService.lookupProperty(place.formatted_address, leadService.getLeadId())
          .then(() => console.log('✅ Property lookup completed'))
          .catch(error => console.error('❌ Property lookup failed:', error));
          
      } catch (error) {
        console.error('❌ Failed to update lead with address:', error);
      }
    };
    
    updateLeadWithAddress();
    
    // Add user message showing selected address
    const userMessage = place.formatted_address;
    const newMessages = [...messages, { user: userMessage }];
    setMessages([...newMessages, { typing: true }]);
    
    // Move to processing step
    setTimeout(async () => {
      const updatedMessages = newMessages.filter((msg) => !msg.typing);
      
      // Add processing message
      const processingMessage = {
        assistant: "<p class='re-message-text'>Great! Give me just a sec....</p>",
        showTyping: true,
      };
      
      setMessages([...updatedMessages, processingMessage]);
      
      // Start background API calls
      triggerBackgroundAPIs(place);
      
      // After a short delay, show final recommendation
      setTimeout(() => {
        const finalMessage = {
          assistant:
            "<p class='re-message-text'>" +
            "Perfect, I have compiled a list of the top 10 agents in " + userZipCode + " for you to review. My top priority recommendation for your specific home, is Spencer Gritton. He has sold over 2.5 million dollars of luxury lakefront property alone this year, all in only a few days on the market, so I would feel very confident that he is the best agent to help you sell your home for its highest value with a quick turnaround.<br><br>" +
            "He's accepting a few new clients, but he keeps his client list limited so he can stay highly personally focused on each listing under his team. Let's get you connected over chat, absolutely no obligation and no pressure, so the two of you can see if it might be a good fit. How would you like to connect?" +
            "</p>",
          isFinal: true,
          showActionButtons: true,
        };
        
        setMessages(prev => prev.filter(msg => !msg.showTyping).concat([finalMessage]));
        setConversationIndex(3);
        
        trackFormStepComplete(3, "Agent Review Chatbot Final Message", {
          headline: headline,
          zipCode: userZipCode,
          address: place.formatted_address,
        });
      }, 2000);
    }, 500);
  };

  // Trigger background API calls
  const triggerBackgroundAPIs = async (place) => {
    try {
      // Import services dynamically
      const { melissaService } = await import('../services/melissa.js');
      const { lookupAndSave: batchDataLookupAndSave } = await import('../services/batchdata.js');
      
      console.log('🚀 Starting background API calls for:', place.formatted_address);
      
      // Start Melissa lookup in background
      melissaService.lookupAndSave(place.formatted_address)
        .then(melissaData => {
          console.log('🔍 Melissa data received:', {
            hasData: !!melissaData,
            apiEstimatedValue: melissaData?.apiEstimatedValue
          });
        })
        .catch(error => {
          console.error('❌ Melissa lookup failed:', error);
        });
      
      // Start BatchData lookup in background
      const addressComponents = googlePlacesService.formatAddressComponents(place);
      batchDataLookupAndSave(addressComponents)
        .then(batchData => {
          console.log('📞 BatchData received:', {
            hasData: !!batchData,
            phoneNumbers: batchData?.phoneNumbers?.length || 0
          });
        })
        .catch(error => {
          console.error('❌ BatchData lookup failed:', error);
        });
        
    } catch (error) {
      console.error('❌ Failed to start background API calls:', error);
    }
  };

  // Process AI response (COMMENTED OUT - Using scripted responses only)
  /*
  const processAIResponse = async (userMessage) => {
    try {
      const urlParams = new URLSearchParams(location.search);
      const area = urlParams.get("area") || "";

      const updatedOpenAIMessages = [
        ...openAIMessages,
        { role: "user", content: userMessage },
      ];

      let contextPrompt = "";
      let isFinal = false;

      if (conversationStage === 0) {
        setConversationStage(1);
        contextPrompt = `
        The user is providing their zip code for agent search.
        
        Respond with appreciation and ask for their address for personalized recommendations.
        
        Keep it SHORT (2-3 sentences). Focus on agent review context.`;
      }
      else if (conversationStage === 1) {
        contextPrompt = `
        The user is providing their address for agent recommendations.
        
        Respond that you're analyzing and will provide recommendations.
        
        Keep it SHORT (2-3 sentences). This leads to the Spencer recommendation.`;

        setConversationStage(2);
      }
      else if (conversationStage === 2) {
        const finalMessage =
          `<p class='re-message-text'>` +
          `Perfect, I have compiled a list of agents in your area. My top priority recommendation for your specific home, is Spencer Gritton...` +
          `</p>`;

        return {
          assistant: finalMessage,
          isFinal: true,
          showActionButtons: true,
        };
      }

      if (conversationStage <= 1) {
        const messagesForAPI = [
          ...updatedOpenAIMessages,
          { role: "system", content: contextPrompt },
        ];

        const aiResponse = await sendMessageToOpenAI(messagesForAPI);

        if (aiResponse.includes("Error") || aiResponse.includes("error")) {
          console.log("Error from OpenAI, falling back to scripted responses");
          setOpenAIFailed(true);
          return null;
        }

        setOpenAIMessages([
          ...updatedOpenAIMessages,
          { role: "assistant", content: aiResponse },
        ]);

        return {
          assistant: `<p class='re-message-text'>${aiResponse}</p>`,
          isFinal: isFinal,
          showActionButtons: isFinal,
        };
      }
    } catch (error) {
      console.error("Error processing AI response:", error);
      setOpenAIFailed(true);
      return null;
    }
  };
  */

  // Typing indicator component
  const TypingIndicator = () => {
    return (
      <div className="re-typing-indicator">
        <span className="re-typing-text">Sarah is responding</span>
        <span className="re-typing-dots">...</span>
      </div>
    );
  };

  // Handle sending a message - Agent Review Bot (Scripted responses only)
  const sendMessage = async () => {
    const finalMessageShown = messages.some((msg) => msg.isFinal);
    if (finalMessageShown || showPhoneInput || showAddressInput) {
      return;
    }

    if (!query.trim()) {
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const area = urlParams.get("area");

    // Track first message and enable fullscreen on mobile
    if (!hasSubmitted) {
      trackFormStepComplete(1, "Agent Review Chatbot First Message", {
        message_length: query.length,
        headline: headline,
        area: area,
      });
      setHasSubmitted(true);
      
      // Enable fullscreen mode on mobile after first message
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        setIsFullscreen(true);
      }
    }

    const userMessage = query;
    const newMessages = [...messages, { user: userMessage }];
    setQuery("");
    
    // Always show user message first
    setMessages(newMessages);
    
    // Add typing indicator after a brief delay to ensure user message renders
    setTimeout(() => {
      setMessages([...newMessages, { typing: true }]);
    }, 100);

    // Data collection logic
    let collectedData = "";
    if (conversationIndex === 0) {
      // Collecting zip code with validation
      const trimmedInput = userMessage.trim();
      
      if (!isValidZipCode(trimmedInput)) {
        // Invalid zip code
        const currentAttempts = zipValidationAttempts + 1;
        setZipValidationAttempts(currentAttempts);
        
        if (currentAttempts >= 2) {
          // Second invalid attempt - default to Spencer recommendation
          setTimeout(() => {
            const updatedMessages = newMessages.filter((msg) => !msg.typing);
            const spencerDefaultMessage = {
              assistant:
                "<p class='re-message-text'>" +
                "No problem! Based on your geo location, my top priority recommendation is Spencer Gritton with HomeSmart. He has sold over 2.2 million dollars of luxury lakefront property alone this year, all in only a few days on the market, so I would feel very confident that he is the best agent to help you sell your home for its highest value with a quick turnaround.<br><br>" +
                "He's accepting a few new clients, but he keeps his client list limited so he can stay highly personally focused on each listing under his team. Let's get you connected over chat, absolutely no obligation and no pressure, so the two of you can see if it might be a good fit. How would you like to connect?" +
                "</p>",
              isFinal: true,
              showActionButtons: true,
            };
            
            setMessages([...updatedMessages, spencerDefaultMessage]);
            setConversationIndex(3);
            
            trackFormStepComplete(3, "Agent Review Chatbot Default Recommendation", {
              headline: headline,
              zipValidationAttempts: currentAttempts,
              input: trimmedInput,
            });
          }, 1500);
          return;
        } else {
          // First invalid attempt - ask to try again
          setTimeout(() => {
            const updatedMessages = newMessages.filter((msg) => !msg.typing);
            const retryMessage = {
              assistant:
                "<p class='re-message-text'>" +
                "Sorry, I didn't get a valid zip code. Our AI agent review software is trained on millions of data points, all I need is your zip and I can pull up the top 10 agents we most recommend based on available customer review and sentiment data nearest you! Try entering your zip again." +
                "</p>",
            };
            
            setMessages([...updatedMessages, retryMessage]);
            // Don't increment conversationIndex - stay at zip collection
            
            trackFormStepComplete(1, "Agent Review Chatbot Invalid Zip Code", {
              headline: headline,
              zipValidationAttempts: currentAttempts,
              input: trimmedInput,
            });
          }, 1500);
          return;
        }
      } else {
        // Valid zip code - proceed to next step immediately
        setUserZipCode(trimmedInput);
        collectedData = `Zip Code: ${trimmedInput}`;
        
        // Update lead with zip code (like AddressForm)
        const updateLeadWithZip = async () => {
          try {
            const updateData = {
              zip: trimmedInput,
              leadStage: 'Zip Code Provided',
              ...campaignData
            };
            await leadService.updateLead(leadService.getLeadId(), updateData);
            console.log('✅ Lead updated with zip code:', trimmedInput);
          } catch (error) {
            console.error('❌ Failed to update lead with zip:', error);
          }
        };
        
        updateLeadWithZip();
        
        // Start generating agent report in background
        generateAgentReportBackground(trimmedInput);
        
        // Show typing indicator and then proceed to address collection
        setTimeout(() => {
          const updatedMessages = newMessages.filter((msg) => !msg.typing);
          const nextMessage = conversationFlow[1]; // Address collection message
          
          const addressMessage = {
            assistant: nextMessage.assistant,
            showAddressInput: nextMessage.showAddressInput || false,
          };
          
          setMessages([...updatedMessages, addressMessage]);
          setConversationIndex(1);
          setShowAddressInput(true);
          
          trackFormStepComplete(2, "Agent Review Chatbot Valid Zip Code", {
            headline: headline,
            zipCode: trimmedInput,
          });
          
          // Focus address input after a short delay
          setTimeout(() => {
            if (addressInputRef.current) {
              addressInputRef.current.focus();
            }
          }, 100);
        }, 1600); // Slightly longer to account for the 100ms typing delay
        return;
      }
    } else if (conversationIndex === 1) {
      // Step 2: Check if this is a valid address or trigger fallback
      if (!isValidAddress(userMessage)) {
        // Fallback for non-address input
        setTimeout(() => {
          const updatedMessages = newMessages.filter((msg) => !msg.typing);
          const fallbackMessage = {
            assistant:
              "<p class='re-message-text'>" +
              "I'm actually just the review assistant, but based off of your geo location, I can still provide you with the top agent recommendation. My top priority recommendation is Spencer Gritton. He has sold over 2.5 million dollars of luxury lakefront property alone this year, all in only a few days on the market, so I would feel very confident that he is the best agent to help you sell your home for its highest value with a quick turnaround.<br><br>" +
              "He's accepting a few new clients, but he keeps his client list limited limited so he can stay highly personally focused on each listing under his team. Let's get you scheduled for a 2 minute chat, absolutely no obligation and no pressure, so the two of you can see if it might be a good fit. How would you like to connect?" +
              "</p>",
            isFinal: true,
            showActionButtons: true,
          };
          
          setMessages([...updatedMessages, fallbackMessage]);
          setConversationIndex(3);
          
          trackFormStepComplete(3, "Agent Review Chatbot Fallback Message", {
            headline: headline,
            area: area,
            zipCode: userZipCode,
            input: userMessage,
          });
        }, 1500);
        return;
      }
      
      // Valid address - but we want Google Places, so this shouldn't happen
      setUserAddress(userMessage.trim());
      collectedData = `Address: ${userMessage.trim()}`;
    }

    setTimeout(async () => {
      const updatedMessages = newMessages.filter((msg) => !msg.typing);
      let responseMessage;

      // Use only scripted responses from conversationFlow
      const nextIndex = conversationIndex + 1;

      if (nextIndex < conversationFlow.length) {
        let assistantText = conversationFlow[nextIndex].assistant;
        
        // Replace zip code placeholder in final message
        if (nextIndex === 3 && userZipCode) {
          assistantText = assistantText.replace("your zip code", userZipCode);
        }

        responseMessage = {
          assistant: assistantText,
          isFinal: conversationFlow[nextIndex].isFinal || false,
          showActionButtons: conversationFlow[nextIndex].showActionButtons || false,
          showAddressInput: conversationFlow[nextIndex].showAddressInput || false,
        };
        
        // Set address input mode for step 2
        if (nextIndex === 1 && responseMessage.showAddressInput) {
          setShowAddressInput(true);
        }
        
        setConversationIndex(nextIndex);
      } else {
        responseMessage = {
          assistant:
            "<p class='re-message-text'>Thank you for your interest! Let me connect you with Spencer...</p>",
          isFinal: true,
          showActionButtons: true,
        };
      }

      setMessages([...updatedMessages, responseMessage]);
      
      // Focus appropriate input
      if (showAddressInput && addressInputRef.current) {
        setTimeout(() => addressInputRef.current.focus(), 100);
      } else if (textareaRef.current) {
        textareaRef.current.focus();
      }

      console.log("Collected Data:", collectedData);
    }, 1500 + Math.random() * 1000);
  };

  // Handle text Spencer action
  const handleTextSpencer = () => {
    trackFormStepComplete(4, "Agent Review - Text Spencer Selected", {
      zipCode: userZipCode,
      address: userAddress,
    });
    
    // Pre-formatted SMS message
    const spencerPhone = "4805190554";
    const message = `Hi Spencer! I found you through the agent review search. I'm interested in selling my home at ${userAddress} in ${userZipCode}. Can we schedule a quick 2-minute chat?`;
    const smsUrl = `sms:${spencerPhone}?body=${encodeURIComponent(message)}`;
    
    window.open(smsUrl, '_blank');
  };

  // Handle receive text action
  const handleReceiveText = () => {
    trackFormStepComplete(4, "Agent Review - Text Requested", {
      zipCode: userZipCode,
      address: userAddress,
    });
    
    setShowPhoneInput(true);
    
    // Add phone collection message
    const phoneMessage = {
      assistant: "<p class='re-message-text'>What's the best number for Spencer to text you? There's absolutely no obligation, he'll just send a few quick property questions to see if he might be able to help with your property.</p>"
    };
    
    setMessages(prev => [...prev, phoneMessage]);
  };

  // Generate agent report in background when zip code is entered
  const generateAgentReportBackground = async (zipCode) => {
    console.log('🔍 Pre-loading agent reviews for zip:', zipCode);
    setLoadingAgentReport(true);
    setAgentReportTimeout(false);
    setAgentReportReady(false);
    
    // Set 30-second timeout
    const timeoutId = setTimeout(() => {
      console.log('⏰ Agent report generation timed out after 30 seconds');
      setAgentReportTimeout(true);
      setLoadingAgentReport(false);
    }, 30000);

    try {
      const propertyValue = null; // You can add property value logic here if available
      const agentData = await agentReportService.generateAgentReport(zipCode, propertyValue);
      
      // Clear timeout if we got data in time
      clearTimeout(timeoutId);
      
      if (agentData) {
        console.log('📋 Agent report pre-loaded successfully:', agentData);
        setAgentReportData(agentData);
        setAgentReportReady(true);
        setLoadingAgentReport(false);
      } else {
        console.log('❌ OpenAI failed to generate agent data');
        setAgentReportTimeout(true);
        setLoadingAgentReport(false);
      }
      
    } catch (error) {
      console.error('❌ Failed to pre-load agent reviews:', error);
      clearTimeout(timeoutId);
      setAgentReportTimeout(true);
      setLoadingAgentReport(false);
    }
  };

  // Handle contact agent action
  const handleContactAgent = (agentName) => {
    console.log('🏠 User wants to contact agent:', agentName);
    
    // Hide agent list
    setShowAgentList(false);
    
    // Add bot message asking for contact info
    const contactMessage = {
      assistant: 
        "<p class='re-message-text'>" +
        `Great! We'll put you in touch with ${agentName}! Please provide your contact information below so they can reach out to you:` +
        "</p>"
    };
    
    setMessages(prev => [...prev, contactMessage]);
    
    // Show contact form instead of text input
    setShowPhoneInput(false);
    setShowAddressInput(false);
    setShowContactForm(true);
    setCollectingContactInfo(true);
    
    // Clear any existing values
    setUserName("");
    setUserPhone("");
    setCallbackTime("");
    
    // Track the event
    trackFormStepComplete(5, "Agent Contact Request", {
      agentName: agentName,
      zipCode: userZipCode,
      address: userAddress,
    });
  };

  // Handle contact form submission
  const handleContactSubmit = async () => {
    if (!userName.trim() || !userPhone.trim()) {
      alert("Please fill in both your name and phone number.");
      return;
    }

    try {
      // Update lead with contact information (like AddressForm)
      const contactData = {
        name: userName.trim(),
        phone: userPhone.trim(),
        callbackTime: callbackTime || 'Anytime',
        leadStage: 'Contact Info Provided',
        ...campaignData
      };
      
      await leadService.updateLead(leadService.getLeadId(), contactData);
      console.log('✅ Lead updated with contact info');
      
      // Hide contact form
      setShowContactForm(false);
      setCollectingContactInfo(false);
      
      // Add confirmation message
      const confirmationMessage = {
        assistant: 
          "<p class='re-message-text'>" +
          `Perfect! I've forwarded your information to the agent. They'll reach out to you ${callbackTime || 'soon'}. ` +
          "In the meantime, feel free to ask me any other questions about real estate agents in your area." +
          "</p>"
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      
      // Track successful contact submission
      trackFormStepComplete(6, "Agent Contact Info Submitted", {
        name: userName,
        phone: userPhone,
        callbackTime: callbackTime,
        zipCode: userZipCode,
        address: userAddress,
      });
      
    } catch (error) {
      console.error('❌ Failed to submit contact info:', error);
      alert("There was an error submitting your information. Please try again.");
    }
  };

  // Handle view reviews action
  const handleViewReviews = async () => {
    trackFormStepComplete(4, "Agent Review - View Other Reviews", {
      zipCode: userZipCode,
      address: userAddress,
    });
    
    // Check if we have pre-loaded data or if we timed out
    if (agentReportReady && agentReportData) {
      console.log('📋 Using pre-loaded agent report data');
      
      const agentListMessage = {
        assistant: 
          "<p class='re-message-text'>" +
          `Great! I've found the top ${agentReportData.agentCount} real estate agents in ${userZipCode}. ` +
          "Here's your personalized agent review list below. You can scroll through to compare their stats, reviews, and specialties." +
          "</p>",
        showAgentList: true
      };
      
      setShowAgentList(true);
      setMessages(prev => [...prev, agentListMessage]);
      
    } else if (agentReportTimeout) {
      console.log('⏰ Agent report timed out, showing timeout message');
      
      const timeoutMessage = {
        assistant: 
          "<p class='re-message-text'>" +
          "Hmmm, it looks like I'm having trouble connecting at the moment. But don't worry - my top recommendation Spencer Gritton is still available to help you! " +
          "He has an excellent track record and would be happy to discuss your needs." +
          "</p>"
      };
      
      setMessages(prev => [...prev, timeoutMessage]);
      
    } else if (loadingAgentReport) {
      console.log('⏳ Agent report still loading, showing loading message');
      
      const loadingMessage = {
        assistant: 
          "<p class='re-message-text'>" +
          "I'm still pulling together the agent reviews for your area. This should just take a moment..." +
          "</p>",
        showLoading: true
      };
      
      setMessages(prev => [...prev, loadingMessage]);
      
      // Poll for completion every 500ms
      const pollInterval = setInterval(() => {
        if (agentReportReady && agentReportData) {
          clearInterval(pollInterval);
          
          const agentListMessage = {
            assistant: 
              "<p class='re-message-text'>" +
              `Perfect! Here are the top ${agentReportData.agentCount} real estate agents in ${userZipCode}.` +
              "</p>",
            showAgentList: true
          };
          
          setShowAgentList(true);
          setMessages(prev => [...prev, agentListMessage]);
          
        } else if (agentReportTimeout) {
          clearInterval(pollInterval);
          
          const timeoutMessage = {
            assistant: 
              "<p class='re-message-text'>" +
              "Hmmm, it looks like I'm having trouble connecting at the moment. But Spencer Gritton is still available to help!" +
              "</p>"
          };
          
          setMessages(prev => [...prev, timeoutMessage]);
        }
      }, 500);
      
      // Clear polling after 35 seconds max
      setTimeout(() => clearInterval(pollInterval), 35000);
      
    } else {
      console.log('🔄 No pre-loaded data, generating now as fallback');
      // Fallback - generate now (shouldn't happen but just in case)
      generateAgentReportBackground(userZipCode);
    }
  };

  // Handle phone number submission
  const handlePhoneSubmit = () => {
    if (!userPhone.trim()) return;
    
    trackFormStepComplete(5, "Agent Review - Phone Number Submitted", {
      zipCode: userZipCode,
      address: userAddress,
      phone: userPhone,
    });
    
    // Add confirmation message
    const confirmationMessage = {
      assistant: "<p class='re-message-text'>Perfect! Spencer will call you within the next hour. Thanks for your interest!</p>",
      isFinal: true
    };
    
    setMessages(prev => [...prev, { user: userPhone }, confirmationMessage]);
    setShowPhoneInput(false);
    
    // Here you would integrate with your notification system to alert Spencer
    console.log("Lead Data for Spencer:", {
      zipCode: userZipCode,
      address: userAddress,
      phone: userPhone,
      source: "Agent Review Chatbot"
    });
  };

  return (
    <div className={`re-page-wrapper ${isFullscreen ? 're-fullscreen' : ''}`}>
      <div className="re-container">
        {/* Left side with headline and content - hide on mobile fullscreen */}
        {!isFullscreen && (
          <div className="re-left-panel">
            <h1 className="re-headline">{headline}</h1>
            <p className="re-subheadline">{subheadline}</p>
          </div>
        )}

        {/* Right side with chat interface */}
        <div className={`re-right-panel ${isFullscreen ? 're-fullscreen-chat' : ''}`}>
          <div className="re-chat-interface">
            {/* Chat header */}
            <div className="re-chat-header">
              <div className="re-header-container">
                <div className="re-header-details">
                  <p className="re-header-title">
                    Real Estate Agent Review Assistant:{" "}
                    <span style={{ color: "#4CAF50", fontWeight: "500" }}>
                      Online
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Chat conversation area */}
            <div className="re-conversation-container">
              <div className="re-conversation-content">
                <div className="re-conversation">
                  {messages?.map((msg, index) => (
                    <div key={index}>
                      {msg.typing ? (
                        <TypingIndicator />
                      ) : (
                        <>
                          {msg.assistant && (
                            <div className="re-bot-message-container">
                              <img
                                className="re-bot-avatar"
                                src={require("../assets/images/helprpfp.png")}
                                alt="Assistant Profile"
                              />
                              <div className="re-bot-content">
                                <div className="re-bot-name">
                                  Agent Review Assistant
                                </div>
                                <div className="re-bot-message">
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: msg?.assistant,
                                    }}
                                  />
                                  
                                  {/* Agent List Display */}
                                  {msg.showAgentList && agentReportData && (
                                    <div className="re-agent-list-container">
                                      <div className="re-agent-list-header">
                                        <h3>Top {agentReportData.agentCount} Real Estate Agents in {agentReportData.zipCode}</h3>
                                        <p>Based on sales volume, reviews, and buyer satisfaction ratings</p>
                                      </div>
                                      
                                      <div className="re-agent-list">
                                        {agentReportData.agents.map((agent, agentIndex) => (
                                          <div key={agent.id} className="re-agent-card">
                                            <div className="re-agent-profile">
                                              <div className="re-agent-rank-circle">
                                                <span className="re-rank-number">#{agent.rank}</span>
                                              </div>
                                              <div className="re-agent-info">
                                                <div className="re-agent-score">
                                                  <span className="re-score-label">HomeSurge.AI Agent Score: {agent.reviewScore}</span>
                                                  <div className="re-score-stars">
                                                    {[1,2,3,4,5].map(star => (
                                                      <span key={star} className={`re-star ${star <= Math.floor(agent.reviewScore) ? 'filled' : ''}`}>
                                                        ⭐
                                                      </span>
                                                    ))}
                                                  </div>
                                                  <span className="re-review-count">({agent.reviewCount} reviews)</span>
                                                </div>
                                                <div className="re-agent-name">{agent.name}</div>
                                                <div className="re-agent-phone">
                                                  <button 
                                                    onClick={() => handleContactAgent(agent.name)}
                                                    className="re-contact-agent-button"
                                                  >
                                                    Contact agent
                                                  </button>
                                                </div>
                                                <div className="re-agent-stats">{agent.salesVolume} | Avg: {agent.avgSalePrice}</div>
                                                <div className="re-agent-brokerage">{agent.brokerage}</div>
                                              </div>
                                            </div>
                                            <div className="re-agent-testimonial">
                                              "{agent.topReview}"
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <div className="re-agent-list-footer">
                                        <p>💡 <strong>Still not sure?</strong> Spencer Gritton (our top recommendation) has helped hundreds of buyers and has a proven track record in your area.</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {msg.showActionButtons && (
                                    <>
                                      <div className="re-action-buttons">
                                        <button
                                          onClick={handleTextSpencer}
                                          className="re-action-button re-text-button"
                                        >
                                          📱 Text Spencer Now to Schedule
                                        </button>
                                        <button
                                          onClick={handleReceiveText}
                                          className="re-action-button re-call-button"
                                        >
                                          📞 Receive a Text from Spencer
                                        </button>
                                      </div>
                                      
                                      {/* Spencer Contact Info Card */}
                                      <div className="re-contact-card">
                                        <div className="re-contact-profile">
                                          <div className="re-contact-image">
                                            <img src={require("../assets/images/spencerpicwhite.jpg")} alt="Spencer - Real Estate Expert" />
                                          </div>
                                          <div className="re-contact-info">
                                            <div className="re-contact-score">
                                              <span className="re-score-label">HomeSurge.AI Agent Score:</span>
                                              <div className="re-score-stars">
                                                <span className="re-star">⭐</span>
                                                <span className="re-star">⭐</span>
                                                <span className="re-star">⭐</span>
                                                <span className="re-star">⭐</span>
                                                <span className="re-star">⭐</span>
                                              </div>
                                            </div>
                                            <div className="re-contact-name">Spencer Gritton</div>
                                            <div className="re-contact-phone">(480) 519-0554</div>
                                            <div className="re-contact-title">NMLS# 407111</div>
                                            <div className="re-contact-agency">HomeSmart Realty Partners</div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <a
                                        onClick={handleViewReviews}
                                        className="re-review-link"
                                        href="#"
                                      >
                                        View other agent reviews first
                                      </a>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          {msg?.user && (
                            <div className="re-user-message">
                              <div className="re-user-content">
                                <div className="re-user-message-bubble">
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: msg?.user,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            {/* Chat input area - Hide once Spencer recommendation appears, unless collecting contact info */}
            {(!messages.some(msg => msg.showActionButtons) || collectingContactInfo) && (
              <div className="re-input-container">
              <div className="re-input-wrapper">
                <div className="re-text-input-box">
                  {showContactForm ? (
                    <div className="re-contact-form">
                      <input
                        type="text"
                        placeholder="Your full name..."
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="re-contact-input"
                      />
                      <input
                        type="tel"
                        placeholder="Your phone number..."
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="re-contact-input"
                      />
                      <select
                        value={callbackTime}
                        onChange={(e) => setCallbackTime(e.target.value)}
                        className="re-contact-select"
                      >
                        <option value="">Preferred callback time</option>
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                        <option value="5:00 PM">5:00 PM</option>
                        <option value="Anytime">Anytime</option>
                      </select>
                      <div className="re-input-actions">
                        <input
                          type="button"
                          value="Submit"
                          onClick={handleContactSubmit}
                          disabled={!userName.trim() || !userPhone.trim()}
                          className="re-send-button"
                        />
                      </div>
                    </div>
                  ) : showPhoneInput ? (
                    <>
                      <input
                        type="tel"
                        placeholder="Enter your phone number..."
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="re-phone-input"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handlePhoneSubmit();
                          }
                        }}
                      />
                      <div className="re-input-actions">
                        <input
                          type="button"
                          value="Submit"
                          onClick={handlePhoneSubmit}
                          disabled={!userPhone}
                          className="re-send-button"
                        />
                      </div>
                    </>
                  ) : showAddressInput ? (
                    <div className="re-address-container">
                      {/* Address suggestions popup */}
                      {showSuggestions && addressSuggestions.length > 0 && (
                        <div className="re-suggestions-popup">
                          {addressSuggestions.map((suggestion, index) => (
                            <div
                              key={suggestion.place_id}
                              className={`re-suggestion-item ${index === 0 ? 're-suggestion-first' : ''}`}
                              onClick={() => handleSuggestionSelect(suggestion)}
                            >
                              <div className="re-suggestion-text">
                                {suggestion.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Address input field */}
                      <input
                        ref={addressInputRef}
                        type="text"
                        placeholder="Start typing your address..."
                        className="re-address-input"
                        autoComplete="off"
                        value={addressInputValue}
                        onChange={(e) => handleAddressInputChange(e.target.value)}
                        onBlur={() => {
                          // Delay hiding to allow click on suggestions
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        onFocus={() => {
                          if (addressInputValue.length >= 3 && addressSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                      />
                   
                    </div>
                  ) : (
                    <>
                      <textarea
                        ref={textareaRef}
                        placeholder={
                          conversationIndex === 0 
                            ? "Enter your zip code..." 
                            : "Type your message..."
                        }
                        value={query}
                        onChange={(e) => setQuery(e.target.value.trimStart())}
                        className="re-textarea"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <div className="re-input-actions">
                        <input
                          type="button"
                          value="Send"
                          onClick={sendMessage}
                          disabled={!query}
                          className="re-send-button"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealEstateChatbot;