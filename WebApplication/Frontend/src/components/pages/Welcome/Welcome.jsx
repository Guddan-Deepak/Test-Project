import React from "react";
import { useNavigate } from "react-router-dom";
import welcomeImage from "../../../assets/welcome-image.jpg"; // Import image

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#0B1220] text-white">
      {/* HERO SECTION */}
      <div className="px-6 lg:px-20 pt-24 pb-32 bg-gradient-to-b from-[#0B1220] to-[#090f1a] flex flex-col-reverse md:flex-row items-center md:justify-between gap-10">
        
        {/* Text Section */}
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Anyone can learn <br />
            <span className="text-blue-400">cyber security</span> with <br />
            S.H.I.E.L.D.
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

        {/* Image Section */}
        <div className="max-w-md md:max-w-lg w-full">
          <img
            src={welcomeImage}
            alt="Welcome"
            className="w-full h-auto rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
          />
        </div>
      </div>

      {/* FEATURES SECTION */}
            <div className="bg-[#0f172a] py-20 px-6 lg:px-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-green-400 drop-shadow-lg">
            Real-world offensive & defensive cyber security
        </h2>
        <div className="w-24 h-1 bg-green-400 mx-auto mb-6 rounded-full glow"></div>

        <p className="text-gray-300 max-w-3xl mx-auto mb-14">
            Enhance your cyber defense skills with advanced simulations, monitoring, and incident management.
        </p>

        {/* ICON CARDS / FEATURE POINTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
  {[
    "Hands-on Attack Simulation",
    "Real-time Monitoring",
    "Threat Classification",
    "Advanced Visualization",
    "Incident Management",
    "Log Analysis & Injection",
    "RAG-based Chatbot",
    "Customizable Alerts"
  ].map((item, i) => (
    <div
      key={i}
      className="bg-gradient-to-br from-blue-800 to-blue-600 p-6 rounded-2xl
                 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105
                 text-white font-semibold text-center"
    >
      {/* Neon glowing dot */}
      <div className="w-6 h-6 mx-auto mb-4 rounded-full bg-sky-400 shadow-[0_0_15px_#00f6ff] animate-pulse"></div>

      {/* Feature text with subtle glow */}
      <p className="text-white text-base font-medium drop-shadow-lg">{item}</p>
    </div>
  ))}
</div>

        </div>


      {/* FAQ SECTION */}
      <div className="py-24 bg-[#090f1a] text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">FAQ</h2>
        <div className="w-20 h-1 bg-green-400 mx-auto mb-6"></div>

        <div className="max-w-3xl mx-auto text-left space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-200">What is S.H.I.E.L.D.?</h3>
            <p className="text-gray-400 mt-1">S.H.I.E.L.D. is a hands-on cyber security training platform with real-world scenarios.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200">Who can join?</h3>
            <p className="text-gray-400 mt-1">Anyone—from beginners to professionals interested in cyber defense can join.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200">Do I need prior experience?</h3>
            <p className="text-gray-400 mt-1">No prior experience is needed. The platform provides structured training from basics to advanced.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200">Is it real-time training?</h3>
            <p className="text-gray-400 mt-1">Yes! You can monitor scenarios and perform tasks in a simulated environment in real-time.</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="mt-10 px-8 py-3 bg-green-500 hover:bg-green-600 rounded-xl
          text-lg font-semibold shadow-lg transition-all"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Welcome;
