# Safar

**Your journey, your way.**

Intercity car rental booking platform with real-time GPS tracking, UPI payments, and multi-role management.

---

## Architecture

| Component | Stack | Port |
|-----------|-------|------|
| **Backend** | NestJS + MongoDB + Passport JWT + Swagger | 3000 |
| **Frontend** | Vite + React + TypeScript + Tailwind CSS | 5173 |
| **Database** | MongoDB Atlas | — |
| **Payments** | Razorpay (UPI only) | — |
| **Storage** | AWS S3 (presigned URLs) | — |
| **Email** | SMTP (Nodemailer) | — |

## Three Portals

| Portal | Type | Access |
|--------|------|--------|
| **Customer** (`/customer/*`) | PWA, mobile-first | Register, book rides, pay, track, rate |
| **Driver** (`/driver/*`) | PWA, mobile-first | Accept rides, navigate, update status, GPS |
| **Admin** (`/admin/*`) | Web, desktop-first | Dashboard, manage cars/drivers/users/bookings |

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env    # update MongoDB URI, Razorpay keys
npm install
npm run seed            # create admin + sample data
npm run start:dev       # http://localhost:3000
```

**Swagger Docs:** http://localhost:3000/api/docs

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

### Database Seed

The seed command **drops all collections** and re-creates everything with valid associations:

```bash
cd backend
npm run seed
```

This creates: 35+ users, 13 drivers, 30+ cars, 5 states, 27+ cities, 15 routes (linked by city/state IDs), 35+ bookings, payments, ratings, 30 documents, 40 notifications, and company settings.

### Seed Credentials
| Role | Phone | Password |
|------|-------|----------|
| Admin | 9999999999 | Admin@123 |
| Driver | 9876543210 | Driver@123 |
| Customer | 8765432109 | Customer@123 |

## API Groups

- **Customer APIs:** `/api/customer/*` — auth, profile, bookings, payments, ratings, routes, cars
- **Driver APIs:** `/api/driver/*` — auth, profile, rides, status, location, ratings
- **Admin APIs:** `/api/admin/*` — auth, dashboard, cars, drivers, users, bookings, payments, routes, settings

## Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run start:dev` | Development server with watch |
| `npm run build` | Production build |
| `npm run seed` | Seed database with sample data |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint + Prettier |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint + Prettier |
| `npm run format` | Prettier format |

## Tech Stack

- **Backend:** NestJS, Mongoose, Passport JWT, Swagger, Razorpay, AWS S3, Nodemailer
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons
- **Database:** MongoDB Atlas
- **Design:** Light theme, Inter font, blue (#2563EB) + amber (#F59E0B) palette

## Research & Docs

Comprehensive research documentation in `/research/` covering:
- Product identity, competitive analysis, target market
- User flows, MVP definition, architecture
- Database design, sequence diagrams, security
- Frontend UI/UX design system, component library, page layouts
- Implementation phases, PWA strategy

---

Built with care.
