import React from 'react';

/**
 * ProgressRing — circular progress tracker using SVG.
 * Accepts `percent` (0-100) and displays a nice themed track.
 * If percent is 0, renders a friendly empty-state style.
 */
export default function ProgressRing({ percent = 0, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  const isZero = percent === 0;

  return (
    <div className="flex flex-col items-center justify-center relative select-none" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          className={isZero ? 'stroke-dasharray-[4,4]' : ''}
          style={isZero ? { strokeDasharray: '4,4' } : {}}
        />
        
        {/* Progress circle */}
        {!isZero && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--color-accent)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        )}
      </svg>

      {/* Inner label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        {isZero ? (
          <>
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Start</span>
            <span className="text-xs font-semibold text-[var(--color-accent)] animate-pulse mt-0.5">Edit Info</span>
          </>
        ) : (
          <>
            <span className="text-2xl font-extrabold text-[var(--color-text-primary)] font-mono">{percent}%</span>
            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mt-0.5">Profile</span>
          </>
        )}
      </div>
    </div>
  );
}
