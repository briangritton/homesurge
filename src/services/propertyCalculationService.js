/**
 * Property Calculation Service
 * Handles property value calculations and recommendation generation
 * Extracts logic from ValueBoostReport for reusability
 */

class PropertyCalculationService {
  /**
   * Generate property improvement recommendations
   * @param {Object} formData - Form data with property information
   * @param {Object} propertyRecord - Melissa API property record
   * @returns {Array} Array of recommendation objects
   */
  static generateRecommendations(formData, propertyRecord) {
    const recommendations = [];
    const baseValue = formData.apiEstimatedValue || 250000;
    const squareFootage = formData.finishedSquareFootage || 1500;
    
    console.log('🏠 PropertyCalculationService: Generating recommendations for value:', baseValue);

    // Kitchen Renovation
    const kitchenCost = this.calculateKitchenRenovationCost(squareFootage);
    const kitchenROI = this.calculateROI(kitchenCost, baseValue, 0.15); // 15% value increase
    recommendations.push({
      id: 'kitchen',
      title: 'Kitchen Renovation',
      description: 'Modern kitchen upgrade with new appliances, countertops, and cabinets',
      estimatedCost: kitchenCost,
      valueIncrease: Math.round(baseValue * 0.15),
      roi: kitchenROI,
      timeframe: '4-6 weeks',
      category: 'major'
    });

    // Bathroom Upgrade
    const bathroomCost = this.calculateBathroomRenovationCost(squareFootage);
    const bathroomROI = this.calculateROI(bathroomCost, baseValue, 0.12);
    recommendations.push({
      id: 'bathroom',
      title: 'Master Bathroom Upgrade',
      description: 'Luxury bathroom renovation with modern fixtures and finishes',
      estimatedCost: bathroomCost,
      valueIncrease: Math.round(baseValue * 0.12),
      roi: bathroomROI,
      timeframe: '3-4 weeks',
      category: 'major'
    });

    // Flooring Update
    const flooringCost = this.calculateFlooringCost(squareFootage);
    const flooringROI = this.calculateROI(flooringCost, baseValue, 0.08);
    recommendations.push({
      id: 'flooring',
      title: 'Hardwood Flooring Installation',
      description: 'Replace carpet/vinyl with premium hardwood flooring throughout',
      estimatedCost: flooringCost,
      valueIncrease: Math.round(baseValue * 0.08),
      roi: flooringROI,
      timeframe: '2-3 weeks',
      category: 'moderate'
    });

    // HVAC System Upgrade
    const hvacCost = 8500;
    const hvacROI = this.calculateROI(hvacCost, baseValue, 0.06);
    recommendations.push({
      id: 'hvac',
      title: 'HVAC System Upgrade',
      description: 'Energy-efficient heating and cooling system installation',
      estimatedCost: hvacCost,
      valueIncrease: Math.round(baseValue * 0.06),
      roi: hvacROI,
      timeframe: '1-2 weeks',
      category: 'moderate'
    });

    // Exterior Paint
    const paintCost = this.calculatePaintingCost(squareFootage);
    const paintROI = this.calculateROI(paintCost, baseValue, 0.05);
    recommendations.push({
      id: 'paint',
      title: 'Exterior Paint & Curb Appeal',
      description: 'Fresh exterior paint and landscaping improvements',
      estimatedCost: paintCost,
      valueIncrease: Math.round(baseValue * 0.05),
      roi: paintROI,
      timeframe: '1-2 weeks',
      category: 'cosmetic'
    });

    // Sort by ROI descending
    return recommendations.sort((a, b) => b.roi - a.roi);
  }

  /**
   * Calculate total value increase from selected recommendations
   * @param {Array} recommendations - Array of recommendation objects
   * @param {Array} selectedIds - Array of selected recommendation IDs
   * @returns {Object} Value increase calculation
   */
  static calculateValueIncrease(recommendations, selectedIds = []) {
    const selectedRecommendations = recommendations.filter(rec => 
      selectedIds.length === 0 || selectedIds.includes(rec.id)
    );

    const totalCost = selectedRecommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0);
    const totalValueIncrease = selectedRecommendations.reduce((sum, rec) => sum + rec.valueIncrease, 0);
    const averageROI = selectedRecommendations.length > 0 
      ? selectedRecommendations.reduce((sum, rec) => sum + rec.roi, 0) / selectedRecommendations.length 
      : 0;

