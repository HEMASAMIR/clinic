'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { MessageCircle, Printer } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
import { age, clinicById, doctorById, fmtLongDate, memberById, parseYmd } from '@/lib/platform';
import { Button } from './ui';

/** A printable e-prescription with a verification QR code. "Print" also gives "Save as PDF". */
export default function RxDocument({ s, rx, patientName }) {
  const d = doctorById(s, rx.doctorId);
  const c = clinicById(s, d.clinicId);
  const m = rx.memberId ? memberById(s, rx.memberId) : null;
  const name = m?.name || patientName || '';
  const [qr, setQr] = useState('');

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(`MAWID-RX:${rx.id}:${rx.date}:${d.id}`, { margin: 1, width: 180, color: { dark: '#0b1f2a', light: '#ffffff' } })
      .then((url) => alive && setQr(url))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [rx.id, rx.date, d.id]);

  const text = [
    `💊 روشتة إلكترونية — ${c.name}`,
    `${d.name} (${d.specialty})`,
    `المريض: ${name}`,
    `التشخيص: ${rx.diagnosis}`,
    ...rx.items.map((it, i) => `${i + 1}. ${it.drug} — ${it.dose}${it.duration ? ` — ${it.duration}` : ''}`),
    `رمز التحقق: ${rx.id}`,
  ].join('\n');

  return (
    <div>
      <div className="print-area overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex items-start justify-between gap-4 border-b-4 border-brand bg-sand/60 p-5">
          <div>
            <p className="text-lg font-bold">{d.name}</p>
            <p className="text-xs text-ink-soft">{d.title}</p>
            <p className="mt-1 text-[11px] text-muted">{c.name} — {c.city}، {c.area} · <span dir="ltr">{c.phone}</span></p>
          </div>
          <div className="flex items-center gap-2 text-left">
            <div>
              <p className="text-sm font-bold text-brand">روشتة طبية</p>
              <p className="text-[10px] text-muted">e-Prescription</p>
            </div>
            <LogoMark className="size-10" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 border-b border-line p-5 text-xs">
          <p><span className="text-muted">المريض: </span><b>{name}</b></p>
          <p><span className="text-muted">العمر: </span><b>{m?.birth ? `${age(m.birth)} سنة` : '—'}</b></p>
          <p><span className="text-muted">التاريخ: </span><b>{fmtLongDate(parseYmd(rx.date))}</b></p>
          <p className="col-span-3"><span className="text-muted">التشخيص: </span><b>{rx.diagnosis}</b></p>
          {m?.allergies?.length > 0 && <p className="col-span-3 font-bold text-rose-600">⚠ حساسية: {m.allergies.join('، ')}</p>}
        </div>
        <div className="p-5">
          <p className="mb-3 text-2xl font-bold italic text-brand" dir="ltr">Rx</p>
          <ol className="space-y-3">
            {rx.items.map((it, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-line p-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-xs font-bold text-brand">{i + 1}</span>
                <div>
                  <p className="font-bold" dir="ltr" style={{ textAlign: 'right' }}>{it.drug}</p>
                  <p className="text-sm text-ink-soft">{it.dose}{it.duration ? ` — لمدة ${it.duration}` : ''}</p>
                </div>
              </li>
            ))}
          </ol>
          {rx.notes && <p className="mt-4 rounded-xl bg-sand p-3 text-sm"><b>ملاحظات: </b>{rx.notes}</p>}
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-line p-5">
          <div className="text-xs text-muted">
            <p>توقيع الطبيب: <span className="font-bold text-ink" style={{ fontFamily: 'cursive' }}>{d.name.replace('د. ', '')}</span></p>
            <p className="mt-1">رمز التحقق: <span dir="ltr" className="font-mono">{rx.id}</span></p>
            <p className="mt-1">امسح الرمز للتحقق من صحة الروشتة عند الصيدلية</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- generated data: URL */}
          {qr ? <img src={qr} alt="رمز التحقق من الروشتة" className="size-24 rounded-lg border border-line" /> : <div className="size-24 animate-pulse rounded-lg bg-sand" />}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 print:hidden">
        <Button variant="dark" onClick={() => window.print()}><Printer className="size-4" /> طباعة / PDF</Button>
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25d366] px-4 py-2.5 text-sm font-bold text-white">
          <MessageCircle className="size-4" /> إرسال واتساب
        </a>
      </div>
    </div>
  );
}
