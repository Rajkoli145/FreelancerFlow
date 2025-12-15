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
// Firebase Admin initialization for Render: use individual env vars for each field
if (
  process.env.FIREBASE_TYPE &&
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_CLIENT_ID &&
  process.env.FIREBASE_AUTH_URI &&
  process.env.FIREBASE_TOKEN_URI &&
  process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL &&
  process.env.FIREBASE_CLIENT_X509_CERT_URL &&
  process.env.FIREBASE_UNIVERSE_DOMAIN
) {
  try {
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
    };
    console.log('Firebase private_key starts with:', serviceAccount.private_key.substring(0, 30));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized (Render env vars)');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed (Render env vars):', error);
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // fallback for local/dev: use JSON string
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized (FIREBASE_SERVICE_ACCOUNT)');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed (FIREBASE_SERVICE_ACCOUNT):', error);
  }
} else {
  console.error('❌ Firebase Admin not initialized: missing environment variables');
}
// ---
// Render.com: Set these environment variables in your Render dashboard (Environment > Add Environment Variable):
// FIREBASE_TYPE=service_account
// FIREBASE_PROJECT_ID=your_project_id
// FIREBASE_PRIVATE_KEY_ID=your_private_key_id
// FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEv... (use actual newlines, not \n)
// FIREBASE_CLIENT_EMAIL=...
// FIREBASE_CLIENT_ID=...
// FIREBASE_AUTH_URI=...
// FIREBASE_TOKEN_URI=...
// FIREBASE_AUTH_PROVIDER_X509_CERT_URL=...
// FIREBASE_CLIENT_X509_CERT_URL=...
// FIREBASE_UNIVERSE_DOMAIN=googleapis.com
// ---

const app = express();
app.set('trust proxy', 1);
// 1. connect to DB
connectDB();

// 2. global middlewares
app.use(helmet({ crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" } }));

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