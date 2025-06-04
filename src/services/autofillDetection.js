/**
 * Autofill Detection Service
 * Unified browser autofill detection using multiple methods
 */

class AutofillDetectionService {
  constructor() {
    this.isEnabled = true;
    this.detectedFields = new Set();
    this.listeners = [];
    this.onAutofillCallback = null;
    this.onFieldCallback = null;
    this.formRef = null;
    this.inputRef = null;
  }

  /**
   * Initialize autofill detection on a form
   * @param {Object} options - Configuration options
   * @param {Function} options.onAutofillDetected - Callback when autofill is detected
   * @param {Function} options.onFieldAutofilled - Callback when a field is autofilled
   * @param {React.RefObject} options.formRef - Form reference
   * @param {React.RefObject} options.inputRef - Main input reference
   * @param {boolean} options.enabled - Whether detection is enabled
   */
  initDetection({ onAutofillDetected, onFieldAutofilled, formRef, inputRef, enabled = true }) {
    this.isEnabled = enabled;
    this.onAutofillCallback = onAutofillDetected;
    this.onFieldCallback = onFieldAutofilled;
    this.formRef = formRef;
    this.inputRef = inputRef;

    if (!this.isEnabled) {
      console.log('🔇 Autofill detection disabled');
      return;
    }

    console.log('🤖 Initializing autofill detection');

    // Clear previous state
    this.cleanup();
    this.detectedFields.clear();

    // Initialize detection methods
    this.initAnimationDetection();
    this.initRapidInputDetection();
    this.addAutofillCSS();

    console.log('✅ Autofill detection initialized');
  }

  /**
   * CSS Animation-based autofill detection
   * Works by detecting CSS animations triggered by browser autofill
   */
  initAnimationDetection() {
    const handleAnimationStart = (e) => {
      if (e.animationName === 'onAutoFillStart') {
        console.log('🎬 Animation autofill detected on:', e.target.name);
        this.handleFieldAutofill(e.target.name, e.target.value);
      }
    };

    // Add listeners to form inputs
    if (this.formRef?.current) {
      const inputs = this.formRef.current.querySelectorAll('input[name]');
      inputs.forEach(input => {
        input.addEventListener('animationstart', handleAnimationStart);
        this.listeners.push(() => {
          input.removeEventListener('animationstart', handleAnimationStart);
        });
      });
    }
  }

  /**
   * Rapid input detection for autofill
   * Detects when multiple fields are filled almost simultaneously
   */
  initRapidInputDetection() {
    let lastInputTime = 0;
    let rapidInputTimer = null;

    const handleInput = (e) => {
      const now = Date.now();
      
      // Detect rapid inputs (< 50ms apart)
      if (now - lastInputTime < 50 && e.target.value) {
        console.log('⚡ Rapid input autofill detected on:', e.target.name);
        this.handleFieldAutofill(e.target.name, e.target.value);
        
        // Clear existing timer
        if (rapidInputTimer) {
          clearTimeout(rapidInputTimer);
        }
        
        // Check for complete autofill after brief delay
        rapidInputTimer = setTimeout(() => {
          this.checkAutofillCompletion();
        }, 100);
      }
      
      lastInputTime = now;
    };

    // Add listeners to form inputs
    if (this.formRef?.current) {
      const inputs = this.formRef.current.querySelectorAll('input[name]');
      inputs.forEach(input => {
        input.addEventListener('input', handleInput);
        this.listeners.push(() => {
          input.removeEventListener('input', handleInput);
        });
      });
    }
  }

  /**
   * Handle individual field autofill
   * @param {string} fieldName - Name of the autofilled field
   * @param {string} value - Autofilled value
   */
  handleFieldAutofill(fieldName, value) {
    if (!value || !fieldName) return;

    // Add to detected fields
    this.detectedFields.add(fieldName);

    // Process field data
    const fieldData = this.processAutofillField(fieldName, value);
    
    // Call field callback
    if (this.onFieldCallback && Object.keys(fieldData).length > 0) {
      this.onFieldCallback(fieldData);
    }

    // Check if we have enough data for full autofill callback
    this.checkAutofillCompletion();
  }

