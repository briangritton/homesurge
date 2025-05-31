import React, { useState, useEffect, useRef } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import { updateLeadInFirebase } from '../../../services/firebase.js';
import { trackFormStepComplete } from '../../../services/analytics';
import { generateAIValueBoostReport } from '../../../services/openai';
import houseIcon from '../../../assets/images/house-icon.png';
import smallArrow from '../../../assets/images/smallarrow.png';

function AIProcessing() {
  const { formData, nextStep } = useFormContext();
  
  // =========================================================
  // SPLIT TEST NOTE: This entire step is controlled by
  // Position 2 split test logic in AddressForm:
  // A = Show this step, B = Skip directly to Step 3
  // No additional split test logic needed in this component
  // =========================================================
  
  // Scroll to top when component loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // ================= DYNAMIC CONTENT SYSTEM ===================
  // CAMPAIGN-BASED CONTENT - Matches AddressForm campaigns
  // ================= ADD NEW CAMPAIGNS HERE ===================
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
    
    const templates = {
      // ========== CASH/SELLING CAMPAIGNS ==========
      cash: {
        headline: 'Analyzing Your OfferBoost Options...',
        subheadline: 'Our AI is calculating your optimal cash offer and timeline',
        completionText: 'OfferBoost Analysis Complete!',
        estimateLabel: 'OfferBoost Estimate:'
      },
      
      fast: {
        headline: 'Processing Your OfferBoost Request...',
        subheadline: 'Determining the fastest path to close your home',
        completionText: 'OfferBoost Strategy Ready!',
        estimateLabel: 'OfferBoost Estimate:'
      },
      
      sellfast: {
        headline: 'Lightning-Fast OfferBoost Analysis...',
        subheadline: 'Calculating your instant cash offer potential',
        completionText: 'OfferBoost Ready!',
        estimateLabel: 'OfferBoost Estimate:'
      },
      
      // ========== VALUE/IMPROVEMENT CAMPAIGNS ==========
      value: {
        headline: 'AI Value Analysis In Progress...',
        subheadline: 'Discovering hidden value opportunities in your home',
        completionText: 'Value Enhancement Report Ready!',
        estimateLabel: 'ValueBoost Estimate:'
      },
      
      valueboost: {
        headline: 'Finding Maximum Value...',
        subheadline: 'AI is analyzing your property\'s improvement potential',
        completionText: 'ValueBoost Report Complete!',
        estimateLabel: 'ValueBoost Estimate:'
      },
      
      boost: {
        headline: 'Boosting Your Home Value...',
        subheadline: 'Identifying the highest-impact improvements for your property',
        completionText: 'Value Boost Strategy Ready!',
        estimateLabel: 'ValueBoost Estimate:'
      },
      
      equity: {
        headline: 'Unlocking Your Home Equity...',
        subheadline: 'Calculating your maximum equity potential',
        completionText: 'Equity Analysis Complete!',
        estimateLabel: 'ValueBoost Estimate:'
      },
      
      // ========== B SECONDARY CONTENT VARIANTS ==========
      // CASH B - Secondary cash processing content
      cashB2: {
        headline: 'Generating Your Instant Cash Offer...',
        subheadline: 'Advanced AI algorithms are computing your guaranteed offer amount',
        completionText: 'Instant Cash Offer Generated!',
        estimateLabel: 'Instant Cash Estimate:'
      },
      
      // FAST B - Secondary fast processing content
      fastB2: {
        headline: 'Emergency Sale Processing...',
        subheadline: 'Urgent AI analysis for your immediate home sale needs',
        completionText: 'Emergency Sale Plan Ready!',
        estimateLabel: 'Emergency Offer Estimate:'
      },
      
      // SELLFAST B - Secondary sellfast content
      sellfastB2: {
        headline: 'Rapid OfferBoost Calculation...',
        subheadline: 'AI is creating your express sale strategy',
        completionText: 'Express Strategy Complete!',
        estimateLabel: 'Express Offer Estimate:'
      },
      
      // VALUE B - Secondary value processing content
      valueB2: {
        headline: 'Discovering Your Home\'s True Worth...',
        subheadline: 'Deep AI analysis revealing your property\'s maximum market potential',
        completionText: 'True Value Report Generated!',
        estimateLabel: 'True Value Estimate:'
      },
      
      // VALUEBOOST B - Secondary valueboost content
      valueboostB2: {
        headline: 'Optimizing Investment Returns...',
        subheadline: 'AI is calculating maximum ROI renovation strategies',
        completionText: 'Investment Strategy Optimized!',
        estimateLabel: 'Investment Estimate:'
      },
      
      // BOOST B - Secondary boost content
      boostB2: {
        headline: 'Transforming Value Potential...',
        subheadline: 'Revolutionary AI creating your personalized enhancement blueprint',
        completionText: 'Transformation Plan Ready!',
        estimateLabel: 'Transformation Estimate:'
      },
      
      // EQUITY B - Secondary equity content
      equityB2: {
        headline: 'Discovering Hidden Wealth...',
        subheadline: 'AI wealth analysis uncovering untapped property potential',
        completionText: 'Wealth Discovery Complete!',
        estimateLabel: 'Wealth Estimate:'
      },
      
      // ========== DEFAULT FALLBACK (MATCHES CASH THEME) ==========
      default: {
        headline: 'Analyzing Your OfferBoost Options...',
        subheadline: 'Our AI is calculating your optimal cash offer and timeline',
        completionText: 'OfferBoost Analysis Complete!',
        estimateLabel: 'OfferBoost Estimate:'
      }
    };
    
    // Split Test Logic - Check for variant parameter
    const variant = urlParams.get('variant') || urlParams.get('split_test') || localStorage.getItem('assignedVariant') || 'B2OB2';
    
    // Note: AIProcessing step uses step 1 content (for consistency with step theme)
    // Parse variant for step 1 content selection (position 0-1)
    const step1Content = variant.substring(0, 2);  // A1, A2, or B2
    
    console.log('AIProcessing - Using step 1 variant:', {
      full: variant,
      step1Content: step1Content
    });

    // Campaign matching logic with A/B content variants
    if (campaignName) {
      const simplified = campaignName.toLowerCase().replace(/[\s\-_\.]/g, '');
      
      // CASH/SELLING CAMPAIGN MATCHING (Highest priority)
      if (simplified.includes('cash')) return step1Content === 'B2' ? templates.cashB2 : templates.cash;
      if (simplified.includes('sellfast') || simplified.includes('sell_fast')) return step1Content === 'B2' ? templates.sellfastB2 : templates.sellfast;
      if (simplified.includes('fast')) return step1Content === 'B2' ? templates.fastB2 : templates.fast;
      
      // VALUE/IMPROVEMENT CAMPAIGN MATCHING
      if (simplified.includes('valueboost') || simplified.includes('value_boost')) return step1Content === 'B2' ? templates.valueboostB2 : templates.valueboost;
      if (simplified.includes('value')) return step1Content === 'B2' ? templates.valueB2 : templates.value;
      if (simplified.includes('boost')) return step1Content === 'B2' ? templates.boostB2 : templates.boost;
      if (simplified.includes('equity')) return step1Content === 'B2' ? templates.equityB2 : templates.equity;
    }

    return templates.default;
  };
  
  const dynamicContent = getDynamicContent();
  const [processingStep, setProcessingStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  // API-independent animation state
  const [aiReportGenerated, setAiReportGenerated] = useState(false);
  const [melissaDataReceived, setMelissaDataReceived] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [showArrow, setShowArrow] = useState(false);
  const mapContainerRef = useRef(null);
  const animationRef = useRef(null);
  const aiReportRef = useRef(null);
  
  // Steps in the AI processing sequence (reduced for better pacing)
  const processingSteps = [
    'Initializing AI analysis and property scan...',
    'Evaluating current market conditions...',
    'Identifying highest ROI hidden opportunities...',
    'Building customized value boost plan...',
    'Value boost report ready!'
  ];

  // Function to generate AI home enhancement report
  const generateAIReport = async (propertyData) => {
    try {
      console.log('🤖 Starting OpenAI report generation...');
      
      // Prepare property context for AI
      const propertyContext = {
        address: propertyData.street || formData.street,
        estimatedValue: propertyData.apiEstimatedValue || formData.apiEstimatedValue,
        bedrooms: propertyData.bedrooms || formData.bedrooms || '',
        bathrooms: propertyData.bathrooms || formData.bathrooms || '',
        squareFootage: propertyData.finishedSquareFootage || formData.finishedSquareFootage || '',
        potentialIncrease: propertyData.potentialValueIncrease || formData.potentialValueIncrease,
        upgradesNeeded: propertyData.upgradesNeeded || formData.upgradesNeeded || 8
      };

      // Use actual OpenAI API to generate personalized report
      const aiReport = await generateAIValueBoostReport(propertyContext);
      
      console.log('✅ AI report generated successfully');
      
      // Store report in localStorage and formData for Step 3
      localStorage.setItem('aiHomeReport', aiReport);
      
      // Update Firebase with AI report
      const leadId = localStorage.getItem('leadId');
      if (leadId) {
        await updateLeadInFirebase(leadId, {
          aiHomeReport: aiReport,
          aiReportGeneratedAt: new Date().toISOString()
        });
        console.log('✅ AI report saved to Firebase');
      }
      
      setAiReportGenerated(true);
      return aiReport;
      
    } catch (error) {
      console.error('❌ Error generating AI report:', error);
      // Don't block user flow if AI fails
      setAiReportGenerated(true); // Mark as complete to prevent blocking
      return null;
    }
  };


  // Monitor for Melissa API data updates
  useEffect(() => {
    const checkForMelissaData = () => {
      // Check if we have received Melissa API data
      if (formData.apiEstimatedValue && !melissaDataReceived) {
        console.log('📊 Melissa API data detected, triggering AI report generation');
        setMelissaDataReceived(true);
        
        // Trigger AI report generation now that we have property data (fully non-blocking)
        if (!aiReportGenerated && !aiReportRef.current) {
          aiReportRef.current = true; // Prevent duplicate calls
          
          // Run in background - never block user flow
          setTimeout(() => {
            generateAIReport(formData).catch(error => {
              console.warn('🤖 AI report generation failed silently:', error);
              // Silently fail - user flow continues normally
            });
          }, 0);
        }
      }
    };

    // Check initially and set up polling
    checkForMelissaData();
    
    // Poll every 500ms for Melissa data updates
    const interval = setInterval(checkForMelissaData, 500);
    
    return () => clearInterval(interval);
  }, [formData.apiEstimatedValue, melissaDataReceived, aiReportGenerated]);

  // Trigger AI report generation on mount if Melissa data already available
  useEffect(() => {
    // If Melissa data is already available when component mounts, start AI generation (fully non-blocking)
    if (formData.apiEstimatedValue && !aiReportGenerated && !aiReportRef.current) {
      console.log('📊 Melissa data already available, starting AI report generation');
      aiReportRef.current = true;
      setMelissaDataReceived(true);
      
      // Run in background - never block user flow
      setTimeout(() => {
        generateAIReport(formData).catch(error => {
          console.warn('🤖 AI report generation failed silently:', error);
          // Silently fail - user flow continues normally
        });
      }, 0);
    }
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    // Only try to load maps if we have location data
    if (!formData.location || !formData.location.lat || !formData.location.lng) {
      console.log('No location data available for map');
      return;
    }

    // Check if Maps API is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Define callback for when Maps API loads
    window.initGoogleMaps = () => {
      console.log('Google Maps loaded in AIProcessing component');
      initializeMap();
    };

    // Load Maps API if not already loaded
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key missing');
      setMapError(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`;
    script.async = true;
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setMapError(true);
    };
    document.body.appendChild(script);

    return () => {
      // Clean up
      delete window.initGoogleMaps;
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [formData.location]);

  // Function to initialize map
  const initializeMap = () => {
    try {
      if (!mapContainerRef.current || !formData.location) return;

      const { lat, lng } = formData.location;
      const location = new window.google.maps.LatLng(lat, lng);

      // Create map - using same settings as PersonalInfoForm
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: location,
        zoom: 18,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP
        },
        disableDefaultUI: true,
        scrollwheel: false
      });

      // Add custom styles to hide unnecessary UI elements - matching PersonalInfoForm
      const hideLabelsStyle = [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ];

      map.setOptions({ styles: hideLabelsStyle });

      // Add marker at property location - matching PersonalInfoForm
      // Hidden for cleaner appearance during AI processing
      // new window.google.maps.Marker({
      //   position: location,
      //   map: map,
      //   animation: window.google.maps.Animation.DROP
      // });

      setMapLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  };

  // Effect to automatically progress through steps with timing
  useEffect(() => {
    // Calculate timing - faster at start, slower in the middle for realism
    const getStepDuration = (step) => {
      // Middle steps take longer for more realistic analysis appearance
      if (step >= 1 && step <= 3) {
        return 800 + Math.random() * 400; // 0.8-1.2 seconds for middle steps
      } else {
        return 600 + Math.random() * 300; // 0.6-0.9 seconds for other steps
      }
    };

    // Only advance if we haven't reached the end yet
    if (processingStep < processingSteps.length) {
      const timer = setTimeout(() => {
        setProcessingStep(prevStep => prevStep + 1);

        // Update progress percentage
        const newProgress = Math.round((processingStep + 1) / processingSteps.length * 100);
        setProgressPercent(newProgress);

        // When reaching the last step, wait a moment and then proceed to next form step
        if (processingStep === processingSteps.length - 1) {
          setTimeout(() => {
            // Track completion of AI processing step
            trackFormStepComplete(2, 'ValueBoost AI Processing Completed', formData);
            nextStep();
          }, 800);
          
          // 🎨 STYLING DELAY: chagne line to 1000000 for development delay. 
          // setTimeout(() => { nextStep(); }, 600000); // 10 minutes = 600000ms
        }
      }, getStepDuration(processingStep));

      return () => clearTimeout(timer);
    }
  }, [processingStep, processingSteps.length, nextStep]);

  // Note: Removed animated value logic - now only using percentage animation for API independence

  // Animated percentage counting effect (ALWAYS RUNS - API independent)
  useEffect(() => {
    // Always animate percentage regardless of API data
    if (processingStep >= 0) {
      let targetPercentage;
      let duration;
      
      // Define percentage progression based on processing steps
      if (processingStep === 0) {
        targetPercentage = 4;
        duration = 400;
      } else if (processingStep === 1) {
        targetPercentage = 8;
        duration = 500;
      } else if (processingStep === 2) {
        targetPercentage = 12;
        duration = 600;
      } else if (processingStep === 3) {
        targetPercentage = 18;
        duration = 650;
      } else if (processingStep === 4) {
        targetPercentage = 20;
        duration = 700;
      } else if (processingStep === 5) {
        targetPercentage = 24;
        duration = 750;
      } else if (processingStep === 6) {
        targetPercentage = 26;
        duration = 800;
      } else {
        targetPercentage = 28;
        duration = 600;
      }
      
      // Animate to target percentage
      const startPercentage = animatedPercentage;
      const percentageDifference = targetPercentage - startPercentage;
      const startTime = Date.now();
      
      const animatePercentage = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smooth animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentPercentage = Math.round(startPercentage + (percentageDifference * easeProgress));
        
        setAnimatedPercentage(currentPercentage);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animatePercentage);
        }
      };
      
      animationRef.current = requestAnimationFrame(animatePercentage);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [processingStep, animatedPercentage]);

  // Arrow delay effect - show arrow shortly after percentage starts increasing
  useEffect(() => {
    if (animatedPercentage > 0 && !showArrow) {
      const timer = setTimeout(() => {
        setShowArrow(true);
      }, 750);
      
      return () => clearTimeout(timer);
    }
  }, [animatedPercentage, showArrow]);

  // Modern animated scan line effect
  const scanLineStyle = {
    position: 'absolute',
    height: '3px',
    width: '100%',
    background: 'linear-gradient(90deg, transparent 0%, #00b8e6 20%, #0099cc 50%, #00b8e6 80%, transparent 100%)',
    boxShadow: '0 0 20px 4px rgba(0, 184, 230, 0.4), 0 0 40px 8px rgba(0, 184, 230, 0.2)',
    top: `${(processingStep / processingSteps.length) * 100}%`,
    left: 0,
    transition: 'top 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'modernScanGlow 2s ease-in-out infinite alternate',
    zIndex: 10,
    borderRadius: '2px'
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
    <div className="vb-section vb-ai-section">
      <div className="vb-container">
        <div className="vb-content vb-fade-in vb-ai-content">
          <div className="vb-af1-hero-headline af1-hero-headline hero-headline">{dynamicContent.headline}</div>
          
          <div className="vb-af1-hero-subheadline af1-hero-subheadline hero-subheadline vb-ai-subheadline">
            {processingSteps[processingStep] || dynamicContent.completionText}
          </div>
          
          {/* Value display above scanning image */}
          <div className="vb-ai-value-container">
            <div className="vb-ai-value-display">
              {dynamicContent.estimateLabel}
              <br />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                +{animatedPercentage}%
                {animatedPercentage > 0 && showArrow && (
                  <img 
                    src={smallArrow} 
                    alt="value increase" 
                    style={{ 
                      height: '19.2px', 
                      width: 'auto',
                      marginLeft: '2px'
                    }} 
                  />
                )}
              </div>
            </div>
            
            {/* Hidden for now - can be re-enabled later */}
            {/* <div className="vb-ai-value-boost">
              {animatedPercentage > 0 ? (
                `↗ Value boost potential increasing...`
              ) : (
                'Calculating...'
              )}
            </div> */}
          </div>
          
          {/* Processing visualization container */}
          <div className="vb-map-container">
            {/* Always show AI scanning animation background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at center, #f8faff 0%, #e6f3ff 100%)',
              borderRadius: '7px'
            }} />

            {/* Map container (if available) - show as subtle background */}
            {formData.location && formData.location.lat && !mapError && (
              <>
                <div
                  ref={mapContainerRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    borderRadius: '7px',
                    opacity: mapLoaded ? 0.3 : 0 // Make map semi-transparent when loaded
                  }}
                />

                {/* Map loading overlay */}
                {!mapLoaded && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    borderRadius: '7px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '3px solid rgba(0, 102, 204, 0.2)',
                      borderTop: '3px solid #236b6d',
                      animation: 'vb-spin 1s linear infinite'
                    }} />
                    <div style={{
                      marginTop: '10px',
                      fontSize: '14px',
                      color: '#236b6d',
                      fontWeight: 'bold'
                    }}>
                      Loading map view...
                    </div>
                  </div>
                )}
              </>
            )}


            {/* Central pulsing house icon */}
            <div className="vb-ai-house-icon-container">
              <img 
                src={houseIcon} 
                alt="AI analyzing house" 
                className="vb-ai-house-icon"
              />
            </div>

            {/* Swirling orbs - different sizes and speeds */}
            {[
              { size: 8, distance: 60, speed: 4, delay: 0 },
              { size: 6, distance: 80, speed: 6, delay: 1 },
              { size: 10, distance: 45, speed: 5, delay: 2 },
              { size: 4, distance: 100, speed: 7, delay: 0.5 },
              { size: 12, distance: 35, speed: 3, delay: 1.5 },
              { size: 5, distance: 90, speed: 8, delay: 2.5 }
            ].map((orb, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: `${orb.size}px`,
                height: `${orb.size}px`,
                background: `radial-gradient(circle, rgba(0, 184, 230, 0.8) 0%, rgba(35, 107, 109, 0.4) 100%)`,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `aiOrbSwirl${i} ${orb.speed}s linear infinite ${orb.delay}s`,
                boxShadow: `0 0 ${orb.size}px rgba(0, 184, 230, 0.5)`,
                zIndex: 2
              }} />
            ))}

            {/* Thinking particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`particle-${i}`} style={{
                position: 'absolute',
                top: `${45 + Math.sin(i * 0.5) * 15}%`,
                left: `${45 + Math.cos(i * 0.5) * 15}%`,
                width: '2px',
                height: '2px',
                backgroundColor: '#00b8e6',
                borderRadius: '50%',
                animation: `aiParticleFloat 2s ease-in-out infinite ${i * 0.2}s`,
                opacity: 0.7
              }} />
            ))}

            {/* Ripple effects */}
            {[1, 2, 3].map((ring, i) => (
              <div key={`ripple-${i}`} style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: `${ring * 60}px`,
                height: `${ring * 60}px`,
                border: '1px solid rgba(0, 184, 230, 0.2)',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `aiRipple 4s ease-out infinite ${i * 0.8}s`,
                pointerEvents: 'none'
              }} />
            ))}
            
            {/* Animated scan line */}
            <div style={scanLineStyle}></div>
            
            {/* Data points animation - fewer dots with alternation */}
            {Array.from({ length: 8 }).map((_, i) => {
              const isActive = processingStep > i/2;
              const animationDelay = (i % 3) * 1; // Stagger the animations
              return isActive ? (
                <div 
                  key={i} 
                  className="vb-ai-data-point"
                  style={{
                    left: `${Math.random() * 85 + 7.5}%`,
                    top: `${Math.random() * 85 + 7.5}%`,
                    animationDelay: `${animationDelay}s`
                  }} 
                />
              ) : null;
            })}
          </div>
          
          {/* Modern progress bar */}
          <div className="vb-ai-progress-container">
            <div className="vb-ai-progress-bar" style={{ width: `${progressPercent}%` }}>
              <div className="vb-ai-progress-shimmer" />
            </div>
          </div>
          
          {/* Modern step indicators */}
          <div className="vb-ai-step-indicators">
            {processingSteps.map((_, index) => {
              const isCompleted = processingStep > index;
              const isCurrent = processingStep === index;
              
              const dotClass = isCompleted ? 'vb-ai-step-dot-completed' :
                              isCurrent ? 'vb-ai-step-dot-current' :
                              'vb-ai-step-dot-pending';
              
              return (
                <div
                  key={index}
                  className={`vb-ai-step-dot ${dotClass}`}
                />
              );
            })}
          </div>
          
          <div className="vb-ai-property-details">
            {formData.street && 
              <p>Analyzing property data for: <br /><strong>{formData.street}</strong></p>
            }
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default AIProcessing;