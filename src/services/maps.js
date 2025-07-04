import axios from 'axios';

/**
 * Initialize Google Maps autocomplete on an input element with error handling
 * @param {HTMLInputElement} inputRef - The input element reference
 * @param {Function} onPlaceSelected - Callback function when a place is selected
 * @returns {Function} - Cleanup function to remove event listeners
 */
export function initializeGoogleMapsAutocomplete(inputRef, onPlaceSelected) {
  // Guard against missing dependencies
  if (!inputRef || !inputRef.current) {
    console.error('Input reference is invalid');
    return () => {};
  }
  
  if (!window.google || !window.google.maps || !window.google.maps.places) {
    console.error('Google Maps API not loaded');
    return () => {};
  }

  try {
    // Create the autocomplete instance with error handling
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' }, // Restrict to US addresses
    });
    
    // Add listener for place selection
    const listener = autocomplete.addListener('place_changed', () => {
      try {
        const place = autocomplete.getPlace();
        
        // Validate that place has geometry
        if (!place || !place.geometry) {
          console.warn('Place has no geometry or is invalid');
          return;
        }

        // Extract address components
        const addressComponents = {
          city: '',
          state: '',
          zip: ''
        };
        
        if (place.address_components && place.address_components.length > 0) {
          place.address_components.forEach(component => {
            const type = component.types[0];
            if (type === 'street_number') {
              addressComponents.streetNumber = component.long_name;
            } else if (type === 'route') {
              addressComponents.street = component.long_name;
            } else if (type === 'locality') {
              addressComponents.city = component.long_name;
            } else if (type === 'administrative_area_level_1') {
              addressComponents.state = component.short_name;
            } else if (type === 'postal_code') {
              addressComponents.zip = component.long_name;
            }
          });
        }

        // Create location object
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        // Call the callback with place data
        onPlaceSelected({
          formattedAddress: place.formatted_address,
          addressComponents,
          location
        });
      } catch (error) {
        console.error('Error in place selection:', error);
        // Don't block the user from continuing even if there's an error
      }
    });

    // Return cleanup function
    return () => {
      try {
        if (window.google && window.google.maps) {
          window.google.maps.event.removeListener(listener);
        }
      } catch (error) {
        console.error('Error cleaning up Google Maps listener:', error);
      }
    };
  } catch (error) {
    console.error('Error initializing Google Maps autocomplete:', error);
    return () => {};
  }
}

/**
 * Lookup property information using an address with better error handling
 * @param {string} address - The property address
 * @returns {Promise<Object|null>} - Property information or null if not found/error
 */
