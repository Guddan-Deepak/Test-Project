import React, { useState } from 'react';
import { Code, Play, RefreshCw, Smartphone, Mail, Lock, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Console from '../components/common/Console';

// Backend URL
const TARGET_URL = 'http://localhost:8000';

const XSS = () => {
    // Attack Configuration State
    const [payload, setPayload] = useState("<script>alert('XSS')</script>");
    const [email, setEmail] = useState('xss@mail.com');
    const [phone, setPhone] = useState('9999999999');
    const [password, setPassword] = useState('123456');
    const [requestCount, setRequestCount] = useState(1);
    const [isAttacking, setIsAttacking] = useState(false);

    // Console Logs State
    const [logs, setLogs] = useState([]);

    const addLog = (type, message, details = '') => {
        setLogs(prev => [...prev, { type, message, details }]);
    };

    const handleRandomPayload = () => {
        const xssPayloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert(1)>",
            "<svg/onload=alert('XSS')>",
            "javascript:alert(1)",
            "\"><script>alert(1)</script>"
        ];
        setPayload(xssPayloads[Math.floor(Math.random() * xssPayloads.length)]);
    };

    const launchAttack = async () => {
        if (isAttacking) return;
        setIsAttacking(true);
        setLogs([]); // Clear previous logs
        addLog('info', `Starting XSS Campaign on ${TARGET_URL}/api/v1/auth/register/analyst...`);

        const attackPromises = [];

        for (let i = 0; i < requestCount; i++) {
            await new Promise(r => setTimeout(r, 200));


            const attackData = {
                name: payload,
                email: i > 0 ? `xss${i}@mail.com` : email,
                phone_no: i > 0 ? `${9000000000 + i}` : phone,
                password: password
            };

            const reqPromise = axios.post(`${TARGET_URL}/api/v1/auth/register/analyst`, attackData)
                .then(response => {
                    addLog('success', `Request #${i + 1} - 201 Created (XSS Stored?)`, "Payload submitted successfully");
                    return { status: 201, data: response.data };
                }).catch(error => {
                    if (error.response) {
                        const status = error.response.status;
                        if (status === 403) {
                            addLog('error', `Request #${i + 1} - 403 FORBIDDEN (WAF Blocked XSS)`, error.response.data?.reason || "Blocked");
                        } else {
                            addLog('error', `Request #${i + 1} - ${status} Error`, error.response.data?.message || error.message);
                        }
                    } else {
                        addLog('error', `Request #${i + 1} - Network Error`, error.message);
                    }
                });
            attackPromises.push(reqPromise);
        }

        try {
            await Promise.all(attackPromises);
            addLog('info', 'XSS Campaign Completed.');
            toast.success('XSS Simulation Finished');
        } catch (e) {
            toast.error('Attack Interrupted');
        } finally {
            setIsAttacking(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                    <Code className="text-cyan-400" />
                    XSS Attack
                </h2>
                <p className="text-gray-400 text-sm mt-1">Simulate Cross-Site Scripting attacks to test input sanitization</p>
                <p className="text-gray-600 text-xs mt-1">Note: Backend auto-captures IP address</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Configuration */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-200">Attack Configuration</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Name (XSS Payload)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-600" size={16} />
                                <input
                                    type="text"
                                    value={payload}
                                    onChange={(e) => setPayload(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono text-xs"
                                />
                                <button onClick={handleRandomPayload} className="absolute right-3 top-2.5 text-gray-500 hover:text-white">
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-600" size={16} />
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Phone</label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-3 text-gray-600" size={16} />
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-600" size={16} />
                                <input
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Number of Requests</label>
                                <input
                                    type="number"
                                    min="1" max="100"
                                    value={requestCount}
                                    onChange={(e) => setRequestCount(parseInt(e.target.value))}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Time Window (seconds)</label>
                                <input
                                    type="number"
                                    value="30"
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
                        <pre className="font-mono text-sm text-cyan-400 pt-6 overflow-x-auto">
                            {`{
  "name": "${payload}",
  "email": "${email}",
  "password": "${password}",
  "phone_no": "${phone}"
}`}
                        </pre>
                        {/* Decorative glow */}
                        <div className="absolute inset-0 bg-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
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

export default XSS;
