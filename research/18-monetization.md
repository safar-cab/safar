# Monetization Strategy

## Primary Revenue Model: Fixed Fare Per Ride

User pays company directly via UPI. Company pays driver fixed salary. Profit = fare collected - (driver salary + fuel + maintenance + platform costs).

### Pricing Structure (Admin Configurable)

| Component | Description | Example |
|-----------|-------------|---------|
| **Base Fare** | Flat fee per booking | ₹200 |
| **Per KM Rate** | Admin sets rate per km | ₹12/km |
| **Toll Charges** | Estimated or actual | ₹150 |
| **Night Charges** | Optional surcharge (10pm-6am) | ₹200 flat |
| **Driver Allowance** | For outstation (food/stay) | ₹300/day |
| **GST** | 5% on total fare | Calculated |

### Example Pricing (Indore → Bhopal, 195 km)

| Component | Amount |
|-----------|--------|
| Base fare | ₹200 |
| Distance (195 × ₹12) | ₹2,340 |
| Toll estimate | ₹150 |
| **Subtotal** | **₹2,690** |
| GST (5%) | ₹135 |
| **Total** | **₹2,825** |

### Revenue Per Ride Analysis

| Item | Amount |
|------|--------|
| Fare collected | ₹2,825 |
| Minus: Fuel (~8km/l × ₹105/l for 390km round trip) | -₹5,118 |
| Minus: Driver salary (daily, ₹500-800) | -₹700 |
| Minus: Razorpay fee (2.36%) | -₹67 |
| Minus: Vehicle wear/maintenance | -₹200 |
| **Net per round trip** | **-₹3,260** |

> **Reality check**: Single one-way trip at ₹12/km is unprofitable for 195km. Need to charge **₹15-18/km** OR ensure return passenger OR charge round-trip fare for one-way.

### Recommended Pricing Strategy
- **One-way (short, <100km)**: ₹15-18/km + base fare
- **Round trip**: ₹12-14/km (both ways included)
- **Multi-day**: Day package rates
- **Airport transfers**: Fixed rate per zone

---

## Revenue Projections

### Year 1 (1 car, conservative)

| Month | Rides | Avg Fare | Revenue | Expenses | Profit |
|-------|-------|----------|---------|----------|--------|
| 1-3 | 8/mo | ₹3,000 | ₹24,000 | ₹20,000 | ₹4,000 |
| 4-6 | 12/mo | ₹3,500 | ₹42,000 | ₹28,000 | ₹14,000 |
| 7-12 | 15/mo | ₹3,500 | ₹52,500 | ₹32,000 | ₹20,500 |

**Year 1 total**: ~₹4-5 lakh revenue, ~₹1.5-2 lakh profit

### Year 2 (3-5 cars)

| Metric | Amount |
|--------|--------|
| Fleet size | 5 cars |
| Rides/car/month | 15 |
| Total rides/month | 75 |
| Revenue/month | ₹2.6 lakh |
| Expenses/month | ₹1.8 lakh |
| Profit/month | ₹80,000 |
| **Annual profit** | **₹9-10 lakh** |

---

## Secondary Revenue Streams (Future)

### 1. White-Label Licensing
- Sell Dockerized app to other cab companies
- Pricing: ₹50,000-1,00,000 one-time + ₹5,000/month support
- Target: Small fleet operators across India

### 2. Corporate Accounts
- Monthly billing for companies
- Discounted rates for volume
- Invoice-based payment (not UPI per ride)

### 3. Airport Transfer Partnerships
- Fixed-rate airport packages
- Hotel tie-ups for guest transfers

### 4. Tour Packages
- Multi-day tour packages (Indore → Ujjain → Omkareshwar → back)
- Premium pricing for curated routes

---

## Cost of Customer Acquisition

### Phase 1 (Organic, ₹0 budget)
- Google Maps listing: Free
- JustDial listing: Free
- WhatsApp Business: Free
- Word of mouth: First 10 customers
- Estimated CAC: ₹0

### Phase 2 (Paid, ₹2,000-5,000/month)
- Google Ads (local): ₹2,000/month
- Social media (Instagram/Facebook): ₹2,000/month
- Referral discount (₹100 off next ride): ₹1,000/month
- Estimated CAC: ₹200-500 per customer

---

## Break-Even Analysis

### Fixed Monthly Costs (1 car)
| Item | Cost |
|------|------|
| Driver salary | ₹15,000 |
| Car EMI/depreciation | ₹8,000 |
| Insurance (monthly) | ₹1,500 |
| Fuel (average) | ₹10,000 |
| Platform costs (hosting etc.) | ₹500 |
| Phone/data | ₹500 |
| **Total fixed** | **₹35,500** |

### Break-Even Rides
At ₹3,500 average fare with 60% margin after variable costs:
- Revenue per ride (net): ₹2,100
- Break-even: **17 rides/month**
- Target: 20+ rides/month for profitability
