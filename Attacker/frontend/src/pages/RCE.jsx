import React, { useState } from 'react';
import { TerminalSquare, Play, RefreshCw, Smartphone, Mail, Lock, User, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Console from '../components/common/Console';

// Backend URL
const TARGET_URL = 'http://localhost:8000';

const RCE = () => {
    // Attack Configuration State
    const [payload, setPayload] = useState('test; rm -rf /');
    const [email, setEmail] = useState('att@ck.com');
    const [phone, setPhone] = useState('9990001111');
    const [password, setPassword] = useState('123456');
    const [requestCount, setRequestCount] = useState(1);
    const [isAttacking, setIsAttacking] = useState(false);

    // Console Logs State
    const [logs, setLogs] = useState([]);

    const rcePayloads = [
        "test; rm -rf /",
        "test; cat /etc/passwd",
        "test && whoami",
        "test | ls -la",
        "test; ping 127.0.0.1",
        "test`whoami`",
        "test$(id)"
    ];

    const addLog = (type, message, details = '') => {
        setLogs(prev => [...prev, { type, message, details }]);
    };

    const handleRandomPayload = () => {
        setPayload(rcePayloads[Math.floor(Math.random() * rcePayloads.length)]);
    };

    const launchAttack = async () => {
        if (isAttacking) return;
        setIsAttacking(true);
        setLogs([]); // Clear previous logs
        addLog('info', `Starting RCE Campaign on ${TARGET_URL}/api/v1/auth/register/analyst...`);

        const attackPromises = [];

        for (let i = 0; i < requestCount; i++) {
            await new Promise(r => setTimeout(r, 200));

            // Injecting RCE payload into the NAME field
            const attackData = {
                name: payload,
                email: i > 0 ? `rce${i}@attack.com` : email,
                phone_no: i > 0 ? `${8000000000 + i}` : phone,
                password: password
            };

            const reqPromise = axios.post(`${TARGET_URL}/api/v1/auth/register/analyst`, attackData)
                .then(response => {
                    addLog('success', `Request #${i + 1} - 201 Created`, "Payload executed (simulated)");
                    return { status: 201, data: response.data };
                }).catch(error => {
                    if (error.response) {
                        const status = error.response.status;
                        if (status === 403) {
                            addLog('error', `Request #${i + 1} - 403 FORBIDDEN (RCE Blocked)`, error.response.data?.reason || "Blocked");
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
            addLog('info', 'RCE Campaign Completed.');
            toast.success('RCE Simulation Finished');
        } catch (e) {
            toast.error('Attack Interrupted');
        } finally {
            setIsAttacking(false);
        }
    };

    // Server Logs State
    const [serverLogs, setServerLogs] = useState([]);

    // Poll Server Logs
    React.useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get(`${TARGET_URL}/api/v1/logs?limit=10`);
                if (res.data?.data?.logs) {
                    setServerLogs(res.data.data.logs);
                }
            } catch (err) {
                console.error("Failed to fetch server logs", err);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                    <TerminalSquare className="text-cyan-400" />
                    Command Injection (RCE)
                </h2>
                <p className="text-gray-400 text-sm mt-1">Simulate Remote Code Execution attacks to test command injection vulnerabilities</p>
                <div className="flex gap-2 mt-3">
                    <span className="bg-orange-900/40 text-orange-400 border border-orange-800/50 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider">eventType: RCE_DETECTED</span>
                    <span className="bg-red-900/40 text-red-400 border border-red-800/50 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider">severity: CRITICAL</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Configuration */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-200">Attack Configuration</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Name (with RCE Payload)</label>
                            <input
                                type="text"
                                value={payload}
                                onChange={(e) => setPayload(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email</label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Phone</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Password</label>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Payload Presets</label>
                            <div className="relative">
                                <select
                                    className="w-full appearance-none bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    onChange={(e) => setPayload(e.target.value)}
                                >
                                    {rcePayloads.map((p, i) => (
                                        <option key={i} value={p}>{p}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <AlertTriangle size={14} className="text-gray-500" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Custom Payload (Optional)</label>
                            <textarea
                                placeholder="Enter custom RCE payload..."
                                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors h-20 text-xs font-mono resize-none"
                            ></textarea>
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
                        <div className="absolute inset-0 bg-red-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
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

export default RCE;
