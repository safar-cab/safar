# Cost Management

## Monthly Infrastructure Costs

### Scenario A: Maximum Free Tier (₹0-500/month)

| Service | Tier | Cost |
|---------|------|------|
| AWS EC2 | t2.micro (12 months free) | ₹0 |
| MongoDB Atlas | M0 (512MB, forever free) | ₹0 |
| AWS S3 | 5GB free tier | ₹0 |
| React static (Nginx in Docker) | Served from EC2 | ₹0 |
| GitHub Actions | 2000 min/month | ₹0 |
| Firebase FCM | Unlimited push | ₹0 |
| Resend | 100 emails/day | ₹0 |
| Error Tracking | Built-in (MongoDB) | ₹0 |
| Uptime Monitoring | Built-in (NestJS cron) | ₹0 |
| Analytics | Built-in (MongoDB) | ₹0 |
| Cloudflare | Free plan (DNS + CDN) | ₹0 |
| Domain (.in) | BigRock | ₹99/year (~₹8/month) |
| MSG91 SMS | ~50 SMS/month × ₹0.25 | ₹12/month |
| Google Maps | Free tier (sufficient for MVP) | ₹0 |
| **Total** | | **~₹20/month** |

> **Note**: AWS free tier expires after 12 months. All monitoring/analytics built-in — no external costs.

### Scenario B: Budget ₹1,000-2,000/month

| Service | Tier | Cost |
|---------|------|------|
| AWS EC2 | t3.micro (post free tier) | ₹700/month |
| MongoDB Atlas | M0 free (upgrade when needed) | ₹0 |
| AWS S3 | Pay as you go | ₹50/month |
| Domain (.in) | | ₹15/month |
| MSG91 SMS | ~200 SMS/month | ₹50/month |
| Google Maps | Pay per use (overflow) | ₹200/month |
| Razorpay | 2.36% per transaction | Variable |
| Firebase FCM | Free | ₹0 |
| Resend | Free tier | ₹0 |
| Cloudflare | Free | ₹0 |
| **Total** | | **₹1,000-1,500/month** |

### Scenario C: Growth ₹3,000-5,000/month

| Service | Tier | Cost |
|---------|------|------|
| AWS EC2 | t3.small (2GB RAM) | ₹1,400/month |
| MongoDB Atlas | M2 (2GB storage) | ₹750/month |
| AWS S3 | 50GB + CloudFront | ₹300/month |
| Redis (ElastiCache) | t3.micro | ₹800/month |
| Domain | .in + .com | ₹100/month |
| MSG91 SMS | ~1000 SMS/month | ₹250/month |
| Google Maps | Increased usage | ₹500/month |
| Resend Pro | 50K emails | ₹1,700/month |
| Error/Analytics (built-in) | MongoDB storage | ₹0 |
| **Total** | | **₹4,000-8,000/month** |

## One-Time Costs

| Item | Cost | When |
|------|------|------|
| Domain registration (.in, 1 year) | ₹99-199 | Day 1 |
| GPS tracker device | ₹2,000-5,000 | Month 2 |
| GST registration | ₹0 (free) | Month 1 |
| DLT SMS registration | ₹0 (free) | Week 1 |
| Google Maps billing account | ₹0 (credit card required) | Week 2 |
| Razorpay merchant KYC | ₹0 | Week 2 |

## Free Tier Maximization Strategy

### Year 1 Plan
1. **Months 1-12**: AWS EC2 free tier + MongoDB Atlas M0 + all free tiers
2. **Platform cost**: ~₹20-100/month (just domain + SMS)
3. **Total Year 1**: ~₹1,200-2,400

### Post Year 1 (AWS free tier expires)
Options:
- **Oracle Cloud Always Free**: 2 AMD instances (1/8 OCPU, 1GB RAM each) — forever free
- **Continue EC2 t3.micro**: ~₹700/month
- **Railway.app**: Free hobby plan (limited hours)
- **Fly.io**: 3 shared VMs free

### Cost Optimization Tips
1. Use MongoDB Atlas M0 as long as possible (512MB holds ~50K bookings)
2. Compress S3 images before upload (sharp library)
3. Use Cloudflare CDN (cache static assets, reduce S3 bandwidth)
4. Google Maps: Use Leaflet for display-only maps, Google only for directions/distance
5. Batch notifications (reduce SMS count)
6. Use FCM push over SMS where possible (push is free)
7. Cache Google Maps API responses (routes don't change often)

## Razorpay Transaction Costs

| Monthly Bookings | Avg Fare | Total Volume | Razorpay Fee (2.36%) |
|-----------------|----------|-------------|---------------------|
| 10 | ₹3,000 | ₹30,000 | ₹708 |
| 50 | ₹3,000 | ₹1,50,000 | ₹3,540 |
| 100 | ₹3,000 | ₹3,00,000 | ₹7,080 |
| 500 | ₹3,000 | ₹15,00,000 | ₹35,400 |

> At scale, negotiate custom Razorpay pricing (possible at ₹10L+/month volume).

## Total Cost of Ownership (Year 1)

| Category | Annual Cost |
|----------|------------|
| Infrastructure (free tiers) | ₹1,200 |
| Domain | ₹199 |
| SMS (~100/month) | ₹3,000 |
| Google Maps (overflow) | ₹2,000 |
| Razorpay fees (100 bookings) | ₹8,500 |
| GPS device (1 unit) | ₹3,000 |
| **Total Year 1** | **~₹18,000 (~₹1,500/month)** |

This is extremely lean for a full production app.
