import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../../utils/authContext";
import useUser from "../../../hooks/useUser";
import api from "../../../utils/api";

const Header = () => {
    const location = useLocation();
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

    const handleTherapiesClick = (e) => {
        if (location.pathname === "/") {
            e.preventDefault();
            const therapiesSection = document.getElementById('therapies-section');
            if (therapiesSection) therapiesSection.scrollIntoView({ behavior: 'smooth' });
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
        if (isAuthenticated) navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    };

    // ------------------ BLUE THEME STYLES ------------------
    const headerBg = "bg-gradient-to-r from-blue-600 to-blue-500 border-b border-blue-700 sticky top-0 z-50";
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
                    <Link to={isAuthenticated ? "/" : "/welcome"} className={`text-sm font-semibold transition-colors ${navLinkText}`}>
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
                            Dashboard
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
                                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
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
                                    <div className="hidden lg:block text-right">
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

// import React, { useState, useEffect } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { LogOut } from "lucide-react";
// import { useAuth } from "../../../utils/authContext";
// import useUser from "../../../hooks/useUser";
// import api from "../../../utils/api";

// const Header = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const { isAuthenticated, logout, loading: authLoading } = useAuth();
//     const { user, loading: userLoading } = useUser();
//     const [profileImage, setProfileImage] = useState(null);

//     // Combine loading states
//     const loading = authLoading || userLoading;

//     useEffect(() => {
//         if (user) {
//             setProfileImage(user.profilePhoto);

//             // Allow fetching fresh image if needed
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
//         } else {
//             setProfileImage(null);
//         }
//     }, [user]);

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
//             navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
//         }
//     };

//     // ----------------------------------------------------------------------
//     // NEW THEME CLASSES BASED ON THE USER'S GRADIENT:
//     // Header background is changed to match the gradient and fixed to the top.
//     // Accent colors are adjusted to a bright blue/cyan for contrast on the dark background.
//     // ----------------------------------------------------------------------

//     // Applying a dark gradient-like background to the header
//     const headerBg = "bg-gradient-to-r from-[#102544] to-[#0a457a] backdrop-blur-md border-b border-blue-900 sticky top-0 z-50";

//     // Using a light cyan/sky color for the primary accent
//     const accentColor = "text-sky-400";
//     const logoPrimaryText = "text-white";
//     const logoSecondaryText = "text-gray-400";
//     const navLinkText = "text-gray-300 hover:text-sky-400";
//     const buttonPrimaryBg = "bg-sky-500 hover:bg-sky-600";
//     const buttonPrimaryText = "text-white";
//     const buttonSecondaryText = "text-sky-400 hover:bg-white/10";

//     // Styling for the Logout button to match the image: dark background, white text, and a logout icon.
//     const logoutButtonClasses = `
//         bg-transparent hover:bg-white/10 text-white 
//         px-4 py-2 rounded-lg font-semibold text-base 
//         transition-all duration-200 flex items-center space-x-2 
//         border border-transparent
//     `;


//     return (
//         <nav className={headerBg}>
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
//                 {/* Logo */}
//                 <Link to={isAuthenticated ? "/" : "/welcome"} className="flex items-center gap-3">
//                     <img src="/soc-logo.png" alt="Logo" className="h-12 w-auto" />
//                     <img src="/shield.png" alt="Logo" className="h-12 w-auto" />

//                 </Link>

//                 {/* Navigation Links */}
//                 <div className="hidden md:flex items-center space-x-10">
//                     <Link to={isAuthenticated ? "/" : "/welcome"} className={`text-lg font-semibold transition-colors duration-200 ${navLinkText}`}>
//                         Home
//                     </Link>
//                     <Link to="/about" className={`text-lg font-semibold transition-colors duration-200 ${navLinkText}`}>
//                         About
//                     </Link>
//                     <Link to="/contact" className={`text-lg font-semibold transition-colors duration-200 ${navLinkText}`}>
//                         Contact
//                     </Link>

//                     {/* Dashboard Link (only show when authenticated) */}
//                     {isAuthenticated && (
//                         <Link
//                             to={user?.role === 'admin' ? "/admin" : "/dashboard"}
//                             className={`text-lg font-semibold transition-colors duration-200 ${navLinkText}`}
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
//                                     <div className="w-10 h-10 bg-blue-700 rounded-full animate-pulse"></div>
//                                     <div className="hidden lg:block text-right">
//                                         <div className="h-4 w-20 bg-blue-700 rounded animate-pulse mb-1"></div>
//                                         <div className="h-3 w-16 bg-blue-700 rounded animate-pulse"></div>
//                                     </div>
//                                 </div>
//                             ) : user ? (
//                                 /* User Info Loaded */
//                                 <div className="flex items-center space-x-3">
//                                     <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-400">
//                                         {user.profilePhoto ? (
//                                             <img
//                                                 src={profileImage || user.profilePhoto}
//                                                 alt={user.name}
//                                                 className="w-full h-full object-cover"
//                                             />
//                                         ) : (
//                                             <div className="w-full h-full bg-blue-900 flex items-center justify-center">
//                                                 <span className="text-white font-semibold text-sm">
//                                                     {user.name?.charAt(0).toUpperCase() || 'U'}
//                                                 </span>
//                                             </div>
//                                         )}
//                                     </div>
//                                     <div className="hidden lg:block text-right">
//                                         <p className="text-sm font-medium text-gray-300">Welcome back,</p>
//                                         <p className="text-sm font-semibold text-sky-400 capitalize">
//                                             {user.name || 'User'}
//                                         </p>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 /* User Data Failed to Load */
//                                 <div className="flex items-center space-x-3">
//                                     <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center">
//                                         <span className="text-white font-semibold text-sm">!</span>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Logout Button - Styled to match the uploaded image */}
//                             <button
//                                 onClick={handleLogout}
//                                 className={logoutButtonClasses}
//                                 disabled={loading}
//                             >
//                                 {loading ? (
//                                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                 ) : (
//                                     <>
//                                         <LogOut className="w-5 h-5" />
//                                         <span>Logout</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     ) : (
//                         /* Logged Out State - Login & Signup Buttons */
//                         <div className="flex items-center space-x-3">
//                             <Link
//                                 to="/login"
//                                 className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 border ${buttonSecondaryText} border-white/10`}
//                             >
//                                 Login
//                             </Link>
//                             <Link
//                                 to="/signup"
//                                 className={`${buttonPrimaryBg} ${buttonPrimaryText} px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200`}
//                             >
//                                 Sign Up
//                             </Link>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Mobile Navigation */}
//             <div className="md:hidden bg-[#102544] border-t border-blue-900">
//                 <div className="px-4 py-3 flex justify-between items-center space-x-4">
//                     <Link to={isAuthenticated ? "/" : "/welcome"} className={`text-sm font-semibold transition-colors ${navLinkText}`}>
//                         Home
//                     </Link>
//                     <Link to="/contact" className={`text-sm font-semibold transition-colors ${navLinkText}`}>
//                         Contact
//                     </Link>
//                     {!isAuthenticated && (
//                         <>
//                             <Link to="/login" className={`text-sm font-semibold transition-colors ${navLinkText}`}>
//                                 Login
//                             </Link>
//                             <Link to="/signup" className={`text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors`}>
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