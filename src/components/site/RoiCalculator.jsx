'use client';

import { useState } from 'react';
import { TrendingDown, TrendingUp, Clock } from 'lucide-react';

const WORK_DAYS = 26; // per month
// Stated assumptions (shown under the result): no-shows cut in half, ~60% of bookings stop
// needing a phone call of ~3 minutes.
const RECOVER = 0.5;
const CALLS_SHARE = 0.6;
const CALL_MIN = 3;

function Slider({ label, value, min, max, step, unit, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm font-semibold">
        {label}
        <span className="rounded-lg bg-brand-soft px-2.5 py-1 text-sm font-bold tabular-nums text-brand-dark">
          {value.toLocaleString('en-US')} {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range mt-3 w-full"
        style={{ '--p': `${pct}%` }}
      />
    </label>
  );
}

/** "How much do no-shows cost your clinic?" — a sales tool with every assumption written out. */
export default function RoiCalculator() {
  const [daily, setDaily] = useState(25);
  const [price, setPrice] = useState(250);
  const [rate, setRate] = useState(15);

  const monthly = daily * WORK_DAYS;
  const missed = Math.round(monthly * (rate / 100));
  const loss = missed * price;
  const saved = Math.round(loss * RECOVER);
  const hours = Math.round((monthly * CALLS_SHARE * CALL_MIN) / 60);

  return (
    <div className="grid overflow-hidden rounded-[2rem] border border-line bg-white shadow-lift lg:grid-cols-2">
      <div className="space-y-7 p-7 sm:p-10">
        <Slider label="عدد المواعيد يوميًا" value={daily} min={5} max={150} step={5} unit="موعد" onChange={setDaily} />
        <Slider label="متوسط قيمة الزيارة" value={price} min={50} max={1500} step={50} unit="ر.س" onChange={setPrice} />
        <Slider label="نسبة المرضى اللي ما يحضرون" value={rate} min={0} max={40} step={1} unit="%" onChange={setRate} />
      </div>
      <div className="relative flex flex-col justify-center gap-5 bg-ink p-7 text-white sm:p-10">
        <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-brand/30 blur-3xl" />
        <div className="relative">
          <p className="flex items-center gap-2 text-sm text-white/65">
            <TrendingDown className="size-4 text-rose-400" /> عيادتك تخسر شهريًا بسبب الغياب تقريبًا
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-rose-300 sm:text-5xl">
            {loss.toLocaleString('en-US')} <span className="text-xl">ر.س</span>
          </p>
          <p className="mt-1 text-xs text-white/50">{missed.toLocaleString('en-US')} موعد ضايع من {monthly.toLocaleString('en-US')} موعد في الشهر</p>
        </div>
        <div className="relative grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <p className="flex items-center gap-1.5 text-xs text-white/65"><TrendingUp className="size-4 text-gold" /> ممكن ترجع لك شهريًا</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-gold">{saved.toLocaleString('en-US')} ر.س</p>
            <p className="text-[11px] text-white/45">= {(saved * 12).toLocaleString('en-US')} ر.س في السنة</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <p className="flex items-center gap-1.5 text-xs text-white/65"><Clock className="size-4 text-emerald-300" /> وقت استقبال توفّره</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-300">{hours} ساعة</p>
            <p className="text-[11px] text-white/45">مكالمات حجز ما تحتاجها كل شهر</p>
          </div>
        </div>
        <p className="relative text-[11px] leading-5 text-white/40">
          * تقدير مبني على {WORK_DAYS} يوم عمل شهريًا، وتقليل الغياب للنصف بالتذكير والعربون، وإن {CALLS_SHARE * 100}% من الحجوزات تتم
          أونلاين بدل مكالمة مدتها {CALL_MIN} دقائق. النتائج الفعلية تختلف من عيادة لأخرى.
        </p>
      </div>
    </div>
  );
}
