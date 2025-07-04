/**
 * Validates a US phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function validatePhone(phone) {
    if (!phone) return false;
    
    // Strip all non-numeric characters
    const strippedPhone = phone.replace(/\D/g, '');
    
    // Check for 10-13 digits (allowing for country code)
    return /^[0-9]{10,13}$/.test(strippedPhone);
  }
  
  /**
   * Validates an email address
   * @param {string} email - The email to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  export function validateEmail(email) {
    if (!email) return true; // Email is optional
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validates a street address
   * @param {string} address - The address to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  export function validateAddress(address) {
    if (!address) return false;
    
    // Basic check for minimum length
    return address.trim().length >= 5;
  }
  
  /**
   * Validates a name
   * @param {string} name - The name to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  export function validateName(name) {
    if (!name) return false;
    
    // Basic check for minimum length and no numbers
    const nameRegex = /^[A-Za-z\s\-'.]+$/;
    return name.trim().length >= 2 && nameRegex.test(name);
  }
  
  /**
   * Validates a zip code
   * @param {string} zip - The zip code to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  export function validateZip(zip) {
    if (!zip) return true; // Zip is optional if we get it from Google Maps
    
    // US zip code format (5 digits or 5+4)
    const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    return zipRegex.test(zip);
  }
  
  /**
   * Returns error messages for form fields
   * @param {Object} formData - The form data to validate
   * @returns {Object} - Object with field names as keys and error messages as values
   */
  export function getFormErrors(formData) {
    const errors = {};
    
    // Validate based on form step
    if (formData.formStep === 1) {
      // Address validation
      if (!validateAddress(formData.street)) {
        errors.street = "Please enter a valid address";
      }
    } else if (formData.formStep === 2) {
      // Name and phone validation
      if (!validateName(formData.name)) {
        errors.name = "Please enter a valid name";
      }
      if (!validatePhone(formData.phone)) {
        errors.phone = "Please enter a valid phone number";
      }
      // Optional email validation
      if (formData.email && !validateEmail(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }
    
    return errors;
  }