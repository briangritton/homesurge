# HomeSurge.AI Domain Migration Roadmap

## 🎯 **Migration Overview**
**Current Domain:** sellforcash.online  
**New Domain:** HomeSurge.AI  
**Estimated Total Time:** 2-3 hours  
**Risk Level:** ⭐ LOW (Domain-agnostic architecture)

---

## 📋 **Phase 1: Pre-Migration Checklist**

### ✅ **Domain Registration**
- [ ] Purchase HomeSurge.AI domain (GoDaddy or preferred registrar)
- [ ] Verify domain ownership
- [ ] Keep current domain active during transition

### ✅ **Current State Analysis** *(COMPLETED)*
- [x] Codebase scan completed - minimal changes needed
- [x] Firebase analysis - no changes required  
- [x] Vercel configuration reviewed
- [x] Analytics dependencies identified

---

## 🔧 **Phase 2: Code Updates** *(20 minutes)*

### **Critical Changes Required:**

#### 1. **Update Domain Reference** *(PRIORITY)*
**File:** `src/services/emailjs.js`  
**Line:** 25  
**Change:** 
```javascript
// FROM:
const baseUrl = window.location.origin || 'https://sellforcash.online';

// TO:
const baseUrl = window.location.origin || 'https://homesurge.ai';
```

#### 2. **Update Project Metadata**
**Files to update:**
- `package.json` - Update name field
- `public/manifest.json` - Update app names and branding

---

## 🌐 **Phase 3: Vercel Deployment** *(30 minutes)*

### **Step-by-Step Vercel Setup:**

1. **Add Custom Domain**
   - Go to Vercel Dashboard → Project → Settings → Domains
   - Add `homesurge.ai` and `www.homesurge.ai`
   - Follow DNS configuration instructions

2. **Environment Variables**
   - ✅ No domain-specific variables found
   - ✅ Current configuration will work as-is

3. **SSL Certificate**
   - ✅ Automatic via Vercel
   - ✅ No additional configuration needed

4. **Test Deployment**
   - Deploy to staging first
   - Verify all functionality works
   - Check form submissions and analytics

---

## 📊 **Phase 4: Analytics & Tracking** *(45 minutes)*

### **Google Analytics Setup:**
- [ ] **Option A:** Add new domain to existing property
- [ ] **Option B:** Create new GA4 property for HomeSurge.AI
- [ ] Update tracking configuration if needed

### **Google Tag Manager:**
- [ ] ✅ No changes required (domain-independent)
- [ ] Verify tracking works on new domain

### **Facebook Business Manager:**
- [ ] Add HomeSurge.AI to domain verification
- [ ] Update Facebook Pixel configuration if needed
- [ ] Test conversion tracking

### **Facebook Ads:**
- [ ] Update landing page URLs in active campaigns
- [ ] Verify pixel tracking on new domain

---

## 🔥 **Phase 5: Firebase Configuration** *(15 minutes)*

### **Authorized Domains:**
- [ ] Add `homesurge.ai` to Firebase Console → Authentication → Settings → Authorized domains
- [ ] Add `www.homesurge.ai` if using www subdomain
- [ ] ✅ No other Firebase changes needed

---

## 🚀 **Phase 6: Go-Live Process** *(30 minutes)*

### **DNS Cutover:**
1. **Update DNS Records**
   - Point A record to Vercel IP
   - Update CNAME for www subdomain
   - Verify propagation

2. **Final Testing**
   - [ ] Homepage loads correctly
   - [ ] Form submissions work
   - [ ] CRM integration functions
   - [ ] Analytics tracking verified
   - [ ] All API calls successful

3. **Monitor for Issues**
   - Check error logs
   - Verify conversion tracking
   - Test lead assignment workflow

---

## 📋 **Phase 7: Post-Migration Tasks** *(1 hour)*

### **SEO & Redirects:**
- [ ] Set up 301 redirects from old domain (when ready)
- [ ] Update Google Search Console
- [ ] Update any external links/citations

### **Marketing Updates:**
- [ ] Update email signatures
- [ ] Update business cards/marketing materials  
- [ ] Update social media profiles
- [ ] Update Google My Business listing

### **Documentation:**
- [ ] Update internal documentation
- [ ] Update README files
- [ ] Update deployment guides

---

## ⚠️ **Risk Mitigation**

### **Rollback Plan:**
- Keep old domain active for 30 days minimum
- DNS can be reverted quickly if issues arise
- All services will continue working on old domain

### **Monitoring:**
- Monitor conversion rates for first week
- Track any drop in traffic/leads
- Have team ready to troubleshoot

---

## 🎯 **Success Metrics**

### **Technical Validation:**
- [ ] All pages load under 3 seconds
- [ ] Form submission success rate >95%
- [ ] Zero JavaScript errors
- [ ] SSL certificate valid

### **Business Validation:**
- [ ] Lead volume maintained
- [ ] Conversion tracking functional
- [ ] CRM integration working
- [ ] Analytics data flowing

---

## 📞 **Emergency Contacts**

**Technical Issues:**
- Vercel Support: [support docs]
- Firebase Support: [console help]
- GoDaddy DNS Support: [domain management]

**Business Continuity:**
- Monitor lead flow closely first 48 hours
- Have backup communication methods ready

---

## ✅ **Quick Start Checklist**

**Day 1 (2-3 hours):**
- [ ] Register domain
- [ ] Update code (2 files)
- [ ] Deploy to Vercel
- [ ] Configure DNS
- [ ] Test functionality

**Day 2-7 (monitoring):**
- [ ] Verify analytics
- [ ] Monitor conversions
- [ ] Update marketing materials
- [ ] Set up redirects

**Week 2+:**
- [ ] Decommission old domain (optional)
- [ ] Complete SEO migration
- [ ] Update all external references

---

*Last updated: [Current Date]*  
*Migration prepared by: Claude Code Analysis*