import React, { useState, useEffect } from 'react';
import { Database, Play, Shuffle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Console from '../components/common/Console';

// Backend URL (Victim)
const TARGET_URL = 'http://localhost:8000';

const SqlInjection = () => {
    // Attack Configuration State
    const [identifier, setIdentifier] = useState('admin@gmail.com');
    const [payload, setPayload] = useState("' OR '1'='1");
    const [role, setRole] = useState('analyst');
    const [requestCount, setRequestCount] = useState(1);
    const [isAttacking, setIsAttacking] = useState(false);

    // Console Logs State
    const [logs, setLogs] = useState([]);

    const payloads = [
        "' OR '1'='1",
        "admin'--",
        "admin' #",
        "1 OR 1=1",
        "' UNION SELECT * FROM users --",
        '" OR "" = "',
        "'; DROP TABLE users; --"
    ];

    const addLog = (type, message, details = '') => {
        setLogs(prev => [...prev, { type, message, details }]);
    };

    const handleRandomPayload = () => {
        const random = payloads[Math.floor(Math.random() * payloads.length)];
        setPayload(random);
    };

    const launchAttack = async () => {
        if (isAttacking) return;
        setIsAttacking(true);
        setLogs([]); // Clear previous logs
        addLog('info', `Starting SQL Injection Campaign on ${TARGET_URL}...`);

        const attackPromises = [];

        for (let i = 0; i < requestCount; i++) {
            // Add a small delay between requests to simulate human/script timing
            await new Promise(r => setTimeout(r, 200));

            const reqPromise = axios.post(`${TARGET_URL}/api/v1/auth/login`, {
                identifier: identifier,
                password: payload, // The malicious payload
                role: role
            }).then(response => {
                addLog('success', `Request #${i + 1} - 200 OK (Login Success?)`, JSON.stringify(response.data).substring(0, 100));
                return { status: 200, data: response.data };
            }).catch(error => {
                if (error.response) {
                    const status = error.response.status;
                    // 403 usually means our monitoring middleware blocked it!
                    if (status === 403) {
                        addLog('error', `Request #${i + 1} - 403 FORBIDDEN (Blocked by WAF)`, error.response.data?.message || "Blocked");
                    } else if (status === 401) {
                        addLog('error', `Request #${i + 1} - 401 UNAUTHORIZED (Login Failed)`, "Credential mismatch");
                    } else {
                        addLog('error', `Request #${i + 1} - ${status} Error`, error.message);
                    }
                } else {
                    addLog('error', `Request #${i + 1} - Network Error`, error.message);
                }
            });
            attackPromises.push(reqPromise);
        }

        try {
            await Promise.all(attackPromises);
            addLog('info', 'Attack Campaign Completed.');
            toast.success('Attack Simulation Finished');
        } catch (e) {
            toast.error('Attack Campaign Interrupted');
        } finally {
            setIsAttacking(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                    <Database className="text-cyan-400" />
                    SQL Injection Attack
                </h2>
                <p className="text-gray-400 text-sm mt-1">Simulate SQL injection attacks to test authentication bypass vulnerabilities</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Configuration */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-200">Attack Configuration</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Target Identifier</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Injection Payload</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <select
                                        value={payload}
                                        onChange={(e) => setPayload(e.target.value)}
                                        className="w-full appearance-none bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    >
                                        {payloads.map((p, i) => <option key={i} value={p}>{p}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRandomPayload}
                                    className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                                    title="Random Payload"
                                >
                                    <Shuffle size={20} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Target Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            >
                                <option value="analyst">Analyst</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Requests</label>
                                <input
                                    type="number"
                                    min="1" max="100"
                                    value={requestCount}
                                    onChange={(e) => setRequestCount(parseInt(e.target.value))}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                            {/* Time window placeholder - logic could be added to spread requests over time */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Time Window (s)</label>
                                <input
                                    type="number"
                                    value="0"
                                    disabled
                                    className="w-full bg-gray-950/50 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview & Action */}
                <div className="flex flex-col gap-6">
                    {/* Code Preview */}
                    <div className="flex-1 bg-gray-950 border border-gray-900 rounded-xl p-6 relative group">
                        <div className="absolute top-4 right-4 text-xs font-mono text-gray-600">Payload Preview</div>
                        <pre className="font-mono text-sm text-green-400 pt-6 overflow-x-auto">
                            {`{
  "identifier": "${identifier}",
  "password": "${payload}",
  "role": "${role}"
}`}
                        </pre>
                        {/* Decorative glow */}
                        <div className="absolute inset-0 bg-green-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>

                    {/* Attack Button */}
                    <button
                        onClick={launchAttack}
                        disabled={isAttacking}
                        className={`
                            w-full py-4 rounded-xl font-bold tracking-widest text-lg transition-all duration-300 transform active:scale-[0.98]
                            flex items-center justify-center gap-3 shadow-lg
                            ${isAttacking
                                ? 'bg-red-900/20 text-red-700 cursor-not-allowed border border-red-900/30'
                                : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-red-900/50 hover:shadow-red-900/80'}
                        `}
                    >
                        {isAttacking ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-700"></span>
                                ATTACKING...
                            </>
                        ) : (
                            <>
                                <Play size={20} fill="currentColor" />
                                LAUNCH ATTACK
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Real-time Console */}
            <Console logs={logs} />
        </div>
    );
};

export default SqlInjection;
