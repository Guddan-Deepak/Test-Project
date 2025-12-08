import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../utils/authContext';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { SocketProvider } from '../context/SocketContext';
import { LayoutDashboard, ScrollText, AlertTriangle, LogOut, Activity, User, Menu, X } from 'lucide-react';
import ChatWidget from '../components/Chatbot/ChatWidget';

import socLogo from '../assets/soc-logo.png';

const DashboardLayout = () => {
    const { isAuthenticated, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Global Chat State
    const [chatState, setChatState] = useState({
        isOpen: false,
        incidentId: null,
        initialMsg: null
    });

    React.useEffect(() => {
        const verifyUser = async () => {
            if (authLoading) return;

            if (!isAuthenticated) {
                navigate("/login");
                return;
            }

            try {
                // Fetch fresh user data from backend
                const { data } = await api.get("/auth/me");
                if (data.success) {
                    console.log(data)
                    if (data.data.role !== 'analyst') {
                        // Redirect non-analysts
                        navigate("/");
                    } else {
                        setUser(data.data);
                        setLoading(false);
                    }
                } else {
                    navigate("/login");
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                // navigate("/login"); // Context handles auth state, but we might want to redirect if fetching user fails
            }
        };

        verifyUser();
    }, [isAuthenticated, authLoading, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    }

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('logs')) return 'Live Logs';
        if (path.includes('incidents')) return 'Incidents';
        return 'Overview';
    }

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#0B1120] text-cyan-500">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent" />
            </div>
        );
    }

    return (
        <SocketProvider>
            <div className="flex h-screen bg-[#0B1120] text-slate-100 overflow-hidden font-sans selection:bg-cyan-500/30">

                {/* Mobile Header (Hidden on Desktop) */}
                <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between px-4 z-40 shadow-lg">
                    <button onClick={toggleMobileMenu} className="text-slate-400 hover:text-white transition-colors">
                        <Menu size={28} />
                    </button>
                    <div className="flex-1 flex justify-center">
                        <img src={socLogo} alt="SOC Platform" className="h-10 object-contain" />
                    </div>
                    {/* Spacer to balance the Menu button */}
                    <div className="w-7"></div>
                </div>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
                        onClick={closeMobileMenu}
                    ></div>
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
                    md:relative md:translate-x-0 md:flex md:shadow-xl
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    {/* Logo Area (Desktop) & Mobile Header in Drawer */}
                    <div className="p-4 border-b border-slate-800/50 flex justify-center relative flex-col items-center">
                        <img src={socLogo} alt="SOC Platform" className="h-24 object-contain" />

                        {/* Mobile Close Button */}
                        <button onClick={closeMobileMenu} className="absolute top-4 right-4 text-slate-500 hover:text-white md:hidden transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Main Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        <NavLink
                            to="/dashboard"
                            end
                            onClick={closeMobileMenu}
                            className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 text-base font-medium rounded-lg transition-all duration-200 border-l-2 ${isActive ? 'bg-slate-800/50 text-cyan-400 border-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'}`}
                        >
                            <LayoutDashboard size={22} />
                            <span>Overview</span>
                        </NavLink>
                        <NavLink
                            to="/dashboard/logs"
                            onClick={closeMobileMenu}
                            className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 text-base font-medium rounded-lg transition-all duration-200 border-l-2 ${isActive ? 'bg-slate-800/50 text-cyan-400 border-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'}`}
                        >
                            <ScrollText size={22} />
                            <span>Live Logs</span>
                        </NavLink>
                        <NavLink
                            to="/dashboard/incidents"
                            onClick={closeMobileMenu}
                            className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 text-base font-medium rounded-lg transition-all duration-200 border-l-2 ${isActive ? 'bg-slate-800/50 text-cyan-400 border-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'}`}
                        >
                            <AlertTriangle size={22} />
                            <span>Incidents</span>
                        </NavLink>

                        {/* Analyst Permissions (Static Visualization) */}
                        <div className="mt-8 px-4">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Analyst Permissions</h3>
                            <div className="space-y-3">
                                {['View Logs', 'View Incidents', 'Update Status', 'Add Notes'].map((perm, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-400 cursor-default group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] group-hover:scale-125 transition-transform"></div>
                                        <span className="group-hover:text-slate-300 transition-colors">{perm}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </nav>

                    {/* User / Logout */}
                    <div className="p-4 border-t border-slate-800/50">
                        <div className="flex items-center gap-3 px-3 py-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-600">
                                {user?.username?.substring(0, 2).toUpperCase() || "AN"}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{user?.username || "analyst"}</p>
                                <p className="text-xs text-slate-500 truncate capitalize">{user?.role || "analyst"}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
                    <header className="hidden md:flex h-16 bg-[#0F172A] border-b border-slate-800 items-center justify-between px-8 z-10 w-full">
                        {/* Breadcrumb / Title */}
                        <div>
                            <h2 className="text-lg font-medium text-cyan-400">{getPageTitle()}</h2>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-full border border-slate-700">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-medium text-emerald-400 tracking-wide">Live Monitoring</span>
                            </div>

                            <div className="flex items-center gap-4 pl-6 border-l border-slate-700">
                                <NavLink to="/analyst/profile" className="text-right hidden sm:block hover:bg-slate-800/50 p-2 rounded transition-colors group cursor-pointer">
                                    <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">{user?.username || "analyst"}</p>
                                    <p className="text-xs text-slate-500 capitalize">{user?.role || "Analyst"}</p>
                                </NavLink>
                                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Logout">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Scrollable Content */}
                    <main className="flex-1 overflow-auto bg-[#0B1120] relative scroll-smooth w-full">
                        <Outlet context={{
                            openChat: (incidentId = null, initialMsg = null) => {
                                setChatState({ isOpen: true, incidentId, initialMsg });
                            }
                        }} />
                    </main>

                    <ChatWidget
                        isOpen={chatState.isOpen}
                        onClose={() => setChatState(prev => ({ ...prev, isOpen: false }))}
                        onOpen={() => setChatState(prev => ({ ...prev, isOpen: true }))}
                        incidentId={chatState.incidentId}
                        initialMsg={chatState.initialMsg}
                    />
                </div>
            </div>
        </SocketProvider>
    );
};

export default DashboardLayout;
