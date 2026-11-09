'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCheck, Stethoscope } from 'lucide-react';

const SCRIPT = [
  { from: 'clinic', text: 'أهلًا محمد 👋\nتم تأكيد موعدك في عيادات رِفق\n🦷 كشف أسنان مع د. خالد العمري\n📅 الخميس 12 نوفمبر — 5:30 م', time: '2:14 م' },
  { from: 'clinic', text: '⏰ تذكير: موعدك بكرة الساعة 5:30 م\nنرجو الحضور قبل الموعد بـ 10 دقائق.', time: '5:30 م', actions: true },
  { from: 'patient', text: '✅ تأكيد الحضور', time: '5:32 م' },
  { from: 'clinic', text: 'شكرًا لك! نشوفك بكرة 🌿\nموقع العيادة: maps.app/rifq', time: '5:32 م' },
];

/** A WhatsApp-style chat that plays the confirmation → reminder → patient confirms flow, on loop. */
export default function WhatsAppDemo() {
  const box = useRef(null);
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setStarted(true), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let t;
    if (shown < SCRIPT.length) {
      const next = SCRIPT[shown];
      // the clinic "types" before each of its messages
      if (next.from === 'clinic' && !typing) {
        t = setTimeout(() => setTyping(true), shown === 0 ? 300 : 900);
      } else {
        t = setTimeout(() => {
          setTyping(false);
          setShown((n) => n + 1);
        }, next.from === 'clinic' ? 1300 : 1100);
      }
    } else {
      t = setTimeout(() => setShown(0), 4200); // replay
    }
    return () => clearTimeout(t);
  }, [started, shown, typing]);

  return (
    <div ref={box} className="mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border border-line bg-white shadow-lift">
      <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
        <span className="grid size-10 place-items-center rounded-full bg-white/15">
          <Stethoscope className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold">عيادات رِفق الطبية</p>
          <p className="text-[11px] text-white/70">{typing ? 'يكتب الآن…' : 'حساب أعمال رسمي'}</p>
        </div>
      </div>
      <div
        className="flex h-[400px] flex-col justify-end gap-2 overflow-hidden p-3"
        style={{ background: '#efeae2 radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 0) 0 0 / 18px 18px' }}
        aria-live="polite"
      >
        {SCRIPT.slice(0, shown).map((m, k) => (
          <div key={`${k}-${m.time}`} className={`rise flex ${m.from === 'patient' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[82%] rounded-2xl px-3 py-2 text-[13px] leading-6 shadow-sm ${
                m.from === 'patient' ? 'rounded-tl-sm bg-[#d9fdd3]' : 'rounded-tr-sm bg-white'
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
              <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                {m.time} {m.from === 'patient' && <CheckCheck className="size-3.5 text-sky-500" />}
              </p>
              {m.actions && (
                <div className="-mx-3 -mb-2 mt-2 grid grid-cols-2 border-t border-slate-100 text-center text-[13px] font-semibold text-[#027eb5]">
                  <span className={`py-2 ${shown > k + 1 ? 'bg-sky-50' : ''}`}>تأكيد الحضور</span>
                  <span className="border-r border-slate-100 py-2">تغيير الموعد</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-tr-sm bg-white px-4 py-3 shadow-sm">
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
