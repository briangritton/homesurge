/**
 * Melissa API Service
 * Property value, owner, and equity data lookup
 */

import axios from 'axios';

class MelissaService {
  constructor() {
    this.apiKey = process.env.REACT_APP_MELISSA_API_KEY;
  }

  /**
   * Lookup property information using Melissa API
   * @param {string} address - The validated property address from Google Places
   * @returns {Promise<Object|null>} Property information or null if not found/error
   */
  async lookupPropertyInfo(address) {
    if (!address) {
      console.warn('No address provided for Melissa property lookup');
      return null;
    }
    
    try {
      // Check if API key is available
      if (!this.apiKey) {
        console.error('Melissa API key is missing. Please check your environment variables.');
        return null;
      }

      const encodedAddress = encodeURIComponent(address);
      const url = `https://property.melissadata.net/v4/WEB/LookupProperty?id=${this.apiKey}&format=json&cols=GrpAll&opt=desc:on&ff=${encodedAddress}`;
      
      console.log(`🏠 Looking up Melissa property data for: ${address}`);
      
      // Add timeout to prevent long hangs
      const { data } = await axios.get(url, { 
        timeout: 8000 // Shorter timeout to ensure we don't delay the user too much
      }).catch(error => {
        console.warn('Melissa property data lookup failed:', error.message);
        // Return empty object to allow the form flow to continue
        return { data: { Records: [] } };
      });
      
      // Log the first part of the response to avoid overwhelming the console
      console.log('Melissa lookup response received, TotalRecords:', data.TotalRecords);
      
      if (!data.Records || data.Records.length === 0) {
        console.log('No Melissa property records found');
        return null;
      }
      
      // Get the first record
      const record = data.Records[0];
      
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
      
      console.log('🏠 Returning Melissa property data with estimated value:', result.formattedApiEstimatedValue);
      return result;
    } catch (error) {
      console.error('❌ Melissa API error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const melissaService = new MelissaService();
export default melissaService;