'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { whatsappLink } from '@/config/site';

const PLANS = [
  {
    name: 'الانطلاقة',
    for: 'للمحلات الصغيرة والمستقلين',
    monthly: 149,
    features: [
      'حتى 3 موظفين',
      'رابط حجز باسم نشاطك + QR',
      'تذكير تلقائي للعملاء',
      'لوحة تحكم وتقويم',
      'تقارير أساسية',
      'دعم عربي على واتساب',
    ],
  },
  {
    name: 'الاحترافي',
    for: 'للصالونات والعيادات النشطة',
    monthly: 299,
    popular: true,
    features: [
      'حتى 10 موظفين',
      'كل مميزات الانطلاقة',
      'عربون أونلاين يقلّل الغياب',
      'كوبونات وبرنامج ولاء',
      'ملفات العملاء وسجل الزيارات',
      'تقارير الإيرادات والموظفين',
    ],
  },
  {
    name: 'المؤسسات',
    for: 'للسلاسل والفروع المتعددة',
    monthly: null,
    features: [
      'موظفين وفروع بلا حدود',
      'تطبيق أندرويد وآيفون باسمك',
      'ربط مع أنظمتك الحالية',
      'صلاحيات لكل فرع ومدير',
      'مدير حساب مخصص',
      'تدريب فريقك',
    ],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <div>
      <div className="mx-auto mb-10 flex w-fit items-center gap-1 rounded-full border border-line bg-white p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setYearly(false)}
          className={`rounded-full px-5 py-2 transition ${!yearly ? 'bg-ink text-white' : 'text-ink-soft'}`}
        >
          شهري
        </button>
        <button
          type="button"
          onClick={() => setYearly(true)}
          className={`flex items-center gap-2 rounded-full px-5 py-2 transition ${yearly ? 'bg-ink text-white' : 'text-ink-soft'}`}
        >
          سنوي
          <span className={`rounded-full px-2 py-0.5 text-[11px] ${yearly ? 'bg-gold text-ink' : 'bg-gold-soft text-gold'}`}>
            شهرين مجانًا
          </span>
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {PLANS.map((p) => {
          const price = p.monthly && (yearly ? Math.round((p.monthly * 10) / 12) : p.monthly);
          return (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-3xl border p-7 ${
                p.popular ? 'border-brand bg-ink text-white shadow-lift lg:-translate-y-3' : 'border-line bg-white shadow-soft'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 right-7 rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink">
                  الأكثر طلبًا
                </span>
              )}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className={`mt-1 text-sm ${p.popular ? 'text-white/65' : 'text-muted'}`}>{p.for}</p>
              <div className="mt-6 flex items-end gap-1.5">
                {price ? (
                  <>
                    <span className="text-4xl font-bold tabular-nums">{price}</span>
                    <span className={`pb-1 text-sm ${p.popular ? 'text-white/65' : 'text-muted'}`}>ر.س / شهريًا</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">حسب احتياجك</span>
                )}
              </div>
              <p className={`mt-1 h-5 text-xs ${p.popular ? 'text-white/50' : 'text-muted'}`}>
                {price && yearly ? `تُدفع سنويًا (${(p.monthly * 10).toLocaleString('en-US')} ر.س)` : price ? 'بدون التزام — ألغِ متى شئت' : ''}
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className={`mt-0.5 size-4 shrink-0 ${p.popular ? 'text-gold' : 'text-brand'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappLink(`السلام عليكم، مهتم بباقة «${p.name}» في نظام موعِد`)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-8 rounded-2xl py-3.5 text-center text-sm font-bold transition ${
                  p.popular ? 'bg-gold text-ink hover:brightness-105' : 'bg-brand-soft text-brand-dark hover:bg-brand hover:text-white'
                }`}
              >
                {p.monthly ? 'ابدأ تجربتك 14 يوم مجانًا' : 'تواصل معنا'}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
