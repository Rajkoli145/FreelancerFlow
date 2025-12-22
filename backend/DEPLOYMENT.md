# FreelancerFlow Deployment Guide

This guide covers deploying the FreelancerFlow backend to production environments.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Deployment Options](#deployment-options)
  - [Heroku](#heroku)
  - [Railway](#railway)
  - [AWS EC2](#aws-ec2)
  - [DigitalOcean](#digitalocean)
  - [Docker](#docker)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

## Pre-Deployment Checklist

### Security

- [ ] Generate strong JWT secret (64+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set up proper CORS origins
- [ ] Review and adjust rate limits
- [ ] Disable Swagger in production (`ENABLE_SWAGGER=false`)
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie settings

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] Code coverage >= 70%
- [ ] No security vulnerabilities (`npm audit`)
- [ ] ESLint passing (`npm run lint`)
- [ ] Remove all console.logs (except logger)
- [ ] Update dependencies to latest stable versions

### Configuration

- [ ] Set all required environment variables
- [ ] Configure email service (if applicable)
- [ ] Set up file storage (AWS S3, Cloudinary)
- [ ] Configure logging service
- [ ] Set up error tracking (Sentry, Rollbar)

## Environment Setup

### Required Environment Variables

\`\`\`env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/freelancerflow?retryWrites=true&w=majority

# Authentication
JWT_SECRET=<64-character-random-string>
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Frontend
FRONTEND_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Security
BCRYPT_ROUNDS=12

# Features
ENABLE_SWAGGER=false

# Logging
LOG_LEVEL=info
\`\`\`

### Generate Secure Secrets

\`\`\`bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
\`\`\`

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create Cluster**
   - Choose cloud provider (AWS, GCP, Azure)
   - Select region closest to your users
   - Choose M0 (free) or paid tier

3. **Configure Security**
   - Database Access: Create database user
   - Network Access: Add IP whitelist (0.0.0.0/0 for all IPs or specific IPs)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

### Self-Hosted MongoDB

\`\`\`bash
# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable on boot
sudo systemctl enable mongod

# Create database and user
mongo
> use freelancerflow
> db.createUser({
    user: "freelancer_user",
    pwd: "strong_password",
    roles: [{ role: "readWrite", db: "freelancerflow" }]
  })
\`\`\`

## Deployment Options

### Heroku

#### 1. Install Heroku CLI

\`\`\`bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh
\`\`\`

#### 2. Login and Create App

\`\`\`bash
heroku login
heroku create freelancerflow-api
\`\`\`

#### 3. Set Environment Variables

\`\`\`bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set FRONTEND_URL="https://your-frontend.com"
heroku config:set ENABLE_SWAGGER=false
\`\`\`

#### 4. Deploy

\`\`\`bash
# From backend directory
git init
git add .
git commit -m "Initial commit"
git push heroku main
\`\`\`

#### 5. Scale Dynos

\`\`\`bash
heroku ps:scale web=1
\`\`\`

### Railway

#### 1. Install Railway CLI

\`\`\`bash
npm install -g @railway/cli
\`\`\`

#### 2. Login and Initialize

\`\`\`bash
railway login
railway init
\`\`\`

#### 3. Add Environment Variables

\`\`\`bash
railway variables set NODE_ENV=production
railway variables set MONGO_URI="your_mongodb_uri"
railway variables set JWT_SECRET="your_jwt_secret"
\`\`\`

#### 4. Deploy

\`\`\`bash
railway up
\`\`\`

### AWS EC2

#### 1. Launch EC2 Instance

- Choose Ubuntu Server 22.04 LTS
- Instance type: t2.micro (free tier) or larger
- Configure security group:
  - SSH (22) from your IP
  - HTTP (80) from anywhere
  - HTTPS (443) from anywhere
  - Custom TCP (5000) from anywhere (or use nginx)

#### 2. Connect to Instance

\`\`\`bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
\`\`\`

#### 3. Install Dependencies

\`\`\`bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install nginx
sudo apt install -y nginx
\`\`\`

#### 4. Clone and Setup Application

\`\`\`bash
# Clone repository
git clone https://github.com/Rajkoli145/FreelancerFlow.git
cd FreelancerFlow/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add your environment variables
\`\`\`

#### 5. Start with PM2

\`\`\`bash
# Start application
pm2 start src/index.js --name freelancerflow

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs
\`\`\`

#### 6. Configure Nginx

\`\`\`bash
sudo nano /etc/nginx/sites-available/freelancerflow
\`\`\`

Add configuration:

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
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
\`\`\`

Enable site:

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/freelancerflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

#### 7. Setup SSL with Let's Encrypt

\`\`\`bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
\`\`\`

### DigitalOcean

Similar to AWS EC2, but use DigitalOcean's one-click Node.js droplet:

1. Create Droplet with Node.js
2. Follow steps 2-7 from AWS EC2 section

### Docker

#### 1. Create Dockerfile

\`\`\`dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/index.js"]
\`\`\`

#### 2. Create .dockerignore

\`\`\`
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
logs
coverage
\`\`\`

#### 3. Build and Run

\`\`\`bash
# Build image
docker build -t freelancerflow-backend .

# Run container
docker run -d \
  --name freelancerflow \
  -p 5000:5000 \
  --env-file .env \
  freelancerflow-backend
\`\`\`

#### 4. Docker Compose

Create `docker-compose.yml`:

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/freelancerflow
    env_file:
      - .env
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
\`\`\`

Run:

\`\`\`bash
docker-compose up -d
\`\`\`

## Post-Deployment

### 1. Verify Deployment

\`\`\`bash
# Check health endpoint
curl https://your-api-domain.com/health

# Expected response:
# {"success":true,"status":"healthy","environment":"production",...}
\`\`\`

### 2. Test API Endpoints

\`\`\`bash
# Test signup
curl -X POST https://your-api-domain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"password123"}'
\`\`\`

### 3. Monitor Logs

\`\`\`bash
# Heroku
heroku logs --tail

# PM2
pm2 logs freelancerflow

# Docker
docker logs -f freelancerflow
\`\`\`

## Monitoring & Maintenance

### Set Up Monitoring

1. **Application Performance Monitoring (APM)**
   - New Relic
   - DataDog
   - AppDynamics

2. **Error Tracking**
   - Sentry
   - Rollbar
   - Bugsnag

3. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

### Regular Maintenance

- **Daily**: Check error logs
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit

### Backup Strategy

\`\`\`bash
# MongoDB backup
mongodump --uri="your_mongodb_uri" --out=/backup/$(date +%Y%m%d)

# Automated daily backups (cron)
0 2 * * * /usr/bin/mongodump --uri="your_mongodb_uri" --out=/backup/$(date +\%Y\%m\%d)
\`\`\`

### Scaling

#### Horizontal Scaling

\`\`\`bash
# Heroku
heroku ps:scale web=3

# PM2
pm2 scale freelancerflow 3
\`\`\`

#### Database Scaling

- Enable MongoDB Atlas auto-scaling
- Add read replicas
- Implement caching (Redis)

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check environment variables
   - Verify MongoDB connection
   - Check logs for errors

2. **High memory usage**
   - Check for memory leaks
   - Optimize database queries
   - Implement pagination

3. **Slow response times**
   - Add database indexes
   - Implement caching
   - Optimize queries

### Support

For deployment issues, contact:
- Email: support@freelancerflow.com
- GitHub Issues: https://github.com/Rajkoli145/FreelancerFlow/issues

---

**Last Updated:** December 2025
