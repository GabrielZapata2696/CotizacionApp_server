import { Sequelize } from 'sequelize';
import { config } from './index';

export const sequelize = new Sequelize({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.username,
  password: config.database.password,
  dialect: 'postgres',
  logging: config.nodeEnv === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: false,
    underscored: false,
    freezeTableName: true,
  },
  dialectOptions: {
    ssl: config.nodeEnv === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Skip database sync since we're working with existing data
    // if (config.nodeEnv === 'development') {
    //   await sequelize.sync({ alter: true });
    //   console.log('Database synchronized.');
    // }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};
