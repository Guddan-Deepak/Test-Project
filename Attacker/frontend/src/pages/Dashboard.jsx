import React, { useEffect, useState } from 'react';
import { Zap, Target, Shield, Activity, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Total Attacks', value: 0, color: 'bg-blue-500', icon: Zap },
        { label: 'Blocked', value: 0, color: 'bg-green-500', icon: Shield },
        { label: 'Failed (4xx)', value: 0, color: 'bg-red-500', icon: Target },
        { label: 'Successful', value: 0, color: 'bg-orange-500', icon: Activity },
    ]);
    const [attackTypes, setAttackTypes] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch a large chunk of latest logs to calculate stats
                // In production, you'd use a specific /stats endpoint, but we'll compute client-side for now
                const res = await axios.get('http://localhost:8000/api/v1/logs?limit=500');
                const logs = res.data?.data?.logs || [];

                // 1. Calculate Stats
                const total = logs.filter(l => l.category === 'SECURITY' || l.classification === 'CONFIRMED_ATTACK').length;
                const blocked = logs.filter(l => l.statusCode === 403 || l.classification === 'CONFIRMED_ATTACK').length;
                const failed = logs.filter(l => l.statusCode >= 400 && l.statusCode !== 403).length; // 4xx but not 403 (e.g. 401, 404, 429)
                const successful = logs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length; // 2xx

                setStats([
                    { label: 'Total Threats', value: total, color: 'bg-blue-600', icon: Zap },
                    { label: 'Blocked Threats', value: blocked, color: 'bg-green-600', icon: Shield },
                    { label: 'Failed Attempts', value: failed, color: 'bg-red-600', icon: Shield }, // Renamed Icon to reuse or different
                    { label: 'Successful Req', value: successful, color: 'bg-orange-600', icon: Activity },
                ]);

                // 2. Calculate Attack Types (for Pie Chart)
                const typeCounts = {};
                logs.forEach(l => {
                    const type = l.eventType || 'Unknown';
                    // Only count interesting events, not generic HTTP stuff if possible, or count all
                    if (l.category === 'SECURITY' || l.eventType.includes('DETECTED') || l.eventType === 'HTTP_REQUEST') {
                        typeCounts[type] = (typeCounts[type] || 0) + 1;
                    }
                });

                // Format for Recharts
                const pieData = Object.keys(typeCounts).map(type => ({
                    name: type.replace(/_/g, ' '),
                    value: typeCounts[type]
                })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5

                setAttackTypes(pieData);

                // 3. Recent Activity (Take top 5 logs)
                const recent = logs.slice(0, 5).map(l => ({
                    id: l._id.slice(-4),
                    type: l.eventType || "Request",
                    status: l.classification === 'CONFIRMED_ATTACK' ? 'BLOCKED' : l.statusCode >= 400 ? 'FAILED' : 'COMPLETED',
                    time: new Date(l.timestamp).toLocaleTimeString(),
                    msg: l.details?.patternMatched || l.details?.message || "Traffic detected",
                    severity: l.severity || 'LOW'
                }));
                setRecentActivity(recent);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Optional: Poll every 5s
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Live Threat Dashboard</h2>
                <p className="text-gray-400 text-sm mt-1">Real-time metrics from the SOC Engine</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className={`relative overflow-hidden rounded-xl p-6 ${stat.color} shadow-lg group hover:scale-[1.02] transition-transform`}>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-white/80 text-sm font-medium mb-1">{stat.label}</p>
                                <h3 className="text-white text-3xl font-bold">
                                    {loading ? "..." : stat.value}
                                </h3>
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <stat.icon size={24} className="text-white" />
                            </div>
                        </div>
                        {/* Decorative Background Circles */}
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="absolute -left-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Table */}
                <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-cyan-400" /> Recent Traffic
                    </h3>
                    <div className="space-y-4">
                        {loading && <div className="text-center text-gray-500">Loading live data...</div>}
                        {!loading && recentActivity.length === 0 && <div className="text-center text-gray-500">No recent activity found.</div>}
                        {recentActivity.map((activity) => (
                            <div key={activity.id + Math.random()} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-800/30 border border-gray-700/30 rounded-lg hover:border-gray-600 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-blue-400 font-mono text-xs">#{activity.id}</span>
                                        <span className={`font-medium ${activity.severity === 'CRITICAL' ? 'text-red-400' : 'text-gray-200'}`}>
                                            {activity.type}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-xs font-mono break-all line-clamp-1">{activity.msg}</p>
                                </div>

                                <div className="flex items-center gap-4 mt-3 md:mt-0">
                                    <span className="text-gray-500 text-xs font-mono">{activity.time}</span>
                                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${activity.status === 'BLOCKED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                            activity.status === 'FAILED' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                'bg-green-500/10 text-green-500 border border-green-500/20'
                                        }`}>
                                        {activity.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attack Distribution Chart */}
                <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center gap-2">
                        <PieIcon size={18} className="text-cyan-400" /> Attack Distribution
                    </h3>
                    <div className="flex-1 w-full min-h-[250px] relative">
                        {loading && <div className="absolute inset-0 flex items-center justify-center text-gray-500">Loading chart...</div>}
                        {!loading && attackTypes.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={attackTypes}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {attackTypes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                                        itemStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            !loading && <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">No data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
