import React from 'react';
import { useAuth } from '../../../utils/authContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-lg text-gray-700">
                            Welcome back, <span className="font-semibold text-emerald-600">{user?.name || 'User'}</span>!
                        </p>
                        <p className="text-gray-500 mt-2">
                            This is your dashboard where you can manage your appointments and profile.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
