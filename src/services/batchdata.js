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
    if (data && data.response && data.response.results) {
      const phoneNumbers = [];
      
      // Extract phone numbers from the response
      if (data.response.results.result && 
          data.response.results.result[0] && 
          data.response.results.result[0].results && 
          data.response.results.result[0].results.persons) {
        
        const persons = data.response.results.result[0].results.persons;
        
        persons.forEach(person => {
          if (person.phoneNumbers && Array.isArray(person.phoneNumbers)) {
            person.phoneNumbers.forEach(phone => {
              if (phone.number) {
                phoneNumbers.push(phone.number);
              }
            });
          }
        });
      }
      
      // Also extract emails if available
      const emails = [];
      if (data.response.results.result && 
          data.response.results.result[0] && 
          data.response.results.result[0].results && 
          data.response.results.result[0].results.persons) {
        
        const persons = data.response.results.result[0].results.persons;
        
        persons.forEach(person => {
          if (person.emails && Array.isArray(person.emails)) {
            person.emails.forEach(email => {
              if (email.email) {
                emails.push(email.email);
              }
            });
          }
        });
      }
      
      // Create result object with all the needed data
      const result = {
        phoneNumbers,
        emails,
        rawData: data // Store the raw response for debugging/future use
      };
      
      console.log(`Found ${phoneNumbers.length} BatchData phone numbers and ${emails.length} emails`);
      return result;
    }
    
    console.log('No BatchData phone numbers found for this address');
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