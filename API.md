# 📚 API Documentation

D.A.V.E Backend API Reference

## Base URL

- Development: `http://localhost:8000`
- Production: `https://api.your-domain.com`

## Authentication

Currently, the API does not require authentication. For production deployments, consider implementing:
- API keys
- OAuth 2.0
- JWT tokens

## Endpoints

### Health & Status

#### `GET /`
Root endpoint with service information.

**Response:**
```json
{
  "service": "D.A.V.E - Document Analysis & Validation Engine",
  "status": "operational",
  "version": "0.1.0",
  "powered_by": "Google Gemini"
}
```

#### `GET /health`
Detailed health check for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T12:00:00Z",
  "services": {
    "api": "operational",
    "gemini": "operational"
  }
}
```

---

### Document Analysis

#### `POST /api/analyze`
Upload and analyze compliance evidence documents.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Multiple files with field name `files`

**Accepted File Types:**
- PDF (`.pdf`)
- Word Documents (`.docx`)
- Images (`.png`, `.jpg`, `.jpeg`)
- Configuration files (`.json`, `.yaml`, `.yml`)
- Text files (`.txt`)

**Max File Size:** 50MB per file

**Example Request (curl):**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "files=@security-policy.pdf" \
  -F "files=@screenshot.png" \
  -F "files=@config.json"
```

**Response:**
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "processing",
  "message": "Processing 3 files",
  "files_received": 3
}
```

**Status Codes:**
- `200 OK`: Files accepted and processing started
- `400 Bad Request`: Invalid file type or size
- `500 Internal Server Error`: Processing error

---

#### `GET /api/status/{session_id}`
Get real-time processing status for a session.

**Parameters:**
- `session_id` (path): Session ID from analyze endpoint

**Response:**
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "stage": "mapping",
  "progress": 50,
  "current_step": "Mapping Controls",
  "message": "Agent 2: Mapping controls and analyzing gaps",
  "error": null
}
```

**Stages:**
- `uploading`: Files being uploaded
- `processing`: Documents being processed
- `analyzing`: Agent 1 - Evidence analysis
- `mapping`: Agent 2 - Control mapping & gap analysis
- `generating`: Agent 3 - OSCAL generation
- `planning`: Agent 4 - Remediation planning
- `complete`: Analysis finished
- `error`: Error occurred

**Status Codes:**
- `200 OK`: Status retrieved
- `404 Not Found`: Session not found

---

#### `GET /api/results/{session_id}`
Get complete analysis results for a session.

**Parameters:**
- `session_id` (path): Session ID from analyze endpoint

**Response:**
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2026-01-31T12:00:00Z",
  "evidence_artifacts": [
    {
      "id": "artifact_0_1234567890",
      "filename": "security-policy.pdf",
      "file_type": "pdf",
      "content_summary": "Security policy document with access controls...",
      "extracted_text": "SECURITY POLICY DOCUMENT...",
      "metadata": {
        "num_pages": 5
      },
      "controls_mentioned": ["AC-2", "IA-5"],
      "confidence_score": 0.85
    }
  ],
  "control_mappings": [
    {
      "control_id": "AC-2",
      "control_name": "Account Management",
      "control_family": "Access Control",
      "evidence_ids": ["artifact_0_1234567890"],
      "implementation_status": "implemented",
      "implementation_description": "MFA and RBAC implemented",
      "confidence_score": 0.75,
      "gaps_identified": []
    }
  ],
  "control_gaps": [
    {
      "control_id": "SI-4",
      "control_name": "System Monitoring",
      "gap_description": "Centralized logging gaps identified",
      "risk_level": "high",
      "risk_score": 75,
      "affected_requirements": ["SI-4"],
      "recommended_actions": [
        "Review and implement System Monitoring requirements",
        "Document current state and gap",
        "Create implementation plan"
      ]
    }
  ],
  "oscal_components": [
    {
      "component_id": "component-ac-2",
      "title": "Account Management Implementation",
      "description": "MFA and RBAC implemented",
      "component_type": "software",
      "control_implementations": [
        {
          "control_id": "AC-2",
          "status": "implemented",
          "evidence": ["artifact_0_1234567890"]
        }
      ],
      "props": {
        "compliance_status": "implemented",
        "confidence": "0.75"
      },
      "links": []
    }
  ],
  "poam_entries": [
    {
      "poam_id": "poam-si-4",
      "title": "Remediate System Monitoring",
      "description": "Centralized logging gaps identified",
      "related_controls": ["SI-4"],
      "risk_level": "high",
      "scheduled_completion_date": null,
      "milestones": [
        {
          "milestone": "Assessment",
          "target_date": "2026-02-15"
        }
      ],
      "remediation_plan": "Review and implement...",
      "status": "open"
    }
  ],
  "remediation_tasks": [
    {
      "task_id": "task-1",
      "title": "Implement System Monitoring",
      "description": "Centralized logging gaps identified",
      "priority": "high",
      "effort_estimate": "medium",
      "related_gaps": ["SI-4"],
      "implementation_guide": "Review and implement...",
      "code_snippets": [
        {
          "language": "bash",
          "description": "Enable MFA for all users",
          "code": "aws iam create-virtual-mfa-device..."
        }
      ],
      "verification_steps": [
        "Test implementation in dev",
        "Verify control meets requirements"
      ]
    }
  ],
  "total_controls_analyzed": 5,
  "implemented_controls": 2,
  "gaps_identified": 3,
  "critical_gaps": 0,
  "overall_compliance_score": 40.0
}
```

**Status Codes:**
- `200 OK`: Results retrieved
- `202 Accepted`: Still processing
- `404 Not Found`: Session not found

---

#### `GET /api/results/{session_id}/oscal`
Download OSCAL artifacts as JSON.

**Parameters:**
- `session_id` (path): Session ID

**Response:**
```json
{
  "system-security-plan": {
    "metadata": {
      "title": "D.A.V.E Generated SSP",
      "last-modified": "2026-01-31T12:00:00Z",
      "version": "1.0.0",
      "oscal-version": "1.2.0"
    },
    "components": [...]
  },
  "plan-of-action-and-milestones": {
    "metadata": {
      "title": "D.A.V.E Generated POA&M",
      "last-modified": "2026-01-31T12:00:00Z",
      "version": "1.0.0",
      "oscal-version": "1.2.0"
    },
    "poam-items": [...]
  }
}
```

**Status Codes:**
- `200 OK`: OSCAL artifacts retrieved
- `404 Not Found`: Session not found

---

### WebSocket

#### `WS /ws/{session_id}`
Real-time status updates via WebSocket.

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/session-id-here');

ws.onmessage = (event) => {
  const status = JSON.parse(event.data);
  console.log(status.stage, status.progress);
};
```

