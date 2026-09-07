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
      // Populate the hidden file input
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    }
    if (file.type.startsWith('image/')) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    );
  };

  // Reset form on success
  useEffect(() => {
    if (state?.success) {
      setSelectedFile(null);
      if (formRef.current) formRef.current.reset();
    }
  }, [state?.success]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {/* Error Message */}
      {state?.error && (
        <div
          className="p-3 rounded-lg text-xs font-medium"
          style={{
            background: 'rgba(255,68,102,0.1)',
            border: '1px solid rgba(255,68,102,0.2)',
            color: '#ff4466',
          }}
        >
          {state.error}
        </div>
      )}

      {/* Success Message */}
      {state?.success && (
        <div
          className="p-3 rounded-lg text-xs font-medium"
          style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            color: '#22c55e',
          }}
        >
          Document uploaded successfully!
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative cursor-pointer rounded-xl p-8 text-center transition-all duration-300"
        style={{
          border: dragActive
            ? '2px dashed #6366f1'
            : '2px dashed var(--border)',
          background: dragActive
            ? 'rgba(99, 102, 241, 0.05)'
            : 'rgba(255,255,255,0.01)',
          boxShadow: dragActive
            ? '0 0 30px rgba(99, 102, 241, 0.1)'
            : 'none',
        }}
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
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              {getFileIcon(selectedFile)}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {selectedFile.name}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                {formatSize(selectedFile.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="ml-2 p-1 rounded hover:bg-zinc-800 transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-tertiary)' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Drop a file here or click to browse
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              PDF, TXT, MD, PNG, JPG, WebP — up to 10MB
            </p>
          </>
        )}
      </div>

      {/* Title + Category Row */}
      {selectedFile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up">
          <div>
            <label htmlFor="doc-title" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Title
            </label>
            <input
              id="doc-title"
              name="title"
              type="text"
              defaultValue={selectedFile.name.replace(/\.[^/.]+$/, '')}
              placeholder="Document title"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="doc-category" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Category
            </label>
            <select
              id="doc-category"
              name="category"
              defaultValue="general"
              className="input-field"
              style={{ appearance: 'none' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
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
          className="btn-primary w-full py-2.5 animate-fade-up"
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload document
            </span>
          )}
        </button>
      )}
    </form>
  );
}
