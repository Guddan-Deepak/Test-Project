import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get("token");
            const role = searchParams.get("role");

            if (!token || !role) {
                setStatus("error");
                setMessage("Invalid verification link.");
                return;
            }

            try {
                await api.get(`/auth/verify-email?token=${token}&role=${role}`);
                setStatus("success");
                setMessage("Email verified successfully! Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000);
            } catch (error) {
                setStatus("error");
                setMessage(error.response?.data?.message || "Verification failed or link expired.");
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
                <div className={`text-lg ${status === "success" ? "text-green-400" : status === "error" ? "text-red-400" : "text-blue-400"}`}>
                    {message}
                </div>
                {status === "error" && (
                    <button
                        onClick={() => navigate("/login")}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
                    >
                        Go to Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
