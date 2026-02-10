# D.A.V.E Technology Stack

## Languages
- **Python 3.11** - Backend API and AI orchestration
- **TypeScript 5.9** - Frontend application code
- **JavaScript** - Build tooling and configuration

## Frontend Framework & Libraries
- **Next.js 16.1** - React framework with App Router
- **React 19.2** - UI component library
- **Tailwind CSS 3.4** - Utility-first styling
- **axios 1.13** - HTTP client for API calls
- **react-dropzone 14.4** - File upload component
- **D3.js 7.9** - Advanced data visualization
- **Recharts 3.7** - React charting library
- **lucide-react 0.563** - Icon library
- **class-variance-authority** - Component variants utility

## Backend Framework & Core
- **FastAPI 0.115** - Modern Python web framework
- **Uvicorn 0.34** - ASGI server with async support
- **websockets 14.1** - WebSocket support for real-time updates
- **python-multipart 0.0.20** - Multipart form data parsing
- **SQLAlchemy 2.0** - Python ORM for database operations
- **Pydantic 2.10** - Data validation and settings management
- **pydantic-settings 2.7** - Environment-based configuration
- **python-dotenv 1.0** - Environment variable management

## AI & Machine Learning
- **google-generativeai 0.8.3** - Google Gemini API client
- **Google Gemini 3 Pro Preview** - Large language model with 1M token context
- **Multimodal AI** - Text, image, and document analysis capabilities

## Document Processing
- **PyPDF2 3.0** - PDF parsing and extraction
- **pdfplumber 0.11** - Advanced PDF text extraction
- **python-docx 1.1** - Microsoft Word document processing
- **Pillow 11.1** - Image processing (PNG, JPEG)
- **PyYAML 6.0** - YAML configuration file parsing

## Databases & Caching
- **PostgreSQL 16** - Relational database for persistent storage
- **psycopg2-binary 2.9** - PostgreSQL database adapter
- **Redis 7** - In-memory cache for session management and real-time status
- **redis 7.1** - Redis Python client

## Background Tasks & Async
- **Celery 5.4** - Distributed task queue for background processing
- **aiofiles 24.1** - Async file I/O operations
- **httpx 0.28** - Async HTTP client

## Security & Authentication
- **python-jose 3.3** - JSON Web Token (JWT) implementation
- **passlib 1.7** - Password hashing with bcrypt support

## Standards & Tools
- **OSCAL-CLI (@oscal/cli)** - NIST OSCAL validation tool (npm package)
- **OSCAL 1.2.0** - Open Security Controls Assessment Language schema
- **NIST 800-53 Rev 5** - Security and privacy controls catalog (JSON format)

## Infrastructure & DevOps
- **Docker** - Container platform for consistent deployments
- **Docker Compose** - Multi-container orchestration
- **Node.js 20** - JavaScript runtime (installed in backend for OSCAL-CLI)
- **GitHub** - Version control and collaboration

## Testing & Quality Assurance
- **Pytest 8.1** - Python testing framework for backend
- **pytest-asyncio 0.23** - Async test support for pytest
- **Playwright 1.58** - End-to-end testing for frontend
- **ESLint 9.39** - JavaScript/TypeScript linting
- **autoprefixer 10.4** - CSS vendor prefixing

## File Format Support
- **PDF** - Policy documents (PyPDF2, pdfplumber)
- **DOCX** - Word documents (python-docx)
- **PNG/JPEG** - Screenshots and diagrams (Pillow)
- **JSON** - Configuration files and OSCAL output
- **YAML** - Infrastructure as Code configs (PyYAML)
- **Markdown** - Documentation and policies
- **TXT** - Plain text evidence

## Architecture Pattern
- **Microservices** - Separated frontend, backend, database, and cache services
- **REST API** - HTTP-based client-server communication
- **Multi-Agent AI Pipeline** - 5-agent architecture for compliance automation
- **Async/Await** - Non-blocking I/O for scalable performance
- **WebSocket Polling** - Real-time status updates (1-second intervals)
