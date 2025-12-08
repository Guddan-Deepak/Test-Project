// import React from "react";
// import { useNavigate } from "react-router-dom";
// import useUser from "../../../hooks/useUser";

// const HomePage = () => {
//     const navigate = useNavigate();
//     const { user } = useUser();

//     return (
//         <div className="min-h-screen w-full bg-[#071529] text-white px-6 py-10">

//             {/* STATUS BADGE */}
//             <div className="flex justify-center mb-8">
//                 <div className="px-6 py-2 rounded-full bg-red-900/30 border border-red-500 text-red-400 font-semibold text-sm flex items-center gap-2">
//                     <span>🛡️</span> COMMAND CENTER ACTIVE
//                 </div>
//             </div>

//             {/* HERO SECTION */}
//             <h1 className="text-center text-4xl font-bold mb-2 text-blue-300">
//                 Welcome back, {user?.name || "User"}
//             </h1>
//             <p className="text-center text-gray-400 text-lg mb-12">
//                 Your security dashboard is live. Monitoring threats across the Morphin Grid.
//             </p>

//             {/* QUICK ACTIONS TITLE */}
//             <h2 className="text-2xl font-semibold mb-4 text-blue-200">
//                 Quick Actions
//             </h2>

//             {/* ACTION CARDS */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

//                 {/* Card 1 */}
//                 <div
//                     className="bg-gradient-to-br from-[#0c203d] to-[#0a1a33] p-6 rounded-xl border border-blue-900/40 shadow-lg hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
//                     onClick={() => navigate("/security-logs")}
//                 >
//                     <div className="text-blue-400 text-4xl mb-4">📄</div>
//                     <h3 className="text-xl font-semibold text-blue-200 mb-2">View Security Logs</h3>
//                     <p className="text-gray-400 text-sm">Monitor real-time threat events</p>
//                 </div>

//                 {/* Card 2 */}
//                 <div
//                     className="bg-gradient-to-br from-[#0c203d] to-[#0a1a33] p-6 rounded-xl border border-blue-900/40 shadow-lg hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
//                     onClick={() => navigate("/incidents")}
//                 >
//                     <div className="text-yellow-400 text-4xl mb-4">⚠️</div>
//                     <h3 className="text-xl font-semibold text-blue-200 mb-2">Manage Incidents</h3>
//                     <p className="text-gray-400 text-sm">Review and resolve alerts</p>
//                 </div>

//                 {/* Card 3 */}
//                 <div
//                     className="bg-gradient-to-br from-[#0c203d] to-[#0a1a33] p-6 rounded-xl border border-blue-900/40 shadow-lg hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
//                     onClick={() => navigate("/analytics")}
//                 >
//                     <div className="text-purple-400 text-4xl mb-4">📊</div>
//                     <h3 className="text-xl font-semibold text-blue-200 mb-2">View Analytics</h3>
//                     <p className="text-gray-400 text-sm">Analyze threat patterns & trends</p>
//                 </div>

//             </div>

//             {/* RECENT DATA SECTION */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

//                 <div className="bg-gradient-to-br from-[#0c203d] to-[#0a1a33] p-6 rounded-xl border border-blue-900/40 shadow-lg">
//                     <div className="flex justify-between items-center">
//                         <h3 className="text-lg font-semibold text-blue-300">Recent Security Logs</h3>
//                         <button className="text-red-400 hover:text-red-300 text-sm">View All</button>
//                     </div>
//                     <p className="text-gray-500 mt-6 text-center">No logs yet</p>
//                 </div>

//                 <div className="bg-gradient-to-br from-[#0c203d] to-[#0a1a33] p-6 rounded-xl border border-blue-900/40 shadow-lg">
//                     <div className="flex justify-between items-center">
//                         <h3 className="text-lg font-semibold text-blue-300">Recent Incidents</h3>
//                         <button className="text-red-400 hover:text-red-300 text-sm">View All</button>
//                     </div>
//                     <p className="text-gray-500 mt-6 text-center">No incidents yet</p>
//                 </div>

//             </div>

//             {/* STATIC INFORMATION SECTION */}
//             <div className="bg-gradient-to-br from-[#081a33] to-[#071529] mt-14 p-8 rounded-xl border border-blue-900/40 shadow-xl">
//                 <h2 className="text-2xl font-bold text-blue-300 mb-4">
//                     How This Security System Works
//                 </h2>

//                 <ul className="space-y-3 text-gray-300 leading-relaxed">
//                     <li>🔹 Continuously monitors suspicious system & network activity.</li>
//                     <li>🔹 Logs all events in real-time for detailed analysis.</li>
//                     <li>🔹 The Incident Manager tracks all critical security alerts.</li>
//                     <li>🔹 Threat Analytics uses advanced ML models for anomaly detection.</li>
//                     <li>🔹 Admins can investigate, resolve, and document threat events.</li>
//                     <li>🔹 System protects backend APIs, auth routes, and user activity 24/7.</li>
//                 </ul>
//             </div>

