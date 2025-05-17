# Simple Split Testing Guide

This guide explains how to use the split testing system in the SellForCash application.

## Quick Start

1. **View & Edit Variants**: Go to `/test-variants` to work on variant forms
2. **Start Testing**: Go to `/split-test-admin` to start and monitor split tests

## Working With Variants

### Viewing & Editing a Variant

To view and edit a variant:

1. Go to `/test-variants` in your browser
2. Click "View Variant 1" to see your variant
3. Edit the variant file at `src/components/SplitTest/VariantPersonalInfoForm.jsx`
4. Refresh the page to see your changes

The test page makes it easy to switch between the original and your variant to compare them.

### Creating New Variants

To create a new variant:

1. Create a new file in `src/components/SplitTest` (e.g., `Variant2PersonalInfoForm.jsx`)
2. Copy the structure from an existing variant
3. Make your desired changes
4. Use unique CSS class names (e.g., "v2-" prefix) to avoid conflicts
5. Update `PersonalInfoFormTest.jsx` to include your new variant
6. Update `TestVariantPage.jsx` to include a button for your new variant

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