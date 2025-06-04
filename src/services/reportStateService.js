/**
 * Report State Service
 * Manages complex state transitions for ValueBoostReport component
 * Handles loading, unlocking, timeouts, and AI report processing
 */

class ReportStateService {
  /**
   * Initialize report state management
   * @param {Object} options - Configuration options
   * @returns {Object} Initial state object
   */
  static initializeState(options = {}) {
    return {
      // Core state flags
      unlocked: false,
      isLoading: false,
      processingTimeout: false,
      aiReportTimeout: false,
      
      // Data state
      aiReport: null,
      aiIntroduction: null,
      
      // Timing
      processingStartTime: Date.now(),
      unlockTime: null,
      
      // Configuration
      processingTimeoutMs: options.processingTimeoutMs || 15000, // 15 seconds
      aiReportTimeoutMs: options.aiReportTimeoutMs || 7000,     // 7 seconds
      
      // Callbacks
      onUnlock: options.onUnlock || null,
      onTimeout: options.onTimeout || null,
      onAIReportReady: options.onAIReportReady || null
    };
  }

  /**
   * Process state transitions based on current state and data
   * @param {Object} currentState - Current report state
   * @param {Object} formData - Form data context
   * @returns {Object} Updated state object
   */
  static processStateTransitions(currentState, formData) {
    const newState = { ...currentState };
    const now = Date.now();

    // Check if we should auto-unlock based on data availability
    if (!newState.unlocked && this.shouldAutoUnlock(formData)) {
      newState.unlocked = true;
      newState.unlockTime = now;
      console.log('🔓 ReportStateService: Auto-unlocking report based on data availability');
    }

    // Check for processing timeout
    if (!newState.processingTimeout && !newState.unlocked) {
      const processingTime = now - newState.processingStartTime;
      if (processingTime > newState.processingTimeoutMs) {
        newState.processingTimeout = true;
        newState.unlocked = true; // Auto-unlock on timeout
        newState.unlockTime = now;
        console.log('⏰ ReportStateService: Processing timeout reached, auto-unlocking');
      }
    }

    // Check for AI report timeout after unlock
    if (newState.unlocked && !newState.aiReportTimeout && !newState.aiReport) {
      const unlockTime = newState.unlockTime || now;
      const aiWaitTime = now - unlockTime;
      if (aiWaitTime > newState.aiReportTimeoutMs) {
        newState.aiReportTimeout = true;
        console.log('⏰ ReportStateService: AI report timeout reached');
      }
    }

    return newState;
  }

  /**
   * Determine if report should auto-unlock based on available data
   * @param {Object} formData - Form data context
   * @returns {boolean} Whether to auto-unlock
   */
  static shouldAutoUnlock(formData) {
    // Check for required data availability
    const hasAddress = formData.selectedSuggestionAddress || formData.street;
    const hasPropertyValue = formData.apiEstimatedValue > 0;
    const hasOwnerName = formData.apiOwnerName;
    
    // Unlock if we have address and either property value or owner name
    return hasAddress && (hasPropertyValue || hasOwnerName);
  }

  /**
   * Handle AI report data processing
   * @param {string} reportText - Raw AI report text
   * @returns {Object} Processed AI report data
   */
  static processAIReport(reportText) {
    if (!reportText || typeof reportText !== 'string') {
      return {
        cleanedReport: null,
        introduction: null,
        isValid: false
      };
    }

    console.log('🤖 ReportStateService: Processing AI report data');

    // Clean the report content
    const cleanedReport = this.cleanAIReportContent(reportText);
    
    // Extract introduction paragraph
    const introduction = this.extractAIIntroduction(cleanedReport);

    return {
      cleanedReport,
      introduction,
      isValid: cleanedReport.length > 100 // Minimum viable report length
    };
  }

  /**
   * Clean AI report content by removing unwanted elements
   * @param {string} reportText - Raw report text
   * @returns {string} Cleaned report text
   */
  static cleanAIReportContent(reportText) {
    if (!reportText) return '';

    return reportText
      // Remove email signatures
      .replace(/Best Regards,?\s*\[?Your Name\]?/gi, '')
      .replace(/Best Regards,?\s*$/gmi, '')
      .replace(/Sincerely,?\s*\[?Your Name\]?/gi, '')
      .replace(/Sincerely,?\s*$/gmi, '')
      
      // Remove extra whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * Extract AI introduction from report content
   * @param {string} reportText - Cleaned report text
   * @returns {string|null} Extracted introduction or null
   */
  static extractAIIntroduction(reportText) {
    if (!reportText) return null;

    const lines = reportText.split('\n');
    let introStart = -1;
    let introEnd = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Find start of introduction (after title)
      if (line.includes('ValueBoost AI Analysis Report') || line.includes('OfferBoost AI Analysis Report')) {
        introStart = i + 1;
      }
      
      // Find end of introduction (before property details)
      if (introStart > -1 && (line.startsWith('Property:') || line.includes('Current Estimated Value:'))) {
        introEnd = i;
        break;
      }
    }

    if (introStart > -1 && introEnd > introStart) {
      const introLines = lines.slice(introStart, introEnd)
        .filter(line => line.trim().length > 0)
        .map(line => line.trim());
      
      return introLines.join(' ');
    }

    return null;
  }

