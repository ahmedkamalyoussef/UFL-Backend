import { sequelize } from '../config/database';
import '../models'; // Ensure all models and associations are registered

async function runMigrations() {
  console.log('[Sequelize Migration] Connecting to MySQL database...');
  try {
    await sequelize.authenticate();
    console.log('[Sequelize Migration] Connection established successfully.');

    console.log('[Sequelize Migration] Synchronizing database tables and constraints...');
    // Sync models to MySQL database (force: false, alter: true)
    await sequelize.sync({ alter: true });
    console.log('[Sequelize Migration] All 16 database models migrated successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('[Sequelize Migration Error] Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
