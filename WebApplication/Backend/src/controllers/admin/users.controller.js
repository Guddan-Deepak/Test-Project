import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import Admin from "../../models/Admin.models.js";
import Analyst from "../../models/Analyst.models.js";

/**
 * @desc    Get all users (Admins + Analysts)
 * @route   GET /api/v1/admin/users
 * @access  Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    const [admins, analysts] = await Promise.all([
        Admin.find().select("-password -refreshToken"),
        Analyst.find().select("-password -refreshToken")
    ]);

    // Merge and sort by creation date (newest first)
    const users = [...admins, ...analysts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

/**
 * @desc    Create a new user (Admin or Analyst)
 * @route   POST /api/v1/admin/users
 * @access  Admin
 */
/**
 * @desc    Create a new user (Admin or Analyst)
 * @route   POST /api/v1/admin/users
 * @access  Admin
 */
export const createUser = asyncHandler(async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !role || !phone) {
        throw new ApiError(400, "All fields (name, email, phone, password, role) are required");
    }

    const Model = role === 'admin' ? Admin : Analyst;

    // Check availability by email
    const existsAdmin = await Admin.findOne({ email });
    const existsAnalyst = await Analyst.findOne({ email });

    if (existsAdmin || existsAnalyst) {
        throw new ApiError(400, "User with this email already exists");
    }

    const user = await Model.create({
        name,
        email,
        phone_no: phone,
        passwordHash: password, // Pre-save hook will hash this
        role,
        isVerified: true // Admin created users are verified by default
    });

    const createdUser = await Model.findById(user._id).select("-passwordHash -refreshToken");

    res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"));
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Try deleting from both collections
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (deletedAdmin) {
        return res.status(200).json(new ApiResponse(200, null, "Admin user deleted successfully"));
    }

    const deletedAnalyst = await Analyst.findByIdAndDelete(id);
    if (deletedAnalyst) {
        return res.status(200).json(new ApiResponse(200, null, "Analyst user deleted successfully"));
    }

    throw new ApiError(404, "User not found");
});
