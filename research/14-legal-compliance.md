# Legal & Compliance

## Motor Vehicle Aggregator Guidelines (2020)

> **Critical**: If operating as a cab aggregator in India, these guidelines apply under Section 93 of Motor Vehicles (Amendment) Act, 2019.

### License Requirements
- Need aggregator license from State Transport Authority
- Valid for 5 years, renewable
- Application fee varies by state

### Driver Requirements
- Valid commercial driving license
- 5-day mandatory training before induction:
  - Motor Vehicles Act provisions
  - App usage training
  - Vehicle maintenance
  - Safe driving
  - First-responder training
  - Gender sensitization
- Health insurance: minimum ₹5 lakh
- Term life insurance: ₹10 lakh
- Driver must receive minimum 80% of fare

### Vehicle Requirements
- Permanently installed GPS device (mandatory)
- Valid registration as commercial vehicle
- Taxi meter (or app-based meter equivalent)
- Valid insurance, PUC, fitness certificate
- Commercial vehicle permit

### App Requirements
- Available in English + Hindi + state language
- Store data on India-based servers (minimum 3 months)
- Panic/SOS button
- Share ride details with emergency contacts
- Display driver photo, name, vehicle number before ride

### Non-Compliance Penalties
- ₹25,000 to ₹1,00,000 fine per violation
- License revocation possible

### Your Situation
Since starting with 1 car as personal company, you may operate as a **fleet operator** rather than an **aggregator**. Aggregator guidelines apply when you're a platform connecting riders with third-party drivers/vehicles. If all cars and drivers are yours → fleet operator rules apply (simpler compliance). **Consult a local transport lawyer in Indore.**

---

## Business Registration

### Options
| Type | Best For | Cost |
|------|----------|------|
| **Sole Proprietorship** | Starting out, 1 car | ₹0 (just PAN) |
| **LLP** | Small fleet, limited liability | ₹5,000-8,000 |
| **Private Limited** | Investment, scaling | ₹8,000-15,000 |

### Recommendation
Start as **Sole Proprietorship** (use personal PAN). Register as LLP when adding 3+ cars. Pvt Ltd when seeking investment.

---

## GST Registration

### When Required
- Mandatory if annual turnover > ₹20 lakh (services)
- Recommended from day 1 for:
  - Razorpay merchant account
  - Professional invoicing
  - Input tax credit on expenses

### GST Rates
- **Cab services**: 5% GST (no input tax credit) OR 12% GST (with ITC)
- **App-based transportation**: 5% on entire fare
- GST registration cost: ₹0 (free on GST portal)

### Invoicing
- Generate GST invoice for each ride
- Include: GSTIN, SAC code (996412 - Taxi services), booking details
- Digital invoice via email/SMS sufficient

---

## DPDPA 2023 (Digital Personal Data Protection Act)

### Applicability
Applies to your app since you collect personal data (phone, name, location, payment info).

### Requirements
1. **Notice & Consent**: Inform users what data you collect and why
2. **Purpose Limitation**: Use data only for stated purposes
3. **Data Minimization**: Collect only what's needed
4. **Storage Limitation**: Don't keep data longer than necessary
5. **Right to Erasure**: Users can request data deletion
6. **Data Breach Notification**: Report breaches to Data Protection Board
7. **Children's Data**: If serving under-18, need verifiable parental consent

### Implementation
- Privacy Policy page (mandatory)
- Terms of Service page (mandatory)
- Consent checkbox at registration
- Data deletion request flow in profile settings
- Encrypt PII (Aadhaar, phone in database)
- Data stored in India (MongoDB Atlas Mumbai region)

---

## Required Documents/Pages

### 1. Terms of Service
Must cover:
- Booking terms (advance booking, minimum notice)
- Payment terms (UPI only, no cash)
- Cancellation and refund policy
- Liability limitations
- Dispute resolution
- Account termination conditions

### 2. Privacy Policy
Must cover:
- Data collected (name, phone, email, location, payment)
- Purpose of collection
- Data sharing (Razorpay, Google Maps, MSG91)
- Data retention period
- User rights (access, correction, deletion)
- Cookie policy
- Contact information for data queries

### 3. Refund Policy
- Clearly state conditions for full/partial/no refund
- Refund timeline (5-7 business days for UPI)
- Process for filing refund claims
- Admin discretion clause

### 4. Cancellation Policy
- Per-route configurable from admin
- Default: Full refund >24h, 50% refund 12-24h, No refund <12h
- Driver cancellation: always full refund

---

## Tax Compliance

### Income Tax
- File ITR as per business type
- Maintain books of accounts
- TDS on driver payments if applicable

### GST Filing
- GSTR-1 (sales): Monthly/Quarterly
- GSTR-3B (summary): Monthly
- GSTR-9 (annual return)

---

## Insurance Requirements
- Commercial vehicle insurance (mandatory)
- Driver health insurance: ₹5 lakh (if following aggregator guidelines)
- Driver term insurance: ₹10 lakh
- Public liability insurance (recommended)
- Cyber insurance (future consideration)

---

## Compliance Checklist for MVP Launch

- [ ] Sole proprietorship with PAN
- [ ] GST registration (recommended)
- [ ] Commercial vehicle permit for car
- [ ] Valid insurance + PUC + fitness certificate
- [ ] Driver's commercial driving license
- [ ] Privacy Policy page on website
- [ ] Terms of Service page on website
- [ ] Refund/Cancellation Policy page
- [ ] DLT registration for SMS (MSG91)
- [ ] Razorpay KYC completed
- [ ] Data stored in India (MongoDB Atlas Mumbai)
- [ ] Consult transport lawyer re: aggregator vs fleet operator
