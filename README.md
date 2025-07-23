# SITEKOL Backend API

🚀 **Metal Trading Platform API** - A comprehensive TypeScript/Node.js backend for the SITEKOL metal trading platform with real-time pricing, quotation management, and company administration.

## 🌟 Features

### Core Functionality
- **Real-time Metal Pricing**: Integration with external metals API for XPD, XPT, XRH, COP rates
- **Dynamic Price Calculations**: Complex pricing formulas with company-specific adjustments
- **Quotation Management**: Complete quotation workflow from creation to approval
- **User Authentication**: JWT-based authentication with role-based access control
- **Company Management**: Multi-tenant architecture supporting different company types
- **Audit Logging**: Comprehensive activity tracking and security monitoring

### Technical Features
- **TypeScript**: Full type safety and modern ES6+ features
- **Database**: PostgreSQL with Sequelize ORM
- **Real-time Updates**: Socket.io for live price updates
- **Security**: Helmet, rate limiting, input validation, encryption
- **File Upload**: Image processing with Sharp
- **Email Integration**: Automated notifications with Nodemailer
- **Comprehensive Testing**: Unit tests, integration tests, and system validation

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.1+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io
- **File Processing**: Sharp, Multer
- **Email**: Nodemailer
- **Testing**: Jest, Supertest
- **Logging**: Winston
- **Validation**: Express-validator, Joi

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm ✅
- PostgreSQL 13+ on port 5432 ✅  
- Your MetalPriceAPI key is ready ✅

### Installation

1. **Dependencies are installed** ✅
```bash
cd sitekol-backend
npm install
```

2. **Configuration is Ready** ✅
Your `.env` file is configured with:
- ✅ **Database**: PostgreSQL on localhost:5432, database `3754403_sitekol`
- ✅ **MetalPriceAPI**: Your key `6f7a2...` (100 calls/month)
- ✅ **API Caching**: 30-minute cache to conserve API calls
- ✅ **Base Currency**: USD with EUR, Gold, Silver, Palladium, Platinum rates

3. **Test Your Setup** 🧪
```bash
# Test API and database connections
npm run test:api
```
This will verify:
- MetalPriceAPI connection and current rates
- PostgreSQL database connectivity  
- Configuration validity

3. **Database Setup**
```bash
# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

4. **Start Development Server**
```bash
npm run dev
```

The API will be available at: `http://localhost:3000/api/v1`

## 📊 System Testing

Run comprehensive system tests to validate all functionality:

```bash
npm run test:system
```

This will test all endpoints, authentication, pricing calculations, and integrations.

## 🔗 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Core Endpoints

#### Health & Documentation
```http
GET /health              # Health check
GET /docs                # Interactive API documentation
```

#### Authentication
```http
POST /auth/register      # User registration
POST /auth/login         # User login  
POST /auth/logout        # User logout
POST /auth/refresh       # Token refresh
POST /auth/forgot-password # Password reset
```

#### User Management
```http
GET  /users/profile           # Get user profile
PUT  /users/profile           # Update profile
POST /users/change-password   # Change password
GET  /users/query-limits      # Check query limits
PUT  /users/preferences       # Update preferences
```

#### Company Management
```http
GET  /companies              # List companies (admin)
GET  /companies/:id          # Get company details
POST /companies              # Create company (admin)
PUT  /companies/:id          # Update company
GET  /companies/:id/payment-settings    # Get payment config
PUT  /companies/:id/payment-settings    # Update payment config (admin)
GET  /companies/stats        # Company statistics (admin)
```

#### Pricing System 
```http
POST /pricing/calculate      # Calculate product price
GET  /pricing/rates          # Get current metal rates
GET  /pricing/formula        # Get pricing formula
POST /pricing/update-rates   # Update rates (admin)
POST /pricing/quote          # Create quotation
```

#### Products
```http
GET  /products              # List products
GET  /products/:id          # Get product details
POST /products              # Create product
PUT  /products/:id          # Update product
DELETE /products/:id        # Delete product
POST /products/:id/calculate-price # Calculate specific product price
```

