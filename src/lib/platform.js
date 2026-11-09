'use client';

// The demo platform: doctors, clinics, patients (family accounts), appointments, live queues,
// prescriptions, reviews, payments, packages and outgoing messages — all in the visitor's
// browser (localStorage). Every portal (patient / doctor / reception / admin / waiting-room
// screen) reads the same store, and changes reach other open tabs instantly.

import { useSyncExternalStore } from 'react';

const KEY = 'mawid-platform-v2';

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
export const fromMin = (m) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
export const nowMin = () => {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
};

const LOCALE = 'ar-SA-u-ca-gregory-nu-latn';
export const fmtDay = (d) => new Intl.DateTimeFormat(LOCALE, { weekday: 'long' }).format(d);
export const fmtDate = (d) => new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' }).format(d);
export const fmtLongDate = (d) => new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
export const fmtTime = (hhmm) => {
  const m = toMin(hhmm);
  const h = Math.floor(m / 60) % 24;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m % 60)} ${h < 12 ? 'ص' : 'م'}`;
};
export const money = (n) => `${Math.round(Number(n) || 0).toLocaleString('en-US')} ر.س`;
export const age = (birth) => {
  if (!birth) return '';
  const b = parseYmd(birth);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a -= 1;
  return a;
};

// ── reference data ────────────────────────────────────────────────────────────
export const SPECIALTIES = ['أسنان', 'جلدية وتجميل', 'نساء وولادة', 'أطفال', 'باطنية وسكري', 'علاج طبيعي', 'نفسية', 'عيون'];
export const CITIES = {
  الرياض: ['النرجس', 'العليا', 'الملقا'],
  جدة: ['الروضة', 'الشاطئ'],
  الدمام: ['الفيصلية', 'الشاطئ'],
};
export const MODES = {
  clinic: { label: 'كشف في العيادة', short: 'عيادة' },
  online: { label: 'استشارة فيديو', short: 'أونلاين' },
  home: { label: 'زيارة منزلية', short: 'منزلية' },
};
export const PAY_METHODS = {
  mada: 'مدى',
  applepay: 'Apple Pay',
  stcpay: 'STC Pay',
  tabby: 'تابي — قسّمها على 4',
  tamara: 'تمارا — قسّمها على 3',
  insurance: 'التأمين الطبي',
  package: 'من رصيد الباقة',
  clinic: 'الدفع في العيادة',
  cash: 'كاش',
  card: 'شبكة',
};
export const STATUS = {
  booked: { label: 'محجوز', cls: 'bg-sky-50 text-sky-700' },
  checked_in: { label: 'في الانتظار', cls: 'bg-amber-50 text-amber-700' },
  in_consult: { label: 'عند الطبيب', cls: 'bg-brand text-white' },
  done: { label: 'تم الكشف', cls: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'ملغي', cls: 'bg-slate-100 text-slate-500' },
  no_show: { label: 'لم يحضر', cls: 'bg-rose-50 text-rose-600' },
};
export const EXTRAS = [
  ['حقنة', 50], ['رسم قلب', 150], ['إيكو', 400], ['تحليل سكر تراكمي', 90], ['أشعة بانوراما', 200],
  ['تنظيف أسنان', 250], ['جلسة ليزر', 600], ['جلسة علاج طبيعي', 300], ['ضماد جرح', 80],
];
export const DRUGS = [
  ['Panadol 500mg', 'قرص', 'كل 6 ساعات عند اللزوم'], ['Panadol Extra', 'قرص', 'كل 8 ساعات'],
  ['Brufen 400mg', 'قرص', 'كل 8 ساعات بعد الأكل'], ['Augmentin 1g', 'قرص', 'كل 12 ساعة'],
  ['Amoxil 500mg', 'كبسولة', 'كل 8 ساعات'], ['Zithromax 500mg', 'قرص', 'مرة يوميًا'],
  ['Nexium 40mg', 'قرص', 'مرة قبل الفطور'], ['Glucophage 850mg', 'قرص', 'مرتين بعد الأكل'],
  ['Januvia 100mg', 'قرص', 'مرة يوميًا'], ['Concor 5mg', 'قرص', 'مرة صباحًا'],
  ['Lipitor 20mg', 'قرص', 'مرة مساءً'], ['Aspirin 81mg', 'قرص', 'مرة يوميًا'],
  ['Ventolin Inhaler', 'بخاخ', 'بختين عند الحاجة'], ['Zyrtec 10mg', 'قرص', 'مرة مساءً'],
  ['Claritine 10mg', 'قرص', 'مرة يوميًا'], ['Otrivin Nasal Spray', 'بخاخ', 'مرتين يوميًا لمدة 5 أيام'],
  ['Fucidin Cream', 'كريم', 'مرتين يوميًا موضعيًا'], ['Betnovate Cream', 'كريم', 'مرة يوميًا موضعيًا'],
  ['Differin Gel', 'جل', 'مرة مساءً'], ['Vitamin D3 50000IU', 'كبسولة', 'مرة أسبوعيًا'],
  ['Folic Acid 5mg', 'قرص', 'مرة يوميًا'], ['Ferrous Sulfate', 'قرص', 'مرة يوميًا'],
  ['Calpol Syrup', 'شراب', '5 مل كل 6 ساعات'], ['Adol Suppository', 'لبوس', 'عند ارتفاع الحرارة'],
  ['Buscopan 10mg', 'قرص', 'كل 8 ساعات عند اللزوم'], ['Motilium 10mg', 'قرص', 'قبل الأكل بنصف ساعة'],
  ['Cipralex 10mg', 'قرص', 'مرة صباحًا'], ['Xanax 0.25mg', 'قرص', 'عند اللزوم'],
  ['Voltaren Gel', 'جل', '3 مرات يوميًا موضعيًا'], ['Myolgin', 'قرص', 'مرتين يوميًا'],
  ['Corsodyl Mouthwash', 'غسول', 'مرتين يوميًا'], ['Sensodyne Toothpaste', 'معجون', 'مرتين يوميًا'],
];

// ── seed ──────────────────────────────────────────────────────────────────────
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const WEEK_STD = { 0: ['09:00', '17:00'], 1: ['09:00', '17:00'], 2: ['09:00', '17:00'], 3: ['09:00', '17:00'], 4: ['09:00', '15:00'], 5: null, 6: ['16:00', '21:00'] };
const WEEK_EVE = { 0: ['15:00', '22:00'], 1: ['15:00', '22:00'], 2: ['15:00', '22:00'], 3: ['15:00', '22:00'], 4: ['15:00', '22:00'], 5: null, 6: null };

const CLINICS = [
  { id: 'c1', name: 'عيادات رِفق الطبية', city: 'الرياض', area: 'النرجس', phone: '0112345678' },
  { id: 'c2', name: 'مجمع الندى الطبي', city: 'جدة', area: 'الروضة', phone: '0126543210' },
  { id: 'c3', name: 'مركز الشفاء التخصصي', city: 'الدمام', area: 'الفيصلية', phone: '0138765432' },
];

const INSURERS = [
  { id: 'i1', name: 'بوبا العربية', coverage: 80 },
  { id: 'i2', name: 'التعاونية', coverage: 80 },
  { id: 'i3', name: 'ميدغلف', coverage: 70 },
  { id: 'i4', name: 'أكسا', coverage: 75 },
  { id: 'i5', name: 'الراجحي تكافل', coverage: 70 },
];

const DOCTORS = [
  { id: 'd1', name: 'د. خالد العمري', gender: 'm', specialty: 'أسنان', title: 'استشاري طب وجراحة الأسنان', clinicId: 'c1', years: 14, price: 150, onlinePrice: 0, homePrice: 0, modes: ['clinic'], insurance: ['i1', 'i2', 'i4'], schedule: WEEK_STD, slot: 20, bio: 'زمالة جراحة الفم، متخصص في زراعة الأسنان والحالات الدقيقة.' },
  { id: 'd2', name: 'د. نوف القحطاني', gender: 'f', specialty: 'أسنان', title: 'أخصائية تجميل الأسنان', clinicId: 'c1', years: 8, price: 200, onlinePrice: 120, homePrice: 0, modes: ['clinic', 'online'], insurance: ['i1', 'i3'], schedule: WEEK_EVE, slot: 30, bio: 'ابتسامة هوليود، التبييض، والقشور التجميلية.' },
  { id: 'd3', name: 'د. فهد الحربي', gender: 'm', specialty: 'جلدية وتجميل', title: 'استشاري الجلدية والليزر', clinicId: 'c1', years: 16, price: 250, onlinePrice: 180, homePrice: 0, modes: ['clinic', 'online'], insurance: ['i1', 'i2', 'i3', 'i4'], schedule: WEEK_STD, slot: 15, bio: 'البورد السعودي في الأمراض الجلدية، خبرة في علاج حب الشباب والصدفية والليزر.' },
  { id: 'd4', name: 'د. ريم الشهري', gender: 'f', specialty: 'نساء وولادة', title: 'استشارية النساء والولادة', clinicId: 'c2', years: 18, price: 300, onlinePrice: 200, homePrice: 0, modes: ['clinic', 'online'], insurance: ['i1', 'i2', 'i5'], schedule: WEEK_STD, slot: 20, bio: 'متابعة الحمل عالي الخطورة وتأخر الإنجاب.' },
  { id: 'd5', name: 'د. سلطان الدوسري', gender: 'm', specialty: 'أطفال', title: 'استشاري طب الأطفال وحديثي الولادة', clinicId: 'c2', years: 12, price: 220, onlinePrice: 150, homePrice: 450, modes: ['clinic', 'online', 'home'], insurance: ['i1', 'i2', 'i3', 'i4', 'i5'], schedule: WEEK_EVE, slot: 15, bio: 'متابعة النمو والتطعيمات وحساسية الأطفال.' },
  { id: 'd6', name: 'د. هيفاء الزهراني', gender: 'f', specialty: 'باطنية وسكري', title: 'استشارية الباطنية والغدد', clinicId: 'c3', years: 15, price: 250, onlinePrice: 170, homePrice: 500, modes: ['clinic', 'online', 'home'], insurance: ['i1', 'i2', 'i3'], schedule: WEEK_STD, slot: 20, bio: 'علاج السكري والغدة الدرقية وضغط الدم.' },
  { id: 'd7', name: 'د. عمر باشا', gender: 'm', specialty: 'علاج طبيعي', title: 'أخصائي العلاج الطبيعي والتأهيل', clinicId: 'c3', years: 10, price: 300, onlinePrice: 0, homePrice: 550, modes: ['clinic', 'home'], insurance: ['i2', 'i4'], schedule: WEEK_EVE, slot: 45, bio: 'تأهيل الإصابات الرياضية وآلام الظهر والرقبة.' },
  { id: 'd8', name: 'د. لمى العتيبي', gender: 'f', specialty: 'نفسية', title: 'استشارية الطب النفسي', clinicId: 'c1', years: 11, price: 400, onlinePrice: 350, homePrice: 0, modes: ['clinic', 'online'], insurance: ['i1'], schedule: WEEK_EVE, slot: 45, bio: 'القلق والاكتئاب واضطرابات النوم، جلسات حضورية وعن بُعد بسرية تامة.' },
  { id: 'd9', name: 'د. ماجد الغامدي', gender: 'm', specialty: 'عيون', title: 'استشاري طب وجراحة العيون', clinicId: 'c2', years: 20, price: 280, onlinePrice: 0, homePrice: 0, modes: ['clinic'], insurance: ['i1', 'i2', 'i3', 'i4', 'i5'], schedule: WEEK_STD, slot: 15, bio: 'تصحيح النظر بالليزك وعلاج المياه البيضاء.' },
];

const PACKAGES = [
  { id: 'p1', name: 'متابعة الحمل الكاملة', doctorId: 'd4', sessions: 9, price: 2200, months: 9, desc: '9 زيارات متابعة + سونار كل زيارة' },
  { id: 'p2', name: 'برنامج العلاج الطبيعي', doctorId: 'd7', sessions: 10, price: 2400, months: 3, desc: '10 جلسات تأهيل بخصم 20%' },
  { id: 'p3', name: 'متابعة السكري الربع سنوية', doctorId: 'd6', sessions: 3, price: 600, months: 3, desc: 'زيارة شهرية + تحليل تراكمي' },
  { id: 'p4', name: 'باقة تقويم الأسنان', doctorId: 'd1', sessions: 12, price: 9000, months: 12, desc: 'تقويم كامل مع المراجعات الشهرية' },
];

const NAMES = [
  'عبدالله الشمري', 'نورة الحربي', 'فيصل المطيري', 'ريم الدوسري', 'تركي الزهراني', 'لمى السبيعي', 'سعود القحطاني',
  'هند العنزي', 'ماجد الشهري', 'أمل الغامدي', 'بندر العتيبي', 'جواهر المالكي', 'يزيد السهلي', 'منيرة البقمي',
  'راكان الرشيدي', 'دانة الجهني', 'ناصر الخالدي', 'شهد الحمدان', 'عبير العمري', 'مشاري الزهراني',
];

const REVIEW_TEXTS = [
  [5, 'دكتور ممتاز وشرح لي الحالة بالتفصيل، والموعد كان بالدقيقة.'],
  [5, 'تعامل راقي جدًا وما انتظرت أبدًا، الله يعطيه العافية.'],
  [4, 'الكشف ممتاز، بس الانتظار كان ربع ساعة.'],
  [5, 'أنصح فيه وبقوة، حجزت من الجوال وكل شيء كان واضح.'],
  [4, 'خبرة واضحة وهدوء في التعامل.'],
  [5, 'العيادة نظيفة والطاقم متعاون، والتذكير وصلني قبل الموعد.'],
  [3, 'الدكتور ممتاز لكن الموقف صعب.'],
];

export const FAMILY_ID = 'me';

function seed() {
  const R = rng(20261110);
  const pick = (a) => a[Math.floor(R() * a.length)];
  const today = new Date();
  const todayKey = ymd(today);
  let n = 0;
  const id = (p) => `${p}${(++n).toString(36)}`;

  const members = [
    { id: 'm1', name: 'محمد العتيبي', relation: 'أنا', gender: 'm', birth: '1990-04-12', phone: '0501234567', blood: 'O+', allergies: ['البنسلين'], chronic: [], meds: ['Vitamin D3 50000IU'], insurance: { insurerId: 'i1', memberNo: 'BUPA-7781203', class: 'VIP' }, files: [] },
    { id: 'm2', name: 'سارة العتيبي', relation: 'الزوجة', gender: 'f', birth: '1993-09-03', phone: '0559876543', blood: 'A+', allergies: [], chronic: [], meds: ['Folic Acid 5mg'], insurance: { insurerId: 'i1', memberNo: 'BUPA-7781204', class: 'VIP' }, files: [] },
    { id: 'm3', name: 'ليان العتيبي', relation: 'الابنة', gender: 'f', birth: '2020-02-18', phone: '0501234567', blood: 'O+', allergies: ['الفول السوداني'], chronic: ['ربو خفيف'], meds: ['Ventolin Inhaler'], insurance: { insurerId: 'i1', memberNo: 'BUPA-7781205', class: 'VIP' }, files: [] },
    { id: 'm4', name: 'عبدالرحمن العتيبي', relation: 'الوالد', gender: 'm', birth: '1957-11-30', phone: '0543217788', blood: 'B+', allergies: [], chronic: ['السكري النوع الثاني', 'ضغط الدم'], meds: ['Glucophage 850mg', 'Concor 5mg', 'Aspirin 81mg'], insurance: null, files: [] },
  ];

  const appts = [];
  const payments = [];
  const reviews = [];
  const prescriptions = [];

  const priceFor = (d, mode) => (mode === 'online' ? d.onlinePrice : mode === 'home' ? d.homePrice : d.price) || d.price;

  // history: 45 days back for analytics
  for (let off = -45; off <= -1; off++) {
    const date = addDays(today, off);
    const key = ymd(date);
    for (const d of DOCTORS) {
      const h = d.schedule[date.getDay()];
      if (!h) continue;
      const count = 1 + Math.floor(R() * 5);
      const [o, c] = h.map(toMin);
      const used = new Set();
      for (let k = 0; k < count; k++) {
        const t = o + Math.floor(R() * Math.floor((c - o) / d.slot)) * d.slot;
        if (used.has(t)) continue;
        used.add(t);
        const roll = R();
        const status = roll < 0.8 ? 'done' : roll < 0.88 ? 'no_show' : 'cancelled';
        const mode = d.modes.length > 1 && R() < 0.2 ? d.modes[1] : 'clinic';
        const amount = priceFor(d, mode);
        const a = { id: id('a'), doctorId: d.id, memberId: null, patientName: pick(NAMES), phone: `05${Math.floor(10000000 + R() * 89999999)}`, date: key, time: fromMin(t), mode, status, queueNo: 0, payment: { method: pick(['mada', 'applepay', 'clinic', 'insurance', 'stcpay']), amount, paid: status === 'done' }, source: R() < 0.7 ? 'online' : 'walkin', createdAt: addDays(date, -2).toISOString() };
        appts.push(a);
        if (status === 'done') {
          const ins = a.payment.method === 'insurance';
          const extra = R() < 0.25 ? [pick(EXTRAS)] : [];
          const items = [['كشف', amount], ...extra];
          const total = items.reduce((s, [, p]) => s + p, 0);
          payments.push({ id: id('p'), apptId: a.id, date: key, items, total, method: ins ? 'insurance' : pick(['cash', 'card', 'card', 'online']), insurerShare: ins ? Math.round(total * 0.8) : 0 });
          if (R() < 0.35) {
            const [rating, text] = pick(REVIEW_TEXTS);
            reviews.push({ id: id('r'), doctorId: d.id, apptId: a.id, name: a.patientName.split(' ')[0], rating, text, date: key });
          }
        }
      }
    }
  }

  // the demo family's own past visits (with prescriptions)
  const famPast = [
    { m: 'm1', d: 'd3', off: -20, time: '10:15', rx: { dx: 'التهاب جلدي تماسي', items: [['Betnovate Cream', 'مرة يوميًا موضعيًا', '7 أيام'], ['Zyrtec 10mg', 'مرة مساءً', '10 أيام']] } },
    { m: 'm3', d: 'd5', off: -12, time: '17:30', rx: { dx: 'التهاب حلق فيروسي', items: [['Calpol Syrup', '5 مل كل 6 ساعات', '5 أيام']] } },
    { m: 'm4', d: 'd6', off: -30, time: '11:00', rx: { dx: 'متابعة السكري وضغط الدم', items: [['Glucophage 850mg', 'مرتين بعد الأكل', '3 أشهر'], ['Concor 5mg', 'مرة صباحًا', '3 أشهر']] } },
    { m: 'm2', d: 'd4', off: -8, time: '12:20', rx: { dx: 'متابعة حمل — الأسبوع 12', items: [['Folic Acid 5mg', 'مرة يوميًا', 'حتى الأسبوع 14'], ['Ferrous Sulfate', 'مرة يوميًا', 'شهر']] } },
  ];
  for (const f of famPast) {
    const d = DOCTORS.find((x) => x.id === f.d);
    const mem = members.find((x) => x.id === f.m);
    const date = ymd(addDays(today, f.off));
    const a = { id: id('a'), doctorId: d.id, memberId: mem.id, patientName: mem.name, phone: mem.phone, date, time: f.time, mode: 'clinic', status: 'done', queueNo: 1, payment: { method: 'insurance', amount: d.price, paid: true }, source: 'online', createdAt: date };
    appts.push(a);
    payments.push({ id: id('p'), apptId: a.id, date, items: [['كشف', d.price]], total: d.price, method: 'insurance', insurerShare: Math.round(d.price * 0.8) });
    prescriptions.push({ id: id('x'), apptId: a.id, doctorId: d.id, memberId: mem.id, date, diagnosis: f.rx.dx, items: f.rx.items.map(([drug, dose, duration]) => ({ drug, dose, duration })), notes: 'مراجعة عند الحاجة.' });
  }
  // one family visit already reviewed, the newest one waits for a review
  reviews.push({ id: id('r'), doctorId: 'd3', apptId: appts.find((a) => a.memberId === 'm1').id, name: 'محمد', rating: 5, text: 'دقيق في التشخيص والعلاج نفع من أول أسبوع.', date: ymd(addDays(today, -19)), verified: true });

  // today: busy queues (times around "now" so the live queue is alive whenever the demo is opened)
  const base = Math.max(8 * 60, Math.min(20 * 60, Math.floor(nowMin() / 10) * 10));
  DOCTORS.forEach((d, di) => {
    if (!d.schedule[today.getDay()]) return;
    // every doctor is at a different point of the day: some busy, some nearly done
    const doneBefore = 1 + ((di * 3) % 6);
    const waitingCount = 1 + ((di * 2) % 4);
    const later = 1 + (di % 3);
    for (let k = -doneBefore; k <= waitingCount + later; k++) {
      const t = base + k * d.slot;
      if (t < 0 || t >= 24 * 60) continue;
      const status = k < 0 ? (R() < 0.12 ? 'no_show' : 'done') : k === 0 ? 'in_consult' : k <= waitingCount ? 'checked_in' : 'booked';
      const name = NAMES[(k + doneBefore + di * 5) % NAMES.length];
      appts.push({ id: id('a'), doctorId: d.id, memberId: null, patientName: name, phone: `05${50000000 + (k + 9) * 1111111 + di}`, date: todayKey, time: fromMin(t), mode: 'clinic', status, queueNo: 0, payment: { method: (k + di) % 3 === 0 ? 'insurance' : 'clinic', amount: d.price, paid: status === 'done' }, source: (k + di) % 4 === 0 ? 'walkin' : 'online', createdAt: addDays(today, -1).toISOString(), checkedInAt: status !== 'booked' ? fromMin(t - 5) : null });
    }
  });
  // the demo patient: in the queue with Dr. Haifa today, 3 people ahead
  const d6 = DOCTORS.find((x) => x.id === 'd6');
  const myToday = { id: id('a'), doctorId: 'd6', memberId: 'm4', patientName: 'عبدالرحمن العتيبي', phone: '0543217788', date: todayKey, time: fromMin(base + 2 * d6.slot + 10), mode: 'clinic', status: 'booked', queueNo: 0, payment: { method: 'clinic', amount: d6.price, paid: false }, source: 'online', createdAt: new Date().toISOString() };
  appts.push(myToday);
  let ahead = 3;
  while (!WEEK_EVE[addDays(today, ahead).getDay()]) ahead += 1;
  appts.push({ id: id('a'), doctorId: 'd2', memberId: 'm1', patientName: 'محمد العتيبي', phone: '0501234567', date: ymd(addDays(today, ahead)), time: '18:30', mode: 'clinic', status: 'booked', queueNo: 0, payment: { method: 'insurance', amount: 200, paid: false }, source: 'online', createdAt: new Date().toISOString() });

  const messages = [
    { id: id('w'), apptId: myToday.id, to: 'عبدالرحمن العتيبي', channel: 'whatsapp', kind: 'confirm', at: addDays(today, -1).toISOString(), text: `تم تأكيد موعد عبدالرحمن مع ${d6.name} اليوم الساعة ${fmtTime(myToday.time)}.` },
    { id: id('w'), apptId: myToday.id, to: 'عبدالرحمن العتيبي', channel: 'whatsapp', kind: 'reminder24', at: addDays(today, -1).toISOString(), text: `⏰ تذكير: موعدكم بكرة مع ${d6.name}. للتأكيد اضغط ✅ أو للإلغاء ❌` },
  ];

  return {
    v: 1,
    clinics: CLINICS,
    insurers: INSURERS,
    doctors: DOCTORS.map((d) => ({ ...d, blocked: [], extra: [] })),
    packages: PACKAGES,
    family: { id: FAMILY_ID, members },
    appts,
    payments,
    reviews,
    prescriptions,
    subscriptions: [{ id: 's1', packageId: 'p3', memberId: 'm4', used: 1, start: ymd(addDays(today, -30)) }],
    messages,
    settings: { reminder24: true, reminder2: true, deposit: false, channel: 'whatsapp' },
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
  if (!cache?.v) {
    cache = seed();
    persist();
  }
  return cache;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
    return true;
  } catch {
    return false; // quota / private mode: keeps working for this visit
  }
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

/** The platform state, or null while prerendering / before hydration. */
export function usePlatform() {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function update(fn) {
  const draft = structuredClone(read());
  const out = fn(draft) || draft;
  cache = out;
  const ok = persist();
  listeners.forEach((l) => l());
  return ok;
}

export function resetPlatform() {
  cache = seed();
  persist();
  listeners.forEach((l) => l());
}

let seq = 0;
export const uid = (p = 'x') => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

// ── selectors ─────────────────────────────────────────────────────────────────
export const doctorById = (s, id) => s.doctors.find((d) => d.id === id);
export const clinicById = (s, id) => s.clinics.find((c) => c.id === id);
export const insurerById = (s, id) => s.insurers.find((i) => i.id === id);
export const memberById = (s, id) => s.family.members.find((m) => m.id === id);
export const priceFor = (d, mode = 'clinic') => (mode === 'online' ? d.onlinePrice : mode === 'home' ? d.homePrice : d.price) || d.price;

export function ratingOf(s, doctorId) {
  const rs = s.reviews.filter((r) => r.doctorId === doctorId && !r.hidden);
  if (!rs.length) return { avg: 0, count: 0 };
  return { avg: Math.round((rs.reduce((t, r) => t + r.rating, 0) / rs.length) * 10) / 10, count: rs.length };
}

const LIVE = new Set(['booked', 'checked_in', 'in_consult', 'done']);

function taken(s, doctorId, date, start, end, ignoreId) {
  const d = doctorById(s, doctorId);
  return s.appts.some((a) => {
    if (a.doctorId !== doctorId || a.date !== date || !LIVE.has(a.status) || a.id === ignoreId) return false;
    const as = toMin(a.time);
    return start < as + d.slot && as < end;
  });
}

/** Free start times for a doctor on a date (respects hours, blocked days, emergency slots, now). */
export function freeSlots(s, doctorId, date, { ignoreId } = {}) {
  const d = doctorById(s, doctorId);
  if (!d || d.blocked.includes(date)) return [];
  const day = parseYmd(date);
  const hours = d.schedule[day.getDay()];
  const isToday = date === ymd(new Date());
  const earliest = isToday ? nowMin() + 15 : -1;
  const out = new Set();
  if (hours) {
    const [o, c] = hours.map(toMin);
    for (let t = o; t + d.slot <= c; t += d.slot) {
      if (t >= earliest && !taken(s, doctorId, date, t, t + d.slot, ignoreId)) out.add(fromMin(t));
    }
  }
  for (const x of d.extra.filter((e) => e.date === date)) {
    const t = toMin(x.time);
    if (t >= earliest && !taken(s, doctorId, date, t, t + d.slot, ignoreId)) out.add(x.time);
  }
  return [...out].sort();
}

export function nextAvailable(s, doctorId, days = 14) {
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const key = ymd(addDays(today, i));
    const slots = freeSlots(s, doctorId, key);
    if (slots.length) return { date: key, time: slots[0], dayOffset: i };
  }
  return null;
}

/** Today's live queue for a doctor: ordered list, who's inside, who's waiting. */
export function queueOf(s, doctorId, date = ymd(new Date())) {
  const list = s.appts
    .filter((a) => a.doctorId === doctorId && a.date === date && a.mode === 'clinic' && a.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((a, i) => ({ ...a, _no: i + 1 }));
  const current = list.find((a) => a.status === 'in_consult') || null;
  const waiting = list.filter((a) => a.status === 'checked_in');
  const upcoming = list.filter((a) => a.status === 'booked');
  const done = list.filter((a) => a.status === 'done' || a.status === 'no_show');
  return { list, current, waiting, upcoming, done };
}

export function positionIn(s, appt) {
  const q = queueOf(s, appt.doctorId, appt.date);
  const me = q.list.find((a) => a.id === appt.id);
  const ahead = q.list.filter((a) => a._no < (me?._no || 0) && ['booked', 'checked_in', 'in_consult'].includes(a.status)).length;
  const d = doctorById(s, appt.doctorId);
  return { no: me?._no || 0, ahead, current: q.current, wait: ahead * d.slot, total: q.list.length, doneCount: q.done.length };
}

export function coverageFor(s, member, doctor) {
  const ins = member?.insurance;
  if (!ins || !doctor.insurance.includes(ins.insurerId)) return null;
  const insurer = insurerById(s, ins.insurerId);
  return insurer ? { insurer, pct: insurer.coverage } : null;
}

// ── actions ───────────────────────────────────────────────────────────────────
function pushMsg(s, appt, kind, text) {
  s.messages.unshift({ id: uid('w'), apptId: appt.id, to: appt.patientName, channel: s.settings.channel, kind, at: new Date().toISOString(), text });
  s.messages = s.messages.slice(0, 300);
}

export function book({ doctorId, memberId = null, patientName, phone, date, time, mode = 'clinic', payment, source = 'online', subscriptionId = null }) {
  const id = uid('a');
  update((s) => {
    const d = doctorById(s, doctorId);
    if (!freeSlots(s, doctorId, date).includes(time) && source === 'online') throw new Error('هذا الموعد لم يعد متاحًا، اختر وقتًا آخر.');
    const m = memberId ? memberById(s, memberId) : null;
    const appt = {
      id, doctorId, memberId, patientName: m?.name || patientName, phone: m?.phone || phone, date, time, mode,
      status: source === 'walkin' ? 'checked_in' : 'booked', queueNo: 0,
      payment: { ...payment, amount: payment?.amount ?? priceFor(d, mode) }, source, createdAt: new Date().toISOString(),
      checkedInAt: source === 'walkin' ? fromMin(nowMin()) : null,
    };
    s.appts.push(appt);
    if (subscriptionId) {
      const sub = s.subscriptions.find((x) => x.id === subscriptionId);
      if (sub) sub.used += 1;
    }
    const when = `${fmtLongDate(parseYmd(date))} الساعة ${fmtTime(time)}`;
    pushMsg(s, appt, 'confirm', `✅ تم تأكيد موعد ${appt.patientName} مع ${d.name} (${MODES[mode].short}) — ${when}.`);
    if (s.settings.reminder24) pushMsg(s, appt, 'reminder24', `⏰ مجدول: تذكير قبل الموعد بـ 24 ساعة مع زر تأكيد / إلغاء.`);
    if (s.settings.reminder2) pushMsg(s, appt, 'reminder2', `⏰ مجدول: تذكير قبل الموعد بساعتين.`);
    return s;
  });
  return id;
}

export function setStatus(apptId, status) {
  update((s) => {
    const a = s.appts.find((x) => x.id === apptId);
    if (!a) return s;
    a.status = status;
    if (status === 'checked_in') a.checkedInAt = fromMin(nowMin());
    if (status === 'cancelled') pushMsg(s, a, 'cancel', `تم إلغاء موعد ${a.patientName} (${fmtTime(a.time)}). نتمنى لك الصحة.`);
    return s;
  });
}

export function reschedule(apptId, date, time) {
  update((s) => {
    const a = s.appts.find((x) => x.id === apptId);
    if (!a) return s;
    if (!freeSlots(s, a.doctorId, date, { ignoreId: a.id }).includes(time)) throw new Error('الموعد الجديد غير متاح.');
    a.date = date;
    a.time = time;
    a.status = 'booked';
    pushMsg(s, a, 'moved', `📅 تم تغيير موعد ${a.patientName} إلى ${fmtLongDate(parseYmd(date))} الساعة ${fmtTime(time)}.`);
    return s;
  });
}

/** Doctor presses "next": the one inside is done, the next waiting patient goes in. */
export function callNext(doctorId) {
  let called = null;
  update((s) => {
    const q = queueOf(s, doctorId);
    if (q.current) s.appts.find((a) => a.id === q.current.id).status = 'done';
    const next = q.waiting[0] || null;
    if (next) {
      const a = s.appts.find((x) => x.id === next.id);
      a.status = 'in_consult';
      called = a;
      pushMsg(s, a, 'turn', `🔔 ${a.patientName}، تفضل للدخول عند ${doctorById(s, doctorId).name}.`);
    }
    return s;
  });
  return called;
}

/** Cancel (or move to the next free slots) every appointment of a doctor on a day; tells each patient. */
export function bulkCancel(doctorId, date, { move = true, reason = 'ظرف طارئ' } = {}) {
  const result = [];
  update((s) => {
    const d = doctorById(s, doctorId);
    const affected = s.appts.filter((a) => a.doctorId === doctorId && a.date === date && ['booked', 'checked_in'].includes(a.status));
    if (!d.blocked.includes(date)) d.blocked.push(date);
    for (const a of affected) {
      let alt = null;
      if (move) {
        for (let i = 1; i <= 14 && !alt; i++) {
          const key = ymd(addDays(parseYmd(date), i));
          const slot = freeSlots(s, doctorId, key)[0];
          if (slot) alt = { date: key, time: slot };
        }
      }
      if (alt) {
        a.date = alt.date;
        a.time = alt.time;
        a.status = 'booked';
        pushMsg(s, a, 'moved', `نعتذر منك 🙏 ${d.name} عنده ${reason} يوم ${fmtLongDate(parseYmd(date))}. نقلنا موعدك إلى ${fmtLongDate(parseYmd(alt.date))} الساعة ${fmtTime(alt.time)}. للتغيير اضغط هنا.`);
      } else {
        a.status = 'cancelled';
        pushMsg(s, a, 'cancel', `نعتذر منك 🙏 تم إلغاء موعدك مع ${d.name} يوم ${fmtLongDate(parseYmd(date))} بسبب ${reason}. احجز موعد جديد من الرابط.`);
      }
      result.push({ name: a.patientName, alt });
    }
    return s;
  });
  return result;
}

export function addPrescription({ apptId, doctorId, memberId, diagnosis, items, notes }) {
  const id = uid('x');
  update((s) => {
    s.prescriptions.unshift({ id, apptId, doctorId, memberId, date: ymd(new Date()), diagnosis, items, notes });
    const a = s.appts.find((x) => x.id === apptId);
    if (a) pushMsg(s, a, 'rx', `💊 روشتة ${a.patientName} من ${doctorById(s, doctorId).name} جاهزة في ملفك الطبي.`);
    return s;
  });
  return id;
}

export function addReview({ apptId, rating, text }) {
  update((s) => {
    const a = s.appts.find((x) => x.id === apptId);
    if (!a || a.status !== 'done' || s.reviews.some((r) => r.apptId === apptId)) throw new Error('التقييم متاح فقط بعد حضور الكشف ومرة واحدة.');
    s.reviews.unshift({ id: uid('r'), doctorId: a.doctorId, apptId, name: a.patientName.split(' ')[0], rating, text, date: ymd(new Date()), verified: true });
    return s;
  });
}

export function addPayment({ apptId, items, method, insurerShare = 0 }) {
  update((s) => {
    const total = items.reduce((t, [, p]) => t + Number(p || 0), 0);
    s.payments.unshift({ id: uid('p'), apptId, date: ymd(new Date()), items, total, method, insurerShare });
    const a = s.appts.find((x) => x.id === apptId);
    if (a) a.payment = { ...a.payment, paid: true };
    return s;
  });
}

export const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
