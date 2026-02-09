# Contributing to D.A.V.E

Thank you for your interest in contributing to D.A.V.E (Document Analysis & Validation Engine)! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and harassment-free environment for everyone.

**Note on Licensing**: D.A.V.E uses a Dual License model. Contributions are made under the same dual license terms. By contributing, you agree that your contributions may be used under both the Government & Non-Profit License (free) and Commercial License (paid). See [LICENSE](LICENSE) for details.

## How to Contribute

### Reporting Issues

- **Search existing issues** before creating a new one
- Use the issue template and provide:
  - Clear, descriptive title
  - Steps to reproduce (if it's a bug)
  - Expected vs actual behavior
  - Environment details (OS, Python version, Node version)
  - Error messages or logs

### Suggesting Features

- Check the roadmap and existing issues first
- Explain the problem your feature solves
- Describe the proposed solution
- Consider implementation complexity and scope

### Pull Requests

1. **Fork the repository** and create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed
   - Keep commits atomic and well-described

3. **Test your changes**:
   ```bash
   # Backend tests
   cd backend
   pytest
   
   # Frontend tests
   cd frontend
   npm test
   ```

4. **Submit a pull request**:
   - Reference related issues
   - Describe what changed and why
   - Include screenshots for UI changes
   - Ensure CI checks pass

## Development Setup

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

### Quick Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your GOOGLE_AI_API_KEY

# Frontend
cd frontend
npm install
cp .env.local.example .env.local
```

### Running Tests

```bash
# Backend unit tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## Code Style

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints for function signatures
- Maximum line length: 100 characters
- Use `black` for auto-formatting:
  ```bash
  pip install black
  black app/
  ```

### TypeScript (Frontend)
- Follow Airbnb style guide
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use Prettier for formatting:
  ```bash
  npm run format
  ```

## Project Structure

```
D.A.V.E/
├── backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── main.py              # API routes
│   │   ├── models.py            # Pydantic models
│   │   ├── config.py            # Configuration
│   │   └── services/            # AI agents
│   │       └── gemini_service.py
│   └── tests/        # Backend tests
├── frontend/         # Next.js frontend
│   ├── app/          # App router pages
│   ├── components/   # React components
│   └── e2e/          # Playwright tests
└── docs/             # Documentation
```

## Adding Features

### New AI Agent

1. Add agent logic to `backend/app/services/gemini_service.py`
2. Define models in `backend/app/models.py`
3. Add API endpoint in `backend/app/main.py`
4. Update frontend components
5. Add tests and documentation

### New Control Family Support

1. Update `ControlFamily` enum in `models.py`
2. Add family metadata to `gemini_service.py`
3. Update baseline definitions if needed
4. Test with sample evidence

### UI Component

1. Create component in `frontend/components/`
2. Follow existing shadcn/ui patterns
3. Ensure responsive design
4. Add TypeScript types
5. Test across browsers

## Documentation

- Update README.md for user-facing changes
- Add inline code comments for complex logic
- Update API.md for new endpoints
- Add examples to QUICKSTART.md

## Commit Message Format

```
type(scope): brief description

Longer explanation if needed

Fixes #123
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`  
**Scopes**: `backend`, `frontend`, `docs`, `ci`, `deps`

Examples:
- `feat(backend): add AC-20 control family support`
- `fix(frontend): correct progress bar animation timing`
- `docs(readme): add installation troubleshooting section`

## Questions?

- Open a GitHub Discussion for general questions
- Check existing documentation in `/docs`
- Review closed issues and PRs for examples

Thank you for contributing! 🙌
