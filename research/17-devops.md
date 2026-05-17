# DevOps & CI/CD

## Docker Setup

### Dockerfile (React App — Static Build)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4000
CMD ["nginx", "-g", "daemon off;"]
```

### Dockerfile (NestJS API)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
USER nestjs
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - app
      - ws-server
    restart: always

  react-app:
    build:
      context: ./react-app
      dockerfile: Dockerfile
    expose:
      - "4000"
    restart: always

  nestjs-api:
    build:
      context: ./nestjs-api
      dockerfile: Dockerfile
    env_file: .env.production
    expose:
      - "3000"
    depends_on:
      - redis
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    restart: always

volumes:
  redis-data:
```

### Nginx Config
```nginx
upstream nestjs {
    server nestjs-api:3000;
}

upstream reactapp {
    server react-app:4000;
}

server {
    listen 80;
    server_name yourdomain.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.in;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header Strict-Transport-Security "max-age=31536000";

    # Gzip
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    location / {
        proxy_pass http://reactapp;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://nestjs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://nestjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # Static assets cached aggressively
    location /assets {
        proxy_pass http://reactapp;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

## CI/CD Pipeline (GitHub Actions)

### .github/workflows/deploy.yml
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: app/package-lock.json

      - name: Install & Lint (React)
        working-directory: ./react-app
        run: |
          npm ci
          npm run lint
          npm run type-check

      - name: Install & Lint (NestJS)
        working-directory: ./nestjs-api
        run: |
          npm ci
          npm run lint

      - name: Build Docker images
        run: |
          docker compose -f docker-compose.prod.yml build

      - name: Push to Docker Hub
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker compose -f docker-compose.prod.yml push

      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/cab-booking-app
            git pull origin main
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d
            docker system prune -f
```

### .github/workflows/ci.yml (PR checks)
```yaml
name: CI

on:
  pull_request:
    branches: [main, dev]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: app/package-lock.json
      - run: cd react-app && npm ci
      - run: cd react-app && npm run lint
      - run: cd react-app && npm run build
      - run: cd nestjs-api && npm ci
      - run: cd nestjs-api && npm run lint
      - run: cd nestjs-api && npm run build
```

## Deployment Strategy

### Blue-Green (Simple Version)
1. Pull new images
2. Start new containers
3. Health check passes → switch Nginx upstream
4. Stop old containers

For MVP, simpler approach: just `docker compose up -d` (rolling restart).

### Rollback
```bash
# Tag current working version before deploy
docker tag app:latest app:previous

# If deploy fails
docker compose down
docker tag app:previous app:latest
docker compose up -d
```

## Environment Management

| Env | Purpose | Database | Razorpay |
|-----|---------|----------|----------|
| **local** | Development | MongoDB local or Atlas M0 dev | Test mode |
| **staging** | Pre-production testing | Atlas M0 (separate DB) | Test mode |
| **production** | Live | Atlas M0/M2 (prod DB) | Live mode |

## EC2 Setup Script

```bash
#!/bin/bash
# Run on fresh EC2 Ubuntu instance

# Update
sudo apt update && sudo apt upgrade -y

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Docker Compose
sudo apt install docker-compose-plugin -y

# Swap (important for t2.micro with 1GB RAM)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab

# Clone repo
git clone https://github.com/yourusername/cab-booking-app.git
cd cab-booking-app

# Create .env.production
cp .env.example .env.production
# Edit with actual values

# Start
docker compose -f docker-compose.prod.yml up -d
```

## Monitoring Setup

### Health Check Endpoint
```typescript
// nestjs-api/src/monitoring/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get()
  async check() {
    return {
      status: this.connection.readyState === 1 ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date(),
      services: {
        mongodb: this.connection.readyState === 1,
      },
    };
  }
}
```

### Log Management
- Docker logs: `docker compose logs -f nestjs-api`
- Persist logs: Docker logging driver → file or CloudWatch
- Built-in error tracking: NestJS GlobalExceptionFilter → MongoDB error_logs → admin panel
- Built-in health checks: NestJS @Cron every 5 min → push/SMS alert on failure
- Built-in analytics: event tracking → MongoDB analytics_events → admin dashboard
- Nginx access/error logs in volume
