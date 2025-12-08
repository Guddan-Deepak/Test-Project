import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../utils/api';
import {
    ShieldAlert,
    Search,
    Filter,
    ChevronDown,
    MoreVertical,
    CheckCircle,
    XCircle,
    UserPlus,
    Activity,
    Lock,
    AlertTriangle,
    Clock,
    User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminIncidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [total, setTotal] = useState(0);

    // Edit Modal State
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Intersection Observer for Infinite Scroll
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

    // Fetch Incidents
    const fetchIncidents = useCallback(async (pageNum, status) => {
        try {
            setLoading(true);
            const params = {
                page: pageNum,
                limit: 10,
                ...(status && { status })
            };

            const { data } = await api.get('/admin/incidents', { params });

            if (data.success) {
                setIncidents(prev => {
                    // If page 1, replace. Else append.
                    if (pageNum === 1) return data.data.incidents;
                    // Filter duplicates just in case
                    const newIncidents = data.data.incidents.filter(
                        newInc => !prev.some(p => p._id === newInc._id)
                    );
                    return [...prev, ...newIncidents];
                });
                setTotal(data.data.total);
                setHasMore(data.data.incidents.length > 0 && incidents.length + data.data.incidents.length < data.data.total);
            }
        } catch (error) {
            console.error("Failed to fetch incidents:", error);
        } finally {
            setLoading(false);
        }
    }, [incidents.length]);

    // Reset when filter changes
    useEffect(() => {
        setIncidents([]);
        setPage(1);
        setHasMore(true);
        fetchIncidents(1, statusFilter);
    }, [statusFilter]);

    // Load more when page changes
    useEffect(() => {
        if (page > 1) {
            fetchIncidents(page, statusFilter);
        }
    }, [page]);

    const handleAutoResolve = async (incidentId) => {
        if (!window.confirm("Are you sure? This will BLOCK the IP based on severity and RESOLVE the incident.")) return;

        try {
            const { data } = await api.post(`/admin/incidents/${incidentId}/resolve`);
            if (data.success) {
                // Update local state
                setIncidents(prev => prev.map(inc =>
                    inc._id === incidentId ? { ...inc, status: 'RESOLVED', analystNotes: (inc.analystNotes || '') + '\n[System]: Auto-resolved.' } : inc
                ));
                alert("Incident auto-resolved and IP blocked.");
            }
        } catch (error) {
            console.error("Auto resolve failed:", error);
            alert(error.response?.data?.message || "Failed to auto-resolve");
        }
    };

    const handleUpdateIncident = async (e) => {
        e.preventDefault();
        if (!selectedIncident) return;

        const updates = {
            status: e.target.status.value,
            severity: e.target.severity.value,
            analystNotes: e.target.analystNotes.value,
            blockIp: e.target.blockIp?.checked
        };

        try {
            const { data } = await api.patch(`/admin/incidents/${selectedIncident._id}`, updates);
            if (data.success) {
                setIncidents(prev => prev.map(inc =>
                    inc._id === selectedIncident._id ? { ...inc, ...updates } : inc
                ));
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update incident");
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'text-red-400';
            case 'ASSIGNED': return 'text-blue-400';
            case 'IN_PROGRESS': return 'text-yellow-400';
            case 'RESOLVED': return 'text-green-400';
            case 'FALSE_POSITIVE': return 'text-slate-400';
            default: return 'text-white';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <ShieldAlert className="text-red-500" />
                        Incident Feed
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Real-time security incidents requiring attention
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-[#0F172A] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer min-w-[150px]"
                        >
                            <option value="">All Statuses</option>
                            {["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "FALSE_POSITIVE"].map(s => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {incidents.map((incident, index) => {
                    const isLast = index === incidents.length - 1;
                    return (
                        <div
                            key={incident._id}
                            ref={isLast ? lastIncidentElementRef : null}
                            className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                {/* Left: Icon & Main Info */}
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg border ${getSeverityColor(incident.severity)}`}>
                                        <ShieldAlert size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-semibold text-lg text-slate-200">{incident.type}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-current ${getSeverityColor(incident.severity)}`}>
                                                {incident.severity}
                                            </span>
                                            <span className={`text-xs font-medium flex items-center gap-1 ${getStatusColor(incident.status)}`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                {incident.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Activity size={14} />
                                                <span className="font-mono text-slate-300">{incident.sourceIp}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} />
                                                <span>{formatDistanceToNow(new Date(incident.lastSeenAt), { addSuffix: true })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User size={14} />
                                                <span>{incident.assignedTo ? incident.assignedTo.email : 'Unassigned'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2 self-end md:self-center">
                                    {(incident.status !== 'RESOLVED' && incident.status !== 'FALSE_POSITIVE') && (
                                        <button
                                            onClick={() => handleAutoResolve(incident._id)}
                                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
                                            title="Block IP & Resolve"
                                        >
                                            <Lock size={14} />
                                            Auto Resolve
                                        </button>
                                    )}
                                    {incident.status === 'OPEN' && (
                                        <button
                                            onClick={() => {
                                                setSelectedIncident(incident);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                                        >
                                            Manage
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {loading && (
                    <div className="py-8 text-center text-slate-500 animate-pulse">
                        Loading more incidents...
                    </div>
                )}

                {!loading && incidents.length === 0 && (
                    <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                        <CheckCircle className="mx-auto mb-3 opacity-50" size={32} />
                        <p>No incidents found matching current filters.</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && selectedIncident && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0F172A] border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-semibold text-lg">Manage Incident</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateIncident} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                                <select
                                    name="status"
                                    defaultValue={selectedIncident.status}
                                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-red-500/50 outline-none"
                                >
                                    {["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "FALSE_POSITIVE"].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Severity</label>
                                <select
                                    name="severity"
                                    defaultValue={selectedIncident.severity}
                                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-red-500/50 outline-none"
                                >
                                    {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>



                            {/* Analyst Note Input */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Analyst Notes</label>
                                <textarea
                                    name="analystNotes"
                                    defaultValue={selectedIncident.analystNotes || ''}
                                    placeholder="Add investigation notes here..."
                                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-red-500/50 outline-none min-h-[80px] resize-y"
                                />
                            </div>

                            <div className="flex items-center gap-2 mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <input
                                    type="checkbox"
                                    name="blockIp"
                                    id="blockIp"
                                    className="w-4 h-4 rounded border-slate-600 bg-[#0B1120] text-red-500 focus:ring-red-500/50"
                                />
                                <label htmlFor="blockIp" className="text-sm text-red-200 cursor-pointer select-none">
                                    Block Source IP <span className="text-xs text-red-400/70">(Duration based on severity)</span>
                                </label>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-red-900/20 transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
        </div >
    );
};

export default AdminIncidents;
