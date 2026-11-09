'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, LayoutDashboard, Monitor, RotateCcw, Search, Stethoscope, UserRound } from 'lucide-react';
import Logo from '@/components/Logo';
import { resetPlatform } from '@/lib/platform';

export const PORTALS = [
  ['/doctors', 'ابحث عن طبيب', Search],
  ['/patient', 'بوابة المريض', UserRound],
  ['/doctor', 'بوابة الطبيب', Stethoscope],
  ['/reception', 'الاستقبال', ClipboardList],
  ['/queue', 'شاشة الانتظار', Monitor],
  ['/dashboard', 'الإدارة', LayoutDashboard],
];

/** Top bar of every demo portal: jump between the 6 views of the same live data. */
export default function PortalBar() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="no-scrollbar hidden flex-1 justify-center overflow-x-auto lg:flex">
          <div className="flex gap-1 rounded-2xl bg-sand p-1">
            {PORTALS.map(([href, label, Icon]) => {
              const active = path === href || (href !== '/' && path.startsWith(href + '/')) || (href === '/doctors' && path.startsWith('/doctors'));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[13px] font-bold transition ${
                    active ? 'bg-white text-brand shadow-soft' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <Icon className="size-4" /> {label}
                </Link>
              );
            })}
          </div>
        </nav>
        <button
          type="button"
          onClick={() => window.confirm('إرجاع كل بيانات التجربة كما كانت؟') && resetPlatform()}
          className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-bold text-muted hover:border-rose-300 hover:text-rose-600"
          title="إعادة ضبط التجربة"
        >
          <RotateCcw className="size-3.5" /> <span className="hidden sm:inline">إعادة ضبط</span>
        </button>
      </div>
      {/* mobile portal strip */}
      <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-line px-3 py-2 lg:hidden">
        {PORTALS.map(([href, label, Icon]) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${active ? 'bg-brand text-white' : 'bg-sand text-ink-soft'}`}
            >
              <Icon className="size-3.5" /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="bg-gold-soft px-4 py-1.5 text-center text-[11px] font-semibold text-gold">
        نسخة تجريبية تفاعلية — كل البوابات مربوطة ببعض لحظيًا، افتح بوابتين في تابين وشوف التغيير يوصل فورًا
      </div>
    </header>
  );
}
