# Dynamic Content System - Complete Reference Guide

## 🎯 **Overview**

Both the main Form funnel and ValueBoost funnel now use **component-level dynamic content systems** that change headlines, subheadlines, and button text based on URL campaign parameters. Each component manages its own templates and content logic independently.

## 📍 **Where Content is Controlled**

### **1. PRIMARY LOGIC LOCATION**
**File:** `/src/contexts/FormContext.jsx`
- **Function:** `setDynamicContent()` (lines 503-640)
- **Triggered by:** `initFromUrlParams()` during app initialization
- **Purpose:** Main campaign matching logic and template selection

### **2. DISPLAY LOCATIONS**

#### **Main Form Funnel:**
- **File:** `/src/components/Form/AddressForm.jsx`
- **Headlines:** Lines 1574-1579 (clearly marked with comments)
- **Button:** Lines 1650-1657 (clearly marked with comments)

#### **ValueBoost Funnel:**
- **File:** `/src/components/HomeSurge/ValueBoost/AddressForm.jsx`  
- **Headlines:** Lines 1656-1661 (clearly marked with comments)
- **Button:** Lines 1817-1824 (clearly marked with comments)

## 🔧 **How to Edit Content**

### **Adding New Campaign Templates:**
1. Go to `/src/contexts/FormContext.jsx` lines 539-569
2. Copy an existing template (cash, fast, or value)
3. Change the key to your new keyword
4. Update all content fields

### **Modifying Existing Templates:**
1. Find template in `/src/contexts/FormContext.jsx` lines 539-569
2. Update headline, subHeadline, buttonText, or thankYou messages
3. Changes apply to both funnels automatically

### **Changing Priority Order:**
1. Go to `/src/contexts/FormContext.jsx` lines 598-617
2. Modify the if/else chain order
3. Current priority: cash > value > fast > default

## 🎯 **Campaign Matching Logic**

### **URL Parameter Detection:**
Checks for campaign name in these URL parameters (in order):
1. `campaign_name`
2. `campaignname` 
3. `campaign-name`
4. `utm_campaign`

### **Keyword Matching:**
Campaign names are simplified (lowercase, spaces removed) then checked for:
- **"cash"** → Cash template
- **"value"** → Value template  
- **"fast"** → Fast template
- **No match** → Default template

### **Example:**
- URL: `?campaign_name=fast-cash-buyer` → **Cash template** (cash takes priority)
- URL: `?campaign_name=home-value-check` → **Value template**
- URL: `?campaign_name=quick-fast-sale` → **Fast template**

## 📋 **All Override Sources & Defaults**

### **🎖️ PRIORITY ORDER (Highest to Lowest):**

#### **1. Dynamic Content Templates** (Highest Priority)
- **Location:** FormContext.jsx lines 539-569
- **Triggers:** Campaign name matches keyword
- **Overrides:** All defaults below

#### **2. Component Fallback Defaults**
- **Main Form Headlines:** AddressForm.jsx lines 1575, 1579
  - Headline: "Need to Sell Your Home Extremely Fast?"
  - Subheadline: "Get a great cash offer today. Close in 7 days..."
  - Button: "CHECK OFFER"

- **ValueBoost Headlines:** AddressForm.jsx lines 1657, 1661  
  - Headline: "Maximize Your Home With ValueBoost AI"
  - Subheadline: "Find out how your home value could increase by up to 36%..."
  - Button: "VIEW MAXIMUM VALUE"

#### **3. FormContext Initial State** (Lowest Priority)
- **Location:** FormContext.jsx lines 43-46
- **Values:**
  - `dynamicHeadline`: "Need to Sell Your Home Extremely Fast?"
  - `dynamicSubHeadline`: "Get a great cash offer today. Close in 7 days..."
  - `thankYouHeadline`: "Request Completed!"
  - `thankYouSubHeadline`: "You'll be receiving your requested details..."

#### **4. Default Content Fallback**
- **Location:** FormContext.jsx lines 571-577
- **Used when:** No campaign name provided
- **Same content as FormContext initial state**

## 🔄 **Data Flow**

```
1. User visits page with ?campaign_name=fast-cash
2. FormContext.initFromUrlParams() called
3. setDynamicContent() processes campaign name
4. "cash" keyword detected → Cash template selected
5. formData updated with Cash template content
6. Components display: formData.dynamicHeadline || fallback
7. Result: "Need to Sell Your Home For Cash Fast?" displayed
```

## 🐛 **Debugging**

### **Console Logs Available:**
- Campaign name detection and cleaning
- Template selection logic
- Keyword matching results
- Final content applied

### **Check These Values:**
- `formData.dynamicHeadline`
- `formData.dynamicSubHeadline` 
- `formData.buttonText`
- `formData.templateType` (for debugging)

## 📝 **Current Template Content**

### **Cash Template** (keyword: "cash")
- **Headline:** "Need to Sell Your Home For Cash Fast?"
- **Subheadline:** "Get a great cash offer today. Close in 7 days. No showings, no repairs, no stress"
- **Button:** "CHECK OFFER"

### **Value Template** (keyword: "value")  
- **Headline:** "Need to Check Your Home Value Fast?"
- **Subheadline:** "Find out how much equity you have now."
- **Button:** "CHECK VALUE"

### **Fast Template** (keyword: "fast")
- **Headline:** "Sell Your Home In 10 Days or Less" 
- **Subheadline:** "Skip the repairs and listings. Get a no-obligation cash offer today and close on your terms. No fees, no stress"
- **Button:** "CHECK OFFER"

### **Default Template** (no keyword match)
- **Headline:** "Need to Sell Your House Extremely Fast?"
- **Subheadline:** "Get a great cash offer today. Close in 7 days. No showings, no repairs, no stress"  
- **Button:** "CHECK OFFER"

## ⚡ **Quick Edit Locations**

- **🎯 Add new templates:** FormContext.jsx lines 539-569
- **🎯 Edit existing content:** FormContext.jsx lines 539-569  
- **🎯 Change matching logic:** FormContext.jsx lines 598-617
- **🎯 Update fallback defaults:** Component files lines marked with comments

---

*This system ensures consistent, campaign-driven content across both funnels while maintaining clear separation and easy editing.*