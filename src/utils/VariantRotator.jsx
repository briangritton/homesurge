import React from 'react';
import useVariantSelector from './variantSelector';

/**
 * A component that rotates between variants of a given component type
 * 
 * @param {Object} props
 * @param {string} props.componentName - The name of the component for tracking
 * @param {Array} props.variants - Array of component variants
 * @param {Object} props.componentProps - Props to pass to the selected component
 */
const VariantRotator = ({ componentName, variants, componentProps = {} }) => {
  const { SelectedComponent } = useVariantSelector({
    variants,
    componentName
  });

  if (!SelectedComponent) return null;
  
  return <SelectedComponent {...componentProps} />;
};

export default VariantRotator;