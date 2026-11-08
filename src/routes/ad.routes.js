"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ad_controller_1 = require("../controllers/ad.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");

const router = (0, express_1.Router)();

// Ensure upload directory exists
const uploadDir = path_1.default.join(__dirname, '../../uploads/videos');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `video-${uniqueSuffix}${ext}`);
    },
});

const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.originalname)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only video files are allowed'));
        }
    },
});

// Public / Player route for getting a random active ad
router.get('/random', ad_controller_1.AdController.getRandomAd);

// Admin-only management routes
router.get('/', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, ad_controller_1.AdController.getAllAds);
router.post('/upload', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, upload.single('video'), ad_controller_1.AdController.uploadVideo);
router.get('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, ad_controller_1.AdController.getAdById);
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, ad_controller_1.AdController.createAd);
router.put('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, ad_controller_1.AdController.updateAd);
router.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, ad_controller_1.AdController.deleteAd);

exports.default = router;
