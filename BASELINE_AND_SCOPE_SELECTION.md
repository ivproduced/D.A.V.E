# Baseline and Scope Selection Guide

## Overview

D.A.V.E provides flexible baseline and scope selection to tailor NIST 800-53 compliance assessments to your specific needs. This guide explains how to configure assessments for optimal results based on your system's impact level, regulatory requirements, and organizational priorities.

## NIST Baselines

### Low Baseline (139 Controls)

**When to Use:**
- Development and test environments
- Low-impact information systems
- Pilot projects and proof-of-concepts
- Quick preliminary assessments
- Non-federal systems with minimal sensitive data

**Characteristics:**
- Foundational security controls
- Essential access controls, audit logging, and system integrity
- Minimal operational overhead
- Quick to assess and implement

**Example Use Cases:**
- Internal development servers
- Public-facing marketing websites
- Low-sensitivity business applications
- Initial security posture reviews

**Performance:**
- Controls: 139
- Quick Mode: ~1.2 min, $0.14
- Smart Mode: ~2.1 min, $0.70
- Deep Mode: ~11.6 min, $5.56

### Moderate Baseline (188 Controls) - **Recommended**

**When to Use:**
- Most federal information systems (FedRAMP Moderate)
- Financial services and healthcare (HIPAA)
- Controlled Unclassified Information (CUI)
- Production business-critical systems
- Standard compliance requirements

**Characteristics:**
- Comprehensive security coverage
- Balances security and operational efficiency
- Includes Low baseline + enhancements
- Covers most common compliance scenarios

**Example Use Cases:**
- Cloud services handling CUI
- Banking and financial applications
- Healthcare systems with PHI
- State and local government systems
- E-commerce platforms with PII

**Performance:**
- Controls: 188
- Quick Mode: ~1.6 min, $0.19
- Smart Mode: ~4.7 min, $0.94
- Deep Mode: ~15.7 min, $7.52

### High Baseline (238 Controls)

**When to Use:**
- High-impact federal systems
- National security systems
- Systems processing classified information
- Critical infrastructure
- Law enforcement and intelligence systems

**Characteristics:**
- Maximum security rigor
- Includes Moderate baseline + additional enhancements
- Comprehensive monitoring and access controls
- Extensive documentation requirements

**Example Use Cases:**
- Defense systems
- Intelligence community networks
- Critical infrastructure (power grid, utilities)
- Systems processing SECRET/TOP SECRET data
- Emergency services infrastructure

**Performance:**
- Controls: 238 (estimated)
- Quick Mode: ~2.0 min, $0.24
- Smart Mode: ~6.0 min, $1.19
- Deep Mode: ~19.8 min, $9.52

## Assessment Modes

### Quick Mode

**Token Budget:** 200 tokens/control
**Processing Time:** ~0.5 seconds/control
**Use Case:** Rapid assessment, initial scans

**Features:**
- Batch validation (10-15 controls/call)
- Lightweight prompts
- Binary pass/fail recommendations
- Minimal context

**Best For:**
- Daily/weekly automated scans
- Development pipeline integration
- Change impact analysis
- Quick status checks

**Output Quality:**
- ✅ High accuracy on clear implementations
- ⚠️ Limited context for complex scenarios
- ❌ Minimal remediation guidance

### Smart Mode (Recommended)

**Token Budget:** 1000 tokens/control (average)
**Processing Time:** ~1.5 seconds/control
**Use Case:** Balanced assessment for production systems

**Features:**
- Selective deep reasoning (30% of controls)
- Risk-based prioritization
- Detailed recommendations for gaps
- Context-aware validation

**Best For:**
- Monthly compliance reviews
- Pre-audit assessments
- Production system validation
- FedRAMP/HIPAA compliance

**Output Quality:**
- ✅ Excellent accuracy across all scenarios
- ✅ Detailed remediation for critical gaps
- ✅ Cost-effective for regular use

### Deep Mode

**Token Budget:** 8000 tokens/control
**Processing Time:** ~5 seconds/control
**Use Case:** Comprehensive analysis, audit preparation

**Features:**
- Full reasoning for all controls
- Detailed evidence analysis
- Comprehensive remediation plans
- Audit trail generation

**Best For:**
- Annual audits
- Initial compliance baseline
- High-impact system assessments
- Detailed documentation needs

**Output Quality:**
- ✅ Maximum accuracy and detail
- ✅ Audit-ready documentation
- ✅ Comprehensive remediation roadmaps
- ⚠️ Higher cost and time

## Control Family Filtering

### Available Families

