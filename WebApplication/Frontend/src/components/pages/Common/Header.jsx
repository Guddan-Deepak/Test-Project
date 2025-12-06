// import React, { useState, useEffect } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { Leaf } from "lucide-react";
// import { useAuth } from "../../../utils/authContext";
// import api from "../../../utils/api";


// const Header = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const { isAuthenticated, logout, user, loading } = useAuth();
//     const [profileImage, setProfileImage] = useState(null);

//     useEffect(() => {
//         if (isAuthenticated && user) {
//             // Set initial image from user object
//             setProfileImage(user.profilePhoto);

//             // Allow fetching fresh image if needed, or rely on user object
//             const fetchProfileImage = async () => {
//                 try {
//                     const res = await api.get('/auth/profile-image');
//                     if (res.data.success && res.data.data.profilePhoto) {
//                         setProfileImage(res.data.data.profilePhoto);
//                     }
//                 } catch (error) {
//                     console.error("Failed to fetch profile image", error);
//                 }
//             };
//             fetchProfileImage();
//         }
//     }, [isAuthenticated, user]);

//     const handleTherapiesClick = (e) => {
//         if (location.pathname === "/") {
//             e.preventDefault();
//             const therapiesSection = document.getElementById('therapies-section');
//             if (therapiesSection) {
//                 therapiesSection.scrollIntoView({ behavior: 'smooth' });
//             }
//         }
//     };

//     const handleLogout = async () => {
//         try {
//             await logout();
//             navigate('/login');
//         } catch (error) {
//             console.error('Logout error:', error);
//             navigate('/login');
//         }
//     };

//     const handleDashboardClick = () => {
//         if (isAuthenticated) {
//             navigate('/dashboard');
//         }
//     };

//     return (
//         <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
//                 {/* Logo */}
//                 <Link to={isAuthenticated ? "/" : "/welcome"} className="flex items-center gap-3">
//                     <Leaf className="w-10 h-10 text-emerald-600" />
//                     <div>
//                         <span className="text-3xl font-bold text-emerald-700 block">AyurSutra</span>
//                         <span className="text-xs text-emerald-500 block -mt-1">Panchakarma Center</span>
//                     </div>
//                 </Link>

//                 {/* Navigation Links */}
//                 <div className="hidden md:flex items-center space-x-10">
//                     <Link to={isAuthenticated ? "/" : "/welcome"} className="text-lg font-semibold text-gray-700 hover:text-emerald-600 transition-colors duration-200">
//                         Home
//                     </Link>
//                     <Link to="/about" className="text-lg font-semibold text-gray-700 hover:text-emerald-600 transition-colors duration-200">
//                         About
//                     </Link>
//                     <Link to="/contact" className="text-lg font-semibold text-gray-700 hover:text-emerald-600 transition-colors duration-200">
//                         Contact
//                     </Link>

//                     {/* Dashboard Link (only show when authenticated) */}
//                     {isAuthenticated && (
//                         <Link
//                             to="/dashboard"
//                             className="text-lg font-semibold text-gray-700 hover:text-emerald-600 transition-colors duration-200"
//                         >
//                             Dashboard
//                         </Link>
//                     )}
//                 </div>

