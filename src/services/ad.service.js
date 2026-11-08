"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdService = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const models_1 = require("../models");
const fs = require("fs");
const path = require("path");

class AdService {
    static async createAd(input) {
        return await models_1.Ad.create({
            title: input.title,
            description: input.description || null,
            videoUrl: input.videoUrl,
            linkUrl: input.linkUrl ? input.linkUrl.trim() : null,
            rewardCoins: input.rewardCoins || 500,
            isActive: input.isActive !== undefined ? input.isActive : true,
            startDate: input.startDate ? new Date(input.startDate) : null,
            endDate: input.endDate ? new Date(input.endDate) : null,
        });
    }

    static async getAllAds() {
        const ads = await models_1.Ad.findAll({
            order: [['createdAt', 'DESC']],
        });

        const now = new Date();
        return ads.map((ad) => {
            const isExpired = ad.endDate ? now > new Date(ad.endDate) : false;
            let isEffectiveActive = ad.isActive && !isExpired;
            if (ad.startDate && now < new Date(ad.startDate)) {
                isEffectiveActive = false;
            }

            return {
                ...ad.toJSON(),
                isExpired,
                isEffectiveActive,
            };
        });
    }

    static async getAdById(id) {
        return await models_1.Ad.findByPk(id);
    }

    static async updateAd(id, input) {
        const ad = await models_1.Ad.findByPk(id);
        if (!ad) {
            throw { code: 'AD_NOT_FOUND', message: 'Ad not found', statusCode: 404 };
        }

        if (input.title !== undefined) ad.title = input.title;
        if (input.description !== undefined) ad.description = input.description;
        if (input.videoUrl !== undefined) ad.videoUrl = input.videoUrl;
        if (input.linkUrl !== undefined) ad.linkUrl = input.linkUrl ? input.linkUrl.trim() : null;
        if (input.rewardCoins !== undefined) ad.rewardCoins = input.rewardCoins;
        if (input.isActive !== undefined) ad.isActive = input.isActive;
        if (input.startDate !== undefined) ad.startDate = input.startDate ? new Date(input.startDate) : null;
        if (input.endDate !== undefined) ad.endDate = input.endDate ? new Date(input.endDate) : null;

        await ad.save();
        return ad;
    }

    static async deleteAd(id) {
        const ad = await models_1.Ad.findByPk(id);
        if (!ad) {
            throw { code: 'AD_NOT_FOUND', message: 'Ad not found', statusCode: 404 };
        }

        // Physically delete video file from server storage to free disk space
        if (ad.videoUrl && ad.videoUrl.includes('/uploads/')) {
            try {
                const urlPath = ad.videoUrl.split('?')[0];
                const filename = path.basename(urlPath);
                const uploadDir = path.join(__dirname, '../../uploads/videos');
                const filePath = path.join(uploadDir, filename);

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`[Storage Cleanup] Permanently deleted video file: ${filePath}`);
                }
            } catch (err) {
                console.error('[Storage Cleanup Error] Failed to delete physical video file:', err);
            }
        }

        await ad.destroy();
    }

    static async getRandomActiveAd() {
        const now = new Date();

        const ad = await models_1.Ad.findOne({
            where: {
                isActive: true,
                [sequelize_1.Op.and]: [
                    {
                        [sequelize_1.Op.or]: [
                            { startDate: null },
                            { startDate: { [sequelize_1.Op.lte]: now } },
                        ],
                    },
                    {
                        [sequelize_1.Op.or]: [
                            { endDate: null },
                            { endDate: { [sequelize_1.Op.gte]: now } },
                        ],
                    },
                ],
            },
            order: database_1.sequelize.literal('RAND()'),
        });

        if (ad) {
            await ad.increment('viewsCount');
        }

        return ad;
    }

    static async rewardUserForAd(userId, adId) {
        if (!adId) {
            throw { code: 'AD_REQUIRED', message: 'Valid ad ID is required', statusCode: 400 };
        }

        const user = await models_1.User.findByPk(userId);
        if (!user) {
            throw { code: 'USER_NOT_FOUND', message: 'User not found', statusCode: 404 };
        }

        if (user.role === 'admin') {
            throw { code: 'ADMIN_NO_REWARD', message: 'Admin accounts cannot earn ad rewards', statusCode: 403 };
        }

        const ad = await models_1.Ad.findByPk(adId);
        if (!ad || !ad.isActive) {
            throw { code: 'AD_NOT_FOUND', message: 'Active ad not found', statusCode: 404 };
        }

        const now = new Date();
        if (ad.endDate && now > new Date(ad.endDate)) {
            throw { code: 'AD_EXPIRED', message: 'This ad has expired', statusCode: 400 };
        }

        const rewardCoins = ad.rewardCoins;

        const wallet = await models_1.Wallet.findOne({ where: { userId } });
        if (!wallet) {
            throw { code: 'WALLET_NOT_FOUND', message: 'Wallet not found for user', statusCode: 404 };
        }

        const result = await database_1.sequelize.transaction(async (t) => {
            wallet.balance += rewardCoins;
            wallet.careerCoins += rewardCoins;
            await wallet.save({ transaction: t });

            await ad.increment('completionsCount', { transaction: t });

            const transaction = await models_1.WalletTransaction.create({
                walletId: wallet.id,
                amount: rewardCoins,
                type: 'REWARDED_AD',
                referenceId: ad.id,
                description: `Watched Rewarded Video Ad (+${rewardCoins} Coins)`,
            }, { transaction: t });

            return {
                rewardCoins,
                balance: wallet.balance,
                careerCoins: wallet.careerCoins,
                transaction,
            };
        });

        return result;
    }
}
exports.AdService = AdService;

