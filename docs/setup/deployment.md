# Deployment Guide

## Overview
This guide covers deploying NegotiationMaster to production environments including cloud platforms, Docker containers, and traditional servers.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Redis (for session storage and caching)
- SSL certificate for HTTPS
- Domain name and DNS configuration

## Environment Setup

### Environment Variables

Create a `.env` file in the backend directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/negotiation_master
DB_HOST=localhost
DB_PORT=5432
DB_NAME=negotiation_master
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-256-bits-minimum
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-256-bits-minimum
JWT_EXPIRE_TIME=15m
JWT_REFRESH_EXPIRE_TIME=7d

# Server Configuration
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ElevenLabs Integration (optional)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Docker Deployment

### Docker Compose Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: negotiation_master
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./frontend/build:/usr/share/nginx/html
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Production Dockerfile

```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS backend-build

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ .

FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S negotiation -u 1001

WORKDIR /app

COPY --from=backend-build --chown=negotiation:nodejs /app/backend ./backend
COPY --from=frontend-build --chown=negotiation:nodejs /app/frontend/build ./frontend/build

USER negotiation

EXPOSE 5000

WORKDIR /app/backend
CMD ["node", "src/server.js"]
```

## Cloud Platform Deployment

### AWS EC2 Deployment

1. **Launch EC2 Instance:**
   ```bash
   # Ubuntu 22.04 LTS
   # t3.medium or larger
   # Security groups: 22 (SSH), 80 (HTTP), 443 (HTTPS)
   ```

2. **Install Dependencies:**
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm postgresql postgresql-contrib redis-server nginx
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

3. **Setup Application:**
   ```bash
   git clone https://github.com/yourusername/NegotiationMaster.git
   cd NegotiationMaster
   
   # Backend setup
   cd backend
   npm install
   npm run migrate
   npm run seed
   
   # Frontend setup
   cd ../frontend
   npm install
   npm run build
   ```

4. **Configure PM2:**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'negotiation-master',
       script: 'src/server.js',
       cwd: './backend',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   }
   ```

5. **Start Application:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Heroku Deployment

1. **Prepare for Heroku:**
   ```bash
   # Create Procfile
   echo "web: cd backend && node src/server.js" > Procfile
   
   # Create package.json in root
   cat > package.json << EOF
   {
     "name": "negotiation-master",
     "version": "1.0.0",
     "scripts": {
       "build": "cd frontend && npm install && npm run build",
       "start": "cd backend && node src/server.js",
       "heroku-postbuild": "npm run build"
     }
   }
   EOF
   ```

2. **Deploy to Heroku:**
   ```bash
   heroku create negotiation-master
   heroku addons:create heroku-postgresql:hobby-dev
   heroku addons:create heroku-redis:hobby-dev
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   
   git push heroku main
   ```

## Database Migration & Backup

### Production Migration
```bash
# Run migrations
cd backend
npm run migrate

# Seed with production data
npm run seed:production
```

### Automated Backup Script
```bash
#!/bin/bash
# scripts/backup-db.sh

BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump $DATABASE_URL > $BACKUP_DIR/negotiation_master_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR s3://your-backup-bucket/database/ --recursive

# Cleanup old backups (keep 30 days)
find /backup -type d -mtime +30 -exec rm -rf {} \;
```

## SSL/HTTPS Configuration

### Nginx Configuration
```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://app:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://app:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Monitoring & Health Checks

### Health Check Endpoint
```javascript
// Add to backend routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  })
})
```

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart negotiation-master
```

## Security Checklist

- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Regular security updates
- [ ] Log monitoring setup
- [ ] Backup system tested
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## Performance Optimization

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_negotiations_user_id ON negotiations(user_id);
CREATE INDEX idx_messages_negotiation_id ON messages(negotiation_id);
```

### Redis Caching
```javascript
// Cache frequently accessed data
const redis = require('redis')
const client = redis.createClient(process.env.REDIS_URL)

// Cache scenarios
app.get('/api/scenarios', async (req, res) => {
  const cached = await client.get('scenarios')
  if (cached) {
    return res.json(JSON.parse(cached))
  }
  
  const scenarios = await db('scenarios').select('*')
  await client.setex('scenarios', 3600, JSON.stringify(scenarios))
  res.json(scenarios)
})
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues:**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check connection
   psql $DATABASE_URL -c "SELECT version();"
   ```

2. **Application Won't Start:**
   ```bash
   # Check logs
   pm2 logs negotiation-master
   
   # Check port availability
   netstat -tlnp | grep :5000
   ```

3. **High Memory Usage:**
   ```bash
   # Monitor memory
   pm2 monit
   
   # Restart if needed
   pm2 restart negotiation-master
   ```

For additional support, check the [troubleshooting guide](../troubleshooting.md) or create an issue on GitHub.