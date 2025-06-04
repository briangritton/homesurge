import axios from 'axios';

/**
 * Lookup phone numbers for a property address using BatchData's Skip Tracing API
 * @param {Object} address - The property address
 * @param {string} address.street - Street address
 * @param {string} address.city - City
 * @param {string} address.state - State
 * @param {string} address.zip - ZIP code
 * @returns {Promise<Object|null>} - Contact information or null if error
 */
export async function lookupPhoneNumbers(address) {
  if (!address || !address.street) {
    console.warn('No address provided for BatchData phone lookup');
    return null;
  }
  
  try {
    // Use environment variable for API key
    const apiKey = process.env.REACT_APP_BATCHDATA_API_KEY;
    
    // Check if API key is available
    if (!apiKey) {
      console.error('BatchData API key is missing. Please check your environment variables.');
      return null;
    }
    
    // Construct request payload
    const payload = {
      requests: [
        {
          propertyAddress: {
            street: address.street,
            city: address.city || '',
            state: address.state || '',
            zip: address.zip || ''
          }
        }
      ]
    };
    
    console.log(`Looking up BatchData phone numbers for address: ${address.street}`);
    console.log('BatchData request payload:', JSON.stringify(payload, null, 2));
    
    // Make API request with timeout
    const { data } = await axios({
      method: 'post',
      url: 'https://api.batchdata.com/api/v1/property/skip-trace',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      data: payload,
      timeout: 8000 // 8 second timeout
    }).catch(error => {
      console.warn('BatchData phone lookup failed:', error.message);
      // Return empty data to allow the form flow to continue
      return { data: { response: { results: { result: [] } } } };
    });
    
    // Parse and extract phone numbers from response
    console.log('BatchData API Response:', JSON.stringify(data, null, 2));
    
    if (data && data.results && data.results.persons) {
      const phoneNumbers = [];
      const emails = [];
      
      // Extract phone numbers and emails from the persons array
      data.results.persons.forEach(person => {
        // Extract phone numbers
        if (person.phoneNumbers && Array.isArray(person.phoneNumbers)) {
          person.phoneNumbers.forEach(phone => {
            if (phone.number) {
              phoneNumbers.push(phone.number);
            }
          });
        }
        
        // Extract emails
        if (person.emails && Array.isArray(person.emails)) {
          person.emails.forEach(email => {
            if (email.email) {
              emails.push(email.email);
            }
          });
        }
      });
      
      // Create result object with all the needed data
      const result = {
        phoneNumbers,
        emails,
        rawData: data // Store the raw response for debugging/future use
      };
      
      console.log(`✅ Found ${phoneNumbers.length} BatchData phone numbers and ${emails.length} emails`);
      return result;
    }
    
    console.log('No BatchData contact data found - data.results.persons missing or empty');
    return null;
  } catch (error) {
    console.error('Error looking up BatchData phone numbers:', error);
    if (error.response) {
      console.error('API response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received from API');
    } else {
      console.error('Error message:', error.message);
    }
    // Return null instead of throwing, so the app continues to work
    return null;
  }
}

/**
 * Lookup contact information and save to CRM independently
 * @param {string} address - The validated property address from Google Places
 * @returns {Promise<Object|null>} Contact information or null if not found/error
 */
export async function lookupAndSave(address) {
  try {
    console.log('🔍 BatchData: Starting lookup and save for:', address);
    
    // Parse address into components for BatchData API
    const addressParts = parseAddressForBatchData(address);
    if (!addressParts) {
      console.log('⚠️ BatchData: Could not parse address components');
      return null;
    }
    
    // Do the contact lookup
    const batchData = await lookupPhoneNumbers(addressParts);
    
    if (batchData) {
      // Save to CRM independently
      const { leadService } = await import('./leadOperations.js');
      await leadService.saveBatchData(batchData);
      console.log('✅ BatchData: Contact data retrieved and saved to CRM');
    } else {
      console.log('⚠️ BatchData: No contact data found for address');
    }
    
    return batchData;
  } catch (error) {
    console.error('❌ BatchData: Lookup and save failed:', error);
    return null;
  }
}

/**
 * Parse Google Places formatted address into components for BatchData
 * @param {string} address - Formatted address string
 * @returns {Object|null} Address components or null if parsing fails
 */
function parseAddressForBatchData(address) {
  try {
    // Simple parsing for "123 Main St, City, State 12345" format
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      const street = parts[0];
      const city = parts[1];
      const stateZip = parts[2].split(' ');
      const state = stateZip[0];
      const zip = stateZip[1];
      
      return { street, city, state, zip };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing address for BatchData:', error);
    return null;
  }
}

/**
 * Format a phone number to standard format (XXX) XXX-XXXX
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} - Formatted phone number
 */
export function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';
  
  // Remove all non-digits
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  // Check if it's a valid 10-digit number
  if (cleaned.length !== 10) {
    return phoneNumber; // Return original if not 10 digits
  }
  
  // Format as (XXX) XXX-XXXX
  return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
}

export default {
  lookupPhoneNumbers,
  formatPhoneNumber
};