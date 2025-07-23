import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

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
    status: 'Development',
    endpoints: {
      'GET /health': 'Server health check',
      'GET /api/v1/health': 'API health check',
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SITEKOL API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

export default app;
