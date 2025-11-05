import { Sequelize } from 'sequelize';
import { config } from './index';
import logger from '../utils/logger';

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: config.database.pool.max,
      min: config.database.pool.min,
      acquire: config.database.pool.acquire,
      idle: config.database.pool.idle,
    },
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true, // Soft deletes
    },
  }
);

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    logger.info('Using init.sql for database schema management');

    // Note: We don't use sequelize.sync() anymore
    // The database schema is managed by /backend/database/init.sql
    // To rebuild the database: docker compose down -v && docker compose up -d
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
};

export default sequelize;
