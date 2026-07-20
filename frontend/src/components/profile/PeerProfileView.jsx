import React from 'react';

export default function PeerProfileView({ peerUser }) {
  if (!peerUser) return null;

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Profile Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Profile Image (Redacted for peers) */}
        <div className="relative w-24 h-24 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
          {peerUser.isPhotoHidden ? (
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-xl">👤</span>
              <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">Hidden</span>
            </div>
          ) : peerUser.profileImage ? (
            <img src={peerUser.profileImage} alt={peerUser.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-[var(--color-text-muted)]">
              {peerUser.name?.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        {/* Identity Details */}
        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{peerUser.name}</h2>
          <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider font-mono">{peerUser.rollNo}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{peerUser.email}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Academic Info */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Academic Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Branch</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">{peerUser.branch || 'Not Specified'}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Year</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">{peerUser.year ? `Year ${peerUser.year}` : 'Not Specified'}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
              <span>Hostel Resident</span>
              <span className="font-semibold text-[var(--color-text-primary)]">{peerUser.isHostel ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
              <span>Laptop Available</span>
              <span className="font-semibold text-[var(--color-text-primary)]">{peerUser.laptopAvailable ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Contact Numbers (Redacted for peers) */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Contact Numbers</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Student Phone</p>
              <p className="text-sm font-semibold text-[var(--color-error)] mt-1 flex items-center gap-1.5 bg-[var(--color-error-bg)] w-fit px-2 py-0.5 rounded border border-[var(--color-error)]/10 font-mono">
                🔒 Private
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Parent Phone</p>
              <p className="text-sm font-semibold text-[var(--color-error)] mt-1 flex items-center gap-1.5 bg-[var(--color-error-bg)] w-fit px-2 py-0.5 rounded border border-[var(--color-error)]/10 font-mono">
                🔒 Private
              </p>
            </div>
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1 leading-relaxed">
            Contact information of other students is kept private. If you need to contact this student, please email them.
          </p>
        </div>
      </div>

      {/* Skills */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Skills & Tech Stack</h3>
        {peerUser.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {peerUser.skills.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-border)] rounded-full text-xs font-semibold">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-muted)]">No skills listed yet.</p>
        )}
      </div>

      {/* Links & Projects */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Professional Profiles & Project Links</h3>
        
        {/* Profile Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['linkedin', 'github', 'leetcode', 'portfolio'].map((platform) => {
            const link = peerUser.links?.[platform];
            return (
              <div key={platform}>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{platform}</p>
                {link ? (
                  <a href={link} target="_blank" rel="noreferrer" className="text-xs text-[var(--color-accent)] font-semibold hover:underline block truncate mt-1">
                    Visit Link ↗
                  </a>
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">—</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Project Links */}
        {peerUser.projectLinks?.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
            <h4 className="text-xs font-bold text-[var(--color-text-secondary)]">Project Links</h4>
            <ul className="list-disc pl-5 m-0 text-xs text-[var(--color-text-secondary)] space-y-1.5">
              {peerUser.projectLinks.map((link, i) => (
                <li key={i}>
                  <a href={link} target="_blank" rel="noreferrer" className="text-[var(--color-accent)] hover:underline font-medium break-all">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Achievements */}
      {peerUser.achievements?.length > 0 && (
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Achievements & Certifications</h3>
          <div className="flex flex-col gap-3">
            {peerUser.achievements.map((item, index) => (
              <div key={index} className="p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-secondary)]/30">
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                {item.description && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{item.description}</p>}
                {item.fileUrl && (
                  <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-[var(--color-accent)] hover:underline mt-1 block">
                    View Document ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
