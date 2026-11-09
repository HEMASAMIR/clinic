'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { whatsappLink } from '@/config/site';

const TYPES = ['عيادة أسنان', 'جلدية وتجميل', 'علاج طبيعي', 'أطفال', 'عيون', 'تغذية', 'صحة نفسية', 'مجمع طبي', 'تخصص آخر'];
const COUNTRIES = ['السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عُمان'];

const field =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold focus:bg-white/10';

/** "Book a free demo" — sends a ready message on WhatsApp (no data is stored on our side). */
export default function LeadForm() {
  const [f, setF] = useState({ name: '', business: '', type: TYPES[0], country: COUNTRIES[0], branches: '1' });
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const msg = [
      'السلام عليكم، أبغى عرض تجريبي لنظام موعِد لعيادتي 👋',
      `الاسم: ${f.name}`,
      `العيادة: ${f.business} (${f.type})`,
      `الدولة: ${f.country}`,
      `عدد الفروع: ${f.branches}`,
    ].join('\n');
    window.open(whatsappLink(msg), '_blank', 'noopener,noreferrer');
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <input required className={field} placeholder="اسمك" value={f.name} onChange={set('name')} maxLength={60} />
      <input required className={field} placeholder="اسم العيادة" value={f.business} onChange={set('business')} maxLength={80} />
      <select className={field} value={f.type} onChange={set('type')}>
        {TYPES.map((t) => (
          <option key={t} className="text-ink">{t}</option>
        ))}
      </select>
      <select className={field} value={f.country} onChange={set('country')}>
        {COUNTRIES.map((t) => (
          <option key={t} className="text-ink">{t}</option>
        ))}
      </select>
      <select className={`${field} sm:col-span-2`} value={f.branches} onChange={set('branches')}>
        {['1', '2 - 3', '4 - 10', 'أكثر من 10'].map((t) => (
          <option key={t} value={t} className="text-ink">
            عدد الفروع: {t}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-sm font-bold text-ink transition hover:brightness-105 sm:col-span-2"
      >
        <Send className="size-4" /> احجز عرضًا تجريبيًا مجانيًا
      </button>
      <p className="text-center text-xs text-white/50 sm:col-span-2">بنرد عليك على واتساب خلال ساعات العمل.</p>
    </form>
  );
}
