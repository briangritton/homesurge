/**
 * AIProcessing Component (Rewritten to match original structure)
 * Uses exact original CSS classes and structure
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
  
  // ===== STATE =====
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
  const initializeMap = () => {
    if (!formData.location?.lat || !formData.location?.lng || !window.google) {
      setMapError(true);
      return;
    }

    try {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: formData.location.lat, lng: formData.location.lng },
        zoom: 18,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        gestureHandling: 'none',
        draggable: false,
        scrollwheel: false,
        styles: [
          {
            featureType: 'all',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      const marker = new window.google.maps.Marker({
        position: { lat: formData.location.lat, lng: formData.location.lng },
        map: map,
        icon: {
          url: houseIcon,
          scaledSize: new window.google.maps.Size(30, 30)
        }
      });

      setTimeout(() => setMapLoaded(true), 1000);
    } catch (error) {
      console.error('Map initialization failed:', error);
      setMapError(true);
    }
  };

  useEffect(() => {
    const checkGoogleAPI = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        setTimeout(checkGoogleAPI, 500);
      }
    };
    
    checkGoogleAPI();
  }, [formData.location]);

  // ===== PROCESSING ANIMATION =====
  useEffect(() => {
    let stepTimer;
    let percentageTimer;
    
    const startProcessing = () => {
      // Step progression
      stepTimer = setInterval(() => {
        setProcessingStep(current => {
          if (current < processingSteps.length - 1) {
            return current + 1;
          } else {
            clearInterval(stepTimer);
            // Navigate to next step after completion
            setTimeout(() => {
              trackingService.trackEvent('AI Processing Complete', { 
                campaign, 
                variant,
                finalStep: processingSteps[processingSteps.length - 1]
              });
              nextStep();
            }, 2000);
            return current;
          }
        });
      }, 2000);

      // Percentage animation
      let currentPercentage = 0;
      percentageTimer = setInterval(() => {
        currentPercentage += Math.random() * 3 + 1;
        if (currentPercentage >= 22) {
          currentPercentage = 22;
          setShowArrow(true);
          clearInterval(percentageTimer);
        }
        setAnimatedPercentage(Math.floor(currentPercentage));
      }, 200);
    };

    const timer = setTimeout(startProcessing, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(stepTimer);
      clearInterval(percentageTimer);
    };
  }, [campaign, variant, nextStep, processingSteps]);

  // Calculate progress percentage
  const progressPercent = ((processingStep + 1) / processingSteps.length) * 100;

  // ===== RENDER =====
  return (
    <div className="vb-section vb-ai-section">
      <div className="vb-container">
        <div className="vb-content vb-fade-in vb-ai-content">
          
          {/* HEADLINE SECTION - Using original class names */}
          <div className="vb-af1-hero-headline af1-hero-headline hero-headline">
            {dynamicContent.headline}
          </div>

          <div className="vb-af1-hero-subheadline af1-hero-subheadline hero-subheadline vb-ai-subheadline">
            {processingSteps[processingStep] || dynamicContent.completionText}
          </div>

          {/* VALUE DISPLAY SECTION */}
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
          </div>

          {/* MAP CONTAINER AND VISUAL EFFECTS */}
          <div className="vb-map-container">
            {/* Background gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at center, #f8faff 0%, #e6f3ff 100%)',
              borderRadius: '7px'
            }} />

            {/* Google Maps container (conditional) */}
            {formData.location && formData.location.lat && !mapError && (
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
                  opacity: mapLoaded ? 0.3 : 0
                }}
              />
            )}

            {/* House icon container */}
            <div className="vb-ai-house-icon-container">
              <img 
                src={houseIcon} 
                alt="AI analyzing house" 
                className="vb-ai-house-icon"
              />
            </div>

            {/* Animated data points */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="vb-ai-data-point"
                style={{
                  position: 'absolute',
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                  animation: `pulse 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>

          {/* PROGRESS BAR */}
          <div className="vb-ai-progress-container">
            <div className="vb-ai-progress-bar" style={{ width: `${progressPercent}%` }}>
              <div className="vb-ai-progress-shimmer" />
            </div>
          </div>

          {/* STEP INDICATORS */}
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

          {/* PROPERTY DETAILS */}
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