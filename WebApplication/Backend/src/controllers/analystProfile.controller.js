import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Analyst from '../models/Analyst.models.js';
import { uploadOnCloudinary, deleteImageOnCloudinary } from '../utils/cloudinary.js';
import { sendVerificationEmail } from '../utils/emailService.js';
import crypto from 'crypto';

const generateEmailVerificationToken = () => {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return { verificationToken, verificationTokenExpires };
};

// Get Analyst Profile
export const getAnalystProfile = asyncHandler(async (req, res) => {
    const analyst = await Analyst.findById(req.user._id).select('-passwordHash -refreshToken');
    if (!analyst) {
        throw new ApiError(404, "Analyst not found");
    }
    return res.status(200).json(new ApiResponse(200, analyst, "Analyst profile fetched successfully"));
});

// Update Analyst Profile (Name, Email, Phone)
export const updateAnalystProfile = asyncHandler(async (req, res) => {
    const { name, email, phone_no } = req.body;

    // Validation (Basic)
    if (!name && !email && !phone_no) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const analyst = await Analyst.findById(req.user._id);
    if (!analyst) {
        throw new ApiError(404, "Analyst not found");
    }

    // Check availability if email/phone changed
    if (email && email !== analyst.email) {
        const existingEmail = await Analyst.findOne({ email });
        if (existingEmail) throw new ApiError(409, "Email already in use");
        analyst.email = email;
    }

    if (phone_no && phone_no !== analyst.phone_no) {
        const existingPhone = await Analyst.findOne({ phone_no });
        if (existingPhone) throw new ApiError(409, "Phone number already in use");
        analyst.phone_no = phone_no;
    }

    if (name) analyst.name = name;

    await analyst.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, analyst, "Profile updated successfully"));
});

// Update Profile Image
export const updateAnalystProfileImage = asyncHandler(async (req, res) => {
    if (!req.file?.path) throw new ApiError(400, "Profile image required");

    const analyst = await Analyst.findById(req.user._id);
    if (!analyst) throw new ApiError(404, "Analyst not found");

    // Delete old image if it's not the default one (optional, good practice)
    if (analyst.profilePhoto && !analyst.profilePhoto.includes("default-profile-image")) {
        // Assuming logic to extract public_id or delete by url is handled in utils
        // await deleteImageOnCloudinary(analyst.profilePhoto);
    }

    const uploadRes = await uploadOnCloudinary(req.file.path, "image");

    if (!uploadRes.secure_url) {
        throw new ApiError(500, "Error uploading image");
    }

    analyst.profilePhoto = uploadRes.secure_url;
    await analyst.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, { profilePhoto: analyst.profilePhoto }, "Profile photo updated successfully"));
});

// Change Password
export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old and new password are required");
    }

    const analyst = await Analyst.findById(req.user._id);
    if (!analyst) throw new ApiError(404, "Analyst not found");

    const isPasswordCorrect = await analyst.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    // Manually hash since we are using save (pre-save hook might re-hash if we just set it)
    analyst.passwordHash = newPassword;
    await analyst.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Resend Verification Link
export const resendVerificationLink = asyncHandler(async (req, res) => {
    const analyst = await Analyst.findById(req.user._id);
    if (!analyst) {
        throw new ApiError(404, "Analyst not found");
    }

    if (analyst.isVerified) {
        throw new ApiError(400, "Account is already verified");
    }

    const { verificationToken, verificationTokenExpires } = generateEmailVerificationToken();

    analyst.emailVerificationToken = verificationToken;
    analyst.emailVerificationTokenExpires = verificationTokenExpires;
    await analyst.save({ validateBeforeSave: false });

    await sendVerificationEmail(analyst.email, verificationToken, "analyst");

    return res.status(200).json(new ApiResponse(200, null, "Verification link sent successfully"));
});
