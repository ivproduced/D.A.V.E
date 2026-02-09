# Changelog

All notable changes to D.A.V.E (Document Analysis & Validation Engine) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-08

### Added
- **Custom Baseline Builder**: Individual control selection, family-level selection, and predefined scopes
- **5-Agent AI Architecture**: Evidence Analyzer, Control Mapper, OSCAL Generator, NIST Validator, Remediation Planner
- **Multi-format Evidence Ingestion**: Support for PDF, DOCX, PNG, JPEG, JSON, YAML, TXT
- **Multimodal Analysis**: Google Gemini 2.0 processing of text, screenshots, diagrams, and configs
- **NIST 800-53 Rev 5 Integration**: Full catalog with 1,191 controls across 20 families
- **Three Processing Modes**: Quick (batch), Smart (selective), Deep (comprehensive)
- **OSCAL 1.2.0 Generation**: Valid SSP components and POA&M entries
- **Real-time Progress Tracking**: WebSocket-based status updates with 11 processing stages
- **Gap Analysis**: Risk-scored control gaps with detailed descriptions
- **Remediation Planning**: Step-by-step implementation guides with code snippets
- **Scope Filtering**: Process only selected controls for targeted assessments
- **Batch Optimization**: 75% token reduction through intelligent batching
- **Smart Prioritization**: Critical/standard/passing control tiers
- **Docker Support**: Full containerization with docker-compose
- **Comprehensive Testing**: Unit tests, integration tests, E2E tests
- **API Documentation**: Complete endpoint reference

### Security
- File validation (size limits, type checking)
- Input sanitization (control ID format, baseline verification)
- Session management (UUID-based with cleanup)
- Environment variable isolation
- CORS configuration

### Technical Details
- **Backend**: FastAPI (Python 3.13+), Google Generative AI SDK
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **AI Model**: Google Gemini 2.0 Flash Experimental
- **Database**: PostgreSQL 16, Redis 7
- **Deployment**: Docker, Cloud Run, Vercel ready

### Documentation
- README.md with quick start guide
- QUICKSTART.md for detailed setup
- API.md for endpoint reference
- DEPLOYMENT.md for production deployment
- TESTING.md for test guidelines
- PROJECT_STRUCTURE.md for architecture overview
- AIBOM.md for AI model details
- SCALABILITY_OPTIMIZATIONS.md for performance tuning

---

## [Unreleased]

### Upcoming Features
- Additional NIST frameworks (800-171, CSF)
- Azure AD integration for SSO
- Persistent storage for analysis history
- Collaborative review workflows
- Export to multiple formats (Excel, CSV)
- Integration with GRC platforms

---

## Release Notes Format

### Added
New features and capabilities

### Changed
Updates to existing functionality

### Deprecated
Features marked for removal

### Removed
Deleted features

### Fixed
Bug fixes and corrections

### Security
Security-related changes

---

For detailed commit history, see the [GitHub repository](https://github.com/yourusername/D.A.V.E).
