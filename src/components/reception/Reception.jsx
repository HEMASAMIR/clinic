'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon, Banknote, CalendarClock, CheckCircle2, ClipboardList, CreditCard, ExternalLink, Monitor, Printer,
  Receipt, ShieldCheck, UserPlus, Wallet,
} from 'lucide-react';
import {
  EXTRAS, PAY_METHODS, addDays, addPayment, book, bulkCancel, coverageFor, doctorById, fmtLongDate, fmtTime, freeSlots,
  fromMin, insurerById, memberById, money, nowMin, parseYmd, priceFor, queueOf, setStatus, usePlatform, ymd,
} from '@/lib/platform';
import { Avatar, Button, Card, Empty, Field, Modal, PageHead, Skeleton, StatusBadge, Tabs, inputCls } from '@/components/app/ui';
import { LogoMark } from '@/components/Logo';

const TABS = [
  ['hall', 'صالة الانتظار', ClipboardList],
  ['bulk', 'إلغاء / تأجيل جماعي', AlertOctagon],
  ['cash', 'الخزينة والفواتير', Wallet],
];

export default function Reception() {
  const s = usePlatform();
  const [tab, setTab] = useState('hall');
  if (!s) return <Skeleton />;
  return (
    <div>
      <PageHead
        icon={ClipboardList}
        title="مكتب الاستقبال"
        sub={fmtLongDate(new Date())}
        action={
          <Link href="/queue" target="_blank" className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white">
            <Monitor className="size-4" /> افتح شاشة الانتظار <ExternalLink className="size-3.5 opacity-60" />
          </Link>
        }
      />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'hall' && <Hall s={s} />}
      {tab === 'bulk' && <Bulk s={s} />}
      {tab === 'cash' && <Cashbox s={s} />}
    </div>
  );
}

// ── waiting hall ─────────────────────────────────────────────────────────────
function Hall({ s }) {
  const [walkIn, setWalkIn] = useState(false);
  const docs = s.doctors.map((d) => ({ d, q: queueOf(s, d.id) })).filter((x) => x.q.list.length);
  const totals = docs.reduce((t, { q }) => ({ waiting: t.waiting + q.waiting.length, upcoming: t.upcoming + q.upcoming.length, done: t.done + q.done.length }), { waiting: 0, upcoming: 0, done: 0 });

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['في الصالة الآن', totals.waiting, 'bg-amber-50 text-amber-800'], ['لم يصلوا بعد', totals.upcoming, 'bg-sky-50 text-sky-800'], ['انتهى كشفهم', totals.done, 'bg-emerald-50 text-emerald-800']].map(([l, v, c]) => (
          <div key={l} className={`rise rounded-3xl p-4 ${c}`}><p className="text-3xl font-bold tabular-nums">{v}</p><p className="text-xs font-semibold">{l}</p></div>
        ))}
        <button type="button" onClick={() => setWalkIn(true)} className="rise flex flex-col items-start justify-between rounded-3xl bg-brand p-4 text-right text-white shadow-soft transition hover:bg-brand-dark">
          <UserPlus className="size-6" />
          <span className="text-sm font-bold">مريض بدون حجز (Walk-in)</span>
        </button>
      </div>

      {docs.length === 0 ? <Card><Empty icon={ClipboardList} text="لا توجد عيادات اليوم." /></Card> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {docs.map(({ d, q }, i) => (
            <Card key={d.id} className="rise !p-0 overflow-hidden" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center gap-3 border-b border-line p-4">
                <Avatar name={d.name} gender={d.gender} className="size-10 text-sm" />
                <div className="flex-1">
                  <p className="text-sm font-bold">{d.name}</p>
                  <p className="text-[11px] text-muted">{d.specialty}</p>
                </div>
                <div className="rounded-xl bg-brand px-3 py-1.5 text-center text-white">
                  <p className="text-[9px] text-white/70">بالداخل</p>
                  <p className="text-lg font-bold leading-none tabular-nums">{q.current?._no || '—'}</p>
                </div>
              </div>
              <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                {[...q.waiting, ...q.upcoming].map((a) => (
                  <li key={a.id} className="flex items-center gap-2.5 px-4 py-2.5">
                    <span className="grid size-8 place-items-center rounded-lg bg-sand text-xs font-bold tabular-nums">{a._no}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{a.patientName}</p>
                      <p className="text-[10px] text-muted">{fmtTime(a.time)}{a.checkedInAt ? ` · وصل ${fmtTime(a.checkedInAt)}` : ''}{a.source === 'walkin' ? ' · بدون حجز' : ''}</p>
                    </div>
                    {a.status === 'booked' ? (
                      <Button size="sm" variant="soft" onClick={() => setStatus(a.id, 'checked_in')}><CheckCircle2 className="size-3.5" /> وصل</Button>
                    ) : <StatusBadge status={a.status} />}
                  </li>
                ))}
                {q.waiting.length + q.upcoming.length === 0 && <li className="p-4 text-center text-xs text-muted">لا يوجد مرضى منتظرين</li>}
              </ul>
            </Card>
          ))}
        </div>
      )}
      {walkIn && <WalkIn s={s} onClose={() => setWalkIn(false)} />}
    </div>
  );
}

