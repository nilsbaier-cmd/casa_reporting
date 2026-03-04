# Security Checklist

## Threat Model (MVP)

### Protected assets
- Admin publishing capability (`/api/publish`)
- Published output integrity (`public/data/published.json`)
- Uploaded raw INAD/BAZL records
- Session/authentication state

### Primary attacker goals
- Bypass login and access admin functionality
- Trigger unauthorized publish operations
- Inject malicious formulas into exported CSVs
- Exfiltrate raw uploaded data from browser storage

### Controls implemented
- Server-side signed session cookie with `HttpOnly`, `Secure`, `SameSite`
- Middleware route protection for `/admin` and `/viewer`
- Admin-only authorization and CSRF protection for `/api/publish`
- Strict payload validation for publish endpoint
- CSV formula injection mitigation for all CSV exports
- Removal of raw-data persistence from `sessionStorage`
- Security response headers (CSP, clickjacking, MIME sniffing, referrer, permissions)

## Regression Test Checklist

Run on every release candidate:

1. Anonymous request to `/admin` redirects to `/admin/login`.
2. Anonymous request to `/viewer` redirects to `/viewer/login`.
3. Viewer session cannot access `/admin` and cannot publish.
4. Admin session can publish with valid CSRF token.
5. Publish request without or with invalid CSRF token is rejected (`403`).
6. Publish request with invalid payload is rejected (`400`).
7. CSV exports prefix fields that begin with `=`, `+`, `-`, `@`.
8. Raw INAD/BAZL data is not persisted in browser storage across reload.
9. Security headers are present on application pages.

## Operational Requirements

- Set `AUTH_SECRET`, `ADMIN_PASSWORD`, `VIEWER_PASSWORD`, and `GITHUB_TOKEN` in production.
- Rotate `AUTH_SECRET` and passwords according to organizational policy.
- Limit `GITHUB_TOKEN` to the minimum repository scope needed for content updates.
