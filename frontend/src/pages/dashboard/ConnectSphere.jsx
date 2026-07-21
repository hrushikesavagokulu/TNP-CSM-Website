import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chat.service';
import ChatSpaceList from '../../components/connectSphere/ChatSpaceList';
import MessageStream from '../../components/connectSphere/MessageStream';
import MessageComposer from '../../components/connectSphere/MessageComposer';

export default function ConnectSphere() {
  const { user } = useAuth();
  const [spaces, setSpaces]               = useState([]);
  const [activeSpace, setActiveSpace]     = useState(null);
  const [messages, setMessages]           = useState([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);

  // Load spaces on mount & select permanent space
  const loadSpaces = useCallback(async () => {
    setLoadingSpaces(true);
    try {
      const data = await chatService.getSpaces();
      setSpaces(data);
      if (data.length > 0) {
        const permanent = data.find((s) => s.isPermanent) || data[0];
        setActiveSpace(permanent);
      }
    } catch (err) {
      console.error('[ConnectSphere] Error loading spaces:', err);
    } finally {
      setLoadingSpaces(false);
    }
  }, []);

  useEffect(() => { loadSpaces(); }, [loadSpaces]);

  // Load messages for active space
  const loadMessages = useCallback(async () => {
    if (!activeSpace?._id) return;
    setLoadingMsgs(true);
    try {
      const res = await chatService.getMessages(activeSpace._id);
      setMessages(res.data || []);
    } catch (err) {
      console.error('[ConnectSphere] Error loading messages:', err);
    } finally {
      setLoadingMsgs(false);
    }
  }, [activeSpace?._id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Handlers for sending, deleting, reacting
  const handleSendMessage = async (content, attachments) => {
    if (!activeSpace?._id) return;
    try {
      const sentMsg = await chatService.sendMessage(activeSpace._id, { content, attachments });
      // Optimistic append if socket emission is delayed
      setMessages((prev) => {
        if (prev.some((m) => m._id === sentMsg._id)) return prev;
        return [...prev, sentMsg];
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message.');
    }
  };

  const handleToggleReaction = async (messageId) => {
    try {
      const updatedReaction = await chatService.toggleReaction(messageId);
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedReaction.messageId ? { ...m, reactions: updatedReaction.reactions } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message for all?')) return;
    try {
      await chatService.deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, deletedForAll: true, content: '[message deleted]', attachments: [] } : m))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  // Live Socket handlers
  const handleMessageReceived = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m._id === msg._id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const handleMessageDeleted = useCallback((payload) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === payload.messageId ? { ...m, deletedForAll: true, content: '[message deleted]', attachments: [] } : m))
    );
  }, []);

  const handleReactionReceived = useCallback((payload) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === payload.messageId ? { ...m, reactions: payload.reactions } : m))
    );
  }, []);

  const handleSpaceLocked = useCallback((isLocked) => {
    setActiveSpace((prev) => (prev ? { ...prev, isLocked } : prev));
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="glass-card p-6 border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-bg-secondary)]/40 to-[var(--color-surface)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
            💬
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
              Connect Sphere
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Real-time CSM community chat space for discussions, questions, and collaboration.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Spaces List (Left) + Messages (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Chat Spaces List */}
        <div className="lg:col-span-1">
          {loadingSpaces ? (
            <div className="h-64 rounded-2xl bg-[var(--color-bg-secondary)] animate-pulse" />
          ) : (
            <ChatSpaceList
              spaces={spaces}
              activeSpaceId={activeSpace?._id}
              onSelectSpace={(s) => setActiveSpace(s)}
            />
          )}
        </div>

        {/* Right: Message Stream & Composer */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {activeSpace && (
            <div className="p-3 glass-card border border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{activeSpace.isPermanent ? '📌' : '💬'}</span>
                <div>
                  <h3 className="text-sm font-black text-[var(--color-text-primary)]">{activeSpace.name}</h3>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">
                    {activeSpace.isPermanent ? 'Permanent Main Community Space' : 'Community Space'}
                  </span>
                </div>
              </div>
              {activeSpace.isLocked && (
                <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  🔒 Locked by Admin
                </span>
              )}
            </div>
          )}

          {loadingMsgs ? (
            <div className="h-72 rounded-2xl bg-[var(--color-bg-secondary)] animate-pulse" />
          ) : (
            <MessageStream
              space={activeSpace}
              messages={messages}
              currentUser={user}
              onReactionToggle={handleToggleReaction}
              onDeleteMessage={handleDeleteMessage}
              onMessageReceived={handleMessageReceived}
              onMessageDeleted={handleMessageDeleted}
              onReactionReceived={handleReactionReceived}
              onSpaceLocked={handleSpaceLocked}
            />
          )}

          <MessageComposer
            space={activeSpace}
            onSendMessage={handleSendMessage}
            disabled={!activeSpace}
          />
        </div>
      </div>
    </div>
  );
}
