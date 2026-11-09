'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays, ClipboardList, ExternalLink, LayoutDashboard, Plus, Settings, Stethoscope, Syringe, UserRound,
} from 'lucide-react';
import Logo from '@/components/Logo';
import { useDemo } from '@/lib/demo-store';
import Overview from './Overview';
import CalendarView from './CalendarView';
import Bookings from './Bookings';
import Services from './Services';
import Staff from './Staff';
import Patients from './Patients';
import SettingsView from './SettingsView';
import NewBookingDialog from './NewBookingDialog';
import { Button } from './ui';

const TABS = [
  ['overview', 'الرئيسية', LayoutDashboard],
  ['calendar', 'التقويم', CalendarDays],
  ['bookings', 'المواعيد', ClipboardList],
  ['patients', 'المرضى', UserRound],
  ['staff', 'الأطباء', Stethoscope],
  ['services', 'الخدمات', Syringe],
  ['settings', 'الإعدادات', Settings],
];

export default function Dashboard() {
  const state = useDemo();
  const [tab, setTab] = useState('overview');
  const [newOpen, setNewOpen] = useState(false);

  const view = !state ? (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-xl bg-white" />
      <div className="grid gap-4 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-28 rounded-3xl bg-white" />)}</div>
      <div className="h-72 rounded-3xl bg-white" />
    </div>
  ) : (
    {
      overview: <Overview state={state} goTo={setTab} />,
      calendar: <CalendarView state={state} />,
      bookings: <Bookings state={state} />,
      services: <Services state={state} />,
      staff: <Staff state={state} />,
      patients: <Patients state={state} />,
      settings: <SettingsView state={state} />,
    }[tab]
  );

  return (
    <div className="min-h-dvh bg-sand lg:flex">
      {/* sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-l border-line bg-white p-5 lg:flex">
        <Logo />
        <div className="mt-6 rounded-2xl bg-sand p-3">
          <p className="text-[11px] text-muted">العيادة</p>
          <p className="font-bold">{state?.business.name || '...'}</p>
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          {TABS.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                tab === key ? 'bg-brand text-white shadow-soft' : 'text-ink-soft hover:bg-sand'
              }`}
            >
              <Icon className="size-[18px]" /> {label}
            </button>
          ))}
        </nav>
        <Link href="/demo" className="flex items-center justify-between rounded-xl border border-dashed border-brand/40 px-3.5 py-3 text-sm font-semibold text-brand hover:bg-brand-soft">
          صفحة الحجز للمرضى <ExternalLink className="size-4" />
        </Link>
      </aside>

      <div className="min-w-0 flex-1">
        {/* top bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-sand/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-8">
            <div className="lg:hidden">
              <Logo />
            </div>
            <span className="hidden rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-gold lg:inline-flex">
              نسخة تجريبية — التغييرات محفوظة في متصفحك فقط
            </span>
            <Button onClick={() => setNewOpen(true)} disabled={!state}>
              <Plus className="size-4" /> <span className="hidden sm:inline">موعد جديد</span>
            </Button>
          </div>
        </header>

        <main className="px-4 pb-28 pt-6 sm:px-8 lg:pb-10">{view}</main>
      </div>

      {/* bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-7 border-t border-line bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        {TABS.map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex flex-col items-center gap-1 py-2.5 text-[9.5px] font-semibold ${tab === key ? 'text-brand' : 'text-muted'}`}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </nav>

      {newOpen && state && <NewBookingDialog state={state} onClose={() => setNewOpen(false)} />}
    </div>
  );
}
