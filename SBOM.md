# Software Bill of Materials (SBOM)

**Document Version:** 1.0.0  
**SBOM Standard:** CycloneDX 1.5  
**Generated:** February 5, 2026  
**Project:** D.A.V.E (Document Analysis & Validation Engine)  
**Project Version:** 0.1.0  
**License:** MIT

---

## 1. Project Overview

**Name:** D.A.V.E (Document Analysis & Validation Engine)  
**Version:** 0.1.0  
**Description:** Multi-agent compliance automation system using Google Gemini 3 Pro Preview for NIST 800-53 control mapping and OSCAL artifact generation  
**Repository:** Private  
**Architecture:** 5-agent system (Evidence Analyzer, Control Mapper, OSCAL Generator, NIST Validator, Remediation Planner)  
**AI Model:** Google Gemini 3 Pro Preview  
**Python Version:** 3.13+  
**Node.js Version:** 20+

---

## 2. Backend Dependencies (Python)

### 2.1 Core Framework

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| fastapi | 0.115.6 | MIT | Modern, fast web framework for building APIs with Python 3.11+ | PyPI |
| uvicorn[standard] | 0.34.0 | BSD-3-Clause | Lightning-fast ASGI server implementation | PyPI |
| pydantic | 2.10.6 | MIT | Data validation using Python type annotations | PyPI |
| pydantic-settings | 2.7.1 | MIT | Settings management using Pydantic | PyPI |

### 2.2 AI & Machine Learning

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| google-generativeai | 0.8.3 | Apache-2.0 | Google Gemini 3 Pro Preview API client | PyPI |

### 2.3 Document Processing

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| PyPDF2 | 3.0.1 | BSD-3-Clause | PDF reading and manipulation | PyPI |
| pdfplumber | 0.11.5 | MIT | Extract text, tables, and metadata from PDFs | PyPI |
| python-docx | 1.1.2 | MIT | Create and update Microsoft Word (.docx) files | PyPI |
| Pillow | 11.1.0 | HPND | Python Imaging Library (PIL Fork) | PyPI |
| python-multipart | 0.0.20 | Apache-2.0 | Multipart form data parsing | PyPI |

### 2.4 Data Validation & Serialization

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| PyYAML | 6.0.2 | MIT | YAML parser and emitter for Python | PyPI |

### 2.5 Database & Cache

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| sqlalchemy | 2.0.37 | MIT | SQL toolkit and Object Relational Mapper | PyPI |
| psycopg2-binary | 2.9.10 | LGPL-3.0 | PostgreSQL adapter for Python | PyPI |
| redis | 7.1.0 | MIT | Redis client for Python | PyPI |

### 2.6 Background Tasks

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| celery | 5.4.0 | BSD-3-Clause | Distributed task queue | PyPI |

### 2.7 Security & Authentication

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| python-jose[cryptography] | 3.3.0 | MIT | JavaScript Object Signing and Encryption (JOSE) implementation | PyPI |
| passlib[bcrypt] | 1.7.4 | BSD-2-Clause | Password hashing library | PyPI |

### 2.8 HTTP & Utilities

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| httpx | 0.26.0 | BSD-3-Clause | Async HTTP client library | PyPI |
| python-dotenv | 1.0.1 | BSD-3-Clause | Environment variable management from .env files | PyPI |
| aiofiles | 24.1.0 | Apache-2.0 | Async file I/O operations | PyPI |
| websockets | 14.1 | BSD-3-Clause | WebSocket client and server implementation | PyPI |

---

## 3. Frontend Dependencies (JavaScript/TypeScript)

### 3.1 Core Framework

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| react | 19.2.4 | MIT | JavaScript library for building user interfaces | npm |
| react-dom | 19.2.4 | MIT | React package for working with the DOM | npm |
| next | 16.1.6 | MIT | React framework with hybrid static & server rendering | npm |
| typescript | 5.9.3 | Apache-2.0 | TypeScript language compiler | npm |

### 3.2 Type Definitions

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| @types/node | 25.1.0 | MIT | TypeScript definitions for Node.js | npm |
| @types/react | 19.2.10 | MIT | TypeScript definitions for React | npm |
| @types/react-dom | 19.2.3 | MIT | TypeScript definitions for React DOM | npm |
| @types/d3 | 7.4.3 | MIT | TypeScript definitions for D3.js | npm |

### 3.3 Styling & CSS

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| tailwindcss | 3.4.19 | MIT | Utility-first CSS framework | npm |
| autoprefixer | 10.4.24 | MIT | PostCSS plugin to parse CSS and add vendor prefixes | npm |
| postcss | 8.5.6 | MIT | Tool for transforming CSS with JavaScript | npm |
| clsx | 2.1.1 | MIT | Utility for constructing className strings | npm |
| tailwind-merge | 3.4.0 | MIT | Merge Tailwind CSS classes without style conflicts | npm |

### 3.4 UI Components & Visualization

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| react-dropzone | 14.4.0 | MIT | React hook for creating HTML5-compliant drag-and-drop zones | npm |
| lucide-react | 0.563.0 | ISC | Beautiful & consistent icon library for React | npm |
| recharts | 3.7.0 | MIT | Composable charting library built on React components | npm |
| d3 | 7.9.0 | ISC | JavaScript library for producing dynamic, interactive data visualizations | npm |

### 3.5 HTTP & API

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| axios | 1.13.4 | MIT | Promise-based HTTP client for browser and Node.js | npm |

