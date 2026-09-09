'use client';

import { useActionState, useRef, useState, useCallback, useEffect } from 'react';
import { uploadDocument } from '@/app/actions/documents';

const categories = [
  'general',
  'study',
  'work',
  'research',
  'personal',
  'finance',
  'health',
];

export default function UploadForm() {
  const [state, action, pending] = useActionState(uploadDocument, undefined);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      const dt = new DataTransfer();
      dt.items.add(e.dataTransfer.files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
      );
    }
    if (file.type.startsWith('image/')) {
      return (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>
    );
  };

  useEffect(() => {
    if (state?.success) {
      setSelectedFile(null);
      if (formRef.current) formRef.current.reset();
    }
  }, [state?.success]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {/* Notifications */}
      {state?.error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-fade-up">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 animate-fade-up shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Document extracted and chunked successfully into MongoDB!</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">Indexed</span>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl p-8 text-center transition-all duration-300 border border-dashed ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/[0.06] shadow-[0_0_40px_rgba(6,182,212,0.2)]'
            : 'border-white/[0.12] bg-white/[0.015] hover:border-white/[0.25] hover:bg-white/[0.03]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-4 animate-fade-up">
            {getFileIcon(selectedFile)}
            <div className="text-left">
              <p className="text-sm font-semibold text-zinc-100">{selectedFile.name}</p>
              <p className="text-xs font-mono text-zinc-400">{formatSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="ml-2 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-zinc-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all shadow-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-200 mb-1">
              Drop file here, or <span className="text-cyan-400 underline underline-offset-4 decoration-cyan-400/40">browse from computer</span>
            </p>
            <p className="text-xs text-zinc-500 font-mono">
              PDF, TXT, MD, Images — Ingests and auto-chunks up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* File Details Fields */}
      {selectedFile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up">
          <div>
            <label htmlFor="doc-title" className="block text-xs font-semibold mb-1.5 text-zinc-400">
              Document Label
            </label>
            <input
              id="doc-title"
              name="title"
              type="text"
              defaultValue={selectedFile.name.replace(/\.[^/.]+$/, '')}
              placeholder="e.g. System Design Notes"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-white/[0.1] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="doc-category" className="block text-xs font-semibold mb-1.5 text-zinc-400">
              Knowledge Category
            </label>
            <select
              id="doc-category"
              name="category"
              defaultValue="general"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-white/[0.1] text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-zinc-900 text-white">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {selectedFile && (
        <button
          type="submit"
          disabled={pending}
          className="relative w-full py-2.5 rounded-xl font-semibold text-xs tracking-wide text-zinc-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 hover:opacity-95 shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 animate-fade-up"
        >
          {pending ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-zinc-950" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Extracting & Chunking Document...</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Process & Chunk into Vector Knowledge</span>
            </>
          )}
        </button>
      )}
    </form>
  );
}
