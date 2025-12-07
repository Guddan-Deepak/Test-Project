import React, { useState } from 'react';
import { Key, ShieldAlert, AlertCircle, FileWarning, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Console from '../components/common/Console';

// Backend URL
const TARGET_URL = 'http://localhost:8000';

const TokenAbuse = () => {
    const [lastToken, setLastToken] = useState('<TOKEN>');
    const [isAttacking, setIsAttacking] = useState(false);
    const [logs, setLogs] = useState([]);

    const addLog = (type, message, details = '') => {
        setLogs(prev => [...prev, { type, message, details }]);
    };

    const sendTokenRequest = async (tokenType, tokenValue) => {
        if (isAttacking) return;
        setIsAttacking(true);
        setLastToken(tokenValue);

        const endpoint = `${TARGET_URL}/api/v1/auth/verify`;
        addLog('info', `Sending ${tokenType} to ${endpoint}...`);

        try {
            const response = await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${tokenValue}`
                }
            });

            // Check the response body for authentication status
            // The backend returns 200 OK even for invalid tokens, but with isAuthenticated: false
            const isAuthenticated = response.data?.data?.isAuthenticated;

            if (isAuthenticated) {
                addLog('success', '200 OK - Unexpected Success', 'Token was accepted (Vulnerable?)');
                toast.warning('Token accepted unexpectedly');
            } else {
                addLog('error', `Expired Token`, 'Token was rejected (Vulnerable?)');
                toast.info('Correctly rejected as Unauthorized');
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const msg = error.response.data?.message || 'Error';
                const reason = error.response.data?.reason || '';

                if (status === 403) {
                    // Middleware blocked it (likely for Invalid/Tampered)
                    addLog('error', `${status} FORBIDDEN (Blocked)`, reason || "Security Middleware Blocked Request");
                    if (reason) toast.success(`Blocked: ${reason}`);
                } else if (status === 304) {
                    // Expired Token (User requested specific 304 status)
                    addLog('error', `${status} NOT MODIFIED`, "Expired Token (Backend Rejected)");
                    toast.info('Correctly rejected as Expired (304)');
                } else if (status === 401) {
                    // Auth middleware rejected it
                    addLog('error', `${status} UNAUTHORIZED`, msg);
                    toast.info('Correctly rejected as Unauthorized');
                } else if (status === 400) {
                    addLog('error', `${status} BAD REQUEST`, msg);
                } else {
                    addLog('error', `${status} Response`, msg);
                }
            } else {
                addLog('error', 'Network Error', error.message);
            }
        } finally {
            setIsAttacking(false);
        }
    };

    const handleExpired = () => {
        // A genuine but expired JWT (Valid Signature, Expired Date)
        const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzQxM2JkZmEzMDQ3OTA2MWFlYzNlZiIsInJvbGUiOiJhbmFseXN0IiwiZW1haWwiOiJhc2h3aW5AZ21haWwuY29tIiwiaWF0IjoxNzY1MDYzOTY5LCJleHAiOjE3NjUwNjAzNjl9.nmesaxxOp2aDB_5P7ElPZ3UuDsdKDituaAJTtoau34U";
        sendTokenRequest('Expired Token', expiredToken);
    };

    const handleInvalid = () => {
        // Triggers "TOKEN_ABUSE" in middleware because of "junk.invalid" or malformed structure
        sendTokenRequest('Invalid Token', 'junk.invalid.token.structure.bad');
    };

    const handleTampered = () => {
        // Real-looking JWT but with tampered payload (role changed to admin) and original signature
        // This will pass the Middleware's structure check but fail the Controller's signature verification
        const tamperedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzQxM2JkZmEzMDQ3OTA2MWFlYzNlZiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NTA2MDI2NiwiZXhwIjoxNzY1MTQ2NjY2fQ.poDKwRpTyEhpzhpsXXDKBklUkL86u8HrtozcgUZm7PI";
        sendTokenRequest('Tampered Token', tamperedToken);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                    <Key className="text-cyan-400" />
                    Token Abuse
                </h2>
                <p className="text-gray-400 text-sm mt-1">Test authentication token validation with expired, invalid, and tampered tokens</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Attack Types */}
                <div className="space-y-6">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-200 mb-6">Token Attack Types</h3>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleExpired}
                                disabled={isAttacking}
                                className="w-full py-4 bg-orange-600 hover:bg-orange-500 rounded-lg text-white font-bold shadow-lg shadow-orange-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send Expired Token
                            </button>

                            <button
                                onClick={handleInvalid}
                                disabled={isAttacking}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send Invalid Token
                            </button>

                            <button
                                onClick={handleTampered}
                                disabled={isAttacking}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send Tampered Token
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-200">About Token Abuse</h3>
                        <div className="space-y-3 text-sm text-gray-400">
                            <p><strong className="text-orange-400">Expired Token:</strong> Tests if the system properly validates token expiration times.</p>
                            <p><strong className="text-red-400">Invalid Token:</strong> Tests if the system handles malformed or invalid token formats.</p>
                            <p><strong className="text-purple-400">Tampered Token:</strong> Tests if the system verifies token signatures and detects tampering.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview & Responses */}
                <div className="flex flex-col gap-6">
                    {/* Authorization Preview */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Authorization Preview</h3>
                        <div className="bg-gray-950 border border-gray-900 rounded-lg p-5 font-mono text-xs break-all relative group">
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
                            <span className="text-cyan-600">Authorization:</span> <span className="text-gray-300">Bearer</span> <span className="text-cyan-400">{lastToken}</span>
                        </div>
                    </div>

                    {/* Expected Responses */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex-1">
                        <h3 className="text-lg font-semibold text-gray-200 mb-4">Expected Responses</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-gray-950 p-3 rounded border border-gray-800">
                                <span className="text-gray-400 text-sm">Expired Token</span>
                                <span className="text-orange-400 font-mono text-xs font-bold">304 Not Modified</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-950 p-3 rounded border border-gray-800">
                                <span className="text-gray-400 text-sm">Invalid Token</span>
                                <span className="text-red-400 font-mono text-xs font-bold">403 Forbidden</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-950 p-3 rounded border border-gray-800">
                                <span className="text-gray-400 text-sm">Tampered Token</span>
                                <span className="text-purple-400 font-mono text-xs font-bold">401 Unauthorized</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Real-time Console */}
            <Console logs={logs} />
        </div>
    );
};

export default TokenAbuse;
