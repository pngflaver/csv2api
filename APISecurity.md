# API Security & Compliance Guide

This document outlines the security measures implemented in your API server and provides a roadmap to meet the minimum requirements for Australian Government API deployment (see https://api.gov.au/).

---

## Current Security Features

- **Password Hashing:** Admin password is securely hashed using bcrypt and stored in `server/chest.txt`. Password changes are persistent and never stored in plain text.
- **API Key Management:** All sensitive endpoints require an API key or lookup key. Keys can be rotated and are stored on disk.
- **Authentication:** Only the admin user (`bruce`) can log in and change the password. Login and password change endpoints require correct credentials.
- **Rate Limiting:** The `/api/lookup` endpoint is rate-limited per IP (5 requests per minute) to prevent abuse.
- **Audit Logging:** All API requests are logged with timestamp, IP, user agent, and masked token for traceability.
- **Error Handling:** All errors return JSON with appropriate status codes; stack traces are only shown in development or server logs.
- **Token Masking:** API tokens are masked in logs to avoid leaking secrets.
- **CORS:** Cross-Origin Resource Sharing is enabled and can be configured for public/private APIs.

---

## Assessment Against Australian Government API Minimum Standards

| Requirement         | Status         | Notes |
|---------------------|---------------|-------|
| Authentication      | Meets minimum | API keys & password; consider OAuth2/JWT for public APIs |
| HTTPS               | Not met       | Must enforce HTTPS for all endpoints |
| Documentation       | Meets minimum | Detailed docs in README.md & APIFunctions.md |
| Rate Limiting       | Meets minimum | Implemented for /api/lookup |
| Error Handling      | Meets minimum | Standard HTTP codes & JSON errors |
| Logging & Auditing  | Meets minimum | All requests logged |
| Security            | Meets minimum | Password hashing, token masking |
| Versioning          | Not met       | Should version endpoints (e.g., /v1/) |
| CORS                | Meets minimum | Enabled |
| OpenAPI/Swagger     | Not met       | Should provide openapi.yaml/swagger.json |

---

## Roadmap to Full Compliance

1. **Enforce HTTPS**
   - Deploy behind a reverse proxy (e.g., Nginx) or use a cloud platform that provides HTTPS.
   - Redirect all HTTP traffic to HTTPS.

2. **Add API Versioning**
   - Prefix all endpoints with `/v1/` (or `/v2/` for future changes).
   - Update documentation to reflect versioned endpoints.

3. **Provide OpenAPI/Swagger Spec**
   - Create an `openapi.yaml` or `swagger.json` describing all endpoints, parameters, responses, and security.
   - Use tools like [Swagger Editor](https://editor.swagger.io/) to generate and validate your spec.

4. **Upgrade Authentication (Optional for public APIs)**
   - Consider supporting OAuth2 or JWT for external integrations.

5. **Review CORS Policy**
   - Restrict origins as needed for security.

6. **Deploy with HTTPS**
   - Use a platform like AWS, Azure, or Heroku, or set up Nginx/Apache with SSL certificates.

7. **Regular Security Audits**
   - Scan for vulnerabilities, keep dependencies up to date, and review logs.

---

## Summary

Your app is close to meeting Australian Government API minimum standards. Focus on HTTPS, versioning, and OpenAPI/Swagger documentation to be fully compliant.
