// // import React from 'react';
// // import { useNavigate } from 'react-router-dom';

// // const Welcome = () => {
// //     const user = JSON.parse(localStorage.getItem('user') || '{}');
// //     const navigate = useNavigate();

// //     const handleLogout = () => {
// //         localStorage.removeItem('token');
// //         localStorage.removeItem('user');
// //         navigate('/login');
// //     };

// //     return (
// //         <div className="welcome-container">
// //             <h1>Welcome to our website!</h1>
// //             <p>Hello, {user.name || 'Guest'}</p>
// //             <p>We are glad to have you here at Famly.</p>
// //             <button onClick={handleLogout}>Logout</button>
// //         </div>
// //     );
// // };

// // export default Welcome;


// import React from "react";
// import { useNavigate } from "react-router-dom";

// const Welcome = () => {
//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     const navigate = useNavigate();

//     const handleLogout = () => {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         navigate("/login");
//     };

//     return (
//         <div
//             style={{
//                 height: "100vh",
//                 width: "100vw",
//                 overflow: "hidden",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 background:
//                     "url('https://s3-alpha.figma.com/hub/file/5153810041/484e6306-4f4a-442b-966c-cc7d1ac904ce-cover.png",
//                 backgroundAttachment: "fixed",
//                 position: "relative",
//             }}
//         >
//             {/* Overlay */}
//             <div
//                 style={{
//                     position: "absolute",
//                     inset: 0,
//                     background:
//                         "linear-gradient(135deg, rgba(0, 20, 50, 0.85), rgba(0, 60, 105, 0.6))",
//                     zIndex: 0,
//                 }}
//             />

//             {/* Card */}
//             <div
//                 style={{
//                     position: "relative",
//                     zIndex: 1,
//                     width: "520px",
//                     textAlign: "center",
//                     padding: "45px 50px",
//                     background: "rgba(9, 22, 48, 0.65)",
//                     borderRadius: "20px",
//                     border: "1px solid rgba(255,255,255,0.2)",
//                     backdropFilter: "blur(12px)",
//                     boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
//                     animation: "fadeIn 0.5s ease-out",
//                 }}
//             >
//                 {/* Avatar */}
//                 <div
//                     style={{
//                         width: "95px",
//                         height: "95px",
//                         margin: "0 auto 18px",
//                         borderRadius: "50%",
//                         background:
//                             "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
//                         border: "2px solid rgba(255,255,255,0.3)",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         color: "#e3f2fd",
//                         fontSize: "40px",
//                         fontWeight: "700",
//                         boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
//                     }}
//                 >
//                     {user?.name?.charAt(0)?.toUpperCase() || "U"}
//                 </div>

//                 {/* Title */}
//                 <h1
//                     style={{
//                         color: "white",
//                         fontWeight: "800",
//                         fontSize: "30px",
//                         marginBottom: "8px",
//                         letterSpacing: "0.8px",
//                     }}
//                 >
//                     Welcome!
//                 </h1>

//                 {/* Username */}
//                 <p
//                     style={{
//                         color: "#bcd4ff",
//                         fontSize: "18px",
//                         marginBottom: "15px",
//                         fontWeight: "600",
//                         textTransform: "capitalize",
//                     }}
//                 >
//                     {user?.name || user?.username || "Guest"}
//                 </p>

//                 {/* Message */}
//                 <p
//                     style={{
//                         color: "rgba(255,255,255,0.85)",
//                         fontSize: "14px",
//                         marginBottom: "30px",
//                         maxWidth: "400px",
//                         marginInline: "auto",
//                         lineHeight: "1.5",
//                     }}
//                 >
//                     You are successfully logged in to the Family SOC Portal.
//                 </p>

//                 {/* Logout */}
//                 <button
//                     onClick={handleLogout}
//                     style={{
//                         padding: "12px 28px",
//                         background: "linear-gradient(135deg, #ff7043, #e53935)",
//                         border: "none",
//                         color: "white",
//                         fontWeight: "700",
//                         fontSize: "15px",
//                         cursor: "pointer",
//                         borderRadius: "12px",
//                         boxShadow: "0 5px 15px rgba(0,0,0,0.4)",
//                         transition: "0.25s",
//                     }}
//                     onMouseEnter={(e) => {
//                         e.currentTarget.style.transform = "translateY(-2px)";
//                         e.currentTarget.style.boxShadow =
//                             "0 10px 25px rgba(255, 112, 67, 0.45)";
//                     }}
//                     onMouseLeave={(e) => {
//                         e.currentTarget.style.transform = "translateY(0)";
//                         e.currentTarget.style.boxShadow =
//                             "0 5px 15px rgba(0,0,0,0.4)";
//                     }}
//                 >
//                     Logout
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Welcome;

import React from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div
            className="min-h-screen w-full overflow-hidden flex items-center justify-center bg-cover bg-center bg-fixed relative"
            style={{
                backgroundImage:
                    "url('https://s3-alpha.figma.com/hub/file/5153810041/484e6306-4f4a-442b-966c-cc7d1ac904ce-cover.png')",
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#001432]/85 to-[#003c69]/60 z-0" />

            {/* Card */}
            <div
                className="
                    relative z-10
                    w-[90%] max-w-[520px]
                    text-center
                    px-6 sm:px-10 py-8 sm:py-10
                    bg-[rgba(9,22,48,0.70)]
                    rounded-2xl
                    border border-white/20
                    backdrop-blur-xl
                    shadow-[0_25px_60px_rgba(0,0,0,0.55)]
                    animate-[fadeIn_0.5s_ease-out]
                "
            >
                {/* Avatar */}
                <div
                    className="
                        w-20 h-20 sm:w-[95px] sm:h-[95px]
                        mx-auto mb-5
                        rounded-full
                        bg-gradient-to-br from-white/25 to-white/10
                        border-2 border-white/40
                        flex items-center justify-center
                        text-[#e3f2fd]
                        text-3xl sm:text-[40px]
                        font-bold
                        shadow-[0_10px_25px_rgba(0,0,0,0.5)]
                    "
                >
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                {/* Title */}
                <h1 className="text-white font-extrabold text-2xl sm:text-[30px] mb-2 tracking-wide">
                    Welcome!
                </h1>

                {/* Username */}
                <p className="text-[#bcd4ff] text-base sm:text-lg mb-4 font-semibold capitalize">
                    {user?.name || user?.username || "Guest"}
                </p>

                {/* Message */}
                <p className="text-white/85 text-sm sm:text-[15px] mb-8 max-w-[400px] mx-auto leading-relaxed">
                    You are successfully logged in to the Family SOC Portal.
                </p>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="
                        px-7 py-3
                        bg-gradient-to-tr from-[#ff7043] to-[#e53935]
                        text-white font-bold text-sm sm:text-[15px]
                        rounded-xl
                        shadow-[0_5px_15px_rgba(0,0,0,0.4)]
                        hover:shadow-[0_10px_25px_rgba(255,112,67,0.45)]
                        hover:-translate-y-0.5
                        transition
                    "
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Welcome;