**Message Format:**
Same as `/api/status/{session_id}` response.

**Auto-closes when:**
- Stage is `complete`
- Stage is `error`
- Client disconnects

---

## Data Models

### EvidenceArtifact
```typescript
{
  id: string;
  filename: string;
  file_type: "pdf" | "docx" | "screenshot" | "diagram" | "config" | "policy" | "unknown";
  content_summary: string;
  extracted_text?: string;
  metadata: object;
  controls_mentioned: string[];
  confidence_score: number; // 0.0 to 1.0
}
```

### ControlMapping
```typescript
{
  control_id: string;
  control_name: string;
  control_family: string;
  evidence_ids: string[];
  implementation_status: string;
  implementation_description: string;
  confidence_score: number;
  gaps_identified: string[];
}
```

### ControlGap
```typescript
{
  control_id: string;
  control_name: string;
  gap_description: string;
  risk_level: "critical" | "high" | "medium" | "low" | "informational";
  risk_score: number; // 0 to 100
  affected_requirements: string[];
  recommended_actions: string[];
}
```

### RemediationTask
```typescript
{
  task_id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  effort_estimate: "low" | "medium" | "high";
  related_gaps: string[];
  implementation_guide: string;
  code_snippets: Array<{
    language: string;
    description: string;
    code: string;
  }>;
  verification_steps: string[];
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message here"
}
```

**Common Error Codes:**
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Gemini API unavailable

---

## Rate Limiting

Current implementation has no rate limiting. For production:

**Recommended Limits:**
- 10 requests/minute per IP for `/api/analyze`
- 60 requests/minute per IP for status endpoints
- WebSocket: 1 connection per session

---

## CORS Configuration

Default allowed origins: `http://localhost:3000`

For production, update `ALLOWED_ORIGINS` environment variable:
```bash
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
```

---

## Interactive Documentation

FastAPI provides interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

⚠️ **Disable these in production** by setting `DEBUG=False`

---

## SDK Examples

### Python
```python
import requests

# Upload files
files = [
    ('files', open('policy.pdf', 'rb')),
    ('files', open('screenshot.png', 'rb'))
]
response = requests.post('http://localhost:8000/api/analyze', files=files)
session_id = response.json()['session_id']

# Check status
status = requests.get(f'http://localhost:8000/api/status/{session_id}').json()

# Get results
results = requests.get(f'http://localhost:8000/api/results/{session_id}').json()

# Download OSCAL
oscal = requests.get(f'http://localhost:8000/api/results/{session_id}/oscal').json()
```

### JavaScript/TypeScript
```typescript
// Upload files
const formData = new FormData();
formData.append('files', pdfFile);
formData.append('files', imageFile);

const response = await fetch('http://localhost:8000/api/analyze', {
  method: 'POST',
  body: formData
});
const { session_id } = await response.json();

// Poll for status
const checkStatus = async () => {
  const res = await fetch(`http://localhost:8000/api/status/${session_id}`);
  const status = await res.json();
  
  if (status.stage === 'complete') {
    // Get results
    const results = await fetch(`http://localhost:8000/api/results/${session_id}`);
    return await results.json();
  }
};
```

---

## Support

For API issues or questions:
- Check [TESTING.md](TESTING.md) for testing examples
- Review [QUICKSTART.md](QUICKSTART.md) for setup
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production configuration
