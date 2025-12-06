import React from "react";

const About = () => {
    return (
        <main className="bg-[#081226] text-white min-h-screen pb-20">

            {/* ----------- About the Mission Section ----------- */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-blue-200">
                    About the Mission
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* LEFT SIDE: TEXT */}
                    <div className="space-y-6 text-blue-100 leading-relaxed">
                        <p>
                            The Morphin Grid, the ancient energy source powering every Ranger,
                            faces a new threat:
                            <span className="text-red-400 font-semibold"> Cyber Kaiju</span>.
                            This digital monster, created from stolen Command Center circuitry,
                            floods the system with rapid, mutating intrusions.
                        </p>

                        <p>
                            The MicroSOC Command Center represents our frontline defense—a
                            sophisticated cyber-security platform capable of:
                        </p>

                        <ul className="space-y-2 mt-4">
                            <li className="flex items-start">
                                <span className="text-red-500 text-xl mr-3">•</span>
                                <span>Capturing and analyzing simulated attack logs in real-time</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-red-500 text-xl mr-3">•</span>
                                <span>Identifying and categorizing threat levels automatically</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-red-500 text-xl mr-3">•</span>
                                <span>Creating and assigning incidents to security analysts</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-red-500 text-xl mr-3">•</span>
                                <span>Visualizing evolving threats across the entire grid</span>
                            </li>
                        </ul>
                    </div>

                    {/* RIGHT SIDE: SYSTEM CAPABILITIES */}
                    <div className="bg-[#0e1b39] border border-blue-600/20 rounded-2xl p-8 shadow-2xl">
                        <h3 className="text-2xl font-bold mb-6 text-blue-300">
                            System Capabilities
                        </h3>

                        {/* Progress Item */}
                        <div className="mb-6">
                            <p className="text-blue-200 mb-2">Threat Detection</p>
                            <div className="w-full bg-blue-900 h-2 rounded-full">
                                <div className="bg-green-400 h-2 rounded-full" style={{ width: "100%" }}></div>
                            </div>
                            <p className="text-green-300 text-sm mt-1">100%</p>
                        </div>

                        <div className="mb-6">
                            <p className="text-blue-200 mb-2">Response Time</p>
                            <div className="w-full bg-blue-900 h-2 rounded-full">
                                <div className="bg-blue-400 h-2 rounded-full" style={{ width: "98%" }}></div>
                            </div>
                            <p className="text-blue-300 text-sm mt-1">98%</p>
                        </div>

                        <div className="mb-6">
                            <p className="text-blue-200 mb-2">System Uptime</p>
                            <div className="w-full bg-blue-900 h-2 rounded-full">
                                <div className="bg-purple-400 h-2 rounded-full" style={{ width: "99.9%" }}></div>
                            </div>
                            <p className="text-purple-300 text-sm mt-1">99.9%</p>
                        </div>

                        <div>
                            <p className="text-blue-200 mb-2">Incident Resolution</p>
                            <div className="w-full bg-blue-900 h-2 rounded-full">
                                <div className="bg-orange-400 h-2 rounded-full" style={{ width: "95%" }}></div>
                            </div>
                            <p className="text-orange-300 text-sm mt-1">95%</p>
                        </div>
                    </div>

                </div>
            </section>


            {/* ----------- Join the Defense Section ----------- */}
            <section className="bg-[#06101f] py-20 mt-10">
                <div className="text-center max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl font-extrabold mb-4 text-blue-200">
                        Join the Defense
                    </h2>

                    <p className="text-blue-100 text-lg leading-relaxed">
                        Ready to protect the Morphin Grid?
                        Access the Command Center and start monitoring threats in real-time.
                    </p>
                </div>
            </section>

        </main>
    );
};

export default About;
