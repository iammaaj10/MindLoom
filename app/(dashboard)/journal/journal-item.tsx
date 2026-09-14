'use client';

import { useState } from 'react';
import { updateJournalLog, deleteJournalLog } from '@/app/actions/journal';

interface JournalItemProps {
  log: any;
}

export default function JournalItem({ log }: JournalItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(log.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async () => {
    if (!content.trim() || isSaving) return;
    setIsSaving(true);
    await updateJournalLog(log._id, content);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    await deleteJournalLog(log._id);
    setIsDeleting(false);
  };

  if (isEditing) {
    return (
      <div className="card p-5 space-y-3 border-cyan-500/30">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 bg-white/[0.05] border border-white/[0.1] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none"
        />
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => { setIsEditing(false); setContent(log.content); }}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            onClick={handleUpdate}
            className="px-3 py-1.5 text-xs bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-lg transition-colors"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group card p-5 space-y-3 relative transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">
          {new Date(log.createdAt).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        <div className="flex items-center gap-2">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button 
              onClick={() => setIsEditing(true)}
              className="p-1 text-zinc-500 hover:text-cyan-400 transition-colors"
              title="Edit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button 
              onClick={handleDelete}
              className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
              title="Delete"
              disabled={isDeleting}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Indexed
          </span>
        </div>
      </div>
      
      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
        {log.content}
      </p>
      
      {log.extractedTopics && log.extractedTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.05]">
          {log.extractedTopics.map((topic: string, i: number) => (
            <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
