import React, { useState, useEffect, useRef } from 'react';
import { useFormContext } from '../../../contexts/FormContext';

function AIProcessing() {
  const { formData, nextStep } = useFormContext();
  const [processingStep, setProcessingStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  // TESTING TOGGLE: Set to true to enable dummy fallback values for step 2
  const ENABLE_DUMMY_FALLBACK = false; // Set to true for testing
  const fallbackValue = ENABLE_DUMMY_FALLBACK ? 554000 : 0;
  
  const [animatedValue, setAnimatedValue] = useState(formData.apiEstimatedValue ? Number(formData.apiEstimatedValue) : fallbackValue);
  const mapContainerRef = useRef(null);
  const animationRef = useRef(null);
  
  // Steps in the AI processing sequence
  const processingSteps = [
    'Initializing AI analysis and property scan...',
    'Loading property data and market information...',
    'Evaluating current market conditions...',
    'Analyzing nearby comparable properties...',
    'Identifying highest ROI improvement opportunities...',
    'Calculating potential value increase from improvements...',
    'Building customized value boost plan...',
    'Finalizing AI recommendations and strategies...',
    'Value boost report ready!'
  ];

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
      new window.google.maps.Marker({
        position: location,
        map: map,
        animation: window.google.maps.Animation.DROP
      });

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
      if (step >= 2 && step <= 5) {
        return 1000 + Math.random() * 500; // 1-1.5 seconds for middle steps
      } else {
        return 750 + Math.random() * 250; // 0.75-1 seconds for other steps
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
            nextStep();
          }, 1000);
          
          // 🎨 STYLING DELAY: chagne line to 1000000 for development delay. 
          // setTimeout(() => { nextStep(); }, 600000); // 10 minutes = 600000ms
        }
      }, getStepDuration(processingStep));

      return () => clearTimeout(timer);
    }
  }, [processingStep, processingSteps.length, nextStep]);

  // Animated value counting effect - realistic staged increments
  useEffect(() => {
    // Start animation from step 0 (immediately when component loads)
    if (processingStep >= 0) {
      // Use real API values if available, otherwise use fallback values - convert to numbers
      const startValue = formData.apiEstimatedValue ? Number(formData.apiEstimatedValue) : fallbackValue;
      const valueIncrease = formData.potentialValueIncrease ? Number(formData.potentialValueIncrease) : (ENABLE_DUMMY_FALLBACK ? 121880 : 0);
      const endValue = startValue + valueIncrease;
      
      // Debug logging
      console.log('AIProcessing Debug:', {
        rawApiValue: formData.apiEstimatedValue,
        rawValueIncrease: formData.potentialValueIncrease,
        startValue,
        valueIncrease,
        endValue,
        processingStep
      });
      
      // Define realistic value progression based on processing steps
      // Start at current value and increment to new total
      let targetValue;
      let duration;
      
      if (processingStep === 0) {
        // Step 0: Start with small increase immediately
        targetValue = startValue + Math.round(valueIncrease * 0.05);
        duration = 400;
      } else if (processingStep === 1) {
        // Step 1: More increase
        targetValue = startValue + Math.round(valueIncrease * 0.15);
        duration = 500;
      } else if (processingStep === 2) {
        // Step 2: Continued growth
        targetValue = startValue + Math.round(valueIncrease * 0.30);
        duration = 600;
      } else if (processingStep === 3) {
        // Step 3: Accelerating
        targetValue = startValue + Math.round(valueIncrease * 0.50);
        duration = 650;
      } else if (processingStep === 4) {
        // Step 4: Strong growth
        targetValue = startValue + Math.round(valueIncrease * 0.65);
        duration = 600;
      } else if (processingStep === 5) {
        // Step 5: Major progress
        targetValue = startValue + Math.round(valueIncrease * 0.80);
        duration = 550;
      } else if (processingStep === 6) {
        // Step 6: Nearly complete
        targetValue = startValue + Math.round(valueIncrease * 0.95);
        duration = 500;
      } else if (processingStep === 7) {
        // Step 7: Final approach
        targetValue = startValue + Math.round(valueIncrease * 0.98);
        duration = 400;
      } else {
        // Complete - full value
        targetValue = endValue;
        duration = 300;
      }
      
      const startTime = Date.now();
      const currentStart = animatedValue; // Start from current animated value

      const animateValue = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easeOutCubic for more natural feel
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Animate from current value to target value in realistic increments
        const currentValue = currentStart + (targetValue - currentStart) * easeProgress;
        // Use a fixed irregular increment for this animation cycle (set once per step)
        const irregularIncrement = 4900; // Fixed at $4,900 for more realistic feel
        const roundedValue = Math.round(currentValue / irregularIncrement) * irregularIncrement;
        setAnimatedValue(roundedValue);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateValue);
        }
      };

      // Start the animation with a small delay for natural feel
      const timer = setTimeout(() => {
        animationRef.current = requestAnimationFrame(animateValue);
      }, 200);
      
      return () => {
        clearTimeout(timer);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [processingStep, formData.apiEstimatedValue, formData.potentialValueIncrease]);

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

  // Map container styles - matching PersonalInfoForm style
  const mapStyles = {
    height: '300px',
    width: '90%',
    maxWidth: '500px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    margin: '0 auto 30px',
    position: 'relative' // Important for absolute positioning inside
  };

  // Circle indicators for steps
  const getCircleStyle = (index) => {
    return {
      height: '12px',
      width: '12px',
      borderRadius: '50%',
      backgroundColor: processingStep > index ? '#4caf50' : 
                       processingStep === index ? '#3fccff' : '#e0e0e0',
      margin: '2px',
      transition: 'background-color 0.3s ease',
      boxShadow: processingStep === index ? '0 0 10px 2px rgba(63, 204, 255, 0.7)' : 'none'
    };
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
          <div className="vb-af1-hero-headline af1-hero-headline hero-headline">Finding Maximum Value...</div>
          
          <div className="vb-af1-hero-subheadline af1-hero-subheadline hero-subheadline vb-ai-subheadline">
            {processingSteps[processingStep] || '32 Point AI Home Scan Complete!'}
          </div>
          
          {/* Value display above scanning image */}
          <div className="vb-ai-value-container">
            <div className="vb-ai-value-display">
              ValueBoost Estimate:
              <br />
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(animatedValue)}
            </div>
            
            <div className="vb-ai-value-boost">
              {animatedValue > (formData.apiEstimatedValue ? Number(formData.apiEstimatedValue) : fallbackValue) ? (
                `↗ Value boost: +${new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(animatedValue - (formData.apiEstimatedValue ? Number(formData.apiEstimatedValue) : fallbackValue))}`
              ) : (
                'ValueBoost: Calculating'
              )}
            </div>
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
              const isPending = processingStep < index;
              
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