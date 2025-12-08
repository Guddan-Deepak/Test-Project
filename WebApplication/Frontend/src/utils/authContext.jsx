
import { createContext, useContext, useState, useEffect } from "react";
import api from "./api"; // Ensure api instance is imported for cleanup call
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const SERVER_URL = import.meta.env.VITE_SERVER.replace(/\/$/, ""); // Ensure no trailing slash
    const API_URL = `${SERVER_URL}/auth`;

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch(`${API_URL}/verify`, {
                credentials: 'include'
            });

            if (response.ok) {
                // Check if response is JSON
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await response.json();
                    setIsAuthenticated(data.data.isAuthenticated);
                } else {
                    // Not JSON, likely HTML error page
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (identifier, password, role) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password, role }),
                credentials: 'include'
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || contentType.indexOf("application/json") === -1) {
                // Try to get text to see what happened (e.g. 404 HTML)
                const text = await response.text();
                console.error("Non-JSON response:", text);
                return { success: false, error: 'Server returned an invalid response (not JSON). Check API URL.' };
            }

            const data = await response.json();

            if (response.ok && data.success) {
                const responseData = data.data;
                localStorage.setItem("token", responseData.accessToken);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, error: data.message || 'Login failed' };
        } catch (error) {
            return { success: false, error: error.message || "Network error" };
        }
    };

    const autoLogin = () => {
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            // 1. Wipe Chat History (Redis)
            await api.delete('/ai/history').catch(err => console.warn("Failed to clear chat history", err));

            // 2. Call Backend Logout
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            localStorage.removeItem("token");
        }
    };

    const sendLoginOTP = async (email, userType) => {
        try {
            const response = await fetch(`${API_URL}/send-login-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, userType }),
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                if (response.ok) return { success: true, message: data.message };
                return { success: false, error: data.message || 'Failed to send OTP' };
            }
            return { success: false, error: 'Server returned non-JSON response.' };

        } catch (error) {
            return { success: false, error: 'Network error or server unreachable.' };
        }
    };

    const loginWithOTP = async (email, otp, role) => {
        try {
            // Adjust endpoint if needed. Assuming these are also under /api/v1/auth
            let endpoint = '';
            if (role === 'patient') {
                endpoint = '/login/patient-with-otp';
            } else if (role === 'practitioner') {
                endpoint = '/login/practitioner-with-otp';
            } else if (role === 'admin') {
                endpoint = '/login/admin-with-otp';
            } else {
                return { success: false, error: 'OTP login not supported for this role.' };
            }

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
                credentials: 'include'
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                if (response.ok) {
                    setIsAuthenticated(true);
                    return { success: true, user: data.data.user };
                }
                return { success: false, error: data.message || 'OTP verification failed.' };
            }
            return { success: false, error: 'Server returned non-JSON response.' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            login,
            logout,
            autoLogin,
            loading,
            sendLoginOTP,
            loginWithOTP
        }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);
