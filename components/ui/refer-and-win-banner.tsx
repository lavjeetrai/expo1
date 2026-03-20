import React from 'react';

/**
 * Decorative paper airplane SVG with floating dots.
 */
export function PaperAirplane({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg
        width="80"
        height="80"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 4px 16px rgba(167,139,250,0.45))' }}
      >
        <path d="M5.1,26.9L50,10L25,35L5.1,26.9z" fill="#A78BFA" />
        <path d="M25,35L15,29L20,20L25,35z" fill="#DB2777" />
        <path d="M25,35L10,27L15,15L25,35z" fill="#C084FC" />
        <path d="M25,35L5.1,26.9L50,10L25,35z" fill="#9370DB" opacity="0.5" />
      </svg>
      <div
        className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-80"
        style={{ top: '75%', left: 0, transform: 'translate(-30px, 10px)' }}
      />
      <div
        className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-60"
        style={{ top: '75%', left: 0, transform: 'translate(-50px, 5px)' }}
      />
    </div>
  );
}

/**
 * Decorative green checkmarks.
 */
export function GreenChecks({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 40 40">
        <path
          d="M5 20 L15 30 L35 10"
          stroke="#32CD32"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          transform="rotate(-15 20 20)"
        />
      </svg>
      <svg
        width="40"
        height="40"
        className="absolute -top-2 -right-2"
        viewBox="0 0 40 40"
      >
        <path
          d="M5 20 L15 30 L35 10"
          stroke="#6EE7B7"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          transform="rotate(15 20 20)"
        />
      </svg>
    </div>
  );
}

interface ClassroomBannerHeroProps {
  title: string;
  subtitle?: string;
  /** If provided, rendered as small colored pill above title */
  badge?: string;
  badgeColor?: string;
}

/**
 * ClassroomBannerHero
 *
 * Premium animated banner header for classroom-style pages.
 * Uses paper airplane decorations and floating accents.
 */
export default function ClassroomBannerHero({
  title,
  subtitle,
  badge,
  badgeColor = 'from-violet-500 to-purple-600',
}: ClassroomBannerHeroProps) {
  return (
    <section
      aria-label={title}
      className="relative w-full flex flex-col items-start justify-center py-8 px-2 overflow-visible"
    >
      {/* Left airplane */}
      <PaperAirplane className="absolute -left-4 -top-6 animate-float opacity-90 pointer-events-none" />

      {/* Right airplane (flipped) */}
      <PaperAirplane className="absolute right-0 -top-6 animate-float-reverse opacity-80 pointer-events-none" />

      {/* Green checks accent */}
      <GreenChecks className="absolute top-0 right-16 opacity-70 pointer-events-none" />

      {/* Pink dots */}
      <div className="absolute right-4 top-1/2 pointer-events-none space-y-1.5">
        <div className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse" />
        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full ml-3 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Cyan sparkle dots left side */}
      <div className="absolute left-12 bottom-2 pointer-events-none flex gap-2">
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-60 animate-ping" />
        <div className="w-1 h-1 bg-violet-400 rounded-full opacity-50 animate-ping" style={{ animationDelay: '0.8s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {badge && (
          <span className={`inline-flex items-center gap-1.5 mb-3 px-3 py-1 text-xs font-semibold rounded-full text-white bg-gradient-to-r ${badgeColor} shadow-lg`}>
            <span className="size-1.5 bg-white rounded-full opacity-80" />
            {badge}
          </span>
        )}

        <h1
          className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight"
          style={{
            textShadow: '0 0 40px rgba(167,139,250,0.4), 0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 text-[#8a8a8f] text-sm font-medium">{subtitle}</p>
        )}
      </div>

      {/* Decorative gradient underline */}
      <div
        className="mt-5 h-px w-full max-w-xs rounded-full"
        style={{
          background: 'linear-gradient(90deg, #A78BFA 0%, #DB2777 50%, transparent 100%)',
          opacity: 0.5,
        }}
      />
    </section>
  );
}