    return {
      totalCost,
      totalValueIncrease,
      netGain: totalValueIncrease - totalCost,
      averageROI,
      selectedCount: selectedRecommendations.length,
      recommendations: selectedRecommendations
    };
  }

  /**
   * Calculate kitchen renovation cost based on property size
   * @param {number} squareFootage - Property square footage
   * @returns {number} Estimated kitchen renovation cost
   */
  static calculateKitchenRenovationCost(squareFootage) {
    const baseKitchenSize = Math.max(120, Math.min(300, squareFootage * 0.08)); // 8% of home
    return Math.round(baseKitchenSize * 200); // $200 per sq ft
  }

  /**
   * Calculate bathroom renovation cost
   * @param {number} squareFootage - Property square footage
   * @returns {number} Estimated bathroom renovation cost
   */
  static calculateBathroomRenovationCost(squareFootage) {
    const baseBathroomSize = Math.max(50, Math.min(120, squareFootage * 0.04)); // 4% of home
    return Math.round(baseBathroomSize * 300); // $300 per sq ft
  }

  /**
   * Calculate flooring cost
   * @param {number} squareFootage - Property square footage
   * @returns {number} Estimated flooring cost
   */
  static calculateFlooringCost(squareFootage) {
    return Math.round(squareFootage * 0.7 * 12); // 70% of home at $12/sq ft
  }

  /**
   * Calculate painting cost
   * @param {number} squareFootage - Property square footage
   * @returns {number} Estimated painting cost
   */
  static calculatePaintingCost(squareFootage) {
    const exteriorSqFt = Math.sqrt(squareFootage) * 40; // Rough exterior estimate
    return Math.round(exteriorSqFt * 3.5 + 2500); // $3.50/sq ft + materials/labor
  }

  /**
   * Calculate return on investment (ROI)
   * @param {number} cost - Investment cost
   * @param {number} propertyValue - Current property value
   * @param {number} valueIncreasePercent - Expected value increase as decimal
   * @returns {number} ROI as percentage
   */
  static calculateROI(cost, propertyValue, valueIncreasePercent) {
    const valueIncrease = propertyValue * valueIncreasePercent;
    const roi = ((valueIncrease - cost) / cost) * 100;
    return Math.round(roi);
  }

  /**
   * Get property value tier for customized recommendations
   * @param {number} propertyValue - Current property value
   * @returns {string} Value tier ('low', 'medium', 'high', 'luxury')
   */
  static getPropertyValueTier(propertyValue) {
    if (propertyValue < 200000) return 'low';
    if (propertyValue < 400000) return 'medium';
    if (propertyValue < 800000) return 'high';
    return 'luxury';
  }

  /**
   * Get market-specific recommendations
   * @param {Object} formData - Form data with location information
   * @returns {Array} Market-specific recommendation modifiers
   */
  static getMarketRecommendations(formData) {
    const state = formData.state?.toLowerCase();
    const city = formData.city?.toLowerCase();

    // Hot market recommendations (higher ROI expected)
    const hotMarkets = ['ca', 'tx', 'fl', 'ny', 'wa'];
    const isHotMarket = hotMarkets.includes(state);

    // High-value city adjustments
    const highValueCities = ['san francisco', 'new york', 'boston', 'seattle', 'los angeles'];
    const isHighValueCity = highValueCities.some(hvCity => city?.includes(hvCity));

    return {
      isHotMarket,
      isHighValueCity,
      roiMultiplier: isHotMarket ? 1.2 : 1.0,
      costMultiplier: isHighValueCity ? 1.4 : 1.0,
      recommendations: isHotMarket ? ['kitchen', 'bathroom'] : ['paint', 'flooring']
    };
  }

  /**
   * Format currency values
   * @param {number} value - Numeric value
   * @returns {string} Formatted currency string
   */
  static formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Generate summary statistics for recommendations
   * @param {Object} formData - Form data
   * @param {Array} recommendations - Generated recommendations
   * @returns {Object} Summary statistics
   */
  static generateSummary(formData, recommendations) {
    const topRecommendations = recommendations.slice(0, 5);
    const valueIncrease = this.calculateValueIncrease(topRecommendations);
    const currentValue = formData.apiEstimatedValue || 0;
    const newValue = currentValue + valueIncrease.totalValueIncrease;

    return {
      currentValue,
      projectedValue: newValue,
      totalInvestment: valueIncrease.totalCost,
      totalValueIncrease: valueIncrease.totalValueIncrease,
      netGain: valueIncrease.netGain,
      averageROI: valueIncrease.averageROI,
      valueIncreasePercent: currentValue > 0 ? (valueIncrease.totalValueIncrease / currentValue) * 100 : 0,
      recommendationCount: topRecommendations.length,
      tier: this.getPropertyValueTier(currentValue)
    };
  }

  /**
   * Calculate display values for property value presentation
   * @param {Object} formData - Form data with property information
   * @returns {Object} Display values for property presentation
   */
  static calculateDisplayValues(formData) {
    const baseValue = formData.apiEstimatedValue || 0;
    const potentialIncrease = formData.potentialValueIncrease || 0;
    const increasePercentage = formData.valueIncreasePercentage || 0;
    
    // Calculate actual increase value if percentage is provided
    let actualIncrease = potentialIncrease;
    if (increasePercentage > 0 && baseValue > 0) {
      actualIncrease = Math.round(baseValue * (increasePercentage / 100));
    }
    
    return {
      displayValue: this.formatCurrency(baseValue),
      increaseValue: this.formatCurrency(actualIncrease),
      increasePercentage: increasePercentage || (baseValue > 0 ? Math.round((actualIncrease / baseValue) * 100) : 0)
    };
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  static getStats() {
    return {
      service: 'PropertyCalculationService',
      version: '1.0.0',
      features: [
        'Property improvement recommendations',
        'ROI calculations',
        'Cost estimation',
        'Market-specific adjustments',
        'Value tier analysis',
        'Display value calculations'
      ],
      dependencies: []
    };
  }
}

// Export singleton-style service
export const propertyCalculationService = PropertyCalculationService;
export default PropertyCalculationService;