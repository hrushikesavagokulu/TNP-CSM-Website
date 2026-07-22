import { useMemo } from 'react';

/**
 * ContentBlockRenderer — THE GENERIC RENDERER for Phase 7+.
 *
 * Renders any content block added by admin:
 * - Text / Description
 * - Reference Links / Practice Links / Certification Links / Navigation Links
 * - Video Players (YouTube / Vimeo embed)
 * - Diagrams & Images
 * - PDF Documents & File Attachments
 */

import ClickableImage from './ClickableImage';

function isYouTube(url) {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
}

function isVimeo(url) {
  return url && url.includes('vimeo.com');
}

function getYouTubeEmbedUrl(url) {
  try {
    const u = new URL(url);
    let id = u.searchParams.get('v');
    if (!id) {
      id = u.pathname.slice(1);
    }
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return null;
  }
}

function getVimeoEmbedUrl(url) {
  try {
    const u = new URL(url);
    const id = u.pathname.split('/').filter(Boolean).pop();
    return `https://player.vimeo.com/video/${id}`;
  } catch {
    return null;
  }
}

function BlockWrapper({ label, children }) {
  return (
    <div className="content-block my-1">
      {label && <p className="content-block-label">{label}</p>}
      {children}
    </div>
  );
}

function getLinkIcon(label = '') {
  const l = label.toLowerCase();
  if (l.includes('practice') || l.includes('leetcode') || l.includes('gfg')) return '🎯';
  if (l.includes('certif')) return '🏅';
  if (l.includes('youtube') || l.includes('video')) return '▶';
  if (l.includes('navig')) return '🌐';
  if (l.includes('doc') || l.includes('ref')) return '📚';
  return '🔗';
}

function renderBlock(block) {
  const { type, label, value, _id } = block;

  switch (type) {
    case 'text':
      return (
        <BlockWrapper key={_id} label={label}>
          <div className="content-block-text p-3 bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border)] rounded-xl text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {value}
          </div>
        </BlockWrapper>
      );

    case 'link': {
      const icon = getLinkIcon(label);
      return (
        <BlockWrapper key={_id} label={null}>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="content-block-link"
          >
            <span>{icon}</span>
            <span>{label || value}</span>
            <span className="text-[10px] opacity-70">↗</span>
          </a>
        </BlockWrapper>
      );
    }

    case 'video': {
      const embedUrl = isYouTube(value)
        ? getYouTubeEmbedUrl(value)
        : isVimeo(value)
        ? getVimeoEmbedUrl(value)
        : null;

      return (
        <BlockWrapper key={_id} label={label}>
          {embedUrl ? (
            <div className="content-block-video-wrap my-1" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={embedUrl}
                title={label || 'Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="content-block-video"
              />
            </div>
          ) : (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="content-block-link"
            >
              ▶ {label || value} ↗
            </a>
          )}
        </BlockWrapper>
      );
    }

    case 'image':
      return (
        <BlockWrapper key={_id} label={label}>
          <ClickableImage
            src={value}
            alt={label || 'Content Image'}
            className="content-block-image max-h-80 my-1 rounded-lg border border-[var(--color-border)]"
          />
        </BlockWrapper>
      );

    case 'file':
    case 'pdf':
      return (
        <BlockWrapper key={_id} label={null}>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            download
            onClick={(e) => e.stopPropagation()}
            className="content-block-file"
          >
            <span>{type === 'pdf' ? '📄' : '📎'}</span>
            <span>{label || (type === 'pdf' ? 'View PDF Document' : 'Download File')}</span>
            <span className="text-[10px] opacity-70">↓</span>
          </a>
        </BlockWrapper>
      );

    default:
      return null;
  }
}

export default function ContentBlockRenderer({ blocks = [] }) {
  const sorted = useMemo(
    () => [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [blocks]
  );

  if (!sorted.length) {
    return (
      <p className="text-xs text-[var(--color-text-muted)] italic">No additional resource blocks provided yet.</p>
    );
  }

  return (
    <div className="content-blocks-list flex flex-col gap-2.5">
      {sorted.map((block) => renderBlock(block))}
    </div>
  );
}
