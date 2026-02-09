# D.A.V.E Test Artifacts

This directory contains sample compliance documentation and configurations for testing the D.A.V.E (Document Analysis & Validation Engine) system.

## Test Files Overview

### 1. Policy Documents

#### `access-control-policy.md`
- **Type:** Policy document (Markdown format for easy PDF conversion)
- **Content:** Comprehensive NIST 800-53 access control policy
- **Controls Covered:** AC-1 through AC-19 (19 access control controls)
- **Use Case:** Test document processing and control mapping for policy documents
- **Key Features:**
  - Detailed implementation statements
  - Role and responsibility definitions
  - Specific technical implementations
  - Compliance status for each control

### 2. Configuration Files

#### `system-configuration.json`
- **Type:** System configuration (JSON)
- **Content:** Patient portal web application configuration
- **Controls Covered:** AC-2, AC-3, AC-4, AC-6, AC-7, AU-2, AU-3, AU-6, AU-9, AU-12, CA-2, CA-8, CP-9, CP-10, IA-2, IA-5, IR-1, IR-4, IR-5, IR-6, IR-8, RA-5, SC-7, SC-8, SC-12, SC-13, SC-28, SI-2
- **Use Case:** Test configuration file parsing and technical control extraction
- **Key Features:**
  - Network segmentation details
  - Authentication/authorization settings
  - Encryption configurations
  - Audit logging setup
  - Vulnerability management data
  - Compliance status metrics

#### `firewall-rules.yaml`
- **Type:** Network configuration (YAML)
- **Content:** Firewall ACL rules with NIST control mappings
- **Controls Covered:** AC-4, AC-6, AC-17, AU-4, AU-9(2), CP-9, SC-7, SC-7(3), SC-7(4), SC-7(5), SC-7(8), SC-8(1), SI-2
- **Use Case:** Test YAML parsing and network security control identification
- **Key Features:**
  - Zone-based firewall rules
  - Explicit NIST control mappings per rule
  - Service and address object definitions
  - Time-based access controls
  - Audit trail

## Using Test Artifacts

### Manual Testing via Web UI

1. **Start D.A.V.E Backend:**
   ```bash
   cd backend
   .venv/bin/python -m uvicorn app.main:app --reload
   ```

2. **Start D.A.V.E Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Upload Test Files:**
   - Navigate to http://localhost:3000
   - Select scope (Low/Moderate/High baseline)
   - Upload any combination of test artifacts
   - View analysis results

### Converting Markdown to PDF

To create PDF versions of policy documents:

```bash
# Using pandoc (recommended)
pandoc access-control-policy.md -o access-control-policy.pdf

# Or using wkhtmltopdf
markdown access-control-policy.md | wkhtmltopdf - access-control-policy.pdf

# Or using Python markdown2pdf
python -m markdown2pdf access-control-policy.md
```

### API Testing

Test individual file uploads via API:

```bash
# Upload access control policy
curl -X POST http://localhost:8000/api/analyze \
  -F "files=@access-control-policy.md" \
  -F "scope_json={\"baseline\":\"moderate\",\"mode\":\"smart\",\"control_families\":[]}"

# Upload configuration file
curl -X POST http://localhost:8000/api/analyze \
  -F "files=@system-configuration.json" \
  -F "scope_json={\"baseline\":\"moderate\",\"mode\":\"smart\",\"control_families\":[]}"

# Upload multiple files
curl -X POST http://localhost:8000/api/analyze \
  -F "files=@access-control-policy.md" \
  -F "files=@system-configuration.json" \
  -F "files=@firewall-rules.yaml" \
  -F "scope_json={\"baseline\":\"high\",\"mode\":\"deep\",\"control_families\":[]}"
```

### Automated Testing

Use in Playwright E2E tests:

```typescript
await fileInput.setInputFiles([
  'test-artifacts/access-control-policy.md',
  'test-artifacts/system-configuration.json',
  'test-artifacts/firewall-rules.yaml'
]);
```

## Expected Analysis Results

When processing these artifacts, D.A.V.E should identify:

### Access Control Policy
- **Controls Found:** AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-10, AC-11, AC-12, AC-14, AC-17, AC-18, AC-19
- **Implementation Evidence:** Policy statements, procedures, technical implementations
- **Gaps:** Any AC family controls not explicitly mentioned in policy

### System Configuration
- **Controls Found:** AC-2, AC-3, AC-4, AU-2, AU-3, AU-6, CA-2, CP-9, IA-2, SC-7, SC-8, SC-13, SC-28, SI-2
- **Implementation Evidence:** Technical configurations, encryption settings, audit logging
- **Artifacts:** Authentication settings, network segmentation, backup configurations

### Firewall Rules
- **Controls Found:** AC-4, AC-17, SC-7, SC-7(3), SC-7(4), SC-7(5)
- **Implementation Evidence:** Network boundary protection, zone isolation, default deny rules
- **Artifacts:** Rule definitions with NIST control tags

## Adding Your Own Test Artifacts

When creating additional test artifacts:

1. **Include Control IDs:** Reference specific NIST 800-53 controls in your documents
2. **Add Implementation Details:** Include technical specifics about how controls are implemented
3. **Use Structured Formats:** JSON/YAML provide better parsing than free-form text
4. **Document Compliance Status:** Indicate whether controls are implemented, partially implemented, or planned
5. **Include Metadata:** Add dates, owners, versions for realistic testing

## Sample Output Structure

Expected D.A.V.E analysis output:

```json
{
  "session_id": "uuid",
  "compliance_score": 85.5,
  "control_mappings": [
    {
      "control_id": "AC-2",
      "evidence_artifacts": ["access-control-policy.md", "system-configuration.json"],
      "implementation_status": "implemented",
      "confidence_score": 0.95
    }
  ],
  "gaps": [
    {
      "control_id": "AC-9",
      "severity": "low",
      "recommendation": "Document notification of previous logons"
    }
  ],
  "oscal_outputs": {
    "ssp_component": "generated SSP component JSON",
    "poam_entries": ["array of POA&M items for gaps"]
  }
}
```

## Troubleshooting

- **File too large:** Keep test files under 50MB
- **Parsing errors:** Validate JSON/YAML syntax before upload
- **Missing controls:** Ensure control IDs follow "XX-##" or "XX-##(##)" format
- **Low confidence scores:** Add more specific implementation details and control references

## More Resources

- [NIST 800-53 Rev 5 Control Catalog](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
- [OSCAL Documentation](https://pages.nist.gov/OSCAL/)
- [D.A.V.E Documentation](../README.md)
