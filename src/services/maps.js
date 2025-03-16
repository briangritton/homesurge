import axios from 'axios';

/**
 * Initialize Google Maps autocomplete on an input element
 * @param {HTMLInputElement} inputRef - The input element reference
 * @param {Function} onPlaceSelected - Callback function when a place is selected
 * @returns {Function} - Cleanup function to remove event listeners
 */
export function initializeGoogleMapsAutocomplete(inputRef, onPlaceSelected) {
  if (!inputRef.current || !window.google || !window.google.maps) {
    console.error('Google Maps API not loaded or input ref not available');
    return () => {};
  }

  const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
    types: ['address'],
    componentRestrictions: { country: 'us' }, // Restrict to US addresses
  });
  
  // Add listener for place selection
  const listener = autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    
    if (!place.geometry) {
      console.error('Place has no geometry');
      return;
    }

    // Extract address components
    const addressComponents = {};
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
  });

  // Return cleanup function
  return () => {
    if (window.google && window.google.maps) {
      window.google.maps.event.removeListener(listener);
    }
  };
}

/**
 * Lookup property information using an address
 * @param {string} address - The property address
 * @returns {Promise<Object>} - Property information
 */
export async function lookupPropertyInfo(address) {
  try {
    // Use environment variable for API key if available
    const apiKey = process.env.REACT_APP_MELISSA_API_KEY || 'TyXpKLplL6R0lDTHV7B8Bb**nSAcwXpxhQ0PC2lXxuDAZ-**';
    const url = `https://property.melissadata.net/v4/WEB/LookupProperty?id=${apiKey}&format=json&cols=GrpAll&opt=desc:on&ff=${encodeURIComponent(address)}`;
    
    console.log(`Looking up property data for: ${address}`);
    const { data } = await axios.get(url);
    
    console.log('Property lookup response:', data);
    
    if (!data.Records || data.Records.length === 0) {
      console.log('No property records found');
      return null;
    }
    
    // Get the first record
    const record = data.Records[0];
    
    // Extract relevant information
    const apiOwnerName = record.PrimaryOwner?.Name1Full ?? '';
    const apiMaxValue = record.EstimatedValue?.EstimatedMaxValue ?? 0;
    const apiEstimatedValue = record.EstimatedValue?.EstimatedValue ?? 0;
    
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
    
    // Get additional property details if available
    let bedrooms = '';
    let bathrooms = '';
    let squareFootage = 1000;
    
    if (record.BuildingData) {
      bedrooms = record.BuildingData.BedroomCount || '';
      bathrooms = record.BuildingData.BathroomCount || '';
      squareFootage = record.BuildingData.AreaBuilding || 1000;
    }
    
    // Create result object with all the needed data
    return {
      propertyRecord: record,
      apiOwnerName,
      apiMaxValue,
      apiEstimatedValue,
      formattedApiMaxValue,
      formattedApiEstimatedValue,
      bedrooms,
      bathrooms,
      finishedSquareFootage: squareFootage,
      // Include city and zip if they were found in the response
      city: record.AddressData?.City || '',
      zip: record.AddressData?.PostalCode || '',
      state: record.AddressData?.State || 'GA',
    };
  } catch (error) {
    console.error('Error looking up property:', error);
    return null;
  }
}