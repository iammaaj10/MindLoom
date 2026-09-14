'use client';

import { useState, useEffect } from 'react';
import { getUserSettings, updateProfile, wipeUserData } from '@/app/actions/settings';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [email, setEmail] = useState('');
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateProfile(displayName, apiKey);
    if (res.success) {
      setSuccessMsg('Profile updated successfully.');
      if (apiKey) setHasCustomKey(true);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
    setIsSaving(false);
  };

  const handleWipe = async () => {
    if (!confirm('Are you absolutely sure? This will delete all your documents, logs, and chat history permanently.')) return;
    setIsWiping(true);
    await wipeUserData();
    setIsWiping(false);
  };

  return (
    <div className="space-y-8 animate-fade-up max-w-2xl">
      <div className="pb-6 border-b border-white/[0.07]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
          Settings & Preferences
        </h1>
        <p className="text-sm text-zinc-400">
          Manage your account, API keys, and data ownership.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          {successMsg}
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
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
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
            By default, MindLoom uses the system-provided Gemini API key. If you want to use your own Google AI Studio key to bypass system rate limits, enter it below.
          </p>
          
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Google Gemini API Key</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)}
              placeholder={hasCustomKey ? '•••••••••••••••••••• (Custom key active)' : 'Paste your API key here...'}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="btn-primary w-32">
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="rounded-2xl p-6 mt-12 bg-rose-500/5 border border-rose-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
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
