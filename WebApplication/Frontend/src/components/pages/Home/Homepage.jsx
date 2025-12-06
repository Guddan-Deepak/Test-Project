import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../utils/authContext";

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-screen w-full bg-[#071529] text-white px-6 py-10">

            {/* STATUS BADGE */}
            <div className="flex justify-center mb-8">
                <div className="px-6 py-2 rounded-full bg-red-900/30 border border-red-500 text-red-400 font-semibold text-sm flex items-center gap-2">
                    <span>🛡️</span> COMMAND CENTER ACTIVE
                </div>
            </div>

            {/* HERO SECTION */}
            <h1 className="text-center text-4xl font-bold mb-2 text-blue-300">
                Welcome back, {user?.name || "User"}
            </h1>
            <p className="text-center text-gray-400 text-lg mb-12">
                Your security dashboard is live. Monitoring threats across the Morphin Grid.
            </p>

            {/* QUICK ACTIONS TITLE */}
            <h2 className="text-2xl font-semibold mb-4 text-blue-200">
                Quick Actions
            </h2>

            {/* ACTION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1 */}
                <div
                    className="bg-gradient-to-br from-[#0c203d] to-[#0a1a33] p-6 rounded-xl border border-blue-900/40 shadow-lg hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
                    onClick={() => navigate("/security-logs")}
                >
                    <div className="text-blue-400 text-4xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold text-blue-200 mb-2">View Security Logs</h3>
                    <p className="text-gray-400 text-sm">Monitor real-time threat events</p>
                </div>

                {/* Card 2 */}
                <div
                    className="bg-gradient-to-br from-[#0c203d] to-[#0a1a33] p-6 rounded-xl border border-blue-900/40 shadow-lg hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
                    onClick={() => navigate("/incidents")}
                >
                    <div className="text-yellow-400 text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-blue-200 mb-2">Manage Incidents</h3>
                    <p className="text-gray-400 text-sm">Review and resolve alerts</p>
                </div>

                {/* Card 3 */}
                <div
                    className="bg-gradient-to-br from-[#0c203d] to-[#0a1a33] p-6 rounded-xl border border-blue-900/40 shadow-lg hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
                    onClick={() => navigate("/analytics")}
                >
                    <div className="text-purple-400 text-4xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-blue-200 mb-2">View Analytics</h3>
                    <p className="text-gray-400 text-sm">Analyze threat patterns & trends</p>
                </div>

            </div>

            {/* RECENT DATA SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

                <div className="bg-gradient-to-br from-[#0c203d] to-[#0a1a33] p-6 rounded-xl border border-blue-900/40 shadow-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-blue-300">Recent Security Logs</h3>
                        <button className="text-red-400 hover:text-red-300 text-sm">View All</button>
                    </div>
                    <p className="text-gray-500 mt-6 text-center">No logs yet</p>
                </div>

                <div className="bg-gradient-to-br from-[#0c203d] to-[#0a1a33] p-6 rounded-xl border border-blue-900/40 shadow-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-blue-300">Recent Incidents</h3>
                        <button className="text-red-400 hover:text-red-300 text-sm">View All</button>
                    </div>
                    <p className="text-gray-500 mt-6 text-center">No incidents yet</p>
                </div>

            </div>

            {/* STATIC INFORMATION SECTION */}
            <div className="bg-gradient-to-br from-[#081a33] to-[#071529] mt-14 p-8 rounded-xl border border-blue-900/40 shadow-xl">
                <h2 className="text-2xl font-bold text-blue-300 mb-4">
                    How This Security System Works
                </h2>

                <ul className="space-y-3 text-gray-300 leading-relaxed">
                    <li>🔹 Continuously monitors suspicious system & network activity.</li>
                    <li>🔹 Logs all events in real-time for detailed analysis.</li>
                    <li>🔹 The Incident Manager tracks all critical security alerts.</li>
                    <li>🔹 Threat Analytics uses advanced ML models for anomaly detection.</li>
                    <li>🔹 Admins can investigate, resolve, and document threat events.</li>
                    <li>🔹 System protects backend APIs, auth routes, and user activity 24/7.</li>
                </ul>
            </div>

        </div>
    );
};

export default HomePage;
