'use client';

import { useMemo, useState } from 'react';
import {
  BarChart3, BellRing, CalendarCheck, Eye, EyeOff, LayoutDashboard, MessageCircle, Package, Plus, ShieldCheck, Star,
  Stethoscope, TrendingUp, UserCheck, Wallet, XCircle,
} from 'lucide-react';
import {
  DAY_NAMES, MODES, addDays, doctorById, fmtTime, money, parseYmd, ratingOf, uid, update, usePlatform, ymd,
} from '@/lib/platform';
import { Avatar, Button, Card, Empty, Field, Modal, PageHead, Skeleton, Stars, Tabs, inputCls } from '@/components/app/ui';
import { CountUp } from '@/components/site/Motion';

const TABS = [
  ['analytics', 'التحليلات', BarChart3],
  ['doctors', 'الأطباء والأسعار', Stethoscope],
  ['insurance', 'التأمين', ShieldCheck],
  ['packages', 'الباقات', Package],
  ['reviews', 'التقييمات', Star],
  ['messages', 'الرسائل والتذكير', MessageCircle],
];

export default function AdminDashboard() {
  const s = usePlatform();
  const [tab, setTab] = useState('analytics');
  if (!s) return <Skeleton />;
  return (
    <div>
      <PageHead icon={LayoutDashboard} title="لوحة الإدارة" sub={`${s.clinics.length} عيادات · ${s.doctors.length} أطباء`} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'analytics' && <Analytics s={s} />}
      {tab === 'doctors' && <Doctors s={s} />}
      {tab === 'insurance' && <Insurance s={s} />}
      {tab === 'packages' && <Packages s={s} />}
      {tab === 'reviews' && <Reviews s={s} />}
      {tab === 'messages' && <Messages s={s} />}
    </div>
  );
}

