// import React, { useState } from "react";
// import api from "../utils/api";
// import { useNavigate, Link } from "react-router-dom";

// const Login = () => {
//     const [formData, setFormData] = useState({
//         username: "",
//         password: "",
//     });

//     const [focusedInput, setFocusedInput] = useState(null);
//     const [error, setError] = useState("");
//     const navigate = useNavigate();

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await api.post("/auth/login", formData);
//             if (res.data.success) {
//                 localStorage.setItem("token", res.data.accessToken);
//                 localStorage.setItem("user", JSON.stringify(res.data.user));
//                 navigate("/welcome");
//             }
//         } catch (err) {
//             setError(err.response?.data?.message || "Invalid credentials");
//         }
//     };

//     return (
//         <div
//             style={{
//                 height: "100vh",
//                 width: "100vw",
//                 display: "flex",
//                 justifyContent: "center",      // LEFT aligned
//                 alignItems: "center",
//                 overflow: "hidden",
//                 background:
//                     "url('https://static.vecteezy.com/system/resources/thumbnails/014/468/621/small/abstract-digital-technology-background-with-concept-security-vector.jpg') center/cover no-repeat",
//                 backgroundAttachment: "fixed",
//                 position: "relative",
//                 paddingLeft: "10%",                // gap from left side
//             }}
//         >
//             {/* Blue overlay */}
//             <div
//                 style={{
//                     position: "absolute",
//                     inset: 0,
//                     background:
//                         "linear-gradient(135deg, rgba(0, 16, 42, 0.85), rgba(0, 52, 90, 0.75))",
//                     zIndex: 0,
//                 }}
//             />

//             {/* Login Box */}
//             <div
//                 style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "30px",
//                     position: "relative",
//                     zIndex: 1,
//                     padding: "55px 60px",
//                     background: "rgba(11, 23, 48, 0.78)",
//                     borderRadius: "20px",
//                     backdropFilter: "blur(12px)",
//                     boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
//                     border: "1px solid rgba(255,255,255,0.15)",
//                     width: "520px",                // wider login container
//                 }}
//             >
//                 {/* Lock Icon */}
//                 <div
//                     style={{
//                         paddingRight: "30px",
//                         borderRight: "1px solid rgba(255,255,255,0.25)",
//                     }}
//                 >
//                     <div
//                         style={{
//                             width: "95px",
//                             height: "95px",
//                             borderRadius: "18px",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             background:
//                                 "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
//                             border: "1px solid rgba(255,255,255,0.2)",
//                             boxShadow: "0 8px 32px rgba(0,0,0,0.37)",
//                         }}
//                     >
//                         <span style={{ fontSize: "50px" }}>🔐</span>
//                     </div>
//                 </div>

//                 {/* Form Area */}
//                 <div style={{ flex: 1 }}>
//                     <h2
//                         style={{
//                             marginBottom: "8px",
//                             color: "#fff",
//                             fontWeight: "800",
//                             fontSize: "28px",
//                         }}
//                     >
//                         Secure Login
//                     </h2>

//                     <p
//                         style={{
//                             marginBottom: "22px",
//                             fontSize: "14px",
//                             color: "#bcd4f0",
//                         }}
//                     >
//                         Welcome back to SOC Portal.
//                     </p>

//                     <form onSubmit={handleLogin}>
//                         {/* Username */}
//                         <div style={{ marginBottom: "18px" }}>
//                             <div
//                                 style={
//                                     focusedInput === "username"
//                                         ? { ...inputBox, ...activeInputBox }
//                                         : inputBox
//                                 }
//                             >
//                                 <span style={iconStyle}>👤</span>
//                                 <input
//                                     type="text"
//                                     name="username"
//                                     placeholder={
//                                         focusedInput === "username" ||
//                                             formData.username
//                                             ? ""
//                                             : "Enter Username"
//                                     }
//                                     value={formData.username}
//                                     onChange={handleChange}
//                                     onFocus={() => setFocusedInput("username")}
//                                     onBlur={() => setFocusedInput(null)}
//                                     style={inputField}
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         {/* Password */}
//                         <div style={{ marginBottom: "18px" }}>
//                             <div
//                                 style={
//                                     focusedInput === "password"
//                                         ? { ...inputBox, ...activeInputBox }
//                                         : inputBox
//                                 }
//                             >
//                                 <span style={iconStyle}>🔑</span>
//                                 <input
//                                     type="password"
//                                     name="password"
//                                     placeholder={
//                                         focusedInput === "password" ||
//                                             formData.password
//                                             ? ""
//                                             : "Enter Password"
//                                     }
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     onFocus={() => setFocusedInput("password")}
//                                     onBlur={() => setFocusedInput(null)}
//                                     style={inputField}
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         {/* Error */}
//                         {error && <p style={errorStyle}>{error}</p>}

