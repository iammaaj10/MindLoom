import type { Metadata } from 'next';
import SignupForm from '@/components/auth/signup-form';
import { MindloomLogo } from '@/components/ui/mindloom-logo';

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
              <div className="inline-block mb-4">
                <MindloomLogo size="lg" />
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
