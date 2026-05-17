# Analytics & KPIs

## North Star Metric
**Completed Rides Per Month** — This single metric captures product-market fit, user satisfaction, and revenue health.

## Key Metrics by Category

### Business Metrics
| Metric | Definition | Target (Month 1) | Target (Month 6) |
|--------|-----------|-------------------|-------------------|
| Monthly Revenue | Total fare collected | ₹30,000 | ₹2,50,000 |
| Monthly Rides | Completed bookings | 10 | 75 |
| Average Ride Value | Revenue / rides | ₹3,000 | ₹3,500 |
| Revenue Growth Rate | MoM % change | - | 15-20% |
| Gross Margin | (Revenue - direct costs) / Revenue | 30% | 40% |

### User Metrics
| Metric | Definition | Target |
|--------|-----------|--------|
| Registered Users | Total signups | 500 (6 months) |
| Monthly Active Users | Users who open app | 100 |
| Booking Conversion Rate | Bookings / registered users | 15-20% |
| Repeat Booking Rate | Users with 2+ bookings | 30-40% |
| User Retention (30-day) | Users returning within 30 days | 25% |
| NPS Score | Net Promoter Score | 40+ |

### Operational Metrics
| Metric | Definition | Target |
|--------|-----------|--------|
| Booking Completion Rate | Completed / total bookings | 90%+ |
| Cancellation Rate | Cancelled / total bookings | <10% |
| Average Rating (Driver) | Mean driver rating | 4.5+ |
| Average Rating (User) | Mean user rating | 4.5+ |
| On-Time Pickup Rate | Pickups within 15 min of scheduled | 95% |
| Refund Rate | Refunds / total payments | <5% |
| Car Utilization | Days booked / available days | 50%+ |

### Technical Metrics
| Metric | Definition | Target |
|--------|-----------|--------|
| Uptime | Server availability | 99.5% |
| API Response Time (p95) | 95th percentile | <500ms |
| Error Rate | 5xx responses / total | <1% |
| Page Load Time | Lighthouse score | 80+ |
| Push Notification Delivery | Delivered / sent | 95% |
| SMS Delivery Rate | Delivered / sent | 98% |

## Dashboard Design

### Admin Dashboard — Daily View
```
┌──────────────────────────────────────────────────┐
│ Today's Overview                                  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │  3   │ │ ₹9K  │ │  1   │ │  2   │             │
│ │Rides │ │Rev   │ │Active│ │Upcoming│            │
│ └──────┘ └──────┘ └──────┘ └──────┘             │
├──────────────────────────────────────────────────┤
│ Active Rides (Live Map)        │ Recent Bookings  │
│ [Map with driver locations]    │ BK-001 ✅        │
│                                │ BK-002 🚗        │
│                                │ BK-003 ⏳        │
├──────────────────────────────────────────────────┤
│ Weekly Revenue Chart           │ Notifications     │
│ [Bar chart]                    │ New booking...    │
│                                │ Payment received..│
└──────────────────────────────────────────────────┘
```

### Analytics Tool: Built-In (MongoDB + Admin Dashboard)
- Zero cost — events stored in MongoDB `analytics_events` collection
- Custom funnels via MongoDB aggregation pipelines
- Charts in admin dashboard (bookings, revenue, users, routes)
- TTL auto-cleanup after 180 days
- No data sent to third party
- Future: extract as standalone monitoring product

### Key Funnels to Track

**Booking Funnel:**
```
Visit landing page → Search route → View results →
Select car → Enter details → Initiate payment →
Complete payment → Ride completed
```

**Conversion rates to monitor at each step.**

## Reporting Schedule

| Report | Frequency | Audience |
|--------|-----------|----------|
| Daily summary (rides, revenue) | Daily | Admin (push notification) |
| Weekly performance | Weekly | Admin (email) |
| Monthly business review | Monthly | Owner |
| Driver performance | Weekly | Admin |
| Car utilization | Monthly | Admin |

## Alerts

| Alert | Trigger | Channel |
|-------|---------|---------|
| Server down | Built-in health check cron fails | Push + SMS to admin |
| Payment failure | Razorpay webhook: payment.failed | Admin push |
| High cancellation | >3 cancellations in a day | Admin push |
| Low rating | Any ride rated <3 stars | Admin push |
| Document expiry | Car/driver document expiring in 7 days | Admin push + Email |
| Error spike | Built-in: >10 errors/hour in error_logs | Admin push + SMS |
