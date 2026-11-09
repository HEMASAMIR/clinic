'use client';

// Demo data for the live booking page and the owner dashboard. Kept in the visitor's browser
// (localStorage), so every visitor gets their own sandbox: a booking made on /demo shows up
// on /dashboard right away — even across tabs.

import { useSyncExternalStore } from 'react';

const KEY = 'mawid-demo-v1';

export const SLOT_STEP = 30; // minutes

// ── dates ─────────────────────────────────────────────────────────────────────
export const pad = (n) => String(n).padStart(2, '0');
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseYmd = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
export const fromMin = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

const LOCALE = 'ar-SA-u-ca-gregory-nu-latn';
export const fmtDay = (d) => new Intl.DateTimeFormat(LOCALE, { weekday: 'long' }).format(d);
export const fmtDate = (d) => new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' }).format(d);
export const fmtLongDate = (d) =>
  new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
export const fmtTime = (hhmm) => {
  const m = toMin(hhmm);
  const h = Math.floor(m / 60);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m % 60)} ${h < 12 ? 'ص' : 'م'}`;
};

// ── seed ──────────────────────────────────────────────────────────────────────
// Weekday index: 0 = Sunday … 5 = Friday, 6 = Saturday.
const HOURS = {
  0: ['10:00', '22:00'],
  1: ['10:00', '22:00'],
  2: ['10:00', '22:00'],
  3: ['10:00', '22:00'],
  4: ['10:00', '23:00'],
  5: ['16:00', '23:00'],
  6: ['10:00', '22:00'],
};

const SERVICES = [
  { id: 's1', name: 'قص وتصفيف', category: 'الشعر', duration: 45, price: 120, color: '#0d7a6f' },
  { id: 's2', name: 'صبغة كاملة', category: 'الشعر', duration: 120, price: 380, color: '#c99a2e' },
  { id: 's3', name: 'بروتين وعلاج', category: 'الشعر', duration: 90, price: 450, color: '#7c5cbf' },
  { id: 's4', name: 'مانيكير وباديكير', category: 'الأظافر', duration: 60, price: 160, color: '#d9536f' },
  { id: 's5', name: 'تنظيف بشرة', category: 'البشرة', duration: 60, price: 220, color: '#2f80c9' },
  { id: 's6', name: 'مكياج سهرة', category: 'المكياج', duration: 75, price: 350, color: '#b8573a' },
];

const STAFF = [
  { id: 'e1', name: 'نورة', role: 'خبيرة شعر', services: ['s1', 's2', 's3'], off: [5] },
  { id: 'e2', name: 'ريم', role: 'أخصائية بشرة وأظافر', services: ['s4', 's5'], off: [0] },
  { id: 'e3', name: 'هيا', role: 'خبيرة مكياج وشعر', services: ['s1', 's6'], off: [] },
];

const CUSTOMERS = [
  ['سارة العتيبي', '0501234567'],
  ['منيرة القحطاني', '0559876543'],
  ['لمى الشمري', '0543217788'],
  ['جود الحربي', '0532224411'],
  ['دانة المطيري', '0566781234'],
  ['شهد الدوسري', '0517654321'],
  ['عبير الزهراني', '0581112233'],
  ['رهف السبيعي', '0598887766'],
];

let seq = 0;
const uid = () => `b${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function seed() {
  const today = new Date();
  const bookings = [];
  // A believable week around today: past days done, today busy, coming days filling up.
  const plan = [
    [-6, '12:00', 's1', 'e1', 'done'], [-6, '17:00', 's5', 'e2', 'done'], [-6, '20:00', 's6', 'e3', 'done'],
    [-5, '11:00', 's4', 'e2', 'done'], [-5, '18:00', 's2', 'e1', 'done'],
    [-4, '13:00', 's1', 'e3', 'done'], [-4, '16:30', 's3', 'e1', 'done'], [-4, '19:00', 's4', 'e2', 'done'], [-4, '21:00', 's1', 'e3', 'no_show'],
    [-3, '11:00', 's1', 'e1', 'done'], [-3, '13:00', 's4', 'e2', 'done'], [-3, '17:00', 's6', 'e3', 'done'],
    [-2, '12:00', 's2', 'e1', 'done'], [-2, '16:00', 's5', 'e2', 'no_show'], [-2, '19:00', 's1', 'e3', 'done'],
    [-1, '10:30', 's3', 'e1', 'done'], [-1, '15:00', 's4', 'e2', 'done'], [-1, '18:00', 's6', 'e3', 'cancelled'],
    [0, '10:00', 's1', 'e1', 'confirmed'], [0, '11:30', 's4', 'e2', 'confirmed'], [0, '13:00', 's2', 'e1', 'confirmed'],
    [0, '16:00', 's5', 'e2', 'confirmed'], [0, '17:30', 's6', 'e3', 'confirmed'], [0, '20:00', 's1', 'e3', 'confirmed'],
    [1, '12:00', 's3', 'e1', 'confirmed'], [1, '18:30', 's4', 'e2', 'confirmed'],
    [2, '11:00', 's1', 'e3', 'confirmed'], [2, '17:00', 's2', 'e1', 'confirmed'],
    [3, '19:00', 's6', 'e3', 'confirmed'],
  ];
  plan.forEach(([offset, time, serviceId, staffId, status], i) => {
    const date = addDays(today, offset);
    if (STAFF.find((s) => s.id === staffId).off.includes(date.getDay())) return;
    const [name, phone] = CUSTOMERS[i % CUSTOMERS.length];
    bookings.push({
      id: uid(),
      date: ymd(date),
      time,
      serviceId,
      staffId,
      customer: { name, phone },
      status,
      source: i % 4 === 0 ? 'walkin' : 'link',
      createdAt: addDays(date, -2).toISOString(),
    });
  });
  return {
    business: {
      name: 'صالون لمسة',
      city: 'الرياض — حي الملقا',
      phone: '0112345678',
      slug: 'lamsa',
      hours: HOURS,
      reminders: true,
      deposit: false,
    },
    services: SERVICES,
    staff: STAFF,
    bookings,
  };
}

// ── store ─────────────────────────────────────────────────────────────────────
let cache = null;
const listeners = new Set();

function read() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : null;
  } catch {
    cache = null;
  }
  if (!cache?.business) {
    cache = seed();
    persist();
  }
  return cache;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* private mode — the demo still works for this visit */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb) {
  listeners.add(cb);
  const onStorage = (e) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

/** The demo state, or null while rendering on the server / before hydration. */
export function useDemo() {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function update(fn) {
  const next = fn(structuredClone(read()));
  cache = next;
  persist();
  emit();
}

export function resetDemo() {
  cache = seed();
  persist();
  emit();
}

// ── booking rules ─────────────────────────────────────────────────────────────
export const serviceById = (state, id) => state.services.find((s) => s.id === id);
export const staffById = (state, id) => state.staff.find((s) => s.id === id);
export const staffFor = (state, serviceId) => state.staff.filter((s) => s.services.includes(serviceId));

const ACTIVE = new Set(['confirmed', 'done']);

function busy(state, staffId, date, start, end, ignoreId) {
  return state.bookings.some((b) => {
    if (b.staffId !== staffId || b.date !== date || !ACTIVE.has(b.status) || b.id === ignoreId) return false;
    const s = serviceById(state, b.serviceId);
    const bs = toMin(b.time);
    const be = bs + (s?.duration || SLOT_STEP);
    return start < be && bs < end;
  });
}

/**
 * Free start times on a date for a service. staffId = null means "any available".
 * Returns [{ time, staffId }].
 */
export function freeSlots(state, { date, serviceId, staffId = null, now = new Date() }) {
  const service = serviceById(state, serviceId);
  if (!service) return [];
  const day = parseYmd(date);
  const hours = state.business.hours[day.getDay()];
  if (!hours) return [];
  const [open, close] = hours.map(toMin);
  const candidates = (staffId ? [staffById(state, staffId)] : staffFor(state, serviceId)).filter(
    (s) => s && s.services.includes(serviceId) && !s.off.includes(day.getDay()),
  );
  const isToday = ymd(now) === date;
  const earliest = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : 0;
  const out = [];
  for (let t = open; t + service.duration <= close; t += SLOT_STEP) {
    if (t < earliest) continue;
    const who = candidates.find((s) => !busy(state, s.id, date, t, t + service.duration));
    if (who) out.push({ time: fromMin(t), staffId: who.id });
  }
  return out;
}

export function addBooking({ date, time, serviceId, staffId, customer, source = 'link' }) {
  const id = uid();
  update((s) => {
    const service = serviceById(s, serviceId);
    if (!service || busy(s, staffId, date, toMin(time), toMin(time) + service.duration)) {
      throw new Error('هذا الموعد لم يعد متاحًا، اختر وقتًا آخر.');
    }
    s.bookings.push({ id, date, time, serviceId, staffId, customer, status: 'confirmed', source, createdAt: new Date().toISOString() });
    return s;
  });
  return id;
}

export function setBookingStatus(id, status) {
  update((s) => {
    const b = s.bookings.find((x) => x.id === id);
    if (b) b.status = status;
    return s;
  });
}

export const STATUS = {
  confirmed: { label: 'مؤكد', cls: 'bg-brand-soft text-brand-dark' },
  done: { label: 'مكتمل', cls: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'ملغي', cls: 'bg-slate-100 text-slate-500 line-through' },
  no_show: { label: 'لم يحضر', cls: 'bg-rose-50 text-rose-600' },
};

export const money = (n) => `${Number(n).toLocaleString('en-US')} ر.س`;
