import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Terminal, ShieldAlert } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';

const RightPanel = () => {
    const [logs, setLogs] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Ref for the scrollable container
    const scrollRef = useRef(null);

    // Transform backend log format to UI format
    const transformLog = (backendLog) => {
        let status = 'INFO';
        if (backendLog.classification === 'CONFIRMED_ATTACK') status = 'BLOCKED';
        else if (backendLog.statusCode >= 400) status = 'FAILED';
        else status = 'SUCCESS';

        const msg = backendLog.details?.patternMatched
            ? `Pattern: ${backendLog.details.patternMatched}`
            : backendLog.details?.message || "Traffic detected";

        return {
            id: backendLog._id ? backendLog._id.slice(-4) : '????',
            uniqueKey: backendLog._id || Math.random().toString(), // Ensure unique key
            time: new Date(backendLog.timestamp).toLocaleTimeString(),
            type: backendLog.eventType || "Request",
            status: status,
            msg: msg,
            code: backendLog.statusCode,
            severity: backendLog.severity || 'LOW'
        };
    };

    // Fetch logs function
    const fetchLogs = useCallback(async (pageNum) => {
        if (loading) return;
        setLoading(true);
        try {
            console.log("Fetching logs from API...", pageNum);
            const res = await axios.get(`http://localhost:8000/api/v1/logs?limit=20&page=${pageNum}`);
            console.log("API Response:", res.data); // DEBUG Log

            const fetchedLogs = res.data?.data?.logs || [];
            const totalPages = res.data?.data?.totalPages || 1;

            if (fetchedLogs.length === 0 || pageNum >= totalPages) {
                setHasMore(false);
            }

            const transformedLogs = fetchedLogs.map(transformLog);

            setLogs(prevLogs => {
                // If page 1, strictly replace (or merge carefully? No, page 1 is usually init)
                // Actually, for infinite scroll 'load more at bottom', we append.
                if (pageNum === 1) return transformedLogs;

                // Filter out duplicates just in case socket added them already
                const existingIds = new Set(prevLogs.map(l => l.uniqueKey));
                const newUnique = transformedLogs.filter(l => !existingIds.has(l.uniqueKey));

                return [...prevLogs, ...newUnique];
            });
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    }, []); // Removed dependency on 'loading' to avoid stale closure issues if not handled carefully, but kept simple.

    // Initial Load & Socket Setup
    useEffect(() => {
        // Load initial data
        fetchLogs(1);

        const socket = io('http://localhost:8000');
        socket.on('connect', () => {
            setIsConnected(true);
            console.log("Connected to Backend Socket");
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('NEW_LOG', (newLog) => {
            // Add new log to the TOP
            const uiLog = transformLog(newLog);
            setLogs(prev => [uiLog, ...prev]);
        });

        return () => {
            socket.disconnect();
        };
    }, []); // Run once on mount

    // Scroll Handler
    const handleScroll = () => {
        if (!scrollRef.current || loading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

        // Check if we are near the bottom (within 50px)
        if (scrollHeight - scrollTop - clientHeight < 50) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchLogs(nextPage);
        }
    };

    return (
        <aside className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm font-medium">Live Feed</span>
                    {isConnected ? (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    ) : (
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    )}
                </div>
                <Terminal size={14} className="text-gray-600" />
            </div>

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {logs.length === 0 && !loading && (
                    <div className="text-gray-600 text-center text-xs mt-10">
                        Waiting for traffic...
                    </div>
                )}

                {logs.map((log) => (
                    <div key={log.uniqueKey} className="bg-gray-800/50 border border-gray-700/50 rounded-md p-3 text-xs font-mono relative overflow-hidden group hover:border-gray-600 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-500">#{log.id}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${log.status === 'BLOCKED' ? 'bg-red-900/30 text-red-400 border border-red-800/50' :
                                log.status === 'FAILED' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50' :
                                    'bg-green-900/30 text-green-400 border border-green-800/50'
                                }`}>
                                {log.status}
                            </span>
                        </div>
                        <div className="text-gray-400 mb-1">{log.time}</div>
                        <div className={`font-semibold mb-1 flex items-center gap-1.5 ${log.severity === 'CRITICAL' || log.severity === 'HIGH' ? 'text-red-400' : 'text-blue-400'
                            }`}>
                            {log.type}
                            {log.severity !== 'LOW' && <ShieldAlert size={12} />}
                        </div>

                        <div className="text-gray-500 leading-relaxed break-words">
                            {log.msg}
                        </div>

                        {/* Hover effect decorative line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${log.status === 'SUCCESS' ? 'bg-green-500' :
                            log.status === 'BLOCKED' ? 'bg-red-500' : 'bg-yellow-500'
                            } opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    </div>
                ))}

                {loading && (
                    <div className="text-center py-2 text-gray-500 text-xs animate-pulse">
                        Loading history...
                    </div>
                )}
            </div>
        </aside>
    );
};

export default RightPanel;
