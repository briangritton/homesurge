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
          state: 'GA', // Default
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
    // Use environment variable for API key if available
    const apiKey = process.env.REACT_APP_MELISSA_API_KEY || "TyXpKLplL6R0lDTHV7B8Bb**nSAcwXpxhQ0PC2lXxuDAZ-**";
    const encodedAddress = encodeURIComponent(address);
    const url = `https://property.melissadata.net/v4/WEB/LookupProperty?id=${apiKey}&format=json&cols=GrpAll&opt=desc:on&ff=${encodedAddress}`;
    
    console.log(`Looking up property data for: ${address}`);
    
    // Add timeout to prevent long hangs
    const { data } = await axios.get(url, { timeout: 15000 });
    
    // Log the first part of the response to avoid overwhelming the console
    console.log('Property lookup response received, TotalRecords:', data.TotalRecords);
    
    if (!data.Records || data.Records.length === 0) {
      console.log('No property records found');
      return null;
    }
    
    // Get the first record
    const record = data.Records[0];
    
    // Log key property values for debugging
    if (record.EstimatedValue) {
      console.log('Property estimated value:', record.EstimatedValue.EstimatedValue);
    } else {
      console.log('No estimated value found in property data');
    }
    
    // Extract relevant information with safe defaults
    const apiOwnerName = record.PrimaryOwner?.Name1Full || '';
    const apiMaxValue = record.EstimatedValue?.EstimatedMaxValue || 0;
    const apiEstimatedValue = record.EstimatedValue?.EstimatedValue || 0;
    
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
    
    console.log('Formatted estimated value:', formattedApiEstimatedValue);
    
    // Get additional property details with safe defaults
    let bedrooms = '';
    let bathrooms = '';
    let squareFootage = 1000;
    
    if (record.BuildingData) {
      bedrooms = record.BuildingData.BedroomCount || '';
      bathrooms = record.BuildingData.BathroomCount || '';
      squareFootage = record.BuildingData.AreaBuilding || 1000;
    }
    
    // Get address components with safe defaults
    const city = record.AddressData?.City || '';
    const zip = record.AddressData?.PostalCode || '';
    const state = record.AddressData?.State || 'GA';
    
    // Create result object with all the needed data
    const result = {
      propertyRecord: record,
      apiOwnerName,
      apiMaxValue,
      apiEstimatedValue,
      formattedApiMaxValue,
      formattedApiEstimatedValue,
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