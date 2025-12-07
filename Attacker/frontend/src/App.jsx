import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import RightPanel from './components/layout/RightPanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    return (
        <div className="flex h-screen w-full bg-[#0B1120] text-gray-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <Header />

                {/* Content & Right Panel */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Main Scrollable Area */}
                    <main className="flex-1 overflow-y-auto p-6 md:p-8">
                        <Outlet />
                    </main>

                    {/* Right Panel (Logs) */}
                    <RightPanel />
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                toastClassName="!bg-gray-800 !text-gray-200 !border !border-gray-700 !rounded-lg"
            />
        </div>
    );
};

export default App;
