const express = require("express");
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');

const config = require('./config/config.js');
const port = config.port;

const connectDB = require('./config/db');
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
const errorHandler = require('./middleware/errorMiddleware');

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (!serviceAccount.private_key) {
      throw new Error('private_key missing in FIREBASE_SERVICE_ACCOUNT');
    }
    // Log first 30 chars of private_key for debug (safe)
    console.log('Firebase private_key starts with:', serviceAccount.private_key.substring(0, 30));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('FIREBASE_SERVICE_ACCOUNT parsed, private_key length:', parsed.private_key ? parsed.private_key.length : 'none');
      } catch (e) {
        console.error('FIREBASE_SERVICE_ACCOUNT JSON parse error:', e);
      }
    } else {
      console.error('FIREBASE_SERVICE_ACCOUNT is undefined');
    }
  }
} else {
  console.error('FIREBASE_SERVICE_ACCOUNT is not set in environment');
}

const app = express();
// 1. connect to DB
connectDB();

// 2. global middlewares
app.use(helmet());

// CORS - whitelist only trusted origins
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174',
  'https://freelancer-flow-seven.vercel.app'
];
app.use(cors({ 
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window (increased for development)
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(express.json({ limit: '10mb' })); // Increased limit for profile pictures
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// 3. routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/project', generalLimiter, projectRoutes);
app.use('/api/client', generalLimiter, clientRoutes);
app.use('/api/timelog', generalLimiter, timeLogRoutes);
app.use('/api/invoice', generalLimiter, invoiceRoutes);
app.use('/api/payment', generalLimiter, paymentRoutes);
app.use('/api/dashboard', generalLimiter, dashboardRoutes);
app.use('/api/notification', generalLimiter, notificationRoutes);
app.use('/api/expense', generalLimiter, expenseRoutes);
app.use('/api/report', generalLimiter, reportRoutes);

// 4. health check
app.get('/health', (req, res) => res.json({ success: true, time: new Date().toISOString() }));

// 5. error handler (should be last)
app.use(errorHandler);

// start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});