//                         {/* Submit */}
//                         <button type="submit" style={loginBtn}>
//                             LOGIN
//                         </button>
//                     </form>

//                     <p style={bottomText}>
//                         Not registered yet?{" "}
//                         <Link to="/signup" style={linkStyle}>
//                             Create an account
//                         </Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// /* ==================== STYLES ==================== */

// // longer input width 🟦
// const inputBox = {
//     display: "flex",
//     alignItems: "center",
//     background: "rgba(0,0,0,0.35)",
//     padding: "16px 18px",
//     borderRadius: "12px",
//     border: "1px solid rgba(255,255,255,0.15)",
//     transition: "0.25s",
//     width: "100%",               // full width
//     maxWidth: "380px",           // bigger inputs
// };

// const activeInputBox = {
//     border: "1px solid rgba(79, 195, 247, 0.9)",
//     boxShadow: "0 0 12px rgba(79,195,247,0.65)",
// };

// const iconStyle = {
//     fontSize: "20px",
//     marginRight: "14px",
//     filter: "grayscale(100%) brightness(200%)",
// };

// const inputField = {
//     flex: 1,
//     border: "none",
//     outline: "none",
//     background: "transparent",
//     fontSize: "16px",
//     color: "#fff",
// };

// const loginBtn = {
//     width: "100%",
//     maxWidth: "380px",
//     padding: "14px",
//     borderRadius: "12px",
//     border: "none",
//     cursor: "pointer",
//     background: "linear-gradient(135deg, #2196f3, #1565c0)",
//     color: "white",
//     fontWeight: "bold",
//     fontSize: "16px",
//     marginTop: "5px",
// };

// const errorStyle = {
//     color: "#ff8a80",
//     background: "rgba(255,0,0,0.18)",
//     padding: "8px",
//     borderRadius: "8px",
//     textAlign: "center",
//     marginBottom: "10px",
//     width: "100%",
//     maxWidth: "380px",
// };

// const bottomText = {
//     marginTop: "20px",
//     fontSize: "14px",
//     color: "#d1e3ff",
//     textAlign: "center",
// };

// const linkStyle = {
//     color: "#4fc3f7",
//     fontWeight: "700",
//     textDecoration: "none",
// };

// export default Login;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../utils/authContext";

