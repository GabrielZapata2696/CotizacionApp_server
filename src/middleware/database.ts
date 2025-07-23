import { Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '@/config/database';

// Extend Request interface to include database access
declare global {
  namespace Express {
    interface Request {
      db: {
        sequelize: typeof sequelize;
        query: (sql: string, values?: any[]) => Promise<any>;
      };
    }
  }
}

/**
 * Database middleware to attach database access to the request object
 * This allows controllers and routes to access the database via req.db
 */
export const attachDatabase = (req: Request, res: Response, next: NextFunction) => {
  req.db = {
    sequelize,
    query: async (sql: string, values?: any[]) => {
      const results = await sequelize.query(sql, {
        replacements: values || [],
        type: QueryTypes.SELECT
      });
      return results;
    }
  };
  
  next();
};