| Code | Family Name | Controls | Focus Area |
|------|-------------|----------|-----------|
| AC | Access Control | 25 | System access, user permissions |
| AT | Awareness and Training | 5 | Security training programs |
| AU | Audit and Accountability | 16 | Logging, monitoring, audit records |
| CA | Assessment, Authorization, and Monitoring | 9 | Security assessments, authorization |
| CM | Configuration Management | 14 | Baseline configuration, change control |
| CP | Contingency Planning | 13 | Backup, disaster recovery, BCP |
| IA | Identification and Authentication | 12 | User identity verification, MFA |
| IR | Incident Response | 10 | Incident handling, response plans |
| MA | Maintenance | 7 | System maintenance, tools |
| MP | Media Protection | 8 | Data media handling, sanitization |
| PE | Physical and Environmental Protection | 23 | Physical security, facilities |
| PL | Planning | 11 | Security planning, documentation |
| PM | Program Management | 32 | Security program governance |
| PS | Personnel Security | 9 | Personnel screening, termination |
| PT | PII Processing and Transparency | 8 | Privacy, PII handling |
| RA | Risk Assessment | 10 | Risk analysis, vulnerability management |
| SA | System and Services Acquisition | 23 | Acquisition processes, SDLC |
| SC | System and Communications Protection | 52 | Network security, encryption |
| SI | System and Information Integrity | 23 | Malware protection, monitoring |
| SR | Supply Chain Risk Management | 12 | Supply chain security |

### Predefined Scopes

#### Cloud Security Focused
**Families:** AC, AU, IA, SC
**Controls:** ~105
**Use Case:** Cloud service providers, IaaS/PaaS/SaaS assessments

#### Identity and Access Management
**Families:** AC, IA, PS
**Controls:** ~46
**Use Case:** IAM implementations, access control reviews

#### Audit and Logging
**Families:** AU, CA, IR
**Controls:** ~35
**Use Case:** SIEM implementations, audit compliance

#### Data Protection
**Families:** MP, SC, CP, SR
**Controls:** ~100
**Use Case:** Data security, encryption, backup systems

#### Incident Response
**Families:** IR, AU, CA, CP
**Controls:** ~45
**Use Case:** IR capability assessments, SOC evaluations

#### Technical Controls Only
**Families:** AC, AU, IA, SC, SI, CM, CP, MA, SR (9 technical families)
**Controls:** ~160
**Use Case:** Technical security assessments, excluding policies/procedures

## Scope Selection Workflow

### 1. Determine Impact Level

```
Start → What's the system's impact level?
  ├─ Low-impact → Use Low Baseline
  ├─ Moderate-impact → Use Moderate Baseline
  └─ High-impact → Use High Baseline
```

### 2. Choose Assessment Mode

```
What's your goal?
  ├─ Quick scan → Use Quick Mode
  ├─ Regular compliance → Use Smart Mode (Recommended)
  └─ Audit preparation → Use Deep Mode
```

### 3. Apply Family Filters (Optional)

```
Need focused assessment?
  ├─ Full baseline → Leave families empty/null
  ├─ Specific focus → Select relevant families
  └─ Predefined scope → Use predefined scope
```

### 4. Estimate and Review

```
POST /api/estimate-scope
{
  "baseline": "moderate",
  "control_families": ["AC", "AU", "IA"],
  "mode": "smart"
}

Review: controls, time, cost
→ Adjust if needed
→ Proceed with assessment
```

## Real-World Examples

### Example 1: Cloud SaaS Application (FedRAMP Moderate)

**Requirements:**
- FedRAMP Moderate authorization
- Regular compliance monitoring
- Monthly assessments

**Configuration:**
```json
{
  "baseline": "moderate",
  "control_families": null,
  "mode": "smart",
  "predefined_scope": null
}
```

**Results:**
- Controls: 188
- Time: 4.7 minutes
- Cost: $0.94
- Suitable for monthly reviews

### Example 2: Identity Management System

**Requirements:**
- Focus on IAM controls
- Deep analysis for audit
- Quarterly assessment

**Configuration:**
```json
{
  "baseline": "high",
  "control_families": ["AC", "IA", "PS"],
  "mode": "deep",
  "predefined_scope": null
}
```

**Results:**
- Controls: 46
- Time: ~3.8 minutes
- Cost: ~$1.84
- Comprehensive IAM assessment

### Example 3: Development Environment Scan

**Requirements:**
- Weekly automated scans
- Low baseline
- Cost-effective

**Configuration:**
```json
{
  "baseline": "low",
  "control_families": null,
  "mode": "quick",
  "predefined_scope": null
}
```

**Results:**
- Controls: 139
- Time: 1.2 minutes
- Cost: $0.14
- Fast weekly checks

### Example 4: Pre-Audit Cloud Security Review

