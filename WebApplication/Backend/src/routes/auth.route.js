import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    registerAnalyst,
    registerAdmin,
    login,
    logout,
    refreshAccessToken,
    verifyAuth,
    updateUserProfileImage,
    verifyEmail,
    googleLogin,
    registerGoogle,
    getCurrentUser,
    getProfileImage
} from '../controllers/auth.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post("/register/analyst", upload.single("profilePhoto"), registerAnalyst);
router.post("/register/admin", upload.single("profilePhoto"), registerAdmin);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.get('/me', verifyJWT, getCurrentUser);

// Protected routes
router.post('/logout', authMiddleware, logout);
router.get('/verify', verifyAuth); // Changed to GET as it's a check
router.post("/update-profile-image", authMiddleware, upload.single("profilePhoto"), updateUserProfileImage);
router.get("/verify-email", verifyEmail);
router.post("/google-login", googleLogin);
router.post("/google-register", upload.single("profilePhoto"), registerGoogle);
router.get('/me', authMiddleware, getCurrentUser);
router.get('/profile-image', authMiddleware, getProfileImage);
export default router;
