import Link from 'next/link';
import { site } from '@/config/site';

export function LogoMark({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="#0d7a6f" />
      <rect x="9" y="11" width="22" height="20" rx="5" fill="none" stroke="#fff" strokeWidth="2.4" />
      <path d="M9 17h22" stroke="#fff" strokeWidth="2.4" />
      <path d="M15 8v6M25 8v6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="m15.5 24 3 3 6-6" fill="none" stroke="#c99a2e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ href = '/', light = false }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label={site.name}>
      <LogoMark />
      <span className="leading-none">
        <span className={`block text-xl font-bold ${light ? 'text-white' : 'text-ink'}`}>{site.name}</span>
        <span className={`block text-[10px] font-medium tracking-[0.2em] ${light ? 'text-white/60' : 'text-muted'}`}>
          {site.nameEn.toUpperCase()}
        </span>
      </span>
    </Link>
  );
}
