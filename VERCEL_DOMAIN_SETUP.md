# Vercel Domain Setup Guide for HomeSurge.AI

## 🚀 **Step-by-Step Vercel Configuration**

### **1. Access Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com) and log into your account
2. Navigate to your project (currently showing as "sellforcash" or similar)
3. Click on the project to open the dashboard

### **2. Add Custom Domain**
1. In your project dashboard, click **"Settings"** tab
2. Click **"Domains"** in the left sidebar
3. Click **"Add Domain"** button

### **3. Configure Primary Domain**
1. **Add:** `homesurge.ai` (without www)
2. **Vercel will show:** DNS configuration instructions
3. **Copy the A record details** (will look like `76.76.19.61` or similar)

### **4. Configure WWW Subdomain**
1. **Add:** `www.homesurge.ai`
2. **Vercel will show:** CNAME configuration
3. **Copy the CNAME target** (will look like `cname.vercel-dns.com`)

### **5. DNS Configuration at Domain Registrar**

#### **If using GoDaddy:**
1. Log into GoDaddy account
2. Go to **"My Products"** → **"DNS"** for homesurge.ai
3. **Add A Record:**
   - **Type:** A
   - **Name:** @ (or leave blank)
   - **Value:** [IP from Vercel]
   - **TTL:** 1 Hour (3600)

4. **Add CNAME Record:**
   - **Type:** CNAME
   - **Name:** www
   - **Value:** [CNAME target from Vercel]
   - **TTL:** 1 Hour (3600)

#### **For Other Registrars:**
- Follow similar pattern with A and CNAME records
- Use the exact values provided by Vercel

### **6. SSL Certificate Setup**
- ✅ **Automatic:** Vercel handles SSL certificates automatically
- ✅ **No action needed:** Certificate will be issued once DNS propagates
- ⏱️ **Timeline:** Usually within 10-60 minutes

### **7. Verification Process**
1. **DNS Propagation:** Check at [whatsmydns.net](https://whatsmydns.net)
   - Enter `homesurge.ai` and select "A" record
   - Should show Vercel's IP address globally
   
2. **Domain Status in Vercel:**
   - Should change from "Invalid Configuration" to "Valid"
   - SSL certificate should show as "Issued"

### **8. Set Primary Domain (Optional)**
1. In Vercel Domains settings
2. Click the three dots next to `homesurge.ai`
3. Select **"Set as Primary Domain"**
4. This redirects all traffic to the primary domain

### **9. Test Deployment**
1. **Visit:** `https://homesurge.ai`
2. **Verify:**
   - ✅ Site loads correctly
   - ✅ SSL certificate is valid (green lock)
   - ✅ All functionality works
   - ✅ Forms submit properly

### **10. Environment Variables Check**
- ✅ **No changes needed** - all variables are domain-independent
- ✅ **Analytics will work** on new domain automatically

---

## 🔧 **Troubleshooting Common Issues**

### **DNS Not Propagating:**
- Wait 24-48 hours maximum
- Clear browser cache
- Try incognito/private browsing
- Check different DNS servers

### **SSL Certificate Issues:**
- Wait for DNS to fully propagate first
- Certificate issuance is automatic after DNS is correct
- Contact Vercel support if certificate doesn't issue within 24 hours

### **Site Not Loading:**
- Verify A record points to correct Vercel IP
- Check that CNAME is pointing to correct target
- Ensure TTL is set to reasonable value (3600 or 86400)

### **Redirects Not Working:**
- Verify primary domain is set correctly
- Check for conflicting DNS records
- Clear browser cache and cookies

---

## 📋 **Post-Setup Checklist**

### **Immediate Verification:**
- [ ] `https://homesurge.ai` loads correctly
- [ ] `https://www.homesurge.ai` redirects to primary domain
- [ ] SSL certificate shows as valid
- [ ] All pages and functionality work
- [ ] Form submissions successful
- [ ] Analytics tracking verified

### **Performance Check:**
- [ ] Page load times under 3 seconds
- [ ] Mobile responsive design intact
- [ ] No JavaScript console errors
- [ ] All images and assets loading

### **Business Verification:**
- [ ] Lead forms working correctly
- [ ] CRM integration functional
- [ ] Email notifications working
- [ ] Conversion tracking active

---

## 🎯 **Expected Timeline**

| Step | Time Required | Notes |
|------|---------------|-------|
| Vercel Configuration | 5 minutes | Adding domains in dashboard |
| DNS Configuration | 10 minutes | Setting up A and CNAME records |
| DNS Propagation | 10-60 minutes | Automatic, varies by location |
| SSL Certificate | 10-30 minutes | Automatic after DNS propagates |
| Testing & Verification | 15 minutes | Comprehensive functionality check |
| **Total** | **45-90 minutes** | Most time is waiting for propagation |

---

## 🚨 **Emergency Rollback**

If issues arise:
1. **Immediate:** Change DNS back to old domain settings
2. **Vercel:** Remove the new domain from project
3. **Monitoring:** Check that old domain still works
4. **Timeline:** DNS changes take 10-60 minutes to propagate

---

## 📞 **Support Resources**

- **Vercel Documentation:** [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
- **Vercel Support:** Available through dashboard chat
- **DNS Checker:** [whatsmydns.net](https://whatsmydns.net)
- **SSL Checker:** [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)

---

*This guide assumes you have admin access to both Vercel and your domain registrar.*