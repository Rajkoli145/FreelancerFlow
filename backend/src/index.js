const express = require("express");
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const config = require('./config/config');
const logger = require('./utils/logger');
const connectDB = require('./config/db');
const { initializeFirebase } = require('./config/firebase');
const setupSwagger = require('./config/swagger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const clientRoutes = require('./routes/clientRoutes');
const timeLogRoutes = require('./routes/timeLogRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Trust proxy - required for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// ========== 1. CONNECT TO DATABASE & EXTERNAL SERVICES ==========
if (config.nodeEnv !== 'test') {
  connectDB();
  initializeFirebase();
}

// ========== 2. SECURITY MIDDLEWARE ==========

// Set security HTTP headers
app.use(helmet({
  crossOriginOpenerPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS - whitelist only trusted origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://freelancer-flow-seven.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Check if origin is in whitelist or matches Vercel subdomain pattern
    const allowedSubdomain = /\.vercel\.app$/;
    if (allowedOrigins.indexOf(origin) !== -1 || allowedSubdomain.test(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Data sanitization against NoSQL query injection
if (config.nodeEnv !== 'test') {
  app.use(mongoSanitize());
}

// Data sanitization against XSS
if (config.nodeEnv !== 'test') {
  app.use(xss());
}

// Prevent HTTP Parameter Pollution
if (config.nodeEnv !== 'test') {
  app.use(hpp({
    whitelist: ['status', 'billingType', 'category'] // Allow duplicate params for filters
  }));
}

// ========== 3. RATE LIMITING ==========

// Auth routes - stricter limits
const authLimiter = config.nodeEnv === 'test' ? (req, res, next) => next() : rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: 5, // 5 requests per window for auth
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later'
    });
  }
});

// Mutation routes - moderate limits
const mutationLimiter = config.nodeEnv === 'test' ? (req, res, next) => next() : rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// General routes - relaxed limits
const generalLimiter = config.nodeEnv === 'test' ? (req, res, next) => next() : rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
});

// ========== 4. BODY PARSING & LOGGING ==========

// Body parser - limit payload size
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());

// HTTP request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// ========== 5. API DOCUMENTATION ==========

// Setup Swagger API documentation
setupSwagger(app);

// ========== 6. API ROUTES ==========

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/project', generalLimiter, projectRoutes);
app.use('/api/client', generalLimiter, clientRoutes);
app.use('/api/timelog', generalLimiter, timeLogRoutes);
app.use('/api/invoice', generalLimiter, invoiceRoutes);
app.use('/api/payment', mutationLimiter, paymentRoutes);
app.use('/api/dashboard', generalLimiter, dashboardRoutes);
app.use('/api/notification', generalLimiter, notificationRoutes);
app.use('/api/expense', generalLimiter, expenseRoutes);
app.use('/api/report', generalLimiter, reportRoutes);
app.use('/api/admin', generalLimiter, adminRoutes);

// ========== 7. HEALTH CHECK ==========

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ========== 8. ERROR HANDLING ==========

// Handle 404 - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

// ========== 9. START SERVER ==========

let server;
if (config.nodeEnv !== 'test') {
  server = app.listen(config.port, () => {
    logger.info(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      logger.info('💥 Process terminated');
    });
  } else {
    logger.info('💥 Process terminated');
  }
});

module.exports = app; // Export for testing