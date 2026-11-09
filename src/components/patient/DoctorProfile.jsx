'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BadgeCheck, Building2, Clock, Home, Languages, MapPin, Package, Phone, ShieldCheck, Users, Video,
} from 'lucide-react';
import {
  MODES, clinicById, doctorById, fmtTime, insurerById, money, queueOf, ratingOf, usePlatform, ymd,
} from '@/lib/platform';
import { Avatar, Card, Skeleton, Stars } from '@/components/app/ui';
import BookingPanel from './BookingPanel';

const MODE_ICON = { clinic: Building2, online: Video, home: Home };

export default function DoctorProfile({ id }) {
  const s = usePlatform();
  const [showAll, setShowAll] = useState(false);

  const data = useMemo(() => {
    if (!s) return null;
    const d = doctorById(s, id);
    if (!d) return null;
    const reviews = s.reviews.filter((r) => r.doctorId === id && !r.hidden).sort((a, b) => b.date.localeCompare(a.date));
    const dist = [5, 4, 3, 2, 1].map((n) => [n, reviews.filter((r) => r.rating === n).length]);
    const visits = s.appts.filter((a) => a.doctorId === id && a.status === 'done').length;
    return { d, clinic: clinicById(s, d.clinicId), rating: ratingOf(s, id), reviews, dist, visits, q: queueOf(s, id, ymd(new Date())) };
  }, [s, id]);

  if (!s) return <Skeleton />;
  if (!data) return <p className="py-20 text-center text-muted">الطبيب غير موجود.</p>;
  const { d, clinic, rating, reviews, dist, visits, q } = data;
  const packs = s.packages.filter((p) => p.doctorId === id);
  const working = q.list.length > 0;

  return (
    <div>
      <Link href="/doctors" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft hover:text-brand">
        <ArrowRight className="size-4" /> كل الأطباء
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          {/* header */}
          <Card className="rise overflow-hidden !p-0">
            <div className="h-24 bg-gradient-to-l from-brand to-brand-dark" />
            <div className="px-6 pb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                <Avatar name={d.name} gender={d.gender} className="-mt-12 size-24 border-4 border-white text-4xl shadow-lift" />
                <div className="flex-1 sm:pb-1">
                  <h1 className="flex items-center gap-2 text-2xl font-bold">
                    {d.name} <BadgeCheck className="size-6 text-sky-500" aria-label="موثّق" />
                  </h1>
                  <p className="text-ink-soft">{d.title}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  [<Stars key="s" value={rating.avg} size="size-3.5" />, `${rating.avg} (${rating.count})`, 'التقييم'],
                  [null, `${d.years} سنة`, 'الخبرة'],
                  [null, visits.toLocaleString('en-US'), 'كشف عبر موعِد'],
                  [null, `${d.slot} دقيقة`, 'مدة الكشف'],
                ].map(([extra, v, l]) => (
                  <div key={l} className="rounded-2xl bg-sand p-3 text-center">
                    {extra}
                    <p className="font-bold tabular-nums">{v}</p>
                    <p className="text-[11px] text-muted">{l}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 leading-8 text-ink-soft">{d.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="flex items-center gap-1 rounded-lg bg-sand px-2.5 py-1.5"><MapPin className="size-3.5 text-brand" /> {clinic.name} — {clinic.city}، حي {clinic.area}</span>
                <span className="flex items-center gap-1 rounded-lg bg-sand px-2.5 py-1.5"><Phone className="size-3.5 text-brand" /> <span dir="ltr">{clinic.phone}</span></span>
                <span className="flex items-center gap-1 rounded-lg bg-sand px-2.5 py-1.5"><Languages className="size-3.5 text-brand" /> العربية، English</span>
              </div>
            </div>
          </Card>

          {/* live queue */}
          <Card className="rise rise-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold">
                <span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" /></span>
                الدور المباشر في العيادة الآن
              </h2>
              <Link href="/queue" className="text-xs font-bold text-brand">شاشة الانتظار ←</Link>
            </div>
            {working ? (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-brand p-4 text-white">
                  <p className="text-[11px] text-white/70">عند الطبيب</p>
                  <p className="text-3xl font-bold tabular-nums">{q.current ? q.current._no : '—'}</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4 text-amber-800">
                  <p className="text-[11px]">في صالة الانتظار</p>
                  <p className="text-3xl font-bold tabular-nums">{q.waiting.length}</p>
                </div>
                <div className="rounded-2xl bg-sand p-4">
                  <p className="text-[11px] text-muted">انتظار تقريبي</p>
                  <p className="text-3xl font-bold tabular-nums">{q.waiting.length * d.slot}<span className="text-sm"> د</span></p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">الطبيب ما عنده عيادة اليوم.</p>
            )}
          </Card>

          {/* modes & insurance */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Card className="rise rise-3">
              <h2 className="mb-3 font-bold">أنواع الزيارة والأسعار</h2>
              <ul className="space-y-2">
                {d.modes.map((m) => {
                  const Icon = MODE_ICON[m];
                  return (
                    <li key={m} className="flex items-center justify-between rounded-xl bg-sand px-3 py-2.5 text-sm">
                      <span className="flex items-center gap-2 font-semibold"><Icon className="size-4 text-brand" /> {MODES[m].label}</span>
                      <b>{money(m === 'online' ? d.onlinePrice : m === 'home' ? d.homePrice : d.price)}</b>
                    </li>
                  );
                })}
              </ul>
            </Card>
            <Card className="rise rise-3">
              <h2 className="mb-3 flex items-center gap-2 font-bold"><ShieldCheck className="size-5 text-sky-600" /> التأمين المقبول</h2>
              <div className="flex flex-wrap gap-2">
                {d.insurance.map((i) => {
                  const ins = insurerById(s, i);
                  return (
                    <span key={i} className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800">
                      {ins.name} <span className="font-normal text-sky-600">· يغطي {ins.coverage}%</span>
                    </span>
                  );
                })}
              </div>
            </Card>
          </div>

          {packs.length > 0 && (
            <Card className="rise">
              <h2 className="mb-3 flex items-center gap-2 font-bold"><Package className="size-5 text-gold" /> باقات واشتراكات</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {packs.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-gold/30 bg-gold-soft/50 p-4">
                    <p className="font-bold">{p.name}</p>
                    <p className="mt-1 text-xs text-ink-soft">{p.desc}</p>
                    <p className="mt-3 flex items-end justify-between">
                      <span className="text-lg font-bold text-gold">{money(p.price)}</span>
                      <span className="text-[11px] text-muted">{p.sessions} زيارات · {p.months} أشهر</span>
                    </p>
                    <Link href="/patient?tab=family" className="mt-3 block rounded-xl bg-gold py-2 text-center text-xs font-bold text-ink">اشترك من بوابة المريض</Link>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* reviews */}
          <Card className="rise">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold">تقييمات المرضى</h2>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <BadgeCheck className="size-4" /> كل التقييمات من مرضى حضروا الكشف فعلًا
              </span>
            </div>
            <div className="mb-6 grid gap-6 sm:grid-cols-[160px_1fr]">
              <div className="text-center">
                <p className="text-5xl font-bold tabular-nums">{rating.avg || '—'}</p>
                <Stars value={rating.avg} />
                <p className="mt-1 text-xs text-muted">{rating.count} تقييم</p>
              </div>
              <div className="space-y-1.5">
                {dist.map(([n, c]) => (
                  <div key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-6 tabular-nums">{n}★</span>
                    <div className="h-2 flex-1 rounded-full bg-sand">
                      <div className="h-2 rounded-full bg-gold" style={{ width: `${rating.count ? (c / rating.count) * 100 : 0}%` }} />
                    </div>
                    <span className="w-6 text-muted tabular-nums">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <ul className="space-y-3">
              {(showAll ? reviews : reviews.slice(0, 4)).map((r) => (
                <li key={r.id} className="rounded-2xl bg-sand p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-bold">
                      <Users className="size-4 text-muted" /> {r.name}
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600"><BadgeCheck className="size-3.5" /> زيارة موثّقة</span>
                    </span>
                    <Stars value={r.rating} size="size-3.5" />
                  </div>
                  <p className="mt-2 text-sm leading-7 text-ink-soft">{r.text}</p>
                  <p className="mt-1 text-[11px] text-muted">{r.date}</p>
                </li>
              ))}
            </ul>
            {reviews.length > 4 && (
              <button type="button" onClick={() => setShowAll((v) => !v)} className="mt-4 w-full rounded-xl border border-line py-2.5 text-sm font-bold hover:border-brand hover:text-brand">
                {showAll ? 'عرض أقل' : `عرض كل التقييمات (${reviews.length})`}
              </button>
            )}
          </Card>
        </div>

        <div className="lg:sticky lg:top-32 lg:h-fit">
          <BookingPanel s={s} doctor={d} />
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
            <Clock className="size-3.5" /> أول موعد متاح يظهر أولًا · تقدر تلغي مجانًا قبل الموعد بـ 3 ساعات
          </p>
        </div>
      </div>
    </div>
  );
}

