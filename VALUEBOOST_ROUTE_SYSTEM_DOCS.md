# ValueBoost Route-Based Campaign & Variant System Documentation

## Overview
This document describes the complete route-based system for the ValueBoost funnel that replaces the previous localStorage-dependent variant assignment system with a URL path-based approach for maximum reliability.

## System Architecture

### URL Structure
```
/analysis/{campaign}/{variant}
```

**Example URLs:**
- `/analysis/cash/a1o` - Cash campaign, A1O variant
- `/analysis/sell/a1i` - Sell campaign, A1I variant  
- `/analysis/value/a2o` - Value campaign, A2O variant
- `/analysis/equity/b2o` - Equity campaign, B2O variant

### Campaign Types
1. **cash** - Cash offer focused messaging
2. **sell** - Fast selling focused messaging  
3. **value** - Home value improvement messaging
4. **equity** - Home equity focused messaging

### Variant Types
1. **A1O** - A text, Layout 1 (original), Skip AI processing
2. **A1I** - A text, Layout 1 (original), Include AI processing
3. **A2O** - A text, Layout 2 (streamlined), Skip AI processing  
4. **B2O** - B text, Layout 2 (streamlined), Skip AI processing

## Component Flow Architecture

### Flow Paths by Variant:

**A1O Variant Flow:**
```
AddressForm (A text, OG layout) → ValueBoostReport (A text, OG layout) → END
```

**A1I Variant Flow:**
```
AddressForm (A text, OG layout) → AIProcessing → ValueBoostReport (A text, OG layout) → END
```

**A2O Variant Flow:**
```
AddressForm (A text, streamlined layout) → ValueBoostReport (A text, streamlined layout) → END
```

**B2O Variant Flow:**
```
AddressForm (B text, streamlined layout) → B2Step3 → ValueBoostQualifyingB2 → END
```

## Component Architecture

