import type { Metadata } from 'next';
import SignupForm from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-16 dot-grid">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)', opacity: 0.5 }} />

      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="card-glow">
          <div className="relative rounded-[var(--radius-lg)] p-8" style={{ background: 'var(--bg-elevated)' }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  S
                </div>
                <div
                  className="absolute -inset-1 rounded-lg opacity-40"
                  style={{ background: 'var(--accent)', filter: 'blur(12px)', zIndex: -1 }}
                />
              </div>
              <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Create your account
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Start building your personal AI
              </p>
            </div>

            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
