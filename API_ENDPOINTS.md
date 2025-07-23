# SITEKOL API ENDPOINTS

Base URL: `http://localhost:3000/api/v1`

## 🔐 Authentication Endpoints

### Login
- **POST** `/auth/login`
- **Body:**
```json
{
  "username": "admin",
  "password": "NpJ6AfMWHw"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {...},
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here"
    }
  }
}
```

### Register
- **POST** `/auth/register`
- **Body:**
```json
{
  "documento": "123456789",
  "nombre": "Juan",
  "apellido": "Pérez",
  "username": "juanperez",
  "password": "securepassword",
  "correo": "juan@example.com",
  "telefono": "1234567890",
  "empresa": 1,
  "pais": "CO",
  "rol": 2
}
```

### Logout
- **POST** `/auth/logout`
- **Headers:** `Authorization: Bearer {access_token}`

### Refresh Token
- **POST** `/auth/refresh`
- **Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### Forgot Password
- **POST** `/auth/forgot-password`
- **Body:**
```json
{
  "email": "user@example.com"
}
```

---

## 👤 User Endpoints
*Requires Authentication*

### Get User Profile
- **GET** `/users/profile`
- **Headers:** `Authorization: Bearer {access_token}`

### Update User Profile
- **PUT** `/users/profile`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez",
  "correo": "juancarlos@example.com",
  "telefono": "1234567890"
}
```

### Change Password
- **POST** `/users/change-password`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### Update User Preferences
- **PUT** `/users/preferences`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "notifications": true,
  "language": "es",
  "theme": "light"
}
```

### Get User Consultation Limits
- **GET** `/users/consultation-limits`
- **Headers:** `Authorization: Bearer {access_token}`

---

## 🏢 Company Endpoints
*Requires Authentication*

### Get All Companies
- **GET** `/companies`
- **Headers:** `Authorization: Bearer {access_token}`

### Get Company by ID
- **GET** `/companies/{id}`
- **Headers:** `Authorization: Bearer {access_token}`

### Create Company
- **POST** `/companies`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "nombre": "Empresa ABC",
  "identificacion": "123456789-0",
  "porcentaje_pago": 85.00,
  "porcentaje_pago_rh": 80.00,
  "porcentaje_pago_pt": 82.00,
  "gastos_operativos": 1000.00,
  "gastos_financieros": 500.00
}
```

### Update Company
- **PUT** `/companies/{id}`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:** (same as create)

### Get Payment Settings
- **GET** `/companies/{id}/payment-settings`
- **Headers:** `Authorization: Bearer {access_token}`

### Update Payment Settings
- **PUT** `/companies/{id}/payment-settings`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "porcentajePago": 85.00,
  "costos": 1500.00
}
```

### Get Company Statistics
- **GET** `/companies/statistics`
- **Headers:** `Authorization: Bearer {access_token}`

---

## 🥇 Metal Endpoints
*Requires Authentication*

### Get All Metals
- **GET** `/metals`
- **Headers:** `Authorization: Bearer {access_token}`

### Get Metal by ID
- **GET** `/metals/{id}`
- **Headers:** `Authorization: Bearer {access_token}`

### Create Metal
- **POST** `/metals`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "metal": "Gold",
  "simbolo": "AU",
  "unidad": "Troy Ounce",
  "estado": 1
}
```

### Update Metal
- **PUT** `/metals/{id}`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:** (same as create)

---

## 📦 Product Endpoints
*Requires Authentication*

### Get All Products
- **GET** `/products`
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `search` (optional): Search term

### Get Product by ID
- **GET** `/products/{id}`
- **Headers:** `Authorization: Bearer {access_token}`

### Create Product
- **POST** `/products`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "nombre": "Ring Gold 18K",
  "referencia": "RG18K001",
  "referencia2": "ALT001",
  "peso": 5.50,
  "marca": 1,
  "observacion": "Classic gold ring",
  "metalCompositions": [
    {
      "id_metal": 1,
      "cantidad": 750.0
    },
    {
      "id_metal": 2,
      "cantidad": 250.0
    }
  ]
}
```

### Update Product
- **PUT** `/products/{id}`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:** (same as create)

### Delete Product
- **DELETE** `/products/{id}`
- **Headers:** `Authorization: Bearer {access_token}`

