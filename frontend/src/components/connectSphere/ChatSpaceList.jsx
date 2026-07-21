import React from 'react';

/**
 * ChatSpaceList — Left sidebar component for Connect Sphere.
 * Lists available spaces with permanent space pinned at top.
 */
export default function ChatSpaceList({ spaces = [], activeSpaceId, onSelectSpace }) {
  const sorted = [...spaces].sort((a, b) => (b.isPermanent ? 1 : 0) - (a.isPermanent ? 1 : 0));

  return (
    <div className="flex flex-col gap-2 p-3 glass-card border border-[var(--color-border)] h-full">
      <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-[var(--color-border)] pb-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
          <span>💬</span>
          <span>Community Spaces</span>
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
          {spaces.length}
        </span>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto max-h-[70vh]">
        {sorted.map((space) => {
          const isActive = space._id === activeSpaceId;
          return (
            <button
              key={space._id}
              onClick={() => onSelectSpace(space)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 border ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md shadow-[var(--color-accent)]/20'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-text-primary)]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span>{space.isPermanent ? '📌' : '💬'}</span>
                <span className="truncate">{space.name}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {space.isLocked && (
                  <span className="text-[10px]" title="Space Locked">🔒</span>
                )}
                {space.isPermanent && (
                  <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    Main
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
