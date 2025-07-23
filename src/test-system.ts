import axios from 'axios';
import { config } from './config';
import { logger } from './utils/logger';

// Test configuration
const BASE_URL = `http://localhost:${config.port}/api/${config.apiVersion}`;
const TEST_USERS = {
  admin: {
    email: 'admin@sitekol.com',
    password: 'admin123',
    token: ''
  },
  user: {
    email: 'user@test.com',
    password: 'user123',
    token: ''
  }
};

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  responseTime: number;
}

class SystemTester {
  private results: TestResult[] = [];

  constructor() {
    console.log('🧪 SITEKOL Backend System Tester');
    console.log('='.repeat(50));
  }

  /**
   * Run comprehensive system tests
   */
  public async runTests(): Promise<void> {
    try {
      console.log('\n🚀 Starting system tests...\n');
      
      // Test 1: Health check
      await this.testHealthCheck();
      
      // Test 2: Authentication
      await this.testAuthentication();
      
      // Test 3: User management (requires authentication)
      if (TEST_USERS.user.token) {
        await this.testUserManagement();
      }
      
      // Test 4: Company management
      if (TEST_USERS.admin.token) {
        await this.testCompanyManagement();
      }
      
      // Test 5: Pricing system (requires metals API key)
      await this.testPricingSystem();
      
      // Test 6: Product management
      await this.testProductManagement();
      
      // Test 7: Quotation system
      await this.testQuotationSystem();
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test runner failed:', error);
    }
  }

  /**
   * Test health and documentation endpoints
   */
  private async testHealthCheck(): Promise<void> {
    console.log('📊 Testing Health & Documentation...');
    
    await this.makeRequest('GET', '/health', {}, false);
    await this.makeRequest('GET', '/docs', {}, false);
  }

  /**
   * Test authentication endpoints
   */
  private async testAuthentication(): Promise<void> {
    console.log('🔐 Testing Authentication...');
    
    // Test registration
    const registerData = {
      nombre: 'Test User',
      email: TEST_USERS.user.email,
      password: TEST_USERS.user.password,
      empresaId: 1 // Assuming a test company exists
    };
    
    const registerResult = await this.makeRequest('POST', '/auth/register', registerData, false);
    
    // Test login
    const loginData = {
      email: TEST_USERS.user.email,
      password: TEST_USERS.user.password
    };
    
    const loginResult = await this.makeRequest('POST', '/auth/login', loginData, false);
    if (loginResult.success && loginResult.data?.token) {
      TEST_USERS.user.token = loginResult.data.token;
    }
    
    // Test admin login (if admin user exists)
    const adminLoginData = {
      email: TEST_USERS.admin.email,
      password: TEST_USERS.admin.password
    };
    
    const adminLoginResult = await this.makeRequest('POST', '/auth/login', adminLoginData, false);
    if (adminLoginResult.success && adminLoginResult.data?.token) {
      TEST_USERS.admin.token = adminLoginResult.data.token;
    }
    
    // Test token refresh
    if (TEST_USERS.user.token) {
      await this.makeRequest('POST', '/auth/refresh', {}, true, TEST_USERS.user.token);
    }
  }

  /**
   * Test user management endpoints
   */
  private async testUserManagement(): Promise<void> {
    console.log('👤 Testing User Management...');
    
    const token = TEST_USERS.user.token;
    
    // Get user profile
    await this.makeRequest('GET', '/users/profile', {}, true, token);
    
    // Update profile
    const profileUpdate = {
      nombre: 'Updated Test User',
      telefono: '+1234567890'
    };
    await this.makeRequest('PUT', '/users/profile', profileUpdate, true, token);
    
    // Change password
    const passwordChange = {
      currentPassword: TEST_USERS.user.password,
      newPassword: 'newPassword123'
    };
    await this.makeRequest('POST', '/users/change-password', passwordChange, true, token);
    
    // Get query limits
    await this.makeRequest('GET', '/users/query-limits', {}, true, token);
    
    // Update preferences
    const preferences = {
      currency: 'USD',
      language: 'es',
      notifications: true
    };
    await this.makeRequest('PUT', '/users/preferences', preferences, true, token);
  }

