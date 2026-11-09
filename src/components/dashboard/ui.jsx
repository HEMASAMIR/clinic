'use client';

import { X } from 'lucide-react';
import { STATUS } from '@/lib/demo-store';

export function Card({ className = '', children }) {
  return <div className={`rounded-3xl border border-line bg-white p-5 shadow-soft ${className}`}>{children}</div>;
}

export function PageHead({ title, sub, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.confirmed;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>{s.label}</span>;
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    dark: 'bg-ink text-white hover:bg-ink/90',
    soft: 'bg-brand-soft text-brand-dark hover:bg-brand/15',
    ghost: 'border border-line bg-white hover:border-brand hover:text-brand',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
  };
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-40 ${styles[variant]} ${className}`}
    />
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10';

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="rise max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:max-w-lg sm:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="grid size-9 place-items-center rounded-xl hover:bg-sand">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted">
      {Icon && <Icon className="size-8 text-line" />}
      {text}
    </div>
  );
}
