import React, { useEffect, useState } from 'react';
import AddressForm1 from './AddressForm1';
// AddressForm2 is not used in this configuration (see line 59)

function AddressForm(props) {
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    try {
      const storageKey = 'address_form_variant';

      // Check if user already has an assigned variant
      let variantIndex = localStorage.getItem(storageKey);

      // If not, assign one randomly
      if (variantIndex === null) {
        // ========== TOGGLE SECTION ==========
        // OPTION 1: Random variant selection (A/B testing)
        // variantIndex = Math.floor(Math.random() * 2); // 0 or 1
        
        // OPTION 2: Force specific variant (comment out option 1 and uncomment below)
        variantIndex = 0; // Always use variant 1
        // variantIndex = 1; // Always use variant 2
        // ====================================
        
        localStorage.setItem(storageKey, variantIndex);
      } else {
        variantIndex = parseInt(variantIndex, 10);
      }

      setSelectedVariant(variantIndex);

      // Track view in analytics
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'variant_view',
          component: 'AddressForm',
          variantIndex,
          variantName: `AddressForm${variantIndex + 1}`
        });
      }
    } catch (error) {
      // Fallback to variant 1 if anything goes wrong
      console.error('Error in variant selection:', error);
      setSelectedVariant(0);
    }
  }, []);

  // If no variant selected yet or error occurred, fallback to variant 1
  if (selectedVariant === null) return <AddressForm1 {...props} />;

  // Try to render selected variant with fallback
  try {
    // ========== TOGGLE SECTION ==========
    // OPTION 1: Use all variants
    // const variants = [AddressForm1, AddressForm2];
    
    // OPTION 2: Use only specific variants (comment out option 1 and uncomment below)
    const variants = [AddressForm1]; // Only use variant 1
    // const variants = [AddressForm2]; // Only use variant 2
    // const variants = [AddressForm1, AddressForm1]; // Looks like A/B testing but actually always uses variant 1
    // ====================================
    
    // Ensure index is valid
    const safeIndex = selectedVariant >= 0 && selectedVariant < variants.length ? 
      selectedVariant : 0;
    const SelectedComponent = variants[safeIndex];
    return <SelectedComponent {...props} />;
  } catch (error) {
    // Ultimate fallback - always show something
    console.error('Error rendering variant, falling back to default:', error);
    return <AddressForm1 {...props} />;
  }
}

export default AddressForm;