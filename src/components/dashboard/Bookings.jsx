'use client';

import { useState } from 'react';
import { Check, ClipboardList, Phone, Search, UserX, X } from 'lucide-react';
import { fmtLongDate, fmtTime, money, parseYmd, serviceById, setBookingStatus, staffById, STATUS, ymd } from '@/lib/demo-store';
import { Card, Empty, PageHead, StatusBadge, inputCls } from './ui';

const FILTERS = [
  ['upcoming', 'القادمة'],
  ['today', 'اليوم'],
  ['past', 'السابقة'],
  ['all', 'الكل'],
];

export default function Bookings({ state }) {
  const [filter, setFilter] = useState('upcoming');
  const [q, setQ] = useState('');
  const today = ymd(new Date());

  const list = state.bookings
    .filter((b) => {
      if (filter === 'today') return b.date === today;
      if (filter === 'upcoming') return b.date >= today && b.status === 'confirmed';
      if (filter === 'past') return b.date < today;
      return true;
    })
    .filter((b) => !q || b.customer.name.includes(q) || b.customer.phone.includes(q))
    .sort((a, b) => (filter === 'past' ? -1 : 1) * `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <div className="rise">
      <PageHead title="المواعيد" sub={`${list.length} موعد`} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${filter === key ? 'bg-ink text-white' : 'text-ink-soft'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو الجوال" className={`${inputCls} pr-10`} />
        </div>
      </div>

      <Card className="!p-0">
        {list.length === 0 ? (
          <Empty icon={ClipboardList} text="ما فيه مواعيد هنا." />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((b) => {
              const s = serviceById(state, b.serviceId);
              return (
                <li key={b.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sand text-sm font-bold">{b.customer.name[0]}</span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-bold">
                        <span className="truncate">{b.customer.name}</span>
                        {b.visit === 'followup' && <span className="rounded-md bg-violet-50 px-1.5 text-[10px] font-semibold text-violet-600">مراجعة</span>}
                        {b.source === 'walkin' && <span className="rounded-md bg-sand px-1.5 text-[10px] font-semibold text-muted">استقبال</span>}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {s?.name} · {staffById(state, b.staffId)?.name} · {money(s?.price || 0)}
                      </p>
                      {b.note && <p className="mt-0.5 truncate text-[11px] text-ink-soft">📝 {b.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-right sm:text-left">
                      <p className="text-sm font-bold tabular-nums">{fmtTime(b.time)}</p>
                      <p className="text-[11px] text-muted">{fmtLongDate(parseYmd(b.date))}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex gap-1.5 sm:w-[168px] sm:justify-end">
                    <a href={`tel:${b.customer.phone}`} className="grid size-9 place-items-center rounded-xl border border-line text-ink-soft hover:text-brand" aria-label={`اتصال بـ ${b.customer.name}`}>
                      <Phone className="size-4" />
                    </a>
                    {b.status === 'confirmed' && (
                      <>
                        <Action label="حضر" onClick={() => setBookingStatus(b.id, 'done')} cls="bg-emerald-50 text-emerald-700"><Check className="size-4" /></Action>
                        <Action label={STATUS.no_show.label} onClick={() => setBookingStatus(b.id, 'no_show')} cls="bg-rose-50 text-rose-600"><UserX className="size-4" /></Action>
                        <Action label="إلغاء" onClick={() => setBookingStatus(b.id, 'cancelled')} cls="bg-slate-100 text-slate-500"><X className="size-4" /></Action>
                      </>
                    )}
                    {b.status !== 'confirmed' && (
                      <button type="button" onClick={() => setBookingStatus(b.id, 'confirmed')} className="rounded-xl px-3 text-xs font-semibold text-muted hover:text-brand">
                        تراجع
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Action({ label, onClick, cls, children }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={`grid size-9 place-items-center rounded-xl transition hover:brightness-95 ${cls}`}>
      {children}
    </button>
  );
}
