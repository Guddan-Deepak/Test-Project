import React from 'react';
import { Shield } from 'lucide-react';

const Header = () => {
    return (
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 z-10 shadow-md">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-red-500 font-bold text-sm tracking-widest">LIVE</span>
                </div>
                <span className="text-gray-600">|</span>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Attacker:</span>
                    <span className="text-cyan-400 font-mono font-semibold">RedTeam_Alpha</span>
                </div>
            </div>

            <div className="text-gray-500 text-xs font-mono">
                SOC Attack Simulator v1.0
            </div>
        </header>
    );
};

export default Header;
