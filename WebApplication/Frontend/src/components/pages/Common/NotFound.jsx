import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-full bg-[#050511] flex flex-col items-center justify-end pb-20 relative overflow-hidden">
            {/* Background Image Container */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/bg-404-space.png')"
                }}
            ></div>

            {/* Navigation Button */}
            <button
                onClick={() => navigate('/')}
                className="
                    relative z-10
                    group flex items-center gap-3 
                    bg-white/10 hover:bg-white/20 
                    backdrop-blur-md border border-white/20 hover:border-blue-400
                    text-white px-8 py-3 rounded-full 
                    font-semibold text-lg hover:text-blue-300
                    transition-all duration-300 transform hover:scale-105
                    shadow-[0_0_15px_rgba(0,0,0,0.5)]
                    hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]
                "
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Home</span>
                <Home className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
            </button>
        </div>
    );
};

export default NotFound;
