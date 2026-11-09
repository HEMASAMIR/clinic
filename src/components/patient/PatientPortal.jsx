'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bell, CalendarDays, CalendarX2, FileHeart, FileText, Hourglass, MapPin, Package, Pill, Plus, Star, Stethoscope,
  Upload, UserPlus, Users, Video, X,
} from 'lucide-react';
import {
  MODES, PAY_METHODS, addDays, addReview, age, clinicById, doctorById, fmtDay, fmtLongDate, fmtTime, freeSlots,
  insurerById, money, parseYmd, positionIn, reschedule, setStatus, uid, update, usePlatform, ymd,
} from '@/lib/platform';
import { Avatar, Button, Card, Empty, Field, Modal, PageHead, Skeleton, Stars, StatusBadge, Tabs, inputCls } from '@/components/app/ui';
import RxDocument from '@/components/app/RxDocument';
import VideoRoom from '@/components/app/VideoRoom';

const TABS = [
  ['appts', 'مواعيدي', CalendarDays],
  ['record', 'الملف الطبي', FileHeart],
  ['rx', 'الروشتات', Pill],
  ['family', 'العائلة والباقات', Users],
  ['inbox', 'الإشعارات', Bell],
];

export default function PatientPortal() {
  const s = usePlatform();
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get('tab') || 'appts';
  const setTab = (t) => router.replace(`/patient?tab=${t}`, { scroll: false });

  if (!s) return <Skeleton />;
  const ids = new Set(s.family.members.map((m) => m.id));
  const myAppts = s.appts.filter((a) => ids.has(a.memberId));
  const unread = s.messages.filter((m) => myAppts.some((a) => a.id === m.apptId)).length;

  return (
    <div>
      <PageHead icon={Users} title={`أهلًا ${s.family.members[0].name.split(' ')[0]} 👋`} sub="حساب عائلي واحد — مواعيد وملفات طبية منفصلة لكل فرد" />
      <Tabs tabs={TABS.map((t) => (t[0] === 'inbox' ? [...t, unread] : t))} value={tab} onChange={setTab} />
      {tab === 'appts' && <Appointments s={s} appts={myAppts} highlight={params.get('appt')} />}
      {tab === 'record' && <Record s={s} />}
      {tab === 'rx' && <Prescriptions s={s} />}
      {tab === 'family' && <Family s={s} />}
      {tab === 'inbox' && <Inbox s={s} appts={myAppts} />}
    </div>
  );
}

