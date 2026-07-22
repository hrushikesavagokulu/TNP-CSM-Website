import { useEffect, useRef } from 'react';
import ClickableImage from '../shared/ClickableImage';
import useSocket from '../../hooks/useSocket';

/**
 * MessageStream — Real-time chat message stream.
 * Subscribes to /chat Socket.io room events: message:new, message:delete, reaction:toggle.
 * Displays sender Name AND Roll Number explicitly.
 */
export default function MessageStream({
  space,
  messages = [],
  currentUser,
  onReactionToggle,
  onDeleteMessage,
  onMessageReceived,
  onMessageDeleted,
  onReactionReceived,
  onSpaceLocked,
}) {
  const socket = useSocket('/chat');
  const scrollRef = useRef(null);

  // ── Socket room subscription ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !space?._id) return;

    // Join the current space room
    socket.emit('join-space', { spaceId: space._id });

    const handleNewMessage = (msg) => {
      if (msg.space === space._id && onMessageReceived) {
        onMessageReceived(msg);
      }
    };

    const handleDeletedMessage = (payload) => {
      if (payload.spaceId === space._id && onMessageDeleted) {
        onMessageDeleted(payload);
      }
    };

    const handleReaction = (payload) => {
      if (payload.spaceId === space._id && onReactionReceived) {
        onReactionReceived(payload);
      }
    };

    const handleLockChange = (payload) => {
      if (payload.spaceId === space._id && onSpaceLocked) {
        onSpaceLocked(payload.isLocked);
      }
    };

    socket.on('message:new',     handleNewMessage);
    socket.on('message:delete',  handleDeletedMessage);
    socket.on('reaction:toggle', handleReaction);
    socket.on('space:lock',      handleLockChange);

    return () => {
      socket.off('message:new',     handleNewMessage);
      socket.off('message:delete',  handleDeletedMessage);
      socket.off('reaction:toggle', handleReaction);
      socket.off('space:lock',      handleLockChange);
    };
  }, [socket, space?._id, onMessageReceived, onMessageDeleted, onReactionReceived, onSpaceLocked]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[65vh] min-h-[45vh] bg-[var(--color-surface)]/60 rounded-2xl border border-[var(--color-border)] font-sans">
      {messages.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-text-muted)] font-mono text-xs italic">
          No messages in this space yet. Start the conversation!
        </div>
      ) : (
        messages.map((msg) => {
          const isSender = msg.sender?._id === currentUser?._id;
          const isAdmin  = currentUser?.role === 'admin';
          const canDelete = (isSender || isAdmin) && !msg.deletedForAll;
          const userLiked = msg.reactions?.some((r) => r.user === currentUser?._id || r.user?._id === currentUser?._id);

          return (
            <div
              key={msg._id}
              className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border transition-all ${
                msg.deletedForAll
                  ? 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] opacity-60'
                  : isSender
                  ? 'bg-[var(--color-accent)] border-[var(--color-accent)] self-end max-w-[80%] text-[var(--color-chat-own-text)] shadow-sm'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] self-start max-w-[80%] text-[var(--color-text-primary)]'
              }`}
            >
              {/* Sender Header */}
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${isSender ? 'text-[var(--color-chat-own-text)]' : 'text-[var(--color-text-primary)]'}`}>
                    {msg.sender?.name || 'Anonymous Student'}
                  </span>
                  {msg.sender?.rollNo && (
                    <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isSender ? 'bg-black/20 text-[var(--color-chat-own-text)]' : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                    }`}>
                      {msg.sender.rollNo}
                    </span>
                  )}
                  {msg.sender?.role === 'admin' && (
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)]/30">
                      Admin
                    </span>
                  )}
                </div>

                <span className={`font-mono text-[10px] ${isSender ? 'opacity-80' : 'text-[var(--color-text-muted)]'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Body */}
              {msg.deletedForAll ? (
                <p className="text-xs italic opacity-80">
                  🚫 [message deleted]
                </p>
              ) : (
                <>
                  {msg.content && (
                    <p className={`text-xs leading-relaxed whitespace-pre-wrap ${isSender ? 'text-[var(--color-chat-own-text)]' : 'text-[var(--color-text-primary)]'}`}>
                      {msg.content}
                    </p>
                  )}

                  {/* Attachments */}
                  {msg.attachments?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.attachments.map((att, idx) => (
                        <div key={idx}>
                          {att.type === 'image' ? (
                            <ClickableImage src={att.url} alt="Attachment" className="max-w-[240px] max-h-[200px] object-cover rounded-xl border border-[var(--color-border)]" />
                          ) : (
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/20 border border-white/20 text-current"
                            >
                              📄 Attachment ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reactions & Actions */}
                  <div className={`flex items-center justify-between gap-2 mt-1 pt-1.5 border-t ${
                    isSender ? 'border-black/10' : 'border-[var(--color-border)]'
                  }`}>
                    <button
                      type="button"
                      onClick={() => onReactionToggle && onReactionToggle(msg._id)}
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                        userLiked
                          ? 'bg-black/30 text-white border-white/30'
                          : 'bg-black/10 hover:bg-black/20 border-transparent'
                      }`}
                    >
                      <span>👍</span>
                      <span>{msg.reactions?.length || 0}</span>
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => onDeleteMessage && onDeleteMessage(msg._id)}
                        className="text-[10px] font-mono font-bold hover:underline opacity-80 hover:opacity-100"
                        title={isAdmin && !isSender ? 'Delete (Admin Moderation)' : 'Delete for All'}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
