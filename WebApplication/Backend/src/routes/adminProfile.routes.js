import { Router } from 'express';
import {
    getAdminProfile,
    updateAdminProfile,
    updateAdminProfileImage,
    changePassword,
    resendVerificationLink
} from '../controllers/adminProfile.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/')
    .get(getAdminProfile)
    .put(updateAdminProfile);

router.route('/image')
    .put(upload.single('profilePhoto'), updateAdminProfileImage);

router.route('/password')
    .put(changePassword);

router.route('/resend-verification')
    .post(resendVerificationLink);

export default router;
