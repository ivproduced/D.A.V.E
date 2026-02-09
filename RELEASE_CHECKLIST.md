# Release Checklist for D.A.V.E v1.0.0

Use this checklist before making the repository public.

## ✅ Security & Secrets

- [x] `.env` files are in `.gitignore`
- [x] `.env.example` files created (backend and frontend)
- [x] No API keys in code or config files
- [x] Docker compose uses environment variables for passwords
- [x] `SECURITY.md` created with vulnerability reporting process
- [ ] Scan for accidentally committed secrets:
  ```bash
  git log --all --full-history -- "*.env"
  git log -p | grep -i "api_key\|secret\|password" | grep -v "example"
  ```

## ✅ Documentation

- [x] `README.md` updated with badges and clear instructions
- [x] `QUICKSTART.md` with step-by-step setup
- [x] `CONTRIBUTING.md` with contribution guidelines
- [x] `CHANGELOG.md` with v1.0.0 release notes
- [x] `LICENSE` file present (MIT)
- [x] `SECURITY.md` with security policy
- [x] API documentation in `API.md`
- [x] Architecture docs in `PROJECT_STRUCTURE.md`
- [ ] Verify all links work in documentation

## ✅ Code Quality

- [ ] Run linters:
  ```bash
  # Backend
  cd backend
  black app/
  flake8 app/
  
  # Frontend
  cd frontend
  npm run lint
  ```
- [ ] Run tests:
  ```bash
  # Backend
  pytest tests/
  
  # Frontend
  npm test
  ```
- [ ] Remove debug/console logs
- [ ] Check for TODO/FIXME comments
- [ ] Verify error handling is production-ready

## ✅ Configuration

- [ ] Review `.gitignore` completeness:
  - `__pycache__/`, `*.pyc`
  - `node_modules/`, `.next/`
  - `.env`, `.env.local`
  - `.vscode/`, `.idea/`
  - `*.log`, `uploads/`, `temp/`
- [ ] Update `docker-compose.yml`:
  - [x] Use env vars for passwords
  - [ ] Remove development-only services
  - [ ] Set resource limits if needed
- [ ] Check `requirements.txt` and `package.json`:
  - [ ] Remove unused dependencies
  - [ ] Update versions if needed

## ✅ Repository Settings (GitHub)

- [ ] Set repository to **Public**
- [ ] Add repository description: "AI-powered NIST 800-53 compliance automation using Google Gemini 2.0"
- [ ] Add topics/tags: `compliance`, `nist-800-53`, `gemini`, `oscal`, `security`, `ai`, `fastapi`, `nextjs`
- [ ] Enable Discussions (for Q&A)
- [ ] Set up Issue Templates:
  - Bug report
  - Feature request
- [ ] Configure branch protection (if needed):
  - Require PR reviews
  - Require status checks
- [ ] Add `.github/` folder with templates (optional):
  - `PULL_REQUEST_TEMPLATE.md`
  - `ISSUE_TEMPLATE/bug_report.md`
  - `ISSUE_TEMPLATE/feature_request.md`

## ✅ Legal & Licensing

- [x] `LICENSE` file present (MIT)
- [ ] Review third-party licenses in dependencies
- [ ] Add copyright headers if required
- [ ] Verify OSCAL usage complies with NIST license

## ✅ Testing

- [ ] Test fresh clone and setup:
  ```bash
  git clone <your-repo>
  cd D.A.V.E
  # Follow QUICKSTART.md exactly
  ```
- [ ] Verify Docker setup works:
  ```bash
  docker compose up --build
  ```
- [ ] Test with sample evidence files
- [ ] Check all three modes (Quick/Smart/Deep)
- [ ] Verify OSCAL artifact generation

## ✅ Final Steps

- [ ] Create v1.0.0 release tag:
  ```bash
  git tag -a v1.0.0 -m "Initial public release"
  git push origin v1.0.0
  ```
- [ ] Create GitHub Release with:
  - Release notes from `CHANGELOG.md`
  - Installation instructions
  - Known issues (if any)
- [ ] Update social media/portfolio links
- [ ] Announce release (optional):
  - Reddit: r/opensource, r/security
  - Twitter/LinkedIn
  - Hacker News

## 🎉 Post-Release

- [ ] Monitor issues and discussions
- [ ] Respond to pull requests
- [ ] Set up CI/CD (optional, you skipped this)
- [ ] Create project roadmap
- [ ] Consider:
  - Documentation website
  - Demo video
  - Blog post

---

## Quick Commands

### Remove .env from git history (if accidentally committed):
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env frontend/.env.local" \
  --prune-empty --tag-name-filter cat -- --all
```

### Scan for secrets:
```bash
# Using truffleHog (install first)
trufflehog git file://. --only-verified

# Or manually
git log -p | grep -i "api.*key\|secret\|password" | grep -v "example"
```

### Test clean install:
```bash
# Completely fresh test
cd /tmp
git clone https://github.com/yourusername/D.A.V.E.git
cd D.A.V.E
cat QUICKSTART.md  # Follow step by step
```

---

**Ready for public release? Double-check the Security & Secrets section!** ✅
