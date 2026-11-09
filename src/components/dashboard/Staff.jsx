'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { update, ymd } from '@/lib/demo-store';
import { Button, Card, Field, Modal, PageHead, inputCls } from './ui';

const WEEK = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function Staff({ state }) {
  const [adding, setAdding] = useState(false);
  const today = ymd(new Date());

  const toggle = (staffId, key, value) =>
    update((s) => {
      const p = s.staff.find((x) => x.id === staffId);
      p[key] = p[key].includes(value) ? p[key].filter((x) => x !== value) : [...p[key], value];
      return s;
    });

  return (
    <div className="rise">
      <PageHead
        title="الموظفين"
        sub="مين يقدّم أي خدمة، وأيام الإجازة — والنظام يوزّع الحجوزات تلقائيًا"
        action={<Button onClick={() => setAdding(true)}><Plus className="size-4" /> موظف جديد</Button>}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {state.staff.map((p) => {
          const todayCount = state.bookings.filter((b) => b.staffId === p.id && b.date === today && b.status === 'confirmed').length;
          return (
            <Card key={p.id}>
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand text-lg font-bold text-white">{p.name[0]}</span>
                <div className="flex-1">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-muted">{p.role}</p>
                </div>
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark">{todayCount} اليوم</span>
              </div>
              <p className="mb-2 mt-5 text-xs font-bold text-ink-soft">الخدمات</p>
              <div className="flex flex-wrap gap-1.5">
                {state.services.map((s) => {
                  const on = p.services.includes(s.id);
                  return (
                    <button key={s.id} type="button" onClick={() => toggle(p.id, 'services', s.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${on ? 'bg-ink text-white' : 'bg-sand text-muted'}`}>
                      {s.name}
                    </button>
                  );
                })}
              </div>
              <p className="mb-2 mt-4 text-xs font-bold text-ink-soft">أيام الإجازة</p>
              <div className="flex flex-wrap gap-1.5">
                {WEEK.map((d, i) => {
                  const off = p.off.includes(i);
                  return (
                    <button key={d} type="button" onClick={() => toggle(p.id, 'off', i)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${off ? 'bg-rose-50 text-rose-600' : 'bg-sand text-muted'}`}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
      {adding && <StaffForm onClose={() => setAdding(false)} />}
    </div>
  );
}

function StaffForm({ onClose }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const save = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    update((s) => {
      s.staff.push({ id: `e${Date.now().toString(36)}`, name: name.trim(), role: role.trim() || 'موظف', services: s.services.map((x) => x.id), off: [] });
      return s;
    });
    onClose();
  };
  return (
    <Modal title="موظف جديد" onClose={onClose}>
      <form onSubmit={save} className="grid gap-4">
        <Field label="الاسم"><input required autoFocus className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={30} /></Field>
        <Field label="المسمى"><input className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} maxLength={40} placeholder="مثال: خبيرة شعر" /></Field>
        <Button type="submit" className="py-3">إضافة</Button>
      </form>
    </Modal>
  );
}