#### Quotations
```http
GET  /quotations            # List user quotations
GET  /quotations/:id        # Get quotation details
POST /quotations            # Create quotation
PUT  /quotations/:id        # Update quotation status
```

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🏗️ Architecture

### Project Structure
```
src/
├── config/          # Configuration files
├── controllers/     # Route handlers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Utility functions
└── server.ts        # Application entry point
```

### Key Services

#### SitekolPricingService
Handles all pricing calculations with:
- Real-time metal rate fetching
- Company-specific adjustments
- Currency conversions
- Formula-based discounts

#### AuditService
Comprehensive logging for:
- User activities
- Security events
- Business operations
- System performance

#### EncryptionService
Security features:
- Password hashing
- Data encryption
- Secure communications

## 🗄️ Database Schema

### Core Models
- **Usuario**: User accounts with roles and permissions
- **Empresa**: Company information and settings
- **Producto**: Product catalog with metal compositions
- **Cotizacion**: Quotation management
- **Metal**: Metal types and properties
- **Tarifa**: Historical pricing data
- **Formula**: Pricing calculation formulas

### Relationships
- Companies have many Users
- Products have many Metal Components
- Users create Quotations for Products
- Pricing uses current Metal Rates and Company Formulas

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin, user, and company-level permissions
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive request validation
- **Audit Logging**: All activities logged for security monitoring
- **Encryption**: Sensitive data encryption at rest
- **CORS Protection**: Configured for frontend integration
- **Helmet Integration**: Security headers and protection

## 📈 Monitoring & Logging

### Winston Logging
- Structured logging with multiple levels
- File and console output
- Audit trail for all operations

### Audit System
- User activity tracking
- Security event monitoring
- Business operation logging
- Performance metrics

## 🧪 Testing

### Available Test Scripts
```bash
npm test              # Unit tests
npm run test:watch    # Watch mode testing
npm run test:system   # Comprehensive system tests
```

### Test Coverage
- Authentication flows
- Pricing calculations
- User management
- Company operations
- API endpoint validation

## 🚀 Deployment

### Development
```bash
npm run dev          # Development with hot reload
npm run dev-db       # Development with database
npm run test-db      # Test database connection
```

### Production
```bash
npm run build        # Build TypeScript
npm start            # Start production server
```

### Environment Variables
Ensure all required environment variables are set:
- Database credentials
- JWT secrets  
- External API keys
- Email configuration
- Upload paths

## 🔧 Configuration

### Environment Files
- `.env.example`: Template with all required variables
- `.env`: Your local configuration (not in git)
- `src/config/`: Centralized configuration management

### Key Configurations
- **Database**: PostgreSQL connection settings
- **JWT**: Token configuration and expiration
- **Metals API**: External pricing data source
- **Email**: SMTP settings for notifications
- **Upload**: File handling configuration
- **Rate Limiting**: API protection settings

## 🤝 Integration

### Frontend Integration
Designed to work with the Angular SITEKOL frontend:
- CORS configured for Angular development
- JWT tokens for authentication
- Real-time updates via Socket.io
- RESTful API design

### External APIs
- **Metals API**: Real-time precious metal rates
- **Email Service**: Automated notifications
- **File Storage**: Image and document handling

## 📞 API Examples

### Authentication
```javascript
// Login
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

### Calculate Pricing
```javascript
// Calculate product price
const response = await fetch('/api/v1/pricing/calculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    productId: 1,
    userId: 1
  })
});
```

## 📋 Next Steps

1. **Set up your metals API key** in `.env`
2. **Configure database** connection
3. **Run system tests** to validate functionality
4. **Create initial data** (companies, users, products)
5. **Integrate with frontend** Angular application
6. **Deploy to production** environment

## 📄 License

MIT License - see LICENSE file for details

## 👥 Support

For questions or support:
1. Check the system tests output
2. Review the API documentation at `/api/v1/docs`
3. Check logs in the `logs/` directory
4. Run health checks at `/api/v1/health`

---

**Built with ❤️ for the SITEKOL Metal Trading Platform**
#   C o t i z a c i o n A p p _ s e r v e r  
 