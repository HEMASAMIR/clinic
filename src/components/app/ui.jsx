'use client';

import { Star, X } from 'lucide-react';
import { STATUS } from '@/lib/platform';

export function Card({ className = '', children, ...rest }) {
  return (
    <div {...rest} className={`rounded-3xl border border-line bg-white p-5 shadow-soft ${className}`}>
      {children}
    </div>
  );
}

export function PageHead({ title, sub, action, icon: Icon }) {
  return (
    <div className="rise mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid size-11 place-items-center rounded-2xl bg-brand text-white shadow-soft">
            <Icon className="size-5" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.booked;
  return <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>{s.label}</span>;
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-dark shadow-soft',
    dark: 'bg-ink text-white hover:bg-ink/90',
    gold: 'bg-gold text-ink hover:brightness-105',
    soft: 'bg-brand-soft text-brand-dark hover:bg-brand/15',
    ghost: 'border border-line bg-white hover:border-brand hover:text-brand',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs rounded-lg', md: 'px-4 py-2.5 text-sm rounded-xl', lg: 'px-6 py-3.5 text-base rounded-2xl' };
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${styles[variant]} ${sizes[size]} ${className}`}
    />
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-ink-soft">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

export const inputCls =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10';

export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/45 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`rise max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="grid size-9 shrink-0 place-items-center rounded-xl hover:bg-sand">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ icon: Icon, text, action }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted">
      {Icon && (
        <span className="grid size-14 place-items-center rounded-2xl bg-sand">
          <Icon className="size-7 text-muted/60" />
        </span>
      )}
      {text}
      {action}
    </div>
  );
}

export function Stars({ value = 0, size = 'size-4', onChange }) {
  return (
    <span className="inline-flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= Math.round(value);
        const S = (
          <Star className={`${size} ${on ? 'fill-gold text-gold' : 'fill-slate-200 text-slate-200'} transition`} />
        );
        return onChange ? (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} نجوم`} className="transition hover:scale-110">
            {S}
          </button>
        ) : (
          <span key={n}>{S}</span>
        );
      })}
    </span>
  );
}

export function Avatar({ name = '', gender, className = 'size-12 text-lg' }) {
  const clean = name.replace('د. ', '');
  const tone = gender === 'f' ? 'from-rose-400 to-fuchsia-500' : 'from-brand to-teal-500';
  return (
    <span className={`grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br font-bold text-white ${tone} ${className}`}>
      {clean[0]}
    </span>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="no-scrollbar -mx-4 mb-6 overflow-x-auto px-4">
      <div className="flex w-max gap-1 rounded-2xl border border-line bg-white p-1">
        {tabs.map(([key, label, Icon, badge]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`relative flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              value === key ? 'bg-ink text-white shadow-soft' : 'text-ink-soft hover:bg-sand'
            }`}
          >
            {Icon && <Icon className="size-4" />}
            {label}
            {badge ? (
              <span className={`rounded-full px-1.5 text-[10px] ${value === key ? 'bg-gold text-ink' : 'bg-rose-500 text-white'}`}>{badge}</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-56 rounded-xl bg-sand" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-32 rounded-3xl bg-sand" />)}
      </div>
      <div className="h-72 rounded-3xl bg-sand" />
    </div>
  );
}
