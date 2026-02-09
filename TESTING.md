# 🧪 Testing Guide

This guide helps you test D.A.V.E with sample data.

## Sample Test Dataset

### 1. Create Sample Files

For comprehensive testing, create these sample files:

#### security-policy.pdf
Create a PDF with this content:
```
SECURITY POLICY DOCUMENT

Access Control Policy
- Multi-factor authentication required for all users
- Role-based access control (RBAC) implemented
- Password requirements: 12+ characters, complexity enforced

Audit and Logging
- All authentication attempts logged
- System access logs retained for 90 days
- Log analysis performed weekly

System Monitoring
- Real-time monitoring of critical systems
- Automated alerts for security events
- Quarterly vulnerability scans
```

#### aws-console-screenshot.png
Take a screenshot of any cloud console showing:
- IAM users/roles configuration
- Security group rules
- CloudTrail logging settings
- Or similar security configurations

#### terraform-config.json
```json
{
  "resource": {
    "aws_security_group": {
      "web_server": {
        "name": "web-server-sg",
        "description": "Security group for web servers",
        "ingress": [
          {
            "from_port": 443,
            "to_port": 443,
            "protocol": "tcp",
            "cidr_blocks": ["0.0.0.0/0"]
          },
          {
            "from_port": 80,
            "to_port": 80,
            "protocol": "tcp",
            "cidr_blocks": ["0.0.0.0/0"]
          }
        ],
        "egress": [
          {
            "from_port": 0,
            "to_port": 0,
            "protocol": "-1",
            "cidr_blocks": ["0.0.0.0/0"]
          }
        ]
      }
    },
    "aws_cloudtrail": {
      "main": {
        "name": "main-trail",
        "s3_bucket_name": "company-cloudtrail-logs",
        "include_global_service_events": true,
        "is_multi_region_trail": true,
        "enable_logging": true
      }
    }
  }
}
```

### 2. Test the Upload

1. Start the application (see [QUICKSTART.md](QUICKSTART.md))
2. Navigate to `http://localhost:3000`
3. Upload all three sample files
4. Click "Analyze Documents"

### 3. Expected Results

The system should:
1. Process all files within 30-60 seconds
2. Identify 5-10 NIST 800-53 controls
3. Find 2-4 gaps in coverage
4. Generate OSCAL SSP components
5. Create POA&M entries
6. Provide remediation tasks

## API Testing

### Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T...",
  "services": {
    "api": "operational",
    "gemini": "operational"
  }
}
```

### Upload Files (with curl)
```bash
curl -X POST \
  http://localhost:8000/api/analyze \
  -F "files=@security-policy.pdf" \
  -F "files=@screenshot.png" \
  -F "files=@config.json"
```

Expected response:
```json
{
  "session_id": "uuid-here",
  "status": "processing",
  "message": "Processing 3 files",
  "files_received": 3
}
```

### Check Status
```bash
curl http://localhost:8000/api/status/{session_id}
```

### Get Results
```bash
curl http://localhost:8000/api/results/{session_id}
```

### Download OSCAL
```bash
curl http://localhost:8000/api/results/{session_id}/oscal -o oscal-artifacts.json
```

## Frontend Component Testing

### Test Upload Component
1. Drag and drop multiple files
2. Verify file list updates
3. Remove a file
4. Click upload and verify loading state

### Test Processing Status
1. Verify progress bar updates
2. Check stage indicators change
3. Confirm WebSocket connection (check browser console)
4. Wait for completion

### Test Results Dashboard
1. Verify all tabs work (Overview, Gaps, OSCAL, Remediation)
2. Check compliance score calculation
3. Download OSCAL artifacts
4. Click "Analyze More Documents" to reset

## Performance Testing

### Load Testing
Test with various file sizes and counts:
- 1 file, 1MB
- 5 files, 5MB each
- 10 files, mixed sizes

Expected processing times:
- 1-3 files: 20-40 seconds
- 4-6 files: 40-80 seconds
- 7-10 files: 80-120 seconds

### Concurrency Testing
Test multiple simultaneous uploads:
```bash
# Run 3 parallel uploads
for i in {1..3}; do
  curl -X POST http://localhost:8000/api/analyze \
    -F "files=@security-policy.pdf" &
done
wait
```

## Validation Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can upload multiple files
- [ ] Files are processed successfully
- [ ] All 4 AI agents execute
- [ ] Control mappings are generated
- [ ] Gaps are identified
- [ ] OSCAL artifacts are created
- [ ] Remediation tasks are provided
- [ ] OSCAL JSON can be downloaded
- [ ] Can reset and analyze again

## Common Test Issues

**Issue: "Invalid API key"**
- Solution: Verify GOOGLE_AI_API_KEY in backend/.env

**Issue: "Processing takes too long"**
- Possible causes:
  - Large files (>10MB)
  - Network latency to Google AI
  - Rate limiting
- Solution: Start with smaller test files

**Issue: "No control mappings found"**
- Possible causes:
  - Files don't contain security-related content
  - Gemini API response parsing issue
- Solution: Use sample files with explicit security controls

**Issue: "Frontend can't connect to backend"**
- Solution: Verify backend is running on port 8000
- Check NEXT_PUBLIC_API_URL in frontend/.env.local

## Test Automation

For automated testing, see:
- `backend/tests/` (coming soon)
- `frontend/__tests__/` (coming soon)

Run tests:
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Demo Mode

For demonstrations, use the provided sample dataset:
1. Upload 3-4 diverse files
2. Highlight the multimodal analysis (text + images)
3. Show the real-time progress tracking
4. Navigate through all result tabs
5. Download the OSCAL artifacts
6. Explain the remediation tasks

This creates an impressive demo in under 2 minutes!
