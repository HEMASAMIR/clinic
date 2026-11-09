'use client';

import { ArrowLeft, CalendarCheck, CalendarClock, TrendingUp, UserCheck, Wallet } from 'lucide-react';
import { addDays, fmtDay, fmtLongDate, fmtTime, money, parseYmd, serviceById, staffById, ymd } from '@/lib/demo-store';
import { Card, Empty, PageHead, StatusBadge } from './ui';

const SHORT_DAYS = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export default function Overview({ state, goTo }) {
  const now = new Date();
  const today = ymd(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const price = (b) => serviceById(state, b.serviceId)?.price || 0;
  const live = (b) => b.status === 'confirmed' || b.status === 'done';

  const todays = state.bookings.filter((b) => b.date === today && live(b)).sort((a, b) => a.time.localeCompare(b.time));
  const week = Array.from({ length: 7 }, (_, i) => ymd(addDays(now, i - 6)));
  const weekBookings = state.bookings.filter((b) => week.includes(b.date) && live(b));
  const finished = state.bookings.filter((b) => b.status === 'done' || b.status === 'no_show');
  const attendance = finished.length ? Math.round((finished.filter((b) => b.status === 'done').length / finished.length) * 100) : 100;
  const fromLink = weekBookings.filter((b) => b.source === 'link').length;

  const perDay = week.map((d) => ({ d, n: state.bookings.filter((b) => b.date === d && live(b)).length }));
  const maxDay = Math.max(1, ...perDay.map((x) => x.n));

  const top = state.services
    .map((s) => ({ s, n: state.bookings.filter((b) => b.serviceId === s.id && live(b)).length }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 4);
  const maxTop = Math.max(1, ...top.map((x) => x.n));

  const upcoming = todays.filter((b) => {
    const [h, m] = b.time.split(':').map(Number);
    return h * 60 + m >= nowMin - 30 && b.status === 'confirmed';
  });

  const kpis = [
    [CalendarCheck, 'حجوزات اليوم', todays.length, 'bg-brand-soft text-brand'],
    [Wallet, 'إيراد اليوم المتوقع', money(todays.reduce((t, b) => t + price(b), 0)), 'bg-gold-soft text-gold'],
    [TrendingUp, 'حجوزات آخر 7 أيام', weekBookings.length, 'bg-violet-50 text-violet-600'],
    [UserCheck, 'نسبة الحضور', `${attendance}%`, 'bg-emerald-50 text-emerald-600'],
  ];

  return (
    <div className="rise">
      <PageHead title="أهلًا 👋" sub={fmtLongDate(now)} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(([Icon, label, value, cls]) => (
          <Card key={label} className="!p-4">
            <span className={`grid size-10 place-items-center rounded-2xl ${cls}`}>
              <Icon className="size-5" />
            </span>
            <p className="mt-4 text-2xl font-bold tabular-nums">{value}</p>
            <p className="mt-0.5 text-xs text-muted">{label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">المواعيد القادمة اليوم</h2>
            <button type="button" onClick={() => goTo('calendar')} className="flex items-center gap-1 text-xs font-bold text-brand">
              التقويم <ArrowLeft className="size-3.5" />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <Empty icon={CalendarClock} text="ما فيه مواعيد قادمة اليوم." />
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((b) => {
                const s = serviceById(state, b.serviceId);
                return (
                  <li key={b.id} className="flex items-center gap-3 py-3">
                    <span className="w-16 shrink-0 text-sm font-bold tabular-nums">{fmtTime(b.time)}</span>
                    <span className="h-9 w-1 rounded-full" style={{ background: s?.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{b.customer.name}</p>
                      <p className="truncate text-xs text-muted">
                        {s?.name} · مع {staffById(state, b.staffId)?.name}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="grid gap-4">
          <Card>
            <h2 className="mb-1 font-bold">الحجوزات خلال الأسبوع</h2>
            <p className="mb-4 text-xs text-muted">{fromLink} منها جت من رابط الحجز بدون أي مكالمة</p>
            <div className="flex h-36 items-end gap-2" role="img" aria-label="عدد الحجوزات لكل يوم في آخر 7 أيام">
              {perDay.map(({ d, n }) => (
                <div key={d} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[11px] font-bold tabular-nums text-ink-soft">{n}</span>
                  <div
                    className={`w-full rounded-t-lg ${d === today ? 'bg-brand' : 'bg-brand/25'}`}
                    style={{ height: `${Math.max(6, (n / maxDay) * 96)}px` }}
                  />
                  <span className="text-[10px] text-muted">{SHORT_DAYS[parseYmd(d).getDay()]}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 font-bold">الأكثر طلبًا</h2>
            <ul className="space-y-3">
              {top.map(({ s, n }) => (
                <li key={s.id}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold">{s.name}</span>
                    <span className="tabular-nums text-muted">{n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-sand">
                    <div className="h-2 rounded-full" style={{ width: `${(n / maxTop) * 100}%`, background: s.color }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
