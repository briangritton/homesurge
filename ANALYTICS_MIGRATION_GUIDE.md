# Analytics Migration Guide for HomeSurge.AI

## 🎯 **Overview**
This guide covers updating all analytics and tracking systems for the HomeSurge.AI domain migration.

---

## 📊 **Google Analytics 4 Configuration**

### **Option A: Add Domain to Existing Property (Recommended)**
1. **Access GA4:**
   - Go to [analytics.google.com](https://analytics.google.com)
   - Select your current property (`G-L1BJWHLFF6`)

2. **Add New Domain:**
   - **Admin** → **Property Settings** → **Property Details**
   - Update **Website URL** to `https://homesurge.ai`
   - No other changes needed - tracking ID remains the same

3. **Verify Tracking:**
   - Visit `https://homesurge.ai` after domain is live
   - Check **Real-time** reports for traffic from new domain

### **Option B: Create New Property (Clean Slate)**
1. **Create New Property:**
   - **Admin** → **Create Property**
   - **Property Name:** "HomeSurge.AI"
   - **Website URL:** `https://homesurge.ai`
   - **Industry:** Real Estate
   - **Time Zone:** Your local timezone

2. **Update Environment Variables:**
   - Update `.env.local`: `REACT_APP_GA_TRACKING_ID=G-XXXXXXXXX`
   - Update Vercel environment variables with new tracking ID
   - Redeploy application

3. **Enhanced Ecommerce Setup:**
   - **Admin** → **Ecommerce Settings** → Enable
   - Configure conversion events for lead submissions

---

## 🏷️ **Google Tag Manager (GTM)**

### **Current Configuration:**
- ✅ **Container ID:** `GTM-NGC4HNKG` (domain-independent)
- ✅ **No changes required** - GTM works across domains

### **Verification Steps:**
1. **Preview Mode:**
   - Open GTM workspace
   - Click **Preview** button
   - Enter `https://homesurge.ai` when live
   - Verify all tags fire correctly

2. **Domain Settings:**
   - **Admin** → **Container Settings**
   - No domain restrictions needed
   - Ensure cross-domain tracking is enabled if needed

---

## 📘 **Facebook Business Manager**

### **Domain Verification:**
1. **Business Manager:**
   - Go to [business.facebook.com](https://business.facebook.com)
   - **Business Settings** → **Brand Safety** → **Domains**

2. **Add HomeSurge.AI:**
   - Click **Add Domains**
   - Enter: `homesurge.ai`
   - Choose verification method (HTML file upload or meta tag)

3. **Verification Methods:**
   - **HTML File:** Upload provided file to `/public/` folder
   - **Meta Tag:** Add to `public/index.html` in `<head>` section

### **Facebook Pixel Configuration:**
- ✅ **Current Pixel ID:** `230683406108508`
- ✅ **No changes needed** - pixel is domain-independent
- ✅ **Will track automatically** on new domain

### **Conversions API:**
- ✅ **Current setup** works across domains
- ✅ **Server-side tracking** unaffected by domain change

---

## 🎯 **Facebook Ads Manager**

### **Campaign Updates:**
1. **Landing Page URLs:**
   - Update all active campaigns with new domain
   - **Ads Manager** → **Campaigns** → **Edit**
   - Replace `sellforcash.online` with `homesurge.ai`

2. **Destination URL Audit:**
   ```
   Find/Replace Operation:
   Find: sellforcash.online
   Replace: homesurge.ai
   ```

3. **Tracking Verification:**
   - Test each campaign after URL update
   - Verify pixel fires on new landing pages
   - Check conversion tracking in Events Manager

---

## 🔍 **Google Search Console**

### **Add New Property:**
1. **Search Console:**
   - Go to [search.google.com/search-console](https://search.google.com/search-console)
   - Click **Add Property**

2. **Property Setup:**
   - **Property Type:** URL prefix
   - **URL:** `https://homesurge.ai`
   - **Verification:** Upload HTML file or add meta tag

3. **Sitemap Submission:**
   - **Sitemaps** → **Add Sitemap**
   - Submit: `https://homesurge.ai/sitemap.xml`

### **Performance Monitoring:**
   - Monitor for crawl errors
   - Check mobile usability
   - Track search performance

---

## 📈 **Conversion Tracking Setup**

### **Google Ads Conversion Tracking:**
1. **Google Ads Account:**
   - **Tools & Settings** → **Conversions**
   - Update conversion action URLs
   - Test conversion tracking on new domain

### **Enhanced Conversion Setup:**
1. **GTM Configuration:**
   - Update triggers for new domain
   - Test enhanced conversions
   - Verify customer data is captured

---

## 🎮 **Testing Checklist**

### **Pre-Launch Testing:**
- [ ] GA4 real-time shows test traffic
- [ ] GTM preview mode shows all tags firing
- [ ] Facebook Pixel Helper shows events
- [ ] Google Ads conversion tracking works

### **Post-Launch Verification:**
- [ ] **Day 1:** All tracking systems receiving data
- [ ] **Day 3:** Conversion rates match historical data
- [ ] **Week 1:** No significant drop in tracked events
- [ ] **Week 2:** Performance metrics stable

---

## 🚨 **Monitoring & Alerts**

### **Set Up Alerts:**
1. **Google Analytics:**
   - **Admin** → **Custom Alerts**
   - Alert if sessions drop >50% day-over-day
   - Alert if conversion rate drops >30%

2. **Facebook Events Manager:**
   - Monitor pixel events for 48 hours
   - Check for error messages or warnings
   - Verify event match quality remains high

### **Daily Monitoring (First Week):**
- [ ] GA4 traffic levels
- [ ] GTM tag firing status
- [ ] Facebook conversion volume
- [ ] Google Ads performance
- [ ] Lead submission rates

---

## 📊 **Analytics Environment Variables**

### **Current Configuration:**
```bash
# Google Analytics & GTM
REACT_APP_GA_TRACKING_ID=G-L1BJWHLFF6
REACT_APP_GTM_ID=GTM-NGC4HNKG

# Facebook Pixel
REACT_APP_FB_PIXEL_ID=230683406108508
```

### **No Changes Required:**
- ✅ All tracking IDs work across domains
- ✅ Environment variables remain the same
- ✅ No redeployment needed for analytics

---

## 🎯 **Success Metrics**

### **Technical Metrics:**
- [ ] GA4 sessions match previous 7-day average
- [ ] GTM tags fire rate >95%
- [ ] Facebook pixel events match baseline
- [ ] Google Ads conversion tracking 100% functional

### **Business Metrics:**
- [ ] Lead submission rate maintained
- [ ] Conversion funnel performance stable
- [ ] Attribution models working correctly
- [ ] ROI tracking accurate

---

## 🔄 **Rollback Plan**

### **If Issues Arise:**
1. **Immediate:** Monitor conversion rates closely
2. **24 Hours:** If >20% drop, investigate tracking issues
3. **48 Hours:** If persistent issues, consider rollback

### **Emergency Contacts:**
- **Google Analytics Support:** [support.google.com/analytics](https://support.google.com/analytics)
- **Facebook Business Support:** [business.facebook.com/help](https://business.facebook.com/help)
- **GTM Community:** [support.google.com/tagmanager](https://support.google.com/tagmanager)

---

## 📋 **Post-Migration Tasks**

### **Week 1:**
- [ ] Daily monitoring of all tracking systems
- [ ] Document any anomalies or issues
- [ ] Verify attribution is working correctly
- [ ] Check that all conversion goals are firing

### **Week 2-4:**
- [ ] Compare performance to baseline period
- [ ] Optimize any underperforming tracking
- [ ] Update any missed campaign URLs
- [ ] Document lessons learned

---

*Estimated time to complete: 2-3 hours total*  
*Most critical: Facebook domain verification and campaign URL updates*