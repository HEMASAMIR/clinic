'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Maximize, Volume2, VolumeX } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
import { queueOf, usePlatform } from '@/lib/platform';

/** Waiting-room TV: who is inside each doctor's room and who is next. Live across tabs. */
export default function QueueScreen() {
  const s = usePlatform();
  const [clinic, setClinic] = useState('all');
  const [sound, setSound] = useState(false);
  const [clock, setClock] = useState('');
  const [flash, setFlash] = useState(null);
  const last = useRef({});
  const audio = useRef(null);

  useEffect(() => {
    const tick = () => setClock(new Intl.DateTimeFormat('ar-SA-u-nu-latn', { hour: 'numeric', minute: '2-digit' }).format(new Date()));
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, []);

  // chime + highlight whenever a doctor calls a new patient
  useEffect(() => {
    if (!s) return;
    let changed = null;
    for (const d of s.doctors) {
      const cur = queueOf(s, d.id).current?.id || null;
      if (last.current[d.id] !== undefined && cur && last.current[d.id] !== cur) changed = d.id;
      last.current[d.id] = cur;
    }
    if (!changed) return;
    const t1 = setTimeout(() => setFlash(changed), 0);
    const t2 = setTimeout(() => setFlash(null), 4000);
    if (sound && audio.current) {
      const ctx = audio.current;
      [880, 660].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.35);
        g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + i * 0.35 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.35 + 0.33);
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + i * 0.35);
        o.stop(ctx.currentTime + i * 0.35 + 0.35);
      });
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [s, sound]);

  if (!s) return <div className="min-h-dvh bg-ink" />;

  const docs = s.doctors
    .filter((d) => clinic === 'all' || d.clinicId === clinic)
    .map((d) => ({ d, q: queueOf(s, d.id) }))
    .filter((x) => x.q.list.length);

  const mask = (name) => {
    const [first, ...rest] = name.split(' ');
    return `${first} ${rest.length ? `${rest[rest.length - 1][0]}.` : ''}`;
  };

  return (
    <div className="min-h-dvh bg-[#06141b] text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <LogoMark className="size-11" />
          <div>
            <p className="text-xl font-bold">{clinic === 'all' ? 'شاشة الانتظار' : s.clinics.find((c) => c.id === clinic).name}</p>
            <p className="text-xs text-white/50">نرجو الانتباه للشاشة — سيظهر رقمك عند حلول دورك</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={clinic} onChange={(e) => setClinic(e.target.value)} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold outline-none">
            <option value="all" className="text-ink">كل العيادات</option>
            {s.clinics.map((c) => <option key={c.id} value={c.id} className="text-ink">{c.name}</option>)}
          </select>
          <button type="button" aria-label="الصوت" onClick={() => { if (!audio.current) audio.current = new AudioContext(); setSound((v) => !v); }}
            className={`grid size-10 place-items-center rounded-xl ${sound ? 'bg-brand' : 'bg-white/10'}`}>
            {sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </button>
          <button type="button" aria-label="ملء الشاشة" onClick={() => document.documentElement.requestFullscreen?.()} className="grid size-10 place-items-center rounded-xl bg-white/10">
            <Maximize className="size-5" />
          </button>
          <span className="rounded-xl bg-white/10 px-4 py-2 text-lg font-bold tabular-nums">{clock}</span>
          <Link href="/reception" className="grid size-10 place-items-center rounded-xl bg-white/10" aria-label="رجوع للاستقبال"><ArrowRight className="size-5" /></Link>
        </div>
      </header>

      <main className="grid gap-5 p-6 sm:p-10 md:grid-cols-2 xl:grid-cols-3">
        {docs.length === 0 && <p className="col-span-full py-24 text-center text-2xl text-white/50">لا توجد عيادات تعمل الآن</p>}
        {docs.map(({ d, q }) => {
          const next = q.waiting.slice(0, 3);
          const hot = flash === d.id;
          return (
            <section key={d.id} className={`overflow-hidden rounded-3xl border transition-all duration-500 ${hot ? 'scale-[1.02] border-gold bg-gold/15 shadow-[0_0_60px_rgb(201_154_46/0.35)]' : 'border-white/10 bg-white/[0.04]'}`}>
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div>
                  <p className="text-lg font-bold">{d.name}</p>
                  <p className="text-xs text-white/50">{d.specialty}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">ينتظر {q.waiting.length}</span>
              </div>
              <div className="px-6 py-6 text-center">
                <p className="text-sm text-white/50">الرقم الحالي</p>
                <p key={q.current?.id || 'none'} className={`rise text-8xl font-bold tabular-nums ${hot ? 'text-gold' : 'text-white'}`}>{q.current ? q.current._no : '—'}</p>
                <p className="mt-2 text-lg font-semibold text-white/80">{q.current ? mask(q.current.patientName) : 'بانتظار المريض التالي'}</p>
              </div>
              <div className="grid grid-cols-3 border-t border-white/10">
                {[0, 1, 2].map((k) => (
                  <div key={k} className="border-l border-white/10 py-3 text-center last:border-l-0">
                    <p className="text-[10px] text-white/40">{k === 0 ? 'التالي' : 'بعده'}</p>
                    <p className="text-2xl font-bold tabular-nums text-white/80">{next[k]?._no || '—'}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
      <footer className="fixed inset-x-0 bottom-0 overflow-hidden border-t border-white/10 bg-brand/90 py-2.5 text-sm font-semibold">
        <div className="marquee whitespace-nowrap">
          احجز موعدك القادم من جوالك عبر موعِد • تابع دورك من البيت بدون انتظار • نتمنى لكم دوام الصحة والعافية 🌿 •
          احجز موعدك القادم من جوالك عبر موعِد • تابع دورك من البيت بدون انتظار • نتمنى لكم دوام الصحة والعافية 🌿
        </div>
      </footer>
    </div>
  );
}
