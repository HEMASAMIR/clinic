'use client';

import { useMemo, useState } from 'react';
import { addBooking, fmtTime, freeSlots, staffFor, VISIT, ymd } from '@/lib/demo-store';
import { Button, Field, Modal, inputCls } from './ui';

/** Walk-in / phone booking entered by the owner — same rules as the online page (no double booking). */
export default function NewBookingDialog({ state, onClose }) {
  const [serviceId, setServiceId] = useState(state.services[0]?.id);
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState(() => ymd(new Date()));
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [visit, setVisit] = useState('first');
  const [error, setError] = useState('');

  const slots = useMemo(
    () => freeSlots(state, { date, serviceId, staffId: staffId || null }),
    [state, date, serviceId, staffId],
  );

  const save = (e) => {
    e.preventDefault();
    const slot = slots.find((s) => s.time === time);
    if (!slot) return setError('اختر وقتًا متاحًا.');
    if (name.trim().length < 2) return setError('اكتب اسم المريض.');
    try {
      addBooking({ date, time, serviceId, staffId: slot.staffId, customer: { name: name.trim(), phone: phone.trim() }, visit, source: 'walkin' });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal title="موعد جديد من الاستقبال" onClose={onClose}>
      <form onSubmit={save} className="grid gap-4">
        <Field label="الخدمة">
          <select
            className={inputCls}
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              setStaffId('');
              setTime('');
            }}
          >
            {state.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.duration} د
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="الطبيب">
            <select className={inputCls} value={staffId} onChange={(e) => { setStaffId(e.target.value); setTime(''); }}>
              <option value="">أول طبيب متاح</option>
              {staffFor(state, serviceId).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="التاريخ">
            <input type="date" className={inputCls} value={date} min={ymd(new Date())} onChange={(e) => { setDate(e.target.value); setTime(''); }} />
          </Field>
        </div>
        <Field label={`الوقت (${slots.length} متاح)`}>
          <div className="no-scrollbar flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
            {slots.length === 0 && <p className="text-sm text-muted">ما فيه أوقات متاحة.</p>}
            {slots.map((s) => (
              <button
                key={s.time}
                type="button"
                onClick={() => setTime(s.time)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold tabular-nums ${time === s.time ? 'bg-brand text-white' : 'bg-brand-soft text-brand-dark'}`}
              >
                {fmtTime(s.time)}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="اسم المريض">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
          </Field>
          <Field label="الجوال">
            <input dir="ltr" inputMode="tel" className={`${inputCls} text-right`} value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={16} placeholder="05XXXXXXXX" />
          </Field>
        </div>
        <Field label="نوع الزيارة">
          <select className={inputCls} value={visit} onChange={(e) => setVisit(e.target.value)}>
            {Object.entries(VISIT).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Field>
        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
        <Button type="submit" className="py-3">حفظ الموعد</Button>
      </form>
    </Modal>
  );
}
