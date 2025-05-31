# Split Test Analysis Guide

## 🎯 Test Overview: 6-Variant Core Impact Test

**Testing Period**: [Start Date] - [Target End Date]
**Target Sample Size**: 100+ conversions per variant for statistical significance
**Expected Timeline**: 10-15 weeks at ~400 clicks/week

## 📊 Variant Definitions

### Core Impact Tests (4 variants)
| Variant | Description | Tests |
|---------|-------------|-------|
| `AIA` | **CONTROL** - A content, step 2 ON, A content | Baseline performance |
| `AOA` | Skip step 2 - A content, step 2 OFF, A content | Does removing friction help? |
| `BIB` | Secondary content - B content, step 2 ON, B content | Does different messaging perform better? |
| `BOB` | Both changes - B content, step 2 OFF, B content | Combined effect of content + friction removal |

### Streamlined Tests (2 variants)
| Variant | Description | Tests |
|---------|-------------|-------|
| `A2OA2` | Most streamlined A - A2 format, step 2 OFF, A2 format | Best possible A experience |
| `B2OB2` | Most streamlined B - B2 format, step 2 OFF, B2 format | Best possible B experience |

## 🔍 Key Questions to Answer

### 1. **Friction Reduction Impact**
- **Question**: Does removing step 2 (AI Processing) improve conversions?
- **Compare**: `AIA` vs `AOA` AND `BIB` vs `BOB`
- **Success Metric**: >10% improvement in address→contact conversion rate

### 2. **Content Theme Performance**
- **Question**: Does secondary content (B theme) outperform primary content (A theme)?
- **Compare**: `AIA` vs `BIB` AND `AOA` vs `BOB`
- **Success Metric**: >15% improvement in overall conversion rate

### 3. **Format Optimization Impact**
- **Question**: Do alternative formats (A2/B2) significantly boost performance?
- **Compare**: Best standard variant vs `A2OA2`/`B2OB2`
- **Success Metric**: >20% improvement over best standard variant

### 4. **Combined Effect Analysis**
- **Question**: Is the combination of changes better than individual changes?
- **Compare**: `AIA` vs `BOB` (both content + friction changes)
- **Success Metric**: Combined effect > sum of individual effects

## 📈 Weekly Reporting Template

### Week [X] - [Date Range]

#### Traffic Distribution
| Variant | Clicks | Address Conversions | Contact Conversions | Address Rate | Contact Rate |
|---------|--------|-------------------|-------------------|-------------|-------------|
| AIA (Control) | [#] | [#] | [#] | [%] | [%] |
| AOA (Skip Step 2) | [#] | [#] | [#] | [%] | [%] |
| BIB (B Content) | [#] | [#] | [#] | [%] | [%] |
| BOB (B + Skip) | [#] | [#] | [#] | [%] | [%] |
| A2OA2 (Stream A) | [#] | [#] | [#] | [%] | [%] |
| B2OB2 (Stream B) | [#] | [#] | [#] | [%] | [%] |

#### Progress Toward Statistical Significance
| Variant | Contact Conversions | Target (100+) | Progress | Est. Weeks to Significance |
|---------|-------------------|---------------|----------|---------------------------|
| AIA | [#] | 100 | [%] | [#] weeks |
| AOA | [#] | 100 | [%] | [#] weeks |
| BIB | [#] | 100 | [%] | [#] weeks |
| BOB | [#] | 100 | [%] | [#] weeks |
| A2OA2 | [#] | 100 | [%] | [#] weeks |
| B2OB2 | [#] | 100 | [%] | [#] weeks |

#### Current Leaders (Provisional)
- **Best Address Rate**: [Variant] at [%] (vs Control: [+/-]%)
- **Best Contact Rate**: [Variant] at [%] (vs Control: [+/-]%)
- **Best Overall**: [Variant] - [reasoning]

#### Key Insights This Week
1. [Observation about friction reduction]
2. [Observation about content themes]
3. [Observation about format optimization]

#### Recommendations
- [ ] Continue current test
- [ ] Increase traffic to [variant] if showing strong performance
- [ ] Flag any concerning patterns
- [ ] [Other specific actions]

---

## 🚨 Decision Thresholds

### Early Winner Detection (if sample is 50+ conversions per variant)
- **Strong Signal**: >25% improvement over control with consistent trend
- **Action**: Consider increasing traffic allocation to winning variant

### Statistical Significance Achieved (100+ conversions per variant)
- **Winner**: Variant with highest contact conversion rate + statistical significance
- **Action**: Implement winning variant, plan Phase 2 testing

### No Clear Winner (after 15 weeks)
- **Analysis**: Look for patterns, segment by campaign/device/time
- **Action**: Either extend test or move to Phase 2 with different variants

---

## 📋 Next Phase Planning

### Phase 2A: If A theme wins
Test: `AIA`, `A2IA2`, `AIA2`, `A2IA` (format variations)

### Phase 2B: If B theme wins  
Test: `BIB`, `B2IB2`, `BIB2`, `B2IB` (format variations)

### Phase 2C: If streamlined wins
Test more streamlined combinations and fine-tune the winning formula

---

*Document created: [Date]*
*Last updated: [Date]*