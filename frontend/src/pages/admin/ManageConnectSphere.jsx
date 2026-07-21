import { useState, useEffect, useCallback } from 'react';
import adminChatService from '../../services/admin/chat.service';
import chatService from '../../services/chat.service';
import MessageStream from '../../components/connectSphere/MessageStream';
import MessageComposer from '../../components/connectSphere/MessageComposer';
import { useAuth } from '../../context/AuthContext';

export default function ManageConnectSphere() {
  const { user } = useAuth();
  const [spaces, setSpaces]               = useState([]);
  const [activeSpace, setActiveSpace]     = useState(null);
  const [messages, setMessages]           = useState([]);
  const [newSpaceName, setNewSpaceName]   = useState('');
  const [memberIdentifier, setMemberIdentifier] = useState('');
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [creating, setCreating]           = useState(false);
  const [blocking, setBlocking]           = useState(false);

  const loadSpaces = useCallback(async () => {
    setLoadingSpaces(true);
    try {
      const data = await adminChatService.listSpaces();
      setSpaces(data);
      if (data.length > 0 && !activeSpace) {
        setActiveSpace(data.find((s) => s.isPermanent) || data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSpaces(false);
    }
  }, [activeSpace]);

  useEffect(() => { loadSpaces(); }, [loadSpaces]);

  const loadMessages = useCallback(async () => {
    if (!activeSpace?._id) return;
    setLoadingMsgs(true);
    try {
      const res = await chatService.getMessages(activeSpace._id);
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMsgs(false);
    }
  }, [activeSpace?._id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    if (!newSpaceName.trim() || creating) return;
    setCreating(true);
    try {
      await adminChatService.createSpace(newSpaceName.trim());
      setNewSpaceName('');
      loadSpaces();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create space.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleLock = async (space) => {
    try {
      const updated = await adminChatService.toggleLockSpace(space._id);
      setSpaces((prev) => prev.map((s) => (s._id === space._id ? { ...s, isLocked: updated.isLocked } : s)));
      if (activeSpace?._id === space._id) {
        setActiveSpace((prev) => ({ ...prev, isLocked: updated.isLocked }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lock toggle failed.');
    }
  };

  const handleDeleteSpace = async (space) => {
    if (space.isPermanent) {
      alert('The permanent community space cannot be deleted.');
      return;
    }
    if (!window.confirm(`Delete chat space "${space.name}" and all its messages?`)) return;

    try {
      await adminChatService.deleteSpace(space._id);
      if (activeSpace?._id === space._id) setActiveSpace(null);
      loadSpaces();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete space failed.');
    }
  };

  const handleRemoveMember = async (e) => {
    e.preventDefault();
    if (!activeSpace?._id || !memberIdentifier.trim() || blocking) return;
    setBlocking(true);
    try {
      await adminChatService.removeMember(activeSpace._id, memberIdentifier.trim());
      alert(`User (${memberIdentifier.trim()}) blocked from posting in this space.`);
      setMemberIdentifier('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.');
    } finally {
      setBlocking(false);
    }
  };

  const handleDeleteMessageAdmin = async (messageId) => {
    if (!window.confirm('Admin Moderation: Delete this message for all?')) return;
    try {
      await adminChatService.deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, deletedForAll: true, content: '[message deleted]', attachments: [] } : m))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Moderation delete failed.');
    }
  };

  const handleSendMessageAdmin = async (content, attachments) => {
    if (!activeSpace?._id) return;
    try {
      const sentMsg = await adminChatService.sendMessage(activeSpace._id, { content, attachments });
      setMessages((prev) => {
        if (prev.some((m) => m._id === sentMsg._id)) return prev;
        return [...prev, sentMsg];
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send admin message.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Connect Sphere</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Create community spaces, lock/unlock posting, moderate messages, broadcast admin messages, and manage space access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Space & Space Moderation Controls */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          {/* Create Space Form */}
          <form onSubmit={handleCreateSpace} className="glass-card p-4 flex flex-col gap-3 border border-[var(--color-border)]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-primary)]">+ Create New Chat Space</h3>
            <input
              type="text"
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
              placeholder="Space Name (e.g. Placement Coding Discussions)"
              className="px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded-xl text-[var(--color-text-primary)]"
            />
            <button
              type="submit"
              disabled={!newSpaceName.trim() || creating}
              className="px-4 py-2 bg-[var(--color-accent)] text-white text-xs font-bold rounded-xl disabled:opacity-40"
            >
              {creating ? 'Creating...' : '+ Create Space'}
            </button>
          </form>

          {/* Spaces List & Moderation Buttons */}
          <div className="glass-card p-4 flex flex-col gap-3 border border-[var(--color-border)]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">Community Spaces ({spaces.length})</h3>
            {loadingSpaces ? (
              <p className="text-xs text-[var(--color-text-muted)] italic">Loading spaces...</p>
            ) : (
              <div className="flex flex-col gap-2">
                {spaces.map((sp) => {
                  const isSelected = activeSpace?._id === sp._id;
                  return (
                    <div key={sp._id} className={`p-3 border rounded-xl flex flex-col gap-2 ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5' : 'border-[var(--color-border)] bg-[var(--color-surface)]'}`}>
                      <div className="flex items-center justify-between">
                        <button onClick={() => setActiveSpace(sp)} className="font-bold text-xs text-[var(--color-text-primary)] hover:text-[var(--color-accent)] flex items-center gap-1.5 truncate">
                          <span>{sp.isPermanent ? '📌' : '💬'}</span>
                          <span className="truncate">{sp.name}</span>
                        </button>
                        {sp.isPermanent && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Permanent
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--color-border)]">
                        <button
                          type="button"
                          onClick={() => handleToggleLock(sp)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                            sp.isLocked
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {sp.isLocked ? '🔒 Locked (Unlock)' : '🔓 Unlocked (Lock)'}
                        </button>

                        {/* Permanent space has NO delete button / disabled */}
                        {sp.isPermanent ? (
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] opacity-50 cursor-not-allowed" title="Permanent community space cannot be deleted">
                            🔒 Non-Deletable
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteSpace(sp)}
                            className="text-[10px] font-bold text-red-500 hover:underline"
                          >
                            Delete Space
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remove Member / Block Student from active space */}
          {activeSpace && (
            <form onSubmit={handleRemoveMember} className="glass-card p-4 flex flex-col gap-3 border border-[var(--color-border)]">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-primary)]">
                Block Student from "{activeSpace.name}"
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Prevents the student from sending messages in this specific space (still allows viewing history).
              </p>
              <input
                type="text"
                value={memberIdentifier}
                onChange={(e) => setMemberIdentifier(e.target.value)}
                placeholder="Student Email or Roll Number (e.g. 209X1A3301)"
                className="px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-xs rounded-xl text-[var(--color-text-primary)]"
              />
              <button
                type="submit"
                disabled={!memberIdentifier.trim() || blocking}
                className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl disabled:opacity-40"
              >
                {blocking ? 'Blocking...' : 'Block Posting Rights'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Active Space Live Moderation Message Stream & Admin Composer */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {activeSpace ? (
            <>
              <div className="p-3 glass-card border border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[var(--color-text-primary)] flex items-center gap-2">
                    <span>{activeSpace.isPermanent ? '📌' : '💬'}</span>
                    <span>{activeSpace.name} (Admin Live Stream)</span>
                  </h3>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">
                    Admin panel view · View, post admin announcements, and moderate messages live
                  </span>
                </div>
                {activeSpace.isLocked && (
                  <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    🔒 Locked (Admin Posting Override Active)
                  </span>
                )}
              </div>

              {loadingMsgs ? (
                <div className="h-72 rounded-2xl bg-[var(--color-bg-secondary)] animate-pulse" />
              ) : (
                <MessageStream
                  space={activeSpace}
                  messages={messages}
                  currentUser={user}
                  onDeleteMessage={handleDeleteMessageAdmin}
                  onMessageReceived={(msg) => setMessages((prev) => [...prev, msg])}
                  onMessageDeleted={(payload) => setMessages((prev) => prev.map((m) => (m._id === payload.messageId ? { ...m, deletedForAll: true, content: '[message deleted]', attachments: [] } : m)))}
                  onReactionReceived={(payload) => setMessages((prev) => prev.map((m) => (m._id === payload.messageId ? { ...m, reactions: payload.reactions } : m)))}
                  onSpaceLocked={(isLocked) => setActiveSpace((prev) => (prev ? { ...prev, isLocked } : prev))}
                />
              )}

              {/* Admin Message Composer — Admin override allows posting even if space is locked */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                    📢 Post Admin Announcement to "{activeSpace.name}"
                  </span>
                </div>
                <MessageComposer
                  space={{ ...activeSpace, isLocked: false }}
                  onSendMessage={handleSendMessageAdmin}
                  disabled={!activeSpace}
                />
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center text-xs text-[var(--color-text-muted)] italic">
              Select a chat space from the left to view, post messages, and moderate discussions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
