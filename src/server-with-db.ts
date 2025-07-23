import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

// Database
import { connectDatabase, sequelize } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SITEKOL API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Database health check
app.get('/api/v1/db-health', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    // Get database info
    const [results] = await sequelize.query(`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        version() as version
    `);
    
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        connected: true,
        database: results[0],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test database query - get existing tables
app.get('/api/v1/tables', async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    res.json({
      success: true,
      message: 'Tables retrieved successfully',
      data: {
        tables: results,
        count: results.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting tables:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving tables',
      error: error.message
    });
  }
});

// Test auth route
app.post('/api/v1/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoint working',
    data: { received: req.body }
  });
});

// API documentation
app.get('/api/v1/docs', (req, res) => {
  res.json({
    name: 'SITEKOL API',
    version: '1.0.0',
    description: 'Metal Trading Platform API',
    status: 'Development with PostgreSQL',
    database: process.env.DB_NAME,
    endpoints: {
      'GET /health': 'Server health check',
      'GET /api/v1/health': 'API health check',
      'GET /api/v1/db-health': 'Database connectivity check',
      'GET /api/v1/tables': 'List all database tables',
      'POST /api/v1/auth/test': 'Test auth endpoint',
      'GET /api/v1/docs': 'API documentation'
    }
  });
});

// 404 handler for API routes
app.use('/api/v1/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server with database connection
const startServer = async () => {
  try {
    // Connect to database first
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 SITEKOL API Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️ Database: ${process.env.DB_NAME}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔍 Database Health: http://localhost:${PORT}/api/v1/db-health`);
      console.log(`📋 Database Tables: http://localhost:${PORT}/api/v1/tables`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
