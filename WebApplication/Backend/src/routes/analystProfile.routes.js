import { Router } from 'express';
import {
    getAnalystProfile,
    updateAnalystProfile,
    updateAnalystProfileImage,
    changePassword,
    resendVerificationLink
} from '../controllers/analystProfile.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.use(verifyJWT); // Protect all routes

router.route('/')
    .get(getAnalystProfile)
    .put(updateAnalystProfile);

router.route('/image')
    .put(upload.single('profilePhoto'), updateAnalystProfileImage);

router.route('/password')
    .put(changePassword);

router.route('/resend-verification')
    .post(resendVerificationLink);

export default router;