function WalkIn({ s, onClose }) {
  const today = ymd(new Date());
  const [docId, setDocId] = useState(s.doctors.find((d) => d.schedule[new Date().getDay()])?.id || s.doctors[0].id);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState('');
  const d = doctorById(s, docId);
  const slot = freeSlots(s, docId, today)[0];
  const save = (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setErr('اكتب اسم المريض.');
    book({ doctorId: docId, patientName: name.trim(), phone: phone.trim() || '—', date: today, time: slot || fromMin(nowMin()), mode: 'clinic', payment: { method: 'clinic', amount: d.price, paid: false }, source: 'walkin' });
    onClose();
  };
  return (
    <Modal title="تسجيل مريض بدون حجز" onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <Field label="الطبيب">
          <select className={inputCls} value={docId} onChange={(e) => setDocId(e.target.value)}>
            {s.doctors.map((x) => <option key={x.id} value={x.id}>{x.name} — {x.specialty}</option>)}
          </select>
        </Field>
        <p className="rounded-xl bg-sand p-3 text-xs text-ink-soft">
          {slot ? <>أقرب خانة فاضية اليوم: <b>{fmtTime(slot)}</b> — يدخل الطابور مباشرة.</> : 'لا توجد خانة فاضية — يُضاف لآخر الطابور الآن.'} سعر الكشف {money(d.price)}.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="اسم المريض"><input autoFocus className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={50} /></Field>
          <Field label="الجوال"><input dir="ltr" className={`${inputCls} text-right`} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" maxLength={10} /></Field>
        </div>
        {err && <p className="text-sm text-rose-600">{err}</p>}
        <Button type="submit" size="lg" className="w-full">إضافة للطابور</Button>
      </form>
    </Modal>
  );
}

// ── bulk cancel / postpone ───────────────────────────────────────────────────
const REASONS = ['مؤتمر طبي', 'عملية طارئة', 'ظرف صحي طارئ', 'ظرف عائلي', 'صيانة في العيادة'];

