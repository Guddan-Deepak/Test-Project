import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { CheckCircle, XCircle, Clock, User, AlertTriangle } from 'lucide-react';

const AssignmentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/admin/assignment-requests');
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId, action) => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;

        try {
            const res = await api.post(`/admin/assignment-request/${requestId}/handle`, { action });
            if (res.data.success) {
                // Remove from list
                setRequests(prev => prev.filter(r => r._id !== requestId));
                // alert(res.data.message);
            }
        } catch (error) {
            console.error(`Failed to ${action} request`, error);
            alert(error.response?.data?.message || "Action failed");
        }
    };

    if (loading) {
        return <div className="p-8 text-white">Loading requests...</div>;
    }

    return (
        <div className="p-8 max-w-[1200px] mx-auto">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-8">Assignment Requests</h2>

            {requests.length === 0 ? (
                <div className="text-slate-500 text-center py-20 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                    No pending assignment requests.
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map(req => (
                        <div key={req._id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-blue-400">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        {req.requestedBy?.name || "Unknown Analyst"}
                                        <span className="text-sm font-normal text-slate-500">({req.requestedBy?.email})</span>
                                    </h3>
                                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                                        <span className="text-slate-500">Requested for Incident:</span>
                                        <span className="text-cyan-400 font-mono">{req.incident?.incidentId}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded border ${req.incident?.severity === 'CRITICAL' ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-slate-700 border-slate-600'}`}>
                                            {req.incident?.severity}
                                        </span>
                                    </p>
                                    <p className="text-slate-500 text-sm mt-2 flex items-center gap-1">
                                        <Clock size={14} /> Requested {new Date(req.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleAction(req._id, 'APPROVE')}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-emerald-900/20"
                                >
                                    <CheckCircle size={18} />
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleAction(req._id, 'REJECT')}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-800 hover:border-red-700 rounded-lg transition-colors"
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssignmentRequests;
