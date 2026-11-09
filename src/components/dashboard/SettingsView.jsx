'use client';

import { useState } from 'react';
import { Copy, ExternalLink, QrCode, RotateCcw } from 'lucide-react';
import { fmtTime, resetDemo, update } from '@/lib/demo-store';
import { Button, Card, Field, PageHead, inputCls } from './ui';

const WEEK = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function SettingsView({ state }) {
  const b = state.business;
  const [copied, setCopied] = useState(false);
  const link = typeof window === 'undefined' ? '/demo' : `${window.location.origin}/demo`;

  const setBiz = (k, v) => update((s) => ((s.business[k] = v), s));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="rise">
      <PageHead title="الإعدادات" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-bold">رابط الحجز</h2>
          <div className="flex items-center gap-2 rounded-2xl bg-sand p-2">
            <span dir="ltr" className="min-w-0 flex-1 truncate px-2 text-sm font-semibold">{link}</span>
            <Button variant="ghost" onClick={copy} className="!py-2"><Copy className="size-4" /> {copied ? 'تم النسخ' : 'نسخ'}</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/demo" target="_blank" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-soft px-3 py-2 text-xs font-bold text-brand-dark">
              <ExternalLink className="size-3.5" /> فتح الصفحة
            </a>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-sand px-3 py-2 text-xs font-bold text-muted">
              <QrCode className="size-3.5" /> QR جاهز للطباعة في النسخة الكاملة
            </span>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">بيانات العيادة</h2>
          <div className="grid gap-3">
            <Field label="اسم العيادة"><input className={inputCls} value={b.name} onChange={(e) => setBiz('name', e.target.value)} maxLength={40} /></Field>
            <Field label="الموقع"><input className={inputCls} value={b.city} onChange={(e) => setBiz('city', e.target.value)} maxLength={60} /></Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">التنبيهات والدفع</h2>
          <Toggle label="تذكير المرضى تلقائيًا قبل الموعد" on={b.reminders} onChange={(v) => setBiz('reminders', v)} />
          <Toggle label="دفع قيمة الكشف أو عربون عند الحجز (مدى / Apple Pay / STC Pay)" on={b.deposit} onChange={(v) => setBiz('deposit', v)} />
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">ساعات العمل</h2>
          <ul className="divide-y divide-line text-sm">
            {WEEK.map((d, i) => (
              <li key={d} className="flex justify-between py-2">
                <span className="font-semibold">{d}</span>
                <span className="tabular-nums text-muted">
                  {b.hours[i] ? `${fmtTime(b.hours[i][0])} — ${fmtTime(b.hours[i][1])}` : 'مغلق'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-dashed border-line p-5">
        <p className="text-sm text-muted">هذه نسخة تجريبية — تقدر ترجّع البيانات الأصلية في أي وقت.</p>
        <Button variant="danger" onClick={() => window.confirm('إرجاع بيانات التجربة كما كانت؟') && resetDemo()}>
          <RotateCcw className="size-4" /> إعادة ضبط التجربة
        </Button>
      </div>
    </div>
  );
}

function Toggle({ label, on, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-4 py-2.5 text-right text-sm font-medium">
      {label}
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-brand' : 'bg-line'}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? 'right-0.5' : 'right-[22px]'}`} />
      </span>
    </button>
  );
}
