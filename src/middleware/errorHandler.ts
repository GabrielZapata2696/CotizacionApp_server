import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types/ApiResponse';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  const response: ApiResponse = {
    success: false,
    message: 'Error interno del servidor'
  };

  // Don't expose detailed error information in production
  if (process.env.NODE_ENV === 'development') {
    response.errors = [{
      message: error.message,
      stack: error.stack
    }];
  }

  res.status(500).json(response);
};
