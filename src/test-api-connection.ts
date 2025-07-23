import axios from 'axios';
import { config } from './config';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

/**
 * Test MetalPriceAPI connection
 */
async function testMetalPriceAPI(): Promise<void> {
  console.log('🧪 Testing MetalPriceAPI Connection...');
  console.log('='.repeat(50));
  
  try {
    const url = `${config.metalRates.apiUrl}?api_key=${config.metalRates.apiKey}&base=${config.metalRates.baseCurrency}&currencies=${config.metalRates.currencies}`;
    
    console.log(`🔗 API URL: ${config.metalRates.apiUrl}`);
    console.log(`🔑 API Key: ${config.metalRates.apiKey.substring(0, 8)}...`);
    console.log(`💰 Base Currency: ${config.metalRates.baseCurrency}`);
    console.log(`🏭 Currencies: ${config.metalRates.currencies}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'SITEKOL-Backend/1.0'
      }
    });
    
    const data = response.data;
    
    if (data.success) {
      console.log('\n✅ API Connection Successful!');
      console.log(`📅 Timestamp: ${new Date(data.timestamp * 1000).toISOString()}`);
      console.log(`💵 Base: ${data.base}`);
      console.log('\n💎 Current Metal Rates:');
      
      Object.entries(data.rates).forEach(([metal, rate]) => {
        const metalName = getMetalName(metal);
        console.log(`  ${metal} (${metalName}): $${rate}`);
      });
      
      // Calculate estimated Rhodium price
      const platinumPrice = data.rates.XPT;
      const estimatedRhodium = platinumPrice * 4.5;
      console.log(`  XRH (Rhodium - estimated): $${estimatedRhodium.toFixed(2)}`);
      
    } else {
      console.log('❌ API Request Failed:', data);
    }
    
  } catch (error: any) {
    console.error('❌ API Connection Failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.status === 401) {
      console.log('\n💡 Authentication Error - Check your API key');
    } else if (error.response?.status === 429) {
      console.log('\n⚠️ Rate limit exceeded - You\'ve used all 100 API calls for this month');
    }
  }
}

/**
 * Test database connection
 */
async function testDatabaseConnection(): Promise<void> {
  console.log('\n\n🗄️ Testing Database Connection...');
  console.log('='.repeat(50));
  
  try {
    console.log(`🔗 Host: ${config.database.host}:${config.database.port}`);
    console.log(`📊 Database: ${config.database.name}`);
    console.log(`👤 Username: ${config.database.username}`);
    
    await connectDatabase();
    console.log('✅ Database Connection Successful!');
    
  } catch (error: any) {
    console.error('❌ Database Connection Failed:', error.message);
    console.log('\n💡 Make sure PostgreSQL is running and database exists');
    console.log('   You can create the database with: CREATE DATABASE sitekol_dev;');
  }
}

/**
 * Get human-readable metal names
 */
function getMetalName(symbol: string): string {
  const metals: { [key: string]: string } = {
    'XAU': 'Gold',
    'XAG': 'Silver',
    'XPD': 'Palladium',
    'XPT': 'Platinum',
    'XRH': 'Rhodium',
    'EUR': 'Euro'
  };
  return metals[symbol] || symbol;
}

/**
 * Main test function
 */
async function runTests(): Promise<void> {
  console.log('🚀 SITEKOL API & Database Connection Test');
  console.log('='.repeat(70));
  console.log('This script will test your MetalPriceAPI and database connections\n');
  
  // Test API first
  await testMetalPriceAPI();
  
  // Test database
  await testDatabaseConnection();
  
  console.log('\n\n🎯 Next Steps:');
  console.log('1. If API test passed: Your metals API is ready! ✅');
  console.log('2. If DB test passed: Your database is ready! ✅');
  console.log('3. Start the server with: npm run dev');
  console.log('4. Run full system tests with: npm run test:system');
  
  console.log('\n📊 API Usage Tips:');
  console.log('• You have 100 API calls per month');
  console.log('• Rates are cached for 30 minutes to save calls');
  console.log('• Database stores rates for 2+ hours to minimize API usage');
  console.log('• Fallback rates are used if API is unavailable');
  
  process.exit(0);
}

// Run tests
runTests().catch((error) => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