### 3.6 Development & Linting

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| eslint | 9.39.2 | MIT | Pluggable JavaScript linter | npm |
| eslint-config-next | 16.1.6 | MIT | ESLint configuration for Next.js | npm |

---

## 4. Infrastructure Components

### 4.1 Container Images

| Component | Version | Purpose | Source |
|-----------|---------|---------|--------|
| python | 3.13-slim | Backend runtime base image | Docker Hub |
| node | 20-alpine | Frontend build and runtime base image | Docker Hub |
| nginx | 1.25-alpine | Reverse proxy and static file serving (optional) | Docker Hub |

### 4.2 Orchestration

| Component | Version | License | Purpose | Source |
|-----------|---------|---------|---------|--------|
| docker-compose | 2.x | Apache-2.0 | Multi-container Docker application orchestration | Docker |

---

## 5. System Dependencies

### 5.1 Backend System Requirements

- **Python Runtime:** 3.13+
- **System Libraries:**
  - libpq (PostgreSQL client library)
  - libssl (OpenSSL for cryptography)
  - libffi (Foreign function interface library)
  - libjpeg, libpng (Image processing for Pillow)

### 5.2 Frontend System Requirements

- **Node.js Runtime:** 20+
- **Build Tools:**
  - npm (10+)
  - Next.js compiler (built-in)

---

## 6. External Services & APIs

| Service | Purpose | Authentication | Endpoint |
|---------|---------|----------------|----------|
| Google Gemini API | AI-powered document analysis using Gemini 3 Pro Preview | API Key | generativelanguage.googleapis.com |
| NIST National Vulnerability Database | NIST 800-53 Rev 5 catalog access | Public | nvd.nist.gov |

---

## 7. License Summary

### 7.1 Backend Dependencies by License

| License | Count | Components |
|---------|-------|------------|
| MIT | 15 | fastapi, pydantic, pydantic-settings, pdfplumber, python-docx, PyYAML, sqlalchemy, redis, python-jose, python-dotenv, httpx, aiofiles |
| Apache-2.0 | 3 | google-generativeai, python-multipart, aiofiles |
| BSD-3-Clause | 3 | uvicorn, PyPDF2, celery |
| BSD-2-Clause | 1 | passlib |
| LGPL-3.0 | 1 | psycopg2-binary |
| HPND | 1 | Pillow |

### 7.2 Frontend Dependencies by License

| License | Count | Components |
|---------|-------|------------|
| MIT | 18 | react, react-dom, next, @types/node, @types/react, @types/react-dom, @types/d3, tailwindcss, autoprefixer, clsx, tailwind-merge, react-dropzone, axios, eslint, eslint-config-next |
| Apache-2.0 | 1 | typescript |
| ISC | 2 | lucide-react, d3 |

### 7.3 Project License

**D.A.V.E Project:** MIT License  
**Copyright:** 2026 euCann Development Team  
**Permissions:** Commercial use, modification, distribution, private use  
**Limitations:** Liability, warranty  
**Conditions:** License and copyright notice inclusion

---

## 8. Security Considerations

### 8.1 Known Vulnerabilities

- **Status:** All dependencies regularly scanned
- **Tools:** Dependabot, Snyk, pip-audit, npm audit
- **Policy:** Critical vulnerabilities patched within 48 hours

### 8.2 Supply Chain Security

- **Package Verification:** All packages installed from official registries (PyPI, npm)
- **Integrity Checks:** SHA256 hashes verified for critical dependencies
- **Update Policy:** Dependencies updated monthly, security patches applied immediately

### 8.3 API Key Management

- **Google Gemini API:** Managed via environment variables, never committed to repository
- **Secret Storage:** Production secrets stored in secure vault (not in codebase)

---

## 9. Maintenance & Updates

### 9.1 Update Schedule

- **Security Updates:** As needed (immediate for critical)
- **Minor Updates:** Monthly review
- **Major Updates:** Quarterly review with testing

### 9.2 Deprecation Notices

- None at this time
- All dependencies are actively maintained and supported

---

## 10. Compliance & Standards

### 10.1 Standards Implemented

| Standard | Version | Purpose |
|----------|---------|---------|
| NIST SP 800-53 | Revision 5 | Security and privacy controls catalog |
| OSCAL | 1.0+ | Open Security Controls Assessment Language |
| CycloneDX | 1.5 | SBOM standard format |

### 10.2 Data Protection

- **GDPR:** Compliance considerations for document processing
- **Data Retention:** Configurable retention policies
- **Encryption:** TLS 1.3 for data in transit, AES-256 for data at rest

---

## 11. Build Information

### 11.1 Backend Build

```bash
Docker Image: dave-backend:0.1.0
Base Image: python:3.13-slim
Build Tool: Docker
Package Manager: pip 24+
```

### 11.2 Frontend Build

```bash
Docker Image: dave-frontend:0.1.0
Base Image: node:20-alpine
Build Tool: Next.js
Package Manager: npm 10+
Output: Static and Server-Side Rendered pages
```

---

## 12. Contact & Support

**Project Maintainer:** euCann Development Team  
**Support:** info@eucann.life  
**Repository:** Private (euCann Develop Shared Drive)  
**Documentation:** See DOCS_INDEX.md for complete documentation

---

**Document Control:**
- **Last Updated:** February 5, 2026
- **Next Review:** March 5, 2026
- **Change Log:** See git history for detailed changes
- **Authorized By:** Project Lead

---

*This SBOM is automatically generated and maintained as part of the D.A.V.E project's security and compliance processes.*
