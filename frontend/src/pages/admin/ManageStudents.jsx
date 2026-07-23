import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import studentsService from '../../services/admin/students.service';
import academicTransitionService from '../../services/admin/academicTransition.service';
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

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadStudents();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search, year, branch, batchType, page, loadStudents]);

  const handleFilterChange = (setter, val) => {
    setter(val);
    setPage(1);
  };

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

  const handleUpdateStudent = async (id, field, value) => {
    setError(null);
    try {
      await studentsService.updateStudent(id, { [field]: value });
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, [field]: value } : s))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student detail.');
    }
  };

  const handleDeleteStudent = async (id, rollNo) => {
    if (!window.confirm(`Are you sure you want to remove student ${rollNo} from roster?`)) return;
    try {
      await studentsService.deleteStudent(id);
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove student.');
    }
  };

  const handleBulkUploadComplete = (res) => {
    if (res?.data) {
      setBulkResult(res.data);
      loadStudents();
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--color-text-primary)]">Manage Student Roster</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">CSM Department · GPREC Student Roster Management</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddSingle(!showAddSingle)}
            className="btn-primary text-xs"
          >
            + Add Nominal Student
          </button>
          <button
            onClick={() => setShowBulk(!showBulk)}
            className="px-3.5 py-2 text-xs font-mono font-bold rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-all"
          >
            ↑ Bulk CSV Upload
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] text-xs text-[var(--color-danger)]">
          ⚠️ {error}
        </div>
      )}

      {/* Panel 1: Bulk Upload */}
      {showBulk && (
        <div className="glass-card p-6 flex flex-col gap-4 border-l-4 border-[var(--color-accent)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Bulk Roster CSV Upload</h3>
            <button onClick={() => setShowBulk(false)} className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Close ✕</button>
          </div>
          <FileUploader
            endpoint="/admin/students/upload-csv"
            accept=".csv"
            maxSizeMB={10}
            label="Drop CSV roster file here"
            onUploadComplete={handleBulkUploadComplete}
          />
        </div>
      )}

      {/* Panel 2: Add Single Student */}
      {showAddSingle && (
        <div className="glass-card p-6 max-w-lg border-l-4 border-[var(--color-accent)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Add Nominal Record</h3>
            <button onClick={() => setShowAddSingle(false)} className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Close ✕</button>
          </div>

          <form onSubmit={handleAddSingle} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold block mb-1 uppercase">Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. 22B91A6601"
                  value={addForm.rollNo}
                  onChange={(e) => setAddForm({ ...addForm, rollNo: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold block mb-1 uppercase">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anil Kumar"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-[var(--color-text-muted)] font-bold block mb-1 uppercase">College Email (@gprec.ac.in)</label>
              <input
                type="email"
                placeholder="yourname@gprec.ac.in"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <button type="submit" className="btn-primary text-xs mt-2 w-fit">
              Create Record
            </button>
          </form>
        </div>
      )}

      {/* Search & Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Search students by name or roll number..."
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none focus:border-[var(--color-accent)]"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-xs">
            🔍
          </div>
        </div>

        <select
          value={year}
          onChange={(e) => handleFilterChange(setYear, e.target.value)}
          className="w-full md:w-32 px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none"
        >
          <option value="">All Years</option>
          {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
        </select>

        <select
          value={branch}
          onChange={(e) => handleFilterChange(setBranch, e.target.value)}
          className="w-full md:w-36 px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg text-xs font-mono focus:outline-none"
        >
          <option value="">All Branches</option>
          {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Roster Table (Zebra Striping & Persistent Action Buttons) */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-xs text-[var(--color-text-secondary)]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] font-mono text-[10px] uppercase tracking-wide sticky top-0 z-10">
                <th className="p-4 w-28">Roll No</th>
                <th className="p-4">Name</th>
                <th className="p-4 hidden md:table-cell">Email</th>
                <th className="p-4 w-24">Branch</th>
                <th className="p-4 w-28">Academic Year</th>
                <th className="p-4 w-32">Batch Type</th>
                <th className="p-4 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/60 bg-[var(--color-surface)]">
              {students.length > 0 ? (
                students.map((student, idx) => (
                  <tr key={student._id} className={`hover:bg-[var(--color-surface-raised)] transition-colors ${idx % 2 === 1 ? 'bg-[var(--color-bg-secondary)]/30' : ''}`}>
                    <td className="p-4 font-mono font-bold text-[var(--color-text-primary)] uppercase">{student.rollNo}</td>
                    <td className="p-4 font-bold text-[var(--color-text-primary)]">{student.name}</td>
                    <td className="p-4 hidden md:table-cell font-mono text-[11px] text-[var(--color-text-muted)]">{student.email}</td>
                    <td className="p-4 font-mono font-semibold">{student.branch || 'CSM'}</td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <select
                          value={student.year || ''}
                          onChange={(e) => handleUpdateStudent(student._id, 'year', Number(e.target.value))}
                          className="bg-transparent border border-transparent hover:border-[var(--color-border)] px-1.5 py-1 rounded text-xs font-mono text-[var(--color-text-primary)] focus:outline-none"
                        >
                          <option value="">Select</option>
                          {[1, 2, 3, 4].map((y) => (
                            <option key={y} value={y}>Year {y}</option>
                          ))}
                        </select>

                        {student.academicStatus === 'graduated_grace' ? (
                          <span
                            className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30"
                            title={`Graduated ${new Date(student.graduatedAt).toLocaleDateString()}. Grace period active.`}
                          >
                            Graduated 🎓
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={async () => {
                                try {
                                  await academicTransitionService.adjustStudentYear(student._id, 'decrement');
                                  loadStudents();
                                } catch (err) {
                                  alert(err.response?.data?.message || 'Year decrement failed.');
                                }
                              }}
                              className="px-1.5 py-0.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-surface-raised)] text-[10px] font-bold"
                              title="Decrement Academic Year (-1)"
                            >
                              -1
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await academicTransitionService.adjustStudentYear(student._id, 'increment');
                                  loadStudents();
                                } catch (err) {
                                  alert(err.response?.data?.message || 'Year increment failed.');
                                }
                              }}
                              className="px-1.5 py-0.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-surface-raised)] text-[10px] font-bold text-[var(--color-accent)]"
                              title="Increment Academic Year (+1)"
                            >
                              +1
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        value={student.batchType || ''}
                        onChange={(e) => handleUpdateStudent(student._id, 'batchType', e.target.value)}
                        className="bg-transparent border border-transparent hover:border-[var(--color-border)] px-2 py-1 rounded text-xs font-mono text-[var(--color-text-primary)] focus:outline-none"
                      >
                        <option value="">Select</option>
                        {BATCH_TYPES.map((bt) => (
                          <option key={bt} value={bt}>{bt}</option>
                        ))}
                      </select>
                    </td>

                    {/* Persistent Action Buttons */}
                    <td className="p-4 text-center flex items-center justify-center gap-2">
                      <Link
                        to={`/dashboard/profile/${student.rollNo}`}
                        className="px-2.5 py-1 border border-[var(--color-border)] hover:border-[var(--color-accent-border)] text-[var(--color-text-primary)] hover:text-[var(--color-accent)] rounded font-mono font-bold no-underline text-[10px]"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteStudent(student._id, student.rollNo)}
                        className="px-2.5 py-1 border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:bg-[var(--color-danger)]/20 rounded font-mono font-bold text-[10px]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center font-mono text-xs text-[var(--color-text-muted)] italic">
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
        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
          <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            Page {pagination.page} of {pagination.pages} ({pagination.total} students)
          </span>
          <div className="flex gap-2 font-mono">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text-secondary)] disabled:opacity-50 hover:bg-[var(--color-surface-raised)]"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-3 py-1 border border-[var(--color-border)] rounded-lg text-xs font-bold text-[var(--color-text-secondary)] disabled:opacity-50 hover:bg-[var(--color-surface-raised)]"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
