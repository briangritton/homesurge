import React, { useState, useEffect, useRef } from 'react';
import { useFormContext } from '../../../contexts/FormContext';

function AIProcessing() {
  const { formData, nextStep } = useFormContext();
  const [processingStep, setProcessingStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapContainerRef = useRef(null);
  
  // Steps in the AI processing sequence
  const processingSteps = [
    'Initializing AI analysis...',
    'Loading property data...',
    'Evaluating current market conditions...',
    'Analyzing nearby comparable properties...',
    'Identifying highest ROI improvements...',
    'Calculating potential value increase...',
    'Building customized value boost plan...',
    'Finalizing AI recommendations...',
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

  // Animated scan line effect
  const scanLineStyle = {
    position: 'absolute',
    height: '4px',
    width: '100%',
    backgroundColor: '#3fccff',
    boxShadow: '0 0 15px 3px rgba(63, 204, 255, 0.8)',
    top: `${(processingStep / processingSteps.length) * 100}%`,
    left: 0,
    transition: 'top 0.5s ease-in-out',
    animation: 'vb-scanGlow 1.5s infinite alternate',
    zIndex: 10 // Make sure scan line is on top of everything
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
          <div className="vb-headline">AI Home Analysis in Progress</div>
          
          <div style={{ marginTop: '20px', marginBottom: '30px' }}>
            <strong style={{ fontSize: '18px' }}>{processingSteps[processingStep] || 'Processing complete!'}</strong>
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
                      borderTop: '3px solid #2e7b7d',
                      animation: 'vb-spin 1s linear infinite'
                    }} />
                    <div style={{
                      marginTop: '10px',
                      fontSize: '14px',
                      color: '#2e7b7d',
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
                {/* Fallback "House blueprint" background */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 20 0 L 0 0 0 20\' fill=\'none\' stroke=\'%23e0e0e0\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\' /%3E%3C/svg%3E")',
                  opacity: 0.4
                }} />

                {/* House icon in center */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '80px',
                  color: '#555',
                  opacity: 0.3
                }}>
                  🏠
                </div>
              </>
            )}
            
            {/* Animated scan line */}
            <div style={scanLineStyle}></div>
            
            {/* Data points animation - using the original static dots style */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: processingStep > i/3 ? '#4caf50' : '#aaa',
                opacity: processingStep > i/3 ? 0.8 : 0.3,
                transition: 'background-color 0.5s ease, opacity 0.5s ease',
                transform: `scale(${processingStep > i/3 ? 1 : 0.5})`,
                zIndex: 5
              }} />
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="vb-progress-container">
            <div className="vb-progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
          
          {/* Step indicators */}
          <div className="vb-step-indicators">
            {processingSteps.map((_, index) => (
              <div
                key={index}
                className={
                  processingStep > index
                    ? 'vb-indicator vb-indicator-completed'
                    : processingStep === index
                      ? 'vb-indicator vb-indicator-current'
                      : 'vb-indicator vb-indicator-pending'
                }
              />
            ))}
          </div>
          
          <div style={{ fontSize: '16px', color: '#555', maxWidth: '500px', margin: '0 auto' }}>
            {formData.street && 
              <p>Analyzing property data for: <br /><strong>{formData.street}</strong></p>
            }
            
            {formData.apiEstimatedValue ? (
              <p>Current estimated value: <strong>{formData.formattedApiEstimatedValue}</strong></p>
            ) : (
              <p>Retrieving property details...</p>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default AIProcessing;