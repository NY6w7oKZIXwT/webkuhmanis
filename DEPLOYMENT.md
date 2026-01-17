# Deployment Guide - Payment OTP System

Complete guide untuk deploy sistem Payment OTP ke production.

## Quick Deploy with Docker Compose

### Local Development
```bash
docker-compose up
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Deployment

#### 1. Create .env file (production)
```bash
cat > .env << EOF
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=webkuhmanis_prod
DB_USER=postgres
DB_PASSWORD=your_strong_password
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key_min_32_chars
OTP_EXPIRY_MINUTES=15
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
EOF
```

#### 2. Deploy to Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Init project
railway init

# Set variables
railway variables set DB_HOST=your-db
railway variables set JWT_SECRET=your-secret

# Deploy
railway up
```

#### 3. Deploy with Heroku
```bash
# Install Heroku CLI
npm i -g heroku

# Login & create app
heroku login
heroku create webkuhmanis

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set env vars
heroku config:set JWT_SECRET="your-secret"
heroku config:set OTP_EXPIRY_MINUTES=15

# Deploy
git push heroku main
```

#### 4. Manual VPS Deployment (Ubuntu)

**Prerequisites:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx (reverse proxy)
sudo apt install nginx

# Install PM2 (process manager)
sudo npm i -g pm2
```

**Setup Database:**
```bash
sudo -u postgres psql
CREATE DATABASE webkuhmanis;
CREATE USER postgres_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE webkuhmanis TO postgres_user;
\q
```

**Clone & Setup:**
```bash
git clone <your-repo> /var/www/webkuhmanis
cd /var/www/webkuhmanis

# Setup backend
cp backend/.env.example backend/.env
# Edit .env with database credentials

npm install
npm run migrate -w backend

# Setup frontend
npm run build -w frontend
```

**Start with PM2:**
```bash
cd /var/www/webkuhmanis/backend

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'webkuhmanis-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Setup Nginx:**
```bash
sudo nano /etc/nginx/sites-available/webkuhmanis
```

Paste:
```nginx
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/webkuhmanis/frontend/dist;
        index index.html;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable & restart:
```bash
sudo ln -s /etc/nginx/sites-available/webkuhmanis /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

**SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Deploy Frontend Only (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment
vercel env add VITE_API_URL https://api.yourdomain.com
```

---

## Deploy Backend Only (Render)

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create New > Web Service
4. Connect GitHub repo
5. Set:
   - Build: `npm install && npm run build -w backend && npm run migrate -w backend`
   - Start: `npm start -w backend`
6. Add environment variables
7. Deploy

---

## Deploy with AWS

### Option 1: Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Init
eb init -p node.js-20 webkuhmanis

# Create environment
eb create webkuhmanis-env

# Deploy
git push origin main
eb deploy
```

### Option 2: EC2 + RDS

1. Create EC2 instance (Ubuntu 22.04)
2. Create RDS PostgreSQL database
3. Follow VPS deployment steps above
4. Connect to RDS:
   ```bash
   DB_HOST=your-rds-endpoint.rds.amazonaws.com
   ```

---

## Database Migration to Production

### Backup current database:
```bash
pg_dump -h localhost -U postgres -d webkuhmanis > backup.sql
```

### Restore to production:
```bash
psql -h production-host -U postgres -d webkuhmanis < backup.sql
```

---

## Monitoring & Maintenance

### Health Check
```bash
curl http://localhost:5000/health
# Response: {"status":"ok","timestamp":"..."}
```

### View Logs
```bash
# PM2 logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/error.log
```

### Auto Backups
```bash
# Daily backup script
cat > /usr/local/bin/backup-db.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U postgres webkuhmanis | gzip > /backups/webkuhmanis_$DATE.sql.gz
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab
0 2 * * * /usr/local/bin/backup-db.sh
```

---

## Performance Optimization

### 1. Database Indexes
```sql
CREATE INDEX idx_payments_user ON manual_payments(user_id);
CREATE INDEX idx_payments_status ON manual_payments(status);
CREATE INDEX idx_payments_created ON manual_payments(created_at);
CREATE INDEX idx_otp_payment ON otp_attempts(payment_id);
```

### 2. Connection Pooling
Edit `backend/.env`:
```
# Add PgBouncer or use built-in connection pooling
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
```

### 3. Caching Headers
```bash
# In Nginx config
location ~* \.(js|css|png|jpg|jpeg|gif|ico|woff|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

---

## Security Checklist

- [ ] Change JWT_SECRET to random 32+ char string
- [ ] Change database password
- [ ] Enable HTTPS/SSL
- [ ] Setup firewall rules
- [ ] Enable database backups
- [ ] Setup monitoring/alerts
- [ ] Rotate JWT secret periodically
- [ ] Enable rate limiting on API
- [ ] Setup CORS for production domain only
- [ ] Enable HTTPS-only cookies
- [ ] Regular security updates

---

## Troubleshooting

### Port conflicts
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

### Database connection failed
```bash
psql -h localhost -U postgres -d webkuhmanis
# If fails, check PostgreSQL service
sudo systemctl restart postgresql
```

### High memory usage
```bash
# Check Node process
ps aux | grep node
# Restart PM2
pm2 restart all
```

### Frontend not loading
```bash
# Check Nginx config
sudo nginx -t
# Rebuild frontend
npm run build -w frontend
```

---

## Cost Estimation

| Service | Cost | Notes |
|---------|------|-------|
| Vercel (Frontend) | Free - $20/mo | Free tier sufficient |
| Railway (Backend) | $5 - $25/mo | Pay as you go |
| PostgreSQL DB | $7 - $50/mo | Managed hosting |
| **Total** | **~$12 - $75/mo** | Minimal setup |

---

Made with ❤️ | Support: support@webkuhmanis.local
