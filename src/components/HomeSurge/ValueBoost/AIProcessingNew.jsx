/**
 * AIProcessing Component (Rewritten)
 * Clean, simplified implementation using service layer
 */

import React, { useState, useEffect, useRef } from 'react';
import { useFormContext } from '../../../contexts/FormContext';
import { trackingService } from '../../../services/trackingService';
import { templateService } from '../../../services/templateEngine';
import houseIcon from '../../../assets/images/house-icon.png';
import smallArrow from '../../../assets/images/smallarrow.png';

function AIProcessing({ campaign, variant }) {
  // ===== FORM CONTEXT =====
  const { formData, nextStep } = useFormContext();
  
  // ===== STATE (Minimal) =====
  const [processingStep, setProcessingStep] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [showArrow, setShowArrow] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  // ===== REFS =====
  const mapContainerRef = useRef(null);
  const animationRef = useRef(null);
  
  // ===== DYNAMIC CONTENT =====
  const dynamicContent = templateService.getTemplate(campaign, variant, 'aiprocessing');
  
  // ===== PROCESSING STEPS =====
  const processingSteps = [
    'Initializing AI analysis and property scan...',
    'Evaluating current market conditions...',
    'Identifying highest ROI hidden opportunities...',
    'Building customized value boost plan...',
    dynamicContent.completionText || 'Value boost report ready!'
  ];

  // ===== AUTO SCROLL =====
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ===== GOOGLE MAPS INITIALIZATION =====
  useEffect(() => {
    if (!formData.location?.lat || !formData.location?.lng) {
      console.log('No location data available for map');
      return;
    }

    if (window.google?.maps) {
      initializeMap();
      return;
    }

    // Setup Maps API loading
    window.initGoogleMaps = () => {
      console.log('Google Maps loaded in AIProcessing');
      initializeMap();
    };

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key missing');
      setMapError(true);
      return;
    }

    if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps&libraries=places`;
      script.onerror = () => setMapError(true);
      document.head.appendChild(script);
    }
  }, [formData.location]);

  const initializeMap = () => {
    if (!mapContainerRef.current || !formData.location) return;

    try {
      const location = { 
        lat: formData.location.lat, 
        lng: formData.location.lng 
      };

      const map = new window.google.maps.Map(mapContainerRef.current, {
        zoom: 16,
        center: location,
        disableDefaultUI: true,
        gestureHandling: 'none',
        zoomControl: false,
        clickableIcons: false,
        keyboardShortcuts: false
      });

      // Simplified map styling
      const mapStyles = [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] }
      ];

      map.setOptions({ styles: mapStyles });
      setMapLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  };

  // ===== PROCESSING ANIMATION =====
  useEffect(() => {
    if (processingStep >= processingSteps.length) return;

    const getStepDuration = (step) => {
      // Variable timing for realism
      return step >= 1 && step <= 3 ? 800 + Math.random() * 400 : 600 + Math.random() * 300;
    };

    const timer = setTimeout(() => {
      setProcessingStep(prevStep => prevStep + 1);

      // Final step - proceed to next component
      if (processingStep === processingSteps.length - 1) {
        setTimeout(() => {
          trackingService.trackProcessingComplete(formData, 'ValueBoost AI Processing');
          nextStep();
        }, 800);
      }
    }, getStepDuration(processingStep));

    return () => clearTimeout(timer);
  }, [processingStep, processingSteps.length, nextStep, formData]);

  // ===== PERCENTAGE ANIMATION =====
  useEffect(() => {
    if (processingStep < 0) return;

    // Define progression targets
    const progressionMap = {
      0: { target: 4, duration: 400 },
      1: { target: 8, duration: 500 },
      2: { target: 12, duration: 600 },
      3: { target: 18, duration: 650 },
      4: { target: 22, duration: 700 }
    };

    const config = progressionMap[processingStep] || { target: 22, duration: 600 };
    const startPercentage = animatedPercentage;
    const percentageDifference = config.target - startPercentage;
    const startTime = Date.now();

    const animatePercentage = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / config.duration, 1);
      
      // Smooth easing
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
  }, [processingStep, animatedPercentage]);

  // ===== ARROW REVEAL =====
  useEffect(() => {
    if (animatedPercentage > 0 && !showArrow) {
      const timer = setTimeout(() => setShowArrow(true), 750);
      return () => clearTimeout(timer);
    }
  }, [animatedPercentage, showArrow]);

  // ===== RENDER =====
  return (
    <div className="vb-ai-container">
      {/* Content Section */}
      <div className="vb-ai-content">
        <div className="vb-ai-headline">
          {dynamicContent.headline}
        </div>
        
        <div className="vb-ai-subheadline">
          {processingSteps[processingStep] || dynamicContent.completionText}
        </div>
        
        {/* Value Display */}
        <div className="vb-ai-value-container">
          <div className="vb-ai-value-display">
            {dynamicContent.estimateLabel}
            <br />
            <div className="vb-ai-percentage-container">
              +{animatedPercentage}%
              {animatedPercentage > 0 && showArrow && (
                <img 
                  src={smallArrow} 
                  alt="value increase" 
                  className="vb-ai-arrow"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Processing Visualization */}
      <div className="vb-ai-processing-container">
        {/* Background */}
        <div className="vb-ai-background" />

        {/* Map Container (if available) */}
        {formData.location?.lat && !mapError && (
          <>
            <div
              ref={mapContainerRef}
              className={`vb-ai-map ${mapLoaded ? 'vb-ai-map-loaded' : ''}`}
            />
            
            {!mapLoaded && (
              <div className="vb-ai-map-loading">
                <div className="vb-ai-loading-spinner" />
                <div className="vb-ai-loading-text">Loading map view...</div>
              </div>
            )}
          </>
        )}

        {/* Central House Icon */}
        <div className="vb-ai-house-container">
          <img 
            src={houseIcon} 
            alt="AI analyzing house" 
            className="vb-ai-house-icon"
          />
        </div>

        {/* Animated Orbs */}
        <div className="vb-ai-orbs">
          {[
            { size: 'small', distance: 60, speed: 4, delay: 0 },
            { size: 'medium', distance: 80, speed: 6, delay: 1 },
            { size: 'large', distance: 45, speed: 5, delay: 2 },
            { size: 'tiny', distance: 100, speed: 7, delay: 0.5 },
            { size: 'extra-large', distance: 35, speed: 3, delay: 1.5 }
          ].map((orb, index) => (
            <div
              key={index}
              className={`vb-ai-orb vb-ai-orb-${orb.size}`}
              style={{
                animationDuration: `${orb.speed}s`,
                animationDelay: `${orb.delay}s`,
                '--orb-distance': `${orb.distance}px`
              }}
            />
          ))}
        </div>

        {/* Scanning Line Effect */}
        <div 
          className="vb-ai-scan-line"
          style={{
            top: `${(processingStep / processingSteps.length) * 100}%`
          }}
        />

        {/* Particle Effects */}
        <div className="vb-ai-particles">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="vb-ai-particle"
              style={{
                animationDelay: `${i * 0.2}s`,
                left: `${10 + (i * 10)}%`
              }}
            />
          ))}
        </div>

        {/* Ripple Effects */}
        <div className="vb-ai-ripples">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="vb-ai-ripple"
              style={{
                animationDelay: `${i * 0.8}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIProcessing;