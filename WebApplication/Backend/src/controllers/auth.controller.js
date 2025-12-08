import Admin from '../models/Admin.models.js';
import Analyst from '../models/Analyst.models.js';
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import crypto from 'crypto';
import { uploadOnCloudinary, deleteImageOnCloudinary } from '../utils/cloudinary.js';
import { sendVerificationEmail } from '../utils/emailService.js';


const generateEmailVerificationToken = () => {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return { verificationToken, verificationTokenExpires };
};

const generateAccessAndRefereshTokens = async (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token");
    }
};

const setTokenCookies = (res, accessToken, refreshToken) => {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res.cookie('accessToken', accessToken, { ...options, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

const clearTokenCookies = (res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
};


export const registerAnalyst = asyncHandler(async (req, res) => {
    const { name, email, phone_no, password } = req.body;

    if (!name || !email || !phone_no || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await Analyst.findOne({
        $or: [{ email }, { phone_no }]
    });

    if (existingUser) {
        throw new ApiError(400, 'Analyst with this email or phone already exists');
    }

    let profilePhotoUrl = "https://res.cloudinary.com/famly/image/upload/v1759747438/default-profile-image_p9e5ln.jpg";

    if (req.file?.path) {
        const uploadRes = await uploadOnCloudinary(req.file.path, "image");
        if (uploadRes?.secure_url) profilePhotoUrl = uploadRes.secure_url;
    }

    // 1️⃣ Generate verification token
    const { verificationToken, verificationTokenExpires } = generateEmailVerificationToken();

    // 2️⃣ Create Analyst
    const user = await Analyst.create({
        name,
        email,
        phone_no,
        passwordHash: password,
        profilePhoto: profilePhotoUrl,
        role: 'analyst',
        isVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: verificationTokenExpires
    });

    // 3️⃣ Send Email
    await sendVerificationEmail(user.email, verificationToken, "analyst");

    return res.status(201).json(
        new ApiResponse(201, {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }, "Analyst registered. Please verify your email to activate your account.")
    );
});

export const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, phone_no, password } = req.body;

    if (!name || !email || !phone_no || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await Admin.findOne({
        $or: [{ email }, { phone_no }]
    });

    if (existingUser) {
        throw new ApiError(400, 'Admin with this email or phone already exists');
    }

    let profilePhotoUrl = "https://res.cloudinary.com/famly/image/upload/v1759747438/default-profile-image_p9e5ln.jpg";

    if (req.file?.path) {
        const uploadRes = await uploadOnCloudinary(req.file.path, "image");
        if (uploadRes?.secure_url) profilePhotoUrl = uploadRes.secure_url;
    }

    // 1️⃣ Generate verification token
    const { verificationToken, verificationTokenExpires } = generateEmailVerificationToken();

    // 2️⃣ Create Admin
    const user = await Admin.create({
        name,
        email,
        phone_no,
        passwordHash: password,
        profilePhoto: profilePhotoUrl,
        role: 'admin',
        isVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: verificationTokenExpires
    });

    // 3️⃣ Send Email
    await sendVerificationEmail(user.email, verificationToken, "admin");

    return res.status(201).json(
        new ApiResponse(201, {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }, "Admin registered. Please verify your email to activate your account.")
    );
});

export const login = asyncHandler(async (req, res) => {
    const { identifier, password, role } = req.body;

    if (!identifier || !password || !role) {
        throw new ApiError(400, "Identifier (Username/Email/Phone), password, and role are required");
    }

    let user;
    const query = {
        $or: [
            { email: identifier },
            { phone_no: identifier },
            { name: identifier }
        ]
    };

    if (role === 'analyst') {
        user = await Analyst.findOne(query);
    } else if (role === 'admin') {
        user = await Admin.findOne(query);
    } else {
        throw new ApiError(400, "Invalid role");
    }

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await user.storeRefreshToken(refreshToken);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);

    const loggedInUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto
    };

    return res.status(200).json(new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken
    }, "User logged in successfully"));
});

export const logout = asyncHandler(async (req, res) => {
    if (req.user) {
        await req.user.clearRefreshToken();
    }
    clearTokenCookies(res);
    return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await req.user.constructor.findById(req.user._id).select('-passwordHash -refreshToken');
    res.status(200).json(new ApiResponse(200, user, "Current user fetched successfully"));
});


export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        let user;
        if (decodedToken.role === 'analyst') {
            user = await Analyst.findById(decodedToken.id);
        } else if (decodedToken.role === 'admin') {
            user = await Admin.findById(decodedToken.id);
        } else {
            throw new ApiError(401, "Invalid token role");
        }

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const isValid = await user.verifyRefreshToken(incomingRefreshToken);
        if (!isValid) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const accessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();
        await user.storeRefreshToken(newRefreshToken);

        setTokenCookies(res, accessToken, newRefreshToken);

        return res.status(200).json(new ApiResponse(200, {
            accessToken,
            refreshToken: newRefreshToken
        }, "Access token refreshed"));

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});


