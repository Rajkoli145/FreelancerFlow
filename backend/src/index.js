const express = require("express");
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const config = require('./config/config.js');
const port = config.port;

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const clientRoutes = require('./routes/clientRoutes');
const timeLogRoutes = require('./routes/timeLogRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
// 1. connect to DB
connectDB();

// 2. global middlewares
app.use(helmet());

// CORS - whitelist only trusted origins
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:5173'];
app.use(cors({ 
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
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
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// 3. routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/project', generalLimiter, projectRoutes);
app.use('/api/client', generalLimiter, clientRoutes);
app.use('/api/timelog', generalLimiter, timeLogRoutes);
app.use('/api/invoice', generalLimiter, invoiceRoutes);

// 4. health check
app.get('/health', (req, res) => res.json({ success: true, time: new Date().toISOString() }));

// 5. error handler (should be last)
app.use(errorHandler);

// start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});