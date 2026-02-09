# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of D.A.V.E seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Disclose Publicly

Please do not open a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send details to: **[security@eucann.life]** (or create a private security advisory on GitHub)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-3 days
  - High: 7-14 days
  - Medium: 30 days
  - Low: Next release cycle

### 4. Disclosure Process

1. We acknowledge receipt of your report
2. We investigate and validate the issue
3. We develop and test a fix
4. We release a patch
5. We publish a security advisory
6. We credit you (if desired) after disclosure

## Security Best Practices

If you're deploying D.A.V.E, follow these guidelines:

### Environment Variables

**Never commit `.env` files**. Always use:
- `.env.example` as templates
- Environment variables in production
- Secret managers (AWS Secrets Manager, GCP Secret Manager)

### API Keys

- **Rotate keys regularly** (every 90 days)
- **Use separate keys** for dev/staging/production
- **Restrict API key permissions** to minimum required
- **Monitor usage** for anomalies

### Docker Deployment

```yaml
# Use environment variables (not hardcoded values)
environment:
  - GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}
  - DATABASE_URL=${DATABASE_URL}
  - SECRET_KEY=${SECRET_KEY}
```

### Database Security

- **Change default passwords** in docker-compose.yml
- **Use strong passwords** (16+ characters, mixed case, numbers, symbols)
- **Restrict network access** (firewall rules, VPC)
- **Enable SSL/TLS** for database connections
- **Regular backups** with encryption

### File Upload Security

D.A.V.E includes these protections:
- File size limits (50MB default)
- File type validation (7 allowed formats)
- Content scanning
- Isolated processing environment

**Additional recommendations**:
- Deploy antivirus scanning
- Implement rate limiting
- Monitor for suspicious uploads

### Network Security

- **Use HTTPS** in production (TLS 1.3)
- **Configure CORS** properly (restrict origins)
- **Enable firewalls** (only expose necessary ports)
- **Use Web Application Firewall (WAF)**

### Monitoring & Logging

- **Log security events** (failed auth, suspicious activity)
- **Set up alerts** for anomalies
- **Regular security audits**
- **Monitor API usage** and quota

### Dependencies

- **Keep dependencies updated** (use Dependabot)
- **Scan for vulnerabilities** (`pip-audit`, `npm audit`)
- **Review security advisories** regularly

## Known Security Considerations

### Google Gemini API
- API keys provide full access to your Google AI account
- Implement rate limiting to prevent quota exhaustion
- Monitor usage for cost control and anomaly detection

### Session Management
- Sessions are stored in memory (not persistent)
- Consider Redis for production session storage
- Implement session expiration policies

### File Processing
- Uploaded files are processed in memory
- Large files may consume significant resources
- Consider worker pools for isolation

### OSCAL Artifacts
- Generated artifacts may contain sensitive data
- Implement access controls for downloads
- Consider encryption at rest

## Compliance

D.A.V.E is designed to assist with NIST 800-53 compliance, but:
- **We are not responsible** for your compliance outcomes
- **Review all generated artifacts** before submission
- **Validate recommendations** against your environment
- **Consult security professionals** for critical systems

## Security Features

D.A.V.E includes:
- ✅ Input validation and sanitization
- ✅ File type and size restrictions
- ✅ Session-based access control
- ✅ Environment variable isolation
- ✅ CORS configuration
- ✅ Error handling (no sensitive data leakage)
- ✅ Rate limiting support

## Third-Party Services

D.A.V.E integrates with:
- **Google Gemini AI**: Data sent to Google's API (see [Google's security practices](https://cloud.google.com/security))
- **PostgreSQL**: Open-source database
- **Redis**: Open-source cache

Review each service's security documentation.

## Updates

Check this document regularly for updates. Subscribe to security advisories via GitHub.

---

**Last Updated**: February 8, 2026  
**Policy Version**: 1.0
