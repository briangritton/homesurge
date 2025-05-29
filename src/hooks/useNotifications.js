import { useEffect, useRef } from 'react';
import { sendConditionalNotifications } from '../services/notifications.js';

/**
 * Custom hook for handling automatic notifications based on form state changes
 * All notifications run asynchronously and never block user progression
 */
export const useNotifications = (formData) => {
  // Track previous state to detect changes
  const prevFormDataRef = useRef({});
  const notificationsSentRef = useRef(new Set());

  // Helper function to send notifications safely (never blocks)
  const sendNotificationSafely = async (leadData, notificationType) => {
    // Create unique key to prevent duplicate notifications
    const notificationKey = `${notificationType}_${leadData.name || 'unknown'}_${leadData.phone || 'unknown'}_${leadData.street || 'unknown'}`;
    
    // Skip if we've already sent this notification
    if (notificationsSentRef.current.has(notificationKey)) {
      console.log(`🔔 Skipping duplicate ${notificationType} notification:`, notificationKey);
      return;
    }
    
    try {
      console.log(`🔔 Triggering ${notificationType} notification in background...`);
      
      // Send notification asynchronously without blocking
      setTimeout(async () => {
        try {
          const result = await sendConditionalNotifications(leadData, notificationType);
          if (result) {
            console.log(`✅ ${notificationType} notification sent successfully`);
            // Mark as sent to prevent duplicates
            notificationsSentRef.current.add(notificationKey);
          } else {
            console.log(`🚫 ${notificationType} notification skipped (conditions not met)`);
          }
        } catch (error) {
          console.error(`❌ Error sending ${notificationType} notification:`, error);
          // Don't rethrow - notifications should never block anything
        }
      }, 100); // Small delay to ensure it's truly non-blocking
      
    } catch (error) {
      console.error(`❌ Error setting up ${notificationType} notification:`, error);
      // Never throw from notification hooks
    }
  };

  useEffect(() => {
    const prevFormData = prevFormDataRef.current;
    
    // Debug logging for notification trigger detection
    console.log('🔔 Notification hook checking for triggers...', {
      currentFormData: {
        phone: formData.phone,
        autoFilledPhone: formData.autoFilledPhone,
        street: formData.street,
        campaign_name: formData.campaign_name
      },
      previousFormData: {
        phone: prevFormData.phone,
        autoFilledPhone: prevFormData.autoFilledPhone,
        street: prevFormData.street
      }
    });
    
    // 1. CONTACT INFO NOTIFICATIONS (ALL CAMPAIGNS)
    // Trigger when phone is provided for the first time (name optional)
    const hasContactInfo = formData.phone && formData.phone !== '';
    
    const prevHadContactInfo = prevFormData.phone && prevFormData.phone !== '';

    if (hasContactInfo && !prevHadContactInfo) {
      console.log('🔔 Phone contact info detected - triggering notification');
      sendNotificationSafely(formData, 'contact_info');
    }

    // 2. AUTOFILL NOTIFICATIONS (ALL CAMPAIGNS)
    // Trigger when autofilled phone is detected (name optional)
    const hasAutofillData = formData.autoFilledPhone && formData.autoFilledPhone !== '';
    const prevHadAutofillData = prevFormData.autoFilledPhone && prevFormData.autoFilledPhone !== '';

    if (hasAutofillData && !prevHadAutofillData) {
      console.log('🔔 Autofill phone detected - triggering notification');
      sendNotificationSafely({
        ...formData,
        name: formData.autoFilledName || formData.name || '',
        phone: formData.autoFilledPhone
      }, 'autofill');
    }

    // 3. ADDRESS SUBMISSION NOTIFICATIONS (FAST/CASH CAMPAIGNS ONLY)
    // Trigger when address is submitted
    const hasAddress = formData.street && formData.street.length > 0;
    const prevHadAddress = prevFormData.street && prevFormData.street.length > 0;

    if (hasAddress && !prevHadAddress) {
      console.log('🔔 Address submission detected - triggering conditional notification');
      sendNotificationSafely(formData, 'address_submit');
    }

    // Update previous state for next comparison
    prevFormDataRef.current = { ...formData };

  }, [formData]); // Only depend on formData

  // Cleanup function to reset notification tracking on unmount
  useEffect(() => {
    return () => {
      notificationsSentRef.current.clear();
    };
  }, []);

  // Return notification status for debugging (optional)
  return {
    notificationsSent: notificationsSentRef.current.size,
    // Helper to manually trigger notifications if needed
    triggerNotification: (notificationType) => {
      sendNotificationSafely(formData, notificationType);
    }
  };
};

export default useNotifications;