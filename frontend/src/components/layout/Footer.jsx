const FOOTER_CONSTANTS = {
  collegeName: 'G. Pulla Reddy Engineering College (Autonomous)',
  tagline: 'Accredited by NAAC (A+) of UGC & NBA of AICTE',
  codes: 'EAMCET & ECET CODE : GPRE | PGECET CODE : GPRE1',
  address: 'G. Pulla Reddy Nagar, Nandyal Road, Kurnool - 518 007, Andhra Pradesh, India.',
  phone: '08518-270957 (O) / 08518-280719 (D)',
  email: 'info@gprec.ac.in',
  year: new Date().getFullYear(),
};

const SOCIAL_LINKS = [
  { label: 'Facebook', url: 'https://www.facebook.com/gprecoffical/' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/school/g-pulla-reddy-engineering-college/' },
  { label: 'YouTube', url: 'https://www.youtube.com/channel/UCG044P3aV4g31wz7qf2s30Q' },
];

const USEFUL_LINKS = [
  { label: 'Official GPREC Portal', url: 'https://www.gprec.ac.in' },
  { label: 'Mandatory Disclosures', url: 'https://gprec.ac.in/mandatory-disclosures/' },
  { label: 'Student Notice Board', url: 'https://gprec.ac.in/notice-board/' },
  { label: 'Alumni Network', url: 'https://gprec.ac.in/alumni/' },
];

export default function Footer() {
  return (
    <footer
      id="main-footer"
      className="border-t border-[var(--color-border)] py-14 px-6 bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Col 1: Contact & Accreditation */}
        <div className="flex flex-col gap-3">
          <h4 className="font-display text-sm font-bold uppercase text-[var(--color-text-primary)] tracking-tight">
            {FOOTER_CONSTANTS.collegeName}
          </h4>
          <p className="text-[10px] font-mono text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
            {FOOTER_CONSTANTS.tagline}
          </p>
          <div className="inline-flex flex-wrap gap-2 mt-1">
            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-border)]">
              EAMCET: GPRE
            </span>
            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
              PGECET: GPRE1
            </span>
            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]/30">
              NAAC A+
            </span>
          </div>

          <div className="text-xs text-[var(--color-text-secondary)] flex flex-col gap-1.5 mt-3 leading-relaxed">
            <p>📍 {FOOTER_CONSTANTS.address}</p>
            <p>📞 Phone: {FOOTER_CONSTANTS.phone}</p>
            <p>✉️ Email: <a href={`mailto:${FOOTER_CONSTANTS.email}`} className="text-[var(--color-accent)] font-mono hover:underline">{FOOTER_CONSTANTS.email}</a></p>
          </div>
        </div>

        {/* Col 2: Useful Links */}
        <div className="flex flex-col gap-4">
          <h4 className="font-display text-xs font-bold uppercase text-[var(--color-text-muted)] tracking-widest">
            Institutional Links
          </h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-xs font-medium">
            {USEFUL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:underline no-underline transition-colors"
                >
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Social & Accreditation Badges */}
        <div className="flex flex-col gap-4">
          <h4 className="font-display text-xs font-bold uppercase text-[var(--color-text-muted)] tracking-widest">
            Department Connections
          </h4>
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            Stay updated with recent academic milestones, placement statistics, and research announcements on GPREC channels:
          </p>
          <div className="flex gap-2 text-xs mt-1">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-primary)] hover:text-[var(--color-accent)] rounded-lg font-semibold transition-all no-underline bg-[var(--color-surface)]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Copyright bottom section */}
      <div className="max-w-7xl mx-auto border-t border-[var(--color-border)] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-[var(--color-text-muted)] font-bold tracking-wider uppercase">
        <p>© {FOOTER_CONSTANTS.year} GPREC CSM Department. All rights reserved.</p>
        <p>Training & Placement CSM Platform</p>
      </div>
    </footer>
  );
}
