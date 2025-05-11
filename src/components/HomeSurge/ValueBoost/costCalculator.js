/**
 * Calculate property-specific cost estimates based on property attributes
 * @param {Object} formData - Property data from form context
 * @param {Object} propertyRecord - Raw property record from Melissa API
 * @param {number} baseMinCost - Base minimum cost for the strategy
 * @param {number} baseMaxCost - Base maximum cost for the strategy
 * @param {Object} modifiers - Optional modifiers to adjust the calculation
 * @returns {string} Formatted cost estimate range
 */
export const calculatePropertySpecificCost = (formData, propertyRecord, baseMinCost, baseMaxCost, modifiers = {}) => {
  // Extract key property data
  const squareFootage = formData.finishedSquareFootage || 
                      (propertyRecord?.PropertySize?.AreaBuilding) || 1500;
  const propValue = formData.apiEstimatedValue || 300000;
  
  // Base adjustment factors
  let sizeFactor = 1.0;
  let marketFactor = 1.0;
  
  // Adjust for home size - larger homes cost more
  if (squareFootage > 3000) sizeFactor = 1.3;
  else if (squareFootage > 2000) sizeFactor = 1.15;
  else if (squareFootage < 1200) sizeFactor = 0.85;
  
  // Adjust for property value (market factor) - more expensive homes cost more
  if (propValue > 750000) marketFactor = 1.25;
  else if (propValue > 500000) marketFactor = 1.15;
  else if (propValue < 200000) marketFactor = 0.85;
  
  // Apply any custom modifiers
  if (modifiers.sizeFactor) sizeFactor *= modifiers.sizeFactor;
  if (modifiers.marketFactor) marketFactor *= modifiers.marketFactor;
  if (modifiers.customFactor) {
    // Additional custom factor (e.g., for property age, lot size, etc.)
    const customFactor = modifiers.customFactor;
    
    // Calculate adjusted costs with all factors
    const adjustedMinCost = Math.round(baseMinCost * sizeFactor * marketFactor * customFactor / 100) * 100;
    const adjustedMaxCost = Math.round(baseMaxCost * sizeFactor * marketFactor * customFactor / 100) * 100;
    
    return `$${adjustedMinCost.toLocaleString()} - $${adjustedMaxCost.toLocaleString()}`;
  }
  
  // Calculate adjusted costs with standard factors
  const adjustedMinCost = Math.round(baseMinCost * sizeFactor * marketFactor / 100) * 100;
  const adjustedMaxCost = Math.round(baseMaxCost * sizeFactor * marketFactor / 100) * 100;
  
  return `$${adjustedMinCost.toLocaleString()} - $${adjustedMaxCost.toLocaleString()}`;
};

/**
 * Calculate property-specific ROI estimates based on property attributes
 * @param {Object} formData - Property data from form context
 * @param {Object} propertyRecord - Raw property record from Melissa API
 * @param {number} baseMinROI - Base minimum ROI for the strategy
 * @param {number} baseMaxROI - Base maximum ROI for the strategy
 * @param {Object} modifiers - Optional modifiers to adjust the calculation
 * @returns {string} Formatted ROI estimate range
 */
export const calculatePropertySpecificROI = (formData, propertyRecord, baseMinROI, baseMaxROI, modifiers = {}) => {
  // Extract key property data
  const propertyAge = new Date().getFullYear() - (propertyRecord?.PropertyUseInfo?.YearBuilt || 1980);
  const propValue = formData.apiEstimatedValue || 300000;
  
  // Base adjustment factors
  let ageFactor = 1.0;
  let marketFactor = 1.0;
  
  // Older homes often see higher ROI on updates (higher contrast)
  if (propertyAge > 30) ageFactor = 1.2;
  else if (propertyAge < 10) ageFactor = 0.9;
  
  // Adjust for local market conditions (using property value as proxy)
  if (propValue > 750000) marketFactor = 0.9; // Lower ROI in luxury market
  else if (propValue < 200000) marketFactor = 1.2; // Higher ROI in entry markets
  
  // Apply any custom modifiers
  if (modifiers.ageFactor) ageFactor *= modifiers.ageFactor;
  if (modifiers.marketFactor) marketFactor *= modifiers.marketFactor;
  if (modifiers.customFactor) {
    // Additional custom factor
    const customFactor = modifiers.customFactor;
    
    // Calculate adjusted ROI with all factors
    const adjustedMinROI = (baseMinROI * ageFactor * marketFactor * customFactor).toFixed(1);
    const adjustedMaxROI = (baseMaxROI * ageFactor * marketFactor * customFactor).toFixed(1);
    
    return `${adjustedMinROI} - ${adjustedMaxROI}x investment`;
  }
  
  // Calculate adjusted ROI with standard factors
  const adjustedMinROI = (baseMinROI * ageFactor * marketFactor).toFixed(1);
  const adjustedMaxROI = (baseMaxROI * ageFactor * marketFactor).toFixed(1);
  
  return `${adjustedMinROI} - ${adjustedMaxROI}x investment`;
};