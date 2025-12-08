import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Admin from '../models/Admin.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { sendVerificationEmail } from '../utils/emailService.js';
import crypto from 'crypto';

const generateEmailVerificationToken = () => {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return { verificationToken, verificationTokenExpires };
};

// Get Admin Profile
export const getAdminProfile = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.user._id).select('-passwordHash -refreshToken');
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }
    return res.status(200).json(new ApiResponse(200, admin, "Admin profile fetched successfully"));
});

// Update Admin Profile (Name, Email, Phone)
export const updateAdminProfile = asyncHandler(async (req, res) => {
    const { name, email, phone_no } = req.body;

    if (!name && !email && !phone_no) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const admin = await Admin.findById(req.user._id);
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    if (email && email !== admin.email) {
        const existingEmail = await Admin.findOne({ email });
        if (existingEmail) throw new ApiError(409, "Email already in use");
        admin.email = email;
    }

    if (phone_no && phone_no !== admin.phone_no) {
        const existingPhone = await Admin.findOne({ phone_no });
        if (existingPhone) throw new ApiError(409, "Phone number already in use");
        admin.phone_no = phone_no;
    }

    if (name) admin.name = name;

    await admin.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, admin, "Profile updated successfully"));
});

// Update Profile Image
export const updateAdminProfileImage = asyncHandler(async (req, res) => {
    if (!req.file?.path) throw new ApiError(400, "Profile image required");

    const admin = await Admin.findById(req.user._id);
    if (!admin) throw new ApiError(404, "Admin not found");

    const uploadRes = await uploadOnCloudinary(req.file.path, "image");

    if (!uploadRes.secure_url) {
        throw new ApiError(500, "Error uploading image");
    }

    admin.profilePhoto = uploadRes.secure_url;
    await admin.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, { profilePhoto: admin.profilePhoto }, "Profile photo updated successfully"));
});

// Change Password
export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old and new password are required");
    }

    const admin = await Admin.findById(req.user._id);
    if (!admin) throw new ApiError(404, "Admin not found");

    const isPasswordCorrect = await admin.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    admin.passwordHash = newPassword;
    await admin.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Resend Verification Link
export const resendVerificationLink = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    if (admin.isVerified) {
        throw new ApiError(400, "Account is already verified");
    }

    const { verificationToken, verificationTokenExpires } = generateEmailVerificationToken();

    admin.emailVerificationToken = verificationToken;
    admin.emailVerificationTokenExpires = verificationTokenExpires;
    await admin.save({ validateBeforeSave: false });

    await sendVerificationEmail(admin.email, verificationToken, "admin");

    return res.status(200).json(new ApiResponse(200, null, "Verification link sent successfully"));
});
