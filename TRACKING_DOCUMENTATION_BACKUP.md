# Comprehensive Tracking Documentation

This document provides a complete overview of tracking implementations for SellForCash.online, including both Google Analytics and Facebook/Meta Pixel events.

## Table of Contents

1. [Google Analytics Tracking](#google-analytics-tracking)
2. [Facebook/Meta Pixel Tracking](#facebookmeta-pixel-tracking)
3. [Custom Events](#custom-events)
4. [Audience Building](#audience-building)

---

## Google Analytics Tracking

*[Note: Please add your existing Google Analytics tracking documentation here]*

---

## Facebook/Meta Pixel Tracking

### Pixel Configuration

- **Pixel ID**: 230683406108508
- **Implementation**: Client-side only (browser-based)
- **Events**: Using standard Facebook events for optimal audience building
- **File**: `src/services/facebook.js`

### Standard Events

| Event Name | Trigger Point | Description | Parameters |
|------------|--------------|------------|------------|
| PageView | Any page view/route change | Tracks page views across site | N/A |
| ViewContent | Any page view/route change | More detailed version of PageView with content info | content_name, content_type, content_ids |
| InitiateCheckout | Address form submission | User submits address form (first step) | step: 1, step_name: "Address Form Completed" |
| AddPaymentInfo | Contact info submission | User submits name and phone details (second step) | step: 2, step_name: "Personal Info Form Completed", content_name: "Contact Info Provided" |
| Lead | Form completion | User completes qualifying info (third step) | content_category: "Real Estate", value: [property value], currency: "USD" |
| CompleteRegistration | Thank You page | User reaches thank you page (final step) | content_name: "Form Completed", value: [property value], currency: "USD" |

### Custom Events

| Event Name | Trigger Point | Description | Parameters |
|------------|--------------|------------|------------|
| PropertyValueObtained | When Melissa API returns property value | Tracks estimated property value | value: [property value], currency: "USD", value_tier: [value range], property_address, estimated_value, formatted_value |

### Value Tiers for Property Values

The `PropertyValueObtained` event includes a `value_tier` parameter for easier audience segmentation:

- `under_200k`: Property value < $200,000
- `200k_300k`: Property value $200,000 - $299,999
- `300k_400k`: Property value $300,000 - $399,999
- `400k_500k`: Property value $400,000 - $499,999
- `500k_750k`: Property value $500,000 - $749,999
- `750k_1m`: Property value $750,000 - $999,999
- `over_1m`: Property value $1,000,000+

### Facebook Audience Building

Based on these events, the following audience segments can be created in Facebook Ads Manager:

1. **Website Visitors**: All users who triggered PageView/ViewContent events
2. **Form Started**: Users who triggered InitiateCheckout (entered address)
3. **Contact Info Provided**: Users who triggered AddPaymentInfo (provided name/phone)
4. **Qualified Leads**: Users who triggered Lead event (completed form)
5. **Property Value Segments**: Users by property value ranges based on PropertyValueObtained event

### Retargeting Audiences

1. **Address Abandonment**: Include [InitiateCheckout], Exclude [AddPaymentInfo]
2. **Contact Info Abandonment**: Include [AddPaymentInfo], Exclude [Lead]
3. **High-Value Properties**: Include [PropertyValueObtained] with value_tier = "over_1m" or "750k_1m"
4. **Mid-Range Properties**: Include [PropertyValueObtained] with value_tier between "300k_400k" and "500k_750k"
5. **Budget Properties**: Include [PropertyValueObtained] with value_tier = "under_200k" or "200k_300k"

---

## Custom Events

### Property Value Event

This custom event is sent to both Google Analytics and Facebook when a property value is obtained from the Melissa API:

**Google Analytics Implementation:**
- **Event Name**: `api_value`
- **Parameter**: `apiValue` (property value)
- **Additional Parameters**: 
  - `propertyAddress` (property address)
  - `formattedValue` (formatted value with currency symbol)
  - `propertyEquity` (equity amount)
  - `propertyEquityPercentage` (equity percentage)

**Facebook Implementation:**
- **Event Name**: `PropertyValueObtained`
- **Parameters**: As documented in the Facebook Custom Events section above

---

## Audience Building

### Google Analytics Audiences

*[Note: Please add your existing Google Analytics audience building documentation here]*

### Facebook Audiences

Create the following audiences in Facebook Ads Manager:

1. **All Website Visitors**
   - Source: Website
   - People who: Visited your website
   - In the last: 180 days

2. **Started Form (Entered Address)**
   - Source: Website
   - People who: Performed the event "InitiateCheckout"
   - In the last: 180 days

3. **Provided Contact Info**
   - Source: Website
   - People who: Performed the event "AddPaymentInfo"
   - In the last: 180 days

4. **Complete Leads**
   - Source: Website
   - People who: Performed the event "Lead"
   - In the last: 180 days

5. **High-Value Property Interests**
   - Source: Website
   - People who: Performed the custom event "PropertyValueObtained"
   - With parameters: value_tier = "over_1m" OR value_tier = "750k_1m"
   - In the last: 180 days

6. **Mid-Value Property Interests**
   - Source: Website
   - People who: Performed the custom event "PropertyValueObtained"
   - With parameters: value_tier = "500k_750k" OR value_tier = "400k_500k" OR value_tier = "300k_400k"
   - In the last: 180 days

7. **Budget Property Interests**
   - Source: Website
   - People who: Performed the custom event "PropertyValueObtained"
   - With parameters: value_tier = "200k_300k" OR value_tier = "under_200k"
   - In the last: 180 days

8. **Form Abandonment (Address Step)**
   - Include: People who performed "InitiateCheckout"
   - Exclude: People who performed "AddPaymentInfo"
   - In the last: 180 days

9. **Form Abandonment (Contact Info Step)**
   - Include: People who performed "AddPaymentInfo"
   - Exclude: People who performed "Lead"
   - In the last: 180 days