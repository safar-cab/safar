# Executive Summary — Cab Booking Web App

## Product Overview
White-label, Dockerized cab booking web app (PWA) for a single company managing chauffeur-driven cars. Starting with 1 car in Indore, MP, India — scaling to multi-car fleet. Intercity and intracity rides with advance booking, UPI-only payments, real-time GPS tracking, and full admin control.

## Key Decisions

| Area | Decision | Reasoning |
|------|----------|-----------|
| **Frontend** | React 19 + Vite + TypeScript | Pure SPA/PWA, fast HMR, tiny Docker image |
| **Backend** | NestJS 11 (ALL server logic) | DI, guards, WebSocket gateway, cron, queues |
| **Database** | MongoDB Atlas (free M0 → paid) | Flexible schema, geospatial queries, free tier |
| **Auth/Session** | httpOnly Cookies + Server Sessions (BFF) | Secure cookies, 30-day auto-refresh, no tokens in browser |
| **UI** | Tailwind CSS + shadcn/ui | Beautiful, accessible, zero lock-in |
| **Payments** | Razorpay (UPI + QR) | Best docs, Node.js SDK, 2% + GST, fast KYC |
| **Maps** | Google Maps (India pricing) | Best India coverage, $200/month free credit |
| **GPS Tracking** | Dual: Phone Geolocation + Car GPS (Traccar) | Fusion service picks best source, real-time via Socket.io |
| **Notifications** | FCM (push) + MSG91 (SMS) + Resend (email) | FCM free, MSG91 cheapest Indian SMS |
| **Hosting** | AWS EC2 (Docker Compose — all services) | Single server, free tier 12 months |
| **Domain** | .in domain (~₹99-199/year) | Cheapest, India-focused |
| **CI/CD** | GitHub Actions | 2000 free minutes/month |

## Market Opportunity
- India taxi market: **$24B** (2026), growing **7.78% CAGR**
- 150M+ monthly ride-hailing users in India
- 70%+ bookings now digital
- Gap: Intercity cab booking in Tier-2/3 cities underserved
- Indore: Growing city, limited organized cab services

## MVP Scope (1 Month)
1. User registration/login (phone + email)
2. Booking system (advance booking, calendar availability)
3. Multi-stop route planning
4. UPI payment with configurable refund policy
5. Admin panel (cars, drivers, users, bookings)
6. Driver panel (assigned rides, navigation)
7. Real-time GPS tracking
8. Push + SMS notifications
9. Rating system (bidirectional)
10. Document management (car RC, insurance, driver license)

## Estimated Monthly Costs

| Phase | Cost (₹/month) |
|-------|----------------|
| MVP (free tiers) | ₹0-500 |
| Growth (100 bookings/mo) | ₹1,500-3,000 |
| Scale (500+ bookings/mo) | ₹5,000-10,000 |

## Risk Summary
- **Legal**: Motor Vehicle Aggregator Guidelines compliance needed
- **Technical**: Solo developer, 1-month timeline is aggressive
- **Financial**: Self-funded, need revenue quickly
- **Market**: Competing with Ola/Uber brand recognition

## Files in This Research
| # | File | Topic |
|---|------|-------|
| 01 | product-identity.md | Names, branding |
| 02 | competitive-analysis.md | 10+ competitors analyzed |
| 03 | target-market.md | Personas, TAM/SAM/SOM |
| 04 | user-flow.md | User journeys, screens |
| 05 | mvp-definition.md | Feature prioritization |
| 06 | architecture.md | System design, diagrams |
| 07 | tech-stack.md | All technology choices |
| 08 | integrations.md | 3rd party services |
| 09 | setup-guides/ | Integration setup guides |
| 10 | database-design.md | MongoDB schema, ER diagram |
| 11 | sequence-diagrams.md | Flow diagrams |
| 12 | project-flow.md | Architecture diagrams |
| 13 | security.md | Auth, encryption, OWASP |
| 14 | legal-compliance.md | RTO, DPDPA, GST |
| 15 | implementation-phases.md | 4-week plan |
| 16 | production-checklist.md | Go-live checklist |
| 17 | devops.md | CI/CD, Docker, deployment |
| 18 | monetization.md | Revenue model |
| 19 | cost-management.md | Cost breakdown |
| 20 | marketing.md | Launch strategy |
| 21 | analytics-kpis.md | Metrics, dashboards |
| 22 | accessibility-i18n.md | WCAG, future i18n |
| 23 | support-docs.md | Help center, feedback |
| 24 | team-hiring.md | Scaling team |
| 25 | risk-assessment.md | Risk matrix |
| 26 | future-roadmap.md | 6mo, 1yr, 2yr plan |
