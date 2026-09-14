'use client';

import { useState } from 'react';
import { createJournalEntry } from '@/app/actions/journal';

export default function JournalForm() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');

    const res = await createJournalEntry(content);
    
    if (res.error) {
      setError(res.error);
    } else {
      setContent('');
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you learn or work on today?"
          className="w-full h-32 bg-white/[0.04] border border-white/[0.1] rounded-xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
          disabled={isSubmitting}
        />
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-500">
          Markdown supported
        </div>
      </div>

      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="w-full btn-primary h-11 text-sm font-semibold disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="w-4 h-4 animate-spin text-zinc-900" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
            </svg>
            Saving & Extracting...
          </>
        ) : (
          'Save Entry'
        )}
      </button>
    </form>
  );
}
