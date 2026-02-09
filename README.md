# D.A.V.E - Document Analysis & Validation Engine

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-Dual%20License-blue.svg)](LICENSE)
[![Free for Government](https://img.shields.io/badge/free-government%20%26%20non--profit-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.13%2B-blue.svg)](https://www.python.org/downloads/)
[![Node](https://img.shields.io/badge/node-20%2B-green.svg)](https://nodejs.org/)

🌟 **AI-Powered Compliance Automation using Google Gemini 2.0**

D.A.V.E automates security compliance documentation by analyzing evidence artifacts, mapping controls to frameworks like NIST 800-53 Rev 5, and generating valid OSCAL artifacts—all powered by Google Gemini's multimodal AI capabilities with custom baseline creation and intelligent scope filtering.

## Key Features

### Custom Baseline Builder (Primary Feature)
- **Individual Control Selection**: Select specific controls (e.g., AC-1, AC-2, AU-6) for targeted assessments
- **Family-Level Selection**: Choose entire control families (AC, AU, IA, SC, etc.)
- **Baseline Templates**: Use NIST baselines (Low: 53, Moderate: 325, High: 421, All: 1,191 controls)
- **Predefined Scopes**: Pre-configured templates (Cloud Security, Identity & Access, Data Protection, etc.)
- **Real-Time Estimates**: Dynamic processing time, token usage, and cost calculations

### Assessment Capabilities
- **Multi-format Evidence Ingestion**: PDF, DOCX, PNG, JPEG, JSON, YAML, TXT
- **Multimodal AI Analysis**: Gemini understands text, screenshots, diagrams, and configurations
- **Intelligent Control Mapping**: Automatic mapping to NIST 800-53 Rev 5 controls with evidence correlation
- **Gap Analysis & Risk Scoring**: Identify missing controls with severity-based prioritization
- **OSCAL 1.2.0 Generation**: Valid SSP components and POA&M entries
- **Remediation Planning**: Actionable tasks with platform-specific code snippets (AWS, Azure, GCP, K8s)

### Processing Modes
- **Quick Mode**: Batch validation (200 tokens/control, ~0.5s/control) - Best for initial scans
- **Smart Mode**: Selective deep reasoning (1000 tokens/control, ~1.5s/control) - Recommended for production
- **Deep Mode**: Full reasoning for all (8000 tokens/control, ~5s/control) - Comprehensive audits

## Architecture

Built with a **5-agent architecture** powered by Google Gemini 2.0:

1. **Agent 1 - Evidence Analyzer**: Multimodal extraction from documents, screenshots, and configs
2. **Agent 2 - Control Mapper & Gap Analyzer**: NIST 800-53 mapping with cross-document correlation
3. **Agent 3 - OSCAL Generator**: Structured OSCAL 1.2.0 artifact creation (SSP & POA&M)
4. **Agent 4 - NIST Validator**: Evidence validation against NIST 800-53 Rev 5 requirements and assessment objectives
5. **Agent 5 - Remediation Planner**: Deep reasoning for context-aware recommendations with implementation guides

### Optimization Features
- **Smart Prioritization**: Critical/standard/passing control tiers for differential processing
- **Batch Validation**: 10-15 controls per API call (75% token reduction)
- **Selective Deep Reasoning**: Full analysis only for high/critical gaps
- **Scope Filtering**: Process only selected controls for faster, targeted assessments

## Tech Stack

- **Backend**: FastAPI (Python 3.13+), Google Generative AI SDK
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **AI Model**: Google Gemini 2.0 Flash Experimental (multimodal reasoning)
- **Database**: PostgreSQL, Redis, Google Cloud Storage
- **Real-time**: WebSocket for live processing updates

## Quick Start

### Prerequisites
- Python 3.13+
- Node.js 18+
- Google AI API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Add your GOOGLE_AI_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Starts on http://localhost:3000
```

Visit `http://localhost:3000` to use the application.

## Usage Example

1. **Define Scope**: Use custom baseline builder to select controls
   - Choose workflow: Custom (build your own) or Template (use NIST baselines)
   - Select families: AC, AU, IA, etc.
   - Pick specific controls: AC-1, AC-2, AU-6, etc.
   - Choose mode: Quick/Smart/Deep

2. **Upload Evidence**: Drag & drop compliance documents
   - Policies (PDF, DOCX)
   - Screenshots (PNG, JPEG)
   - Configurations (JSON, YAML)
   - Network diagrams (images)

3. **AI Analysis**: Multi-agent system processes evidence
   - Extracts security controls
   - Maps to NIST 800-53
   - Validates compliance
   - Identifies gaps

4. **Get Results**: Download OSCAL artifacts & remediation plans
   - SSP components
   - POA&M entries  
   - Gap analysis report
   - Implementation tasks with code

## API Endpoints

- `GET /api/baselines` - NIST baseline definitions
- `GET /api/control-families` - 20 NIST control families with counts
- `GET /api/controls?family={code}` - Controls for specific family
- `POST /api/estimate-scope` - Estimate processing for scope configuration
- `POST /api/analyze` - Upload files and start analysis
- `GET /api/status/{session_id}` - Check processing status
- `GET /api/results/{session_id}` - Retrieve analysis results
- `DELETE /api/sessions/{session_id}` - Clean up session data
- `WS /ws/{session_id}` - Real-time status updates

## Security Features

- **File Validation**: Size limits (50MB), type checking (7 allowed formats), max 20 files
- **Input Sanitization**: Control ID format validation, baseline verification
- **Session Management**: UUID-based sessions with cleanup endpoint
- **WebSocket Authentication**: Session validation before connection
- **Environment Security**: API keys in .env (gitignored), CORS restricted

## How We Use Gemini 2.0

D.A.V.E leverages Gemini 2.0's multimodal reasoning to automate compliance workflows. The model processes PDFs, screenshots, network diagrams, and configuration files simultaneously, understanding how technical evidence satisfies specific security controls through deep multi-hop inference.

**Key Capabilities:**
- **Multi-document Correlation**: Combines policy documents, technical configs, and visual evidence to prove control implementation
- **NIST 800-53 Rev 5 Integration**: Full catalog with guidance prose for context-aware validation
- **Structured Output**: JSON schema constraints ensure valid OSCAL artifact generation
- **Batch Processing**: Smart prioritization reduces API calls by 75% for standard controls
- **Adaptive Reasoning**: Deep thinking mode for complex gaps, fast batch mode for routine validations

## License

**Dual License Model:**

- **Free for Government & Non-Profit**: Government agencies, non-profit organizations, educational institutions, and individual researchers may use D.A.V.E freely.
- **Commercial License Required**: For-profit companies require a paid Commercial License.

See [LICENSE](LICENSE) for full terms or contact licensing@eucann.life for commercial licensing.
