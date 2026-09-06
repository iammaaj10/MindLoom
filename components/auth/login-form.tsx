'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import Link from 'next/link';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.message && (
        <div className="p-3 rounded-lg text-xs font-medium" style={{ background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.2)', color: 'var(--error)' }}>
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Email
        </label>
        <input id="email" name="email" type="email" placeholder="you@example.com" className="input-field" required autoComplete="email" />
        {state?.errors?.email && (
          <p className="mt-1 text-[11px]" style={{ color: 'var(--error)' }}>{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Password
        </label>
        <input id="password" name="password" type="password" placeholder="••••••••" className="input-field" required autoComplete="current-password" />
        {state?.errors?.password && (
          <p className="mt-1 text-[11px]" style={{ color: 'var(--error)' }}>{state.errors.password[0]}</p>
        )}
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full py-2.5 mt-2">
        {pending ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in...
          </span>
        ) : 'Sign in'}
      </button>

      <p className="text-center text-xs pt-2" style={{ color: 'var(--text-tertiary)' }}>
        No account?{' '}
        <Link href="/signup" className="font-medium hover:underline" style={{ color: 'var(--accent)' }}>
          Create one
        </Link>
      </p>
    </form>
  );
}
