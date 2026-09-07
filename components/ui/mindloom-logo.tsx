import React from 'react';

interface MindloomLogoProps {
  size?: 'sm' | 'md' | 'lg' | number;
  showWordmark?: boolean;
  showBadge?: boolean;
  className?: string;
}

export function MindloomLogo({
  size = 'md',
  showWordmark = false,
  showBadge = false,
  className = '',
}: MindloomLogoProps) {
  const uid = React.useId().replace(/:/g, '');

  // Resolve numeric pixel dimension
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 24
      : size === 'lg'
      ? 44
      : 30;

  const bgGradId = `ml-bg-${uid}`;
  const borderGradId = `ml-border-${uid}`;
  const mGradId = `ml-m-${uid}`;
  const lGradId = `ml-l-${uid}`;
  const glowFilterId = `ml-glow-${uid}`;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* ─── Neural ML Monogram Mark ─── */}
      <div
        className="relative group flex items-center justify-center transition-transform duration-200 hover:scale-[1.04]"
        style={{ width: pixelSize, height: pixelSize }}
      >
        {/* Ambient Back Glow */}
        <div
          className="absolute -inset-1 rounded-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(6, 182, 212, 0.2) 60%, transparent 80%)',
            filter: 'blur(8px)',
            zIndex: 0,
          }}
        />

        {/* Precision Vector SVG */}
        <svg
          viewBox="0 0 36 36"
          width={pixelSize}
          height={pixelSize}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 overflow-visible drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
        >
          <defs>
            {/* Dark Bezel Surface */}
            <linearGradient id={bgGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1c1d25" />
              <stop offset="50%" stopColor="#12131a" />
              <stop offset="100%" stopColor="#0a0a0f" />
            </linearGradient>

            {/* Specular Edge Border */}
            <linearGradient id={borderGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.28)" />
              <stop offset="45%" stopColor="rgba(99, 102, 241, 0.35)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0.2)" />
            </linearGradient>

            {/* M Thread Gradient (Violet -> Electric Indigo) */}
            <linearGradient id={mGradId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* L Thread Gradient (Cyan -> Neon Teal) */}
            <linearGradient id={lGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Synaptic Glow Filter */}
            <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
            </filter>
          </defs>

          {/* 1. Hardware Bezel Background Squircle */}
          <rect
            x="1.5"
            y="1.5"
            width="33"
            height="33"
            rx="8.5"
            fill={`url(#${bgGradId})`}
            stroke={`url(#${borderGradId})`}
            strokeWidth="1.2"
          />

          {/* Top Edge Specular Highlight */}
          <line
            x1="7"
            y1="2.5"
            x2="29"
            y2="2.5"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeLinecap="round"
            strokeWidth="0.8"
          />

          {/* Loom Grid / Weft Accent (Subtle machine learning matrix guide) */}
          <line
            x1="7"
            y1="18"
            x2="11"
            y2="18"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
            strokeDasharray="1.5 1.5"
          />
          <line
            x1="25"
            y1="18"
            x2="29"
            y2="18"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
            strokeDasharray="1.5 1.5"
          />

          {/* 2. Neural 'M' Thread (Left pillar, valley, apex) */}
          <path
            d="M 8.5 24.5 V 11.5 L 15.5 18 L 22.5 11.5"
            stroke={`url(#${mGradId})`}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. Neural 'L' Thread (Interwoven through apex, down stem, into base foot) */}
          <path
            d="M 22.5 11.5 V 24.5 H 27.5"
            stroke={`url(#${lGradId})`}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 4. Synaptic Pulse / Core Machine Learning Node (at center valley intersection) */}
          <circle
            cx="15.5"
            cy="18"
            r="3"
            fill="#38bdf8"
            opacity="0.5"
            filter={`url(#${glowFilterId})`}
          />
          <circle cx="15.5" cy="18" r="1.6" fill="#ffffff" />

          {/* Micro Terminal Nodes (Representing neural weights / loom pins) */}
          <circle cx="8.5" cy="24.5" r="1.1" fill="#c084fc" />
          <circle cx="22.5" cy="11.5" r="1.1" fill="#7dd3fc" />
          <circle cx="27.5" cy="24.5" r="1.1" fill="#34d399" />
        </svg>
      </div>

      {/* ─── Wordmark ─── */}
      {showWordmark && (
        <div className="flex items-center gap-2">
          <span
            className="font-semibold tracking-tight text-white"
            style={{ fontSize: pixelSize >= 36 ? '1.25rem' : '0.925rem' }}
          >
            Mindloom
          </span>

          {showBadge && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>ML</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MindloomLogo;
