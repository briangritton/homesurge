import { useState, useEffect } from 'react';

/**
 * Higher-order component for A/B testing that selects from available variants
 * @param {Object} options - Configuration options
 * @param {Array} options.variants - Array of component variants
 * @param {string} options.componentName - Name of the component (for analytics)
 * @param {string} options.storageKey - Optional custom localStorage key
 * @returns {Object} The selected component variant based on random assignment
 */
const useVariantSelector = ({ variants, componentName, storageKey }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [SelectedComponent, setSelectedComponent] = useState(null);

  useEffect(() => {
    // Use provided key or generate one based on component name
    const key = storageKey || `${componentName.toLowerCase()}_variant`;

    // Check if user already has an assigned variant
    let variantIndex = localStorage.getItem(key);

    // If not, assign one randomly
    if (variantIndex === null) {
      variantIndex = Math.floor(Math.random() * variants.length);
      localStorage.setItem(key, variantIndex);
    } else {
      variantIndex = parseInt(variantIndex, 10);
    }

    // Ensure index is within bounds of variants array
    const safeIndex = variantIndex % variants.length;
    
    setSelectedVariant(safeIndex);
    setSelectedComponent(variants[safeIndex]);

    // Track view in analytics
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'variant_view',
        component: componentName,
        variantIndex: safeIndex,
        variantName: `${componentName}${safeIndex + 1}`
      });
    }
  }, [variants, componentName, storageKey]);

  /**
   * Track conversion events for the selected variant
   * @param {string} eventName - Optional custom conversion event name
   */
  const trackConversion = (eventName) => {
    if (window.dataLayer && selectedVariant !== null) {
      window.dataLayer.push({
        event: eventName || 'variant_conversion',
        component: componentName,
        variantIndex: selectedVariant,
        variantName: `${componentName}${selectedVariant + 1}`
      });
    }
  };

  return { 
    selectedVariant, 
    SelectedComponent, 
    trackConversion 
  };
};

export default useVariantSelector;