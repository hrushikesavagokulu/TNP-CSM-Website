import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile.service';
import ClickableImage from './ClickableImage';

export default function SearchStudents() {
  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [showList,   setShowList]   = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  // ── Debounced API call ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await profileService.searchStudents(query);
        setResults(data);
      } catch (err) {
        console.error('Failed to search students:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // ── Close dropdown when clicking outside ──────────────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (rollNo) => {
    setQuery('');
    setShowList(false);
    navigate(`/dashboard/profile/${rollNo}`);
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-md mx-auto z-20">
      {/* Search Input Bar */}
      <div className="relative">
        <input
          id="student-search-input"
          type="text"
          placeholder="Search students by name or roll number..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowList(true);
          }}
          onFocus={() => setShowList(true)}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm
            bg-[var(--color-surface)] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
            border-[var(--color-border)]
            focus:outline-none focus:border-[var(--color-accent)]
            focus:shadow-[0_0_0_3px_var(--color-accent-subtle)]
            transition-all duration-150"
        />
        {/* Left Search Icon */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {/* Right Loading Spinner */}
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <svg className="animate-spin w-4 h-4 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {showList && query.trim() && (
        <div
          id="search-results-dropdown"
          className="absolute left-0 right-0 mt-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden max-h-60 overflow-y-auto"
        >
          {results.length > 0 ? (
            <ul className="list-none p-0 m-0">
              {results.map((student) => (
                <li key={student.rollNo}>
                  <button
                    onClick={() => handleSelect(student.rollNo)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left border-none bg-transparent hover:bg-[var(--color-accent-subtle)] transition-colors cursor-pointer"
                  >
                    {/* User profile photo */}
                    <div className="w-8 h-8 rounded-full bg-[var(--color-border)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
                      {student.profileImage ? (
                        <ClickableImage src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
                          {student.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{student.name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{student.rollNo}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !loading && (
              <div className="px-4 py-4 text-center text-xs text-[var(--color-text-muted)]">
                No matching students found
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
