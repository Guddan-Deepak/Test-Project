import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";

const CompleteProfile = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: state?.name || "",
        email: state?.email || "",
        phone_no: "",
        role: "analyst",
        profilePhoto: state?.profilePhoto || ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!state?.email) {
        // Redirect if accessed directly without Google state
        setTimeout(() => navigate("/login"), 0);
        return null;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/auth/google-register", formData);
            localStorage.setItem("user", JSON.stringify(res.data.data.user));
            navigate("/welcome");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>

                <div className="flex justify-center mb-6">
                    <img
                        src={formData.profilePhoto}
                        alt="Profile"
                        className="w-20 h-20 rounded-full border-2 border-blue-500"
                    />
                </div>

                {error && <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            disabled
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-gray-300 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-gray-300 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phone_no"
                            value={formData.phone_no}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500"
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="analyst">Analyst</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Finish Signup"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
