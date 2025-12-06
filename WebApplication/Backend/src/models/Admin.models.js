import mongoose from 'mongoose';
import { userMethodsPlugin } from './User.method.js';

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Admin name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        index: true
    },
    passwordHash: {
        type: String,
        required: [true, 'Password hash is required']
    },
    role: {
        type: String,
        default: 'admin',
        enum: ['admin', 'super_admin']
    },
    phone_no: {
        type: String,
        required: [true, 'Phone number is required']
    },
    refreshToken: { type: String, default: null },
    profilePhoto: {
        type: String,
        default: "https://res.cloudinary.com/famly/image/upload/v1759747438/default-profile-image_p9e5ln.jpg"
    },
    lastLogin: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,
}, {
    timestamps: true
});

adminSchema.plugin(userMethodsPlugin);
const Admin = mongoose.model('Admin', adminSchema);

export default Admin;