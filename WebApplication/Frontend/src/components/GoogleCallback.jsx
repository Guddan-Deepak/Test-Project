import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const processed = useRef(false);

    useEffect(() => {
        const handleCallback = async () => {
            if (processed.current) return;
            processed.current = true;

            const code = searchParams.get("code");
            if (!code) {
                navigate("/login");
                return;
            }

            try {
                const res = await api.post("/auth/google-login", { code });
                const { isNewUser, user, accessToken } = res.data.data;

                if (isNewUser) {
                    // Redirect to complete profile with pre-filled data
                    navigate("/complete-profile", { state: { ...res.data.data } });
                } else {
                    // Login successful
                    localStorage.setItem("user", JSON.stringify(user));
                    // Access token is handled by backend cookies usually, but if returned in JSON:
                    // localStorage.setItem("accessToken", accessToken); 
                    navigate("/welcome");
                }
            } catch (error) {
                console.error("Google Login Error:", error);
                navigate("/login");
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-xl animate-pulse">Processing Google Login...</div>
        </div>
    );
};

export default GoogleCallback;