  /**
   * Test company management endpoints
   */
  private async testCompanyManagement(): Promise<void> {
    console.log('🏢 Testing Company Management...');
    
    const token = TEST_USERS.admin.token;
    
    // Get all companies (admin only)
    await this.makeRequest('GET', '/companies', {}, true, token);
    
    // Get company stats (admin only)
    await this.makeRequest('GET', '/companies/stats', {}, true, token);
    
    // Create new company (admin only)
    const newCompany = {
      nombre: 'Test Company',
      tipo: 'basico',
      pais: 'Colombia',
      porcentajePago: 15,
      costos: 100,
      contactoPrincipal: 'Test Contact',
      telefono: '+57123456789',
      direccion: 'Test Address'
    };
    const createResult = await this.makeRequest('POST', '/companies', newCompany, true, token);
    
    let companyId = 1; // Default test company ID
    if (createResult.success && createResult.data?.id) {
      companyId = createResult.data.id;
    }
    
    // Get specific company
    await this.makeRequest('GET', `/companies/${companyId}`, {}, true, token);
    
    // Update company
    const companyUpdate = {
      contactoPrincipal: 'Updated Contact',
      telefono: '+57987654321'
    };
    await this.makeRequest('PUT', `/companies/${companyId}`, companyUpdate, true, token);
    
    // Get payment settings
    await this.makeRequest('GET', `/companies/${companyId}/payment-settings`, {}, true, token);
    
    // Update payment settings (admin only)
    const paymentUpdate = {
      porcentajePago: 20,
      costos: 150
    };
    await this.makeRequest('PUT', `/companies/${companyId}/payment-settings`, paymentUpdate, true, token);
  }

  /**
   * Test pricing system endpoints
   */
  private async testPricingSystem(): Promise<void> {
    console.log('💰 Testing Pricing System...');
    
    const token = TEST_USERS.user.token || TEST_USERS.admin.token;
    
    if (!token) {
      console.log('⚠️  Skipping pricing tests - no authenticated user');
      return;
    }
    
    // Get current metal rates
    await this.makeRequest('GET', '/pricing/rates', {}, true, token);
    
    // Get pricing formula
    await this.makeRequest('GET', '/pricing/formula', {}, true, token);
    
    // Calculate product price
    const priceCalculation = {
      productId: 1, // Assuming a test product exists
      userId: 1
    };
    await this.makeRequest('POST', '/pricing/calculate', priceCalculation, true, token);
    
    // Create quotation
    const quotation = {
      userId: 1,
      productId: 1,
      quotedValue: 1500.50,
      currency: 'USD'
    };
    await this.makeRequest('POST', '/pricing/quote', quotation, true, token);
    
    // Update metal rates (admin only)
    if (TEST_USERS.admin.token) {
      await this.makeRequest('POST', '/pricing/update-rates', {}, true, TEST_USERS.admin.token);
    }
  }

  /**
   * Test product management endpoints
   */
  private async testProductManagement(): Promise<void> {
    console.log('📦 Testing Product Management...');
    
    const token = TEST_USERS.user.token || TEST_USERS.admin.token;
    
    if (!token) {
      console.log('⚠️  Skipping product tests - no authenticated user');
      return;
    }
    
    // Get all products
    await this.makeRequest('GET', '/products', {}, true, token);
    
    // Create new product
    const newProduct = {
      nombre: 'Test Product',
      descripcion: 'A test product for system validation',
      categoria: 'test',
      componentes: [
        { metalId: 1, porcentaje: 60 }, // Assuming XPD
        { metalId: 2, porcentaje: 40 }  // Assuming XPT
      ]
    };
    const createProductResult = await this.makeRequest('POST', '/products', newProduct, true, token);
    
    let productId = 1;
    if (createProductResult.success && createProductResult.data?.id) {
      productId = createProductResult.data.id;
    }
    
    // Get specific product
    await this.makeRequest('GET', `/products/${productId}`, {}, true, token);
    
    // Update product
    const productUpdate = {
      descripcion: 'Updated test product description'
    };
    await this.makeRequest('PUT', `/products/${productId}`, productUpdate, true, token);
    
    // Calculate product price
    const priceCalc = {
      userId: 1
    };
    await this.makeRequest('POST', `/products/${productId}/calculate-price`, priceCalc, true, token);
  }

