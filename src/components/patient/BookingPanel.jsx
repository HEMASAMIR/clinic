'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2, CalendarPlus, Check, CreditCard, Home, Loader2, Moon, ShieldCheck, Smartphone, Sun, UserPlus, Video, Wallet,
} from 'lucide-react';
import {
  MODES, PAY_METHODS, addDays, book, coverageFor, fmtDate, fmtDay, fmtLongDate, fmtTime, freeSlots, money, parseYmd,
  priceFor, toMin, ymd,
} from '@/lib/platform';
import { Button, Field, Modal, inputCls } from '@/components/app/ui';

const MODE_ICON = { clinic: Building2, online: Video, home: Home };
const DAYS = 14;

function icsFor({ doctor, date, time, mode }) {
  const [y, m, d] = date.split('-');
  const start = `${y}${m}${d}T${time.replace(':', '')}00`;
  const endMin = toMin(time) + doctor.slot;
  const end = `${y}${m}${d}T${String(Math.floor(endMin / 60)).padStart(2, '0')}${String(endMin % 60).padStart(2, '0')}00`;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mawid//AR', 'BEGIN:VEVENT',
    `UID:${Date.now()}@mawid`, `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:موعد ${MODES[mode].short} مع ${doctor.name}`,
    'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:تذكير بالموعد', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

export default function BookingPanel({ s, doctor }) {
  const [mode, setMode] = useState(doctor.modes[0]);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [memberId, setMemberId] = useState(s.family.members[0].id);
  const [other, setOther] = useState({ name: '', phone: '' });
  const [method, setMethod] = useState(null);
  const [step, setStep] = useState('pick'); // pick → pay → paying → done
  const [error, setError] = useState('');
  const [doneId, setDoneId] = useState(null);

  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => ymd(addDays(new Date(), i))), []);
  const slotsByDay = useMemo(() => Object.fromEntries(days.map((k) => [k, freeSlots(s, doctor.id, k)])), [s, doctor.id, days]);
  const firstDay = days.find((k) => slotsByDay[k].length);
  const activeDay = date || firstDay;
  const slots = activeDay ? slotsByDay[activeDay] : [];
  const morning = slots.filter((t) => toMin(t) < 12 * 60);
  const evening = slots.filter((t) => toMin(t) >= 12 * 60);

  const member = memberId === 'other' ? null : s.family.members.find((m) => m.id === memberId);
  const price = priceFor(doctor, mode);
  const cover = member ? coverageFor(s, member, doctor) : null;
  const patientShare = cover ? Math.round(price * (1 - cover.pct / 100)) : price;
  const sub = member && s.subscriptions.find((x) => x.memberId === member.id && s.packages.find((p) => p.id === x.packageId)?.doctorId === doctor.id && x.used < s.packages.find((p) => p.id === x.packageId).sessions);

  const methods = [
    ...(sub ? [['package', Wallet]] : []),
    ...(cover ? [['insurance', ShieldCheck]] : []),
    ['mada', CreditCard],
    ['applepay', Smartphone],
    ['stcpay', Smartphone],
    ...(price >= 200 ? [['tabby', CreditCard], ['tamara', CreditCard]] : []),
    ...(mode === 'clinic' ? [['clinic', Building2]] : []),
  ];

  const toPay = () => {
    setError('');
    if (!activeDay || !time) return setError('اختر اليوم والوقت.');
    if (memberId === 'other' && (other.name.trim().length < 2 || !/^05\d{8}$/.test(other.phone.trim()))) return setError('اكتب اسم المريض ورقم جوال صحيح (05XXXXXXXX).');
    setMethod(methods[0][0]);
    setStep('pay');
  };

  const confirm = () => {
    setStep('paying');
    // simulated payment gateway round-trip
    setTimeout(() => {
      try {
        const amount = method === 'insurance' ? patientShare : method === 'package' ? 0 : price;
        const id = book({
          doctorId: doctor.id,
          memberId: memberId === 'other' ? null : memberId,
          patientName: other.name.trim(),
          phone: other.phone.trim(),
          date: activeDay,
          time,
          mode,
          payment: { method, amount, paid: !['clinic', 'insurance'].includes(method), insurer: cover?.insurer.name },
          subscriptionId: method === 'package' ? sub?.id : null,
        });
        setDoneId(id);
        setStep('done');
      } catch (e) {
        setError(e.message);
        setTime(null);
        setStep('pick');
      }
    }, 1300);
  };

  const downloadIcs = () => {
    const blob = new Blob([icsFor({ doctor, date: activeDay, time, mode })], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mawid-appointment.ics';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="rise rise-2 overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
      <div className="bg-ink px-5 py-4 text-white">
        <p className="text-xs text-white/60">احجز موعدك</p>
        <p className="mt-0.5 flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">{money(price)}</span>
          <span className="pb-1 text-xs text-white/60">{MODES[mode].label}</span>
        </p>
      </div>

      <div className="space-y-5 p-5">
        {/* mode */}
        {doctor.modes.length > 1 && (
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${doctor.modes.length}, 1fr)` }}>
            {doctor.modes.map((m) => {
              const Icon = MODE_ICON[m];
              return (
                <button key={m} type="button" onClick={() => { setMode(m); setTime(null); }}
                  className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-[11px] font-bold transition ${mode === m ? 'border-brand bg-brand-soft text-brand-dark' : 'border-line text-ink-soft hover:border-brand/40'}`}>
                  <Icon className="size-4" /> {MODES[m].short}
                </button>
              );
            })}
          </div>
        )}

        {/* days */}
        <div>
          <p className="mb-2 text-xs font-bold text-ink-soft">اليوم</p>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
            {days.map((k, i) => {
              const n = slotsByDay[k].length;
              const active = k === activeDay;
              const d = parseYmd(k);
              return (
                <button key={k} type="button" disabled={!n} onClick={() => { setDate(k); setTime(null); }}
                  className={`flex min-w-[64px] flex-col items-center rounded-2xl border px-2 py-2.5 transition ${active ? 'border-brand bg-brand text-white shadow-soft' : n ? 'border-line hover:border-brand' : 'cursor-not-allowed border-line bg-sand text-muted/50'}`}>
                  <span className="text-[10px] font-semibold">{i === 0 ? 'اليوم' : i === 1 ? 'بكرة' : fmtDay(d)}</span>
                  <span className="text-lg font-bold tabular-nums">{d.getDate()}</span>
                  <span className={`text-[9px] ${active ? 'text-white/80' : n ? 'text-emerald-600' : ''}`}>{n ? `${n} متاح` : doctor.schedule[d.getDay()] && !doctor.blocked.includes(k) ? 'مكتمل' : 'إجازة'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* slots */}
        {activeDay ? (
          <div className="space-y-3">
            {[[morning, 'صباحًا', Sun], [evening, 'مساءً', Moon]].map(([list, label, Icon]) => list.length > 0 && (
              <div key={label}>
                <p className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-muted"><Icon className="size-3.5" /> {label}</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {list.map((t) => (
                    <button key={t} type="button" onClick={() => setTime(t)}
                      className={`rounded-lg py-2 text-xs font-bold tabular-nums transition ${time === t ? 'bg-brand text-white shadow-soft' : 'bg-brand-soft text-brand-dark hover:bg-brand/15'}`}>
                      {fmtTime(t).replace(' ص', '').replace(' م', '')}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-sand p-3 text-sm text-muted">ما فيه مواعيد متاحة خلال أسبوعين.</p>
        )}

        {/* who */}
        <div>
          <p className="mb-2 text-xs font-bold text-ink-soft">الحجز لـ</p>
          <div className="flex flex-wrap gap-1.5">
            {s.family.members.map((m) => (
              <button key={m.id} type="button" onClick={() => setMemberId(m.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${memberId === m.id ? 'bg-ink text-white' : 'bg-sand text-ink-soft'}`}>
                {m.name.split(' ')[0]} <span className="font-normal opacity-70">({m.relation})</span>
              </button>
            ))}
            <button type="button" onClick={() => setMemberId('other')}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${memberId === 'other' ? 'bg-ink text-white' : 'bg-sand text-ink-soft'}`}>
              <UserPlus className="size-3.5" /> شخص آخر
            </button>
          </div>
          {memberId === 'other' && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="اسم المريض" value={other.name} onChange={(e) => setOther((o) => ({ ...o, name: e.target.value }))} maxLength={50} />
              <input className={`${inputCls} text-right`} dir="ltr" inputMode="tel" placeholder="05XXXXXXXX" value={other.phone} onChange={(e) => setOther((o) => ({ ...o, phone: e.target.value }))} maxLength={10} />
            </div>
          )}
          {cover && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">
              <ShieldCheck className="size-4" /> تأمين {cover.insurer.name} يغطي {cover.pct}% — حصتك {money(patientShare)} فقط
            </p>
          )}
          {sub && <p className="mt-2 flex items-center gap-2 rounded-xl bg-gold-soft px-3 py-2 text-xs font-semibold text-gold"><Wallet className="size-4" /> عندك رصيد في باقة — الزيارة مجانية من الباقة</p>}
        </div>

        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-600">{error}</p>}
        <Button size="lg" className="w-full" disabled={!time} onClick={toPay}>
          {time ? `متابعة — ${fmtTime(time)}` : 'اختر الوقت'}
        </Button>
      </div>

      {(step === 'pay' || step === 'paying') && (
        <Modal title="تأكيد الحجز والدفع" onClose={() => step === 'pay' && setStep('pick')}>
          <div className="mb-4 rounded-2xl bg-sand p-4 text-sm">
            <p className="font-bold">{doctor.name} · {MODES[mode].label}</p>
            <p className="mt-1 text-ink-soft">{fmtLongDate(parseYmd(activeDay))} — {fmtTime(time)}</p>
            <p className="mt-1 text-ink-soft">للمريض: {member?.name || other.name}</p>
          </div>
          <p className="mb-2 text-xs font-bold text-ink-soft">طريقة الدفع</p>
          <div className="space-y-2">
            {methods.map(([k, Icon]) => {
              const amount = k === 'insurance' ? patientShare : k === 'package' ? 0 : price;
              const sub4 = k === 'tabby' ? `4 دفعات × ${money(price / 4)} بدون فوائد` : k === 'tamara' ? `3 دفعات × ${money(price / 3)} بدون فوائد` : k === 'insurance' ? `${cover.insurer.name} يدفع ${money(price - patientShare)}` : k === 'clinic' ? 'ادفع كاش أو شبكة عند الوصول' : k === 'package' ? 'تُخصم زيارة من باقتك' : 'دفع آمن فوري';
              return (
                <button key={k} type="button" onClick={() => setMethod(k)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-right transition ${method === k ? 'border-brand bg-brand-soft/60 ring-2 ring-brand/15' : 'border-line hover:border-brand/40'}`}>
                  <span className="flex items-center gap-3">
                    <span className={`grid size-9 place-items-center rounded-xl ${method === k ? 'bg-brand text-white' : 'bg-sand text-ink-soft'}`}><Icon className="size-4" /></span>
                    <span>
                      <span className="block text-sm font-bold">{PAY_METHODS[k]}</span>
                      <span className="block text-[11px] text-muted">{sub4}</span>
                    </span>
                  </span>
                  <span className="text-sm font-bold tabular-nums">{money(amount)}</span>
                </button>
              );
            })}
          </div>
          <Button size="lg" className="mt-5 w-full" onClick={confirm} disabled={step === 'paying'}>
            {step === 'paying' ? <><Loader2 className="size-5 animate-spin" /> جاري تأكيد الدفع…</> : 'تأكيد الحجز'}
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted">بيئة تجريبية — لا يتم خصم أي مبلغ فعلي.</p>
        </Modal>
      )}

      {step === 'done' && (
        <Modal title="تم الحجز بنجاح 🎉" onClose={() => { setStep('pick'); setTime(null); }}>
          <div className="text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand text-white shadow-lift"><Check className="size-8" /></span>
            <p className="mt-4 font-bold">{doctor.name}</p>
            <p className="text-sm text-ink-soft">{fmtLongDate(parseYmd(activeDay))} — {fmtTime(time)} · {MODES[mode].label}</p>
            <p className="mt-1 text-xs text-muted">{fmtDate(parseYmd(activeDay))}</p>
            <div className="mt-4 rounded-2xl bg-[#e7fbe4] p-3 text-right text-xs leading-6 text-[#155d27]">
              💬 وصلتك رسالة تأكيد على واتساب، وبنذكّرك قبل الموعد بـ 24 ساعة وبساعتين مع زر تأكيد أو إلغاء.
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Link href={`/patient${doneId ? `?appt=${doneId}` : ''}`} className="rounded-xl bg-ink py-3 text-center text-sm font-bold text-white">تابع موعدك ودورك</Link>
            <Button variant="ghost" onClick={downloadIcs}><CalendarPlus className="size-4" /> أضفه للتقويم</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

