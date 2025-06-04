/**
 * Property Lookup Service
 * Aggregates property data from multiple sources (Melissa API, BatchData)
 */

import { melissaService } from './melissa.js';
import { lookupPhoneNumbers } from './batchdata.js';

class PropertyLookupService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Comprehensive property lookup combining multiple data sources
   * @param {string} address - Property address
   * @param {Object} options - Lookup options
   * @returns {Promise<Object>} Aggregated property data
   */
  async lookupProperty(address, options = {}) {
    if (!address || typeof address !== 'string') {
      console.warn('Invalid address provided for property lookup');
      return null;
    }

    const cacheKey = address.toLowerCase().trim();
    
    // Check cache first
    if (this.cache.has(cacheKey) && !options.skipCache) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📋 Using cached property data for:', address);
        return cached.data;
      }
    }

    console.log('🔍 Looking up property data for:', address);

    try {
      // Parallel API calls for better performance
      const [propertyResult, contactResult] = await Promise.allSettled([
        this.lookupPropertyInfo(address),
        this.lookupContactInfo(address)
      ]);

      // Extract results
      const propertyData = propertyResult.status === 'fulfilled' ? propertyResult.value : null;
      const contactData = contactResult.status === 'fulfilled' ? contactResult.value : null;

      // Aggregate data
      const aggregatedData = this.aggregatePropertyData(propertyData, contactData, address);

      // Cache the result
      this.cache.set(cacheKey, {
        data: aggregatedData,
        timestamp: Date.now()
      });

      console.log('✅ Property lookup completed:', {
        address,
        hasPropertyData: !!propertyData,
        hasContactData: !!contactData,
        estimatedValue: aggregatedData?.apiEstimatedValue
      });

      return aggregatedData;

    } catch (error) {
      console.error('❌ Property lookup failed:', error);
      return null;
    }
  }

  /**
   * Lookup property information using Melissa API
   * @param {string} address - Property address
   * @returns {Promise<Object|null>} Property information
   */
  async lookupPropertyInfo(address) {
    try {
      const result = await melissaService.lookupPropertyInfo(address);
      
      if (result && result.apiEstimatedValue > 0) {
        console.log('🏠 Property info retrieved:', {
          value: result.apiEstimatedValue,
          owner: result.apiOwnerName,
          equity: result.apiEquity
        });
        return result;
      }
      
      console.log('⚠️ No property info found for address');
      return null;
    } catch (error) {
      console.error('❌ Property info lookup failed:', error);
      return null;
    }
  }

  /**
   * Lookup contact information using BatchData API
   * @param {string} address - Property address
   * @returns {Promise<Object|null>} Contact information
   */
  async lookupContactInfo(address) {
    try {
      // Parse address for BatchData API
      const addressObj = this.parseAddress(address);
      
      if (!addressObj.street) {
        console.log('⚠️ Cannot parse address for contact lookup');
        return null;
      }

      const result = await lookupPhoneNumbers(addressObj);
      
      if (result && (result.phoneNumbers?.length > 0 || result.emails?.length > 0)) {
        console.log('📞 Contact info retrieved:', {
          phones: result.phoneNumbers?.length || 0,
          emails: result.emails?.length || 0
        });
        return result;
      }
      
      console.log('⚠️ No contact info found for address');
      return null;
    } catch (error) {
      console.error('❌ Contact info lookup failed:', error);
      return null;
    }
  }

  /**
   * Aggregate data from multiple sources into a unified object
   * @param {Object} propertyData - Property information from Melissa API
   * @param {Object} contactData - Contact information from BatchData
   * @param {string} originalAddress - Original address string
   * @returns {Object} Aggregated property data
   */
  aggregatePropertyData(propertyData, contactData, originalAddress) {
    const aggregated = {
      // Property information (from Melissa API)
      ...(propertyData || {}),
      
      // Contact information (from BatchData)
      batchDataPhoneNumbers: contactData?.phoneNumbers || [],
      batchDataEmails: contactData?.emails || [],
      batchDataReport: contactData?.rawData || null,
      batchDataProcessed: !!contactData,
      batchDataProcessedAt: contactData ? new Date().toISOString() : null,
      
      // Lookup metadata
      propertyLookupAddress: originalAddress,
      propertyLookupAt: new Date().toISOString(),
      propertyDataSources: {
        melissa: !!propertyData,
        batchData: !!contactData
      }
    };

    // Ensure required fields have default values
    if (!aggregated.apiEstimatedValue) {
      aggregated.apiEstimatedValue = 0;
      aggregated.formattedApiEstimatedValue = '$0';
    }

    if (!aggregated.apiEquity) {
      aggregated.apiEquity = 0;
      aggregated.formattedApiEquity = '$0';
    }

    return aggregated;
  }

  /**
   * Parse address string into components for APIs
   * @param {string} address - Full address string
   * @returns {Object} Parsed address components
   */
  parseAddress(address) {
    // Basic address parsing - could be enhanced
    const parts = address.split(',').map(part => part.trim());
    
    return {
      street: parts[0] || '',
      city: parts[1] || '',
      state: parts[2]?.split(' ')[0] || '',
      zip: parts[2]?.split(' ')[1] || ''
    };
  }

  /**
   * Validate property data completeness
   * @param {Object} propertyData - Property data to validate
   * @returns {Object} Validation result
   */
  validatePropertyData(propertyData) {
    if (!propertyData) {
      return { isValid: false, reason: 'No property data' };
    }

    if (!propertyData.apiEstimatedValue || propertyData.apiEstimatedValue <= 0) {
      return { isValid: false, reason: 'No estimated value' };
    }

    return { isValid: true, reason: 'Complete' };
  }

  /**
   * Get property lookup statistics
   * @returns {Object} Lookup statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout,
      cachedAddresses: Array.from(this.cache.keys())
    };
  }

  /**
   * Clear property lookup cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Property lookup cache cleared');
  }

  /**
   * Preload property data for an address (optional optimization)
   * @param {string} address - Address to preload
   * @returns {Promise<Object|null>} Property data
   */
  async preloadProperty(address) {
    return this.lookupProperty(address, { preload: true });
  }

  /**
   * Start Melissa property lookup independently - updates FormContext as soon as ready
   * @param {string} address - Property address
   * @param {Function} updateFormData - FormContext update function
   * @returns {Promise<void>} Resolves when Melissa data is processed
   */
  async lookupMelissaIndependent(address, updateFormData) {
    if (!address || typeof address !== 'string') {
      console.warn('Invalid address provided for independent Melissa lookup');
      return;
    }

    console.log('🏠 Starting independent Melissa lookup for:', address);

    try {
      const propertyData = await this.lookupPropertyInfo(address);
      
      if (propertyData) {
        console.log('🏠 Melissa data ready! Updating FormContext immediately with value:', propertyData.formattedApiEstimatedValue);
        
        // Update FormContext immediately with Melissa data
        updateFormData({
          // Property values
          apiOwnerName: propertyData.apiOwnerName || '',
          apiEstimatedValue: propertyData.apiEstimatedValue || 0,
          apiMaxHomeValue: propertyData.apiMaxValue || 0,
          apiEquity: propertyData.apiEquity || 0,
          apiPercentage: propertyData.apiPercentage || 0,
          formattedApiEstimatedValue: propertyData.formattedApiEstimatedValue || '$0',
          formattedApiEquity: propertyData.formattedApiEquity || '$0',
          
          // Property details
          mortgageAmount: propertyData.mortgageAmount || 0,
          bedrooms: propertyData.bedrooms || '',
          bathrooms: propertyData.bathrooms || '',
          finishedSquareFootage: propertyData.finishedSquareFootage || 1000,
          
          // Address components (if missing from Google)
          city: propertyData.city || '',
          state: propertyData.state || '',
          zip: propertyData.zip || '',
          
          // Store full record
          propertyRecord: propertyData.propertyRecord,
          
          // Status flags
          melissaDataReady: true,
          melissaDataProcessedAt: new Date().toISOString()
        });
      } else {
        console.log('⚠️ No Melissa property data found');
        updateFormData({
          melissaDataReady: false,
          melissaDataProcessedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Independent Melissa lookup failed:', error);
      updateFormData({
        melissaDataReady: false,
        melissaDataError: error.message,
        melissaDataProcessedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Start BatchData contact lookup independently - updates FormContext as soon as ready
   * @param {string} address - Property address
   * @param {Function} updateFormData - FormContext update function
   * @returns {Promise<void>} Resolves when BatchData is processed
   */
  async lookupBatchDataIndependent(address, updateFormData) {
    if (!address || typeof address !== 'string') {
      console.warn('Invalid address provided for independent BatchData lookup');
      return;
    }

    console.log('📞 Starting independent BatchData lookup for:', address);

    try {
      const contactData = await this.lookupContactInfo(address);
      
      if (contactData && (contactData.phoneNumbers?.length > 0 || contactData.emails?.length > 0)) {
        console.log('📞 BatchData ready! Updating FormContext immediately with contacts:', {
          phones: contactData.phoneNumbers?.length || 0,
          emails: contactData.emails?.length || 0
        });
        
        // Update FormContext immediately with BatchData
        updateFormData({
          batchDataPhoneNumbers: contactData.phoneNumbers || [],
          batchDataEmails: contactData.emails || [],
          batchDataReport: contactData.rawData || null,
          batchDataReady: true,
          batchDataProcessedAt: new Date().toISOString()
        });
      } else {
        console.log('⚠️ No BatchData contact info found');
        updateFormData({
          batchDataReady: false,
          batchDataProcessedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Independent BatchData lookup failed:', error);
      updateFormData({
        batchDataReady: false,
        batchDataError: error.message,
        batchDataProcessedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Start both independent lookups simultaneously (completely non-blocking)
   * @param {string} address - Property address  
   * @param {Function} updateFormData - FormContext update function
   * @returns {void} Returns immediately, APIs update FormContext when ready
   */
  startIndependentLookups(address, updateFormData) {
    console.log('🚀 Starting both independent API lookups for:', address);
    
    // Start both APIs simultaneously but don't wait for them
    // Each will update FormContext as soon as it completes
    this.lookupMelissaIndependent(address, updateFormData);
    this.lookupBatchDataIndependent(address, updateFormData);
    
    console.log('🚀 Both independent lookups started, user can proceed immediately');
  }
}

// Export singleton instance
export const propertyService = new PropertyLookupService();
export default propertyService;