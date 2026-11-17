"use strict";

const { sequelize } = require("../config/database");
const { User, Wallet, WalletTransaction } = require("../models");
const { hashPassword } = require("../utils/password");

const emails = [
    "wafaamohhala@gmail.com",
    "ziadrajab7749@gmail.com",
    "areejameer222@gmail.com",
    "ahmedelgamalwork55@gmail.com",
    "abaysd123456789@gmail.com",
    "mazen.ashour100@gmail.com",
    "hanahany77hanahany@gmail.com",
    "othmanomarothmanomar55@gmail.com",
    "redamohkeskh14@gmail.com",
    "abdulftah1234567@gmail.com",
    "marioomalsaidi44@gmail.com",
    "salomasalomasalem88@gmail.com",
    "nadanader987987@gmail.com",
    "ahmedhamad7600@gmail.com",
    "abaysd123456@gmail.com",
    "yossefwaleedelkilany@gmail.com",
    "shymadakamby5@gmail.com",
    "mahaalimahaali5599@gmail.com",
    "abdulftah123456@gmail.com",
    "alihatemalgamal66@gmail.com",
    "abeeromaromran@gmail.com",
    "moustafanora6@gmail.com",
    "fatoommuhamed4477@gmail.com",
    "khadijahkamal77@gmail.com",
    "ayishammar55@gmail.com",
    "muhammadreda966@gmail.com",
    "muhammadredamuhammad44@gmail.com",
    "mamaamam1209@gmail.com",
    "rayhanaredamuhammad22@gmail.com",
];

async function findAvailableUsername(email) {
    const base = email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
    const usernameBase = base.length >= 3 ? base : `user_${base}`;
    let username = usernameBase.slice(0, 50);
    let suffix = 1;

    while (await User.findOne({ where: { username }, attributes: ["id"] })) {
        suffix += 1;
        const suffixText = `_${suffix}`;
        username = `${usernameBase.slice(0, 50 - suffixText.length)}${suffixText}`;
    }

    return username;
}

async function seedUsers() {
    const password = process.env.BULK_USER_PASSWORD;
    if (!password || password.length < 6) {
        throw new Error("Set BULK_USER_PASSWORD to a password of at least 6 characters.");
    }

    await sequelize.authenticate();
    const passwordHash = await hashPassword(password);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const email of emails) {
        try {
            const existingUser = await User.findOne({ where: { email }, attributes: ["id"] });
            if (existingUser) {
                console.log(`[Seed Users] Skipped existing account: ${email}`);
                skipped += 1;
                continue;
            }

            const username = await findAvailableUsername(email);

            await sequelize.transaction(async (transaction) => {
                const user = await User.create(
                    { username, email, passwordHash, role: "user" },
                    { transaction },
                );
                const wallet = await Wallet.create(
                    { userId: user.id, balance: 500, careerCoins: 500 },
                    { transaction },
                );
                await WalletTransaction.create(
                    {
                        walletId: wallet.id,
                        amount: 500,
                        type: "WELCOME_BONUS",
                        referenceId: `welcome-bonus-${user.id}`,
                        description: "Welcome Bonus (+500 Coins)",
                    },
                    { transaction },
                );
            });

            console.log(`[Seed Users] Created ${email} (username: ${username})`);
            created += 1;
        } catch (error) {
            console.error(`[Seed Users] Failed for ${email}:`, error);
            failed += 1;
        }
    }

    console.log(`[Seed Users] Finished. Created: ${created}, skipped: ${skipped}, failed: ${failed}`);
    if (failed > 0) {
        process.exitCode = 1;
    }
}

async function main() {
    try {
        await seedUsers();
    } catch (error) {
        console.error("[Seed Users] Script failed:", error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

main().catch((error) => {
    console.error("[Seed Users] Could not close the database connection:", error);
    process.exitCode = 1;
});
