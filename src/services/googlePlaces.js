/**
 * Google Places API Service
 * Clean wrapper for Google Places autocomplete and place details
 */

class GooglePlacesService {
  constructor() {
    this.sessionToken = null;
    this.autocompleteService = null;
    this.placesService = null;
    this.loadPromise = null;
    this.isLoaded = false;
  }

  /**
   * Load Google Maps API with fallback key (from original implementation)
   */
  async loadAPI() {
    // If already loaded, return resolved promise
    if (window.google && window.google.maps && window.google.maps.places) {
      this.isLoaded = true;
      return Promise.resolve();
    }
    
    // If already loading, return existing promise
    if (this.loadPromise) {
      return this.loadPromise;
    }
    
    // Get API key from environment variable with local testing fallback
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyAVFFu1WoxN5ghygdz0JJYV9pJgSp08y8I';
    
    // Check if API key is available
    if (!apiKey) {
      console.error('Google Maps API key is missing. Please check your environment variables.');
      return Promise.reject(new Error('Google Maps API key is missing'));
    }
    
    // Create a new promise for loading
    this.loadPromise = new Promise((resolve, reject) => {
      // Define callback function
      window.initGoogleMapsAutocomplete = () => {
        console.log('🗺️ Google Maps API loaded successfully');
        this.isLoaded = true;
        resolve();
      };
      
      // Define error handler for the API
      window.gm_authFailure = () => {
        const error = new Error('Google Maps API authentication failure');
        console.error(error);
        reject(error);
      };
      
      // Load the API with a callback
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAutocomplete`;
      script.async = true;
      script.defer = true;
      script.onerror = (e) => {
        const error = new Error('Failed to load Google Maps API script');
        console.error(error, e);
        reject(error);
      };
      
      document.body.appendChild(script);
    });
    
    return this.loadPromise;
  }

  /**
   * Initialize the service when Google Maps API is loaded
   */
  async initialize() {
    try {
      // Load API first if not loaded
      if (!this.isAvailable()) {
        await this.loadAPI();
      }

      if (!window.google?.maps?.places) {
        console.warn('Google Maps Places API not loaded');
        return false;
      }

      this.autocompleteService = new window.google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService (required by Google API)
      const dummyDiv = document.createElement('div');
      this.placesService = new window.google.maps.places.PlacesService(dummyDiv);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Places:', error);
      return false;
    }
  }

  /**
   * Generate a new session token for API call grouping
   */
  generateSessionToken() {
    if (!window.google?.maps?.places?.AutocompleteSessionToken) {
      return null;
    }
    this.sessionToken = new window.google.maps.places.AutocompleteSessionToken();
    return this.sessionToken;
  }

  /**
   * Get address predictions from Google Places API
   * @param {string} input - Address input text
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of place predictions
   */
  async getPlacePredictions(input, options = {}) {
    if (!this.autocompleteService && !this.initialize()) {
      throw new Error('Google Places API not available');
    }

    if (!input || input.length < 2) {
      return [];
    }

    const requestOptions = {
      input: input.trim(),
      sessionToken: this.sessionToken || this.generateSessionToken(),
      componentRestrictions: { country: 'us' },
      types: ['address'],
      ...options
    };

    return new Promise((resolve, reject) => {
      this.autocompleteService.getPlacePredictions(
        requestOptions,
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(predictions || []);
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            console.warn('Places API error:', status);
            resolve([]); // Don't reject, return empty array
          }
        }
      );
    });
  }

  /**
   * Get detailed information about a specific place
   * @param {string} placeId - Google Place ID
   * @returns {Promise<Object>} Place details object
   */
  async getPlaceDetails(placeId) {
    if (!this.placesService && !this.initialize()) {
      throw new Error('Google Places API not available');
    }

    if (!placeId) {
      throw new Error('Place ID is required');
    }

    const request = {
      placeId: placeId,
      sessionToken: this.sessionToken,
      fields: [
        'formatted_address',
        'address_components',
        'geometry',
        'place_id',
        'name'
      ]
    };

    return new Promise((resolve, reject) => {
      this.placesService.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          reject(new Error(`Place details error: ${status}`));
        }
      });
    });
  }

  /**
   * Format address components from Google Place object
   * @param {Object} place - Google Place object
   * @returns {Object} Formatted address data
   */
  formatAddressComponents(place) {
    if (!place || !place.formatted_address) {
      throw new Error('Invalid place object');
    }

    const components = {
      streetNumber: '',
      route: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    };

    // Parse address components if available
    if (place.address_components) {
      place.address_components.forEach(component => {
        const types = component.types;
        
        if (types.includes('street_number')) {
          components.streetNumber = component.long_name;
        } else if (types.includes('route')) {
          components.route = component.long_name;
        } else if (types.includes('locality')) {
          components.city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          components.state = component.short_name;
        } else if (types.includes('postal_code')) {
          components.zip = component.long_name;
        } else if (types.includes('country')) {
          components.country = component.short_name;
        }
      });
    }

    // Construct street address
    const street = [components.streetNumber, components.route]
      .filter(Boolean)
      .join(' ') || place.formatted_address;

    // Get location coordinates
    const location = place.geometry?.location ? {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    } : null;

    return {
      street,
      city: components.city,
      state: components.state,
      zip: components.zip,
      location,
      selectedSuggestionAddress: place.formatted_address,
      addressSelectionType: 'Google',
      placeId: place.place_id
    };
  }

  /**
   * Create a basic place object from raw address text
   * Used as fallback when Google API is unavailable
   * @param {string} address - Raw address text
   * @returns {Object} Basic address data
   */
  createBasicPlace(address) {
    return {
      street: address,
      city: '',
      state: '',
      zip: '',
      location: null,
      selectedSuggestionAddress: address,
      addressSelectionType: 'Manual',
      placeId: null
    };
  }

  /**
   * Reset session token (call after completing a place selection)
   */
  resetSessionToken() {
    this.sessionToken = null;
  }

  /**
   * Check if Google Places API is available
   * @returns {boolean}
   */
  isAvailable() {
    return !!(window.google?.maps?.places);
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();
export default googlePlacesService;