### Calculate Product Price
- **POST** `/products/{id}/calculate-price`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "quantity": 1,
  "companyId": 1
}
```

---

## 💰 Pricing Endpoints
*Requires Authentication*

### Calculate Price
- **POST** `/pricing/calculate`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "productId": 1,
  "quantity": 2,
  "companyId": 1
}
```

### Get Current Metal Rates
- **GET** `/pricing/rates`
- **Headers:** `Authorization: Bearer {access_token}`

### Get Pricing Formula
- **GET** `/pricing/formula`
- **Headers:** `Authorization: Bearer {access_token}`

### Update Metal Rates (Admin Only)
- **POST** `/pricing/update-rates`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "forceUpdate": true
}
```

### Create Quote Request
- **POST** `/pricing/quote`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "productId": 1,
  "quantity": 5,
  "companyId": 1,
  "notes": "Urgent quote needed"
}
```

---

## 📊 Rates (Tarifas) Endpoints
*Requires Authentication*

### Get Current Rates
- **GET** `/rates`
- **Headers:** `Authorization: Bearer {access_token}`

### Get Rate History
- **GET** `/rates/history`
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Parameters:**
  - `startDate` (optional): YYYY-MM-DD
  - `endDate` (optional): YYYY-MM-DD
  - `metal` (optional): Metal symbol

### Update Rates (Admin Only)
- **POST** `/rates/update`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "cop": 4000.50,
  "usd": 1.0,
  "xpd": 1500.25,
  "xpt": 950.75,
  "xrh": 4500.00
}
```

---

## 📋 Quotation Endpoints
*Requires Authentication*

### Get User Quotations
- **GET** `/quotations`
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Parameters:**
  - `status` (optional): Filter by status
  - `page` (optional): Page number

### Get Quotation by ID
- **GET** `/quotations/{id}`
- **Headers:** `Authorization: Bearer {access_token}`

### Create Quotation
- **POST** `/quotations`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "productId": 1,
  "quantity": 3,
  "companyId": 1,
  "notes": "Special requirements here"
}
```

### Update Quotation Status
- **PUT** `/quotations/{id}`
- **Headers:** `Authorization: Bearer {access_token}`
- **Body:**
```json
{
  "status": "approved",
  "adminNotes": "Approved by admin"
}
```

---

## 📁 Upload Endpoints
*Requires Authentication*

### Upload Image
- **POST** `/upload/image`
- **Headers:** 
  - `Authorization: Bearer {access_token}`
  - `Content-Type: multipart/form-data`
- **Body:** Form data with image file

### Delete File
- **DELETE** `/upload/{filename}`
- **Headers:** `Authorization: Bearer {access_token}`

---

## 📊 Data Access Endpoints
*Direct database access for existing tables*

### Get Countries (Paises)
- **GET** `/data/paises`
- **Headers:** `Authorization: Bearer {access_token}`

### Get Brands (Marcas)
- **GET** `/data/marcas`
- **Headers:** `Authorization: Bearer {access_token}`

### Get Formulas
- **GET** `/data/formulas`
- **Headers:** `Authorization: Bearer {access_token}`

### Get Logs
- **GET** `/data/logs`
- **Headers:** `Authorization: Bearer {access_token}`
- **Query Parameters:**
  - `limit` (optional): Number of records
  - `userId` (optional): Filter by user

### Get Sessions
- **GET** `/data/sesiones`
- **Headers:** `Authorization: Bearer {access_token}`

---

## 🔧 System Endpoints

### Health Check
- **GET** `/health`
- **Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-23T18:20:00.000Z",
  "version": "v1",
  "environment": "development"
}
```

### API Documentation
- **GET** `/docs`
- **Response:** Complete API documentation object

---

## 🔒 Authentication Headers

For all protected endpoints, include:
```
Authorization: Bearer {your_access_token}
```

## 📝 Response Format

All responses follow this structure:
```json
{
  "success": true|false,
  "message": "Description of the result",
  "data": {...}, // Only present on successful requests
  "error": "Error description" // Only present on failed requests
}
```

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Login to get token:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "NpJ6AfMWHw"}'
   ```

3. **Use the token for authenticated requests:**
   ```bash
   curl -X GET http://localhost:3000/api/v1/users/profile \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## 📧 Support

For issues or questions, check the server logs or contact the development team.
