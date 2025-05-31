# Split Test Analysis Guide - Updated System

## 🎯 Test Overview: New 6-Variant Strategic Test (18 Total Combinations Supported)

**Testing Period**: [Start Date] - [Target End Date]
**Target Sample Size**: 100+ conversions per variant for statistical significance
**Expected Timeline**: 10-15 weeks at ~400 clicks/week
**Default Variant**: B2OB2 (Best B experience)

## 📊 Variant System Architecture

### **Variant Format: [Step1][Step2][Step3]**
- **Step 1 & 3 Options:** A1 (Primary original), A2 (Primary streamlined), B2 (Secondary streamlined)
- **Step 2 Options:** I (Show AI processing), O (Skip to results)
- **Total Combinations:** 3 × 2 × 3 = 18 possible combinations
- **NO B1:** Secondary content is always streamlined format (B2 only)

### Strategic Core Tests (6 variants)
| Variant | Description | Tests |
|---------|-------------|-------|
| `A1IA1` | **CONTROL** - Primary text + original format throughout | Baseline performance |
| `A1OA1` | Skip friction - Primary text + original format, skip step 2 | Does removing friction help? |
| `A2IA2` | Streamlined A - Primary text + streamlined format throughout | Does streamlined format help? |
| `A2OA2` | Best A experience - Primary streamlined throughout, skip step 2 | Best possible primary experience |
| `B2IB2` | Streamlined B - Secondary text + streamlined format throughout | Does secondary content perform better? |
| `B2OB2` | **DEFAULT** - Best B experience - Secondary streamlined, skip step 2 | Best possible secondary experience |

### Mixed Format Examples (Also supported)
| Variant | Description |
|---------|-------------|
| `A1IA2` | Primary original → Primary streamlined (format progression) |
| `A2OB2` | Primary streamlined → Secondary streamlined, skip step 2 |
| `B2OA1` | Secondary streamlined → Primary original, skip step 2 |

## 🔍 Key Questions to Answer

### 1. **Content Theme Performance**
- **Question**: Does secondary content (B2) outperform primary content (A1/A2)?
- **Compare**: `A1IA1` vs `B2IB2` AND `A2OA2` vs `B2OB2`
- **Success Metric**: >15% improvement in overall conversion rate

### 2. **Format Optimization Impact**
- **Question**: Does streamlined format (A2) significantly boost performance?
- **Compare**: `A1IA1` vs `A2IA2` AND `A1OA1` vs `A2OA2`
- **Success Metric**: >10% improvement in conversion rate

### 3. **Friction Reduction Impact**
- **Question**: Does removing step 2 (AI Processing) improve conversions?
- **Compare**: `A1IA1` vs `A1OA1` AND `B2IB2` vs `B2OB2`
- **Success Metric**: >10% improvement in address→contact conversion rate

### 4. **Best Experience Identification**
- **Question**: What is the optimal combination of content + format + friction?
- **Compare**: All 6 strategic variants for highest conversion rate
- **Success Metric**: Identify clear statistical winner

### 5. **Mixed Format Effectiveness**
- **Question**: Do mixed formats (A1→A2) outperform consistent formats?
- **Compare**: `A1IA1` vs `A1IA2` and other mixed combinations
- **Success Metric**: >5% improvement over consistent format

## 📈 Weekly Reporting Template

### Week [X] - [Date Range]

#### Traffic Distribution
| Variant | Clicks | Address Conversions | Contact Conversions | Address Rate | Contact Rate |
|---------|--------|-------------------|-------------------|-------------|-------------|
| A1IA1 (Control) | [#] | [#] | [#] | [%] | [%] |
| A1OA1 (Skip Step 2) | [#] | [#] | [#] | [%] | [%] |
| A2IA2 (Streamlined A) | [#] | [#] | [#] | [%] | [%] |
| A2OA2 (Best A) | [#] | [#] | [#] | [%] | [%] |
| B2IB2 (Streamlined B) | [#] | [#] | [#] | [%] | [%] |
| B2OB2 (Best B - Default) | [#] | [#] | [#] | [%] | [%] |

#### Progress Toward Statistical Significance
| Variant | Contact Conversions | Target (100+) | Progress | Est. Weeks to Significance |
|---------|-------------------|---------------|----------|---------------------------|
| A1IA1 | [#] | 100 | [%] | [#] weeks |
| A1OA1 | [#] | 100 | [%] | [#] weeks |
| A2IA2 | [#] | 100 | [%] | [#] weeks |
| A2OA2 | [#] | 100 | [%] | [#] weeks |
| B2IB2 | [#] | 100 | [%] | [#] weeks |
| B2OB2 | [#] | 100 | [%] | [#] weeks |

#### Current Leaders (Provisional)
- **Best Address Rate**: [Variant] at [%] (vs Control: [+/-]%)
- **Best Contact Rate**: [Variant] at [%] (vs Control: [+/-]%)
- **Best Overall**: [Variant] - [reasoning]

#### Key Insights This Week
1. [Observation about content themes A vs B2]
2. [Observation about format optimization A1 vs A2]
3. [Observation about friction reduction I vs O]

## 🚨 Decision Thresholds

### Early Winner Detection (if sample is 50+ conversions per variant)
- **Strong Signal**: >20% improvement over control with consistent trend
- **Action**: Consider increasing traffic allocation to winning variant

### Statistical Significance Achieved (100+ conversions per variant)
- **Winner**: Variant with highest contact conversion rate + statistical significance
- **Action**: Implement winning variant as new default

## 🔧 Technical Implementation

### GTM/Analytics Tracking
- **Event**: `variant_assigned`
- **Parameters**: 
  - `assigned_variant`: Full variant code (e.g., "B2OB2")
  - `variant_step1`: Step 1 content (A1, A2, or B2)
  - `variant_step2`: Step 2 control (I or O)
  - `variant_step3`: Step 3 content (A1, A2, or B2)

### CRM Dashboard
- **Supports**: All 18 possible combinations
- **Displays**: Strategic 6 variants + any mixed combinations that occur
- **Legend**: [Step1][Step2][Step3] format explanation

### Legacy Migration
- All old variants (AAA, BIB, etc.) automatically migrate to new system
- B1 variants → B2 variants (secondary always streamlined)
- Preserves user experience during transition

---

*Document updated: [Date]*
*System supports 18 total combinations with 6 strategic variants*