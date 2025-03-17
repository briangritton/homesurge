import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { validateAddress } from '../../utils/validation.js';
import { trackAddressSelected } from '../../services/analytics';

function AddressForm() {
  const { formData, updateFormData, nextStep } = useFormContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [placesLoaded, setPlacesLoaded] = useState(false);
  
  // Reference to visible input that user interacts with
  const visibleInputRef = useRef(null);
  
  // Reference to hidden input that Google Maps attaches to
  const hiddenInputRef = useRef(null);
  
  // Reference to autocomplete instance
  const autocompleteRef = useRef(null);
  
  // Handle form input changes
  const handleChange = (e) => {
    const value = e.target.value;
    updateFormData({ 
      street: value,
      addressSelectionType: 'Manual'
    });
    
    // Update hidden input to match visible input
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = value;
      
      // Trigger the autocomplete dropdown by simulating user input
      if (placesLoaded) {
        const event = new Event('input', { bubbles: true });
        hiddenInputRef.current.dispatchEvent(event);
      }
    }
    
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate address
    if (!validateAddress(formData.street)) {
      setErrorMessage('Please enter a valid address to check your cash offer');
      return;
    }
    
    // Clear error message
    setErrorMessage('');
    
    // Set loading state
    setIsLoading(true);
    
    // Set some minimal data if we don't have complete address info
    if (!formData.city || !formData.zip) {
      updateFormData({
        addressSelectionType: 'Manual',
        city: formData.city || '',
        zip: formData.zip || '',
        state: formData.state || 'GA'
      });
    }
    
    // Track address submission
    trackAddressSelected(formData.addressSelectionType || 'Manual');
    
    // Proceed to next step
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 300);
  };
  
  // Function to position the autocomplete dropdown below the visible input
  const positionDropdown = () => {
    // After a short delay to allow the autocomplete to render
    setTimeout(() => {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && visibleInputRef.current) {
        const inputRect = visibleInputRef.current.getBoundingClientRect();
        pacContainer.style.top = `${inputRect.bottom}px`;
        pacContainer.style.left = `${inputRect.left}px`;
        pacContainer.style.width = `${inputRect.width}px`;
        
        // Make sure it's visible
        pacContainer.style.display = 'block';
        pacContainer.style.visibility = 'visible';
        pacContainer.style.opacity = '1';
        
        // Ensure it stays above other elements
        pacContainer.style.zIndex = '1000';
      }
    }, 100);
  };
  
  // Load Google Maps and initialize autocomplete on the hidden input
  useEffect(() => {
    // Only run once
    if (placesLoaded) return;
    
    // Get API key from environment variable
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyArZ4pBJT_YW6wRVuPI2-AgGL-0hbAdVbI";
    
    // Try to load Google Maps API
    try {
      // Create script element if not already present
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log('Loading Google Maps API script...');
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onerror = () => console.error('Failed to load Google Maps API script');
        
        // Initialize autocomplete when script loads
        script.onload = () => {
          console.log('Google Maps API script loaded successfully');
          initializeAutocomplete();
          setPlacesLoaded(true);
        };
        
        // Add script to page
        document.body.appendChild(script);
      } else if (window.google && window.google.maps && window.google.maps.places) {
        // Script already loaded, initialize autocomplete
        console.log('Google Maps API already loaded');
        initializeAutocomplete();
        setPlacesLoaded(true);
      } else {
        console.log('Google Maps API script exists but is not fully loaded yet');
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('Google Maps API now loaded');
            clearInterval(checkLoaded);
            initializeAutocomplete();
            setPlacesLoaded(true);
          }
        }, 500);
        
        // Clear interval after 10 seconds to prevent infinite checking
        setTimeout(() => clearInterval(checkLoaded), 10000);
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
    
    // Function to initialize autocomplete on the hidden input
    function initializeAutocomplete() {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error('Google Maps API not available');
        return;
      }
      
      if (!hiddenInputRef.current) {
        console.error('Hidden input ref not available');
        return;
      }
      
      try {
        console.log('Initializing Google Places autocomplete...');
        
        // Create the autocomplete instance on the hidden input
        autocompleteRef.current = new window.google.maps.places.Autocomplete(hiddenInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }
        });
        
        // Position the dropdown after it's created
        hiddenInputRef.current.addEventListener('focus', positionDropdown);
        hiddenInputRef.current.addEventListener('input', positionDropdown);
        
        // Add event listener for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          try {
            const place = autocompleteRef.current.getPlace();
            
            if (!place || !place.formatted_address) {
              console.warn('No place data available');
              return;
            }
            
            console.log('Place selected:', place.formatted_address);
            
            // Extract address components
            const addressComponents = {
              city: '',
              state: 'GA',
              zip: ''
            };
            
            if (place.address_components && place.address_components.length > 0) {
              place.address_components.forEach(component => {
                const types = component.types;
                
                if (types.includes('locality')) {
                  addressComponents.city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                  addressComponents.state = component.short_name;
                } else if (types.includes('postal_code')) {
                  addressComponents.zip = component.long_name;
                }
              });
            }
            
            // Get location data if available
            const location = place.geometry?.location ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            } : null;
            
            // Update form data with selected place
            updateFormData({
              street: place.formatted_address,
              city: addressComponents.city,
              state: addressComponents.state,
              zip: addressComponents.zip,
              location: location,
              addressSelectionType: 'Google'
            });
            
            // Update visible input to match the selected place
            if (visibleInputRef.current) {
              visibleInputRef.current.value = place.formatted_address;
            }
            
            // Track the address selection in analytics
            trackAddressSelected('Google');
          } catch (error) {
            console.error('Error handling place selection:', error);
          }
        });
        
        // Focus and apply styles to trigger the autocomplete dropdown
        setTimeout(() => {
          if (hiddenInputRef.current) {
            hiddenInputRef.current.focus();
            const event = new Event('input', { bubbles: true });
            hiddenInputRef.current.dispatchEvent(event);
          }
        }, 200);
        
        console.log('Autocomplete initialized successfully');
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    }
    
    // Cleanup function
    return () => {
      // Remove event listeners when component unmounts
      if (hiddenInputRef.current) {
        hiddenInputRef.current.removeEventListener('focus', positionDropdown);
        hiddenInputRef.current.removeEventListener('input', positionDropdown);
      }
    };
  }, [updateFormData, placesLoaded]);
  
  // Style for the hidden input container
  const hiddenInputStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    height: '0',
    width: '0',
    overflow: 'hidden',
    visibility: 'hidden',
    pointerEvents: 'none'
  };
  
  return (
    <div className="hero-section">
      <div className="hero-middle-container">
        <div className="hero-content fade-in">
          <div className="hero-headline">{formData.dynamicHeadline || "Sell Your House For Cash Fast!"}</div>
          <div className="hero-subheadline">{formData.dynamicSubHeadline || "Get a Great Cash Offer For Your House and Close Fast!"}</div>
          
          <form className="form-container" onSubmit={handleSubmit}>
            {/* Visible input that user interacts with */}
            <input
              ref={visibleInputRef}
              type="text"
              placeholder="Street address..."
              className={errorMessage ? 'address-input-invalid' : 'address-input'}
              value={formData.street || ''}
              onChange={handleChange}
              onFocus={(e) => {
                e.target.placeholder = '';
                // Focus the hidden input to trigger autocomplete
                if (hiddenInputRef.current && placesLoaded) {
                  hiddenInputRef.current.focus();
                  positionDropdown();
                }
              }}
              onBlur={(e) => {
                e.target.placeholder = 'Street address...';
              }}
              disabled={isLoading}
            />
            
            {/* Hidden input for Google Maps autocomplete */}
            <div style={hiddenInputStyle}>
              <input 
                ref={hiddenInputRef}
                type="text"
                defaultValue={formData.street || ''}
                aria-hidden="true"
              />
            </div>
            
            <button 
              className="submit-button" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'CHECKING...' : 'CHECK OFFER'}
            </button>
          </form>
          
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddressForm;