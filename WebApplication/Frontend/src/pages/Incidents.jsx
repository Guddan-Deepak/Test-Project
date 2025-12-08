import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react';

const Incidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const { socket, isConnected } = useSocket();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('mine'); // 'mine', 'pending', 'unassigned'

    // Pagination State
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    const lastIncidentElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const handleRequestAssignment = async (e, incidentId) => {
        e.stopPropagation(); // Prevent card click
        if (!confirm("Request assignment for this incident?")) return;

        try {
            const res = await api.post(`/incidents/${incidentId}/request-assignment`);
            if (res.data.success) {
                alert("Request submitted successfully!");
            }
        } catch (error) {
            console.error("Request failed", error);
            alert(error.response?.data?.message || "Failed to submit request");
        }
    };

    const fetchIncidents = async (pageNum, isNewFilter = false) => {
        setLoading(true);
        try {
            const params = {
                page: pageNum,
                limit: 15
            };
            if (statusFilter) params.status = statusFilter;
            if (statusFilter) params.status = statusFilter;
            if (activeTab === 'mine') params.assignedTo = 'me';
            if (activeTab === 'pending') params.assignedTo = 'pending';
            if (activeTab === 'unassigned') params.assignedTo = 'unassigned';

            const res = await api.get('/incidents', { params });
            if (res.data.success) {
                const newIncidents = res.data.data.incidents;
                setIncidents(prev => {
                    const combined = isNewFilter ? newIncidents : [...prev, ...newIncidents];
                    // Uniqify by incidentId
                    const unique = Array.from(new Map(combined.map(item => [item.incidentId, item])).values());
                    return unique;
                });
                setHasMore(newIncidents.length > 0 && newIncidents.length >= params.limit);
            }
        } catch (error) {
            console.error("Failed to fetch incidents", error);
        } finally {
            setLoading(false);
        }
    };

    // Reset on filter change
    useEffect(() => {
        setPage(1);
        setIncidents([]);
        setHasMore(true);
        fetchIncidents(1, true);
    }, [statusFilter, activeTab]);

    // Fetch next page
    useEffect(() => {
        if (page > 1) {
            fetchIncidents(page);
        }
    }, [page]);

    useEffect(() => {
        if (!socket) return;
        // If updates happen, we might want to refresh current view or just prepend.
        // Simple strategy: Just prepend new ones if they match current filter.
        // For now, keeping it simple: Fetch page 1 again silently? No, that messes up scroll.
        // Let's just listen for NEW_INCIDENT and unshift it if it matches.

        socket.on("NEW_INCIDENT", () => {
            // For now, let's just re-fetch page 1 to ensure freshness at top, 
            // but strictly this isn't "infinite scroll friendly" if user is deep down.
            // Better: manual refresh or toaster. 
            // Given requirements, let's keep it simple: do nothing or just log.
            // Actually, the previous code re-fetched everything. 
            // Let's stick to appending new items via socket if we had the payload.
            // Since payload isn't passed in event, we'll re-fetch page 1 silently.
            fetchIncidents(1, true); // This resets scroll - maybe annoying.
        });

        socket.on("INCIDENT_UPDATED", () => {
            // Re-fetch current visible set? Complex. 
            // Simplest: just refresh page 1.
            fetchIncidents(1, true);
        });

        return () => {
            socket.off("NEW_INCIDENT");
            socket.off("INCIDENT_UPDATED");
        }
    }, [socket, activeTab, statusFilter]);

    const getSeverityBadge = (severity) => {
        const colors = {
            CRITICAL: 'bg-red-900/50 text-red-200 border-red-800',
            HIGH: 'bg-orange-900/50 text-orange-200 border-orange-800',
            MEDIUM: 'bg-yellow-900/50 text-yellow-200 border-yellow-800',
            LOW: 'bg-blue-900/50 text-blue-200 border-blue-800'
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold border ${colors[severity] || 'bg-slate-800 text-slate-400'}`}>
                {severity}
            </span>
        );
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'OPEN': return <AlertCircle size={18} className="text-red-500" />;
            case 'IN_PROGRESS': return <Clock size={18} className="text-yellow-500" />;
            case 'RESOLVED': return <CheckCircle size={18} className="text-green-500" />;
            default: return <Clock size={18} className="text-slate-500" />;
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Security Incidents</h2>
                    <p className="text-slate-400 mt-1">Manage and triage detected threats</p>
                </div>
                <div className="flex gap-4">
                    <select
                        className="bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                </div>
            </div>

            <div className="flex border-b border-slate-700 mb-6">
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'mine' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    onClick={() => setActiveTab('mine')}
                >
                    Assigned Incident
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'pending' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Requests
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'unassigned' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    onClick={() => setActiveTab('unassigned')}
                >
                    New Incidents
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {incidents.length === 0 && !loading ? (
                    <div className="text-slate-500 text-center py-20 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                        No incidents found.
                    </div>
                ) : (
                    incidents.map((incident, index) => {
                        const isLast = index === incidents.length - 1;
                        return (
                            <div
                                key={incident.incidentId}
                                ref={isLast ? lastIncidentElementRef : null}
                                onClick={() => navigate(`/dashboard/incidents/${incident.incidentId}`)}
                                className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 bg-slate-900 rounded-lg border border-slate-700">{getStatusIcon(incident.status)}</div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors font-mono tracking-tight">
                                                {incident.incidentId}
                                            </h3>
                                            {getSeverityBadge(incident.severity)}
                                        </div>
                                        <p className="text-slate-300 font-medium mt-1">{incident.type}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                            <p>Target: <span className="text-slate-400">{incident.sourceIp}</span></p>
                                            {incident.assignedTo && (
                                                <p className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                    Assigned to: <span className="text-blue-400 font-semibold">{incident.assignedTo}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-slate-400 flex items-center gap-1 justify-end">
                                        <Clock size={14} /> {new Date(incident.lastSeenAt).toLocaleString()}
                                    </p>
                                    <div className="mt-3 flex flex-col items-end gap-2">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${incident.status === 'OPEN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : incident.status === 'IN_PROGRESS' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                            {incident.status.replace('_', ' ')}
                                        </span>

                                        {activeTab === 'unassigned' && incident.status === 'OPEN' && (
                                            <button
                                                onClick={(e) => handleRequestAssignment(e, incident.incidentId)}
                                                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
                                            >
                                                Request Assignment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="p-4 flex justify-center text-slate-400">
                        <Loader className="animate-spin mr-2" /> Loading more incidents...
                    </div>
                )}

                {!hasMore && incidents.length > 0 && (
                    <div className="p-4 text-center text-slate-500 text-xs uppercase tracking-widest">
                        End of Incidents
                    </div>
                )}
            </div>
        </div>
    );
};

export default Incidents;