**Requirements:**
- Cloud-specific controls
- Moderate baseline
- Detailed analysis

**Configuration:**
```json
{
  "baseline": "moderate",
  "control_families": null,
  "mode": "smart",
  "predefined_scope": "cloud_security"
}
```

**Results:**
- Controls: ~105
- Time: ~2.6 minutes
- Cost: ~$0.53
- Cloud-focused assessment

## Scope Export/Import

### Exporting Scope Configurations

Save frequently used configurations for reuse:

1. Configure your desired scope in the UI
2. Click the "Export" button
3. Save the JSON file: `dave-scope-moderate-2026-02-02.json`

**Example Export:**
```json
{
  "baseline": "moderate",
  "control_families": ["AC", "AU", "IA"],
  "mode": "smart",
  "predefined_scope": null,
  "exported_at": "2026-02-02T10:30:00Z"
}
```

### Importing Scope Configurations

Reuse saved configurations:

1. Click the "Import" button
2. Select your saved JSON file
3. Review the loaded configuration
4. Proceed with assessment

**Use Cases for Import/Export:**
- Standardize assessments across teams
- Maintain consistent quarterly reviews
- Share scope configurations
- Template for similar systems

## Best Practices

### 1. Start Broad, Then Focus

```
First Assessment:
  Baseline: Moderate
  Families: All
  Mode: Smart
  
Follow-up Reviews:
  Baseline: Moderate
  Families: [Families with gaps]
  Mode: Deep
```

### 2. Match Mode to Frequency

```
Weekly: Quick Mode
Monthly: Smart Mode
Quarterly: Smart or Deep Mode
Annual: Deep Mode
```

### 3. Use Family Filtering Strategically

**Full Baseline** when:
- Initial assessment
- Annual comprehensive reviews
- Certification/authorization

**Family Filtering** when:
- Focused audits (e.g., access control review)
- Specific compliance requirements
- Change impact analysis
- Remediation validation

### 4. Consider Cost vs. Value

```
$0.14 (Quick) - Daily automation
$0.94 (Smart) - Monthly reviews  ← Sweet spot for most cases
$7.52 (Deep) - Annual audits
```

### 5. Leverage Estimates

Always check estimates before processing:
```
POST /api/estimate-scope → Review → Adjust if needed → Process
```

## Troubleshooting

### Scope Results in Zero Controls

**Cause:** Invalid family codes or overly restrictive filtering

**Solution:**
```json
// Invalid
{
  "control_families": ["XX", "YY"]  // Invalid codes
}

// Valid
{
  "control_families": ["AC", "AU"]  // Valid codes
}
```

### Higher Costs Than Expected

**Cause:** Using Deep mode when Smart would suffice

**Solution:** Switch to Smart mode for regular assessments

### Processing Too Slow

**Cause:** Too many controls in scope

**Solution:** Use family filtering or lower baseline

### Insufficient Detail in Results

**Cause:** Using Quick mode for complex assessment

**Solution:** Upgrade to Smart or Deep mode

## API Reference

### Endpoints

**List Baselines:**
```bash
GET /api/baselines
```

**List Control Families:**
```bash
GET /api/control-families
```

**List Predefined Scopes:**
```bash
GET /api/predefined-scopes
```

**Estimate Processing:**
```bash
POST /api/estimate-scope
Body: AssessmentScopeRequest
```

**Process Documents:**
```bash
POST /api/process-documents
FormData:
  - files: [...]
  - scope_json: JSON.stringify(AssessmentScopeRequest)
```

### Data Models

**AssessmentScopeRequest:**
```typescript
{
  baseline: "low" | "moderate" | "high" | "custom" | "all"
  control_families?: string[]  // ["AC", "AU", ...]
  specific_controls?: string[]  // ["AC-2", "AU-6", ...]
  mode: "quick" | "smart" | "deep"
  predefined_scope?: string  // "cloud_security", etc.
}
```

**ProcessingEstimate:**
```typescript
{
  control_count: number
  estimated_tokens: number
  estimated_minutes: number
  estimated_cost_usd: number
  mode: string
}
```

## Conclusion

Effective baseline and scope selection is key to efficient NIST 800-53 compliance assessments. By choosing the appropriate baseline, assessment mode, and control family filtering, you can:

- ✅ Optimize assessment costs and time
- ✅ Focus on relevant security controls
- ✅ Maintain compliance with regulatory requirements
- ✅ Scale assessments across your organization

**Recommended Default Configuration:**
```json
{
  "baseline": "moderate",
  "control_families": null,
  "mode": "smart",
  "predefined_scope": null
}
```

This provides comprehensive coverage at reasonable cost (~$1) and time (~5 minutes) for most compliance scenarios.