export const verifyAuth = asyncHandler(async (req, res) => {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(200).json(new ApiResponse(200, { isAuthenticated: false }, "Not authenticated"));
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        let user;

        if (decodedToken.role === 'analyst') {
            user = await Analyst.findById(decodedToken.id).select('-passwordHash -refreshToken');
        } else if (decodedToken.role === 'admin') {
            user = await Admin.findById(decodedToken.id).select('-passwordHash -refreshToken');
        }

        if (!user) {
            // Signal to monitoring middleware
            res.locals.authAlert = { type: 'TOKEN_ABUSE', pattern: 'User Not Found in Token' };
            return res.status(200).json(new ApiResponse(200, { isAuthenticated: false }, "User not found"));
        }

        return res.status(200).json(new ApiResponse(200, { isAuthenticated: true, user }, "Authenticated"));
    } catch (error) {
        // Signal to monitoring middleware
        const isMalformed = error.message === 'jwt malformed';
        const isExpired = error.message.includes('expired');

        res.locals.authAlert = {
            type: 'TOKEN_ABUSE',
            pattern: isExpired ? 'Expired Token Usage' :
                isMalformed ? 'Malformed Token' : 'Invalid Signature/Token'
        };

        if (isMalformed) {
            return res.status(400).json(new ApiResponse(400, { isAuthenticated: false }, "Bad Request: Malformed Token"));
        }

        if (isExpired) {
            // User requested 304 for Expired Token
            return res.status(304).json(new ApiResponse(304, { isAuthenticated: false }, "Expired Token"));
        }

        // For Tampered/Invalid Signature, return 401
        return res.status(401).json(new ApiResponse(401, { isAuthenticated: false }, "Invalid token signature (Tampered?)"));
    }
});

export const updateUserProfileImage = asyncHandler(async (req, res) => {
    if (!req.file?.path) throw new ApiError(400, "Profile image required");

    if (req.user.profilePhoto) {
        // Extract public_id from url if needed, or just pass the url if your delete function handles it
        await deleteImageOnCloudinary(req.user.profilePhoto);
    }

    const uploadRes = await uploadOnCloudinary(req.file.path, "image");

    // Update user
    req.user.profilePhoto = uploadRes.secure_url;
    await req.user.save({ validateBeforeSave: false });

    return res.json(new ApiResponse(200, req.user, "Profile photo updated"));
});


export const verifyEmail = asyncHandler(async (req, res) => {
    const { token, role } = req.query;

    if (!token || !role) throw new ApiError(400, "Token and role are required");

    let UserModel = role === "analyst" ? Analyst : Admin;

    const user = await UserModel.findOne({
        emailVerificationToken: token,
        emailVerificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) throw new ApiError(400, "Invalid or expired verification link");

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Email verified successfully!")
    );
});

export const googleLogin = asyncHandler(async (req, res) => {
    const { code } = req.body;
    if (!code) throw new ApiError(400, "Authorization code is required");

    const { getGoogleUser } = await import('../utils/googleConfig.js');
    const googleUser = await getGoogleUser(code);
    console.log("user info with login with google", googleUser);
    const { email, name, picture } = googleUser;

    // Check if user exists in either Analyst or Admin
    let user = await Analyst.findOne({ email });
    let role = 'analyst';

    if (!user) {
        user = await Admin.findOne({ email });
        role = 'admin';
    }

    if (user) {
        // User exists -> Login
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        await user.storeRefreshToken(refreshToken);

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, accessToken, refreshToken);

        return res.status(200).json(new ApiResponse(200, {
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, profilePhoto: user.profilePhoto },
            accessToken,
            refreshToken,
            isNewUser: false
        }, "Google login successful"));
    } else {
        // User does not exist -> Return info for registration
        return res.status(200).json(new ApiResponse(200, {
            email,
            name,
            profilePhoto: picture,
            isNewUser: true
        }, "User not found, please complete registration"));
    }
});

export const registerGoogle = asyncHandler(async (req, res) => {
    const { name, email, phone_no, role, profilePhoto } = req.body;

    if (!name || !email || !phone_no || !role) {
        throw new ApiError(400, "All fields are required");
    }

    let UserModel;
    if (role === 'analyst') UserModel = Analyst;
    else if (role === 'admin') UserModel = Admin;
    else throw new ApiError(400, "Invalid role");

    const existingUser = await UserModel.findOne({ $or: [{ email }, { phone_no }] });
    if (existingUser) throw new ApiError(400, 'User already exists');

    let finalProfilePhoto = profilePhoto;
    // If a new file is uploaded, use it. Otherwise use the Google photo URL passed in body.
    if (req.file?.path) {
        const uploadRes = await uploadOnCloudinary(req.file.path, "image");
        if (uploadRes?.secure_url) finalProfilePhoto = uploadRes.secure_url;
    }

    // Create user (Verified by default since it's Google)
    const user = await UserModel.create({
        name,
        email,
        phone_no,
        passwordHash: crypto.randomBytes(16).toString('hex'), // Random password for Google users
        profilePhoto: finalProfilePhoto,
        role,
        isVerified: true
    });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await user.storeRefreshToken(refreshToken);

    setTokenCookies(res, accessToken, refreshToken);

    return res.status(201).json(new ApiResponse(201, {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, profilePhoto: user.profilePhoto },
        accessToken,
        refreshToken
    }, "Google registration successful"));
});


export const getProfileImage = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, {
        profilePhoto: req.user.profilePhoto
    }, "Profile image fetched successfully"));
});