### Renamed Components
- `ValueBoostB2.jsx` → `B2Step3.jsx` (clarifies it's step 3 for B2 variants)
- `ValueBoostQualifying.jsx` → `ValueBoostQualifyingB2.jsx` (only used by B2 flow)

### Component Props
All ValueBoost components now accept:
```javascript
function Component({ campaign, variant }) {
  // campaign: 'cash', 'sell', 'value', 'equity'  
  // variant: 'A1O', 'A1I', 'A2O', 'B2O'
}
```

### Shared Components
- **AddressForm** - Used by ALL variants (A1, A2, B2)
- **AIProcessing** - Used only by A1I variant
- **ValueBoostReport** - Used by A1O, A1I, A2O variants  
- **B2Step3** - Used only by B2O variant
- **ValueBoostQualifyingB2** - Used only by B2O variant (after B2Step3)

## Template System

### Template Naming Convention
- **A Templates**: `cashA`, `sellA`, `valueA`, `equityA`, `defaultA`
- **B Templates**: `cashB2`, `sellB2`, `valueB2`, `equityB2` (plus `fastB2`, `wideB2` for legacy)

### Template Selection Logic
Each component uses campaign prop to select templates:
```javascript
const getDynamicContent = () => {
  const campaignName = campaign || 'cash'; // Use campaign prop from route
  
  // Campaign matching
  if (campaignName === 'cash') {
    return variant === 'B2O' ? templates.cashB2 : templates.cashA;
  }
  if (campaignName === 'sell') {
    return variant === 'B2O' ? templates.sellB2 : templates.sellA;
  }
  // etc...
};
```

### Layout Logic
- **Layout 1 (Original)**: A1O, A1I variants
- **Layout 2 (Streamlined)**: A2O, B2O variants

## FormContext Integration

### Route Data Parsing
```javascript
const getRouteData = () => {
  const path = window.location.pathname;
  const pathParts = path.split('/');
  
  if (pathParts[1] === 'analysis' && pathParts.length >= 4) {
    const campaign = pathParts[2]; // cash, sell, value, equity
    const variant = pathParts[3].toUpperCase(); // a1o -> A1O
    return { campaign, variant };
  }
  
  // Legacy fallbacks...
  return { campaign: 'cash', variant: 'A1O' };
};
```

### Backward Compatibility
- `getAssignedVariant()` - Returns just variant for legacy code
- `getRouteData()` - Returns both campaign and variant
- URL parameter analytics logic preserved (separate from routing)

## React Router Configuration

### Route Definitions (App.jsx)
```javascript
{/* All 16 explicit route combinations */}
<Route path="/analysis/cash/a1o" element={<ValueBoostContainer />} />
<Route path="/analysis/cash/a1i" element={<ValueBoostContainer />} />
<Route path="/analysis/cash/a2o" element={<ValueBoostContainer />} />
<Route path="/analysis/cash/b2o" element={<ValueBoostContainer />} />

<Route path="/analysis/sell/a1o" element={<ValueBoostContainer />} />
<Route path="/analysis/sell/a1i" element={<ValueBoostContainer />} />
<Route path="/analysis/sell/a2o" element={<ValueBoostContainer />} />
<Route path="/analysis/sell/b2o" element={<ValueBoostContainer />} />

<Route path="/analysis/value/a1o" element={<ValueBoostContainer />} />
<Route path="/analysis/value/a1i" element={<ValueBoostContainer />} />
<Route path="/analysis/value/a2o" element={<ValueBoostContainer />} />
<Route path="/analysis/value/b2o" element={<ValueBoostContainer />} />

<Route path="/analysis/equity/a1o" element={<ValueBoostContainer />} />
<Route path="/analysis/equity/a1i" element={<ValueBoostContainer />} />
<Route path="/analysis/equity/a2o" element={<ValueBoostContainer />} />
<Route path="/analysis/equity/b2o" element={<ValueBoostContainer />} />

{/* Dynamic fallback */}
<Route path="/analysis/:campaign/:variant" element={<ValueBoostContainer />} />

{/* Legacy routes */}
<Route path="/analysis" element={<ValueBoostContainer />} />
<Route path="/" element={<ValueBoostContainer />} />
```

## ValueBoostContainer Logic

### Prop Distribution
```javascript
const renderStep = () => {
  const { campaign, variant } = getRouteData();
  const currentStep = formData?.formStep || 1;

  switch (currentStep) {
    case 1:
      return <AddressForm campaign={campaign} variant={variant} />;
    case 2:
      return <AIProcessing campaign={campaign} variant={variant} />;
    case 3:
      if (variant === 'B2O') {
        return <B2Step3 campaign={campaign} variant={variant} />;
      }
      return <ValueBoostReport campaign={campaign} variant={variant} />;
    case 4:
      return <ValueBoostQualifyingB2 campaign={campaign} variant={variant} />;
    // etc...
  }
};
```

### Step Navigation Logic
AddressForm handles variant-based navigation:
```javascript
const handleStepNavigation = () => {
  if (variant === 'A1I') {
    nextStep(); // Go to AI Processing (step 2)
  } else {
    updateFormData({ formStep: 3 }); // Skip to report (step 3)
  }
};
```

## Template Content Differences

### A vs B Text Variants
- **A Templates**: Standard messaging, professional tone
- **B Templates**: More urgent/intensive messaging, stronger language

### Campaign-Specific Content
- **Cash**: Focus on immediate cash offers, fast closing
- **Sell**: Focus on fast selling without repairs  
- **Value**: Focus on maximizing home value and improvements
- **Equity**: Focus on unlocking hidden equity potential

## Key Benefits of Route-Based System

### Reliability
- ✅ **No localStorage dependencies** - eliminates data loss issues
- ✅ **URL-driven state** - variant never changes during session
- ✅ **Refresh-proof** - page refreshes maintain correct variant
- ✅ **Direct navigation** - URLs work when visited directly

### Analytics & Testing
- ✅ **Unique tracking** - each route has distinct analytics path
- ✅ **A/B testing precision** - exact control over variant distribution
- ✅ **Shareable links** - can send specific variant combinations
- ✅ **Campaign attribution** - clear campaign and variant tracking

### Development
- ✅ **Predictable behavior** - no random assignment complexity  
- ✅ **Easy debugging** - variant visible in URL
- ✅ **Component isolation** - each variant can be tested directly
- ✅ **Clean separation** - campaign content vs. variant logic

## Migration from Previous System

### What Was Removed
- Random variant assignment in FormContext
- localStorage variant storage and retrieval
- Complex variant migration logic
- URL parameter parsing for variants in components

### What Was Preserved  
- URL parameter parsing for analytics/tracking data
- Campaign data extraction for events/CRM
- All existing template content
- Component structure and styling

### Backward Compatibility
- Legacy `/analysis` and `/` routes still work
- Old variant detection falls back to A1O default
- Campaign parameter analytics still function
- All existing functionality preserved

## Complete Route Matrix (16 combinations)

| Campaign | A1O | A1I | A2O | B2O |
|----------|-----|-----|-----|-----|
| **cash** | /analysis/cash/a1o | /analysis/cash/a1i | /analysis/cash/a2o | /analysis/cash/b2o |
| **sell** | /analysis/sell/a1o | /analysis/sell/a1i | /analysis/sell/a2o | /analysis/sell/b2o |
| **value** | /analysis/value/a1o | /analysis/value/a1i | /analysis/value/a2o | /analysis/value/b2o |
| **equity** | /analysis/equity/a1o | /analysis/equity/a1i | /analysis/equity/a2o | /analysis/equity/b2o |

## Testing Guide

### Manual Testing URLs
Test each combination by visiting:
1. Direct URL navigation
2. Page refresh behavior  
3. Browser back/forward navigation
4. Link sharing functionality

### Expected Behavior
- Correct templates render based on campaign
- Correct variant flow (A1I shows AI processing, B2O goes to B2Step3)
- URL parameters still work for analytics
- No console errors or variant detection failures

## File Locations

### Core Files
- `/src/contexts/FormContext.jsx` - Route parsing logic
- `/src/components/HomeSurge/ValueBoost/ValueBoostContainer.jsx` - Prop distribution
- `/src/App.jsx` - Route definitions

### Component Files
- `/src/components/HomeSurge/ValueBoost/AddressForm.jsx`
- `/src/components/HomeSurge/ValueBoost/ValueBoostReport.jsx`  
- `/src/components/HomeSurge/ValueBoost/AIProcessing.jsx`
- `/src/components/HomeSurge/ValueBoost/B2Step3.jsx`
- `/src/components/HomeSurge/ValueBoost/ValueBoostQualifyingB2.jsx`
- `/src/components/HomeSurge/ValueBoost/AddressRetry.jsx`

This system provides 100% reliable variant and campaign control through URL paths while maintaining all existing functionality and analytics capabilities.