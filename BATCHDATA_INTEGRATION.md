# BatchData Integration Documentation

This document outlines the integration of BatchData (formerly BatchSkipTracing) with the SellForCash lead generation system. BatchData is used to lookup phone numbers and emails based on property addresses submitted through the form.

## Overview

The integration makes a background API call to BatchData's Skip Tracing service whenever a user submits an address through the form. The API returns phone numbers and emails associated with the property owners, which are then stored in Firebase separately from user-provided contact information.

## Setup

1. **API Key**: You need a BatchData API key to use this integration. Set this in your environment variables:
   ```
   REACT_APP_BATCHDATA_API_KEY=your_batchdata_api_key_here
   ```

2. **Environment Files**: 
   - For local development, add the API key to `.env.local`
   - For production deployment, add the API key to your hosting environment variables

## Components

The integration consists of two main components:

### 1. BatchData Service (`src/services/batchdata.js`)

This service handles all API communication with BatchData, including:
- Formatting address data for the API request
- Making authenticated API calls with proper error handling
- Parsing response data to extract phone numbers and emails
- Providing helper functions for formatting phone numbers

### 2. Address Form Integration (`src/components/Form/AddressForm.jsx`)

The Address Form component has been updated to:
- Import the BatchData service
- Call the phone number lookup function in the background after address selection
- Store BatchData results in Firebase separately from user-entered data

## Data Flow

1. User enters/selects an address in the form
2. The address is validated and submitted to Firebase
3. In parallel, the address is sent to BatchData API
4. When BatchData returns phone numbers, they are added to the Firebase lead record
5. BatchData data is kept separate from user-entered data with distinct field names

## Firebase Data Structure

BatchData results are stored in these Firebase fields:
- `batchDataPhoneNumbers`: Array of phone numbers found by BatchData
- `batchDataEmails`: Array of emails found by BatchData
- `batchDataProcessed`: Boolean indicating whether BatchData processing was completed
- `batchDataProcessedAt`: Timestamp of when the BatchData results were processed

## Error Handling

The integration includes robust error handling:
- Timeouts to prevent API calls from hanging indefinitely
- Full request-response error logging for debugging
- Non-blocking API calls that won't interrupt user flow if they fail
- Fallbacks to preserve user experience if API errors occur

## Testing

To test the BatchData integration:
1. Ensure you have a valid API key set in your environment
2. Submit an address through the form
3. Check the browser console for BatchData API logging
4. Verify that phone numbers and emails are saved in Firebase

## Limitations

- BatchData API calls are subject to account limits and billing
- Not all addresses will return phone numbers or emails
- BatchData results are not guaranteed to be current or accurate

## Future Enhancements

Potential improvements to consider:
- Add UI elements to display BatchData results in the CRM dashboard
- Implement rate limiting to manage API usage
- Add caching to avoid redundant API calls for the same address
- Create admin settings to enable/disable BatchData integration