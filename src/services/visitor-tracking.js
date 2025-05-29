import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Track page visit immediately when user lands with campaign data
 * Creates a "visitor" record that can be upgraded to full lead later
 */
export async function trackPageVisit(campaignData) {
  try {
    const db = getFirestore();
    
    // Generate a unique visitor ID
    const visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Prepare visitor data
    const visitorData = {
      // Visitor tracking
      visitorId: visitorId,
      status: 'Visitor', // Hidden from sales dashboard
      leadStage: 'Page Visit',
      
      // Campaign data (captured immediately)
      campaign_name: campaignData.campaign_name || '',
      campaign_id: campaignData.campaign_id || '',
      adgroup_id: campaignData.adgroup_id || '',
      adgroup_name: campaignData.adgroup_name || '',
      keyword: campaignData.keyword || '',
      matchtype: campaignData.matchtype || '',
      device: campaignData.device || '',
      gclid: campaignData.gclid || '',
      traffic_source: campaignData.traffic_source || 'Direct',
      
      // Variant tracking
      variant: campaignData.variant || 'Unknown',
      split_test: campaignData.split_test || campaignData.variant || '',
      
      // Page data
      url: window.location.href,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      
      // Timestamps
      visitedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Conversion tracking
      converted: false,
      convertedAt: null,
      leadId: null // Will be set when upgraded to full lead
    };
    
    console.log('📊 Creating visitor record:', {
      visitorId,
      campaign: campaignData.campaign_name,
      variant: campaignData.variant,
      keyword: campaignData.keyword
    });
    
    // Create visitor record in Firebase
    const visitorRef = doc(db, 'visitors', visitorId);
    await setDoc(visitorRef, visitorData);
    
    // Store visitor ID in localStorage for later upgrade
    localStorage.setItem('visitorId', visitorId);
    
    // Send to analytics
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'page_visit_tracked',
        visitor_id: visitorId,
        campaign_name: campaignData.campaign_name,
        variant: campaignData.variant,
        keyword: campaignData.keyword
      });
    }
    
    console.log('✅ Visitor tracking successful:', visitorId);
    return visitorId;
    
  } catch (error) {
    console.error('❌ Error tracking page visit:', error);
    return null;
  }
}

/**
 * Upgrade visitor to full lead when they submit address/contact info
 */
export async function upgradeVisitorToLead(leadId, contactData = {}) {
  try {
    const visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      console.log('No visitor ID found - user may have landed directly on form');
      return false;
    }
    
    const db = getFirestore();
    const visitorRef = doc(db, 'visitors', visitorId);
    
    // Get visitor data
    const visitorSnap = await getDoc(visitorRef);
    if (!visitorSnap.exists()) {
      console.log('Visitor record not found:', visitorId);
      return false;
    }
    
    const visitorData = visitorSnap.data();
    
    // Update visitor record to mark as converted
    await updateDoc(visitorRef, {
      converted: true,
      convertedAt: serverTimestamp(),
      leadId: leadId,
      updatedAt: serverTimestamp(),
      
      // Add contact data if provided
      ...contactData
    });
    
    console.log('✅ Visitor upgraded to lead:', {
      visitorId,
      leadId,
      campaign: visitorData.campaign_name,
      variant: visitorData.variant
    });
    
    // Send conversion event to analytics
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'visitor_converted',
        visitor_id: visitorId,
        lead_id: leadId,
        campaign_name: visitorData.campaign_name,
        variant: visitorData.variant,
        conversion_type: 'address_submit'
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error upgrading visitor to lead:', error);
    return false;
  }
}

/**
 * Get visitor data for analytics
 */
export async function getVisitorData(visitorId) {
  try {
    const db = getFirestore();
    const visitorRef = doc(db, 'visitors', visitorId);
    const visitorSnap = await getDoc(visitorRef);
    
    if (visitorSnap.exists()) {
      return visitorSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting visitor data:', error);
    return null;
  }
}