# Project Flow & Architecture Diagrams

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        U[User PWA]
        D[Driver PWA]
        A[Admin Panel]
    end

    subgraph "CDN / Edge"
        CF[Cloudflare DNS + CDN]
    end

    subgraph "Application Layer"
        NX[Nginx Reverse Proxy<br/>SSL Termination]
        REACT[React App<br/>Static Files<br/>Port 4000]
        NEST[NestJS Server<br/>API + WebSocket + Jobs<br/>Port 3000]
        TC[Traccar Server<br/>GPS Processing<br/>Port 8082]
    end

    subgraph "Data Layer"
        MONGO[(MongoDB Atlas<br/>Primary Database)]
        REDIS[(Redis<br/>Job Queue + Cache)]
        S3[(AWS S3<br/>Files + Images)]
    end

    subgraph "External Services"
        RZP[Razorpay<br/>Payments]
        GMAP[Google Maps<br/>Routes + Distance]
        FCM[Firebase FCM<br/>Push Notifications]
        MSG[MSG91<br/>SMS]
        RSN[Resend<br/>Email]
    end

    subgraph "Built-In Monitoring"
        ERR[Error Tracking<br/>NestJS ExceptionFilter]
        HLT[Health Checks<br/>NestJS @Cron]
        ANL[Analytics<br/>Event Tracking]
    end

    U --> CF
    D --> CF
    A --> CF
    CF --> NX
    NX --> REACT
    NX --> NEST
    NEST --> MONGO
    NEST --> REDIS
    NEST --> S3
    NEST --> RZP
    NEST --> GMAP
    NEST --> FCM
    NEST --> MSG
    NEST --> RSN
    TC --> NEST
    ERR --> MONGO
    HLT --> MONGO
    ANL --> MONGO
```

## Docker Compose Architecture

```mermaid
graph TB
    subgraph "Docker Host (EC2)"
        subgraph "docker-compose.yml"
            N[nginx:alpine<br/>Port 80, 443]
            FE[react-app<br/>Nginx static<br/>Port 4000]
            BE[nestjs-api<br/>API + WS + Jobs<br/>Port 3000]
            RD[redis:alpine<br/>Port 6379]
            TR[traccar<br/>Port 8082, 5000-5100]
        end
        VOL[(Volumes<br/>- nginx-conf<br/>- ssl-certs<br/>- traccar-data<br/>- redis-data)]
    end

    EXT[(External<br/>MongoDB Atlas<br/>AWS S3)]

    N -->|/| FE
    N -->|/api, /ws| BE
    BE --> RD
    BE --> EXT
    TR --> BE
    N --> VOL
    TR --> VOL
```

## Data Flow Diagram

```mermaid
flowchart LR
    subgraph Input
        UB[User Booking]
        DP[Driver Phone GPS]
        GP[Car GPS Device]
        UP[UPI Payment]
    end

    subgraph "NestJS Processing"
        BK[Booking Engine]
        PE[Price Calculator]
        LT[Location Tracker<br/>+ Fusion Service]
        PG[Payment Gateway]
        NE[Notification Engine<br/>BullMQ Workers]
    end

    subgraph Storage
        DB[(MongoDB)]
        FS[(S3 Files)]
        CH[(Redis Cache)]
    end

    subgraph Output
        PN[Push Notification]
        SM[SMS]
        EM[Email]
        MP[Map Display]
        RC[Receipt]
    end

    UB --> BK
    BK --> PE
    PE --> PG
    PG --> UP
    UP --> PG
    PG --> BK
    BK --> NE
    BK --> DB
    NE --> PN
    NE --> SM
    NE --> EM
    DP --> LT
    GP --> LT
    LT --> DB
    LT --> MP
    LT --> CH
    PG --> RC
```

## CI/CD Pipeline Flow

```mermaid
flowchart LR
    DEV[Developer<br/>Push to GitHub] --> GH[GitHub Actions]
    GH --> LINT[Lint + Type Check<br/>React + NestJS]
    LINT --> TEST[Run Tests<br/>Jest]
    TEST --> BUILD[Docker Build<br/>react-app + nestjs-api]
    BUILD --> PUSH[Push to<br/>Docker Hub / ECR]
    PUSH --> DEPLOY[SSH to EC2<br/>docker-compose pull<br/>docker-compose up -d]
    DEPLOY --> HEALTH[Health Check<br/>/api/health]
    HEALTH --> DONE[Done]

    HEALTH -- Fail --> ROLL[Rollback to<br/>previous image]
```

## Network Topology

```mermaid
graph TB
    subgraph "Internet"
        USR[Users]
        DRV[Drivers]
        ADM[Admin]
    end

    subgraph "Cloudflare"
        DNS[DNS + CDN]
        WAF[WAF Protection]
    end

    subgraph "AWS VPC"
        subgraph "Public Subnet"
            EC2[EC2 Instance<br/>t2.micro / t3.micro<br/>Elastic IP]
        end
    end

    subgraph "Managed Services"
        MA[MongoDB Atlas<br/>IP Whitelisted]
        S3[S3 Bucket<br/>Private + Presigned URLs]
    end

    USR --> DNS
    DRV --> DNS
    ADM --> DNS
    DNS --> WAF
    WAF --> EC2
    EC2 --> MA
    EC2 --> S3
```

## Folder Structure

```
cab-booking-app/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── nginx/
│   ├── nginx.conf
│   └── ssl/
│
├── react-app/                       # React + Vite Frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── router.tsx               # React Router v7
│   │   ├── pages/
│   │   │   ├── public/              # Landing, Login, Register
│   │   │   ├── user/                # Dashboard, BookRide, Bookings, Tracking
│   │   │   ├── driver/              # DriverDashboard, RideDetail, Navigation
│   │   │   └── admin/               # Dashboard, Cars, Drivers, Users, Settings
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── booking/
│   │   │   ├── maps/
│   │   │   ├── admin/
│   │   │   └── layout/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   ├── api.ts               # Axios (withCredentials: true)
│   │   │   ├── socket.ts            # Socket.io client
│   │   │   └── analytics.ts         # Event tracker
│   │   ├── store/                   # Redux Toolkit + Saga
│   │   │   ├── store.ts
│   │   │   ├── rootSaga.ts
│   │   │   ├── slices/              # auth, booking, cars, tracking, ui...
│   │   │   └── sagas/               # auth, booking, payment, tracking...
│   │   └── types/
│   └── tsconfig.json
│
├── nestjs-api/                      # NestJS Backend (ALL server logic)
│   ├── Dockerfile
│   ├── package.json
│   ├── nest-cli.json
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── auth/                    # Cookie sessions, OTP, guards
│   │   ├── users/
│   │   ├── cars/
│   │   ├── drivers/
│   │   ├── bookings/
│   │   ├── payments/                # Razorpay + webhooks
│   │   ├── tracking/                # WebSocket gateway + Traccar + fusion
│   │   ├── notifications/           # FCM, MSG91, Resend + BullMQ workers
│   │   ├── ratings/
│   │   ├── upload/                  # S3 presigned URLs
│   │   ├── admin/                   # Dashboard stats, settings
│   │   ├── monitoring/              # Error logs, health checks, analytics
│   │   └── common/                  # Guards, filters, interceptors, pipes
│   └── tsconfig.json
│
└── traccar/                         # GPS Tracker Server
    └── traccar.xml
```
