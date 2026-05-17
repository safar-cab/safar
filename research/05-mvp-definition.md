# MVP Definition

## MVP Timeline: 4 Weeks

## Must-Have (MVP v1.0)

### Week 1-2: Foundation + Core
- [ ] User auth (phone OTP + email)
- [ ] Role-based access (User, Driver, Admin)
- [ ] Car management (Admin: add car + documents)
- [ ] Driver management (Admin: add driver + documents)
- [ ] Route/pricing configuration (Admin: per-km rate)
- [ ] Basic booking flow (from → to → date → car → pay)
- [ ] Calendar availability (blocked dates per car)
- [ ] MongoDB schema + seed data

### Week 3: Booking + Payments
- [ ] Multi-stop booking
- [ ] Razorpay UPI integration
- [ ] Payment confirmation + receipt
- [ ] Cancellation with configurable refund
- [ ] Booking status management
- [ ] Driver ride assignment
- [ ] Push notifications (FCM)

### Week 4: Tracking + Polish
- [ ] Live GPS tracking (driver phone geolocation)
- [ ] Driver status updates (en route, picked up, completed)
- [ ] Rating system (bidirectional)
- [ ] Admin dashboard with stats
- [ ] SMS notifications (MSG91)
- [ ] PWA setup (installable, push)
- [ ] Deploy to production

## Nice-to-Have (v1.1 — Month 2)
- [ ] Car GPS device integration (Traccar)
- [ ] Ride extension during trip
- [ ] Email notifications (Resend)
- [ ] Advanced reports and analytics
- [ ] User document upload (ID proof)
- [ ] Toll calculation display
- [ ] Ride sharing link (share tracking with family)
- [ ] Dark mode

## Future (v2.0+)
- [ ] Mobile app (React Native / Flutter)
- [ ] Multi-company white-label admin
- [ ] WhatsApp notifications
- [ ] Corporate accounts
- [ ] Scheduled recurring rides
- [ ] Dynamic pricing rules
- [ ] Driver payroll management
- [ ] Fuel expense tracking
- [ ] Vehicle maintenance reminders
- [ ] AI-based demand prediction

## MVP Success Criteria
1. Complete booking flow works end-to-end
2. UPI payment succeeds and refund works
3. GPS tracking shows driver location in real-time
4. Admin can manage cars, drivers, users
5. Notifications delivered (push + SMS)
6. App installable as PWA
7. First real booking completed

## Feature Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Booking flow | High | High | P0 |
| UPI payment | High | Medium | P0 |
| Calendar availability | High | Medium | P0 |
| GPS tracking | High | High | P0 |
| Admin car/driver CRUD | High | Medium | P0 |
| Push notifications | Medium | Low | P0 |
| Multi-stop routes | Medium | Medium | P1 |
| Rating system | Medium | Low | P1 |
| SMS notifications | Medium | Low | P1 |
| Refund system | High | Medium | P0 |
| Ride extension | Low | Medium | P2 |
| Reports/analytics | Low | Medium | P2 |
| Car GPS (Traccar) | Medium | High | P2 |
| Dark mode | Low | Low | P3 |
