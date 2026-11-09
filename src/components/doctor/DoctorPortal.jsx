'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle, BellRing, CalendarCog, CalendarOff, ChevronLeft, ClipboardList, FileText, Pill, Plus, Save,
  Stethoscope, Trash2, UserRound, Video, X, Zap,
} from 'lucide-react';
import {
  DAY_NAMES, DRUGS, MODES, addDays, addPrescription, age, callNext, doctorById, fmtLongDate, fmtTime, freeSlots,
  memberById, parseYmd, queueOf, setStatus, update, usePlatform, ymd,
} from '@/lib/platform';
import { Avatar, Button, Card, Empty, Field, Modal, PageHead, Skeleton, StatusBadge, Tabs, inputCls } from '@/components/app/ui';
import RxDocument from '@/components/app/RxDocument';
import VideoRoom from '@/components/app/VideoRoom';

const TABS = [
  ['queue', 'مرضى اليوم', ClipboardList],
  ['schedule', 'المواعيد والإجازات', CalendarCog],
  ['video', 'استشارات الفيديو', Video],
];

export default function DoctorPortal() {
  const s = usePlatform();
  const [docId, setDocId] = useState('d6');
  const [tab, setTab] = useState('queue');
  if (!s) return <Skeleton />;
  const d = doctorById(s, docId);
  return (
    <div>
      <div className="no-scrollbar mb-5 flex items-center gap-2 overflow-x-auto">
        <span className="shrink-0 text-xs font-bold text-muted">دخول كـ:</span>
        {s.doctors.map((x) => (
          <button key={x.id} type="button" onClick={() => setDocId(x.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border py-1 pl-3 pr-1 text-xs font-bold transition ${docId === x.id ? 'border-brand bg-white shadow-soft' : 'border-transparent bg-white/60 text-ink-soft'}`}>
            <Avatar name={x.name} gender={x.gender} className="size-7 text-[11px]" /> {x.name}
          </button>
        ))}
      </div>
      <PageHead icon={Stethoscope} title={d.name} sub={`${d.title} · ${fmtLongDate(new Date())}`} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'queue' && <TodayQueue key={docId} s={s} d={d} />}
      {tab === 'schedule' && <Availability key={docId} s={s} d={d} />}
      {tab === 'video' && <VideoList s={s} d={d} />}
    </div>
  );
}

// ── today's queue + patient chart ────────────────────────────────────────────
function TodayQueue({ s, d }) {
  const q = queueOf(s, d.id);
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState('');
  const selected = q.list.find((a) => a.id === (openId || q.current?.id)) || null;

  const next = () => {
    const called = callNext(d.id);
    setOpenId(called?.id || null);
    setToast(called ? `🔔 تم استدعاء ${called.patientName} — ظهر الاسم على شاشة الانتظار ووصله إشعار` : 'لا يوجد مرضى في الانتظار');
    setTimeout(() => setToast(''), 3500);
  };

  const groups = [
    ['عند الطبيب', q.current ? [q.current] : []],
    ['في صالة الانتظار', q.waiting],
    ['لم يصلوا بعد', q.upcoming],
    ['انتهى', q.done],
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <Card className="!p-4">
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            {[['الكل', q.list.length], ['ينتظر', q.waiting.length], ['انتهى', q.done.length]].map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-sand py-2"><p className="text-xl font-bold tabular-nums">{v}</p><p className="text-[10px] text-muted">{l}</p></div>
            ))}
          </div>
          <Button size="lg" className="w-full" onClick={next}><BellRing className="size-5" /> استدعاء المريض التالي</Button>
          {toast && <p className="rise mt-3 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800">{toast}</p>}
        </Card>
        <Card className="!p-2">
          {q.list.length === 0 && <Empty icon={ClipboardList} text="لا يوجد مرضى اليوم." />}
          {groups.map(([label, list]) => list.length > 0 && (
            <div key={label} className="mb-2">
              <p className="px-3 pb-1 pt-2 text-[11px] font-bold text-muted">{label}</p>
              {list.map((a) => (
                <button key={a.id} type="button" onClick={() => setOpenId(a.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-right transition ${selected?.id === a.id ? 'bg-brand-soft' : 'hover:bg-sand'}`}>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold tabular-nums ${a.status === 'in_consult' ? 'bg-brand text-white' : 'bg-sand'}`}>{a._no}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{a.patientName}</span>
                    <span className="block text-[11px] text-muted">{fmtTime(a.time)}{a.source === 'walkin' ? ' · بدون حجز' : ''}{a.memberId ? ' · له ملف طبي' : ''}</span>
                  </span>
                  <StatusBadge status={a.status} />
                </button>
              ))}
            </div>
          ))}
        </Card>
      </div>
      <div>{selected ? <Chart key={selected.id} s={s} d={d} appt={selected} /> : <Card><Empty icon={UserRound} text="اختر مريض أو اضغط «استدعاء التالي»." /></Card>}</div>
    </div>
  );
}

function Chart({ s, d, appt }) {
  const m = appt.memberId ? memberById(s, appt.memberId) : null;
  const history = s.appts
    .filter((a) => a.id !== appt.id && a.status === 'done' && (m ? a.memberId === m.id : a.phone === appt.phone))
    .sort((a, b) => b.date.localeCompare(a.date));
  const rxs = s.prescriptions.filter((x) => (m ? x.memberId === m.id : history.some((h) => h.id === x.apptId)));
  const [writing, setWriting] = useState(false);
  const [showRx, setShowRx] = useState(null);

  return (
    <div className="rise space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={appt.patientName} gender={m?.gender} className="size-14 text-xl" />
          <div className="flex-1">
            <p className="text-lg font-bold">{appt.patientName}</p>
            <p className="text-xs text-muted">
              {m ? `${m.gender === 'f' ? 'أنثى' : 'ذكر'} · ${age(m.birth)} سنة · فصيلة ‎${m.blood}‎` : 'مريض بدون ملف طبي في موعِد'} · <span dir="ltr">{appt.phone}</span>
            </p>
          </div>
          <StatusBadge status={appt.status} />
        </div>
        {m?.allergies?.length > 0 && (
          <p className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
            <AlertTriangle className="size-5" /> حساسية: {m.allergies.join('، ')}
          </p>
        )}
        {m && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-amber-50 p-3 text-sm"><p className="mb-1 text-xs font-bold text-amber-800">أمراض مزمنة</p>{m.chronic.join('، ') || 'لا يوجد'}</div>
            <div className="rounded-2xl bg-brand-soft p-3 text-sm"><p className="mb-1 text-xs font-bold text-brand-dark">أدوية حالية</p><span dir="ltr">{m.meds.join(' · ') || '—'}</span></div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {appt.status === 'checked_in' && <Button onClick={() => setStatus(appt.id, 'in_consult')}>إدخال المريض</Button>}
          {appt.status === 'in_consult' && (
            <>
              <Button onClick={() => setWriting(true)}><Pill className="size-4" /> كتابة روشتة</Button>
              <Button variant="dark" onClick={() => setStatus(appt.id, 'done')}>إنهاء الكشف</Button>
            </>
          )}
          {appt.status === 'booked' && <Button variant="danger" onClick={() => setStatus(appt.id, 'no_show')}>لم يحضر</Button>}
          {appt.status === 'done' && <Button variant="soft" onClick={() => setWriting(true)}><Pill className="size-4" /> روشتة إضافية</Button>}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-bold">سجل الزيارات</h3>
          {history.length === 0 ? <p className="text-sm text-muted">أول زيارة للمريض.</p> : (
            <ol className="relative space-y-3 border-r-2 border-brand/20 pr-4">
              {history.slice(0, 6).map((h) => {
                const hd = doctorById(s, h.doctorId);
                const rx = s.prescriptions.find((x) => x.apptId === h.id);
                return (
                  <li key={h.id} className="relative">
                    <span className="absolute -right-[23px] top-1.5 size-2.5 rounded-full bg-brand" />
                    <p className="text-xs text-muted">{fmtLongDate(parseYmd(h.date))}</p>
                    <p className="text-sm font-bold">{hd.name} · {hd.specialty}</p>
                    {rx && <p className="text-xs text-ink-soft">{rx.diagnosis}</p>}
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">الروشتات والملفات</h3>
          <div className="space-y-2">
            {rxs.map((rx) => (
              <button key={rx.id} type="button" onClick={() => setShowRx(rx)} className="flex w-full items-center gap-2 rounded-xl bg-sand p-2.5 text-right text-sm hover:bg-sand-deep">
                <Pill className="size-4 text-brand" /> <span className="flex-1 truncate">{rx.diagnosis}</span> <span className="text-[11px] text-muted">{rx.date}</span>
              </button>
            ))}
            {m?.files.map((f) => (
              <a key={f.id} href={f.dataUrl || undefined} download={f.name} className="flex items-center gap-2 rounded-xl bg-sand p-2.5 text-sm">
                <FileText className="size-4 text-sky-600" /> <span className="flex-1 truncate" dir="auto">{f.name}</span> <span className="text-[11px] text-muted">{f.kind}</span>
              </a>
            ))}
            {rxs.length === 0 && !m?.files.length && <p className="text-sm text-muted">لا يوجد.</p>}
          </div>
        </Card>
      </div>

      {writing && <RxComposer s={s} d={d} appt={appt} member={m} onClose={() => setWriting(false)} onSaved={(rx) => { setWriting(false); setShowRx(rx); }} />}
      {showRx && <Modal title="الروشتة" wide onClose={() => setShowRx(null)}><RxDocument s={s} rx={showRx} patientName={appt.patientName} /></Modal>}
    </div>
  );
}

const PENICILLINS = /augmentin|amoxil|amoxicillin|penicillin/i;

function RxComposer({ s, d, appt, member, onClose, onSaved }) {
  const [dx, setDx] = useState('');
  const [items, setItems] = useState([]);
  const [drug, setDrug] = useState('');
  const [dose, setDose] = useState('');
  const [duration, setDuration] = useState('5 أيام');
  const [notes, setNotes] = useState('');
  const [focus, setFocus] = useState(false);

  const suggestions = useMemo(() => {
    const q = drug.trim().toLowerCase();
    if (!q) return DRUGS.slice(0, 6);
    return DRUGS.filter(([n]) => n.toLowerCase().includes(q)).slice(0, 6);
  }, [drug]);

  const allergic = member?.allergies?.some((a) => /بنسلين|البنسلين|penicillin/i.test(a)) && PENICILLINS.test(drug);

  const add = () => {
    if (!drug.trim()) return;
    setItems((x) => [...x, { drug: drug.trim(), dose: dose.trim() || 'حسب الإرشادات', duration: duration.trim() }]);
    setDrug('');
    setDose('');
  };

  const save = () => {
    if (!dx.trim() || items.length === 0) return;
    const id = addPrescription({ apptId: appt.id, doctorId: d.id, memberId: member?.id || null, diagnosis: dx.trim(), items, notes: notes.trim() });
    onSaved({ id, apptId: appt.id, doctorId: d.id, memberId: member?.id || null, date: ymd(new Date()), diagnosis: dx.trim(), items, notes: notes.trim() });
  };

  return (
    <Modal title={`روشتة جديدة — ${appt.patientName}`} wide onClose={onClose}>
      <div className="space-y-4">
        <Field label="التشخيص"><input className={inputCls} value={dx} onChange={(e) => setDx(e.target.value)} placeholder="مثال: التهاب لوزتين بكتيري" maxLength={100} /></Field>
        <div className="rounded-2xl border border-line p-4">
          <div className="grid gap-2 sm:grid-cols-[1.3fr_1fr_0.7fr_auto]">
            <div className="relative">
              <input dir="ltr" className={`${inputCls} text-right`} value={drug} placeholder="اسم الدواء…" onChange={(e) => setDrug(e.target.value)}
                onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} />
              {focus && suggestions.length > 0 && (
                <ul className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-line bg-white shadow-lift">
                  {suggestions.map(([n, form, def]) => (
                    <li key={n}>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setDrug(n); setDose(def); setFocus(false); }}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-right text-sm hover:bg-brand-soft">
                        <span dir="ltr" className="font-semibold">{n}</span><span className="text-[11px] text-muted">{form}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input className={inputCls} value={dose} onChange={(e) => setDose(e.target.value)} placeholder="الجرعة" />
            <input className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="المدة" />
            <Button onClick={add} disabled={!drug.trim()}><Plus className="size-4" /> إضافة</Button>
          </div>
          {allergic && (
            <p className="rise mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
              <AlertTriangle className="size-5" /> تنبيه: المريض عنده حساسية من البنسلين وهذا الدواء من عائلته!
            </p>
          )}
          <ul className="mt-3 space-y-2">
            {items.map((it, i) => (
              <li key={i} className="rise flex items-center gap-3 rounded-xl bg-sand p-2.5 text-sm">
                <span className="grid size-6 place-items-center rounded-md bg-brand text-[11px] font-bold text-white">{i + 1}</span>
                <span className="flex-1"><b dir="ltr">{it.drug}</b> — {it.dose} — {it.duration}</span>
                <button type="button" aria-label="حذف" onClick={() => setItems((x) => x.filter((_, k) => k !== i))}><X className="size-4 text-muted hover:text-rose-600" /></button>
              </li>
            ))}
          </ul>
        </div>
        <Field label="ملاحظات وتعليمات"><textarea rows={2} className={`${inputCls} resize-none`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثال: راحة وشرب سوائل، مراجعة بعد أسبوع" /></Field>
        <Button size="lg" className="w-full" onClick={save} disabled={!dx.trim() || items.length === 0}><Save className="size-4" /> حفظ وإصدار الروشتة (QR + واتساب)</Button>
      </div>
    </Modal>
  );
}

// ── availability ─────────────────────────────────────────────────────────────
function Availability({ s, d }) {
  const [blockDate, setBlockDate] = useState(ymd(addDays(new Date(), 1)));
  const [extra, setExtra] = useState({ date: ymd(new Date()), time: '21:00' });
  const edit = (fn) => update((st) => { fn(st.doctors.find((x) => x.id === d.id)); return st; });
  const week = Array.from({ length: 7 }, (_, i) => ymd(addDays(new Date(), i)));
  const times = Array.from({ length: 33 }, (_, i) => `${String(6 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold">ساعات العمل الأسبوعية</h3>
          <label className="flex items-center gap-2 text-xs font-bold">
            مدة الكشف
            <select className={`${inputCls} !w-auto !py-1.5`} value={d.slot} onChange={(e) => edit((x) => (x.slot = Number(e.target.value)))}>
              {[10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} دقيقة</option>)}
            </select>
          </label>
        </div>
        <ul className="space-y-2">
          {DAY_NAMES.map((name, i) => {
            const h = d.schedule[i];
            return (
              <li key={name} className={`flex flex-wrap items-center gap-3 rounded-2xl p-3 ${h ? 'bg-brand-soft/50' : 'bg-sand'}`}>
                <label className="flex w-28 items-center gap-2 text-sm font-bold">
                  <input type="checkbox" className="size-4 accent-[var(--color-brand)]" checked={!!h} onChange={(e) => edit((x) => (x.schedule[i] = e.target.checked ? ['09:00', '17:00'] : null))} />
                  {name}
                </label>
                {h ? (
                  <div className="flex items-center gap-2 text-sm">
                    <select className={`${inputCls} !w-auto !py-1.5`} value={h[0]} onChange={(e) => edit((x) => (x.schedule[i] = [e.target.value, x.schedule[i][1]]))}>
                      {times.map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}
                    </select>
                    <ChevronLeft className="size-4 text-muted" />
                    <select className={`${inputCls} !w-auto !py-1.5`} value={h[1]} onChange={(e) => edit((x) => (x.schedule[i] = [x.schedule[i][0], e.target.value]))}>
                      {times.map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}
                    </select>
                  </div>
                ) : <span className="text-sm text-muted">إجازة</span>}
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="space-y-5">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-bold"><CalendarOff className="size-5 text-rose-500" /> إغلاق يوم معيّن</h3>
          <div className="flex gap-2">
            <input type="date" className={inputCls} value={blockDate} min={ymd(new Date())} onChange={(e) => setBlockDate(e.target.value)} />
            <Button variant="danger" onClick={() => edit((x) => !x.blocked.includes(blockDate) && x.blocked.push(blockDate))}>إغلاق</Button>
          </div>
          <p className="mt-2 text-[11px] text-muted">لو فيه مرضى محجوزين، استخدم «الإلغاء الجماعي» من الاستقبال عشان يوصلهم اعتذار وموعد بديل.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {d.blocked.map((b) => (
              <span key={b} className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                {fmtLongDate(parseYmd(b))}
                <button type="button" aria-label="فتح اليوم" onClick={() => edit((x) => (x.blocked = x.blocked.filter((y) => y !== b)))}><X className="size-3" /></button>
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-bold"><Zap className="size-5 text-gold" /> فتح خانة طوارئ</h3>
          <div className="flex gap-2">
            <input type="date" className={inputCls} value={extra.date} min={ymd(new Date())} onChange={(e) => setExtra((x) => ({ ...x, date: e.target.value }))} />
            <select className={`${inputCls} !w-auto`} value={extra.time} onChange={(e) => setExtra((x) => ({ ...x, time: e.target.value }))}>
              {times.concat(['22:00', '22:30', '23:00']).map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}
            </select>
            <Button variant="gold" onClick={() => edit((x) => !x.extra.some((e) => e.date === extra.date && e.time === extra.time) && x.extra.push({ ...extra }))}><Plus className="size-4" /></Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {d.extra.map((e) => (
              <span key={`${e.date}${e.time}`} className="flex items-center gap-1 rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-gold">
                {e.date} · {fmtTime(e.time)}
                <button type="button" aria-label="حذف" onClick={() => edit((x) => (x.extra = x.extra.filter((y) => !(y.date === e.date && y.time === e.time))))}><Trash2 className="size-3" /></button>
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">الأيام السبعة القادمة</h3>
          <ul className="space-y-1.5 text-sm">
            {week.map((k) => {
              const free = freeSlots(s, d.id, k).length;
              const booked = s.appts.filter((a) => a.doctorId === d.id && a.date === k && a.status !== 'cancelled').length;
              const blocked = d.blocked.includes(k);
              return (
                <li key={k} className="flex items-center justify-between rounded-xl bg-sand px-3 py-2">
                  <span className="font-semibold">{fmtLongDate(parseYmd(k))}</span>
                  <span className={`text-xs font-bold ${blocked ? 'text-rose-600' : 'text-muted'}`}>{blocked ? 'مغلق' : `${booked} محجوز · ${free} متاح`}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ── video consults ───────────────────────────────────────────────────────────
function VideoList({ s, d }) {
  const [room, setRoom] = useState(null);
  const today = ymd(new Date());
  const list = s.appts.filter((a) => a.doctorId === d.id && a.mode === 'online' && a.date >= today && a.status === 'booked').sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  if (!d.modes.includes('online')) return <Card><Empty icon={Video} text="هذا الطبيب لا يقدّم استشارات فيديو — فعّلها من الإدارة." /></Card>;
  return (
    <div>
      {room ? (
        <div className="mx-auto max-w-3xl">
          <VideoRoom me={d.name} other={room.patientName} onLeave={() => setRoom(null)} />
        </div>
      ) : (
        <Card className="!p-0">
          {list.length === 0 ? <Empty icon={Video} text="لا توجد استشارات فيديو قادمة — احجز واحدة من صفحة الطبيب كمريض وجرّب." /> : (
            <ul className="divide-y divide-line">
              {list.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 p-4">
                  <Avatar name={a.patientName} className="size-10 text-sm" />
                  <div className="flex-1">
                    <p className="font-bold">{a.patientName}</p>
                    <p className="text-xs text-muted">{fmtLongDate(parseYmd(a.date))} — {fmtTime(a.time)} · {MODES[a.mode].label}</p>
                  </div>
                  <Button onClick={() => setRoom(a)}><Video className="size-4" /> بدء الاستشارة</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
