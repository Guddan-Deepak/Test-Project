import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error("Something went wrong while generating referesh and access token");
    }
};

export const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // Create new user
        const user = await User.create({
            username,
            password,
            role
        });

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true
        };

        res.status(201)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                accessToken,
                refreshToken,
                user: {
                    _id: user._id,
                    username: user.username,
                    role: user.role
                },
                message: "User registered successfully"
            });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check for user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true
        };

        res.status(200)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                user: {
                    _id: user._id,
                    username: user.username,
                    role: user.role
                },
                accessToken,
                refreshToken,
                message: "User logged in successfully"
            });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET || "refresh-token-secret"
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid refresh token" });
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({ success: false, message: "Refresh token is expired or used" });
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user._id);

        res.status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .json({
                success: true,
                accessToken,
                refreshToken: newRefreshToken,
                message: "Access token refreshed"
            });
    } catch (error) {
        res.status(401).json({ success: false, message: error?.message || "Invalid refresh token" });
    }
};
