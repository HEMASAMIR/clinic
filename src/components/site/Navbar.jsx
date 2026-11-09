'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';

const LINKS = [
  ['#features', 'المميزات'],
  ['#industries', 'التخصصات'],
  ['#compare', 'ليش موعِد؟'],
  ['#pricing', 'الأسعار'],
  ['#faq', 'الأسئلة الشائعة'],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled ? 'border-b border-line bg-sand/85 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <ul className="hidden items-center gap-7 text-[15px] font-medium text-ink-soft lg:flex">
          {LINKS.map(([href, label]) => (
            <li key={href}>
              <a href={href} className="transition hover:text-brand">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/dashboard" className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition hover:text-brand">
            لوحة العيادة
          </Link>
          <Link
            href="/demo"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-dark"
          >
            جرّب الحجز مجانًا
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-xl border border-line bg-white lg:hidden"
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-line bg-sand px-4 pb-5 pt-2 lg:hidden">
          <ul className="flex flex-col">
            {LINKS.map(([href, label]) => (
              <li key={href}>
                <a href={href} onClick={() => setOpen(false)} className="block border-b border-line/70 py-3 font-medium">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/dashboard" className="rounded-xl border border-line bg-white py-3 text-center text-sm font-semibold">
              لوحة العيادة
            </Link>
            <Link href="/demo" className="rounded-xl bg-brand py-3 text-center text-sm font-semibold text-white">
              جرّب الحجز
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
