'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck, Building2, CalendarCheck, Home, MapPin, Search, ShieldCheck, SlidersHorizontal, Stethoscope, Video, X,
} from 'lucide-react';
import {
  CITIES, MODES, SPECIALTIES, clinicById, fmtTime, insurerById, money, nextAvailable, priceFor, ratingOf, toMin, usePlatform,
} from '@/lib/platform';
import { Avatar, Empty, Skeleton, Stars, inputCls } from '@/components/app/ui';

const MODE_ICON = { clinic: Building2, online: Video, home: Home };
const SORTS = [
  ['soon', 'الأقرب موعدًا'],
  ['rating', 'الأعلى تقييمًا'],
  ['price', 'الأقل سعرًا'],
  ['exp', 'الأكثر خبرة'],
];

const soonKey = (next) => (next ? next.dayOffset * 1440 + toMin(next.time) : Infinity);

const EMPTY = { q: '', specialty: '', city: '', area: '', insurer: '', maxPrice: 500, minRating: 0, today: false, gender: '', mode: '' };

export default function DoctorSearch() {
  const s = usePlatform();
  const [f, setF] = useState(EMPTY);
  const [sort, setSort] = useState('soon');
  const [showFilters, setShowFilters] = useState(false);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v, ...(k === 'city' ? { area: '' } : {}) }));

  const rows = useMemo(() => {
    if (!s) return [];
    return s.doctors.map((d) => ({ d, clinic: clinicById(s, d.clinicId), rating: ratingOf(s, d.id), next: nextAvailable(s, d.id) }));
  }, [s]);

  const list = useMemo(() => {
    const mode = f.mode || 'clinic';
    const out = rows.filter(({ d, clinic, rating, next }) => {
      if (f.q && !`${d.name} ${d.title} ${d.specialty} ${clinic.name}`.includes(f.q.trim())) return false;
      if (f.specialty && d.specialty !== f.specialty) return false;
      if (f.city && clinic.city !== f.city) return false;
      if (f.area && clinic.area !== f.area) return false;
      if (f.insurer && !d.insurance.includes(f.insurer)) return false;
      if (f.mode && !d.modes.includes(f.mode)) return false;
      if (f.gender && d.gender !== f.gender) return false;
      if (priceFor(d, mode) > f.maxPrice) return false;
      if (rating.avg < f.minRating) return false;
      if (f.today && next?.dayOffset !== 0) return false;
      return true;
    });
    const by = {
      soon: (a, b) => soonKey(a.next) - soonKey(b.next),
      rating: (a, b) => b.rating.avg - a.rating.avg,
      price: (a, b) => priceFor(a.d, mode) - priceFor(b.d, mode),
      exp: (a, b) => b.d.years - a.d.years,
    };
    return out.sort(by[sort]);
  }, [rows, f, sort]);

  if (!s) return <Skeleton />;

  const activeCount = Object.entries(f).filter(([k, v]) => v && v !== EMPTY[k]).length;

  const filters = (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-bold text-ink-soft">نوع الزيارة</p>
        <div className="grid grid-cols-3 gap-1.5">
          {Object.entries(MODES).map(([k, m]) => {
            const Icon = MODE_ICON[k];
            return (
              <button key={k} type="button" onClick={() => set('mode', f.mode === k ? '' : k)}
                className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-[11px] font-bold transition ${f.mode === k ? 'border-brand bg-brand-soft text-brand-dark' : 'border-line bg-white text-ink-soft hover:border-brand/40'}`}>
                <Icon className="size-4" /> {m.short}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-soft">المدينة</span>
          <select className={inputCls} value={f.city} onChange={(e) => set('city', e.target.value)}>
            <option value="">كل المدن</option>
            {Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-ink-soft">الحي</span>
          <select className={inputCls} value={f.area} onChange={(e) => set('area', e.target.value)} disabled={!f.city}>
            <option value="">كل الأحياء</option>
            {(CITIES[f.city] || []).map((a) => <option key={a}>{a}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-ink-soft">التأمين الطبي</span>
        <select className={inputCls} value={f.insurer} onChange={(e) => set('insurer', e.target.value)}>
          <option value="">بدون تأمين / الكل</option>
          {s.insurers.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 flex justify-between text-xs font-bold text-ink-soft">سعر الكشف <span className="text-brand">حتى {money(f.maxPrice)}</span></span>
        <input type="range" min={100} max={500} step={10} value={f.maxPrice} onChange={(e) => set('maxPrice', Number(e.target.value))}
          className="range w-full" style={{ '--p': `${((f.maxPrice - 100) / 400) * 100}%` }} />
      </label>
      <div>
        <p className="mb-2 text-xs font-bold text-ink-soft">التقييم</p>
        <div className="flex gap-1.5">
          {[0, 4, 4.5].map((r) => (
            <button key={r} type="button" onClick={() => set('minRating', r)}
              className={`flex-1 rounded-xl border py-2 text-xs font-bold ${f.minRating === r ? 'border-gold bg-gold-soft text-gold' : 'border-line bg-white text-ink-soft'}`}>
              {r ? `${r}+ ⭐` : 'الكل'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold text-ink-soft">الطبيب</p>
        <div className="flex gap-1.5">
          {[['', 'الكل'], ['m', 'طبيب'], ['f', 'طبيبة']].map(([g, l]) => (
            <button key={g} type="button" onClick={() => set('gender', g)}
              className={`flex-1 rounded-xl border py-2 text-xs font-bold ${f.gender === g ? 'border-brand bg-brand-soft text-brand-dark' : 'border-line bg-white text-ink-soft'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
        <span className="flex items-center gap-2"><CalendarCheck className="size-4" /> متاح للحجز اليوم</span>
        <input type="checkbox" checked={f.today} onChange={(e) => set('today', e.target.checked)} className="size-5 accent-emerald-600" />
      </label>
      {activeCount > 0 && (
        <button type="button" onClick={() => setF(EMPTY)} className="w-full text-xs font-bold text-rose-600">مسح كل الفلاتر ({activeCount})</button>
      )}
    </div>
  );

  return (
    <div>
      {/* hero search */}
      <section className="rise relative mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-bl from-brand to-brand-dark p-6 text-white shadow-lift sm:p-10">
        <div className="drift pointer-events-none absolute -left-20 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
        <h1 className="relative text-2xl font-bold sm:text-4xl">احجز مع أفضل الأطباء.. بالساعة والدقيقة</h1>
        <p className="relative mt-2 text-white/75">{s.doctors.length} طبيب في {s.clinics.length} عيادات — تقييمات من مرضى حضروا فعلًا.</p>
        <div className="relative mt-6 flex flex-col gap-2 rounded-2xl bg-white p-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input value={f.q} onChange={(e) => set('q', e.target.value)} placeholder="اسم الطبيب أو التخصص أو العيادة…"
              className="w-full rounded-xl py-3 pl-3 pr-11 text-ink outline-none" />
          </div>
          <select value={f.specialty} onChange={(e) => set('specialty', e.target.value)} className="rounded-xl bg-sand px-4 py-3 text-sm font-bold text-ink outline-none">
            <option value="">كل التخصصات</option>
            {SPECIALTIES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div className="no-scrollbar relative mt-4 flex gap-2 overflow-x-auto">
          {SPECIALTIES.map((x) => (
            <button key={x} type="button" onClick={() => set('specialty', f.specialty === x ? '' : x)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${f.specialty === x ? 'bg-gold text-ink' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              {x}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden h-fit rounded-3xl border border-line bg-white p-5 shadow-soft lg:sticky lg:top-32 lg:block">
          <p className="mb-4 flex items-center gap-2 font-bold"><SlidersHorizontal className="size-4 text-brand" /> الفلاتر</p>
          {filters}
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold">{list.length} طبيب مطابق</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowFilters(true)} className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold lg:hidden">
                <SlidersHorizontal className="size-4" /> فلاتر {activeCount ? `(${activeCount})` : ''}
              </button>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold outline-none">
                {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          </div>

          {list.length === 0 ? (
            <Empty icon={Stethoscope} text="ما فيه أطباء بهذه الفلاتر — جرّب توسّع البحث." action={<button type="button" onClick={() => setF(EMPTY)} className="text-sm font-bold text-brand">مسح الفلاتر</button>} />
          ) : (
            <div className="space-y-3">
              {list.map(({ d, clinic, rating, next }, i) => (
                <Link
                  key={d.id}
                  href={`/doctors/${d.id}`}
                  className="spot rise group flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lift sm:flex-row"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <Avatar name={d.name} gender={d.gender} className="size-20 text-3xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold group-hover:text-brand">{d.name}</h2>
                      <BadgeCheck className="size-5 text-sky-500" aria-label="طبيب موثّق" />
                      <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-bold text-brand-dark">{d.specialty}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-soft">{d.title} · خبرة {d.years} سنة</p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {clinic.name} — {clinic.city}، {clinic.area}</span>
                      <span className="flex items-center gap-1.5">
                        <Stars value={rating.avg} size="size-3.5" /> <b className="text-ink">{rating.avg || '—'}</b> ({rating.count} تقييم موثّق)
                      </span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {d.modes.map((m) => {
                        const Icon = MODE_ICON[m];
                        return (
                          <span key={m} className="flex items-center gap-1 rounded-lg bg-sand px-2 py-1 text-[11px] font-semibold text-ink-soft">
                            <Icon className="size-3.5" /> {MODES[m].short} · {money(priceFor(d, m))}
                          </span>
                        );
                      })}
                      {d.insurance.length > 0 && (
                        <span className="flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700" title={d.insurance.map((x) => insurerById(s, x)?.name).join('، ')}>
                          <ShieldCheck className="size-3.5" /> يقبل {d.insurance.length} شركات تأمين
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-line pt-3 sm:w-44 sm:flex-col sm:items-stretch sm:justify-center sm:border-r sm:border-t-0 sm:pr-4 sm:pt-0">
                    {next ? (
                      <div className={`rounded-2xl px-3 py-2 text-center ${next.dayOffset === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-sand text-ink-soft'}`}>
                        <p className="text-[11px] font-semibold">{next.dayOffset === 0 ? 'متاح اليوم' : next.dayOffset === 1 ? 'متاح بكرة' : `بعد ${next.dayOffset} أيام`}</p>
                        <p className="text-sm font-bold tabular-nums">{fmtTime(next.time)}</p>
                      </div>
                    ) : (
                      <p className="text-center text-xs text-muted">لا مواعيد قريبة</p>
                    )}
                    <span className="rounded-xl bg-brand px-4 py-2.5 text-center text-sm font-bold text-white transition group-hover:bg-brand-dark">احجز الآن</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-[70] flex items-end bg-ink/45 backdrop-blur-sm lg:hidden" onClick={() => setShowFilters(false)}>
          <div className="rise max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <p className="font-bold">الفلاتر</p>
              <button type="button" onClick={() => setShowFilters(false)} aria-label="إغلاق"><X className="size-5" /></button>
            </div>
            {filters}
            <button type="button" onClick={() => setShowFilters(false)} className="mt-6 w-full rounded-2xl bg-brand py-3.5 font-bold text-white">
              اعرض {list.length} طبيب
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
