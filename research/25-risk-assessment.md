# Risk Assessment

## Risk Matrix

| Risk | Probability | Impact | Severity | Mitigation |
|------|------------|--------|----------|-----------|
| Solo dev burnout | High | High | Critical | Scope MVP ruthlessly, take breaks |
| 1-month deadline too tight | High | Medium | High | Prioritize P0 features only, cut P1/P2 |
| Ola/Uber price undercutting | Medium | High | High | Differentiate on service, not price |
| Low initial demand | High | High | Critical | Pre-sell to network, corporate tie-ups |
| Driver no-show | Medium | High | High | Backup driver plan, penalties |
| Payment disputes | Medium | Medium | Medium | Clear refund policy, automated process |
| Server downtime | Low | High | Medium | Built-in health checks (NestJS @Cron) + push/SMS alerts, Docker restart: always |
| Data breach | Low | Critical | High | Encryption, access control, Atlas security |
| GPS tracking failure | Medium | Medium | Medium | Dual tracking (phone + device), fallback to phone call |
| Regulatory issues | Medium | High | High | Consult transport lawyer before launch |
| Car breakdown during ride | Low | High | Medium | Roadside assistance tie-up, backup car |
| Razorpay account issues | Low | High | Medium | Keep docs current, backup payment method |
| MongoDB Atlas 512MB limit hit | Medium | Medium | Medium | Monitor usage, upgrade before limit |
| Google Maps API costs spike | Low | Medium | Low | Cache routes, use Leaflet for display |

## Detailed Risk Analysis

### 1. Technical Risks

**Solo Developer Bottleneck**
- Risk: You're the only one who can fix bugs, add features, handle deployments
- Impact: If sick/unavailable, entire platform stops
- Mitigation: Write clean code with documentation, Docker ensures anyone can deploy, keep architecture simple

**1-Month Timeline**
- Risk: Aggressive for solo developer with full booking + payment + tracking + notifications
- Impact: Incomplete MVP, buggy launch
- Mitigation: Cut non-essential features (ride extension, email, analytics, dark mode), launch with minimal viable features, iterate weekly

**Data Loss**
- Risk: MongoDB corruption, accidental deletion
- Impact: All booking/user data lost
- Mitigation: MongoDB Atlas automated backups (daily on M2+), manual weekly export on M0, S3 document backup

### 2. Market Risks

**Low Initial Demand**
- Risk: Build it but nobody comes
- Impact: No revenue, wasted effort
- Mitigation: Pre-validate with 10 known customers, start with 1 car (low commitment), word of mouth in Indore networks

**Competition from Ola/Uber**
- Risk: Users prefer known brands
- Impact: Hard to acquire customers
- Mitigation: Compete on reliability, personal service, no surge pricing, verified docs, multi-stop routes — things aggregators do poorly

**Price Sensitivity**
- Risk: Indore market very price-conscious
- Impact: Hard to maintain profitable pricing
- Mitigation: Transparent pricing (no hidden fees), compare favorably with local operators, offer round-trip discounts

### 3. Financial Risks

**Self-Funded Runway**
- Risk: Operating at loss for months before profitability
- Impact: Can't sustain business
- Mitigation: Infrastructure costs are near ₹0 (free tiers), main cost is driver salary + fuel — only incurred when rides booked

**Razorpay Fee Erosion**
- Risk: 2.36% per transaction eats into thin margins
- Impact: Reduced profitability
- Mitigation: Factor into pricing, negotiate at volume, explore direct UPI (future)

### 4. Legal/Regulatory Risks

**Aggregator License**
- Risk: Operating without proper license
- Impact: ₹25,000-1,00,000 fine, possible shutdown
- Mitigation: Operate as fleet owner (not aggregator) initially, consult transport lawyer, apply for license if required

**GST Non-Compliance**
- Risk: Not filing GST returns
- Impact: Penalties, interest
- Mitigation: Register GST from day 1, hire CA for quarterly filing

### 5. Operational Risks

**Driver Issues**
- Risk: Unreliable drivers, rude behavior, safety incidents
- Impact: Bad reviews, customer loss, legal liability
- Mitigation: Thorough background check, trial rides, customer ratings, insurance coverage

**Vehicle Issues**
- Risk: Breakdown during ride, expired documents
- Impact: Stranded passengers, legal issues
- Mitigation: Regular maintenance schedule, document expiry alerts in admin panel, roadside assistance plan

## Contingency Plans

| Scenario | Plan A | Plan B |
|----------|--------|--------|
| Server crashes | Docker auto-restart | Manual SSH fix within 30 min |
| Payment gateway down | Razorpay status page alert | Manual UPI transfer + offline recording |
| Driver unavailable | Call backup driver | Refund + reschedule |
| Car breakdown | Roadside assistance | Send another car (when multi-car) |
| MongoDB limit reached | Upgrade to M2 (₹750/mo) | Archive old data to S3 |
| EC2 free tier expires | Migrate to Oracle Cloud free | Continue EC2 at ₹700/mo |
