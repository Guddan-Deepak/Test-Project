import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';
import { BookOpen, Plus, Trash2, Tag, Database, Loader } from 'lucide-react';

const KnowledgeBase = () => {
    const [chunks, setChunks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    // Form State
    const [formData, setFormData] = useState({
        sourceType: 'Playbook',
        sourceName: '',
        content: ''
    });

    useEffect(() => {
        setLoading(true);
        fetchChunks(1);
    }, []);

    const fetchChunks = async (pageNum) => {
        try {
            const res = await api.get(`/admin/knowledge?page=${pageNum}&limit=10`);
            if (res.data.success) {
                const newChunks = res.data.data.chunks;
                const pagination = res.data.data.pagination;

                setChunks(prev => pageNum === 1 ? newChunks : [...prev, ...newChunks]);
                setHasMore(pagination.hasMore);
            }
        } catch (error) {
            console.error("Failed to fetch chunks", error);
        } finally {
            setLoading(false);
        }
    };

    const lastChunkElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchChunks(nextPage);
                    return nextPage;
                });
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);


    const handleDelete = async (id) => {
        if (!window.confirm("Delete this knowledge chunk?")) return;
        try {
            await api.delete(`/admin/knowledge/${id}`);
            setChunks(chunks.filter(c => c._id !== id));
        } catch (error) {
            alert("Failed to delete chunk");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/admin/knowledge', formData);
            if (res.data.success) {
                // Prepend new chunk and reset
                setChunks(prev => [res.data.data, ...prev]);
                setFormData({ sourceType: 'Playbook', sourceName: '', content: '' });
                alert("Knowledge added successfully! (Embedding generated)");
            }
        } catch (error) {
            console.error("Failed to add chunk", error);
            alert("Failed to add knowledge. check console.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Knowledge Base</h1>
                    <p className="text-slate-400">Manage internal documentation for the AI Assistant.</p>
                </div>
                {/* Remove total count since it's dynamic now or fetch separate stat if needed */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-fit sticky top-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Plus size={18} className="text-cyan-400" /> Add Knowledge
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Source Type</label>
                            <select
                                value={formData.sourceType}
                                onChange={e => setFormData({ ...formData, sourceType: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                            >
                                <option value="Playbook">Playbook</option>
                                <option value="Rule Documentation">Rule Documentation</option>
                                <option value="SOP">SOP</option>
                                <option value="MITRE">MITRE ATT&CK</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Source Name / Title</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., SQL Injection Response Plan"
                                value={formData.sourceName}
                                onChange={e => setFormData({ ...formData, sourceName: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-1">Content</label>
                            <textarea
                                required
                                rows={10}
                                placeholder="Paste clean text content here..."
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono text-sm"
                            ></textarea>
                            <p className="text-xs text-slate-500 mt-1">
                                * Embedding & Tags will be auto-generated by AI upon submission.
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded transition-colors flex justify-center items-center gap-2"
                        >
                            {submitting ? <Loader className="animate-spin" size={18} /> : <Database size={18} />}
                            {submitting ? "Processing..." : "Add to Knowledge Base"}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-4 h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar">
                    {chunks.length === 0 && !loading ? (
                        <div className="text-slate-500 text-center py-10 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
                            No knowledge chunks found. Add some!
                        </div>
                    ) : (
                        chunks.map((chunk, index) => {
                            if (chunks.length === index + 1) {
                                return (
                                    <div ref={lastChunkElementRef} key={chunk._id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
                                        <ChunkContent chunk={chunk} handleDelete={handleDelete} />
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={chunk._id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
                                        <ChunkContent chunk={chunk} handleDelete={handleDelete} />
                                    </div>
                                );
                            }
                        })
                    )}
                    {loading && <div className="text-slate-400 text-center py-4">Loading more...</div>}
                </div>
            </div>
        </div>
    );
};

const ChunkContent = ({ chunk, handleDelete }) => (
    <>
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded bg-slate-700 ${chunk.sourceType === 'Rule Documentation' ? 'text-red-400' : 'text-cyan-400'}`}>
                    <BookOpen size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white">{chunk.sourceName}</h3>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">{chunk.sourceType}</span>
                </div>
            </div>
            <button onClick={() => handleDelete(chunk._id)} className="text-slate-500 hover:text-red-400 transition-colors">
                <Trash2 size={18} />
            </button>
        </div>
        <p className="text-slate-300 text-sm line-clamp-3 mb-3 font-mono bg-slate-900/50 p-2 rounded">
            {chunk.content}
        </p>
        <div className="flex flex-wrap gap-2">
            {chunk.tags && chunk.tags.map((tag, i) => (
                <span key={i} className="flex items-center gap-1 text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                    <Tag size={10} /> {tag}
                </span>
            ))}
        </div>
    </>
);

export default KnowledgeBase;