  /**
   * Handle report unlock action
   * @param {Object} currentState - Current report state
   * @param {Object} formData - Form data context
   * @returns {Object} Updated state after unlock
   */
  static handleUnlock(currentState, formData) {
    console.log('🔓 ReportStateService: Handling manual unlock');

    const newState = {
      ...currentState,
      unlocked: true,
      unlockTime: Date.now(),
      isLoading: false
    };

    // Check for AI report in localStorage
    const storedReport = localStorage.getItem('aiHomeReport');
    if (storedReport) {
      const processedReport = this.processAIReport(storedReport);
      newState.aiReport = processedReport.cleanedReport;
      newState.aiIntroduction = processedReport.introduction;
      console.log('📋 ReportStateService: Loaded AI report from localStorage');
    }

    return newState;
  }

  /**
   * Get current state summary for debugging
   * @param {Object} state - Current state object
   * @param {Object} formData - Form data context
   * @returns {Object} State summary
   */
  static getStateSummary(state, formData) {
    const now = Date.now();
    const processingTime = now - state.processingStartTime;
    const unlockTime = state.unlockTime ? now - state.unlockTime : 0;

    return {
      phase: this.getCurrentPhase(state),
      unlocked: state.unlocked,
      hasAIReport: !!state.aiReport,
      hasIntroduction: !!state.aiIntroduction,
      processingTime,
      unlockTime,
      timeouts: {
        processing: state.processingTimeout,
        aiReport: state.aiReportTimeout
      },
      dataAvailability: {
        hasAddress: !!(formData.selectedSuggestionAddress || formData.street),
        hasPropertyValue: formData.apiEstimatedValue > 0,
        hasOwnerName: !!formData.apiOwnerName
      }
    };
  }

  /**
   * Get current phase of the report
   * @param {Object} state - Current state object
   * @returns {string} Current phase name
   */
  static getCurrentPhase(state) {
    if (!state.unlocked && !state.processingTimeout) {
      return 'processing';
    } else if (state.unlocked && !state.aiReport && !state.aiReportTimeout) {
      return 'waiting_for_ai';
    } else if (state.unlocked && state.aiReport) {
      return 'report_ready';
    } else if (state.aiReportTimeout) {
      return 'ai_timeout';
    } else {
      return 'unlocked_no_ai';
    }
  }

  /**
   * Create timeout handlers for state management
   * @param {Object} state - Current state object
   * @param {Function} updateState - State update function
   * @returns {Object} Timeout handler functions
   */
  static createTimeoutHandlers(state, updateState) {
    const timeoutIds = {};

    // Processing timeout handler
    if (!state.unlocked && !state.processingTimeout) {
      timeoutIds.processing = setTimeout(() => {
        console.log('⏰ ReportStateService: Processing timeout triggered');
        updateState(prevState => ({
          ...prevState,
          processingTimeout: true,
          unlocked: true,
          unlockTime: Date.now()
        }));
      }, state.processingTimeoutMs);
    }

    // AI report timeout handler (after unlock)
    if (state.unlocked && !state.aiReport && !state.aiReportTimeout) {
      const waitTime = state.unlockTime ? Date.now() - state.unlockTime : 0;
      const remainingTime = Math.max(0, state.aiReportTimeoutMs - waitTime);
      
      if (remainingTime > 0) {
        timeoutIds.aiReport = setTimeout(() => {
          console.log('⏰ ReportStateService: AI report timeout triggered');
          updateState(prevState => ({
            ...prevState,
            aiReportTimeout: true
          }));
        }, remainingTime);
      }
    }

    return {
      timeoutIds,
      cleanup: () => {
        Object.values(timeoutIds).forEach(id => clearTimeout(id));
      }
    };
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  static getStats() {
    return {
      service: 'ReportStateService',
      version: '1.0.0',
      features: [
        'State transition management',
        'Auto-unlock logic',
        'Timeout handling',
        'AI report processing',
        'Content cleaning'
      ],
      defaultTimeouts: {
        processing: 15000,
        aiReport: 7000
      }
    };
  }
}

// Export singleton-style service
export const reportStateService = ReportStateService;
export default ReportStateService;