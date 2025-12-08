import React from 'react';
import { Github, Twitter, Linkedin, Shield } from 'lucide-react';
import footerImage from '../../../assets/footer-image.png';

const Footer = () => {
    // Updated colors for black/gray/light blue theme
    const bgColor = "bg-black"; // Main background black
    const secondaryBgColor = "bg-gray-900"; // Dark gray for copyright area
    const linkTextColor = "text-gray-300 hover:text-sky-400 transition-colors"; // Light blue hover
    const headingColor = "text-gray-100"; // Light gray headings
    const descriptionColor = "text-gray-400"; // Gray descriptions
    const accentColor = "text-sky-400"; // Light blue accent for logo icon

    return (
        <footer className={`${bgColor}`} style={{ 
                backgroundImage: `url(${footerImage})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center' 
            }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-b border-gray-700 pb-10">

                    {/* Column 1: Logo and Description */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <div className="flex items-center space-x-2">
                            <img src="/soc-logo.png" alt="Shield Logo" className="w-10 h-10" />
                            <img src="/shield.png" alt="Logo" className="h-12 w-auto-2" />
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
                            <a
                                href="#"
                                className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5 text-gray-300 hover:text-sky-400" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5 text-gray-300 hover:text-sky-400" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5 text-gray-300 hover:text-sky-400" />
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