function Bulk({ s }) {
  const [docId, setDocId] = useState('d1');
  const [date, setDate] = useState(ymd(addDays(new Date(), 1)));
  const [reason, setReason] = useState(REASONS[0]);
  const [move, setMove] = useState(true);
  const [result, setResult] = useState(null);
  const d = doctorById(s, docId);
  const affected = s.appts.filter((a) => a.doctorId === docId && a.date === date && ['booked', 'checked_in'].includes(a.status)).sort((a, b) => a.time.localeCompare(b.time));

  const run = () => {
    if (!window.confirm(`تأكيد: ${move ? 'تأجيل' : 'إلغاء'} ${affected.length} موعد وإرسال رسائل اعتذار؟`)) return;
    setResult(bulkCancel(docId, date, { move, reason }));
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <Card className="h-fit space-y-4">
        <Field label="الطبيب">
          <select className={inputCls} value={docId} onChange={(e) => { setDocId(e.target.value); setResult(null); }}>
            {s.doctors.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </Field>
        <Field label="اليوم">
          <input type="date" className={inputCls} value={date} min={ymd(new Date())} onChange={(e) => { setDate(e.target.value); setResult(null); }} />
        </Field>
        <Field label="السبب (يظهر في رسالة الاعتذار)">
          <select className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
        </Field>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-brand-soft/60 p-3 text-sm">
          <input type="checkbox" checked={move} onChange={(e) => setMove(e.target.checked)} className="mt-1 size-4 accent-[var(--color-brand)]" />
          <span><b>نقل المرضى تلقائيًا</b><br /><span className="text-xs text-ink-soft">كل مريض ينتقل لأقرب موعد متاح مع نفس الطبيب، ويوصله الموعد الجديد مع رابط للتغيير.</span></span>
        </label>
        <Button size="lg" variant="danger" className="w-full" disabled={!affected.length} onClick={run}>
          <AlertOctagon className="size-5" /> {move ? 'تأجيل' : 'إلغاء'} {affected.length} موعد وإبلاغ المرضى
        </Button>
      </Card>
      <div className="space-y-4">
        {result ? (
          <Card className="rise">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-emerald-700"><CheckCircle2 className="size-5" /> تم — أُرسلت {result.length} رسالة واتساب</h3>
            <ul className="space-y-2">
              {result.map((r, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl bg-sand p-3 text-sm">
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-xs">{r.alt ? <>➜ {fmtLongDate(parseYmd(r.alt.date))} — {fmtTime(r.alt.time)}</> : <span className="text-rose-600">أُلغي (لا يوجد بديل قريب)</span>}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card>
            <h3 className="mb-3 font-bold">المواعيد المتأثرة — {d.name} · {fmtLongDate(parseYmd(date))}</h3>
            {affected.length === 0 ? <Empty icon={CalendarClock} text="لا توجد مواعيد في هذا اليوم." /> : (
              <ul className="divide-y divide-line">
                {affected.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="font-semibold">{a.patientName}</span>
                    <span className="tabular-nums text-muted">{fmtTime(a.time)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        <Card className="bg-[#efeae2]">
          <p className="mb-2 text-xs font-bold text-ink-soft">معاينة الرسالة</p>
          <div className="max-w-md rounded-2xl rounded-tr-sm bg-white p-3 text-sm leading-7 shadow-sm">
            نعتذر منك 🙏 {d.name} عنده {reason} يوم {fmtLongDate(parseYmd(date))}.{' '}
            {move ? 'نقلنا موعدك لأقرب موعد متاح، وتقدر تغيّره من الرابط.' : 'تم إلغاء موعدك، احجز موعد جديد من الرابط.'}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── cashbox ──────────────────────────────────────────────────────────────────
function Cashbox({ s }) {
  const today = ymd(new Date());
  const [invoiceFor, setInvoiceFor] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const paidIds = new Set(s.payments.map((p) => p.apptId));
  const pending = s.appts.filter((a) => a.date === today && ['in_consult', 'done', 'checked_in'].includes(a.status) && !paidIds.has(a.id) && a.mode === 'clinic');
  const todays = s.payments.filter((p) => p.date === today);
  const sum = (f) => todays.filter(f).reduce((t, p) => t + p.total - (p.insurerShare || 0), 0);
  const insurerDue = todays.reduce((t, p) => t + (p.insurerShare || 0), 0);
  const cards = [
    ['إجمالي اليوم', todays.reduce((t, p) => t + p.total, 0), Receipt, 'bg-ink text-white'],
    ['كاش', sum((p) => p.method === 'cash'), Banknote, 'bg-emerald-50 text-emerald-800'],
    ['شبكة / مدى', sum((p) => p.method === 'card'), CreditCard, 'bg-sky-50 text-sky-800'],
    ['أونلاين', sum((p) => p.method === 'online'), Wallet, 'bg-violet-50 text-violet-800'],
    ['مستحق على التأمين', insurerDue, ShieldCheck, 'bg-amber-50 text-amber-800'],
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map(([l, v, Icon, c], i) => (
          <div key={l} className={`rise rounded-3xl p-4 ${c}`} style={{ animationDelay: `${i * 50}ms` }}>
            <Icon className="size-5 opacity-80" />
            <p className="mt-3 text-xl font-bold tabular-nums">{money(v)}</p>
            <p className="text-[11px] font-semibold opacity-80">{l}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-bold">بانتظار الفاتورة ({pending.length})</h3>
          {pending.length === 0 ? <Empty icon={Receipt} text="كل المرضى دفعوا." /> : (
            <ul className="divide-y divide-line">
              {pending.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{a.patientName}</p>
                    <p className="text-[11px] text-muted">{doctorById(s, a.doctorId).name} · {fmtTime(a.time)}</p>
                  </div>
                  <StatusBadge status={a.status} />
                  <Button size="sm" onClick={() => setInvoiceFor(a)}><Receipt className="size-3.5" /> فاتورة</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h3 className="mb-3 font-bold">حركات اليوم ({todays.length})</h3>
          {todays.length === 0 ? <Empty icon={Wallet} text="لا توجد حركات اليوم بعد." /> : (
            <ul className="divide-y divide-line">
              {todays.map((p) => {
                const a = s.appts.find((x) => x.id === p.apptId);
                return (
                  <li key={p.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{a?.patientName}</p>
                      <p className="text-[11px] text-muted">{p.items.map(([n]) => n).join(' + ')}</p>
                    </div>
                    <span className="rounded-lg bg-sand px-2 py-1 text-[11px] font-semibold">{PAY_METHODS[p.method] || p.method}</span>
                    <b className="tabular-nums">{money(p.total)}</b>
                    <button type="button" aria-label="طباعة" onClick={() => setReceipt(p)} className="text-muted hover:text-brand"><Printer className="size-4" /></button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
      {invoiceFor && <Invoice s={s} appt={invoiceFor} onClose={() => setInvoiceFor(null)} />}
      {receipt && <ReceiptModal s={s} p={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function Invoice({ s, appt, onClose }) {
  const d = doctorById(s, appt.doctorId);
  const member = appt.memberId ? memberById(s, appt.memberId) : null;
  const autoCover = member ? coverageFor(s, member, d) : null;
  const [extras, setExtras] = useState([]);
  const [method, setMethod] = useState(autoCover ? 'insurance' : 'cash');
  const [insurerId, setInsurerId] = useState(autoCover?.insurer.id || d.insurance[0] || '');
  const items = useMemo(() => [['كشف', priceFor(d, appt.mode)], ...extras], [d, appt.mode, extras]);
  const total = items.reduce((t, [, p]) => t + p, 0);
  const ins = insurerById(s, insurerId);
  const insurerShare = method === 'insurance' && ins ? Math.round((total * ins.coverage) / 100) : 0;
  const toggle = (x) => setExtras((list) => (list.some(([n]) => n === x[0]) ? list.filter(([n]) => n !== x[0]) : [...list, x]));
  return (
    <Modal title={`فاتورة — ${appt.patientName}`} onClose={onClose}>
      <p className="mb-2 text-xs font-bold text-ink-soft">خدمات إضافية</p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {EXTRAS.map((x) => {
          const on = extras.some(([n]) => n === x[0]);
          return (
            <button key={x[0]} type="button" onClick={() => toggle(x)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${on ? 'bg-ink text-white' : 'bg-sand text-ink-soft'}`}>
              {x[0]} · {x[1]}
            </button>
          );
        })}
      </div>
      <ul className="mb-4 space-y-1.5 rounded-2xl bg-sand p-4 text-sm">
        {items.map(([n, p]) => <li key={n} className="flex justify-between"><span>{n}</span><span className="tabular-nums">{money(p)}</span></li>)}
        <li className="flex justify-between border-t border-line pt-2 font-bold"><span>الإجمالي</span><span className="tabular-nums">{money(total)}</span></li>
        {insurerShare > 0 && (
          <>
            <li className="flex justify-between text-sky-700"><span>يتحمّل {ins.name} ({ins.coverage}%)</span><span className="tabular-nums">−{money(insurerShare)}</span></li>
            <li className="flex justify-between font-bold text-brand"><span>على المريض</span><span className="tabular-nums">{money(total - insurerShare)}</span></li>
          </>
        )}
      </ul>
      <div className="mb-4 grid grid-cols-4 gap-1.5">
        {[['cash', 'كاش'], ['card', 'شبكة'], ['insurance', 'تأمين'], ['online', 'أونلاين']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setMethod(k)} className={`rounded-xl border py-2.5 text-xs font-bold ${method === k ? 'border-brand bg-brand-soft text-brand-dark' : 'border-line'}`}>{l}</button>
        ))}
      </div>
      {method === 'insurance' && (
        <Field label="شركة التأمين">
          <select className={inputCls} value={insurerId} onChange={(e) => setInsurerId(e.target.value)}>
            {s.insurers.map((i) => <option key={i.id} value={i.id}>{i.name} — {i.coverage}%{d.insurance.includes(i.id) ? '' : ' (غير متعاقد مع الطبيب)'}</option>)}
          </select>
        </Field>
      )}
      <Button size="lg" className="mt-5 w-full" onClick={() => { addPayment({ apptId: appt.id, items, method, insurerShare }); onClose(); }}>
        تحصيل {money(total - insurerShare)}
      </Button>
    </Modal>
  );
}

function ReceiptModal({ s, p, onClose }) {
  const a = s.appts.find((x) => x.id === p.apptId);
  const d = a && doctorById(s, a.doctorId);
  return (
    <Modal title="إيصال" onClose={onClose}>
      <div className="print-area rounded-2xl border border-line p-5 text-sm">
        <div className="mb-4 flex items-center justify-between border-b border-dashed border-line pb-4">
          <div><p className="font-bold">إيصال دفع</p><p className="text-xs text-muted">{p.date} · رقم {p.id}</p></div>
          <LogoMark className="size-9" />
        </div>
        <p>المريض: <b>{a?.patientName}</b></p>
        <p className="mb-3">الطبيب: <b>{d?.name}</b></p>
        <ul className="space-y-1">
          {p.items.map(([n, v]) => <li key={n} className="flex justify-between"><span>{n}</span><span className="tabular-nums">{money(v)}</span></li>)}
        </ul>
        <p className="mt-3 flex justify-between border-t border-line pt-3 font-bold"><span>الإجمالي</span><span>{money(p.total)}</span></p>
        {p.insurerShare > 0 && <p className="flex justify-between text-sky-700"><span>على التأمين</span><span>{money(p.insurerShare)}</span></p>}
        <p className="mt-2 text-xs text-muted">طريقة الدفع: {PAY_METHODS[p.method] || p.method}</p>
      </div>
      <Button variant="dark" className="mt-4 w-full" onClick={() => window.print()}><Printer className="size-4" /> طباعة</Button>
    </Modal>
  );
}
