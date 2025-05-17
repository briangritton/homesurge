# Simple Split Testing Guide

This guide explains how to use the split testing system in the SellForCash application.

## Quick Start

1. **View Original Form**: Go to `/view/original` to see the original form
2. **View Variant Form**: Go to `/view/variant1` to see and work on the variant
3. **Start Testing**: Go to `/split-test-admin` to start and monitor split tests

## Working With Variants

### Viewing & Editing a Variant

To view and edit the variant form:

1. Go to `/view/variant1` in your browser
2. Edit the variant file at `src/components/SplitTest/VariantPersonalInfoForm.jsx`
3. Refresh the page to see your changes

The direct URL path makes it easy to see exactly what you're working on.

### Creating New Variants

To create a new variant:

1. Create a new file in `src/components/SplitTest` (e.g., `Variant2PersonalInfoForm.jsx`)
2. Copy the structure from the existing variant
3. Make your desired changes
4. Use unique CSS class names (e.g., "v2-" prefix) to avoid conflicts
5. Update `PersonalInfoFormTest.jsx` to include your new variant
6. Add a new route in `App.jsx` to view your variant directly:

```jsx
<Route path="/view/variant2" element={
  <SimpleComponentViewer>
    <Variant2PersonalInfoForm />
  </SimpleComponentViewer>
} />
```

## Running Split Tests

### Starting a Test

1. Go to `/split-test-admin`
2. Click "Start Personal Info Form Test"
3. Users will now be assigned to different variants

### Monitoring Results

The admin page shows:
- Views for each variant
- Conversions for each variant
- Conversion rates
- Current winning variant

### Ending a Test

1. Go to `/split-test-admin`
2. Click "End Test"

## Tips for Effective Split Testing

1. **Test one element at a time**: Change only one thing in each variant
2. **Be patient**: Wait for enough data before drawing conclusions
3. **Document results**: Keep track of what worked and what didn't





 Perfect! I've created a clean variant of the PersonalInfoForm with:

  1. Identical functionality to the original form
  2. Unique CSS selectors (prefixed with "v1-") to avoid conflicts
  3. Clean structure that's easy to modify
  4. Isolated scope so changes won't affect the original component

  This sets you up with the perfect starting point to make your specific changes to the variant. You can now:

  1. Visit /view/original to see the original form
  2. Visit /view/variant1 to see your variant form
  3. Modify the variant directly in src/components/SplitTest/VariantPersonalInfoForm.jsx
  4. Refresh the variant page to see your changes

  When you're ready to run your split test, go to /split-test-admin and click "Start Personal Info Form
  Test". The system will then randomly assign users to either the original form or your variant form
  according to the 50/50 distribution we set up.

  You can customize the variant by changing:
  - The headline ("Please confirm your address and home value:")
  - The property value display
  - The overlay text and button labels
  - Any other elements as needed

  This setup gives you a solid foundation for your split testing with minimal complexity.