//                 {/* User Section */}
//                 <div className="flex items-center space-x-4">
//                     {isAuthenticated ? (
//                         /* Logged In State */
//                         <div className="flex items-center space-x-4">
//                             {loading ? (
//                                 /* Loading State */
//                                 <div className="flex items-center space-x-3">
//                                     <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
//                                     <div className="hidden lg:block text-right">
//                                         <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
//                                         <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
//                                     </div>
//                                 </div>
//                             ) : user ? (
//                                 /* User Info Loaded */
//                                 <div className="flex items-center space-x-3">
//                                     <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-100">
//                                         {user.profilePhoto ? (
//                                             <img
//                                                 src={profileImage || user.profilePhoto}
//                                                 alt={user.name}
//                                                 className="w-full h-full object-cover"
//                                             />
//                                         ) : (
//                                             <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
//                                                 <span className="text-emerald-600 font-semibold text-sm">
//                                                     {user.name?.charAt(0).toUpperCase() || 'U'}
//                                                 </span>
//                                             </div>
//                                         )}
//                                     </div>
//                                     <div className="hidden lg:block text-right">
//                                         <p className="text-sm font-medium text-gray-700">Welcome back,</p>
//                                         <p className="text-sm font-semibold text-emerald-600 capitalize">
//                                             {user.name || 'User'}
//                                         </p>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 /* User Data Failed to Load */
//                                 <div className="flex items-center space-x-3">
//                                     <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
//                                         <span className="text-red-600 font-semibold text-sm">!</span>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Logout Button */}
//                             <button
//                                 onClick={handleLogout}
//                                 className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center space-x-2 border border-red-200"
//                                 disabled={loading}
//                             >
//                                 {loading ? (
//                                     <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
//                                 ) : (
//                                     <span>Logout</span>
//                                 )}
//                             </button>
//                         </div>
//                     ) : (
//                         /* Logged Out State - Login & Signup Buttons */
//                         <div className="flex items-center space-x-3">
//                             <Link
//                                 to="/login"
//                                 className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 border border-transparent hover:border-emerald-100"
//                             >
//                                 Login
//                             </Link>
//                             <Link
//                                 to="/signup"
//                                 className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
//                             >
//                                 Sign Up
//                             </Link>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Mobile Navigation */}
//             <div className="md:hidden bg-white border-t border-gray-200">
//                 <div className="px-4 py-3 flex justify-between items-center space-x-4">
//                     <Link to={isAuthenticated ? "/" : "/welcome"} className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">
//                         Home
//                     </Link>
//                     <Link to="/contact" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">
//                         Contact
//                     </Link>
//                     {!isAuthenticated && (
//                         <>
//                             <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors">
//                                 Login
//                             </Link>
//                             <Link to="/signup" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
//                                 Sign Up
//                             </Link>
//                         </>
//                     )}
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default Header;

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../../utils/authContext";
import api from "../../../utils/api";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout, user, loading } = useAuth();
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Set initial image from user object
            setProfileImage(user.profilePhoto);

            // Allow fetching fresh image if needed, or rely on user object
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
        }
    }, [isAuthenticated, user]);

    const handleTherapiesClick = (e) => {
        if (location.pathname === "/") {
            e.preventDefault();
            const therapiesSection = document.getElementById('therapies-section');
            if (therapiesSection) {
                therapiesSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login');
        }
    };

    const handleDashboardClick = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    };

    // ----------------------------------------------------------------------
    // NEW THEME CLASSES BASED ON THE USER'S GRADIENT:
    // Header background is changed to match the gradient and fixed to the top.
    // Accent colors are adjusted to a bright blue/cyan for contrast on the dark background.
    // ----------------------------------------------------------------------

    // Applying a dark gradient-like background to the header
    const headerBg = "bg-gradient-to-r from-[#102544] to-[#0a457a] backdrop-blur-md border-b border-blue-900 sticky top-0 z-50";

    // Using a light cyan/sky color for the primary accent
    const accentColor = "text-sky-400";
    const logoPrimaryText = "text-white";
    const logoSecondaryText = "text-gray-400";
    const navLinkText = "text-gray-300 hover:text-sky-400";
    const buttonPrimaryBg = "bg-sky-500 hover:bg-sky-600";
    const buttonPrimaryText = "text-white";
    const buttonSecondaryText = "text-sky-400 hover:bg-white/10";

    // Styling for the Logout button to match the image: dark background, white text, and a logout icon.
    const logoutButtonClasses = `
        bg-transparent hover:bg-white/10 text-white 
        px-4 py-2 rounded-lg font-semibold text-base 
        transition-all duration-200 flex items-center space-x-2 
        border border-transparent
    `;


    return (
        <nav className={headerBg}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
                {/* Logo */}
                <Link to={isAuthenticated ? "/" : "/welcome"} className="flex items-center gap-3">
                    <img src="/soc-logo.png" alt="Logo" className="h-12 w-auto" />
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-10">
                    <Link to={isAuthenticated ? "/" : "/welcome"} className={`text-lg font-semibold transition-colors duration-200 ${navLinkText}`}>
                        Home
                    </Link>
                    <Link to="/about" className={`text-lg font-semibold transition-colors duration-200 ${navLinkText}`}>
                        About
                    </Link>
                    <Link to="/contact" className={`text-lg font-semibold transition-colors duration-200 ${navLinkText}`}>
                        Contact
                    </Link>

                    {/* Dashboard Link (only show when authenticated) */}
                    {isAuthenticated && (
                        <Link
                            to="/dashboard"
                            className={`text-lg font-semibold transition-colors duration-200 ${navLinkText}`}
                        >
                            Dashboard
                        </Link>
                    )}
                </div>

                {/* User Section */}
                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        /* Logged In State */
                        <div className="flex items-center space-x-4">
                            {loading ? (
                                /* Loading State */
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-700 rounded-full animate-pulse"></div>
                                    <div className="hidden lg:block text-right">
                                        <div className="h-4 w-20 bg-blue-700 rounded animate-pulse mb-1"></div>
                                        <div className="h-3 w-16 bg-blue-700 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ) : user ? (
                                /* User Info Loaded */
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-400">
                                        {user.profilePhoto ? (
                                            <img
                                                src={profileImage || user.profilePhoto}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-blue-900 flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">
                                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="hidden lg:block text-right">
                                        <p className="text-sm font-medium text-gray-300">Welcome back,</p>
                                        <p className="text-sm font-semibold text-sky-400 capitalize">
                                            {user.name || 'User'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* User Data Failed to Load */
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">!</span>
                                    </div>
                                </div>
                            )}

                            {/* Logout Button - Styled to match the uploaded image */}
                            <button
                                onClick={handleLogout}
                                className={logoutButtonClasses}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <LogOut className="w-5 h-5" />
                                        <span>Logout</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Logged Out State - Login & Signup Buttons */
                        <div className="flex items-center space-x-3">
                            <Link
                                to="/login"
                                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 border ${buttonSecondaryText} border-white/10`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className={`${buttonPrimaryBg} ${buttonPrimaryText} px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200`}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden bg-[#102544] border-t border-blue-900">
                <div className="px-4 py-3 flex justify-between items-center space-x-4">
                    <Link to={isAuthenticated ? "/" : "/welcome"} className={`text-sm font-semibold transition-colors ${navLinkText}`}>
                        Home
                    </Link>
                    <Link to="/contact" className={`text-sm font-semibold transition-colors ${navLinkText}`}>
                        Contact
                    </Link>
                    {!isAuthenticated && (
                        <>
                            <Link to="/login" className={`text-sm font-semibold transition-colors ${navLinkText}`}>
                                Login
                            </Link>
                            <Link to="/signup" className={`text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors`}>
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