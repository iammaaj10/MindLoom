'use client';

import { useState, useRef, useEffect } from 'react';
import { getChatSessions, getChatMessages, deleteChatSession, getChunkContent } from '@/app/actions/chat';

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
  const isSubmittingRef = useRef(false); // Fix A2: Guard against double-submit
  
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [citationContextMsg, setCitationContextMsg] = useState<string>('');
  const [citationContent, setCitationContent] = useState<{content: string, documentId: string, documentTitle?: string} | null>(null);
  const [isCitationLoading, setIsCitationLoading] = useState(false);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCitationClick = async (chunkId: string, contextSentence: string) => {
    setSelectedCitationId(chunkId);
    setCitationContextMsg(contextSentence.trim());
    setCitationContent(null);
    setIsCitationLoading(true);
    const res = await getChunkContent(chunkId);
    if (res.success) {
      setCitationContent(res.chunk);
    }
    setIsCitationLoading(false);
  };

  const renderContentWithCitations = (content: string) => {
    const citationRegex = /\[([a-f0-9]{24})\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let citationCount = 0;
  
    while ((match = citationRegex.exec(content)) !== null) {
      const textBefore = content.slice(lastIndex, match.index);
      parts.push(textBefore);
      
      // Extract the last sentence before the citation for context
      const sentences = textBefore.split(/(?<=[.!?])\s+/);
      const citedSentence = sentences[sentences.length - 1] || textBefore;

      citationCount++;
      const chunkId = match[1];
      
      parts.push(
        <button
          key={`cite-${match.index}`}
          onClick={() => handleCitationClick(chunkId, citedSentence)}
          className="inline-flex items-center justify-center min-w-[1.25rem] h-5 mx-1 px-1 text-[10px] font-bold font-mono text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded cursor-pointer transition-colors align-text-bottom"
          title="View Source Citation"
        >
          {citationCount}
        </button>
      );
      lastIndex = citationRegex.lastIndex;
    }
    parts.push(content.slice(lastIndex));
    return parts;
  };

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

  const handleSubmit = async (e?: React.FormEvent, retryText?: string) => {
    if (e) e.preventDefault();
    const textToSubmit = retryText || input;
    if (!textToSubmit.trim() || isLoading || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSubmit.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!retryText) setInput('');
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
            ? { ...m, content: m.content + '\n\n⚠️ **Stream interrupted.** The response may be incomplete. Please send your message again to retry.', isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleRetry = (msgId: string) => {
    const msgIndex = messages.findIndex(m => m.id === msgId);
    if (msgIndex > 0) {
      const userMsg = messages[msgIndex - 1];
      if (userMsg.role === 'user') {
        // Remove the failed assistant message
        setMessages(prev => prev.filter(m => m.id !== msgId));
        // Retry
        handleSubmit(undefined, userMsg.content);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* ─── Header ─── */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">AI Companion</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Dual-layer hybrid RAG chat. Queries are routed locally or to Gemini automatically.
        </p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* ─── Sidebar (History) ─── */}
        <div className="w-64 flex flex-col gap-4 border-r border-[var(--border)] pr-4">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--text-primary)] text-[var(--bg-root)] hover:opacity-90 transition-all text-sm font-semibold shadow-md active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {sessions.map(s => (
              <div 
                key={s._id}
                onClick={() => handleSelectSession(s._id)}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${activeSessionId === s._id ? 'bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm' : 'bg-transparent border border-transparent hover:bg-[var(--bg-elevated)]/50'}`}
              >
                <div className={`truncate text-sm font-medium ${activeSessionId === s._id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                  {s.title}
                </div>
                <button 
                  onClick={(e) => handleDeleteSession(e, s._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Chat Window ─── */}
        <div className="flex-1 flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm relative">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mb-6 shadow-sm">
                <svg className="w-10 h-10 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">How can I help you today?</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md leading-relaxed">
                Try asking "Summarize my documents" to test the Local Router, or a complex synthesis question to test Cortex Ultra.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-6 py-4 ${
                    msg.role === 'user'
                      ? 'bg-[var(--text-primary)] text-[var(--bg-root)] rounded-tr-sm shadow-md'
                      : 'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm shadow-sm'
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
                        {msg.source === 'local' ? 'Retrieved via Local Engine' : 'Synthesized by Cortex Ultra'}
                      </span>
                    </div>
                  )}

                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {renderContentWithCitations(msg.content)}
                    {msg.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1.5 bg-indigo-500 animate-pulse rounded-sm align-middle" />
                    )}
                    {msg.content.includes('⚠️') && !msg.isStreaming && (
                      <div className="mt-4">
                        <button 
                          onClick={() => handleRetry(msg.id)}
                          className="px-4 py-2 rounded-xl bg-[var(--bg-root)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all text-sm font-semibold flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Retry Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-[var(--bg-surface)] pt-4 border-t border-transparent">
          <form onSubmit={handleSubmit} className="relative flex items-end max-w-4xl mx-auto">
            <div className="relative w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 rounded-2xl transition-all shadow-sm">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Message Mindloom..."
                className="w-full bg-transparent pl-5 pr-14 py-4 min-h-[60px] max-h-[200px] resize-none text-[15px] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-3 bottom-3 p-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-root)] hover:opacity-90 disabled:opacity-30 disabled:hover:opacity-30 transition-all shadow-md active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
          <div className="text-center mt-3">
            <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
              MindLoom Cortex Ultra Hybrid Engine • AI can make mistakes.
            </span>
          </div>
        </div>
      </div>
    </div>

      {/* Citation Modal */}
      {selectedCitationId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setSelectedCitationId(null)}>
          <div 
            className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-elevated)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider font-mono">Source Citation</h3>
              <button onClick={() => setSelectedCitationId(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar text-[var(--text-primary)] text-sm leading-relaxed whitespace-pre-wrap">
              {isCitationLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : citationContent ? (
                <>
                  {citationContextMsg && (
                    <div className="mb-6 pb-4 border-b border-[var(--border)]">
                      <div className="text-[11px] font-bold tracking-wider text-[var(--text-tertiary)] uppercase mb-2">Cited for:</div>
                      <div className="text-[14px] text-[var(--text-secondary)] italic">"{citationContextMsg}"</div>
                    </div>
                  )}
                  <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-400">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    {citationContent.documentTitle || citationContent.documentId}
                  </div>
                  <div className="bg-[var(--bg-root)] border border-[var(--border)] rounded-xl p-4 text-[13.5px] leading-relaxed text-[var(--text-secondary)] font-serif shadow-inner">
                    {citationContent.content}
                  </div>
                </>
              ) : (
                <div className="text-red-400">Failed to load citation content.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
