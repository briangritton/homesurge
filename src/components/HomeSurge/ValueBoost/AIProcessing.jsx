import React, { useState, useEffect, useRef } from 'react';
import { useFormContext } from '../../../contexts/FormContext';

function AIProcessing() {
  const { formData, nextStep } = useFormContext();
  const [processingStep, setProcessingStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(formData.apiEstimatedValue || 554000);
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
        return 1000 + Math.random() * 1000; // 1-2 seconds for middle steps
      } else {
        return 600 + Math.random() * 400; // 0.6-1 second for other steps
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
        }
      }, getStepDuration(processingStep));

      return () => clearTimeout(timer);
    }
  }, [processingStep, processingSteps.length, nextStep]);

  // Animated value counting effect - realistic staged increments
  useEffect(() => {
    // Start animation from step 0 (immediately when component loads)
    if (processingStep >= 0) {
      // Use dummy values if no API values are available
      const startValue = formData.apiEstimatedValue || 554000; // Dummy value from first step
      const valueIncrease = formData.potentialValueIncrease || 121880; // Dummy increase from first step
      const endValue = startValue + valueIncrease;
      
      // Define realistic value progression based on processing steps
      // Start at current value and increment to new total
      let targetValue;
      let duration;
      
      if (processingStep < 4) {
        // Steps 0-3: Just maintain the starting value, no animation needed
        return;
      } else if (processingStep === 4) {
        // Start identifying improvements - small incremental increase
        targetValue = startValue + Math.round(valueIncrease * 0.15);
        duration = 1500;
      } else if (processingStep === 5) {
        // Calculating potential - more significant increase
        targetValue = startValue + Math.round(valueIncrease * 0.45);
        duration = 1800;
      } else if (processingStep === 6) {
        // Building plan - further increase
        targetValue = startValue + Math.round(valueIncrease * 0.75);
        duration = 1500;
      } else if (processingStep === 7) {
        // Finalizing - nearly complete
        targetValue = startValue + Math.round(valueIncrease * 0.95);
        duration = 1200;
      } else {
        // Complete - full value
        targetValue = endValue;
        duration = 800;
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

      // For steps before 4, no animation needed
      if (processingStep < 4) {
        return;
      }
      
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
    <div className="vb-section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="vb-container">
        <div className="vb-content vb-fade-in" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div className="vb-af1-hero-headline af1-hero-headline hero-headline">AI Home Analysis in Progress</div>
          
          <div className="vb-af1-hero-subheadline af1-hero-subheadline hero-subheadline" style={{ 
            marginTop: '10px', 
            marginBottom: '5px',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {processingSteps[processingStep] || 'Analysis complete!'}
          </div>
          
          {/* Value display above scanning image */}
          <div style={{ marginTop: '0px', marginBottom: '20px' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #00b8e6 0%, #236b6d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '10px 0',
              letterSpacing: '0.5px'
            }}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(animatedValue)}
            </div>
            
            <div style={{ fontSize: '14px', color: '#00b8e6', fontWeight: 'bold' }}>
              {animatedValue > (formData.apiEstimatedValue || 554000) ? (
                `↗ Value boost: +${new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(animatedValue - (formData.apiEstimatedValue || 554000))}`
              ) : (
                'ValueBoost: Calculating'
              )}
            </div>
          </div>
          
          {/* Processing visualization container */}
          <div className="vb-map-container">
            {/* Satellite Map container */}
            {formData.location && formData.location.lat && !mapError ? (
              <>
                {/* Map container */}
                <div
                  ref={mapContainerRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    borderRadius: '7px' // Slightly smaller to avoid edge bleed
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

                {/* Property analysis overlay effect - more subtle to match street view */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.1) 100%)',
                  zIndex: 2,
                  pointerEvents: 'none',
                  borderRadius: '7px'
                }} />
              </>
            ) : (
              <>
                {/* AI thinking background */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at center, #f8faff 0%, #e6f3ff 100%)',
                  borderRadius: '7px'
                }} />

                {/* Central AI core */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '40px',
                  height: '40px',
                  background: 'radial-gradient(circle, #00b8e6 0%, #236b6d 100%)',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: 'aiCorePulse 3s ease-in-out infinite',
                  boxShadow: '0 0 20px rgba(0, 184, 230, 0.6)',
                  zIndex: 3
                }} />

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
              </>
            )}
            
            {/* Animated scan line */}
            <div style={scanLineStyle}></div>
            
            {/* Data points animation - fewer dots with alternation */}
            {Array.from({ length: 8 }).map((_, i) => {
              const isActive = processingStep > i/2;
              const animationDelay = (i % 3) * 1; // Stagger the animations
              return isActive ? (
                <div key={i} style={{
                  position: 'absolute',
                  left: `${Math.random() * 85 + 7.5}%`,
                  top: `${Math.random() * 85 + 7.5}%`,
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#00b8e6',
                  opacity: 0,
                  zIndex: 5,
                  animation: `dotFadeInOut 4s ease-in-out infinite ${animationDelay}s`
                }} />
              ) : null;
            })}
          </div>
          
          {/* Modern progress bar */}
          <div style={{
            width: '88%',
            maxWidth: '450px',
            margin: '0 auto 25px',
            height: '6px',
            backgroundColor: 'rgba(46, 123, 125, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00b8e6 0%, #236b6d 50%, #00b8e6 100%)',
              borderRadius: '3px',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              width: `${progressPercent}%`,
              boxShadow: '0 0 15px 2px rgba(0, 184, 230, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                animation: 'progressShimmer 2s infinite'
              }} />
            </div>
          </div>
          
          {/* Modern step indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {processingSteps.map((_, index) => {
              const isCompleted = processingStep > index;
              const isCurrent = processingStep === index;
              const isPending = processingStep < index;
              
              return (
                <div
                  key={index}
                  style={{
                    width: isCurrent ? '16px' : '8px',
                    height: '8px',
                    borderRadius: isCurrent ? '8px' : '50%',
                    backgroundColor: isCompleted ? '#00b8e6' : isCurrent ? '#236b6d' : '#e0e0e0',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isPending ? 0.5 : 1,
                    boxShadow: isCurrent ? '0 0 12px 2px rgba(46, 123, 125, 0.4)' : 
                              isCompleted ? '0 0 8px 1px rgba(0, 184, 230, 0.3)' : 'none',
                    transform: isCurrent ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
              );
            })}
          </div>
          
          <div style={{ fontSize: '16px', color: '#555', maxWidth: '500px', margin: '0 auto' }}>
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