import React, { useState } from "react";
import api from '../../../utils/api';
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "analyst",
        phone_no: "",
        profilePhoto: null,
    });

    const [focusedInput, setFocusedInput] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, profilePhoto: e.target.files[0] });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("role", formData.role);
        data.append("phone_no", formData.phone_no);
        if (formData.profilePhoto) {
            data.append("profilePhoto", formData.profilePhoto);
        }

        try {
            const endpoint = formData.role === "admin" ? "/auth/register/admin" : "/auth/register/analyst";
            const res = await api.post(endpoint, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.success) {
                navigate("/login");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed");
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

            {/* Signup Box */}
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
                    w-[90%] max-w-[600px]
                "
            >
                {/* Lock Icon */}
                <div className="hidden sm:flex justify-center sm:justify-start sm:pr-8 sm:border-r sm:border-white/30 mb-4 sm:mb-0">
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
                        <span className="text-4xl sm:text-5xl">🔒</span>
                    </div>
                </div>

                {/* Form Area */}
                <div className="flex-1 min-w-[230px]">
                    <h2 className="mb-2 text-white font-extrabold text-2xl sm:text-[28px]">
                        Create Account
                    </h2>
                    <p className="mb-5 text-sm text-[#bcd4f0]">
                        Join the SOC Portal today.
                    </p>

                    <form onSubmit={handleSignup} className="space-y-3">
                        {/* Name */}
                        <div
                            className={`flex items-center bg-black/40 px-4 py-3 rounded-xl border transition w-full
                                ${focusedInput === "name" ? "border-sky-300 shadow-[0_0_15px_rgba(79,195,247,0.7)]" : "border-white/20"}
                            `}
                        >
                            <span className="mr-3 text-lg filter grayscale brightness-200">👤</span>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                onFocus={() => setFocusedInput("name")}
                                onBlur={() => setFocusedInput(null)}
                                className="flex-1 bg-transparent outline-none border-none text-base text-white placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div
                            className={`flex items-center bg-black/40 px-4 py-3 rounded-xl border transition w-full
                                ${focusedInput === "email" ? "border-sky-300 shadow-[0_0_15px_rgba(79,195,247,0.7)]" : "border-white/20"}
                            `}
                        >
                            <span className="mr-3 text-lg filter grayscale brightness-200">📧</span>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => setFocusedInput("email")}
                                onBlur={() => setFocusedInput(null)}
                                className="flex-1 bg-transparent outline-none border-none text-base text-white placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div
                            className={`flex items-center bg-black/40 px-4 py-3 rounded-xl border transition w-full
                                ${focusedInput === "phone_no" ? "border-sky-300 shadow-[0_0_15px_rgba(79,195,247,0.7)]" : "border-white/20"}
                            `}
                        >
                            <span className="mr-3 text-lg filter grayscale brightness-200">📱</span>
                            <input
                                type="text"
                                name="phone_no"
                                placeholder="Mobile Number"
                                value={formData.phone_no}
                                onChange={handleChange}
                                onFocus={() => setFocusedInput("phone_no")}
                                onBlur={() => setFocusedInput(null)}
                                className="flex-1 bg-transparent outline-none border-none text-base text-white placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div
                            className={`flex items-center bg-black/40 px-4 py-3 rounded-xl border transition w-full
                                ${focusedInput === "password" ? "border-sky-300 shadow-[0_0_15px_rgba(79,195,247,0.7)]" : "border-white/20"}
                            `}
                        >
                            <span className="mr-3 text-lg filter grayscale brightness-200">🔑</span>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => setFocusedInput("password")}
                                onBlur={() => setFocusedInput(null)}
                                className="flex-1 bg-transparent outline-none border-none text-base text-white placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="flex items-center bg-black/40 px-4 py-3 rounded-xl border border-white/20 w-full">
                            <span className="mr-3 text-lg filter grayscale brightness-200">🛡️</span>
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

                        {/* Profile Photo */}
                        <div className="flex items-center bg-black/40 px-4 py-3 rounded-xl border border-white/20 w-full">
                            <span className="mr-3 text-lg filter grayscale brightness-200">📷</span>
                            <input
                                type="file"
                                name="profilePhoto"
                                onChange={handleFileChange}
                                className="flex-1 bg-transparent outline-none border-none text-sm text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-sm text-red-200 bg-red-500/20 px-3 py-2 rounded-lg text-center w-full">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="
                                w-full
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
                            SIGN UP
                        </button>

                        <div className="my-2 flex items-center justify-between w-full">
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
                                w-full
                                py-2
                                rounded-lg
                                border border-white/20
                                bg-white/10 hover:bg-white/20
                                text-white font-medium text-sm
                                cursor-pointer
                                transition
                                flex items-center justify-center gap-2
                            "
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                            Sign up with Google
                        </button>
                    </form>

                    <p className="mt-4 text-sm text-[#d1e3ff] text-center">
                        Already registered?{" "}
                        <Link
                            to="/login"
                            className="text-sky-300 font-bold hover:underline"
                        >
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
