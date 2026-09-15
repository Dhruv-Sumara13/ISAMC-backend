import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import compression from "compression";
import { errorMiddleware } from "./error/error.js";
import { helmetConfig, generalLimiter, authLimiter, contactLimiter } from "./middleware/security.js";
import logger from "./config/logger.js";
import authRouter from './routes/authRouter.js';
import userRouter from "./routes/userRoutes.js";
import dbRoutes from "./routes/cards.js"; 
import contactRouter from "./routes/contactRoutes.js";
import dbConnection from "./database/dbConnection.js";
import paperRoutes from './routes/paperRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import cacheRoutes from './routes/cacheRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import publicationRoutes from './routes/publicationRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Start one shared connection attempt. Local and serverless entry points await it
// before accepting requests.
export const databaseReady = dbConnection();

// Trust proxy (important for rate limiting behind proxy/load balancer)
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://www.isamc.in',
      'https://isamc-frontend.netlify.app',
      'https://isamc-website.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'https://localhost:3000',
      'https://localhost:5173'
    ].filter(Boolean); // Remove any undefined values
    
    // In development, be more permissive
    if (process.env.NODE_ENV !== 'production') {
      console.log(`CORS: Development mode - allowing origin ${origin}`);
      callback(null, true);
      return;
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`CORS: Allowing origin ${origin}`);
      callback(null, true);
    } else {
      console.warn(`CORS: Origin ${origin} not allowed. Allowed origins:`, allowedOrigins);
      callback(null, true); // Allow all origins for now to fix the issue
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Logging middleware
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Environment check endpoint (for debugging)
app.get('/api/debug/env', (req, res) => {
  // Only allow in development or if specifically enabled
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_ENV_DEBUG !== 'true') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    FRONTEND_URL: process.env.FRONTEND_URL,
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    JWT_REFRESH_SECRET_SET: !!process.env.JWT_REFRESH_SECRET,
    MONGODB_URI_SET: !!process.env.MONGODB_URI,
    SENDER_EMAIL_SET: !!process.env.SENDER_EMAIL
  });
});

// Apply rate limiting
// app.use('/api/auth', authLimiter);
// app.use('/api/contact', contactLimiter);
// app.use('/api', generalLimiter);

// Root route (must come before other routes)
app.get('/', (req, res) => {
  res.json({ success: true, message: 'ISAMC Backend API is running.' });
});

// API Routes
app.use("/api/v1/db", dbRoutes);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/contact", contactRouter);
app.use("/api/paper", paperRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", videoRoutes);
app.use("/api", cacheRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/publications', publicationRoutes);
console.log('✓ Publication routes mounted at /api/publications');
app.use('/api/equipment', equipmentRoutes);

// 404 handler for undefined routes (must come after all valid routes)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
