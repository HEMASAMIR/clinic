'use client';

import { useState } from 'react';
import { Clock, Pencil, Plus, Trash2 } from 'lucide-react';
import { money, update } from '@/lib/demo-store';
import { Button, Card, Field, Modal, PageHead, inputCls } from './ui';

const COLORS = ['#0d7a6f', '#c99a2e', '#7c5cbf', '#d9536f', '#2f80c9', '#b8573a'];

export default function Services({ state }) {
  const [editing, setEditing] = useState(null); // service object or {} for new

  const remove = (id) => {
    if (state.bookings.some((b) => b.serviceId === id && b.status === 'confirmed')) {
      window.alert('هذه الخدمة عليها حجوزات قادمة — ألغِها أولًا.');
      return;
    }
    if (!window.confirm('حذف الخدمة؟')) return;
    update((s) => {
      s.services = s.services.filter((x) => x.id !== id);
      s.staff.forEach((p) => (p.services = p.services.filter((x) => x !== id)));
      return s;
    });
  };

  return (
    <div className="rise">
      <PageHead
        title="الخدمات"
        sub="الخدمات والأسعار والمدد اللي تظهر لمرضاك في صفحة الحجز"
        action={<Button onClick={() => setEditing({})}><Plus className="size-4" /> خدمة جديدة</Button>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {state.services.map((s) => (
          <Card key={s.id} className="flex items-start gap-3">
            <span className="mt-1 h-12 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-muted">{s.category}</p>
              <p className="font-bold">{s.name}</p>
              <p className="mt-2 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-muted"><Clock className="size-3.5" /> {s.duration} د</span>
                <span className="font-bold text-brand">{money(s.price)}</span>
              </p>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => setEditing(s)} aria-label="تعديل" className="grid size-8 place-items-center rounded-lg hover:bg-sand"><Pencil className="size-4" /></button>
              <button type="button" onClick={() => remove(s.id)} aria-label="حذف" className="grid size-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 className="size-4" /></button>
            </div>
          </Card>
        ))}
      </div>
      {editing && <ServiceForm service={editing} state={state} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ServiceForm({ service, state, onClose }) {
  const isNew = !service.id;
  const [f, setF] = useState({
    name: service.name || '',
    category: service.category || state.services[0]?.category || 'عام',
    duration: service.duration || 30,
    price: service.price || 100,
    color: service.color || COLORS[state.services.length % COLORS.length],
  });
  const set = (k, num) => (e) => setF((v) => ({ ...v, [k]: num ? Number(e.target.value) : e.target.value }));

  const save = (e) => {
    e.preventDefault();
    if (!f.name.trim()) return;
    update((s) => {
      if (isNew) {
        const id = `s${Date.now().toString(36)}`;
        s.services.push({ id, ...f, name: f.name.trim() });
        s.staff.forEach((p) => p.services.push(id)); // everyone can do it until the owner says otherwise
      } else {
        Object.assign(s.services.find((x) => x.id === service.id), f, { name: f.name.trim() });
      }
      return s;
    });
    onClose();
  };

  return (
    <Modal title={isNew ? 'خدمة جديدة' : 'تعديل الخدمة'} onClose={onClose}>
      <form onSubmit={save} className="grid gap-4">
        <Field label="اسم الخدمة"><input required className={inputCls} value={f.name} onChange={set('name')} maxLength={40} /></Field>
        <Field label="التصنيف"><input className={inputCls} value={f.category} onChange={set('category')} maxLength={20} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="المدة (دقيقة)">
            <select className={inputCls} value={f.duration} onChange={set('duration', true)}>
              {[15, 30, 45, 60, 75, 90, 120, 150, 180].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="السعر (ر.س)"><input type="number" min={0} className={inputCls} value={f.price} onChange={set('price', true)} /></Field>
        </div>
        <Field label="اللون في التقويم">
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setF((v) => ({ ...v, color: c }))} aria-label={c}
                className={`size-8 rounded-full ring-offset-2 ${f.color === c ? 'ring-2 ring-ink' : ''}`} style={{ background: c }} />
            ))}
          </div>
        </Field>
        <Button type="submit" className="py-3">حفظ</Button>
      </form>
    </Modal>
  );
}
