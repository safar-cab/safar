# Security Architecture

## Authentication Strategy

### httpOnly Cookie Sessions (BFF Pattern — No JWT in Browser)
- Server-side sessions stored in MongoDB (`sessions` collection)
- Session ID in httpOnly, Secure, SameSite=Strict cookie
- 30-day sliding window auto-refresh (resets on each request)
- Phone OTP via MSG91 (primary login)
- Email + password (secondary)
- No tokens exposed to JavaScript — immune to XSS token theft
- Instant revocation: delete session from MongoDB = immediate logout
- WebSocket auth: cookie sent automatically on Socket.io handshake

### Role-Based Access Control (RBAC)

| Role | Access Level |
|------|-------------|
| `guest` | Public pages, search, pricing |
| `user` | Book rides, track, pay, rate, profile |
| `driver` | Assigned rides, navigation, status updates |
| `admin` | Full access: CRUD all entities, settings |

### Middleware Implementation
```typescript
// middleware.ts — protect routes by role
const roleRoutes = {
  '/dashboard': ['user', 'driver', 'admin'],
  '/admin': ['admin'],
  '/driver': ['driver', 'admin'],
  '/book': ['user'],
  '/api/admin': ['admin'],
  '/api/driver': ['driver', 'admin'],
};
```

## Data Encryption

### At Rest
- MongoDB Atlas: Encrypted at rest by default (AES-256)
- AWS S3: Server-side encryption (SSE-S3)
- Sensitive fields (Aadhaar number): Encrypt with AES-256 before storing
- Passwords: bcrypt with salt rounds = 12

### In Transit
- HTTPS everywhere (Let's Encrypt / Cloudflare)
- WSS for WebSocket connections
- TLS 1.2+ minimum

## API Security

### Rate Limiting
```
| Endpoint | Limit |
|----------|-------|
| POST /api/auth/send-otp | 3 requests/phone/10 min |
| POST /api/auth/verify-otp | 5 attempts/phone/10 min |
| POST /api/bookings | 10/user/hour |
| GET /api/* (authenticated) | 100/user/minute |
| POST /api/webhooks/* | No limit (IP whitelist) |
```

### CORS Configuration
```typescript
// Only allow your domain
const corsOptions = {
  origin: ['https://yourdomain.in'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
};
```

### Input Validation
- Zod schemas on ALL API routes
- Sanitize HTML in user inputs (DOMPurify)
- Validate file uploads (type, size, dimensions)
- Parameterized MongoDB queries (Mongoose handles this)

### Razorpay Webhook Security
- Verify HMAC SHA256 signature on every webhook
- Use webhook secret (never expose)
- Idempotency: check if payment already processed

## OWASP Top 10 Mitigation

| Risk | Mitigation |
|------|-----------|
| **A01: Broken Access Control** | RBAC middleware, route guards, API auth checks |
| **A02: Cryptographic Failures** | HTTPS, bcrypt passwords, AES for PII |
| **A03: Injection** | Mongoose parameterized queries, Zod validation |
| **A04: Insecure Design** | Threat modeling, refund policy checks, booking validation |
| **A05: Security Misconfiguration** | Env vars not in code, no debug in prod, security headers |
| **A06: Vulnerable Components** | npm audit, Dependabot, lock file |
| **A07: Auth Failures** | OTP rate limiting, server-side sessions, 30-day sliding expiry, force logout |
| **A08: Software Integrity** | Docker image signing, npm lockfile, webhook verification |
| **A09: Logging Failures** | Built-in error tracking (NestJS → MongoDB error_logs), audit log for admin actions |
| **A10: SSRF** | No user-controlled URLs in server requests |

## Security Headers (Nginx)
```nginx
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://maps.googleapis.com; img-src 'self' https://*.s3.amazonaws.com https://maps.googleapis.com data:; connect-src 'self' wss://yourdomain.in https://api.razorpay.com;";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

## Secret Management

### Environment Variables (Never in Code)
```env
# .env.local (NEVER commit)
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
GOOGLE_MAPS_API_KEY=
FIREBASE_CONFIG=
MSG91_AUTH_KEY=
MSG91_SENDER_ID=
RESEND_API_KEY=
```

### Production Secrets
- Use AWS Parameter Store or Secrets Manager
- Or Docker secrets in swarm mode
- Rotate keys quarterly
- Different keys for dev/staging/prod

## File Upload Security
- Max file size: 5MB (images), 10MB (documents)
- Allowed types: jpg, jpeg, png, pdf
- Validate MIME type server-side (not just extension)
- Generate unique filenames (UUID)
- S3 presigned URLs (expire in 5 min for upload)
- Virus scanning (future, with ClamAV)

## Audit Trail
Log admin actions to MongoDB:
- User blocked/unblocked
- Driver verified/deactivated
- Car added/removed
- Booking manually cancelled
- Settings changed
- Refund initiated

## Incident Response
1. Built-in error alert (push notification to admin) → investigate in admin panel
2. Built-in health check cron → push + SMS alert if service down
3. If breach suspected: rotate all API keys, delete all sessions from MongoDB (instant force-logout all users)
4. MongoDB Atlas has IP whitelist — restrict to EC2 IP only