export async function lookupPropertyInfo(address) {
  if (!address) {
    console.warn('No address provided for property lookup');
    return null;
  }
  
  try {
    // Use environment variable for API key
    const apiKey = process.env.REACT_APP_MELISSA_API_KEY;
    
    // Check if API key is available
    if (!apiKey) {
      console.error('Melissa API key is missing. Please check your environment variables.');
      return null; // Return early if no API key is available
    }
    const encodedAddress = encodeURIComponent(address);
    const url = `https://property.melissadata.net/v4/WEB/LookupProperty?id=${apiKey}&format=json&cols=GrpAll&opt=desc:on&ff=${encodedAddress}`;
    
    console.log(`Looking up property data for: ${address}`);
    
    // Add timeout to prevent long hangs
    // Use a shorter timeout and add catch handler to prevent blocking user flow
    const { data } = await axios.get(url, { 
      timeout: 8000 // Shorter timeout to ensure we don't delay the user too much
    }).catch(error => {
      console.warn('Property data lookup failed:', error.message);
      // Return empty object to allow the form flow to continue
      return { data: { Records: [] } };
    });
    
    // Log the first part of the response to avoid overwhelming the console
    console.log('Property lookup response received, TotalRecords:', data.TotalRecords);
    
    if (!data.Records || data.Records.length === 0) {
      console.log('No property records found');
      return null;
    }
    
    // Get the first record
    const record = data.Records[0];
    
    // Enhanced logging: Log the full record to console for analysis (commented out to reduce console output)
    // console.log('========== FULL MELISSA API RECORD ==========');
    // console.log(JSON.stringify(record, null, 2));
    // console.log('============================================');
    
    // Log key categories of data
    if (record.EstimatedValue) {
      console.log('EstimatedValue data:', record.EstimatedValue);
    }
    
    if (record.CurrentDeed) {
      console.log('CurrentDeed data:', record.CurrentDeed);
    }
    
    if (record.PrimaryOwner) {
      console.log('PrimaryOwner data:', record.PrimaryOwner);
    }
    
    // Extract relevant information with safe defaults
    const apiOwnerName = record.PrimaryOwner?.Name1Full || '';
    const apiMaxValue = record.EstimatedValue?.EstimatedMaxValue || 0;
    const apiEstimatedValue = record.EstimatedValue?.EstimatedValue || 0;
    
    // Get mortgage amount if available
    const mortgageAmount = parseInt(record.CurrentDeed?.MortgageAmount || 0, 10);
    
    // Calculate equity (property value minus mortgage)
    let apiEquity = 0;
    if (apiEstimatedValue > 0 && mortgageAmount > 0) {
      apiEquity = Math.max(0, apiEstimatedValue - mortgageAmount);
      console.log(`Calculating equity: ${apiEstimatedValue} - ${mortgageAmount} = ${apiEquity}`);
    } else if (apiEstimatedValue > 0) {
      // If we have a property value but no mortgage, assume 100% equity
      apiEquity = apiEstimatedValue;
      console.log(`No mortgage data, assuming full equity: ${apiEquity}`);
    }
    
    // Calculate equity percentage
    let apiPercentage = 0;
    if (apiEstimatedValue > 0 && apiEquity > 0) {
      apiPercentage = Math.round((apiEquity / apiEstimatedValue) * 100);
      console.log(`Calculating equity percentage: (${apiEquity} / ${apiEstimatedValue}) * 100 = ${apiPercentage}%`);
    }
    
    // Format currency values
    const formattedApiMaxValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(apiMaxValue);
    
    const formattedApiEstimatedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(apiEstimatedValue);
    
    const formattedApiEquity = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(apiEquity);
    
    console.log('Formatted estimated value:', formattedApiEstimatedValue);
    console.log('Formatted equity:', formattedApiEquity);
    console.log('Equity percentage:', `${apiPercentage}%`);
    
    // Get additional property details with safe defaults
    let bedrooms = '';
    let bathrooms = '';
    let squareFootage = 1000;
    
    if (record.IntRoomInfo) {
      bedrooms = record.IntRoomInfo.BedroomsCount || '';
      bathrooms = record.IntRoomInfo.BathCount || '';
    }
    
    if (record.PropertySize) {
      squareFootage = record.PropertySize.AreaBuilding || 1000;
    }
    
    // Get address components with safe defaults
    const city = record.PropertyAddress?.City || '';
    const zip = record.PropertyAddress?.Zip?.split('-')[0] || '';
    const state = record.PropertyAddress?.State || '';
    
    // Create result object with all the needed data
    const result = {
      propertyRecord: record,
      apiOwnerName,
      apiMaxValue,
      apiEstimatedValue,
      mortgageAmount,
      apiEquity,
      apiPercentage,
      formattedApiMaxValue,
      formattedApiEstimatedValue,
      formattedApiEquity,
      bedrooms,
      bathrooms,
      finishedSquareFootage: squareFootage,
      city,
      zip,
      state
    };
    
    console.log('Returning property data with estimated value:', result.formattedApiEstimatedValue);
    return result;
  } catch (error) {
    console.error('Error looking up property:', error);
    if (error.response) {
      console.error('API response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received from API');
    } else {
      console.error('Error message:', error.message);
    }
    // Return null instead of throwing, so the app continues to work
    return null;
  }
}