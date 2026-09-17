'use client';

import { useState, useEffect } from 'react';
import { getUserSettings, updateProfile, wipeUserData, changePassword } from '@/app/actions/settings';
import { exportUserData, type ExportFormat } from '@/app/actions/export';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [email, setEmail] = useState('');
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password change
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Export
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getUserSettings();
      if (res.success && res.user) {
        setDisplayName(res.user.displayName);
        setEmail(res.user.email);
        setHasCustomKey(res.user.hasCustomKey);
      }
    }
    load();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateProfile(displayName, apiKey);
    if (res.success) {
      showSuccess('Profile updated successfully.');
      if (apiKey) setHasCustomKey(true);
    } else if (res.error) {
      setErrorMsg(res.error);
    }
    setIsSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsChangingPw(true);
    const res = await changePassword(currentPw, newPw);
    if (res.success) {
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } else if (res.error) {
      setPwMsg({ type: 'error', text: res.error });
    }
    setIsChangingPw(false);
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    const res = await exportUserData(format);
    if (res.success && res.data && res.filename) {
      // Trigger download
      const blob = new Blob([res.data], { type: res.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess(`Data exported as ${format.toUpperCase()}.`);
    } else if (res.error) {
      setErrorMsg(res.error);
    }
    setIsExporting(false);
  };

  const handleWipe = async () => {
    if (!confirm('Are you absolutely sure? This will delete all your documents, logs, and chat history permanently.')) return;
    setIsWiping(true);
    await wipeUserData();
    setIsWiping(false);
    showSuccess('All data has been wiped.');
  };

  return (
    <div className="space-y-8 animate-fade-up max-w-2xl">
      <div className="pb-6 border-b border-white/[0.07]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
          Settings & Preferences
        </h1>
        <p className="text-sm text-zinc-400">
          Manage your account, API keys, data ownership, and security.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2 animate-fade-up">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium animate-fade-up">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)] space-y-4">
          <h2 className="text-base font-semibold text-zinc-200">Account Profile</h2>
          
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
            <input 
              type="text" 
              value={email} 
              disabled 
              className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Display Name</label>
            <input 
              type="text" 
              value={displayName} 
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
        </div>

        {/* API Keys */}
        <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)] space-y-4">
          <h2 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
            API Keys
            {hasCustomKey && <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Custom Key Active</span>}
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            By default, MindLoom uses the system-provided Gemini API key. If you want to use your own Google AI Studio key, enter it below.
          </p>
          
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Google Gemini API Key</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)}
              placeholder={hasCustomKey ? '•••••••••••••••••••• (Custom key active)' : 'Paste your API key here...'}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all text-sm font-semibold disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* B5: Password Change */}
      <form onSubmit={handlePasswordChange} className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)] space-y-4">
        <h2 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Change Password
        </h2>
        
        {pwMsg && (
          <div className={`p-3 rounded-lg text-sm font-medium ${pwMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
            {pwMsg.text}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Current Password</label>
          <input 
            type="password" 
            value={currentPw} 
            onChange={e => setCurrentPw(e.target.value)}
            placeholder="Enter your current password"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">New Password</label>
            <input 
              type="password" 
              value={newPw} 
              onChange={e => setNewPw(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPw} 
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isChangingPw || !currentPw || !newPw || !confirmPw} className="px-5 py-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all text-sm font-semibold disabled:opacity-40">
            {isChangingPw ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>

      {/* B1: Data Export */}
      <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)] space-y-4">
        <h2 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Your Data
        </h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Download all your documents metadata, journal entries, chat history, and study items. Your data belongs to you.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-zinc-300 hover:bg-white/[0.1] hover:text-white transition-all text-sm font-medium disabled:opacity-40 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {isExporting ? 'Exporting...' : 'Export as JSON'}
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-zinc-300 hover:bg-white/[0.1] hover:text-white transition-all text-sm font-medium disabled:opacity-40 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            {isExporting ? 'Exporting...' : 'Export as CSV'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl p-6 mt-4 bg-rose-500/5 border border-rose-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
        <h2 className="text-base font-semibold text-rose-400 mb-2">Danger Zone</h2>
        <p className="text-xs text-zinc-400 leading-relaxed mb-6 max-w-md">
          Permanently delete all of your uploaded documents, generated chunks, vector embeddings, journal entries, and chat history. This action cannot be undone.
        </p>
        <button 
          onClick={handleWipe} 
          disabled={isWiping}
          className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors text-sm font-semibold"
        >
          {isWiping ? 'Wiping Data...' : 'Wipe All User Data'}
        </button>
      </div>
    </div>
  );
}
