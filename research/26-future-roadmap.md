# Future Roadmap

## 6-Month Roadmap

### Month 1: MVP Launch
- Core booking flow
- UPI payments (Razorpay)
- GPS tracking (driver phone)
- Push + SMS notifications
- Admin panel (cars, drivers, users)
- Deploy on AWS EC2

### Month 2: Stabilize + Enhance
- Bug fixes from real usage
- Car GPS device integration (Traccar)
- Email notifications (Resend)
- Ride extension feature
- Share ride tracking link
- Customer feedback loop

### Month 3: Growth Features
- Multiple car categories (sedan, SUV)
- Advanced admin dashboard (charts, reports)
- Driver performance scoring
- Route optimization
- Google Reviews integration
- SEO blog posts

### Month 4: Retention
- Referral program (₹100 each)
- Repeat booking discounts
- Favorite routes quick-book
- Booking history + rebooking
- Dark mode
- Improved onboarding

### Month 5: Scale Prep
- Multi-driver management
- Driver shift scheduling
- Vehicle maintenance tracker
- Fuel expense logging
- Invoice generation (GST)
- Enhanced built-in analytics dashboard (advanced charts, exports)

### Month 6: Expand
- Add 3-5 more cars
- Expand routes (new cities in MP)
- Corporate accounts
- Monthly billing for corporates
- WhatsApp Business API notifications

---

## 1-Year Roadmap

### Q3 (Months 7-9)
- **Mobile App**: React Native or Flutter
  - Shared backend with web app
  - Native GPS for better tracking
  - Native push notifications
  - App store + Play Store listing
- **Multi-City**: Bhopal, Ujjain as origin cities
- **Tour Packages**: Curated multi-day trips
- **Dynamic Pricing**: Peak hours, festivals, seasons

### Q4 (Months 10-12)
- **White-Label Product**: Package for other cab companies
  - Docker deployment guide
  - Admin setup wizard
  - Custom branding via settings
  - Documentation for buyers
- **AI Features**:
  - Demand prediction (which routes, which days)
  - Dynamic pricing recommendations
  - Chatbot for booking via WhatsApp
- **Driver App**: Dedicated driver mobile app
- **Fleet Analytics**: Utilization, revenue per car, maintenance due

---

## 2-Year Vision

### Year 2 Goals
| Goal | Description |
|------|-------------|
| **10+ cars** | Fleet expansion in Indore and MP |
| **Pan-MP coverage** | All major cities in Madhya Pradesh |
| **White-label sales** | Sell to 5-10 cab companies |
| **₹50L+ annual revenue** | From rides + licensing |
| **Team of 5** | Dev, ops, marketing, 2 managers |
| **Mobile app launched** | iOS + Android |

### Feature Roadmap
- **Multi-tenant SaaS**: One codebase, multiple companies
- **Franchise Model**: License brand + tech to city operators
- **EV Integration**: Electric vehicles with charging station mapping
- **API Marketplace**: Let third-party apps book through your API
- **Loyalty Program**: Points, tiers, rewards
- **Insurance Integration**: Per-ride travel insurance
- **Multi-Language**: Hindi, Marathi, Gujarati
- **Offline Booking**: Book via SMS/WhatsApp when no internet
- **Voice Booking**: "Ok Google, book a cab to Bhopal"

---

## Technology Evolution

| Phase | Current | Future |
|-------|---------|--------|
| **Frontend** | React + Vite PWA | + React Native mobile app |
| **Backend** | NestJS monolith | NestJS microservices (split by domain) |
| **State** | Redux + Redux-Saga | Same (scales well) |
| **Auth** | Cookie sessions (MongoDB) | + OAuth2 (Google/Apple login) |
| **Database** | MongoDB M0 | MongoDB Atlas dedicated + Redis cluster |
| **Hosting** | Single EC2 | ECS/EKS with auto-scaling |
| **Maps** | Google Maps | + MapmyIndia for India-specific features |
| **Payments** | Razorpay | + Direct UPI PSP integration |
| **Monitoring** | Built-in (error/health/analytics) | Extract as standalone SaaS product |
| **AI/ML** | None | Demand prediction, route optimization |

---

## Exit Strategies

1. **Continue growing**: Build a cab empire in MP and beyond
2. **White-label SaaS**: Focus on selling the platform (recurring revenue)
3. **Franchise**: License brand + tech, city-by-city
4. **Acquisition**: Attract acquisition from larger player (Savaari, CabBazar)
5. **Open source core**: Monetize via support + enterprise features

---

## Milestones

| Milestone | Target Date | Metric |
|-----------|------------|--------|
| First booking | Month 1 | 1 completed ride |
| 50 bookings | Month 3 | Validation |
| Break-even | Month 4 | 17+ rides/month |
| Second car | Month 6 | Revenue supports it |
| 500 registered users | Month 6 | Growth |
| Mobile app launch | Month 9 | App store listing |
| First white-label sale | Month 12 | Product-market fit |
| 10 cars | Year 2 | Scale |
| ₹50L revenue | Year 2 | Business viability |
