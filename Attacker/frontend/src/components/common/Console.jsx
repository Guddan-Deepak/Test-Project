import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

const Console = ({ logs }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-64 font-mono text-sm">
            {/* Console Header */}
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-gray-400" />
                    <span className="text-gray-400 font-semibold">Real-time Console</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
            </div>

            {/* Console Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs">
                {logs.length === 0 ? (
                    <div className="text-gray-600 italic">Waiting for attack logs...</div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="break-all hover:bg-white/5 px-1 rounded">
                            <span className="text-gray-500">[{new Date().toLocaleTimeString()}] </span>
                            {log.type === 'info' && <span className="text-blue-400">INFO: </span>}
                            {log.type === 'success' && <span className="text-green-400">SUCCESS: </span>}
                            {log.type === 'error' && <span className="text-red-400">ERROR: </span>}
                            <span className="text-gray-300">{log.message}</span>
                            {log.details && (
                                <div className="ml-16 text-gray-500 text-[10px] mt-0.5">
                                    {log.details}
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default Console;
