'use client';

import { useEffect, useRef, useState } from 'react';

/** Hero word that cycles through specialties. */
export function RotatingWord({ words, interval = 2200 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      {/* the widest word reserves the space so the line never jumps */}
      <span className="invisible col-start-1 row-start-1">{words.reduce((a, b) => (b.length > a.length ? b : a))}</span>
      {words.map((w, k) => (
        <span
          key={w}
          aria-hidden={k !== i}
          className={`col-start-1 row-start-1 transition-all duration-500 ease-out ${
            k === i ? 'translate-y-0 opacity-100' : k === (i - 1 + words.length) % words.length ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0'
          }`}
        >
          {w}
        </span>
      ))}
    </span>
  );
}

/** Number that counts up the first time it is seen. */
export function CountUp({ to, prefix = '', suffix = '', duration = 1400 }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dur = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = dur ? Math.min(1, (now - start) / dur) : 1;
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {v.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}
