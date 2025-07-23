# SITEKOL API - Postman Testing Guide

## 🚀 Server Status
- **Base URL**: `http://localhost:3000`
- **API Base**: `http://localhost:3000/api/v1`
- **Status**: ✅ Running on port 3000

## 📋 Quick Setup in Postman

### 1. Create New Collection
1. Open Postman
2. Click **"New"** → **"Collection"**
3. Name it **"SITEKOL API"**
4. Set **Base URL** variable: `http://localhost:3000/api/v1`

### 2. Set Environment Variables (Optional)
- Variable: `base_url`
- Value: `http://localhost:3000/api/v1`

## 🧪 Test Endpoints

### **1. Health Check** ✅
```
Method: GET
URL: http://localhost:3000/health
Headers: None needed
```
**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-23T03:24:32.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### **2. API Documentation** 📚
```
Method: GET
URL: http://localhost:3000/api/v1/docs
Headers: None needed
```
**Expected Response:** Full API documentation with all endpoints

### **3. Get Countries** 🏳️
```
Method: GET
URL: http://localhost:3000/api/v1/data/countries
Headers: None needed
```
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "pais": "COLOMBIA",
      "codigo": "COL",
      "estado": 1
    },
    {
      "id": "2", 
      "pais": "PERÚ",
      "codigo": "PER",
      "estado": 1
    }
  ],
  "count": 7
}
```

### **4. Get Metals** ⚜️
```
Method: GET
URL: http://localhost:3000/api/v1/data/metals
Headers: None needed
```
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "metal": "PALADIO",
      "simbolo": "PD",
      "unidad": "Partes por millón",
      "estado": 1
    },
    {
      "id": "2",
      "metal": "RODIO", 
      "simbolo": "RH",
      "unidad": "Partes por millón",
      "estado": 1
    }
  ],
  "count": 3
}
```

### **5. Get Companies** 🏢
```
Method: GET
URL: http://localhost:3000/api/v1/data/companies
Headers: None needed
```
**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "nombre": "Sitekol",
      "identificacion": "EMP-001",
      "estado": 1
    },
    {
      "id": "2",
      "nombre": "Independiente",
      "identificacion": "EMP-000", 
      "estado": 1
    }
  ],
  "count": 2
}
```

### **6. Validate Username** 👤
```
Method: POST
URL: http://localhost:3000/api/v1/data/validate-username
Headers: 
  Content-Type: application/json
Body (JSON):
{
  "username": "admin"
}
```
**Expected Response:**
```json
{
  "success": true,
  "exists": true,
  "user": {
    "id": "1",
    "username": "admin",
    "correo": "sr.gabrielzm@gmail.com"
  }
}
```

### **7. Get User Profile** 👤
```
Method: GET
URL: http://localhost:3000/api/v1/data/user/admin
Headers: None needed
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "documento": "12345678",
    "nombre": "Admin",
    "apellido": "Sitekol", 
    "username": "admin",
    "correo": "sr.gabrielzm@gmail.com",
    "telefono": "+57123456789",
    "creacion": "2025-01-01",
    "empresa": "1",
    "pais": "COL",
    "rol": 1,
    "estado": 1
  }
}
```

### **8. Get Metal Pricing** 💰
```
Method: GET
URL: http://localhost:3000/api/v1/pricing/rates
Headers: None needed
```
**Expected Response:**
```json
{
  "success": true,
  "rates": {
    "XAU": 2650.45,
    "XAG": 31.20,
    "XPT": 1150.00,
    "XPD": 1320.75
  },
  "timestamp": "2025-07-23T03:24:32.000Z",
  "source": "MetalPriceAPI"
}
```

## 🔍 Testing Steps in Postman

### **Step 1: Basic Connectivity**
1. Test **Health Check** first to ensure server is running
2. Test **API Docs** to see all available endpoints

### **Step 2: Data Endpoints**
3. Test **Get Countries** - should return 7 countries
4. Test **Get Metals** - should return 3 metals  
5. Test **Get Companies** - should return 2 companies

### **Step 3: User Validation**
6. Test **Validate Username** with `"admin"` - should return `exists: true`
7. Test **Validate Username** with `"nonexistent"` - should return `exists: false`
8. Test **Get User Profile** for `admin` user

### **Step 4: Metal Pricing**
9. Test **Get Metal Pricing** - should return current rates from MetalPriceAPI

## 🚨 Troubleshooting

### **Common Issues & Solutions:**

#### **404 Not Found**
- ✅ Check URL spelling: `http://localhost:3000/api/v1/data/countries`
- ✅ Ensure server is running on port 3000
- ✅ Don't add extra spaces in URL

#### **500 Internal Server Error**
- ✅ Check server console for error messages
- ✅ Verify database connection is working
- ✅ Check if PostgreSQL is running

#### **Connection Refused**
- ✅ Restart the server: `npm run dev`
- ✅ Check if port 3000 is available
- ✅ Verify server started successfully

#### **Database Errors**
- ✅ Check PostgreSQL is running
- ✅ Verify database name: `3754403_sitekol`
- ✅ Check connection credentials in `.env`

## 📊 Expected Data Summary

Your database should contain:
- **7 Countries**: Colombia, Perú, México, Ecuador, Chile, etc.
- **3 Metals**: Paladio, Rodio, Platino
- **1 Admin User**: username `admin`
- **2 Companies**: Sitekol, Independiente

## 🔗 Quick Test Collection

Import this into Postman as a collection:

```json
{
  "info": {
    "name": "SITEKOL API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api/v1"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/health"
      }
    },
    {
      "name": "Get Countries",
      "request": {
        "method": "GET", 
        "url": "{{base_url}}/data/countries"
      }
    },
    {
      "name": "Get Metals",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/data/metals"
      }
    },
    {
      "name": "Validate Username",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/data/validate-username",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"admin\"\n}"
        }
      }
    }
  ]
}
```

## 🎯 Next Steps After Testing

1. **If tests pass**: Your API is working with existing database ✅
2. **Update Angular services**: Use these new endpoints instead of PHP
3. **Test authentication**: Implement login endpoint next
4. **Add more endpoints**: Based on your frontend needs

Start with the **Health Check** and **Get Countries** endpoints to verify everything is working! 🚀
