import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seed.js';
import { startPeriodicQueueSweeper } from './services/dispatchService.js';
import User from './models/User.js';
import Department from './models/Department.js';

import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import verifierRoutes from './routes/verifierRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
const uploadsPath = path.resolve(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Public departments list (used in Appendix I: api.get('/departments'))
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    res.status(200).json({ success: true, departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'CivicEye REST API',
    version: '1.0.0',
  });
});

// Serve built client SPA if present (supports unified single-service deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root route fallback when running backend standalone
  app.get('/', (req, res) => {
    res.send('CivicEye API Server is running. Visit /api/health for system status.');
  });
}

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[CivicEye Server Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start Server & Connect Database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is newly initialized
    const userCount = await User.countDocuments();
    if (userCount === 0 || process.env.AUTO_SEED === 'true') {
      console.log('[CivicEye] Initializing database with seed data...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  CIVICEYE REST API SERVER RUNNING ON PORT ${PORT}`);
      console.log(`  API Health: http://localhost:${PORT}/api/health`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=======================================================`);

      // Initialize autonomous queue sweeper
      startPeriodicQueueSweeper(60000);
    });
  } catch (error) {
    console.error(`[CivicEye] Failed to start server: ${error.message}`);
    // Keep app alive or retry
  }
};

startServer();