const Login = () => {
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
        role: "analyst", // Default role
    });

    const [focusedInput, setFocusedInput] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { success, error } = await login(formData.identifier, formData.password, formData.role);
            if (success) {
                navigate("/");
            } else {
                setError(error || "Invalid credentials");
                navigate("/welcome");
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred");
            navigate("/welcome");
        }
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center overflow-hidden relative bg-cover bg-center bg-fixed"
            style={{
                backgroundImage:
                    "url('https://static.vecteezy.com/system/resources/thumbnails/014/468/621/small/abstract-digital-technology-background-with-concept-security-vector.jpg')",
            }}
        >
            {/* Blue overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00102a]/90 to-[#00345a]/80 z-0" />

            {/* Login Box */}
            <div
                className="
                    relative z-10
                    flex flex-col sm:flex-row sm:items-center
                    gap-6 sm:gap-8
                    px-6 sm:px-10 py-8 sm:py-12
                    bg-[rgba(11,23,48,0.78)]
                    rounded-2xl
                    backdrop-blur-xl
                    shadow-[0_25px_60px_rgba(0,0,0,0.6)]
                    border border-white/15
                    w-[90%] max-w-[520px]
                "
            >
                {/* Lock Icon */}
                <div className="flex justify-center sm:justify-start sm:pr-8 sm:border-r sm:border-white/30 mb-4 sm:mb-0">
                    <div
                        className="
                            w-20 h-20 sm:w-[95px] sm:h-[95px]
                            rounded-2xl
                            flex items-center justify-center
                            bg-gradient-to-br from-white/20 to-white/5
                            border border-white/25
                            shadow-[0_8px_32px_rgba(0,0,0,0.37)]
                        "
                    >
                        <span className="text-4xl sm:text-5xl">🔐</span>
                    </div>
                </div>

                {/* Form Area */}
                <div className="flex-1 min-w-[230px]">
                    <h2 className="mb-2 text-white font-extrabold text-2xl sm:text-[28px]">
                        Secure Login
                    </h2>

                    <p className="mb-5 text-sm text-[#bcd4f0]">
                        Welcome back to SOC Portal.
                    </p>

                    <form onSubmit={handleLogin}>
                        {/* Identifier (Username/Email/Phone) */}
                        <div className="mb-4">
                            <div
                                className={`flex items-center bg-black/40 px-4 py-3 rounded-xl border transition w-full max-w-[380px]
                                    ${focusedInput === "identifier"
                                        ? "border-sky-300 shadow-[0_0_15px_rgba(79,195,247,0.7)]"
                                        : "border-white/20"
                                    }
                                `}
                            >
                                <span className="mr-3 text-lg filter grayscale brightness-200">
                                    👤
                                </span>
                                <input
                                    type="text"
                                    name="identifier"
                                    placeholder={
                                        focusedInput === "identifier" ||
                                            formData.identifier
                                            ? ""
                                            : "Username / Email / Phone"
                                    }
                                    value={formData.identifier}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedInput("identifier")}
                                    onBlur={() => setFocusedInput(null)}
                                    className="flex-1 bg-transparent outline-none border-none text-base text-white placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <div
                                className={`flex items-center bg-black/40 px-4 py-3 rounded-xl border transition w-full max-w-[380px]
                                    ${focusedInput === "password"
                                        ? "border-sky-300 shadow-[0_0_15px_rgba(79,195,247,0.7)]"
                                        : "border-white/20"
                                    }
                                `}
                            >
                                <span className="mr-3 text-lg filter grayscale brightness-200">
                                    🔑
                                </span>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder={
                                        focusedInput === "password" ||
                                            formData.password
                                            ? ""
                                            : "Enter Password"
                                    }
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedInput("password")}
                                    onBlur={() => setFocusedInput(null)}
                                    className="flex-1 bg-transparent outline-none border-none text-base text-white placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="mb-4">
                            <div className="flex items-center bg-black/40 px-4 py-3 rounded-xl border border-white/20 w-full max-w-[380px]">
                                <span className="mr-3 text-lg filter grayscale brightness-200">
                                    🛡️
                                </span>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="flex-1 bg-transparent outline-none border-none text-base text-white cursor-pointer [&>option]:bg-[#0b1730] [&>option]:text-white"
                                >
                                    <option value="analyst">Analyst</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-sm text-red-200 bg-red-500/20 px-3 py-2 rounded-lg text-center mb-3 w-full max-w-[380px]">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="
                                w-full max-w-[380px]
                                mt-1
                                py-3
                                rounded-xl
                                border-none
                                bg-gradient-to-tr from-sky-500 to-blue-700
                                text-white font-bold text-sm sm:text-base
                                cursor-pointer
                                shadow-lg hover:shadow-xl
                                transition
                            "
                        >
                            LOGIN
                        </button>

                        <div className="my-4 flex items-center justify-between w-full max-w-[380px]">
                            <hr className="w-full border-gray-600" />
                            <span className="px-2 text-gray-400 text-sm">OR</span>
                            <hr className="w-full border-gray-600" />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_GOOGLE_CALLBACK_URL}&response_type=code&scope=email%20profile&prompt=consent`;
                                window.location.href = googleAuthUrl;
                            }}
                            className="
                                w-full max-w-[380px]
                                py-3
                                rounded-xl
                                border border-white/20
                                bg-white/10 hover:bg-white/20
                                text-white font-bold text-sm sm:text-base
                                cursor-pointer
                                transition
                                flex items-center justify-center gap-2
                            "
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                            Sign in with Google
                        </button>
                    </form>

                    <p className="mt-5 text-sm text-[#d1e3ff] text-center">
                        Not registered yet?{" "}
                        <Link
                            to="/signup"
                            className="text-sky-300 font-bold hover:underline"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Login;

