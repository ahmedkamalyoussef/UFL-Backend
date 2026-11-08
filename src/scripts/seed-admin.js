"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const models_1 = require("../models");
const password_1 = require("../utils/password");

async function seedAdmin() {
    console.log('[Seed Admin] Connecting to database...');
    try {
        await database_1.sequelize.authenticate();
        console.log('[Seed Admin] Synchronizing Ad and User tables...');
        await models_1.User.sync({ alter: true });
        await models_1.Ad.sync();

        const adminEmail = 'a@gmail.com';
        const adminPassword = '123456';
        const hashedPassword = await (0, password_1.hashPassword)(adminPassword);

        let admin = await models_1.User.findOne({ where: { email: adminEmail } });

        if (admin) {
            console.log(`[Seed Admin] User ${adminEmail} already exists. Updating credentials and role...`);
            admin.passwordHash = hashedPassword;
            admin.role = 'admin';
            await admin.save();
        }
        else {
            console.log(`[Seed Admin] Creating admin user ${adminEmail}...`);
            admin = await models_1.User.create({
                username: 'admin',
                email: adminEmail,
                passwordHash: hashedPassword,
                role: 'admin',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=admin',
            });
        }

        let wallet = await models_1.Wallet.findOne({ where: { userId: admin.id } });
        if (!wallet) {
            wallet = await models_1.Wallet.create({
                userId: admin.id,
                balance: 10000,
                careerCoins: 10000,
            });
            console.log('[Seed Admin] Created wallet for admin with 10,000 coins.');
        }

        console.log(`[Seed Admin] SUCCESS! Admin ready:`);
        console.log(`  Email: ${adminEmail}`);
        console.log(`  Password: ${adminPassword}`);
        console.log(`  Role: ${admin.role}`);

        process.exit(0);
    }
    catch (error) {
        console.error('[Seed Admin Error]:', error);
        process.exit(1);
    }
}

seedAdmin();

