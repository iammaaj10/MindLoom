'use client';

import { useState, useRef, useEffect } from 'react';
import { submitReview } from '@/app/actions/study';

interface Props {
  initialItems: any[];
}

export default function StudyDashboard({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'interview'>('flashcards');

  // Flashcards state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interview state
  const [interviewTopic, setInterviewTopic] = useState('');
  const [interviewMessages, setInterviewMessages] = useState<{ role: string; content: string; isStreaming?: boolean }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isInterviewing, setIsInterviewing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Flashcard Handlers ---
  const handleScore = async (quality: number) => {
    if (isSubmitting || items.length === 0) return;
    setIsSubmitting(true);
    
    const currentItem = items[currentIndex];
    const res = await submitReview(currentItem._id, quality);
    
    if (res.success) {
      setItems((prev) => prev.filter((_, i) => i !== currentIndex));
      setShowAnswer(false);
    }
    
    setIsSubmitting(false);
  };

  // --- Interview Handlers ---
  const startInterview = () => {
    if (!interviewTopic.trim()) return;
    setIsInterviewing(true);
    setInterviewMessages([
      { role: 'user', content: `Let's start the mock interview on ${interviewTopic}.` },
    ]);
    sendInterviewMessage(`Let's start the mock interview on ${interviewTopic}.`);
  };

  const submitInterviewAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    setInterviewMessages(prev => [...prev, { role: 'user', content: userInput }]);
    sendInterviewMessage(userInput);
    setUserInput('');
  };

  const sendInterviewMessage = async (msg: string) => {
    setInterviewMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
    
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: msg, 
          topic: interviewTopic,
          history: interviewMessages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!res.body) throw new Error('No stream');
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
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
              if (data.type === 'text') {
                setInterviewMessages(prev => {
                  const last = prev[prev.length - 1];
                  return [
                    ...prev.slice(0, -1),
                    { ...last, content: last.content + data.text }
                  ];
                });
              } else if (data.type === 'done') {
                setInterviewMessages(prev => {
                  const last = prev[prev.length - 1];
                  
                  // Optional: Web Speech API for voice output
                  if ('speechSynthesis' in window && last.content) {
                    const utterance = new SpeechSynthesisUtterance(last.content);
                    utterance.rate = 1.1;
                    window.speechSynthesis.speak(utterance);
                  }

                  return [
                    ...prev.slice(0, -1),
                    { ...last, isStreaming: false }
                  ];
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.error(err);
      setInterviewMessages(prev => {
        const last = prev[prev.length - 1];
        return [
          ...prev.slice(0, -1),
          { ...last, content: '⚠️ Connection error.', isStreaming: false }
        ];
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interviewMessages]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/[0.08] pb-4">
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`text-sm font-semibold transition-colors ${activeTab === 'flashcards' ? 'text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Spaced Repetition (SM-2)
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`text-sm font-semibold transition-colors ${activeTab === 'interview' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Adaptive Mock Interview
        </button>
      </div>

      {activeTab === 'flashcards' && (
        <div className="max-w-2xl mx-auto mt-12">
          {items.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/[0.1] rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">You're all caught up!</h3>
              <p className="text-sm text-zinc-400">No topics are due for review right now.</p>
            </div>
          ) : (
            <div className="rounded-2xl p-8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.1] shadow-[0_8px_30px_rgba(0,0,0,0.5)] min-h-[300px] flex flex-col items-center justify-center text-center relative overflow-hidden transition-all">
              <div className="absolute top-4 right-4 text-xs font-mono text-zinc-500">{items.length} left</div>
              
              <h2 className="text-sm text-cyan-400 font-semibold tracking-wider uppercase mb-6">Explain this concept:</h2>
              <div className="text-3xl font-bold text-white mb-12">{items[currentIndex].topic}</div>
              
              {!showAnswer ? (
                <button onClick={() => setShowAnswer(true)} className="btn-primary w-48">Show Answer</button>
              ) : (
                <div className="w-full animate-fade-up">
                  <p className="text-sm text-zinc-400 mb-6">How well did you know the answer?</p>
                  <div className="grid grid-cols-4 gap-3">
                    <button onClick={() => handleScore(0)} disabled={isSubmitting} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold">Blackout (0)</button>
                    <button onClick={() => handleScore(2)} disabled={isSubmitting} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold">Hard (2)</button>
                    <button onClick={() => handleScore(4)} disabled={isSubmitting} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold">Good (4)</button>
                    <button onClick={() => handleScore(5)} disabled={isSubmitting} className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold">Perfect (5)</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'interview' && (
        <div className="h-[600px] flex flex-col border border-white/[0.08] rounded-2xl bg-black/40 shadow-[0_4px_25px_rgba(0,0,0,0.4)] overflow-hidden">
          {!isInterviewing ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Mock Interview</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
                Enter a topic you want to be interviewed on. Cortex Ultra will dynamically generate questions based ONLY on your local knowledge base.
              </p>
              <div className="flex items-center gap-3 w-full max-w-md">
                <input
                  type="text"
                  value={interviewTopic}
                  onChange={e => setInterviewTopic(e.target.value)}
                  placeholder="e.g. Next.js App Router"
                  className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
                <button onClick={startInterview} disabled={!interviewTopic.trim()} className="btn-primary bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  Start
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  <span className="text-sm font-semibold text-white">Interview: {interviewTopic}</span>
                </div>
                <button onClick={() => setIsInterviewing(false)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">End Session</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {interviewMessages.filter(m => m.role !== 'user' || m.content !== `Let's start the mock interview on ${interviewTopic}.`).map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-50' : 'bg-white/[0.05] border border-white/[0.08] text-zinc-200'}`}>
                      {msg.content}
                      {msg.isStreaming && <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-400 animate-pulse" />}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white/[0.02] border-t border-white/[0.08]">
                <form onSubmit={submitInterviewAnswer} className="relative">
                  <input
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                  <button type="submit" disabled={!userInput.trim()} className="absolute right-2 top-2 bottom-2 px-3 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors">
                    Send
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
