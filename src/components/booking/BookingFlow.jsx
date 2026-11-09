'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CalendarCheck, CalendarDays, Check, Clock, LayoutDashboard, MapPin, Phone, Sparkles, Star, User,
} from 'lucide-react';
import {
  addBooking, addDays, fmtDate, fmtDay, fmtLongDate, fmtTime, freeSlots, money, parseYmd, serviceById, staffById,
  staffFor, useDemo, ymd,
} from '@/lib/demo-store';
import { LogoMark } from '@/components/Logo';

const STEPS = ['الخدمة', 'الموظفة', 'الموعد', 'بياناتك'];
const DAYS_AHEAD = 14;

function Shell({ children, business }) {
  return (
    <div className="min-h-dvh bg-sand">
      <div className="bg-ink px-4 py-2.5 text-center text-xs text-white/80">
        هذه صفحة تجريبية من <b className="text-gold">موعِد</b> — احجز كأنك عميل، ثم افتح{' '}
        <Link href="/dashboard" className="font-bold text-white underline underline-offset-4">
          لوحة التحكم
        </Link>{' '}
        لترى حجزك.
      </div>
      <header className="bg-gradient-to-bl from-brand to-brand-dark text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-white/15 text-2xl font-bold ring-1 ring-white/25">ل</div>
            <div>
              <h1 className="text-xl font-bold">{business?.name || 'صالون لمسة'}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
                <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {business?.city || 'الرياض'}</span>
                <span className="flex items-center gap-1"><Star className="size-3.5 fill-gold text-gold" /> صالون نسائي</span>
              </p>
            </div>
          </div>
          <Link href="/" className="hidden items-center gap-2 text-xs text-white/70 hover:text-white sm:flex">
            <LogoMark className="size-6" /> بواسطة موعِد
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}

export default function BookingFlow() {
  const state = useDemo();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(null);
  const [staffId, setStaffId] = useState(null); // null = any
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');
  const [doneId, setDoneId] = useState(null);

  // Only in the browser (state is null while prerendering), so the dates are the visitor's.
  const days = useMemo(() => {
    if (!state) return [];
    const today = new Date();
    return Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i));
  }, [state]);

  const slots = useMemo(
    () => (state && serviceId && date ? freeSlots(state, { date, serviceId, staffId }) : []),
    [state, serviceId, staffId, date],
  );

  if (!state) {
    return (
      <Shell>
        <div className="mx-auto max-w-5xl animate-pulse space-y-3 px-4 py-10">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-2xl bg-white" />)}
        </div>
      </Shell>
    );
  }

  const service = serviceId && serviceById(state, serviceId);
  const chosenStaff = slot && staffById(state, slot.staffId);
  const categories = [...new Set(state.services.map((s) => s.category))];

  const go = (n) => {
    setError('');
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirm = (e) => {
    e.preventDefault();
    const phone = customer.phone.replace(/\s/g, '');
    if (customer.name.trim().length < 2) return setError('اكتبي اسمك من فضلك.');
    if (!/^(05\d{8}|\+?9665\d{8}|\+?971\d{8,9}|\+?965\d{8}|\+?974\d{8}|\+?973\d{8}|\+?968\d{8})$/.test(phone)) {
      return setError('اكتبي رقم جوال صحيح، مثل 05XXXXXXXX');
    }
    try {
      const id = addBooking({ date, time: slot.time, serviceId, staffId: slot.staffId, customer: { name: customer.name.trim(), phone } });
      setDoneId(id);
    } catch (err) {
      setError(err.message);
      setSlot(null);
      go(2);
    }
  };

  // ── success ──
  if (doneId) {
    return (
      <Shell business={state.business}>
        <div className="mx-auto max-w-lg px-4 py-12">
          <div className="rise rounded-3xl bg-white p-8 text-center shadow-lift">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand text-white">
              <Check className="size-8" />
            </span>
            <h2 className="mt-5 text-2xl font-bold">تم تأكيد حجزك 🎉</h2>
            <p className="mt-2 text-sm text-muted">أرسلنا لك رسالة تأكيد، وبنذكّرك قبل الموعد بساعتين.</p>
            <dl className="mt-6 space-y-3 rounded-2xl bg-sand p-5 text-right text-sm">
              <Row label="الخدمة" value={service.name} />
              <Row label="مع" value={chosenStaff.name} />
              <Row label="الموعد" value={`${fmtLongDate(parseYmd(date))} — ${fmtTime(slot.time)}`} />
              <Row label="المبلغ" value={`${money(service.price)} (يُدفع في الصالون)`} />
            </dl>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Link href="/dashboard" className="flex items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-bold text-white">
                <LayoutDashboard className="size-4" /> شوفه في لوحة التحكم
              </Link>
              <button
                type="button"
                onClick={() => {
                  setDoneId(null);
                  setServiceId(null);
                  setStaffId(null);
                  setDate(null);
                  setSlot(null);
                  go(0);
                }}
                className="rounded-2xl border border-line py-3.5 text-sm font-bold"
              >
                حجز جديد
              </button>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell business={state.business}>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_300px]">
        <div>
          {/* progress */}
          <ol className="mb-6 flex items-center gap-2">
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-1 flex-col gap-1.5">
                <span className={`h-1.5 rounded-full transition ${i <= step ? 'bg-brand' : 'bg-line'}`} />
                <span className={`text-[11px] font-semibold ${i === step ? 'text-brand' : 'text-muted'}`}>{label}</span>
              </li>
            ))}
          </ol>

          {step > 0 && (
            <button type="button" onClick={() => go(step - 1)} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-brand">
              <ArrowRight className="size-4" /> رجوع
            </button>
          )}

          {/* step 1: service */}
          {step === 0 && (
            <section className="rise space-y-6">
              <h2 className="text-xl font-bold">وش الخدمة اللي تبينها؟</h2>
              {categories.map((cat) => (
                <div key={cat}>
                  <p className="mb-2 text-xs font-bold text-muted">{cat}</p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {state.services.filter((s) => s.category === cat).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setServiceId(s.id);
                          setStaffId(null);
                          setSlot(null);
                          go(1);
                        }}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 text-right shadow-soft transition hover:border-brand"
                      >
                        <span className="flex items-center gap-3">
                          <span className="h-10 w-1.5 rounded-full" style={{ background: s.color }} />
                          <span>
                            <span className="block font-bold">{s.name}</span>
                            <span className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                              <Clock className="size-3.5" /> {s.duration} دقيقة
                            </span>
                          </span>
                        </span>
                        <span className="font-bold text-brand">{money(s.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* step 2: staff */}
          {step === 1 && service && (
            <section className="rise space-y-4">
              <h2 className="text-xl font-bold">تبين موظفة معيّنة؟</h2>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <StaffCard
                  active={staffId === null}
                  title="أي موظفة متاحة"
                  sub="أسرع موعد متاح"
                  icon={<Sparkles className="size-5" />}
                  onClick={() => {
                    setStaffId(null);
                    setSlot(null);
                    go(2);
                  }}
                />
                {staffFor(state, serviceId).map((p) => (
                  <StaffCard
                    key={p.id}
                    active={staffId === p.id}
                    title={p.name}
                    sub={p.role}
                    icon={<span className="text-lg font-bold">{p.name[0]}</span>}
                    onClick={() => {
                      setStaffId(p.id);
                      setSlot(null);
                      go(2);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* step 3: date & time */}
          {step === 2 && service && (
            <section className="rise space-y-5">
              <h2 className="text-xl font-bold">اختاري اليوم والوقت</h2>
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                {days.map((d) => {
                  const key = ymd(d);
                  const active = key === date;
                  const hasSlots = freeSlots(state, { date: key, serviceId, staffId }).length > 0;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!hasSlots}
                      onClick={() => {
                        setDate(key);
                        setSlot(null);
                      }}
                      className={`flex min-w-[76px] flex-col items-center rounded-2xl border px-3 py-3 transition ${
                        active
                          ? 'border-brand bg-brand text-white shadow-soft'
                          : hasSlots
                            ? 'border-line bg-white hover:border-brand'
                            : 'cursor-not-allowed border-line bg-sand-deep/60 text-muted/60'
                      }`}
                    >
                      <span className="text-[11px] font-medium">{fmtDay(d)}</span>
                      <span className="mt-1 text-lg font-bold tabular-nums">{d.getDate()}</span>
                      <span className="text-[10px] opacity-70">{hasSlots ? fmtDate(d).split(' ')[1] : 'مكتمل'}</span>
                    </button>
                  );
                })}
              </div>

              {!date ? (
                <p className="flex items-center gap-2 rounded-2xl bg-white p-5 text-sm text-muted">
                  <CalendarDays className="size-5 text-brand" /> اختاري يوم عشان تظهر الأوقات المتاحة.
                </p>
              ) : (
                <div className="rounded-3xl border border-line bg-white p-5">
                  <p className="mb-3 text-sm font-bold">{fmtLongDate(parseYmd(date))}</p>
                  {slots.length === 0 ? (
                    <p className="text-sm text-muted">ما فيه أوقات متاحة هذا اليوم.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map((s) => (
                        <button
                          key={s.time}
                          type="button"
                          onClick={() => setSlot(s)}
                          className={`rounded-xl py-2.5 text-sm font-semibold tabular-nums transition ${
                            slot?.time === s.time ? 'bg-brand text-white shadow-soft' : 'bg-brand-soft text-brand-dark hover:bg-brand/15'
                          }`}
                        >
                          {fmtTime(s.time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-600">{error}</p>}
              <button
                type="button"
                disabled={!slot}
                onClick={() => go(3)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-bold text-white transition disabled:opacity-30"
              >
                متابعة <ArrowLeft className="size-4" />
              </button>
            </section>
          )}

          {/* step 4: details */}
          {step === 3 && service && slot && (
            <form onSubmit={confirm} className="rise space-y-4">
              <h2 className="text-xl font-bold">آخر خطوة.. بياناتك</h2>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"><User className="size-4 text-brand" /> الاسم</span>
                <input
                  autoFocus
                  value={customer.name}
                  onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                  maxLength={50}
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 outline-none focus:border-brand"
                  placeholder="مثال: سارة"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"><Phone className="size-4 text-brand" /> رقم الجوال</span>
                <input
                  dir="ltr"
                  inputMode="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                  maxLength={16}
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-right outline-none focus:border-brand"
                  placeholder="05XXXXXXXX"
                />
                <span className="mt-1.5 block text-xs text-muted">بنرسل لك التأكيد والتذكير على هذا الرقم.</span>
              </label>
              {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-600">{error}</p>}
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-lift hover:bg-brand-dark">
                <CalendarCheck className="size-5" /> تأكيد الحجز
              </button>
              <p className="text-center text-xs text-muted">تقدرين تلغين أو تعدّلين الموعد من رابط الرسالة.</p>
            </form>
          )}
        </div>

        {/* summary */}
        <aside className={`h-fit rounded-3xl border border-line bg-white p-5 shadow-soft lg:sticky lg:top-6 ${service ? '' : 'hidden lg:block'}`}>
          <h3 className="mb-4 font-bold">ملخص الحجز</h3>
          {service ? (
            <dl className="space-y-3 text-sm">
              <Row label="الخدمة" value={service.name} />
              <Row label="المدة" value={`${service.duration} دقيقة`} />
              <Row label="الموظفة" value={chosenStaff?.name || (staffId ? staffById(state, staffId).name : 'أي موظفة متاحة')} />
              {date && <Row label="اليوم" value={fmtLongDate(parseYmd(date))} />}
              {slot && <Row label="الوقت" value={fmtTime(slot.time)} />}
              <div className="flex items-center justify-between border-t border-line pt-3 text-base font-bold">
                <span>الإجمالي</span>
                <span className="text-brand">{money(service.price)}</span>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted">اختاري خدمة للبدء.</p>
          )}
        </aside>
      </div>
    </Shell>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-left font-semibold">{value}</dd>
    </div>
  );
}

function StaffCard({ active, title, sub, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-right shadow-soft transition ${
        active ? 'border-brand ring-2 ring-brand/15' : 'border-line hover:border-brand'
      }`}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">{icon}</span>
      <span>
        <span className="block font-bold">{title}</span>
        <span className="text-xs text-muted">{sub}</span>
      </span>
    </button>
  );
}
