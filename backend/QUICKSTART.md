# 🚀 Quick Start Guide - FreelancerFlow Production Setup

## ⚡ 5-Minute Setup

### Step 1: Generate JWT Secret (30 seconds)

```bash
cd backend
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output - you'll need it in the next step.

### Step 2: Create .env File (1 minute)

```bash
cp .env.example .env
```

Edit `.env` and update these **REQUIRED** fields:

```env
# Paste your generated JWT secret here
JWT_SECRET=<paste_the_long_string_from_step_1>

# Your MongoDB connection string
MONGO_URI=mongodb://localhost:27017/freelancerflow

# Your frontend URL (update when deploying)
FRONTEND_URL=http://localhost:5173
```

### Step 3: Install Dependencies (2 minutes)

```bash
npm install
```

### Step 4: Run Tests (1 minute)

```bash
npm test
```

You should see tests passing! ✅

### Step 5: Start Development Server (30 seconds)

```bash
npm run dev
```

Server will start on `http://localhost:5000`

---

## ✅ Verify Everything Works

### 1. Check Health Endpoint

Open browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "environment": "development",
  "timestamp": "2025-12-22T...",
  "uptime": 5.123
}
```

### 2. View API Documentation

Open in browser:
```
http://localhost:5000/api-docs
```

You should see interactive Swagger documentation! 📚

### 3. Test API Endpoint

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🎯 What's Next?

### Development
- Start building features
- Write tests as you go
- Check logs in `logs/` directory
- Use `npm run test:watch` for TDD

### Before Production
1. Read `PRODUCTION_UPGRADE_SUMMARY.md`
2. Review `DEPLOYMENT.md`
3. Run `npm run lint` to check code quality
4. Ensure test coverage is good
5. Set up monitoring (Sentry, etc.)

---

## 🆘 Troubleshooting

### "Missing required environment variables"
- Make sure you created `.env` file
- Check that `MONGO_URI` and `JWT_SECRET` are set

### "MongoDB connection failed"
- Make sure MongoDB is running
- Check your `MONGO_URI` is correct
- Try: `mongod` or `brew services start mongodb-community`

### Tests failing
- Make sure all dependencies installed: `npm install`
- Check Node version: `node --version` (should be 18+ or 20+)

### Port already in use
- Change `PORT` in `.env` file
- Or kill process: `lsof -ti:5000 | xargs kill`

---

## 📚 Key Commands

```bash
# Development
npm run dev              # Start with auto-reload
npm run test:watch       # Run tests in watch mode

# Testing
npm test                 # Run all tests with coverage
npm run test:ci          # CI-optimized testing

# Code Quality
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix issues

# Production
npm start                # Start production server
```

---

## 🎉 You're Ready!

Your FreelancerFlow backend is now:
- ✅ Secure
- ✅ Tested
- ✅ Documented
- ✅ Production-ready

**Happy coding!** 🚀

---

**Need Help?**
- Check `README.md` for detailed docs
- Review `PRODUCTION_UPGRADE_SUMMARY.md` for what changed
- See `DEPLOYMENT.md` for deployment guides