  /**
   * Test quotation system endpoints
   */
  private async testQuotationSystem(): Promise<void> {
    console.log('📋 Testing Quotation System...');
    
    const token = TEST_USERS.user.token || TEST_USERS.admin.token;
    
    if (!token) {
      console.log('⚠️  Skipping quotation tests - no authenticated user');
      return;
    }
    
    // Get user quotations
    await this.makeRequest('GET', '/quotations', {}, true, token);
    
    // Create new quotation
    const newQuotation = {
      productId: 1,
      cantidad: 100,
      notas: 'Test quotation for system validation'
    };
    const createQuotationResult = await this.makeRequest('POST', '/quotations', newQuotation, true, token);
    
    let quotationId = 1;
    if (createQuotationResult.success && createQuotationResult.data?.id) {
      quotationId = createQuotationResult.data.id;
    }
    
    // Get specific quotation
    await this.makeRequest('GET', `/quotations/${quotationId}`, {}, true, token);
    
    // Update quotation status
    const statusUpdate = {
      estado: 'aprobada'
    };
    await this.makeRequest('PUT', `/quotations/${quotationId}`, statusUpdate, true, token);
  }

  /**
   * Make HTTP request and record result
   */
  private async makeRequest(
    method: string, 
    endpoint: string, 
    data: any = {}, 
    requiresAuth: boolean = false,
    token?: string
  ): Promise<any> {
    const startTime = Date.now();
    
    try {
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (requiresAuth && token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers,
        data: method !== 'GET' ? data : undefined,
        timeout: 10000
      };
      
      const response = await axios(config);
      const responseTime = Date.now() - startTime;
      
      this.results.push({
        endpoint: `${method} ${endpoint}`,
        method,
        success: true,
        statusCode: response.status,
        responseTime
      });
      
      console.log(`  ✅ ${method} ${endpoint} - ${response.status} (${responseTime}ms)`);
      return { success: true, data: response.data };
      
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const statusCode = error.response?.status || 0;
      const errorMessage = error.response?.data?.message || error.message;
      
      this.results.push({
        endpoint: `${method} ${endpoint}`,
        method,
        success: false,
        statusCode,
        error: errorMessage,
        responseTime
      });
      
      console.log(`  ❌ ${method} ${endpoint} - ${statusCode} ${errorMessage} (${responseTime}ms)`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Print test results summary
   */
  private printResults(): void {
    console.log('\n📊 Test Results Summary');
    console.log('='.repeat(50));
    
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const averageResponseTime = Math.round(
      this.results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests
    );
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Successful: ${successfulTests} (${Math.round((successfulTests / totalTests) * 100)}%)`);
    console.log(`❌ Failed: ${failedTests} (${Math.round((failedTests / totalTests) * 100)}%)`);
    console.log(`⏱️  Average Response Time: ${averageResponseTime}ms`);
    
    // Show failed tests details
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  ${r.endpoint} - ${r.statusCode} ${r.error}`);
        });
    }
    
    // Performance analysis
    console.log('\n⚡ Performance Analysis:');
    const slowTests = this.results.filter(r => r.responseTime > 1000);
    if (slowTests.length > 0) {
      console.log('  🐌 Slow endpoints (>1s):');
      slowTests.forEach(r => {
        console.log(`    ${r.endpoint} - ${r.responseTime}ms`);
      });
    } else {
      console.log('  ⚡ All endpoints responding quickly (<1s)');
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Fix any failed endpoints');
    console.log('2. Set up your metals API key in .env');
    console.log('3. Create initial test data (companies, users, products)');
    console.log('4. Run integration tests with frontend');
    console.log('\n✨ Happy coding!');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new SystemTester();
  tester.runTests().catch(console.error);
}

export { SystemTester };
