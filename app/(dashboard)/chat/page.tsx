'use client';

import { useState, useRef, useEffect } from 'react';
import { getChatSessions, getChatMessages, deleteChatSession } from '@/app/actions/chat';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'local' | 'gemini';
  isStreaming?: boolean;
};

type Session = {
  _id: string;
  title: string;
  updatedAt: string;
};

export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const res = await getChatSessions();
    if (res.success) {
      setSessions(res.sessions);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setMessages([]); // Clear current
    const res = await getChatMessages(sessionId);
    if (res.success) {
      const mapped = res.messages.map((m: any) => ({
        id: m._id,
        role: m.role,
        content: m.content,
        source: m.source,
      }));
      setMessages(mapped);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteChatSession(id);
    if (activeSessionId === id) handleNewChat();
    loadSessions();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', isStreaming: true },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          sessionId: activeSessionId || 'default'
        }),
      });

      if (!res.ok) throw new Error('Network response was not ok');

      const contentType = res.headers.get('content-type');
      
      // Handle standard JSON response (Local Router)
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: data.text, source: data.source, isStreaming: false }
              : m
          )
        );
        if (data.sessionId && activeSessionId !== data.sessionId) {
          setActiveSessionId(data.sessionId);
          loadSessions();
        }
        setIsLoading(false);
        return;
      }

      // Handle Streaming SSE (Gemini RAG)
      if (!res.body) throw new Error('No readable stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let source: 'local' | 'gemini' | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '');
            try {
              const data = JSON.parse(dataStr);

              if (data.type === 'meta') {
                source = data.source;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, source: data.source } : m
                  )
                );
                if (data.sessionId && activeSessionId !== data.sessionId) {
                  setActiveSessionId(data.sessionId);
                  loadSessions();
                }
              } else if (data.type === 'text') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + data.text }
                      : m
                  )
                );
              } else if (data.type === 'done') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, isStreaming: false } : m
                  )
                );
              }
            } catch (e) {
              // Ignore parse errors on partial chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: '⚠️ Service temporarily unavailable.', isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* ─── Header ─── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">AI Companion</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Dual-layer hybrid RAG chat. Queries are routed locally or to Gemini automatically.
        </p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* ─── Sidebar (History) ─── */}
        <div className="w-64 flex flex-col gap-4">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors text-sm font-semibold"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {sessions.map(s => (
              <div 
                key={s._id}
                onClick={() => handleSelectSession(s._id)}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${activeSessionId === s._id ? 'bg-white/[0.08] border-white/[0.15]' : 'bg-transparent border-transparent hover:bg-white/[0.04]'}`}
              >
                <div className="truncate text-sm text-zinc-300 font-medium">
                  {s.title}
                </div>
                <button 
                  onClick={(e) => handleDeleteSession(e, s._id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Chat Window ─── */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.4)] relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Ask me anything about your documents.</p>
              <p className="text-xs text-zinc-400 mt-2 max-w-xs leading-relaxed">
                Try asking "How many documents do I have?" to test the Local Router, or a specific question about your files to test Gemini.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50'
                      : 'bg-white/[0.05] border border-white/[0.08] text-zinc-200 shadow-sm'
                  }`}
                >
                  {/* Source Badge (for AI) */}
                  {msg.role === 'assistant' && msg.source && (
                    <div className="flex items-center mb-3">
                      <span
                        className={`text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                          msg.source === 'local'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${msg.source === 'local' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                        Answered via {msg.source}
                      </span>
                    </div>
                  )}

                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/40 border-t border-white/[0.08]">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message your AI..."
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-4 pr-12 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-zinc-600 font-mono">
              MindLoom Cortex Ultra Hybrid Engine
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
