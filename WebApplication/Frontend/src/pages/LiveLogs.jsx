import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { X, Loader } from 'lucide-react';

const LiveLogs = () => {
    const [logs, setLogs] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [filters, setFilters] = useState({ severity: '', category: '' });
    const { socket } = useSocket();

    // Pagination State
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    const lastLogElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchLogs = async (pageNum, isNewFilter = false) => {
        setLoading(true);
        try {
            const params = {
                page: pageNum,
                limit: 20 // Fetch 20 at a time for smooth scroll
            };
            if (filters.severity) params.severity = filters.severity;
            if (filters.category) params.category = filters.category;

            const res = await api.get('/logs', { params });
            if (res.data.success) {
                const newLogs = res.data.data.logs;
                setLogs(prev => {
                    // Combine and remove duplicates based on _id/logId just in case
                    const combined = isNewFilter ? newLogs : [...prev, ...newLogs];
                    const unique = Array.from(new Map(combined.map(item => [item._id || item.logId, item])).values());
                    return unique;
                });
                setHasMore(newLogs.length > 0 && newLogs.length >= params.limit);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    // Reset when filters change
    useEffect(() => {
        setPage(1);
        setLogs([]);
        setHasMore(true);
        fetchLogs(1, true);
    }, [filters]);

    // Fetch on page change (except initial load which is covered above or if page is 1 and already fetched)
    useEffect(() => {
        if (page > 1) {
            fetchLogs(page);
        }
    }, [page]);

    useEffect(() => {
        if (!socket) return;

        socket.on("NEW_LOG", (newLog) => {
            // Apply client-side filtering if needed
            if (filters.severity && newLog.severity !== filters.severity) return;
            if (filters.category && newLog.category !== filters.category) return;

            setLogs(prev => {
                // Prepend new log. Keep max list size reasonable if desired, or let it grow infinite
                // "YouTube style" usually keeps growing downward, but real-time updates happen at the top.
                // We'll just prepend.
                const updated = [newLog, ...prev];
                return updated;
            });
        });

        return () => socket.off("NEW_LOG");
    }, [socket, filters]);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-500 font-bold';
            case 'HIGH': return 'text-orange-500 font-bold';
            case 'MEDIUM': return 'text-yellow-500';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 overflow-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Live Security Logs</h2>
                    <div className="flex gap-4">
                        <select
                            className="bg-slate-800 text-white border border-slate-700 rounded px-3 py-2"
                            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                        >
                            <option value="">All Severities</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                        <select
                            className="bg-slate-800 text-white border border-slate-700 rounded px-3 py-2"
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <option value="">All Categories</option>
                            <option value="REQUEST">Request</option>
                            <option value="SECURITY">Security</option>
                        </select>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">IP Address</th>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Method / Endpoint</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {logs.map((log, index) => {
                                // Attach ref to the last element
                                const isLast = index === logs.length - 1;
                                return (
                                    <tr
                                        key={log._id || log.logId}
                                        ref={isLast ? lastLogElementRef : null}
                                        onClick={() => setSelectedLog(log)}
                                        className="hover:bg-slate-700/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                        <td className="px-6 py-4 text-sky-400 font-mono">{log.sourceIP}</td>
                                        <td className="px-6 py-4 text-white font-medium">{log.eventType}</td>
                                        <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{log.httpMethod} {log.endpoint}</td>
                                        <td className={`px-6 py-4 ${getSeverityColor(log.severity)}`}>{log.severity}</td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-400 hover:underline">View</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="p-4 flex justify-center text-slate-400 bg-slate-800/50">
                            <Loader className="animate-spin mr-2" /> Loading more logs...
                        </div>
                    )}

                    {!hasMore && logs.length > 0 && (
                        <div className="p-4 text-center text-slate-500 text-xs uppercase tracking-widest bg-slate-800/30">
                            End of Logs
                        </div>
                    )}

                    {logs.length === 0 && !loading && (
                        <div className="p-8 text-center text-slate-500">
                            No logs found matching criteria.
                        </div>
                    )}
                </div>
            </div>

            {/* Redesigned Side Panel for Detail */}
            {selectedLog && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                        onClick={() => setSelectedLog(null)}
                    ></div>

                    {/* Slide-over Panel */}
                    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0F172A] border-l border-slate-700/50 shadow-2xl z-[120] transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center bg-[#0F172A]">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Log Details</h3>
                                <p className="text-sm text-slate-400 mt-1">ID: <span className="font-mono text-cyan-400">{selectedLog.logId?.substring(0, 8) || 'N/A'}...</span></p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

                            {/* Top Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Severity</label>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedLog.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        selectedLog.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                            selectedLog.severity === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        }`}>
                                        {selectedLog.severity}
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Timestamp</label>
                                    <p className="text-sm text-slate-200 font-mono">
                                        {new Date(selectedLog.timestamp).toLocaleTimeString()}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(selectedLog.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                                        <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Event</label>
                                    </div>
                                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                                        <p className="text-lg text-white font-medium mb-1">{selectedLog.eventType}</p>
                                        <p className="text-sm text-cyan-400/80">{selectedLog.category} LOG</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                        <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Source</label>
                                    </div>
                                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-400 text-xs">IP Address</span>
                                            <span className="font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded text-sm">{selectedLog.sourceIP}</span>
                                        </div>
                                        {selectedLog.geo && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400 text-xs">Location</span>
                                                <span className="text-slate-200 text-sm">{selectedLog.geo.city || 'Unknown'}, {selectedLog.geo.country || 'Unknown'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                                        <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Request</label>
                                    </div>
                                    <div className="bg-[#0B1120] rounded-lg p-4 border border-slate-800 font-mono text-sm overflow-x-auto group hover:border-slate-700 transition-colors">
                                        <div className="flex gap-3 mb-2">
                                            <span className="text-purple-400 font-bold">{selectedLog.httpMethod}</span>
                                            <span className="text-slate-300">{selectedLog.endpoint}</span>
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Status: {selectedLog.statusCode || 200}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Details Section */}
                                {selectedLog.category === 'SECURITY' && (
                                    <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                        <h4 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                            Threat Detected
                                        </h4>

                                        <div className="space-y-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-red-300/60 uppercase">Attack Vector</span>
                                                <span className="text-white font-medium">{selectedLog.attackVector}</span>
                                            </div>
                                            {selectedLog.details.patternMatched && (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-red-300/60 uppercase">Pattern Matched</span>
                                                    <code className="text-xs bg-red-950/50 text-red-200 p-2 rounded border border-red-900/50 mt-1 block overflow-x-auto">
                                                        {selectedLog.details.patternMatched}
                                                    </code>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Raw JSON Data */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 bg-slate-500 rounded-full"></div>
                                            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Raw Payload</label>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <pre className="text-xs text-cyan-300/90 font-mono bg-[#050914] p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-60 shadow-inner custom-scrollbar">
                                            {JSON.stringify(selectedLog, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </>
            )}
        </div>
    );
};

export default LiveLogs;