// ── analytics ────────────────────────────────────────────────────────────────
function Analytics({ s }) {
  const [hover, setHover] = useState(null);
  const data = useMemo(() => {
    const today = new Date();
    const since = ymd(addDays(today, -30));
    const recent = s.appts.filter((a) => a.date >= since && a.date <= ymd(today));
    const finished = recent.filter((a) => ['done', 'no_show'].includes(a.status));
    const revenue30 = s.payments.filter((p) => p.date >= since).reduce((t, p) => t + p.total, 0);
    const attendance = finished.length ? Math.round((finished.filter((a) => a.status === 'done').length / finished.length) * 100) : 0;
    const cancelRate = recent.length ? Math.round((recent.filter((a) => a.status === 'cancelled').length / recent.length) * 100) : 0;
    const online = recent.length ? Math.round((recent.filter((a) => a.source === 'online').length / recent.length) * 100) : 0;

    // revenue per week, last 6 weeks
    const weeks = Array.from({ length: 6 }, (_, i) => {
      const end = addDays(today, -7 * (5 - i));
      const start = addDays(end, -6);
      const total = s.payments.filter((p) => p.date >= ymd(start) && p.date <= ymd(end)).reduce((t, p) => t + p.total, 0);
      return { label: `${start.getDate()}/${start.getMonth() + 1}`, total };
    });

    // peak hours: weekday × hour
    const hours = Array.from({ length: 15 }, (_, i) => 8 + i);
    const grid = DAY_NAMES.map((_, day) => hours.map((h) => s.appts.filter((a) => a.status !== 'cancelled' && parseYmd(a.date).getDay() === day && Number(a.time.slice(0, 2)) === h).length));
    const max = Math.max(1, ...grid.flat());

    const doctors = s.doctors.map((d) => {
      const mine = recent.filter((a) => a.doctorId === d.id);
      const rev = s.payments.filter((p) => p.date >= since && mine.some((a) => a.id === p.apptId)).reduce((t, p) => t + p.total, 0);
      return { d, count: mine.filter((a) => a.status === 'done').length, rev, rating: ratingOf(s, d.id) };
    }).sort((a, b) => b.rev - a.rev);

    const extras = {};
    s.payments.forEach((p) => p.items.slice(1).forEach(([n]) => (extras[n] = (extras[n] || 0) + 1)));
    const topExtras = Object.entries(extras).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const ratings = s.reviews.map((r) => r.rating);
    const avgRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0;

    return { revenue30, attendance, cancelRate, online, weeks, hours, grid, max, doctors, topExtras, avgRating, count30: recent.length };
  }, [s]);

  const maxWeek = Math.max(1, ...data.weeks.map((w) => w.total));
  const kpis = [
    [Wallet, 'إيراد آخر 30 يوم', data.revenue30, ' ر.س', 'text-brand'],
    [CalendarCheck, 'مواعيد آخر 30 يوم', data.count30, '', 'text-ink'],
    [UserCheck, 'نسبة الحضور', data.attendance, '%', 'text-emerald-600'],
    [XCircle, 'نسبة الإلغاء', data.cancelRate, '%', 'text-rose-600'],
    [TrendingUp, 'حُجزت أونلاين', data.online, '%', 'text-sky-600'],
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map(([Icon, label, v, suf, c], i) => (
          <Card key={label} className="rise !p-4" style={{ animationDelay: `${i * 50}ms` }}>
            <Icon className="size-5 text-muted" />
            <p className={`mt-3 text-2xl font-bold ${c}`}><CountUp to={v} suffix={suf} /></p>
            <p className="text-[11px] text-muted">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Card className="rise">
          <h3 className="font-bold">الإيراد الأسبوعي</h3>
          <p className="mb-5 text-xs text-muted">آخر 6 أسابيع — مرّر على العمود لتفاصيله</p>
          <div className="relative flex h-56 items-end gap-3 border-b border-line" role="img" aria-label="الإيراد لكل أسبوع خلال آخر 6 أسابيع">
            {data.weeks.map((w, i) => (
              <div key={w.label} className="group relative flex h-full flex-1 flex-col justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {hover === i && (
                  <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-lift">
                    أسبوع {w.label}<br /><b>{money(w.total)}</b>
                  </div>
                )}
                <div className={`rounded-t-[4px] transition-all duration-700 ${hover === i ? 'bg-brand-dark' : 'bg-brand'}`} style={{ height: `${(w.total / maxWeek) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-3">
            {data.weeks.map((w) => <span key={w.label} className="flex-1 text-center text-[10px] text-muted">{w.label}</span>)}
          </div>
        </Card>

        <Card className="rise rise-2">
          <h3 className="font-bold">أوقات الذروة</h3>
          <p className="mb-4 text-xs text-muted">عدد المواعيد حسب اليوم والساعة — الأغمق أزحم</p>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-[3px] text-[10px]">
              <thead>
                <tr><th />{data.hours.map((h) => <th key={h} className="font-normal text-muted">{h > 12 ? h - 12 : h}</th>)}</tr>
              </thead>
              <tbody>
                {data.grid.map((row, day) => (
                  <tr key={day}>
                    <th className="whitespace-nowrap pl-1 text-right font-semibold text-ink-soft">{DAY_NAMES[day]}</th>
                    {row.map((n, k) => (
                      <td key={k} title={`${DAY_NAMES[day]} ${fmtTime(`${String(data.hours[k]).padStart(2, '0')}:00`)} — ${n} موعد`}
                        className="h-6 min-w-[18px] rounded-[4px]" style={{ background: n ? `rgb(13 122 111 / ${0.12 + (n / data.max) * 0.88})` : '#f1f4f7' }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted">
            أقل <span className="h-2 w-24 rounded-full" style={{ background: 'linear-gradient(to left, rgb(13 122 111), rgb(13 122 111 / 0.12))' }} /> أكثر
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="rise !p-0 overflow-hidden">
          <h3 className="p-5 pb-3 font-bold">أداء الأطباء (30 يوم)</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-sand text-xs text-muted">
                <tr><th className="p-3 text-right font-semibold">الطبيب</th><th className="p-3 font-semibold">كشوفات</th><th className="p-3 font-semibold">الإيراد</th><th className="p-3 font-semibold">التقييم</th></tr>
              </thead>
              <tbody>
                {data.doctors.map(({ d, count, rev, rating }) => (
                  <tr key={d.id} className="border-t border-line">
                    <td className="p-3"><span className="flex items-center gap-2"><Avatar name={d.name} gender={d.gender} className="size-8 text-xs" /><span><b className="block">{d.name}</b><span className="text-[11px] text-muted">{d.specialty}</span></span></span></td>
                    <td className="p-3 text-center tabular-nums">{count}</td>
                    <td className="p-3 text-center font-bold tabular-nums">{money(rev)}</td>
                    <td className="p-3 text-center"><span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-gold text-gold" /> {rating.avg}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="space-y-5">
          <Card className="rise flex items-center gap-5">
            <div className="text-center">
              <p className="text-5xl font-bold tabular-nums">{data.avgRating}</p>
              <Stars value={data.avgRating} />
            </div>
            <p className="text-sm text-ink-soft">متوسط تقييم المرضى من <b>{s.reviews.length}</b> تقييم موثّق — كلها من مرضى حضروا الكشف.</p>
          </Card>
          <Card className="rise">
            <h3 className="mb-3 font-bold">أكثر الخدمات الإضافية طلبًا</h3>
            <ul className="space-y-2.5">
              {data.topExtras.map(([n, c]) => (
                <li key={n}>
                  <div className="mb-1 flex justify-between text-xs"><span className="font-semibold">{n}</span><span className="tabular-nums text-muted">{c}</span></div>
                  <div className="h-2 rounded-full bg-sand"><div className="h-2 rounded-full bg-gold" style={{ width: `${(c / data.topExtras[0][1]) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── doctors ──────────────────────────────────────────────────────────────────
function Doctors({ s }) {
  const edit = (id, fn) => update((st) => { fn(st.doctors.find((x) => x.id === id)); return st; });
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {s.doctors.map((d) => (
        <Card key={d.id} className="rise">
          <div className="flex items-center gap-3">
            <Avatar name={d.name} gender={d.gender} />
            <div className="flex-1"><p className="font-bold">{d.name}</p><p className="text-xs text-muted">{d.title}</p></div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[['price', 'clinic'], ['onlinePrice', 'online'], ['homePrice', 'home']].map(([k, m]) => {
              const on = d.modes.includes(m);
              return (
                <div key={k} className={`rounded-2xl border p-3 ${on ? 'border-brand/30 bg-brand-soft/40' : 'border-line bg-sand/60'}`}>
                  <label className="flex items-center justify-between text-[11px] font-bold">
                    {MODES[m].short}
                    <input type="checkbox" checked={on} disabled={m === 'clinic' && d.modes.length === 1}
                      onChange={(e) => edit(d.id, (x) => { x.modes = e.target.checked ? [...x.modes, m] : x.modes.filter((y) => y !== m); if (e.target.checked && !x[k]) x[k] = x.price; })}
                      className="size-4 accent-[var(--color-brand)]" />
                  </label>
                  <input type="number" min={0} step={10} disabled={!on} value={d[k] || 0} onChange={(e) => edit(d.id, (x) => (x[k] = Number(e.target.value)))}
                    className="mt-2 w-full rounded-lg border border-line bg-white px-2 py-1 text-sm font-bold disabled:opacity-40" aria-label={`سعر ${MODES[m].short}`} />
                </div>
              );
            })}
          </div>
          <p className="mb-2 mt-4 text-xs font-bold text-ink-soft">شركات التأمين المتعاقد معها</p>
          <div className="flex flex-wrap gap-1.5">
            {s.insurers.map((i) => {
              const on = d.insurance.includes(i.id);
              return (
                <button key={i.id} type="button" onClick={() => edit(d.id, (x) => (x.insurance = on ? x.insurance.filter((y) => y !== i.id) : [...x.insurance, i.id]))}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${on ? 'bg-sky-600 text-white' : 'bg-sand text-muted'}`}>
                  {i.name}
                </button>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── insurance ────────────────────────────────────────────────────────────────
function Insurance({ s }) {
  const due = s.payments.filter((p) => p.insurerShare).reduce((t, p) => t + p.insurerShare, 0);
  return (
    <div className="space-y-5">
      <Card className="rise flex flex-wrap items-center justify-between gap-4 bg-sky-50">
        <div>
          <p className="text-sm text-sky-800">إجمالي المستحق على شركات التأمين (آخر 45 يوم)</p>
          <p className="text-3xl font-bold text-sky-900"><CountUp to={due} suffix=" ر.س" /></p>
        </div>
        <ShieldCheck className="size-12 text-sky-300" />
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {s.insurers.map((i) => {
          const docs = s.doctors.filter((d) => d.insurance.includes(i.id));
          const members = s.family.members.filter((m) => m.insurance?.insurerId === i.id).length;
          return (
            <Card key={i.id} className="rise">
              <p className="text-lg font-bold">{i.name}</p>
              <p className="text-xs text-muted">{docs.length} أطباء متعاقدين · {members} مرضى مسجّلين في التجربة</p>
              <label className="mt-4 block">
                <span className="flex justify-between text-xs font-bold">نسبة التغطية <span className="text-sky-700">{i.coverage}%</span></span>
                <input type="range" min={50} max={100} step={5} value={i.coverage} className="range mt-2 w-full" style={{ '--p': `${((i.coverage - 50) / 50) * 100}%` }}
                  onChange={(e) => update((st) => { st.insurers.find((x) => x.id === i.id).coverage = Number(e.target.value); return st; })} />
              </label>
              <p className="mt-3 text-[11px] text-muted">نسبة التحمّل على المريض: {100 - i.coverage}%</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── packages ─────────────────────────────────────────────────────────────────
function Packages({ s }) {
  const [adding, setAdding] = useState(false);
  return (
    <div>
      <div className="mb-4 flex justify-end"><Button onClick={() => setAdding(true)}><Plus className="size-4" /> باقة جديدة</Button></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {s.packages.map((p) => {
          const subs = s.subscriptions.filter((x) => x.packageId === p.id).length;
          return (
            <Card key={p.id} className="spot rise">
              <Package className="size-6 text-gold" />
              <p className="mt-3 font-bold">{p.name}</p>
              <p className="text-xs text-muted">{doctorById(s, p.doctorId)?.name} · {p.sessions} زيارات · {p.months} أشهر</p>
              <p className="mt-3 text-xl font-bold text-gold">{money(p.price)}</p>
              <p className="mt-2 rounded-xl bg-sand px-3 py-1.5 text-xs font-semibold">{subs} مشترك</p>
            </Card>
          );
        })}
      </div>
      {adding && <NewPackage s={s} onClose={() => setAdding(false)} />}
    </div>
  );
}

function NewPackage({ s, onClose }) {
  const [f, setF] = useState({ name: '', doctorId: s.doctors[0].id, sessions: 6, price: 1200, months: 3, desc: '' });
  const set = (k, num) => (e) => setF((x) => ({ ...x, [k]: num ? Number(e.target.value) : e.target.value }));
  return (
    <Modal title="باقة جديدة" onClose={onClose}>
      <form className="grid grid-cols-2 gap-3" onSubmit={(e) => { e.preventDefault(); if (!f.name.trim()) return; update((st) => { st.packages.push({ id: uid('p'), ...f, name: f.name.trim(), desc: f.desc || `${f.sessions} زيارات` }); return st; }); onClose(); }}>
        <div className="col-span-2"><Field label="اسم الباقة"><input required className={inputCls} value={f.name} onChange={set('name')} placeholder="مثال: باقة متابعة الضغط" /></Field></div>
        <div className="col-span-2">
          <Field label="الطبيب">
            <select className={inputCls} value={f.doctorId} onChange={set('doctorId')}>{s.doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          </Field>
        </div>
        <Field label="عدد الزيارات"><input type="number" min={1} className={inputCls} value={f.sessions} onChange={set('sessions', true)} /></Field>
        <Field label="المدة (أشهر)"><input type="number" min={1} className={inputCls} value={f.months} onChange={set('months', true)} /></Field>
        <div className="col-span-2"><Field label="السعر (ر.س)"><input type="number" min={0} className={inputCls} value={f.price} onChange={set('price', true)} /></Field></div>
        <div className="col-span-2"><Field label="الوصف"><input className={inputCls} value={f.desc} onChange={set('desc')} /></Field></div>
        <Button type="submit" size="lg" className="col-span-2">حفظ الباقة</Button>
      </form>
    </Modal>
  );
}

// ── reviews moderation ───────────────────────────────────────────────────────
function Reviews({ s }) {
  const [doc, setDoc] = useState('');
  const list = s.reviews.filter((r) => !doc || r.doctorId === doc).slice(0, 60);
  return (
    <div>
      <select className={`${inputCls} mb-4 !w-auto`} value={doc} onChange={(e) => setDoc(e.target.value)}>
        <option value="">كل الأطباء</option>
        {s.doctors.map((d) => <option key={d.id} value={d.id}>{d.name} — {ratingOf(s, d.id).avg}★</option>)}
      </select>
      <Card className="!p-0">
        {list.length === 0 ? <Empty icon={Star} text="لا توجد تقييمات." /> : (
          <ul className="divide-y divide-line">
            {list.map((r) => (
              <li key={r.id} className={`flex flex-wrap items-start gap-3 p-4 ${r.hidden ? 'opacity-50' : ''}`}>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold">{r.name} <Stars value={r.rating} size="size-3.5" /> <span className="text-[11px] font-normal text-muted">عن {doctorById(s, r.doctorId)?.name} · {r.date}</span></p>
                  <p className="mt-1 text-sm text-ink-soft">{r.text}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => update((st) => { const x = st.reviews.find((y) => y.id === r.id); x.hidden = !x.hidden; return st; })}>
                  {r.hidden ? <><Eye className="size-3.5" /> إظهار</> : <><EyeOff className="size-3.5" /> إخفاء</>}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ── messages & reminder settings ─────────────────────────────────────────────
function Messages({ s }) {
  const st = s.settings;
  const set = (k, v) => update((x) => { x.settings[k] = v; return x; });
  const kinds = { confirm: 'تأكيد', reminder24: 'تذكير 24س', reminder2: 'تذكير ساعتين', cancel: 'إلغاء', moved: 'تأجيل', rx: 'روشتة', turn: 'دورك' };
  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit space-y-4">
        <h3 className="flex items-center gap-2 font-bold"><BellRing className="size-5 text-brand" /> إعدادات التذكير</h3>
        {[['reminder24', 'تذكير قبل الموعد بـ 24 ساعة (مع تأكيد/إلغاء)'], ['reminder2', 'تذكير قبل الموعد بساعتين']].map(([k, l]) => (
          <label key={k} className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium">
            {l}
            <input type="checkbox" checked={st[k]} onChange={(e) => set(k, e.target.checked)} className="size-5 accent-[var(--color-brand)]" />
          </label>
        ))}
        <Field label="القناة">
          <select className={inputCls} value={st.channel} onChange={(e) => set('channel', e.target.value)}>
            <option value="whatsapp">واتساب</option>
            <option value="sms">SMS</option>
          </select>
        </Field>
        <p className="rounded-xl bg-sand p-3 text-[11px] leading-5 text-muted">في النسخة الكاملة تُرسل الرسائل عبر WhatsApp Business API أو مزوّد SMS معتمد.</p>
      </Card>
      <Card className="!p-0">
        <h3 className="p-5 pb-2 font-bold">آخر الرسائل المرسلة ({s.messages.length})</h3>
        {s.messages.length === 0 ? <Empty icon={MessageCircle} text="لا توجد رسائل." /> : (
          <ul className="max-h-[560px] divide-y divide-line overflow-y-auto">
            {s.messages.slice(0, 80).map((m) => (
              <li key={m.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                <span className={`mt-0.5 rounded-lg px-2 py-0.5 text-[10px] font-bold ${m.channel === 'sms' ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700'}`}>{m.channel === 'sms' ? 'SMS' : 'واتساب'}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold">{m.to} <span className="font-normal text-muted">· {kinds[m.kind] || m.kind}</span></p>
                  <p className="text-ink-soft">{m.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

