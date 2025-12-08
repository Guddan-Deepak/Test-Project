import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../utils/authContext';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Shield, FileText, Activity, Lock, BookOpen, AlertCircle, LogOut, Menu, X, Users, Settings } from 'lucide-react';
import ChatWidget from '../components/Chatbot/ChatWidget';

import socLogo from '../assets/soc-logo.png';

const AdminLayout = () => {
    const { isAuthenticated, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [chatState, setChatState] = useState({
        isOpen: false,
        incidentId: null,
        initialMsg: null
    });

    React.useEffect(() => {
        const verifyAdmin = async () => {
            if (authLoading) return;

            if (!isAuthenticated) {
                navigate("/login");
                return;
            }

            try {
                const { data } = await api.get("/auth/me");
                if (data.success) {
                    if (data.data.role !== 'admin') {
                        // Redirect non-admins to their dashboard or home
                        if (data.user.role === 'analyst') {
                            navigate("/dashboard");
                        } else {
                            navigate("/");
                        }
                    } else {
                        setUser(data.data);
                        setLoading(false);
                    }
                } else {
                    navigate("/login");
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                // navigate("/login"); // Auth context handles logout state
            }
        };

        verifyAdmin();
    }, [isAuthenticated, authLoading, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('rules')) return 'Detection Rules';
        if (path.includes('blocklist')) return 'Blocklist Manager';
        if (path.includes('incidents')) return 'Incident Management';
        if (path.includes('playbooks')) return 'Automation Playbooks';
        if (path.includes('users')) return 'User Management';
        if (path.includes('audit')) return 'Audit Logs';
        if (path.includes('settings')) return 'System Settings';
        return 'Admin Overview';
    }

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#0B1120] text-red-500">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0B1120] text-slate-100 overflow-hidden font-sans selection:bg-red-500/30">

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between px-4 z-40 shadow-lg">
                <button onClick={toggleMobileMenu} className="text-slate-400 hover:text-white transition-colors">
                    <Menu size={28} />
                </button>
                <div className="flex-1 flex justify-center">
                    <img src={socLogo} alt="SOC Admin" className="h-10 object-contain" />
                </div>
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
                <div className="p-4 border-b border-slate-800/50 flex justify-center relative flex-col items-center">
                    <img src={socLogo} alt="SOC Platform" className="h-24 object-contain" />
                    <div className="mt-2 px-2 py-0.5 bg-red-900/30 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded border border-red-900/50">
                        Admin Console
                    </div>
                    <button onClick={closeMobileMenu} className="absolute top-4 right-4 text-slate-500 hover:text-white md:hidden transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavLink to="/admin" end onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all border-l-2 ${isActive ? 'bg-slate-800/50 text-red-400 border-red-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'}`}>
                        <LayoutDashboard size={20} /> <span>Overview</span>
                    </NavLink>
                    <NavLink to="/admin/knowledge" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all border-l-2 ${isActive ? 'bg-slate-800/50 text-red-400 border-red-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'}`}>
                        <BookOpen size={20} /> <span>Knowledge Base</span>
                    </NavLink>
                    <NavLink to="/admin/blocklist" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all border-l-2 ${isActive ? 'bg-slate-800/50 text-red-400 border-red-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'}`}>
                        <Lock size={20} /> <span>Blocklist</span>
                    </NavLink>
                    <NavLink to="/admin/incidents" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all border-l-2 ${isActive ? 'bg-slate-800/50 text-red-400 border-red-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'}`}>
                        <AlertCircle size={20} /> <span>Incidents</span>
                    </NavLink>
                    <NavLink to="/admin/assignment-requests" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all border-l-2 ${isActive ? 'bg-slate-800/50 text-red-400 border-red-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'}`}>
                        <BookOpen size={20} /> <span>Requests</span>
                    </NavLink>
                    <NavLink to="/admin/playbooks" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all border-l-2 ${isActive ? 'bg-slate-800/50 text-red-400 border-red-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'}`}>
                        <BookOpen size={20} /> <span>Playbooks</span>
                    </NavLink>
                    <NavLink to="/admin/users" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all border-l-2 ${isActive ? 'bg-slate-800/50 text-red-400 border-red-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'}`}>
                        <Users size={20} /> <span>User Mgmt</span>
                    </NavLink>
                    <NavLink to="/admin/audit" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all border-l-2 ${isActive ? 'bg-slate-800/50 text-red-400 border-red-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'}`}>
                        <Activity size={20} /> <span>Audit Logs</span>
                    </NavLink>
                    <NavLink to="/admin/settings" onClick={closeMobileMenu} className={({ isActive }) => `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all border-l-2 ${isActive ? 'bg-slate-800/50 text-red-400 border-red-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-transparent'}`}>
                        <Settings size={20} /> <span>Settings</span>
                    </NavLink>
                </nav>

                {/* User / Logout */}
                <div className="p-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center text-xs font-bold text-red-200 border border-red-800">
                            AD
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                            <p className="text-xs text-slate-500 truncate capitalize">System Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
                <header className="hidden md:flex h-16 bg-[#0F172A] border-b border-slate-800 items-center justify-between px-8 z-10 w-full">
                    <div>
                        <h2 className="text-lg font-medium text-red-400">{getPageTitle()}</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-full border border-slate-700">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-xs font-medium text-red-400 tracking-wide">System Active</span>
                        </div>
                        <div className="flex items-center gap-4 pl-6 border-l border-slate-700">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-200">{user?.username}</p>
                                <p className="text-xs text-slate-500 capitalize">Administrator</p>
                            </div>
                            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto bg-[#0B1120] relative scroll-smooth w-full p-8 text-white">
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
    );
};

export default AdminLayout;
