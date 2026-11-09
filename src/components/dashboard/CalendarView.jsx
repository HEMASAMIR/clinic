'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, fmtLongDate, fmtTime, parseYmd, serviceById, toMin, ymd } from '@/lib/demo-store';
import { Button, Card, PageHead } from './ui';

const PX_PER_MIN = 1.3;

export default function CalendarView({ state }) {
  const [date, setDate] = useState(() => ymd(new Date()));
  const day = parseYmd(date);
  const hours = state.business.hours[day.getDay()];
  const [open, close] = hours ? hours.map(toMin) : [600, 1320];
  const height = (close - open) * PX_PER_MIN;
  const marks = [];
  for (let m = Math.ceil(open / 60) * 60; m <= close; m += 60) marks.push(m);

  const dayBookings = state.bookings.filter((b) => b.date === date && b.status !== 'cancelled');

  return (
    <div className="rise">
      <PageHead
        title="التقويم"
        sub={fmtLongDate(day)}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="!px-2.5" aria-label="اليوم السابق" onClick={() => setDate(ymd(addDays(day, -1)))}>
              <ChevronRight className="size-4" />
            </Button>
            <Button variant="soft" onClick={() => setDate(ymd(new Date()))}>اليوم</Button>
            <Button variant="ghost" className="!px-2.5" aria-label="اليوم التالي" onClick={() => setDate(ymd(addDays(day, 1)))}>
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        }
      />

      <Card className="!p-0">
        {!hours ? (
          <p className="p-10 text-center text-muted">النشاط مغلق في هذا اليوم.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid border-b border-line" style={{ gridTemplateColumns: `64px repeat(${state.staff.length}, 1fr)` }}>
                <div />
                {state.staff.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 border-r border-line p-3">
                    <span className="grid size-8 place-items-center rounded-xl bg-brand-soft text-sm font-bold text-brand">{p.name[0]}</span>
                    <div>
                      <p className="text-sm font-bold">{p.name}</p>
                      <p className="text-[10px] text-muted">{p.off.includes(day.getDay()) ? 'إجازة اليوم' : p.role}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid" style={{ gridTemplateColumns: `64px repeat(${state.staff.length}, 1fr)` }}>
                <div className="relative" style={{ height }}>
                  {marks.map((m) => (
                    <span key={m} className="absolute right-2 -translate-y-1/2 text-[10px] tabular-nums text-muted" style={{ top: (m - open) * PX_PER_MIN }}>
                      {fmtTime(`${String(m / 60).padStart(2, '0')}:00`)}
                    </span>
                  ))}
                </div>
                {state.staff.map((p) => (
                  <div
                    key={p.id}
                    className={`relative border-r border-line ${p.off.includes(day.getDay()) ? 'bg-[repeating-linear-gradient(45deg,#f2ecdf,#f2ecdf_6px,transparent_6px,transparent_12px)]' : ''}`}
                    style={{ height }}
                  >
                    {marks.map((m) => (
                      <div key={m} className="absolute inset-x-0 border-t border-line/60" style={{ top: (m - open) * PX_PER_MIN }} />
                    ))}
                    {dayBookings
                      .filter((b) => b.staffId === p.id)
                      .map((b) => {
                        const s = serviceById(state, b.serviceId);
                        const top = (toMin(b.time) - open) * PX_PER_MIN;
                        const h = (s?.duration || 30) * PX_PER_MIN;
                        return (
                          <div
                            key={b.id}
                            className={`absolute inset-x-1.5 overflow-hidden rounded-xl border-r-4 px-2.5 py-1.5 text-xs ${b.status === 'no_show' ? 'opacity-50' : ''}`}
                            style={{ top: top + 1, height: h - 2, borderColor: s?.color, background: `${s?.color}1f` }}
                            title={`${b.customer.name} — ${s?.name}`}
                          >
                            <p className="truncate font-bold">{b.customer.name}</p>
                            <p className="truncate text-[11px] text-ink-soft">
                              {fmtTime(b.time)} · {s?.name}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
