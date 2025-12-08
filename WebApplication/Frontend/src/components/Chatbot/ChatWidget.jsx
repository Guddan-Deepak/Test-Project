import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Trash2, Maximize2 } from 'lucide-react';
import api from '../../utils/api';

const ChatWidget = ({ isOpen, onClose, onOpen, incidentId, initialMsg }) => {
    // State management
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial greeting reference to prevent duplication
    const hasGreetedKey = "chat_greeted";

    // Auto-scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Handle Initial Message Injection (from "Ask Copilot")
    useEffect(() => {
        if (isOpen && initialMsg) {
            // Check if already sent to avoid dupes
            const lastMsg = messages[messages.length - 1];
            if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== initialMsg) {
                handleSend(null, initialMsg);
            }
        }
    }, [isOpen, initialMsg]);

    // Initial Greeting (Only once per session roughly)
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                { role: 'assistant', content: 'Hello! I am SHIELD, your SOC Assistant. I can help investigate incidents, explain alerts, or query playbooks.' }
            ]);
        }
    }, []);


    const handleSend = async (e, forcedMsg = null) => {
        if (e) e.preventDefault();
        const textToSend = forcedMsg || input;

        if (!textToSend.trim()) return;

        // Optimistic UI Update
        const userMsg = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Placeholder for AI response
        setMessages(prev => [...prev, { role: 'assistant', content: 'Thinking...' }]);

        try {
            const token = localStorage.getItem("token"); // Get Auth Token for direct fetch
            const payload = { message: textToSend };
            if (incidentId) payload.incidentId = incidentId;

            // Determine API URL (handle dev vs prod correctly if needed, or use api.defaults.baseURL)
            // For now assuming relative path worked via proxy or use full URL from env
            const SERVER_URL = import.meta.env.VITE_SERVER || "http://localhost:8000/api/v1";
            const API_URL = `${SERVER_URL.replace(/\/$/, "")}/ai/incident-chat`;

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            // Streaming Logic
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponseText = "";

            // Replace "Thinking..." with empty string to start streaming
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = "";
                return newMsgs;
            });

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiResponseText += chunk;

                // Update specific message directly
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = aiResponseText;
                    return newMsgs;
                });
            }

        } catch (error) {
            console.error("Chat Streaming Error:", error);
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = 'Error connecting to AI Brain. Connection interrupted.';
                return newMsgs;
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async (e) => {
        e.stopPropagation(); // prevent expanding if clicked in header
        if (!window.confirm("Are you sure you want to clear your chat history?")) return;

        try {
            setLoading(true);
            await api.delete('/ai/history');
            setMessages([
                { role: 'assistant', content: 'History cleared. Starting fresh session.' }
            ]);
        } catch (error) {
            console.error("Clear History Failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER: LAUNCHER STATE (Closed) ---
    if (!isOpen) {
        return (
            <button
                onClick={onOpen}
                className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all hover:scale-110 z-50 group"
                title="Open AI Assistant"
            >
                <Bot size={28} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </button>
        );
    }

    // --- RENDER: WINDOW STATE (Open) ---
    return (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-5 fade-in duration-200 flex flex-col overflow-hidden ring-1 ring-slate-700/50">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                        <Bot size={20} className="text-blue-400" />
                        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-800 rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-100 text-sm tracking-wide">SHIELD Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${incidentId ? 'bg-amber-400' : 'bg-slate-500'}`}></span>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                                {incidentId ? `INCIDENT MODE` : 'GLOBAL MODE'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={handleClearHistory}
                        className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                        title="Clear History"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                    >
                        <Minimize2 size={18} />
                    </button>
                </div>
            </div>

            {/* Context Banner (If incident active) */}
            {incidentId && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 justify-between">
                    <span className="text-xs text-amber-500 font-medium truncate">Analyzing Incident: {incidentId}</span>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-300 border border-slate-700/50 rounded-bl-none'
                            }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && messages[messages.length - 1]?.role !== 'assistant' && (
                    // Only show spinner if we haven't started streaming tokens yet
                    <div className="flex justify-start">
                        <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-none p-4 flex gap-1.5 items-center shadow-sm">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-700 bg-slate-800 shrink-0">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        className="flex-1 bg-slate-900 text-slate-200 border border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm placeholder:text-slate-500"
                        disabled={loading && messages[messages.length - 1]?.role !== 'assistant'}
                    />
                    <button
                        type="submit"
                        disabled={loading && messages[messages.length - 1]?.role !== 'assistant' || !input.trim()}
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-slate-500">AI responses can be inaccurate. verify info.</p>
                </div>
            </form>
        </div>
    );
};

export default ChatWidget;
