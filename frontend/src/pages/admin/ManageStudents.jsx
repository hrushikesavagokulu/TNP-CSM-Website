import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import studentsService from '../../services/admin/students.service';
import FileUploader from '../../components/shared/FileUploader';

const BATCH_TYPES = ['Regular', 'MNC', 'Higher Ed'];
const BRANCHES = ['CSM', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML'];

export default function ManageStudents() {
  const [students,    setStudents]    = useState([]);
  const [pagination,   setPagination]   = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [page,         setPage]         = useState(1);

  // ── Filters & Search ───────────────────────────────────────────────────────
  const [search,    setSearch]    = useState('');
  const [year,      setYear]      = useState('');
  const [branch,    setBranch]    = useState('');
  const [batchType, setBatchType] = useState('');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── Modals / Panels ────────────────────────────────────────────────────────
  const [showAddSingle, setShowAddSingle] = useState(false);
  const [addForm, setAddForm] = useState({ rollNo: '', email: '', name: '' });
  const [addError, setAddError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(false);

  const [showBulk, setShowBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  // ── Load Students API ──────────────────────────────────────────────────────
  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentsService.getStudents({
        page,
        limit: 10,
        year: year || undefined,
        branch: branch || undefined,
        batchType: batchType || undefined,
        search: search.trim() || undefined,
      });
      setStudents(data.students || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve students roster.');
    } finally {
      setLoading(false);
    }
  }, [page, year, branch, batchType, search]);

  // Debounced search reload
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadStudents();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, year, branch, batchType, page, loadStudents]);

  // Reset page when filters change
  const handleFilterChange = (setter, val) => {
    setter(val);
    setPage(1);
  };

  // ── Action: Single Add Nominal student ──────────────────────────────────────
  const handleAddSingle = async (e) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(false);

    if (!addForm.rollNo.trim() || !addForm.email.trim() || !addForm.name.trim()) {
      setAddError('Please fill in all roster fields.');
      return;
    }

    try {
      await studentsService.addStudentNominal({
        rollNo: addForm.rollNo.trim(),
        email: addForm.email.trim(),
        name: addForm.name.trim(),
      });
      setAddSuccess(true);
      setAddForm({ rollNo: '', email: '', name: '' });
      loadStudents();
      setTimeout(() => {
        setShowAddSingle(false);
        setAddSuccess(false);
      }, 1500);
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add student to roster.');
    }
  };

  // ── Action: Inline Update Student ──────────────────────────────────────────
  const handleUpdateStudent = async (id, field, value) => {
    setError(null);
    try {
      const updated = await studentsService.updateStudent(id, { [field]: value });
      setStudents((prev) => prev.map((s) => (s._id === id ? updated : s)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student attribute.');
      loadStudents(); // Revert local state
    }
  };

  // ── Action: Hard Delete Student ────────────────────────────────────────────
  const handleDeleteStudent = async (id, rollNo) => {
    if (!window.confirm(`Are you sure you want to hard delete student ${rollNo}? This removes their active profile and registration approvals permanently.`)) {
      return;
    }
    setError(null);
    try {
      await studentsService.deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  // ── Action: Bulk Upload Complete ───────────────────────────────────────────
  const handleBulkComplete = (resultData) => {
    setBulkResult(resultData);
    loadStudents();
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Manage Student Roster</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Add approved nominal records, filter directory, or edit batch configurations</p>
        </div>
        
        {/* Top Actions Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="admin-bulk-import-toggle"
            onClick={() => { setShowBulk(!showBulk); setShowAddSingle(false); }}
            className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
              showBulk ? 'bg-red-500/10 text-red-500 border-red-500' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
            }`}
          >
            📊 Excel Bulk Import
          </button>
          <button
            id="admin-add-student-toggle"
            onClick={() => { setShowAddSingle(!showAddSingle); setShowBulk(false); }}
            className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
              showAddSingle ? 'bg-red-500/10 text-red-500 border-red-500' : 'bg-red-500 text-white border-red-500 hover:bg-red-600'
            }`}
          >
            ➕ Add Student
          </button>
        </div>
      </div>

      {/* Global Error message */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-xs text-[var(--color-error)]">
          ⚠ {error}
        </div>
      )}

      {/* Panel 1: Bulk Excel Uploader */}
      {showBulk && (
        <div id="bulk-import-panel" className="glass-card p-6 border-l-4 border-red-500 bg-red-500/5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Excel / CSV Bulk Import</h3>
            <button onClick={() => setShowBulk(false)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Close ✕</button>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Upload student spreadsheet. Roster must contain at least **rollNo** and **email** column headers. Malformed records are filtered out, and new nominals will be created.
          </p>
          <FileUploader
            uploadUrl="/admin/students/bulk-import"
            fieldName="file"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
            maxSizeMB={10}
            onUploadComplete={handleBulkComplete}
          />

          {bulkResult && (
            <div id="bulk-results-summary" className="mt-4 border-t border-[var(--color-border)] pt-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Import Output Results:</h4>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-[var(--color-success)]">✓ Successfully Imported: {bulkResult.importedCount} nominals</span>
                {bulkResult.errors?.length > 0 && (
                  <span className="text-[var(--color-error)]">⚠ Errors Found: {bulkResult.errors.length} rows failed</span>
                )}
              </div>

              {/* Rows Errors log */}
              {bulkResult.errors?.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] p-3">
                  <table className="w-full text-[10px] border-collapse text-left font-mono">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                        <th className="pb-1.5 w-16">Row</th>
                        <th className="pb-1.5">Fail Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]/50">
                      {bulkResult.errors.map((err, idx) => (
                        <tr key={idx} className="text-[var(--color-text-secondary)]">
                          <td className="py-1.5 font-bold">#{err.row}</td>
                          <td className="py-1.5 text-[var(--color-error)]">{err.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Panel 2: Add Single Student */}
      {showAddSingle && (
        <div id="add-student-panel" className="glass-card p-6 max-w-lg border-l-4 border-red-500 bg-red-500/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Add Single Student Approval</h3>
            <button onClick={() => setShowAddSingle(false)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Close ✕</button>
          </div>

          {addSuccess && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-[var(--color-success-bg)] text-xs text-[var(--color-success)]">
              ✓ Student nominal record created successfully.
            </div>
          )}
          {addError && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-[var(--color-error-bg)] text-xs text-[var(--color-error)]">
              ⚠ {addError}
            </div>
          )}

          <form onSubmit={handleAddSingle} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Roll Number</label>
                <input
                  id="add-rollNo"
                  type="text"
                  placeholder="e.g. 22B91A6601"
                  value={addForm.rollNo}
                  onChange={(e) => setAddForm({ ...addForm, rollNo: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">Full Name</label>
                <input
                  id="add-name"
                  type="text"
                  placeholder="e.g. Anil Kumar"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[var(--color-text-secondary)] font-bold block mb-1">College Email (@gprec.ac.in)</label>
              <input
                id="add-email"
                type="email"
                placeholder="yourname@gprec.ac.in"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none"
              />
            </div>
            <button id="add-student-submit" type="submit" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg mt-2 w-fit">
              Create Nominal Record
            </button>
          </form>
        </div>
      )}

      {/* Search and Filters bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4 bg-[var(--color-surface)]">
        {/* Search */}
        <div className="flex-1 w-full relative">
          <input
            id="students-filter-search"
            type="text"
            placeholder="Search students by name or roll number..."
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] rounded-xl text-xs focus:outline-none focus:border-red-500"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            🔍
          </div>
        </div>

        {/* Year Filter */}
        <div className="w-full md:w-32">
          <select
            id="students-filter-year"
            value={year}
            onChange={(e) => handleFilterChange(setYear, e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs focus:outline-none focus:border-red-500"
          >
            <option value="">All Years</option>
            {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>

        {/* Branch Filter */}
        <div className="w-full md:w-36">
          <select
            id="students-filter-branch"
            value={branch}
            onChange={(e) => handleFilterChange(setBranch, e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs focus:outline-none focus:border-red-500"
          >
            <option value="">All Branches</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Batch Type Filter */}
        <div className="w-full md:w-40">
          <select
            id="students-filter-batch"
            value={batchType}
            onChange={(e) => handleFilterChange(setBatchType, e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-xl text-xs focus:outline-none focus:border-red-500"
          >
            <option value="">All Batch Types</option>
            {BATCH_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs text-[var(--color-text-secondary)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 text-[var(--color-text-muted)] font-bold">
                <th className="p-4 w-28">Roll No</th>
                <th className="p-4">Name</th>
                <th className="p-4 hidden md:table-cell">Email</th>
                <th className="p-4 w-24">Branch</th>
                <th className="p-4 w-28">Academic Year</th>
                <th className="p-4 w-32">Batch Type</th>
                <th className="p-4 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/50 bg-[var(--color-surface)]">
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-[var(--color-bg-secondary)]/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-[var(--color-text-primary)] uppercase">{student.rollNo}</td>
                    <td className="p-4 font-semibold text-[var(--color-text-primary)]">{student.name}</td>
                    <td className="p-4 hidden md:table-cell">{student.email}</td>
                    <td className="p-4">{student.branch || 'N/A'}</td>
                    
                    {/* Inline Editable Year */}
                    <td className="p-4">
                      <select
                        value={student.year || ''}
                        onChange={(e) => handleUpdateStudent(student._id, 'year', Number(e.target.value))}
                        className="bg-transparent border border-transparent hover:border-[var(--color-border)] px-2 py-1 rounded text-xs text-[var(--color-text-primary)] font-medium focus:outline-none focus:border-red-500 transition-colors"
                      >
                        <option value="">Select</option>
                        {[1, 2, 3, 4].map((y) => (
                          <option key={y} value={y}>Year {y}</option>
                        ))}
                      </select>
                    </td>

                    {/* Inline Editable Batch Type */}
                    <td className="p-4">
                      <select
                        value={student.batchType || ''}
                        onChange={(e) => handleUpdateStudent(student._id, 'batchType', e.target.value)}
                        className="bg-transparent border border-transparent hover:border-[var(--color-border)] px-2 py-1 rounded text-xs text-[var(--color-text-primary)] font-medium focus:outline-none focus:border-red-500 transition-colors"
                      >
                        <option value="">Select</option>
                        {BATCH_TYPES.map((bt) => (
                          <option key={bt} value={bt}>{bt}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4 text-center flex items-center justify-center gap-2">
                      <Link
                        to={`/dashboard/profile/${student.rollNo}`}
                        className="px-2.5 py-1.5 border border-[var(--color-border)] hover:border-red-500/30 text-[var(--color-text-secondary)] hover:text-red-500 rounded-lg font-bold no-underline text-[10px]"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => handleDeleteStudent(student._id, student.rollNo)}
                        className="px-2.5 py-1.5 border border-[var(--color-border)] hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded-lg font-bold text-[10px]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--color-text-muted)] italic">
                    {loading ? 'Fetching roster...' : 'No matching student profiles found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 mt-2">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            Page {pagination.page} of {pagination.pages} ({pagination.total} students)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] disabled:opacity-50 hover:bg-[var(--color-bg-secondary)]"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-3 py-1.5 border border-[var(--color-border)] rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] disabled:opacity-50 hover:bg-[var(--color-bg-secondary)]"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
