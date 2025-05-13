# Google Tag Manager & Facebook Integration Guide

This document provides detailed instructions for setting up Google Tag Manager (GTM) to properly track property values from the Melissa API and send them to both Google Analytics and Facebook.

## DataLayer Events Overview

The website pushes several events to the dataLayer:

1. `api_value` - When a property value is obtained from Melissa API
2. `formStepComplete` - When a user completes a form step
3. `formSubmission` - When a user submits the entire form
4. `addressSelected` - When a user selects an address

## GTM Configuration for api_value Event

The `api_value` event is particularly important for value-based audience targeting. Follow these steps to set it up correctly:

### 1. Create the Data Layer Variable

1. Go to **Variables** > **User-Defined Variables** > **New**
2. Configure the variable:
   - **Name**: `DLV - ApiValue`
   - **Variable Type**: Data Layer Variable
   - **Data Layer Variable Name**: `apiValue` (camelCase, exactly as shown)
   - **Data Layer Version**: Version 2
   - **Set Default Value**: Leave unchecked

### 2. Create the Custom Event Trigger

1. Go to **Triggers** > **New**
2. Configure the trigger:
   - **Name**: `Custom Event - Api Value`
   - **Trigger Type**: Custom Event
   - **Event Name**: `api_value` (with underscore, exactly as shown)
   - **This trigger fires on**: All Custom Events

### 3. Create the Tag

1. Go to **Tags** > **New**
2. Configure the tag:
   - **Name**: `GA4 - Api Value`
   - **Tag Type**: Google Analytics: GA4 Event
   - **Configuration Tag**: Select your GA4 Configuration tag
   - **Event Name**: `property_value_obtained`
   - **Event Parameters**:
     - `property_value` = {{DLV - ApiValue}}
     - `property_address` = {{Property Address}} (create this variable if needed)
     - `formatted_value` = {{Formatted Value}} (create this variable if needed)
   - **Triggering**: Select the `Custom Event - Api Value` trigger

### 4. Facebook Conversion API Integration (Optional)

If you're using Facebook Conversions API through GTM:

1. Create a new Tag:
   - **Name**: `FB - API Value Event`
   - **Tag Type**: Facebook Pixel
   - **Pixel ID**: Enter your Facebook Pixel ID
   - **Event Name**: Custom
   - **Custom Event Name**: `PropertyValueObtained`
   - **Event Parameters**:
     - `value` = {{DLV - ApiValue}}
     - `currency` = USD
     - `content_category` = Real Estate
     - `content_name` = Property Value Obtained
   - **Triggering**: Select the `Custom Event - Api Value` trigger

## Troubleshooting

If the event is not firing correctly, check the following:

1. **Timing Issues**: We've added a 1-second delay to the dataLayer push in AddressForm.jsx to ensure GTM has fully loaded. This should resolve timing issues.

2. **Event Names**: Make sure the event names match exactly. The dataLayer uses `api_value` (with underscore), and the GTM trigger must match this exactly.

3. **Variable Names**: The variable in the dataLayer is `apiValue` (camelCase), and your GTM data layer variable must match this exactly.

4. **Debug Mode**: Use Google Tag Assistant or the GTM Debug mode to monitor events. You should see:
   - The dataLayer event being pushed
   - The trigger firing
   - The tag executing

5. **Console Logs**: We've added additional console logs for debugging:
   - "PREPARING API_VALUE EVENT FOR DATALAYER" - When the event is being prepared
   - "SENDING DELAYED API_VALUE EVENT TO DATALAYER" - When the event is being pushed after delay
   - "DataLayer after delayed push" - Shows the dataLayer contents

## Value Handling

Important notes about value handling:

1. **Property Values**: All property values are in full dollar amounts (not cents). For example, a $300,000 house is represented as `300000` in the code.

2. **Value Scaling**:
   - Facebook events use the full dollar amount (e.g., `300000` for a $300,000 house)
   - The `conversionValue` in general analytics uses a "K" scale (e.g., `300` for a $300,000 house)

3. **Property Segmentation**: The Facebook Pixel code automatically segments properties in several ways:

   **Value Tiers**:
   - under_200k
   - 200k_300k
   - 300k_400k
   - 400k_500k
   - 500k_750k
   - 750k_1m
   - over_1m

   **Equity Tiers**:
   - no_equity
   - under_50k
   - 50k_100k
   - 100k_200k
   - 200k_300k
   - over_300k

   **Equity Percentage Tiers**:
   - no_equity
   - under_10_percent
   - 10_20_percent
   - 20_30_percent
   - 30_50_percent
   - 50_75_percent
   - over_75_percent

## Audience Building in Facebook Ads Manager

Once the events are firing correctly, you can create Custom Audiences in Facebook Ads Manager:

1. **Property Value Audiences**:
   - **Value Tier Audiences**:
     - Event: PropertyValueObtained
     - Parameter: value_tier
     - Operator: equals
     - Value: [select appropriate tier, e.g., "300k_400k"]
   - **Minimum Value Audiences**:
     - Event: PropertyValueObtained
     - Parameter: value
     - Operator: greater than
     - Value: [enter minimum value, e.g., 350000]

2. **Equity-Based Audiences**:
   - **Equity Tier Audiences**:
     - Event: PropertyValueObtained
     - Parameter: equity_tier
     - Operator: equals
     - Value: [select appropriate tier, e.g., "100k_200k"]
   - **High Equity Percentage Audiences**:
     - Event: PropertyValueObtained
     - Parameter: equity_percentage_tier
     - Operator: equals
     - Value: [select appropriate tier, e.g., "over_75_percent"]
   - **Exact Equity Targeting**:
     - Event: PropertyValueObtained
     - Parameter: property_equity
     - Operator: greater than
     - Value: [enter minimum equity, e.g., 150000]

3. **Combined Value & Equity Audiences**:
   - Create an audience with multiple conditions:
     - Condition 1: value_tier equals "300k_400k"
     - Condition 2: equity_tier equals "100k_200k"
   - This targets homeowners with specific value and equity combinations

4. **Form Step Audiences**:
   - Event: CompleteRegistration (for completed forms)
   - Event: Lead (for completed qualifying questions)
   - Event: AddPaymentInfo (for completed contact info)
   - Event: InitiateCheckout (for completed address)