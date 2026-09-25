const path = require('path');
// Multi-source dotenv configuration for local, monorepo root, and serverless environments
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Initialize Express App
const app = express();

// Fallback JWT secret ensures application never crashes due to missing env var
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'solarsense_super_secret_jwt_key_2026_btech_project';
}

// Background startup database connection & catalog initialization
connectDB().then(async () => {
  try {
    const SolarCompany = require('./models/SolarCompany');
    const count = await SolarCompany.countDocuments();
    if (count === 0) {
      console.log('[Auto-Seed] Initializing solar companies directory...');
      const { seedCompanies } = require('./seed/seedCompanies');
      await seedCompanies(false);
    }
  } catch (err) {
    console.warn('[Auto-Seed] Note on company seeding:', err.message);
  }
}).catch((err) => {
  console.error('[Database Startup Error]', err.message);
});

// Security HTTP Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// Rate Limiting (P4 Protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Max 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api/', globalLimiter);

// Request body size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'SolarSense AI REST Engine',
    version: '2.0.0',
  });
});

// Database connection readiness middleware (guarantees DB ready before processing API routes)
app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database connection currently initializing or unreachable. Please retry in a few moments.',
    });
  }
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/solar', require('./routes/solarRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[SolarSense AI Server] Running on http://localhost:${PORT}`);
    console.log(`[Environment] Mode: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
