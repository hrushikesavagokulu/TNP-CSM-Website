import { useState, useEffect, useCallback, useRef } from 'react';
import batchesService from '../../services/admin/batches.service';

// ── Sub-component: MemberPanel (manage members of one batch) ──────────────────
function MemberPanel({ batch, onClose, onMemberChange }) {
  const [members, setMembers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addResults, setAddResults] = useState(null); // { addedCount, errors }
  const [removing, setRemoving]     = useState(null); // rollNo being removed
  const [bulkFile, setBulkFile]     = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const fileInputRef = useRef(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await batchesService.getMembers(batch._id);
      setMembers(data.members);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [batch._id]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleAddBySearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setAddLoading(true);
    setAddResults(null);
    try {
      // Accept both rollNo or email formats
      const isEmail = searchQuery.includes('@');
      const payload  = isEmail
        ? { emails: [searchQuery.trim()] }
        : { rollNos: [searchQuery.trim()] };
      const result = await batchesService.addMembers(batch._id, payload);
      setAddResults(result);
      if (result.addedCount > 0) {
        setSearchQuery('');
        loadMembers();
        onMemberChange();
      }
    } catch (err) {
      setAddResults({ addedCount: 0, errors: [{ identifier: searchQuery, reason: err.response?.data?.message || 'Error' }] });
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemove = async (rollNo) => {
    if (!window.confirm(`Remove ${rollNo} from this batch?`)) return;
    setRemoving(rollNo);
    try {
      await batchesService.removeMembers(batch._id, { rollNos: [rollNo] });
      loadMembers();
      onMemberChange();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.');
    } finally {
      setRemoving(null);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkFile) return;
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const fd = new FormData();
      fd.append('file', bulkFile);
      const result = await batchesService.bulkImportMembers(batch._id, fd);
      setBulkResult(result);
      if (result.addedCount > 0) {
        loadMembers();
        onMemberChange();
      }
      setBulkFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setBulkResult({ addedCount: 0, errors: [{ identifier: '-', reason: err.response?.data?.message || 'Upload failed.' }] });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="member-panel">
      <div className="member-panel-header">
        <div>
          <h3>{batch.name}</h3>
          <span className="badge">Year {batch.year}</span>
        </div>
        <button className="btn-icon" onClick={onClose} title="Close panel">✕</button>
      </div>

      {/* Add by search */}
      <div className="section-card">
        <h4>Add by Roll No / Email</h4>
        <form onSubmit={handleAddBySearch} className="inline-form">
          <input
            id="add-member-search"
            type="text"
            placeholder="e.g. 22BD1A0501 or student@gprec.ac.in"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
          />
          <button type="submit" className="btn-accent" disabled={addLoading || !searchQuery.trim()}>
            {addLoading ? 'Adding…' : 'Add'}
          </button>
        </form>
        {addResults && (
          <div className={`result-box ${addResults.addedCount > 0 ? 'success' : 'error'}`}>
            {addResults.addedCount > 0 && <p className="success-text">✓ Added {addResults.addedCount} student(s).</p>}
            {addResults.errors.map((e, i) => (
              <p key={i} className="error-text">✗ {e.identifier}: {e.reason}</p>
            ))}
          </div>
        )}
      </div>

      {/* Bulk import */}
      <div className="section-card">
        <h4>Bulk Import (Excel / CSV)</h4>
        <p className="hint">Required columns: <code>rollNo</code>, <code>email</code></p>
        <div className="file-upload-row">
          <input
            ref={fileInputRef}
            id={`bulk-import-file-${batch._id}`}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="file-input"
            onChange={(e) => setBulkFile(e.target.files[0] || null)}
          />
          <button
            className="btn-accent"
            onClick={handleBulkImport}
            disabled={!bulkFile || bulkLoading}
          >
            {bulkLoading ? 'Importing…' : 'Import'}
          </button>
        </div>
        {bulkResult && (
          <div className={`result-box ${bulkResult.addedCount > 0 ? 'success' : 'error'}`}>
            <p className={bulkResult.addedCount > 0 ? 'success-text' : 'error-text'}>
              Added {bulkResult.addedCount} student(s). {bulkResult.errors.length} error(s).
            </p>
            {bulkResult.errors.slice(0, 10).map((e, i) => (
              <p key={i} className="error-text" style={{ fontSize: '0.75rem' }}>
                ✗ {e.identifier || `Row ${e.row}`}: {e.reason}
              </p>
            ))}
            {bulkResult.errors.length > 10 && (
              <p className="error-text" style={{ fontSize: '0.75rem' }}>…and {bulkResult.errors.length - 10} more errors.</p>
            )}
          </div>
        )}
      </div>

      {/* Member list */}
      <div className="section-card">
        <h4>Current Members ({loading ? '…' : members.length})</h4>
        {loading ? (
          <div className="skeleton-list">
            {[1,2,3].map(i => <div key={i} className="skeleton-row" />)}
          </div>
        ) : members.length === 0 ? (
          <p className="empty-text">No members yet. Add students above.</p>
        ) : (
          <div className="member-table-wrapper">
            <table className="member-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td><code>{m.rollNo}</code></td>
                    <td>{m.email}</td>
                    <td>
                      <button
                        className="btn-danger-sm"
                        onClick={() => handleRemove(m.rollNo)}
                        disabled={removing === m.rollNo}
                      >
                        {removing === m.rollNo ? '…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ManageBatches() {
  const [selectedYear, setSelectedYear] = useState(3);
  const [batches, setBatches]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeBatch, setActiveBatch]   = useState(null); // for MemberPanel
  const [renamingId, setRenamingId]     = useState(null);
  const [renameName, setRenameName]     = useState('');
  const [createName, setCreateName]     = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError]   = useState('');

  const loadBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await batchesService.getBatches(selectedYear);
      setBatches(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load batches.');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => { loadBatches(); }, [loadBatches]);

  // Close member panel if year changes
  useEffect(() => { setActiveBatch(null); }, [selectedYear]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreateLoading(true);
    setCreateError('');
    try {
      await batchesService.createBatch({ name: createName.trim(), year: selectedYear });
      setCreateName('');
      loadBatches();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create batch.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRename = async (batch) => {
    if (!renameName.trim() || renameName.trim() === batch.name) {
      setRenamingId(null);
      return;
    }
    try {
      await batchesService.renameBatch(batch._id, renameName.trim());
      setRenamingId(null);
      loadBatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Rename failed.');
    }
  };

  const handleDelete = async (batch) => {
    if (!window.confirm(
      `Delete batch "${batch.name}"? All ${batch.memberCount} member(s) will lose access to announcements targeted at this batch. This cannot be undone.`
    )) return;
    try {
      await batchesService.deleteBatch(batch._id);
      if (activeBatch?._id === batch._id) setActiveBatch(null);
      loadBatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="manage-batches">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Batches</h1>
          <p className="page-subtitle">Create and manage placement batches for Year 3 &amp; Year 4 students.</p>
        </div>
      </div>

      {/* Year Toggle */}
      <div className="year-toggle">
        {[3, 4].map((yr) => (
          <button
            key={yr}
            id={`year-toggle-${yr}`}
            className={`year-btn${selectedYear === yr ? ' active' : ''}`}
            onClick={() => setSelectedYear(yr)}
          >
            Year {yr}
          </button>
        ))}
      </div>

      <div className="batches-layout">
        {/* Left: list + create */}
        <div className="batches-list-panel">
          {/* Create Batch Form */}
          <div className="glass-card create-batch-card">
            <h3 className="section-title">New Year {selectedYear} Batch</h3>
            <form onSubmit={handleCreate} className="create-form">
              <input
                id="create-batch-name"
                type="text"
                placeholder='e.g. "Smart Interviews", "TAP", "Product Track"'
                className="form-input"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                maxLength={80}
              />
              <button
                type="submit"
                className="btn-accent"
                disabled={createLoading || !createName.trim()}
              >
                {createLoading ? 'Creating…' : '+ Create Batch'}
              </button>
            </form>
            {createError && <p className="error-text" style={{ marginTop: '0.5rem' }}>{createError}</p>}
          </div>

          {/* Batch List */}
          <div className="glass-card batches-card">
            <h3 className="section-title">Year {selectedYear} Batches</h3>
            {loading ? (
              <div className="skeleton-list">
                {[1,2,3].map(i => <div key={i} className="skeleton-row" />)}
              </div>
            ) : error ? (
              <p className="error-text">{error}</p>
            ) : batches.length === 0 ? (
              <p className="empty-text">No batches for Year {selectedYear} yet.</p>
            ) : (
              <ul className="batch-list">
                {batches.map((batch) => (
                  <li
                    key={batch._id}
                    className={`batch-item${activeBatch?._id === batch._id ? ' active' : ''}`}
                  >
                    {renamingId === batch._id ? (
                      <div className="rename-form">
                        <input
                          id={`rename-input-${batch._id}`}
                          type="text"
                          className="form-input"
                          value={renameName}
                          onChange={(e) => setRenameName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(batch);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          autoFocus
                        />
                        <button className="btn-accent btn-sm" onClick={() => handleRename(batch)}>Save</button>
                        <button className="btn-ghost btn-sm" onClick={() => setRenamingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        <div className="batch-info" onClick={() => setActiveBatch(batch)}>
                          <span className="batch-name">{batch.name}</span>
                          <span className="batch-meta">{batch.memberCount} member{batch.memberCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="batch-actions">
                          <button
                            className="btn-ghost btn-sm"
                            onClick={() => { setActiveBatch(batch); }}
                            title="Manage members"
                          >
                            Members
                          </button>
                          <button
                            className="btn-ghost btn-sm"
                            onClick={() => { setRenamingId(batch._id); setRenameName(batch.name); }}
                            title="Rename batch"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-danger-sm"
                            onClick={() => handleDelete(batch)}
                            title="Delete batch"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: member panel */}
        {activeBatch && (
          <div className="glass-card member-panel-wrapper">
            <MemberPanel
              batch={activeBatch}
              onClose={() => setActiveBatch(null)}
              onMemberChange={loadBatches}
            />
          </div>
        )}
      </div>

      <style>{`
        .manage-batches {
          padding: 2rem;
          max-width: 1200px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

        .page-header { margin-bottom: 1.5rem; }
        .page-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--color-text-primary);
          margin: 0 0 0.25rem;
        }
        .page-subtitle { color: var(--color-text-muted); font-size: 0.875rem; margin: 0; }

        .year-toggle {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .year-btn {
          padding: 0.5rem 1.5rem;
          border-radius: 999px;
          border: 2px solid var(--color-border);
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .year-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
        .year-btn.active {
          background: var(--color-accent);
          border-color: var(--color-accent);
          color: #000;
        }

        .batches-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .batches-layout { grid-template-columns: 1fr; }
        }

        .glass-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .section-title {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-text-muted);
          margin: 0 0 1rem;
        }

        .create-batch-card { margin-bottom: 1rem; }

        .create-form {
          display: flex;
          gap: 0.5rem;
        }

        .form-input {
          flex: 1;
          padding: 0.6rem 0.8rem;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }

        .form-input:focus { border-color: var(--color-accent); }

        .btn-accent {
          padding: 0.6rem 1.2rem;
          background: var(--color-accent);
          color: #000;
          border: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s;
          white-space: nowrap;
        }

        .btn-accent:hover:not(:disabled) { opacity: 0.85; }
        .btn-accent:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-ghost {
          padding: 0.35rem 0.75rem;
          background: transparent;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-ghost:hover { border-color: var(--color-accent); color: var(--color-accent); }
        .btn-sm { padding: 0.3rem 0.65rem !important; font-size: 0.75rem !important; }

        .btn-danger-sm {
          padding: 0.3rem 0.65rem;
          background: transparent;
          color: var(--color-error);
          border: 1px solid var(--color-error);
          border-radius: 8px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-danger-sm:hover:not(:disabled) {
          background: var(--color-error);
          color: #fff;
        }

        .btn-danger-sm:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-icon {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-size: 1rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          transition: color 0.15s;
        }
        .btn-icon:hover { color: var(--color-text-primary); }

        .batch-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .batch-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          transition: all 0.15s;
          cursor: pointer;
        }

        .batch-item:hover, .batch-item.active {
          border-color: var(--color-accent);
          background: var(--color-accent-subtle);
        }

        .batch-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .batch-name { font-weight: 600; color: var(--color-text-primary); font-size: 0.9rem; }
        .batch-meta { font-size: 0.75rem; color: var(--color-text-muted); }
        .batch-actions { display: flex; gap: 4px; align-items: center; }

        .rename-form {
          display: flex;
          gap: 0.4rem;
          align-items: center;
          flex: 1;
        }

        .rename-form .form-input { padding: 0.4rem 0.6rem; font-size: 0.85rem; }

        /* Member Panel */
        .member-panel-wrapper { padding: 0; overflow: hidden; }
        .member-panel { display: flex; flex-direction: column; gap: 1rem; }

        .member-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.25rem 1.5rem 0;
        }

        .member-panel-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 0.25rem;
        }

        .badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: var(--color-accent);
          color: #000;
          padding: 2px 8px;
          border-radius: 999px;
        }

        .section-card {
          padding: 0 1.5rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 1rem;
        }

        .section-card:last-child { border-bottom: none; padding-bottom: 1.5rem; }

        .section-card h4 {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-text-muted);
          margin: 1rem 0 0.6rem;
        }

        .hint { font-size: 0.75rem; color: var(--color-text-muted); margin: 0 0 0.5rem; }
        .hint code { background: var(--color-bg); padding: 1px 4px; border-radius: 4px; }

        .inline-form { display: flex; gap: 0.5rem; }

        .file-upload-row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
        .file-input {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          flex: 1;
        }

        .result-box {
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
        }

        .result-box.success { background: var(--color-success-bg); border: 1px solid var(--color-success); }
        .result-box.error   { background: var(--color-error-bg);   border: 1px solid var(--color-error); }
        .success-text { color: var(--color-success); margin: 0; }
        .error-text   { color: var(--color-error);   margin: 0; font-size: 0.8rem; }
        .empty-text   { color: var(--color-text-muted); font-size: 0.85rem; }

        .member-table-wrapper { overflow-x: auto; }
        .member-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }

        .member-table th {
          text-align: left;
          padding: 0.4rem 0.6rem;
          color: var(--color-text-muted);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--color-border);
        }

        .member-table td {
          padding: 0.5rem 0.6rem;
          color: var(--color-text-primary);
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .member-table tr:last-child td { border-bottom: none; }

        .member-table code {
          background: var(--color-bg);
          padding: 1px 5px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.75rem;
        }

        .skeleton-list { display: flex; flex-direction: column; gap: 6px; }
        .skeleton-row {
          height: 42px;
          border-radius: 10px;
          background: var(--color-surface-raised);
          animation: skeleton-pulse 1.4s ease-in-out infinite;
        }

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
