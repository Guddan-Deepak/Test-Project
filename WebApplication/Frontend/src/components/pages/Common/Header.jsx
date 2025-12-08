import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../../utils/authContext";
import useUser from "../../../hooks/useUser";
import api from "../../../utils/api";

const Header = () => {

    const navigate = useNavigate();
    const { isAuthenticated, logout, loading: authLoading } = useAuth();
    const { user, loading: userLoading } = useUser();
    const [profileImage, setProfileImage] = useState(null);

    const loading = authLoading || userLoading;

    useEffect(() => {
        if (user) {
            setProfileImage(user.profilePhoto);
            const fetchProfileImage = async () => {
                try {
                    const res = await api.get('/auth/profile-image');
                    if (res.data.success && res.data.data.profilePhoto) {
                        setProfileImage(res.data.data.profilePhoto);
                    }
                } catch (error) {
                    console.error("Failed to fetch profile image", error);
                }
            };
            fetchProfileImage();
        } else {
            setProfileImage(null);
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login');
        }
    };

    // ------------------ BLUE THEME STYLES ------------------
    const headerBg = "bg-gradient-to-r from-blue-600 to-blue-500 border-b border-blue-700 sticky top-0 z-[100]";
    const accentColor = "text-sky-200";
    const navLinkText = "text-white hover:text-sky-200 transition-colors";
    const logoutButtonClasses = `
        bg-white hover:bg-gray-100 text-blue-600 
        px-4 py-2 rounded-full font-semibold text-sm 
        transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg
    `;
    const buttonPrimaryBg = "bg-white hover:bg-gray-100";
    const buttonPrimaryText = "text-blue-600";
    const buttonSecondaryText = "text-white hover:text-sky-200 border border-white/30";

    return (
        <nav className={headerBg}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                {/* Logo */}
                <Link to={isAuthenticated ? "/" : "/welcome"} className="flex items-center gap-2">
                    <img src="/soc-logo.png" alt="Logo" className="h-10 w-auto" />
                    <img src="/shield.png" alt="Logo" className="h-10 w-auto" />
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link to={isAuthenticated ? "/welcome" : "/"} className={`text-sm font-semibold transition-colors ${navLinkText}`}>
                        Home
                    </Link>
                    <Link to="/about" className={`text-sm font-semibold transition-colors ${navLinkText}`}>
                        About
                    </Link>
                    <Link to="/contact" className={`text-sm font-semibold transition-colors ${navLinkText}`}>
                        Contact
                    </Link>
                    {isAuthenticated && (
                        <Link to={user?.role === 'admin' ? "/admin" : "/dashboard"} className={`text-sm font-semibold transition-colors ${navLinkText}`}>
                            {user?.role === 'admin' ? "Admin Dashboard" : "Dashboard"}
                        </Link>
                    )}
                </div>

                {/* User Section */}
                <div className="flex items-center space-x-3">
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-3">
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                                    <div className="hidden lg:block text-right">
                                        <div className="h-3 w-16 bg-gray-300 rounded animate-pulse mb-1"></div>
                                        <div className="h-2 w-12 bg-gray-300 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ) : user ? (
                                <div className="flex items-center space-x-2">
                                    {/* Profile Photo - Clickable */}
                                    <div
                                        onClick={() => navigate(user?.role === 'admin' ? "/admin/profile" : "/analyst/profile")}
                                        className="w-8 h-8 rounded-full overflow-hidden border-2 border-white cursor-pointer hover:opacity-80 transition-opacity"
                                    >
                                        {user.profilePhoto ? (
                                            <img
                                                src={profileImage || user.profilePhoto}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                <span className="text-gray-700 font-semibold text-sm">
                                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Name - Clickable */}
                                    <div
                                        className="hidden lg:block text-right cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => navigate(user?.role === 'admin' ? "/admin/profile" : "/analyst/profile")}
                                    >
                                        <p className="text-xs font-medium text-white">Welcome back,</p>
                                        <p className="text-sm font-semibold text-sky-200 capitalize">{user.name || 'User'}</p>
                                    </div>
                                </div>
                            ) : null}

                            <button
                                onClick={handleLogout}
                                className={logoutButtonClasses}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Link
                                to="/login"
                                className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 border ${buttonSecondaryText}`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className={`${buttonPrimaryBg} ${buttonPrimaryText} px-5 py-1.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200`}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden bg-blue-600 border-t border-blue-700">
                <div className="px-4 py-2 flex justify-between items-center space-x-3">
                    <Link to={isAuthenticated ? "/" : "/welcome"} className={`text-sm font-medium transition-colors text-white hover:text-sky-200`}>
                        Home
                    </Link>
                    <Link to="/contact" className={`text-sm font-medium transition-colors text-white hover:text-sky-200`}>
                        Contact
                    </Link>
                    {!isAuthenticated && (
                        <>
                            <Link to="/login" className={`text-sm font-medium transition-colors text-white hover:text-sky-200`}>
                                Login
                            </Link>
                            <Link to="/signup" className={`text-sm font-medium text-white hover:text-sky-200 transition-colors`}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Header;
