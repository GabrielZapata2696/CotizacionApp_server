import { Express } from 'express';
import { config } from '@/config';
import { attachDatabase } from '@/middleware/database';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import quotationRoutes from './quotationRoutes';
import userRoutes from './userRoutes';
import companyRoutes from './companyRoutes';
import metalRoutes from './metalRoutes';
import tarifaRoutes from './tarifaRoutes';
import uploadRoutes from './uploadRoutes';
import { pricingRoutes } from './pricingRoutes';
import dataRoutes from './dataRoutes';

export const setupRoutes = (app: Express): void => {
  const apiPrefix = `/api/${config.apiVersion}`;

  // Apply database middleware to all API routes
  app.use(apiPrefix, attachDatabase);

  // Health check route
  app.get(`${apiPrefix}/health`, (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: config.apiVersion,
      environment: config.nodeEnv
    });
  });

  // API Routes
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/products`, productRoutes);
  app.use(`${apiPrefix}/quotations`, quotationRoutes);
  app.use(`${apiPrefix}/users`, userRoutes);
  app.use(`${apiPrefix}/companies`, companyRoutes);
  app.use(`${apiPrefix}/metals`, metalRoutes);
  app.use(`${apiPrefix}/rates`, tarifaRoutes);
  app.use(`${apiPrefix}/pricing`, pricingRoutes);
  app.use(`${apiPrefix}/upload`, uploadRoutes);
  
  // Data access routes for existing tables
  app.use(`${apiPrefix}/data`, dataRoutes);

  // API documentation endpoint
  app.get(`${apiPrefix}/docs`, (req, res) => {
    res.json({
      name: 'SITEKOL API',
      version: '1.0.0',
      description: 'Metal Trading Platform API',
      endpoints: {
        auth: {
          'POST /auth/login': 'User login',
          'POST /auth/register': 'User registration',
          'POST /auth/logout': 'User logout',
          'POST /auth/refresh': 'Refresh access token',
          'POST /auth/forgot-password': 'Request password reset'
        },
        products: {
          'GET /products': 'Get all products',
          'GET /products/:id': 'Get product by ID',
          'POST /products': 'Create new product',
          'PUT /products/:id': 'Update product',
          'DELETE /products/:id': 'Delete product',
          'POST /products/:id/calculate-price': 'Calculate product price'
        },
        quotations: {
          'GET /quotations': 'Get user quotations',
          'GET /quotations/:id': 'Get quotation by ID',
          'POST /quotations': 'Create new quotation',
          'PUT /quotations/:id': 'Update quotation status'
        },
        users: {
          'GET /users/profile': 'Get user profile',
          'PUT /users/profile': 'Update user profile',
          'POST /users/change-password': 'Change password'
        },
        companies: {
          'GET /companies': 'Get all companies',
          'GET /companies/:id': 'Get company by ID',
          'POST /companies': 'Create new company',
          'PUT /companies/:id': 'Update company'
        },
        metals: {
          'GET /metals': 'Get all metals',
          'POST /metals': 'Create new metal',
          'PUT /metals/:id': 'Update metal'
        },
        rates: {
          'GET /rates': 'Get current metal rates',
          'GET /rates/history': 'Get rate history',
          'POST /rates/update': 'Update rates (admin only)'
        },
        pricing: {
          'POST /pricing/calculate': 'Calculate product price',
          'GET /pricing/rates': 'Get current metal rates',
          'GET /pricing/formula': 'Get pricing formula',
          'POST /pricing/update-rates': 'Update metal rates (admin)',
          'POST /pricing/quote': 'Create quotation request'
        },
        upload: {
          'POST /upload/image': 'Upload image file',
          'DELETE /upload/:filename': 'Delete uploaded file'
        }
      }
    });
  });

  // 404 handler for API routes
  app.use(`${apiPrefix}/*`, (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  });
};
