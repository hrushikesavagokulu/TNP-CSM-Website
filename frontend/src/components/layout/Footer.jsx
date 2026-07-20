import { Link } from 'react-router-dom';

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
  { label: 'Official GPREC Site', url: 'https://www.gprec.ac.in' },
  { label: 'Mandatory Disclosures', url: 'https://gprec.ac.in/mandatory-disclosures/' },
  { label: 'Student Notice Board', url: 'https://gprec.ac.in/notice-board/' },
  { label: 'Alumni Network', url: 'https://gprec.ac.in/alumni/' },
];

export default function Footer() {
  return (
    <footer
      id="main-footer"
      className="border-t border-[var(--color-border)] py-12 px-6"
      style={{
        background: 'var(--color-bg-secondary)',
        color: 'var(--color-text-secondary)',
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Contact info column */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-black uppercase text-[var(--color-text-primary)] tracking-wide">
            {FOOTER_CONSTANTS.collegeName}
          </h4>
          <p className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
            {FOOTER_CONSTANTS.tagline}
          </p>
          <p className="text-[10px] text-red-500 font-mono mt-0.5">
            {FOOTER_CONSTANTS.codes}
          </p>
          <div className="text-xs text-[var(--color-text-secondary)] flex flex-col gap-1.5 mt-2">
            <p className="leading-relaxed">📍 {FOOTER_CONSTANTS.address}</p>
            <p>📞 Phone: {FOOTER_CONSTANTS.phone}</p>
            <p>✉️ Email: <a href={`mailto:${FOOTER_CONSTANTS.email}`} className="text-[var(--color-accent)] hover:underline">{FOOTER_CONSTANTS.email}</a></p>
          </div>
        </div>

        {/* Useful links column */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold uppercase text-[var(--color-text-primary)] tracking-wide">
            Useful Links
          </h4>
          <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-xs">
            {USEFUL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] no-underline transition-colors font-medium"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social connections column */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold uppercase text-[var(--color-text-primary)] tracking-wide">
            Follow Us
          </h4>
          <p className="text-xs leading-relaxed">
            Stay updated with recent academic events, placement milestones, and CSE (AI & ML) news by following GPREC social media:
          </p>
          <div className="flex gap-3 text-xs mt-1">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] rounded-lg font-bold transition-all no-underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Copyright bottom section */}
      <div className="max-w-7xl mx-auto border-t border-[var(--color-border)]/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[var(--color-text-muted)] font-bold tracking-wider uppercase">
        <p>© {FOOTER_CONSTANTS.year} GPREC CSM department. All rights reserved.</p>
        <p>Design & Placement Portal Platform</p>
      </div>
    </footer>
  );
}
