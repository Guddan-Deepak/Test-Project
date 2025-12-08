import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Database,
    Code,
    Terminal,
    Key,
    Scan,
    Unlock,
    FileWarning,
    WifiOff
} from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'SQL Injection', path: '/sqli', icon: Database },
        { name: 'XSS Attack', path: '/xss', icon: Code },
        { name: 'Command Injection (RCE)', path: '/rce', icon: Terminal },
        { name: 'Token Abuse', path: '/token-abuse', icon: Key },
        //  { name: 'Port Scan', path: '/port-scan', icon: Scan },
        { name: 'Bruteforce Login', path: '/bruteforce', icon: Unlock },
        { name: 'File Upload Malware', path: '/malware', icon: FileWarning, disabled: true },
        { name: 'DDoS Simulation', path: '/ddos', icon: WifiOff, disabled: true },
    ];

    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    SOC Attack
                    <br />
                    Simulator
                </h1>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                            ${isActive
                                ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-800/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                        `}
                    >
                        <item.icon size={18} />
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
