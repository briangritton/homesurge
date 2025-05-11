import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../../contexts/FormContext';

function AIProcessing() {
  const { formData, nextStep } = useFormContext();
  const [processingStep, setProcessingStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  
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
    height: '3px',
    width: '100%',
    backgroundColor: '#3fccff',
    boxShadow: '0 0 15px 3px rgba(63, 204, 255, 0.8)',
    top: `${(processingStep / processingSteps.length) * 100}%`,
    left: 0,
    transition: 'top 0.5s ease-in-out',
    animation: 'scanGlow 1.5s infinite alternate'
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
            height: '250px', 
            width: '90%', 
            maxWidth: '500px',
            margin: '0 auto 30px', 
            border: '1px solid #ccc',
            borderRadius: '10px',
            backgroundColor: '#f9f9f9',
            overflow: 'hidden'
          }}>
            {/* "House blueprint" background */}
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
            
            {/* Animated scan line */}
            <div style={scanLineStyle}></div>
            
            {/* Data points animation */}
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
      `}</style>
    </div>
  );
}

export default AIProcessing;