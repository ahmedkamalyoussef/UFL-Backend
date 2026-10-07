"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
require("../models"); // Ensure all models and associations are registered
async function runMigrations() {
    console.log('[Sequelize Migration] Connecting to MySQL database...');
    try {
        await database_1.sequelize.authenticate();
        console.log('[Sequelize Migration] Connection established successfully.');
        console.log('[Sequelize Migration] Synchronizing database tables and constraints...');
        // Sync models to MySQL database (force: false, alter: true)
        await database_1.sequelize.sync({ alter: true });
        console.log('[Sequelize Migration] All 16 database models migrated successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('[Sequelize Migration Error] Migration failed:', error);
        process.exit(1);
    }
}
runMigrations();
