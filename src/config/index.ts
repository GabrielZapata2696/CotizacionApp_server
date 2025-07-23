import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'sitekol_dev',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_min_32_chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'SITEKOL <noreply@sitekol.com>',
  },
  
  upload: {
    path: process.env.UPLOAD_PATH || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,gif,webp').split(','),
  },
  
  metalRates: {
    apiUrl: process.env.METAL_RATES_API_URL || 'https://api.metalpriceapi.com/v1/latest',
    apiKey: process.env.METAL_RATES_API_KEY || '',
    baseCurrency: process.env.METAL_RATES_BASE_CURRENCY || 'USD',
    currencies: process.env.METAL_RATES_CURRENCIES || 'EUR,XAU,XAG,XPD,XPT',
    updateInterval: parseInt(process.env.METAL_RATES_UPDATE_INTERVAL || '3600'), // 1 hour (to conserve API calls)
    cacheExpiry: parseInt(process.env.METAL_RATES_CACHE_EXPIRY || '1800'), // 30 minutes cache
  },
  
  // Sitekol-specific encryption (matching frontend)
  encryption: {
    seed: process.env.ENCRYPTION_SEED || 'nTJEL7u6pE3hIB5y',
  },
  
  // Query limits for consultation users
  queryLimits: {
    defaultWeeklyQueries: parseInt(process.env.DEFAULT_WEEKLY_QUERIES || '50'),
    premiumWeeklyQueries: parseInt(process.env.PREMIUM_WEEKLY_QUERIES || '100'),
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000, // minutes to ms
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CORS_ORIGIN?.split(',') || ['https://yourdomain.com']
      : process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200', 'http://localhost:8100'],
    credentials: true,
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'DB_HOST',
  'DB_NAME',
  'DB_USERNAME',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please copy .env.example to .env and fill in the required values');
  process.exit(1);
}
