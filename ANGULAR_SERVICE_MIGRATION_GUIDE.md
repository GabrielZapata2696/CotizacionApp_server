# Angular Frontend Service Migration Guide

## Overview
Your Node.js backend is now running at `http://localhost:3000` with the API base URL: `http://localhost:3000/api/v1`

This guide shows how to update your Angular services to use the new backend endpoints.

## Backend Endpoints Summary

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration  
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/change-password` - Change password
- `POST /api/v1/users/validate-username` - Check if username exists

### Products & Companies
- `GET /api/v1/products` - Get all products
- `POST /api/v1/products` - Create new product
- `GET /api/v1/companies` - Get all companies
- `POST /api/v1/companies` - Create new company

### Metal Rates & Pricing
- `GET /api/v1/pricing/rates` - Get current metal rates
- `POST /api/v1/pricing/calculate` - Calculate product price
- `GET /api/v1/metals` - Get all metals

### Quotations
- `GET /api/v1/quotations` - Get user quotations
- `POST /api/v1/quotations` - Create new quotation

## Service Migration Examples

### 1. Update usuario.service.ts

Replace the old PHP endpoints with new Node.js endpoints:

```typescript
// OLD PHP endpoints (REMOVE THESE)
// private baseUrl = 'http://localhost:3000/api/v1/php/';

// NEW Node.js endpoints (USE THESE)
private baseUrl = 'http://localhost:3000/api/v1/';

// Update login method
login(username: string, password: string) {
  const loginData = { username, password };
  return this.http.post(`${this.baseUrl}auth/login`, loginData);
}

// Update user validation
validarUsuario(username: string) {
  return this.http.post(`${this.baseUrl}users/validate-username`, { username });
}

// Update user creation
crearUsuario(userData: any) {
  return this.http.post(`${this.baseUrl}auth/register`, userData);
}

// Update password recovery
recuperarPassword(email: string) {
  return this.http.post(`${this.baseUrl}auth/forgot-password`, { email });
}
```

### 2. Update gestiones.service.ts

```typescript
// Update base URL
private baseUrl = 'http://localhost:3000/api/v1/';

// Update methods
obtenerPaises() {
  return this.http.get(`${this.baseUrl}countries`);
}

obtenerMetales() {
  return this.http.get(`${this.baseUrl}metals`);
}

obtenerEmpresas() {
  return this.http.get(`${this.baseUrl}companies`);
}

obtenerTarifas() {
  return this.http.get(`${this.baseUrl}pricing/rates`);
}

crearProducto(productData: any) {
  return this.http.post(`${this.baseUrl}products`, productData);
}

crearEmpresa(companyData: any) {
  return this.http.post(`${this.baseUrl}companies`, companyData);
}

crearCotizacion(quotationData: any) {
  return this.http.post(`${this.baseUrl}quotations`, quotationData);
}

listarProductos(page: number = 1, limit: number = 10) {
  return this.http.get(`${this.baseUrl}products?page=${page}&limit=${limit}`);
}

obtenerCotizaciones(page: number = 1, limit: number = 10) {
  return this.http.get(`${this.baseUrl}quotations?page=${page}&limit=${limit}`);
}
```

## Key Differences to Note

### 1. Response Format
The Node.js backend returns JSON responses in this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### 2. Authentication
- The backend uses JWT tokens
- Include the token in the Authorization header: `Authorization: Bearer <token>`

### 3. Error Handling
- HTTP status codes are properly used (400, 401, 404, 500, etc.)
- Error responses include `success: false` and error details

### 4. Password Handling
- The backend handles password hashing securely with bcrypt
- No need to encrypt passwords on the frontend anymore
- Send plain text passwords, the backend will hash them

## Example Angular HTTP Interceptor

Create an interceptor to automatically add auth headers:

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}
```

## Testing the Migration

1. **Start the Node.js backend**: The server is already running on port 3000
2. **Update one service at a time**: Start with `usuario.service.ts`
3. **Test authentication**: Try logging in with the admin user:
   - Username: `admin`
   - Password: `admin123`
4. **Check console**: Look for successful responses from the new endpoints
5. **Verify data**: Check that data is properly loaded from the PostgreSQL database

## Database Admin User
Use these credentials to test:
- **Email**: admin@sitekol.com
- **Username**: admin  
- **Password**: admin123

## API Documentation
Visit `http://localhost:3000/api/v1/docs` to see all available endpoints.

## Next Steps

1. Update `usuario.service.ts` first
2. Test login functionality
3. Update `gestiones.service.ts` 
4. Update other services one by one
5. Remove any AES encryption logic (no longer needed)
6. Update error handling to work with new response format

The backend is fully functional with:
- ✅ PostgreSQL database with all tables
- ✅ Real-time metal pricing from MetalPriceAPI
- ✅ JWT authentication
- ✅ Secure password hashing
- ✅ Full REST API with proper endpoints
- ✅ CORS enabled for your Angular app