// ── appointments + live queue ────────────────────────────────────────────────
function Appointments({ s, appts, highlight }) {
  const today = ymd(new Date());
  const [moving, setMoving] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [video, setVideo] = useState(null);
  const upcoming = appts.filter((a) => a.date >= today && ['booked', 'checked_in', 'in_consult'].includes(a.status)).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const past = appts.filter((a) => !upcoming.includes(a)).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const live = upcoming.filter((a) => a.date === today && a.mode === 'clinic');

  return (
    <div className="space-y-6">
      {live.map((a) => <LiveQueue key={a.id} s={s} appt={a} />)}

      <section>
        <h2 className="mb-3 font-bold">المواعيد القادمة</h2>
        {upcoming.length === 0 ? (
          <Card><Empty icon={CalendarDays} text="ما عندك مواعيد قادمة." action={<Link href="/doctors" className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white">احجز موعد</Link>} /></Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.map((a) => {
              const d = doctorById(s, a.doctorId);
              const c = clinicById(s, d.clinicId);
              return (
                <Card key={a.id} className={`rise ${highlight === a.id ? 'ring-2 ring-brand' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Avatar name={d.name} gender={d.gender} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-bold">{d.name}</p>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-xs text-muted">{d.specialty} · للمريض: {a.patientName.split(' ')[0]}</p>
                      <p className="mt-2 text-sm font-bold">{fmtLongDate(parseYmd(a.date))} — {fmtTime(a.time)}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                        {a.mode === 'online' ? <><Video className="size-3.5" /> استشارة فيديو</> : <><MapPin className="size-3.5" /> {c.name}، {c.area}</>}
                        {' · '}{PAY_METHODS[a.payment?.method] || ''}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {a.mode === 'online' && <Button size="sm" onClick={() => setVideo(a)}><Video className="size-3.5" /> ادخل غرفة الاستشارة</Button>}
                    {a.status === 'booked' && <Button size="sm" variant="ghost" onClick={() => setMoving(a)}><CalendarDays className="size-3.5" /> تغيير الموعد</Button>}
                    {a.status === 'booked' && (
                      <Button size="sm" variant="danger" onClick={() => window.confirm('إلغاء الموعد؟') && setStatus(a.id, 'cancelled')}>
                        <CalendarX2 className="size-3.5" /> إلغاء
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-bold">الزيارات السابقة</h2>
        <Card className="!p-0">
          {past.length === 0 ? <Empty icon={CalendarDays} text="لا توجد زيارات سابقة." /> : (
            <ul className="divide-y divide-line">
              {past.map((a) => {
                const d = doctorById(s, a.doctorId);
                const reviewed = s.reviews.some((r) => r.apptId === a.id);
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 p-4">
                    <Avatar name={d.name} gender={d.gender} className="size-10 text-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold">{d.name} <span className="font-normal text-muted">· {a.patientName.split(' ')[0]}</span></p>
                      <p className="text-xs text-muted">{fmtLongDate(parseYmd(a.date))} · {MODES[a.mode].short}</p>
                    </div>
                    <StatusBadge status={a.status} />
                    {a.status === 'done' && !reviewed && (
                      <Button size="sm" variant="gold" onClick={() => setReviewing(a)}><Star className="size-3.5" /> قيّم زيارتك</Button>
                    )}
                    {a.status === 'done' && reviewed && <span className="text-[11px] font-semibold text-emerald-600">✓ قيّمت الزيارة</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      {moving && <MoveDialog s={s} appt={moving} onClose={() => setMoving(null)} />}
      {reviewing && <ReviewDialog s={s} appt={reviewing} onClose={() => setReviewing(null)} />}
      {video && (
        <Modal title="استشارة فيديو" wide onClose={() => setVideo(null)}>
          <VideoRoom me={video.patientName.split(' ')[0]} other={doctorById(s, video.doctorId).name} otherGender={doctorById(s, video.doctorId).gender} onLeave={() => setVideo(null)} />
        </Modal>
      )}
    </div>
  );
}

function LiveQueue({ s, appt }) {
  const d = doctorById(s, appt.doctorId);
  const p = positionIn(s, appt);
  const progress = p.total ? Math.round((p.doneCount / p.total) * 100) : 0;
  const mine = appt.status === 'in_consult';
  return (
    <div className="rise relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-lift sm:p-8">
      <div className="drift pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-brand/40 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-bold">
          <span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" /></span>
          الدور المباشر — {d.name}
        </p>
        <span className="text-xs text-white/60">يتحدّث تلقائيًا · {appt.patientName}</span>
      </div>
      {mine ? (
        <div className="relative mt-6 text-center">
          <p className="text-3xl font-bold text-gold">🔔 جاء دورك! تفضّل بالدخول</p>
        </div>
      ) : (
        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="رقمك" value={p.no} big />
          <Stat label="عند الطبيب الآن" value={p.current ? p.current._no : '—'} />
          <Stat label="قدّامك" value={p.ahead} accent />
          <Stat label="انتظار تقريبي" value={`${p.wait} د`} />
        </div>
      )}
      <div className="relative mt-6">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-l from-gold to-brand transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-white/60">انتهى {p.doneCount} من {p.total} مريض اليوم · لا داعي تجي بدري، بنبلغك لما يقرب دورك</p>
      </div>
      {appt.status === 'booked' && (
        <div className="relative mt-5 flex flex-wrap gap-2">
          <Button variant="gold" onClick={() => setStatus(appt.id, 'checked_in')}><Hourglass className="size-4" /> وصلت العيادة — سجّل حضوري</Button>
        </div>
      )}
      {appt.status === 'checked_in' && <p className="relative mt-4 text-sm font-semibold text-emerald-300">✓ تم تسجيل وصولك، أنت في صالة الانتظار</p>}
    </div>
  );
}

function Stat({ label, value, big, accent }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ring-white/10 ${big ? 'bg-brand' : 'bg-white/5'}`}>
      <p className="text-[11px] text-white/60">{label}</p>
      <p className={`mt-1 font-bold tabular-nums ${big ? 'text-4xl' : 'text-3xl'} ${accent ? 'text-gold' : ''}`}>{value}</p>
    </div>
  );
}

function MoveDialog({ s, appt, onClose }) {
  const days = Array.from({ length: 14 }, (_, i) => ymd(addDays(new Date(), i)));
  const [date, setDate] = useState(days.find((k) => freeSlots(s, appt.doctorId, k, { ignoreId: appt.id }).length) || days[0]);
  const [error, setError] = useState('');
  const slots = freeSlots(s, appt.doctorId, date, { ignoreId: appt.id });
  return (
    <Modal title="تغيير الموعد" onClose={onClose}>
      <div className="no-scrollbar -mx-6 mb-4 flex gap-2 overflow-x-auto px-6">
        {days.map((k) => {
          const n = freeSlots(s, appt.doctorId, k, { ignoreId: appt.id }).length;
          return (
            <button key={k} type="button" disabled={!n} onClick={() => setDate(k)}
              className={`min-w-[62px] rounded-xl border px-2 py-2 text-center ${k === date ? 'border-brand bg-brand text-white' : n ? 'border-line' : 'border-line bg-sand text-muted/50'}`}>
              <span className="block text-[10px]">{fmtDay(parseYmd(k))}</span>
              <span className="block font-bold">{parseYmd(k).getDate()}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {slots.map((t) => (
          <button key={t} type="button" onClick={() => { try { reschedule(appt.id, date, t); onClose(); } catch (e) { setError(e.message); } }}
            className="rounded-lg bg-brand-soft py-2 text-xs font-bold text-brand-dark hover:bg-brand hover:text-white">
            {fmtTime(t)}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
    </Modal>
  );
}

function ReviewDialog({ s, appt, onClose }) {
  const d = doctorById(s, appt.doctorId);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  return (
    <Modal title={`قيّم زيارتك مع ${d.name}`} onClose={onClose}>
      <div className="text-center">
        <Stars value={rating} size="size-9" onChange={setRating} />
        <p className="mt-2 text-xs text-muted">تقييمك يظهر بعلامة «زيارة موثّقة» لأنك حضرت الكشف فعلًا</p>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={300} placeholder="شاركنا تجربتك (اختياري)"
        className={`${inputCls} mt-4 resize-none`} />
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      <Button className="mt-4 w-full" size="lg" onClick={() => { try { addReview({ apptId: appt.id, rating, text: text.trim() || 'تجربة ممتازة.' }); onClose(); } catch (e) { setError(e.message); } }}>
        إرسال التقييم
      </Button>
    </Modal>
  );
}

// ── medical record ───────────────────────────────────────────────────────────
function MemberPicker({ s, value, onChange }) {
  return (
    <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
      {s.family.members.map((m) => (
        <button key={m.id} type="button" onClick={() => onChange(m.id)}
          className={`flex shrink-0 items-center gap-2 rounded-2xl border p-2 pl-4 transition ${value === m.id ? 'border-brand bg-white shadow-soft' : 'border-transparent bg-white/60'}`}>
          <Avatar name={m.name} gender={m.gender} className="size-9 text-sm" />
          <span className="text-right">
            <span className="block text-sm font-bold">{m.name.split(' ')[0]}</span>
            <span className="block text-[10px] text-muted">{m.relation} · {age(m.birth)} سنة</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function ChipEditor({ items, onChange, placeholder, tone }) {
  const [v, setV] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-xs text-muted">لا يوجد</span>}
        {items.map((x) => (
          <span key={x} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${tone}`}>
            {x}
            <button type="button" onClick={() => onChange(items.filter((y) => y !== x))} aria-label={`حذف ${x}`}><X className="size-3" /></button>
          </span>
        ))}
      </div>
      <form className="mt-2 flex gap-1.5" onSubmit={(e) => { e.preventDefault(); if (v.trim() && !items.includes(v.trim())) onChange([...items, v.trim()]); setV(''); }}>
        <input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} className={`${inputCls} !py-1.5 text-xs`} maxLength={40} />
        <Button type="submit" size="sm" variant="soft"><Plus className="size-3.5" /></Button>
      </form>
    </div>
  );
}

function Record({ s }) {
  const [mid, setMid] = useState(s.family.members[0].id);
  const [err, setErr] = useState('');
  const m = s.family.members.find((x) => x.id === mid);
  const visits = s.appts.filter((a) => a.memberId === mid && a.status === 'done').sort((a, b) => b.date.localeCompare(a.date));
  const ins = m.insurance && insurerById(s, m.insurance.insurerId);
  const setField = (k, v) => update((st) => { st.family.members.find((x) => x.id === mid)[k] = v; return st; });

  const upload = (e) => {
    setErr('');
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const meta = { id: uid('f'), name: file.name, type: file.type, size: file.size, date: ymd(new Date()), kind: /pdf/.test(file.type) ? 'تقرير / تحليل' : /image/.test(file.type) ? 'أشعة / صورة' : 'ملف' };
    const save = (dataUrl) => {
      const ok = update((st) => { st.family.members.find((x) => x.id === mid).files.unshift({ ...meta, dataUrl }); return st; });
      if (!ok) {
        update((st) => { const f = st.family.members.find((x) => x.id === mid).files; f[0].dataUrl = null; return st; });
        setErr('مساحة التجربة في المتصفح امتلأت — حُفظ اسم الملف فقط.');
      }
    };
    if (file.size > 900 * 1024) {
      save(null);
      setErr('الملف كبير على نسخة التجربة (أقصى 900KB) — حُفظ اسمه فقط. في النسخة الكاملة يُرفع للسيرفر بأي حجم.');
      return;
    }
    const r = new FileReader();
    r.onload = () => save(r.result);
    r.readAsDataURL(file);
  };

  return (
    <div>
      <MemberPicker s={s} value={mid} onChange={setMid} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rise">
          <h3 className="mb-4 font-bold">البيانات الأساسية</h3>
          <dl className="space-y-2.5 text-sm">
            {[['الاسم', m.name], ['العمر', `${age(m.birth)} سنة`], ['فصيلة الدم', m.blood], ['الجوال', m.phone]].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-muted">{k}</dt><dd className="font-bold" dir={k === 'الجوال' || k === 'فصيلة الدم' ? 'ltr' : undefined}>{v}</dd></div>
            ))}
          </dl>
          <div className={`mt-4 rounded-2xl p-3 text-xs ${ins ? 'bg-sky-50 text-sky-800' : 'bg-sand text-muted'}`}>
            {ins ? <>🛡️ <b>{ins.name}</b> — فئة {m.insurance.class}<br /><span dir="ltr">{m.insurance.memberNo}</span> · تغطية {ins.coverage}%</> : 'لا يوجد تأمين طبي مسجّل'}
          </div>
        </Card>
        <Card className="rise rise-2 space-y-5">
          <div>
            <h3 className="mb-2 text-sm font-bold text-rose-600">⚠ الحساسية</h3>
            <ChipEditor items={m.allergies} onChange={(v) => setField('allergies', v)} placeholder="أضف حساسية (دواء / أكل)" tone="bg-rose-50 text-rose-700" />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold">الأمراض المزمنة</h3>
            <ChipEditor items={m.chronic} onChange={(v) => setField('chronic', v)} placeholder="مثال: ضغط الدم" tone="bg-amber-50 text-amber-800" />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold">الأدوية الحالية</h3>
            <ChipEditor items={m.meds} onChange={(v) => setField('meds', v)} placeholder="اسم الدواء" tone="bg-brand-soft text-brand-dark" />
          </div>
        </Card>
        <Card className="rise rise-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">التحاليل والأشعة</h3>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white hover:bg-brand-dark">
              <Upload className="size-3.5" /> رفع ملف
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={upload} />
            </label>
          </div>
          {err && <p className="mb-3 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">{err}</p>}
          {m.files.length === 0 ? <Empty icon={FileText} text="ارفع تحاليلك وأشعتك عشان يشوفها طبيبك." /> : (
            <ul className="space-y-2">
              {m.files.map((f) => (
                <li key={f.id} className="flex items-center gap-3 rounded-xl bg-sand p-2.5">
                  <span className="grid size-9 place-items-center rounded-lg bg-white text-brand"><FileText className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold" dir="auto">{f.name}</p>
                    <p className="text-[10px] text-muted">{f.kind} · {Math.ceil(f.size / 1024)}KB · {f.date}</p>
                  </div>
                  {f.dataUrl && <a href={f.dataUrl} download={f.name} className="text-xs font-bold text-brand">فتح</a>}
                  <button type="button" aria-label="حذف" onClick={() => setField('files', m.files.filter((x) => x.id !== f.id))} className="text-muted hover:text-rose-600"><X className="size-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <Card className="rise mt-4">
        <h3 className="mb-4 font-bold">التاريخ المرضي (الزيارات)</h3>
        {visits.length === 0 ? <Empty icon={Stethoscope} text="لا توجد زيارات بعد." /> : (
          <ol className="relative space-y-4 border-r-2 border-brand/20 pr-5">
            {visits.map((a) => {
              const d = doctorById(s, a.doctorId);
              const rx = s.prescriptions.find((x) => x.apptId === a.id);
              return (
                <li key={a.id} className="relative">
                  <span className="absolute -right-[27px] top-1 size-3 rounded-full border-2 border-white bg-brand" />
                  <p className="text-xs text-muted">{fmtLongDate(parseYmd(a.date))}</p>
                  <p className="font-bold">{d.name} <span className="text-sm font-normal text-muted">· {d.specialty}</span></p>
                  {rx && <p className="mt-1 text-sm text-ink-soft">التشخيص: {rx.diagnosis} · {rx.items.length} أدوية</p>}
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}

// ── prescriptions ────────────────────────────────────────────────────────────
function Prescriptions({ s }) {
  const [open, setOpen] = useState(null);
  const ids = new Set(s.family.members.map((m) => m.id));
  const list = s.prescriptions.filter((x) => ids.has(x.memberId));
  return (
    <div>
      {list.length === 0 ? <Card><Empty icon={Pill} text="لا توجد روشتات بعد." /></Card> : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((rx, i) => {
            const d = doctorById(s, rx.doctorId);
            const m = s.family.members.find((x) => x.id === rx.memberId);
            return (
              <button key={rx.id} type="button" onClick={() => setOpen(rx)} style={{ animationDelay: `${i * 60}ms` }}
                className="spot rise rounded-3xl border border-line bg-white p-5 text-right shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-2xl bg-brand-soft text-sm font-bold italic text-brand" dir="ltr">Rx</span>
                  <span className="text-xs text-muted">{fmtLongDate(parseYmd(rx.date))}</span>
                </div>
                <p className="mt-3 font-bold">{rx.diagnosis}</p>
                <p className="text-xs text-muted">{d.name} · للمريض {m?.name.split(' ')[0]}</p>
                <p className="mt-2 truncate text-xs text-ink-soft" dir="ltr" style={{ textAlign: 'right' }}>{rx.items.map((x) => x.drug).join(' · ')}</p>
                <p className="mt-3 text-xs font-bold text-brand">عرض / تحميل PDF ←</p>
              </button>
            );
          })}
        </div>
      )}
      {open && <Modal title="الروشتة الإلكترونية" wide onClose={() => setOpen(null)}><RxDocument s={s} rx={open} /></Modal>}
    </div>
  );
}

// ── family & packages ────────────────────────────────────────────────────────
function Family({ s }) {
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(null);
  const subs = s.subscriptions.filter((x) => s.family.members.some((m) => m.id === x.memberId));
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">أفراد العائلة</h2>
          <Button size="sm" onClick={() => setAdding(true)}><UserPlus className="size-3.5" /> إضافة فرد</Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {s.family.members.map((m, i) => {
            const ins = m.insurance && insurerById(s, m.insurance.insurerId);
            return (
              <Card key={m.id} className="rise text-center" style={{ animationDelay: `${i * 60}ms` }}>
                <Avatar name={m.name} gender={m.gender} className="mx-auto size-16 text-2xl" />
                <p className="mt-3 font-bold">{m.name}</p>
                <p className="text-xs text-muted">{m.relation} · {age(m.birth)} سنة · <bdi dir="ltr">{m.blood}</bdi></p>
                <p className={`mt-3 rounded-xl px-2 py-1.5 text-[11px] font-semibold ${ins ? 'bg-sky-50 text-sky-700' : 'bg-sand text-muted'}`}>{ins ? `🛡️ ${ins.name}` : 'بدون تأمين'}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-bold">باقاتي</h2>
        {subs.length === 0 ? <Card><Empty icon={Package} text="ما عندك باقات." /></Card> : (
          <div className="grid gap-3 md:grid-cols-2">
            {subs.map((x) => {
              const p = s.packages.find((y) => y.id === x.packageId);
              const m = s.family.members.find((y) => y.id === x.memberId);
              const d = doctorById(s, p.doctorId);
              return (
                <Card key={x.id} className="rise">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{p.name}</p>
                    <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-bold text-gold">{p.sessions - x.used} زيارات متبقية</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{m.name.split(' ')[0]} · {d.name}</p>
                  <div className="mt-4 flex gap-1">
                    {Array.from({ length: p.sessions }, (_, k) => (
                      <span key={k} className={`h-2 flex-1 rounded-full ${k < x.used ? 'bg-brand' : 'bg-sand-deep'}`} />
                    ))}
                  </div>
                  <Link href={`/doctors/${d.id}`} className="mt-4 block text-xs font-bold text-brand">احجز الزيارة القادمة من الباقة ←</Link>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-bold">باقات متاحة</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {s.packages.map((p) => {
            const d = doctorById(s, p.doctorId);
            return (
              <Card key={p.id} className="spot rise flex flex-col">
                <Package className="size-6 text-gold" />
                <p className="mt-3 font-bold">{p.name}</p>
                <p className="mt-1 flex-1 text-xs leading-6 text-muted">{p.desc} · {d.name}</p>
                <p className="mt-3 text-xl font-bold text-gold">{money(p.price)}</p>
                <p className="text-[11px] text-muted">أو {money(p.price / 4)} × 4 مع تابي</p>
                <Button variant="gold" size="sm" className="mt-3" onClick={() => setBuying(p)}>اشترك</Button>
              </Card>
            );
          })}
        </div>
      </section>

      {adding && <AddMember onClose={() => setAdding(false)} s={s} />}
      {buying && <BuyPackage s={s} p={buying} onClose={() => setBuying(null)} />}
    </div>
  );
}

function AddMember({ s, onClose }) {
  const [f, setF] = useState({ name: '', relation: 'الابن', gender: 'm', birth: '2015-01-01', blood: 'O+', phone: '', insurerId: '' });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const save = (e) => {
    e.preventDefault();
    if (f.name.trim().length < 2) return;
    update((st) => {
      st.family.members.push({
        id: uid('m'), name: f.name.trim(), relation: f.relation, gender: f.gender, birth: f.birth, blood: f.blood,
        phone: f.phone || st.family.members[0].phone, allergies: [], chronic: [], meds: [], files: [],
        insurance: f.insurerId ? { insurerId: f.insurerId, memberNo: `INS-${Math.floor(Math.random() * 1e6)}`, class: 'A' } : null,
      });
      return st;
    });
    onClose();
  };
  return (
    <Modal title="إضافة فرد للعائلة" onClose={onClose}>
      <form onSubmit={save} className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><Field label="الاسم الكامل"><input required className={inputCls} value={f.name} onChange={set('name')} maxLength={50} /></Field></div>
        <Field label="صلة القرابة">
          <select className={inputCls} value={f.relation} onChange={set('relation')}>
            {['الابن', 'الابنة', 'الزوج', 'الزوجة', 'الوالد', 'الوالدة', 'أخرى'].map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="الجنس">
          <select className={inputCls} value={f.gender} onChange={set('gender')}><option value="m">ذكر</option><option value="f">أنثى</option></select>
        </Field>
        <Field label="تاريخ الميلاد"><input type="date" className={inputCls} value={f.birth} onChange={set('birth')} /></Field>
        <Field label="فصيلة الدم">
          <select className={inputCls} value={f.blood} onChange={set('blood')}>{['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((x) => <option key={x}>{x}</option>)}</select>
        </Field>
        <div className="col-span-2">
          <Field label="التأمين الطبي">
            <select className={inputCls} value={f.insurerId} onChange={set('insurerId')}>
              <option value="">بدون تأمين</option>
              {s.insurers.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </Field>
        </div>
        <Button type="submit" size="lg" className="col-span-2">إضافة</Button>
      </form>
    </Modal>
  );
}

function BuyPackage({ s, p, onClose }) {
  const [mid, setMid] = useState(s.family.members[0].id);
  const [method, setMethod] = useState('mada');
  const [done, setDone] = useState(false);
  const buy = () => {
    update((st) => { st.subscriptions.push({ id: uid('s'), packageId: p.id, memberId: mid, used: 0, start: ymd(new Date()), method }); return st; });
    setDone(true);
  };
  return (
    <Modal title={`اشتراك: ${p.name}`} onClose={onClose}>
      {done ? (
        <div className="py-6 text-center">
          <p className="text-4xl">🎉</p>
          <p className="mt-3 font-bold">تم الاشتراك بنجاح</p>
          <p className="mt-1 text-sm text-muted">احجز زياراتك من صفحة الطبيب، وتُخصم من الباقة تلقائيًا.</p>
          <Link href={`/doctors/${p.doctorId}`} className="mt-5 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">احجز أول زيارة</Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="rounded-2xl bg-gold-soft p-4 text-sm">{p.desc} — <b>{money(p.price)}</b> ({p.sessions} زيارات خلال {p.months} أشهر)</p>
          <Field label="لمن الباقة؟">
            <select className={inputCls} value={mid} onChange={(e) => setMid(e.target.value)}>
              {s.family.members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>)}
            </select>
          </Field>
          <Field label="طريقة الدفع">
            <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>
              {['mada', 'applepay', 'stcpay', 'tabby', 'tamara'].map((k) => <option key={k} value={k}>{PAY_METHODS[k]}</option>)}
            </select>
          </Field>
          <Button size="lg" variant="gold" className="w-full" onClick={buy}>ادفع واشترك</Button>
        </div>
      )}
    </Modal>
  );
}

// ── notifications ────────────────────────────────────────────────────────────
function Inbox({ s, appts }) {
  const ids = new Set(appts.map((a) => a.id));
  const list = s.messages.filter((m) => ids.has(m.apptId));
  const icon = { confirm: '✅', reminder24: '⏰', reminder2: '⏰', cancel: '❌', moved: '📅', rx: '💊', turn: '🔔' };
  return (
    <Card className="mx-auto max-w-2xl !p-0 overflow-hidden">
      <div className="flex items-center gap-3 bg-[#075e54] px-5 py-3 text-white">
        <Bell className="size-5" />
        <div>
          <p className="text-sm font-bold">رسائل واتساب و SMS</p>
          <p className="text-[11px] text-white/70">كل اللي وصل للعائلة من العيادات</p>
        </div>
      </div>
      <div className="space-y-2 p-4" style={{ background: '#efeae2' }}>
        {list.length === 0 && <p className="py-8 text-center text-sm text-muted">لا توجد رسائل.</p>}
        {list.map((m) => (
          <div key={m.id} className="rise max-w-[90%] rounded-2xl rounded-tr-sm bg-white px-3 py-2 text-sm shadow-sm">
            <p className="leading-6">{icon[m.kind] || '💬'} {m.text}</p>
            <p className="mt-1 text-left text-[10px] text-slate-500">{new Date(m.at).toLocaleString('ar-SA-u-nu-latn', { dateStyle: 'short', timeStyle: 'short' })}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
