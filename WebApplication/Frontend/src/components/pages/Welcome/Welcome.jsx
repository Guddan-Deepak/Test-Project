import React from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-[#0B1220] text-white">
            {/* HERO SECTION */}
            <div className="px-6 lg:px-20 pt-24 pb-32 bg-gradient-to-b from-[#0B1220] to-[#090f1a]">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl">
                    Anyone can learn <br />
                    <span className="text-blue-400">cyber security</span> with <br />
                    MicroSOC
                </h1>

                <div className="mt-4 w-24 h-1 bg-green-400 rounded-full"></div>

                <p className="text-gray-300 max-w-2xl text-lg mt-6">
                    Hands-on cyber security training through real-world scenarios.
                    Learn, practice, and grow into a professional defender.
                </p>

                <button
                    onClick={() => navigate("/login")}
                    className="mt-10 px-8 py-3 text-lg font-semibold rounded-xl
                    bg-green-500 hover:bg-green-600 transition-all duration-300 shadow-lg"
                >
                    Get Started
                </button>
            </div>

            {/* FEATURES SECTION */}
            <div className="bg-[#0f172a] py-20 px-6 lg:px-20 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Real-world offensive & defensive cyber security training
                </h2>
                <div className="w-24 h-1 bg-green-400 mx-auto mb-6"></div>

                <p className="text-gray-300 max-w-3xl mx-auto mb-14">
                    Access immersive labs, training modules and guided lessons suitable for everyone—from beginners to experts.
                </p>

                {/* ICON CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mt-10">
                    {[
                        "Learn by doing",
                        "Real-time monitoring",
                        "Real-world training",
                        "Engaging lessons",
                        "On-demand",
                        "Cost-effective"
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="bg-[#111a2d] p-6 rounded-2xl shadow-md hover:shadow-xl transition-all"
                        >
                            <div className="text-blue-400 text-4xl mb-3">⬤</div>
                            <p className="text-gray-200 text-sm font-medium">{item}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* JOIN SECTION */}
            <div className="py-24 bg-[#090f1a] text-center px-6">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Join the Defense
                </h2>
                <div className="w-20 h-1 bg-green-400 mx-auto mb-6"></div>

                <p className="text-gray-300 max-w-xl mx-auto mb-10">
                    Ready to protect your digital world? Start your training and explore real-time cyber threat monitoring.
                </p>

                <button
                    onClick={() => navigate("/login")}
                    className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-xl
                    text-lg font-semibold shadow-lg transition-all"
                >
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default Welcome;
