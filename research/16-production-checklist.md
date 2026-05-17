# Production Readiness Checklist

## Infrastructure

- [ ] AWS EC2 instance (t2.micro or t3.micro) launched
- [ ] Elastic IP assigned to EC2
- [ ] Security group: ports 80, 443, 22 (your IP only)
- [ ] SSH key pair created and stored securely
- [ ] Docker + Docker Compose installed on EC2
- [ ] Swap file configured (1-2GB for t2.micro)

## Domain & SSL

- [ ] Domain registered (.in)
- [ ] DNS pointed to EC2 Elastic IP (Cloudflare recommended)
- [ ] Cloudflare proxy enabled (free DDoS protection + CDN)
- [ ] SSL certificate via Cloudflare (Full Strict mode)
- [ ] Or: Let's Encrypt via Certbot on Nginx
- [ ] HTTPS redirect configured
- [ ] www → non-www redirect (or vice versa)

## Database

- [ ] MongoDB Atlas cluster (M0 free → Mumbai region)
- [ ] Database user created with strong password
- [ ] IP whitelist: EC2 Elastic IP only
- [ ] Connection string in environment variables
- [ ] Indexes created on all collections
- [ ] Seed data loaded (admin user, sample routes)
- [ ] Backup schedule (Atlas has automatic daily backups on paid plans)

## Application

- [ ] Production Docker images built and tested
- [ ] docker-compose.prod.yml configured
- [ ] All environment variables set in .env.production
- [ ] No hardcoded secrets in code
- [ ] Debug/development mode OFF
- [ ] Console.log statements removed/reduced
- [ ] Error pages (404, 500) created

## Security

- [ ] Nginx security headers configured
- [ ] Rate limiting on auth endpoints
- [ ] CORS restricted to your domain
- [ ] Razorpay webhook signature verification
- [ ] File upload size limits enforced
- [ ] No sensitive data in git (check .gitignore)
- [ ] Admin default password changed
- [ ] MongoDB connection uses TLS

## External Services (Live Mode)

- [ ] Razorpay: KYC completed, live mode activated
- [ ] Razorpay: Webhook URL configured (production domain)
- [ ] Google Maps: API key restricted (HTTP referrer + API restriction)
- [ ] Firebase: Production project, VAPID key configured
- [ ] MSG91: DLT registration done, templates approved
- [ ] MSG91: Sender ID approved
- [ ] AWS S3: Bucket created, CORS configured, IAM user with minimal permissions
- [ ] Resend: Domain verified, SPF/DKIM records set

## Monitoring

- [ ] Built-in error tracking: GlobalExceptionFilter active, error_logs writing
- [ ] Built-in health checks: @Cron running, push + SMS alerts configured
- [ ] Built-in analytics: event tracking active, analytics_events writing
- [ ] Health check endpoint: GET /api/health (returns DB + Redis + services status)

## Performance

- [ ] React production build (vite build) succeeds
- [ ] NestJS production build (nest build) succeeds
- [ ] Images optimized (next/image with sharp)
- [ ] Static pages pre-rendered where possible
- [ ] Gzip/Brotli compression in Nginx
- [ ] Bundle size checked (no huge dependencies)

## Legal Pages

- [ ] Privacy Policy page live
- [ ] Terms of Service page live
- [ ] Refund & Cancellation Policy page live
- [ ] Cookie consent banner (if using analytics cookies)

## Testing Before Launch

- [ ] Complete booking flow (search → book → pay → track → complete)
- [ ] Cancellation with refund
- [ ] Driver flow (login → accept → navigate → complete)
- [ ] Admin: add car, add driver, manage users
- [ ] Notifications: push + SMS received
- [ ] Mobile responsiveness (iPhone, Android Chrome)
- [ ] PWA install works (Android Chrome, Desktop)
- [ ] Payment in Razorpay LIVE mode (small amount test)
- [ ] GPS tracking shows on map

## Go-Live Day

1. Switch Razorpay to live mode
2. Switch MSG91 to production
3. Deploy final Docker build
4. Run all smoke tests
5. Create first real booking
6. Check admin panel error dashboard — no errors
7. Verify health check cron running (admin health page)
8. Share app URL with first users
