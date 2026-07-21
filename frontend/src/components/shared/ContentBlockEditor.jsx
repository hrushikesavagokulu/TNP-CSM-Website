import { useState } from 'react';

/**
 * ContentBlockEditor — THE GENERIC ADMIN EDITOR for Phase 7+.
 *
 * Provides rich block choices (Text, References, Practice Links, YouTube Videos,
 * Certification Links, PDFs, Files, Images) mapping cleanly to the schema types:
 * ['text', 'link', 'video', 'image', 'file', 'pdf']
 *
 * Props:
 *   blocks: Array<{type, label, value, order, _id?}>
 *   onChange: (newBlocksArray) => void
 */

const BLOCK_TYPES = [
  { value: 'text',  label: '📝 Text / Description', defaultLabel: 'Description' },
  { value: 'link',  label: '🔗 Reference / Documentation Link', defaultLabel: 'Reference Link' },
  { value: 'link',  label: '🎯 Practice Reference Link', defaultLabel: 'Practice Link' },
  { value: 'link',  label: '🏅 Certification Reference Link', defaultLabel: 'Certification Link' },
  { value: 'link',  label: '🌐 Navigation Link', defaultLabel: 'Navigation Link' },
  { value: 'video', label: '▶ YouTube / Video Link', defaultLabel: 'YouTube Video' },
  { value: 'image', label: '🖼 Image URL', defaultLabel: 'Diagram / Image' },
  { value: 'pdf',   label: '📄 PDF Document', defaultLabel: 'PDF Reference' },
  { value: 'file',  label: '📎 Resource / File Download', defaultLabel: 'Resource File' },
];

const VALUE_PLACEHOLDERS = {
  text:  'Enter description, instructions or study notes here...',
  link:  'https://geeksforgeeks.org / https://leetcode.com / documentation URL',
  video: 'https://youtube.com/watch?v=... or Vimeo URL',
  image: 'https://example.com/diagram.png',
  pdf:   'https://example.com/syllabus-doc.pdf',
  file:  'https://example.com/lab-material.zip',
};

function generateId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function ContentBlockEditor({ blocks = [], onChange }) {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [newLabel, setNewLabel] = useState(BLOCK_TYPES[0].defaultLabel);
  const [newValue, setNewValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editValue, setEditValue] = useState('');

  const currentPreset = BLOCK_TYPES[selectedPresetIdx] || BLOCK_TYPES[0];

  const handlePresetChange = (idxStr) => {
    const idx = parseInt(idxStr, 10);
    setSelectedPresetIdx(idx);
    const preset = BLOCK_TYPES[idx];
    if (preset) {
      setNewLabel(preset.defaultLabel);
      setNewValue('');
    }
  };

  const sorted = [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // ── Add a new block ────────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!newValue.trim()) return;
    const nextOrder = sorted.length > 0 ? (sorted[sorted.length - 1].order ?? 0) + 1 : 0;
    const newBlock = {
      _id:   generateId(),
      type:  currentPreset.value,
      label: newLabel.trim() || currentPreset.defaultLabel,
      value: newValue.trim(),
      order: nextOrder,
    };
    onChange([...blocks, newBlock]);
    setNewValue('');
  };

  // ── Delete a block ─────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    onChange(blocks.filter((b) => b._id !== id));
    if (editingId === id) setEditingId(null);
  };

  // ── Move a block up/down ───────────────────────────────────────────────────
  const moveBlock = (id, direction) => {
    const idx = sorted.findIndex((b) => b._id === id);
    if (direction === 'up'   && idx === 0)               return;
    if (direction === 'down' && idx === sorted.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newSorted = [...sorted];

    const tempOrder          = newSorted[idx].order;
    newSorted[idx].order     = newSorted[swapIdx].order;
    newSorted[swapIdx].order = tempOrder;

    onChange(newSorted);
  };

  // ── Edit a block ───────────────────────────────────────────────────────────
  const startEdit = (block) => {
    setEditingId(block._id);
    setEditLabel(block.label || '');
    setEditValue(block.value || '');
  };

  const saveEdit = (id) => {
    onChange(
      blocks.map((b) =>
        b._id === id ? { ...b, label: editLabel.trim(), value: editValue.trim() } : b
      )
    );
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Existing blocks */}
      {sorted.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)] italic">No content blocks added yet. Add text, links, practice items, videos or files below.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((block, idx) => (
            <div
              key={block._id}
              className="flex flex-col gap-2 p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]"
            >
              {editingId === block._id ? (
                // Edit mode
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] px-2 py-0.5 bg-[var(--color-accent)]/10 rounded-full">
                      {block.type}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="Label / Title"
                    className="w-full px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg text-xs font-semibold"
                  />
                  {block.type === 'text' ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg text-xs"
                    />
                  ) : (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={VALUE_PLACEHOLDERS[block.type] || 'URL / Value'}
                      className="w-full px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg text-xs"
                    />
                  )}
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setEditingId(null)} className="text-xs px-3 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)]">Cancel</button>
                    <button type="button" onClick={() => saveEdit(block._id)} className="text-xs px-3 py-1 rounded-lg bg-[var(--color-accent)] text-white font-bold">Save Changes</button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] px-2 py-0.5 bg-[var(--color-accent)]/10 rounded-full">
                        {block.type}
                      </span>
                      {block.label && (
                        <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{block.label}</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{block.value}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => moveBlock(block._id, 'up')}
                      disabled={idx === 0}
                      className="w-6 h-6 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-30 text-sm flex items-center justify-center"
                      title="Move up"
                    >↑</button>
                    <button
                      type="button"
                      onClick={() => moveBlock(block._id, 'down')}
                      disabled={idx === sorted.length - 1}
                      className="w-6 h-6 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-30 text-sm flex items-center justify-center"
                      title="Move down"
                    >↓</button>
                    <button
                      type="button"
                      onClick={() => startEdit(block)}
                      className="w-6 h-6 rounded text-[var(--color-text-muted)] hover:text-blue-400 text-xs flex items-center justify-center"
                      title="Edit"
                    >✏</button>
                    <button
                      type="button"
                      onClick={() => handleDelete(block._id)}
                      className="w-6 h-6 rounded text-[var(--color-text-muted)] hover:text-red-500 text-xs flex items-center justify-center"
                      title="Delete"
                    >🗑</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add block form */}
      <div className="border border-dashed border-[var(--color-border)] rounded-xl p-3 flex flex-col gap-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">+ Add Any Format Resource Block</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <select
            value={selectedPresetIdx}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs"
          >
            {BLOCK_TYPES.map((t, idx) => (
              <option key={idx} value={idx}>{t.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label / Title"
            className="px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs"
          />
          {currentPreset.value === 'text' ? (
            <textarea
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={VALUE_PLACEHOLDERS.text}
              rows={2}
              className="px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs col-span-full"
            />
          ) : (
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={VALUE_PLACEHOLDERS[currentPreset.value] || 'URL / Value'}
              className="px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs"
            />
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newValue.trim()}
          className="self-end px-4 py-1.5 bg-[var(--color-accent)] text-white text-xs font-bold rounded-lg disabled:opacity-40"
        >
          + Add Resource Block
        </button>
      </div>
    </div>
  );
}