  /**
   * Process autofilled field data
   * @param {string} fieldName - Field name
   * @param {string} value - Field value
   * @returns {Object} Processed field data
   */
  processAutofillField(fieldName, value) {
    const fieldData = {};

    switch (fieldName) {
      case 'name':
        fieldData.autoFilledName = value;
        fieldData.nameWasAutofilled = true;
        break;
      case 'tel':
        fieldData.autoFilledPhone = value;
        break;
      case 'address-line1':
        fieldData.street = value;
        fieldData.addressSelectionType = 'BrowserAutofill';
        break;
      case 'email':
        fieldData.autoFilledEmail = value;
        break;
    }

    return fieldData;
  }

  /**
   * Check if autofill is complete and trigger callback
   */
  checkAutofillCompletion() {
    const fields = Array.from(this.detectedFields);
    
    // Check for complete autofill (address + contact info)
    const hasAddress = fields.includes('address-line1');
    const hasContact = fields.includes('name') || fields.includes('tel');
    const hasMultipleFields = fields.length > 1;

    if ((hasAddress && hasContact) || hasMultipleFields) {
      console.log('🎯 Complete autofill detected:', fields);
      
      // Gather all autofilled data
      const autofillData = this.gatherAutofillData();
      
      // Call main autofill callback
      if (this.onAutofillCallback && autofillData) {
        this.onAutofillCallback(autofillData);
      }
    }
  }

  /**
   * Gather all currently autofilled data from form
   * @returns {Object} All autofilled data
   */
  gatherAutofillData() {
    if (!this.formRef?.current) return null;

    const data = {};
    const inputs = this.formRef.current.querySelectorAll('input[name]');
    
    inputs.forEach(input => {
      if (input.value && this.detectedFields.has(input.name)) {
        const fieldData = this.processAutofillField(input.name, input.value);
        Object.assign(data, fieldData);
      }
    });

    // Add metadata
    data.autofillDetectedAt = new Date().toISOString();
    data.autofillDetectedFields = Array.from(this.detectedFields);
    data.leadStage = 'Browser Autofill Detected';

    return Object.keys(data).length > 3 ? data : null; // Minimum 3 fields + metadata
  }

  /**
   * Add CSS for autofill detection
   */
  addAutofillCSS() {
    // Check if CSS already exists
    if (document.getElementById('autofill-detection-css')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'autofill-detection-css';
    style.textContent = `
      @keyframes onAutoFillStart {
        from { background: transparent; }
        to { background: transparent; }
      }
      
      input:-webkit-autofill {
        animation-name: onAutoFillStart;
        animation-duration: 1ms;
        animation-fill-mode: both;
      }
      
      /* Preserve autofill styling */
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus {
        -webkit-text-fill-color: inherit !important;
        -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
        transition: background-color 5000s ease-in-out 0s !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Manual autofill trigger for testing
   * @param {Object} testData - Test autofill data
   */
  triggerAutofill(testData = {}) {
    console.log('🧪 Manually triggering autofill for testing');
    
    const defaultData = {
      autoFilledName: 'Test User',
      autoFilledPhone: '(555) 123-4567',
      street: '123 Test Street, Test City, TX 12345',
      addressSelectionType: 'BrowserAutofill',
      leadStage: 'Browser Autofill Detected (Test)',
      autofillDetectedAt: new Date().toISOString()
    };

    const data = { ...defaultData, ...testData };
    
    if (this.onAutofillCallback) {
      this.onAutofillCallback(data);
    }
  }

  /**
   * Get detection statistics
   * @returns {Object} Detection stats
   */
  getStats() {
    return {
      isEnabled: this.isEnabled,
      detectedFields: Array.from(this.detectedFields),
      listenerCount: this.listeners.length,
      hasFormRef: !!this.formRef?.current,
      hasInputRef: !!this.inputRef?.current
    };
  }

  /**
   * Enable/disable autofill detection
   * @param {boolean} enabled - Whether to enable detection
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    
    if (!enabled) {
      this.cleanup();
      console.log('🔇 Autofill detection disabled');
    } else {
      console.log('🔊 Autofill detection enabled');
    }
  }

  /**
   * Reset detection state
   */
  reset() {
    this.detectedFields.clear();
    console.log('🔄 Autofill detection reset');
  }

  /**
   * Cleanup all listeners and state
   */
  cleanup() {
    // Remove all event listeners
    this.listeners.forEach(removeListener => removeListener());
    this.listeners = [];

    // Remove CSS
    const styleElement = document.getElementById('autofill-detection-css');
    if (styleElement) {
      styleElement.remove();
    }

    console.log('🧹 Autofill detection cleaned up');
  }
}

// Export singleton instance
export const autofillService = new AutofillDetectionService();
export default autofillService;