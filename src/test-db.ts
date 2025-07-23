import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const testConnection = async () => {
  console.log('🔍 Testing PostgreSQL connection...');
  console.log(`📍 Host: ${process.env.DB_HOST}`);
  console.log(`📊 Database: ${process.env.DB_NAME}`);
  console.log(`👤 Username: ${process.env.DB_USERNAME}`);
  console.log(`🔑 Password: ${process.env.DB_PASSWORD ? 'Set' : 'NOT SET'}`);
  
  const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    logging: console.log
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully!');
    
    // Get database info
    const [results] = await sequelize.query(`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        version() as version
    `);
    
    console.log('📊 Database Info:', results[0]);
    
    // Get existing tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Existing tables:', tables.map((t: any) => t.table_name));
    
    await sequelize.close();
    console.log('🔐 Database connection closed.');
    
  } catch (error: any) {
    console.error('❌ Unable to connect to the database:');
    console.error('Error:', error.message);
    
    if (error.message && error.message.includes('authentication failed')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check your PostgreSQL password in .env file');
      console.log('2. Make sure PostgreSQL is running');
      console.log('3. Verify database name exists: 3754403_sitekol');
      console.log('4. Check if user "postgres" has access to the database');
    }
  }
};

testConnection();
