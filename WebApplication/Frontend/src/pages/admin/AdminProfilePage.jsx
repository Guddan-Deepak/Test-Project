import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Camera, Mail, Phone, User, Shield, CheckCircle, XCircle, Key, Save, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_no: ''
    });

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/admin/profile');
            if (data.success) {
                setProfile(data.data);
                setFormData({
                    name: data.data.name,
                    email: data.data.email,
                    phone_no: data.data.phone_no
                });
            }
        } catch (error) {
            toast.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('profilePhoto', file);

        try {
            toast.info("Uploading image...");
            const { data } = await api.put('/admin/profile/image', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (data.success) {
                toast.success("Profile photo updated!");
                setProfile(prev => ({ ...prev, profilePhoto: data.data.profilePhoto }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload image");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/admin/profile', {
                name: formData.name,
                email: formData.email,
                phone_no: formData.phone_no
            });

            if (data.success) {
                toast.success("Profile details updated!");
                setProfile(data.data);
                setIsEditing(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error("New passwords do not match");
        }

        try {
            const { data } = await api.put('/admin/profile/password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });

            if (data.success) {
                toast.success("Password changed successfully");
                setIsChangingPassword(false);
                setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
        }
    };

    const handleResendVerification = async () => {
        try {
            const { data } = await api.post('/admin/profile/resend-verification');
            if (data.success) {
                toast.success("Verification link sent! Check your email.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send verification link");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#050B14]">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050B14] p-8 text-slate-200 font-sans selection:bg-cyan-500/30">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div>
                    <h1 className="text-xl font-medium text-cyan-400">Admin Profile</h1>
                    <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mt-2"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Profile Card */}
                        <div className="bg-[#0B1221] p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative flex flex-col items-center">

                            {/* Verification Badge */}
                            <div className={`absolute top-6 right-6 flex flex-col items-end gap-2`}>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${profile.isVerified ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                                    {profile.isVerified ? (
                                        <><CheckCircle size={12} strokeWidth={3} /> Verified</>
                                    ) : (
                                        <><XCircle size={12} strokeWidth={3} /> Unverified</>
                                    )}
                                </div>
                                {!profile.isVerified && (
                                    <button
                                        onClick={handleResendVerification}
                                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
                                    >
                                        Resend Link
                                    </button>
                                )}
                            </div>

                            {/* Avatar */}
                            <div className="relative group mb-6">
                                <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-cyan-500 to-blue-600">
                                    <div className="w-full h-full rounded-full border-4 border-[#0B1221] overflow-hidden bg-slate-900 relative">
                                        <img src={profile.profilePhoto} alt={profile.name} className="w-full h-full object-cover" />
                                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                                            <Camera className="text-white drop-shadow-lg" size={32} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1.5 border-4 border-[#0B1221] shadow-lg">
                                    <Shield size={16} className="text-white" fill="currentColor" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-white tracking-wide">{profile.name}</h2>

                            <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#0F1929] rounded-xl border border-slate-800/60">
                                <Shield size={16} className="text-cyan-400" />
                                <span className="text-sm font-semibold text-cyan-400 tracking-wider uppercase">{profile.role}</span>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-500">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                System Active
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-[#0B1221] p-6 rounded-3xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-slate-800/50 rounded-xl">
                                    <Shield size={20} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Security</h3>
                                    <p className="text-xs text-slate-500">Manage your password</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsChangingPassword(!isChangingPassword)}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all font-semibold flex items-center justify-between group"
                            >
                                <span className="flex items-center gap-2">
                                    <Key size={18} />
                                    Change Password
                                </span>
                                <span className={`transform transition-transform duration-200 ${isChangingPassword ? 'rotate-90' : 'rotate-0'}`}>›</span>
                            </button>

                            {isChangingPassword && (
                                <form onSubmit={handleChangePassword} className="mt-4 space-y-4 pt-4 border-t border-slate-800/50 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-4">
                                        <input
                                            type="password"
                                            placeholder="Old Password"
                                            className="w-full bg-[#080E1A] border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all placeholder:text-slate-600"
                                            value={passwords.oldPassword}
                                            onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                        />
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            className="w-full bg-[#080E1A] border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all placeholder:text-slate-600"
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        />
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            className="w-full bg-[#080E1A] border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all placeholder:text-slate-600"
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        />
                                        <button type="submit" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium text-sm transition-colors border border-slate-700">
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="mt-4 p-4 bg-[#080E1A] rounded-xl border border-slate-800/50 flex gap-3 opacity-60">
                                <Key size={16} className="text-slate-400 mt-1 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-300">Keep your account secure</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Use a strong password with at least 8 characters including mixed case and symbols.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Personal Details Card */}
                        <div className="bg-[#0B1221] p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-cyan-500/10 rounded-2xl">
                                        <User size={24} className="text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Personal Details</h3>
                                        <p className="text-sm text-slate-500">Your account information</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isEditing ? 'text-slate-400 hover:text-white' : 'text-cyan-400 hover:text-cyan-300'}`}
                                >
                                    {isEditing ? <><XCircle size={16} /> Cancel</> : <><Edit2 size={16} /> Edit <span className="text-xs">›</span></>}
                                </button>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-8 flex-1">
                                <div className="flex flex-col space-y-6">

                                    {/* Name */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Full Name</label>
                                        <div className={`group flex items-center bg-[#080E1A] border rounded-xl transition-all overflow-hidden ${isEditing ? 'border-cyan-500/30 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/20' : 'border-slate-800/50'}`}>
                                            <div className="pl-4 pr-3 text-slate-500">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                className="w-full bg-transparent py-3.5 pr-4 text-sm text-slate-200 focus:outline-none disabled:text-slate-400"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
                                        <div className={`group flex items-center bg-[#080E1A] border rounded-xl transition-all overflow-hidden ${isEditing ? 'border-cyan-500/30 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/20' : 'border-slate-800/50'}`}>
                                            <div className="pl-4 pr-3 text-slate-500">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                disabled={!isEditing}
                                                className="w-full bg-transparent py-3.5 pr-4 text-sm text-slate-200 focus:outline-none disabled:text-slate-400"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Phone Number</label>
                                        <div className={`group flex items-center bg-[#080E1A] border rounded-xl transition-all overflow-hidden ${isEditing ? 'border-cyan-500/30 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/20' : 'border-slate-800/50'}`}>
                                            <div className="pl-4 pr-3 text-slate-500">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                disabled={!isEditing}
                                                className="w-full bg-transparent py-3.5 pr-4 text-sm text-slate-200 focus:outline-none disabled:text-slate-400"
                                                value={formData.phone_no}
                                                onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Role</label>
                                        <div className="flex items-center bg-[#080E1A] border border-slate-800/50 rounded-xl overflow-hidden opacity-70">
                                            <div className="pl-4 pr-3 text-slate-500">
                                                <Shield size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                disabled
                                                className="w-full bg-transparent py-3.5 pr-4 text-sm text-slate-300 font-semibold uppercase tracking-wide cursor-not-allowed"
                                                value={profile.role}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end pt-6 border-t border-slate-800/50">
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            <Save size={18} />
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfilePage;
