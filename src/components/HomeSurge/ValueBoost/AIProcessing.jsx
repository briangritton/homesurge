import React, { useState, useEffect, useRef } from 'react';
import { useFormContext } from '../../../contexts/FormContext';

function AIProcessing() {
  const { formData, nextStep } = useFormContext();
  const [processingStep, setProcessingStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapContainerRef = useRef(null);
  const streetViewContainerRef = useRef(null);
  
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

      // Create map
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: location,
        zoom: 17,
        mapTypeId: 'hybrid',
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      });

      // Add marker
      new window.google.maps.Marker({
        position: location,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 8
        }
      });

      // Try to load Street View in parallel
      initializeStreetView(location);

      setMapLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  };

  // Function to initialize Street View
  const initializeStreetView = (location) => {
    if (!streetViewContainerRef.current) return;

    const panorama = new window.google.maps.StreetViewPanorama(
      streetViewContainerRef.current, {
        position: location,
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        addressControl: false,
        linksControl: false,
        panControl: false,
        enableCloseButton: false,
        zoomControl: false,
        fullscreenControl: false
      }
    );

    // Check if Street View imagery exists
    const streetViewService = new window.google.maps.StreetViewService();
    streetViewService.getPanorama({ location, radius: 50 }, (data, status) => {
      if (status === "OK") {
        console.log('Street View available for location');
        setShowStreetView(true);
      } else {
        console.log('No Street View imagery found for location');
        setShowStreetView(false);
      }
    });
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
    animation: 'scanGlow 1.5s infinite alternate',
    zIndex: 10 // Make sure scan line is on top of everything
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

  return (
    <div className="hero-section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="hero-middle-container">
        <div className="hero-content fade-in" style={{ textAlign: 'center' }}>
          <div className="hero-headline">AI Home Analysis in Progress</div>
          
          <div style={{ marginTop: '20px', marginBottom: '30px' }}>
            <strong style={{ fontSize: '18px' }}>{processingSteps[processingStep] || 'Processing complete!'}</strong>
          </div>
          
          {/* Processing visualization container */}
          <div style={{
            position: 'relative',
            height: '350px',
            width: '90%',
            maxWidth: '500px',
            margin: '0 auto 30px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            backgroundColor: '#f9f9f9',
            overflow: 'hidden'
          }}>
            {/* Map or Street View container */}
            {formData.location && formData.location.lat && !mapError ? (
              <>
                {/* Street View container - conditionally visible */}
                <div
                  ref={streetViewContainerRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                    opacity: showStreetView ? 1 : 0,
                    visibility: showStreetView ? 'visible' : 'hidden',
                    transition: 'opacity 0.5s ease-in-out'
                  }}
                />

                {/* Map container - always visible if Street View not available */}
                <div
                  ref={mapContainerRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1
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
                    flexDirection: 'column'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '3px solid rgba(63, 204, 255, 0.3)',
                      borderTop: '3px solid #3fccff',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <div style={{
                      marginTop: '10px',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      Loading property view...
                    </div>
                  </div>
                )}
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
            
            {/* Data points animation */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: processingStep > i/4 ? '#4caf50' : '#007bff',
                opacity: processingStep > i/4 ? 0.8 : 0.3,
                transition: 'background-color 0.5s ease, opacity 0.5s ease',
                transform: `scale(${processingStep > i/4 ? 1 : 0.5})`,
                zIndex: 5,
                boxShadow: processingStep > i/4 ? '0 0 8px rgba(76, 175, 80, 0.6)' : 'none'
              }} />
            ))}
          </div>
          
          {/* Progress bar */}
          <div style={{ 
            width: '90%', 
            maxWidth: '500px', 
            margin: '0 auto 20px',
            height: '10px',
            backgroundColor: '#e0e0e0',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              backgroundColor: '#4caf50',
              transition: 'width 0.3s ease-in-out',
              borderRadius: '5px'
            }} />
          </div>
          
          {/* Step indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            {processingSteps.map((_, index) => (
              <div key={index} style={getCircleStyle(index)} />
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
      
      {/* Add CSS for animation */}
      <style jsx="true">{`
        @keyframes scanGlow {
          0% { opacity: 0.6; box-shadow: 0 0 10px 2px rgba(63, 204, 255, 0.5); }
          100% { opacity: 1; box-shadow: 0 0 20px 5px rgba(63, 204, 255, 0.9); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.7; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AIProcessing;