//         </div>
//     );
// };

// export default HomePage;
import React from "react";
import { useNavigate } from "react-router-dom";
import useUser from "../../../hooks/useUser";

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useUser();

    const quickActions = [
        { icon: "🛡️", title: "Threat Dashboard", desc: "Monitor live threats across all systems" },
        { icon: "⚡", title: "Incident Response", desc: "Investigate and resolve incidents quickly" },
        { icon: "📊", title: "Analytics", desc: "Track patterns and trends of threats" },
        { icon: "🔔", title: "Alerts & Notifications", desc: "Receive and configure real-time alerts" },
    ];

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-[#0a1326] to-[#07102a] text-white px-6 py-12">

            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-extrabold text-cyan-400 mb-4">
                    Welcome Back, {user?.name || "Operator"}
                </h1>
                <p className="text-gray-300 text-lg md:text-xl">
                    Your Cyber Command Center is active. Monitor, analyze, and secure your digital domain.
                </p>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {quickActions.map((action, i) => (
                    <div
                       
                        
                        className="bg-gradient-to-br from-[#0c203d] to-[#0a1a33] p-6 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer transform hover:scale-105 transition duration-300 border border-cyan-400/30"
                    >
                        <div className="text-5xl mb-4">{action.icon}</div>
                        <h3 className="text-xl font-semibold text-cyan-300 mb-2">{action.title}</h3>
                        <p className="text-gray-300 text-sm">{action.desc}</p>
                    </div>
                ))}
            </div>

            

          
            
            {/* Attack Types Section */}
            <div className="bg-gradient-to-br from-[#0a1e3f] to-[#071529] p-8 rounded-2xl shadow-xl border border-cyan-400/30 mt-16">
                <h2 className="text-3xl font-bold text-cyan-300 mb-6">
                    Attack Types Monitored & How We Mitigate Them
                </h2>

                <div className="space-y-8 text-gray-300">

                    {/* XSS */}
                    <div className="bg-[#071a36] p-6 rounded-xl border border-cyan-400/20 shadow-md hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold text-cyan-300 mb-2">🧪 XSS Attacks</h3>
                        <p className="mb-3">
                            Cross-Site Scripting attempts where attackers inject malicious scripts into applications.
                        </p>
                        <ul className="list-disc list-inside text-gray-300">
                            <li>Sanitize and validate user input</li>
                            <li>Implement CSP</li>
                            <li>Output encoding</li>
                            <li>Detection & blocking of suspicious payloads</li>
                        </ul>
                    </div>

                    {/* SQL Injection */}
                    <div className="bg-[#071a36] p-6 rounded-xl border border-cyan-400/20 shadow-md hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold text-cyan-300 mb-2">🗄️ SQL Injection</h3>
                        <p className="mb-3">
                            Malicious SQL queries aimed at extracting or altering database information.
                        </p>
                        <ul className="list-disc list-inside text-gray-300">
                            <li>Parameterized queries</li>
                            <li>Detection of risky SQL patterns</li>
                            <li>Query behavior monitoring</li>
                            <li>Least-privilege DB access</li>
                        </ul>
                    </div>

                    {/* Port Scans */}
                    <div className="bg-[#071a36] p-6 rounded-xl border border-cyan-400/20 shadow-md hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold text-cyan-300 mb-2">🛰️ Port Scans</h3>
                        <p className="mb-3">
                            Attackers scanning open ports to discover running services.
                        </p>
                        <ul className="list-disc list-inside text-gray-300">
                            <li>Rate limiting</li>
                            <li>Auto-blocking scanning IPs</li>
                            <li>Disable unused ports</li>
                            <li>Real-time detection</li>
                        </ul>
                    </div>

                    {/* Failed Logins */}
                    <div className="bg-[#071a36] p-6 rounded-xl border border-cyan-400/20 shadow-md hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold text-cyan-300 mb-2">🔑 Failed Login Attempts</h3>
                        <p className="mb-3">
                            Brute-force or credential stuffing attempts to break into accounts.
                        </p>
                        <ul className="list-disc list-inside text-gray-300">
                            <li>Account lockout policies</li>
                            <li>CAPTCHA & 2FA</li>
                            <li>IP blacklisting</li>
                            <li>Login anomaly detection</li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Removed glow-text CSS */}
            <style jsx>{`
                /* glow-text removed */
            `}</style>

        </div>
    );
};

export default HomePage;
