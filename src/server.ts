import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { config } from '@/config';
import { connectDatabase } from '@/config/database';
import { setupRoutes } from '@/routes';
import { errorHandler } from '@/middleware/errorHandler';
import { attachDatabase } from '@/middleware/database';
import { logger } from '@/utils/logger';

class Server {
  public app: express.Application;
  
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration - Enhanced for better compatibility
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = Array.isArray(config.cors.origin) 
          ? config.cors.origin 
          : [config.cors.origin];
          
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      },
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type', 
        'Accept',
        'Authorization', 
        'x-access-token',
        'Cache-Control',
        'Pragma'
      ],
      exposedHeaders: ['x-access-token'],
      preflightContinue: false,
      optionsSuccessStatus: 200
    }));
    
    // Rate limiting
    const limiter = rateLimit(config.rateLimit);
    this.app.use(limiter);
    
    // Compression and logging
    this.app.use(compression());
    this.app.use(morgan('combined', {
      stream: { write: message => logger.info(message.trim()) }
    }));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv
      });
    });
  }

  private setupRoutes(): void {
    setupRoutes(this.app as any);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await connectDatabase();
      
      this.app.listen(config.port, () => {
        logger.info(`🚀 SITEKOL API Server running on port ${config.port}`);
        logger.info(`📍 Environment: ${config.nodeEnv}`);
        logger.info(`🌐 API Base URL: http://localhost:${config.port}/api/${config.apiVersion}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start().catch(console.error);

export default server;
