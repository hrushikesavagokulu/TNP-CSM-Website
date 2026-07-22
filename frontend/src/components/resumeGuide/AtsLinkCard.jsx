/**
 * AtsLinkCard.jsx — Dedicated card for ATS checker links.
 * Deliberately NOT using ContentBlockRenderer — this shape is always
 * exactly: name + description + outbound URL, nothing more.
 */
export default function AtsLinkCard({ name, description, url, index }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      id={`ats-link-${index}`}
      className="group flex items-start gap-4 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
    >
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition-colors">
        <span className="text-xl">🔍</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-red-500 transition-colors truncate">
            {name}
          </h3>
          <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
            Free Tool
          </span>
        </div>
        {description && (
          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{description}</p>
        )}
        <span className="text-[10px] text-[var(--color-text-muted)] mt-1.5 block truncate">{url}</span>
      </div>

      {/* Arrow */}
      <div className="text-[var(--color-text-muted)] group-hover:text-red-500 transition-colors text-lg flex-shrink-0 mt-1">
        ↗
      </div>
    </a>
  );
}
