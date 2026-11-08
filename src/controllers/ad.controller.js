"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdController = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs_1 = require("fs");
const path_1 = require("path");
const ad_service_1 = require("../services/ad.service");
const response_1 = require("../utils/response");

const execAsync = (0, util_1.promisify)(child_process_1.exec);

async function ensureH264Faststart(filePath) {
    const ext = (0, path_1.extname)(filePath);
    const tempOutput = filePath.replace(ext, '-opt.mp4');
    try {
        await execAsync(`ffmpeg -i "${filePath}" -c:v libx264 -pix_fmt yuv420p -preset veryfast -crf 23 -c:a aac -b:a 128k -movflags +faststart -y "${tempOutput}"`);
        if ((0, fs_1.existsSync)(tempOutput)) {
            (0, fs_1.unlinkSync)(filePath);
            (0, fs_1.renameSync)(tempOutput, filePath);
        }
    }
    catch (err) {
        console.warn('[Video Optimization] ffmpeg transcode failed, using original file:', err);
        if ((0, fs_1.existsSync)(tempOutput)) {
            try {
                (0, fs_1.unlinkSync)(tempOutput);
            }
            catch (_) { }
        }
    }
    return filePath;
}

class AdController {
    static async getAllAds(req, res, next) {
        try {
            const ads = await ad_service_1.AdService.getAllAds();
            (0, response_1.sendSuccess)(res, ads, 200);
        }
        catch (error) {
            next(error);
        }
    }

    static async getAdById(req, res, next) {
        try {
            const ad = await ad_service_1.AdService.getAdById(req.params.id);
            if (!ad) {
                (0, response_1.sendError)(res, 'AD_NOT_FOUND', 'Ad not found', 404);
                return;
            }
            (0, response_1.sendSuccess)(res, ad, 200);
        }
        catch (error) {
            next(error);
        }
    }

    static async createAd(req, res, next) {
        try {
            const { title, description, videoUrl, linkUrl, rewardCoins, isActive, startDate, endDate } = req.body;
            if (!title || !videoUrl) {
                (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Title and videoUrl are required', 400);
                return;
            }

            const ad = await ad_service_1.AdService.createAd({
                title,
                description,
                videoUrl,
                linkUrl,
                rewardCoins: rewardCoins ? parseInt(rewardCoins, 10) : 500,
                isActive: isActive !== undefined ? Boolean(isActive) : true,
                startDate: startDate || null,
                endDate: endDate || null,
            });

            (0, response_1.sendSuccess)(res, ad, 201);
        }
        catch (error) {
            next(error);
        }
    }

    static async updateAd(req, res, next) {
        try {
            const { title, description, videoUrl, linkUrl, rewardCoins, isActive, startDate, endDate } = req.body;

            const ad = await ad_service_1.AdService.updateAd(req.params.id, {
                title,
                description,
                videoUrl,
                linkUrl,
                rewardCoins: rewardCoins !== undefined ? parseInt(rewardCoins, 10) : undefined,
                isActive: isActive !== undefined ? Boolean(isActive) : undefined,
                startDate,
                endDate,
            });

            (0, response_1.sendSuccess)(res, ad, 200);
        }
        catch (error) {
            next(error);
        }
    }

    static async deleteAd(req, res, next) {
        try {
            await ad_service_1.AdService.deleteAd(req.params.id);
            (0, response_1.sendSuccess)(res, { message: 'Ad deleted successfully' }, 200);
        }
        catch (error) {
            next(error);
        }
    }

    static async getRandomAd(req, res, next) {
        try {
            const ad = await ad_service_1.AdService.getRandomActiveAd();
            if (!ad) {
                (0, response_1.sendSuccess)(res, null, 200);
                return;
            }
            (0, response_1.sendSuccess)(res, ad, 200);
        }
        catch (error) {
            next(error);
        }
    }

    static async uploadVideo(req, res, next) {
        try {
            if (!req.file) {
                (0, response_1.sendError)(res, 'NO_FILE', 'No video file provided', 400);
                return;
            }

            await ensureH264Faststart(req.file.path);

            const videoUrl = `/uploads/videos/${req.file.filename}`;
            (0, response_1.sendSuccess)(res, {
                videoUrl,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
            }, 201);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdController = AdController;
