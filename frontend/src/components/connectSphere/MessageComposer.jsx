import { useState } from 'react';
import FileUploader from '../shared/FileUploader';

/**
 * MessageComposer — Input bar for sending text and attachments in Connect Sphere.
 * Displays exact disabled notice "This space is currently locked by admin" if space is locked.
 */
export default function MessageComposer({ space, onSendMessage, disabled }) {
  const [content, setContent] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!content.trim() && !attachmentUrl) || sending || space?.isLocked) return;

    setSending(true);
    try {
      const attachments = attachmentUrl ? [{ url: attachmentUrl, type: attachmentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'doc' }] : [];
      await onSendMessage(content.trim(), attachments);
      setContent('');
      setAttachmentUrl(null);
    } catch (err) {
      console.error('[Composer] Send error:', err);
    } finally {
      setSending(false);
    }
  };

  if (space?.isLocked) {
    return (
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
        <p className="text-xs font-black uppercase tracking-wider text-amber-400">
          🔒 This space is currently locked by admin
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 glass-card border border-[var(--color-border)]">
      {attachmentUrl && (
        <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs">
          <span className="text-[var(--color-accent)] font-semibold truncate">Attached: {attachmentUrl}</span>
          <button type="button" onClick={() => setAttachmentUrl(null)} className="text-red-400 font-bold hover:underline">Remove</button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={disabled || sending}
          placeholder="Write a message to the community..."
          className="flex-1 px-4 py-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs font-medium focus:outline-none focus:border-[var(--color-accent)]"
        />

        <div className="flex-shrink-0">
          <FileUploader
            currentUrl={null}
            onUploadSuccess={(url) => setAttachmentUrl(url)}
            uploadType="certificate"
            accept="image/*,application/pdf"
            maxSizeMB={10}
            label="📎"
          />
        </div>

        <button
          type="submit"
          disabled={(!content.trim() && !attachmentUrl) || sending || disabled}
          className="px-5 py-2.5 bg-[var(--color-accent)] text-white text-xs font-bold rounded-xl disabled:opacity-40 transition-all shadow-md shadow-[var(--color-accent)]/20"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
