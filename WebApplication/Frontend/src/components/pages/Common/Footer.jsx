// const Footer = () => {
//     return (
//         <footer className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 border-t border-purple-200 py-6 mt-12">
//             <div className="max-w-7xl mx-auto text-center text-purple-700 text-sm flex flex-col items-center gap-2">
//                 <p className="font-medium">
//                     © {new Date().getFullYear()} <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">FAMLY</span> — Where memories live forever 💜
//                 </p>
//                 <p className="text-xs text-purple-500">
//                     Try hack me
//                 </p>
//             </div>
//         </footer>

//     );
// };

// export default Footer;

import React from 'react';
import { Github, Twitter, Linkedin, Shield } from 'lucide-react'; // Changed Leaf to Shield for the logo icon

const Footer = () => {
    // Colors based on the requested dark theme (Deep Navy/Slate)
    const bgColor = "bg-gradient-to-r from-[#102544] to-[#0a457a]"; // Main dark navy/slate background
    const secondaryBgColor = "bg-[#101721]"; // Darker background for copyright area
    const linkTextColor = "text-gray-300 hover:text-sky-400 transition-colors";
    const headingColor = "text-white";
    const descriptionColor = "text-gray-400";
    const accentColor = "text-green-500"; // Green accent for the logo icon

    return (
        <footer className={`${bgColor}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-b border-gray-700 pb-10">

                    {/* Column 1: Logo and Description */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <div className="flex items-center space-x-2">
                            <img src="/soc-logo.png" alt="Shield Logo" className="w-10 h-10" />
                        </div>
                        <p className={`text-sm ${descriptionColor}`}>
                            Advanced cyber-defense system protecting the Morphin Grid from digital threats.
                        </p>
                    </div>

                    {/* Column 2: Product Links */}
                    <div className="space-y-4">
                        <h4 className={`text-lg font-semibold ${headingColor}`}>Product</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className={`text-sm ${linkTextColor}`}>Features</a></li>
                            <li><a href="#" className={`text-sm ${linkTextColor}`}>Documentation</a></li>
                            <li><a href="#" className={`text-sm ${linkTextColor}`}>API Reference</a></li>
                            <li><a href="#" className={`text-sm ${linkTextColor}`}>Integrations</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Company Links */}
                    <div className="space-y-4">
                        <h4 className={`text-lg font-semibold ${headingColor}`}>Company</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className={`text-sm ${linkTextColor}`}>About Us</a></li>
                            <li><a href="#" className={`text-sm ${linkTextColor}`}>Careers</a></li>
                            <li><a href="#" className={`text-sm ${linkTextColor}`}>Contact</a></li>
                            <li><a href="#" className={`text-sm ${linkTextColor}`}>Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Connect & Social Icons */}
                    <div className="space-y-4">
                        <h4 className={`text-lg font-semibold ${headingColor}`}>Connect</h4>
                        <div className="flex space-x-3">
                            {/* Social Icon Styling: dark background, light hover */}
                            <a
                                href="#"
                                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5 text-gray-400 hover:text-white" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5 text-gray-400 hover:text-white" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="pt-8 text-center">
                    <p className={`text-sm ${descriptionColor}`}>
                        © {new Date().getFullYear()} Shield Command Center. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;