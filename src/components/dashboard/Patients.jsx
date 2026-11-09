'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, Phone, Search, UserRound } from 'lucide-react';
import { fmtLongDate, fmtTime, money, parseYmd, serviceById, staffById, VISIT, ymd } from '@/lib/demo-store';
import { Card, Empty, Modal, PageHead, StatusBadge, inputCls } from './ui';

/** Patients are built from the appointments (phone = identity): visits, spend, next appointment. */
export default function Patients({ state }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const today = ymd(new Date());

  const patients = useMemo(() => {
    const map = new Map();
    for (const b of state.bookings) {
      const key = b.customer.phone || b.customer.name;
      if (!map.has(key)) map.set(key, { key, name: b.customer.name, phone: b.customer.phone, bookings: [] });
      map.get(key).bookings.push(b);
    }
    return [...map.values()]
      .map((p) => {
        const sorted = [...p.bookings].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
        const done = sorted.filter((b) => b.status === 'done');
        return {
          ...p,
          bookings: sorted,
          visits: done.length,
          spent: done.reduce((t, b) => t + (serviceById(state, b.serviceId)?.price || 0), 0),
          last: done[0],
          next: [...sorted].reverse().find((b) => b.date >= today && b.status === 'confirmed'),
          noShows: sorted.filter((b) => b.status === 'no_show').length,
        };
      })
      .sort((a, b) => b.bookings.length - a.bookings.length);
  }, [state, today]);

  const list = patients.filter((p) => !q || p.name.includes(q) || p.phone.includes(q));
  const current = open && patients.find((p) => p.key === open);

  return (
    <div className="rise">
      <PageHead title="المرضى" sub={`${patients.length} مريض — كل مريض بسجل زياراته ومواعيده`} />
      <div className="relative mb-4 sm:w-80">
        <Search className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو الجوال" className={`${inputCls} pr-10`} />
      </div>

      <Card className="!p-0">
        {list.length === 0 ? (
          <Empty icon={UserRound} text="ما فيه مرضى بهذا البحث." />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((p) => (
              <li key={p.key}>
                <button type="button" onClick={() => setOpen(p.key)} className="flex w-full flex-col gap-2 p-4 text-right transition hover:bg-sand/60 sm:flex-row sm:items-center">
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft font-bold text-brand">{p.name[0]}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{p.name}</span>
                      <span dir="ltr" className="block text-right text-xs text-muted">{p.phone}</span>
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-xs sm:justify-end">
                    <span className="rounded-full bg-sand px-2.5 py-1 font-semibold">{p.visits} زيارة</span>
                    {p.noShows > 0 && <span className="rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-600">غاب {p.noShows}</span>}
                    {p.next ? (
                      <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 font-semibold text-brand-dark">
                        <CalendarClock className="size-3.5" /> {fmtLongDate(parseYmd(p.next.date))}
                      </span>
                    ) : (
                      <span className="rounded-full bg-gold-soft px-2.5 py-1 font-semibold text-gold">بدون موعد قادم</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {current && (
        <Modal title={`ملف المريض — ${current.name}`} onClose={() => setOpen(null)}>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['الزيارات', current.visits],
              ['إجمالي المدفوع', money(current.spent)],
              ['مرات الغياب', current.noShows],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-sand p-3">
                <p className="text-lg font-bold tabular-nums">{v}</p>
                <p className="text-[11px] text-muted">{l}</p>
              </div>
            ))}
          </div>
          {current.phone && (
            <a href={`tel:${current.phone}`} className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm font-bold hover:border-brand hover:text-brand">
              <Phone className="size-4" /> اتصال <span dir="ltr">{current.phone}</span>
            </a>
          )}
          <h3 className="mb-2 mt-5 text-sm font-bold">سجل المواعيد</h3>
          <ul className="space-y-2">
            {current.bookings.map((b) => (
              <li key={b.id} className="rounded-2xl border border-line p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{serviceById(state, b.serviceId)?.name}</span>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {fmtLongDate(parseYmd(b.date))} · {fmtTime(b.time)} · {staffById(state, b.staffId)?.name} · {VISIT[b.visit] || VISIT.first}
                </p>
                {b.note && <p className="mt-1 text-xs text-ink-soft">📝 {b.note}</p>}
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}
