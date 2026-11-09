'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
import { whatsappLink } from '@/config/site';

const STORE = 'mawid-chat-v1';
const WELCOME = {
  role: 'assistant',
  content:
    'حيّاك الله 👋 أنا **مساعد موعِد**.\nأجاوبك عن الأسعار والمميزات، وأوضح لك كيف ننظّم مواعيد عيادتك ونقلّل غياب المرضى.\nوش تحب تعرف؟\n[[chips: كم الأسعار؟ | وش يميّزكم؟ | أبغى أجرّب | كلّمني واتساب]]',
};

/** Splits a reply into visible text + its control lines. */
function parse(raw) {
  let text = raw;
  let chips = [];
  let whatsapp = false;
  text = text.replace(/\[\[chips:([^\]]*)\]\]/g, (_, list) => {
    chips = list.split('|').map((c) => c.trim()).filter(Boolean).slice(0, 4);
    return '';
  });
  text = text.replace(/\[\[whatsapp\]\]/g, () => {
    whatsapp = true;
    return '';
  });
  text = text.replace(/\[\[[^\]]*$/, ''); // control line still streaming in
  return { text: text.trim(), chips, whatsapp };
}

/** Tiny safe markdown: **bold**, [label](/internal-path), bullet lines. */
function Inline({ text }) {
  const out = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<b key={k++} className="font-bold text-ink">{m[1]}</b>);
    else {
      const href = m[3];
      if (href.startsWith('/')) out.push(<Link key={k++} href={href} className="font-bold text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand">{m[2]}</Link>);
      else out.push(m[2]); // external links from the model are not rendered as links
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Rich({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-1" />;
        const bullet = /^([•\-*]|\d+[.)])\s+/.exec(t);
        if (bullet) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-brand" />
              <span><Inline text={t.slice(bullet[0].length)} /></span>
            </div>
          );
        }
        return <p key={i}><Inline text={t} /></p>;
      })}
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [msgs, setMsgs] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const list = useRef(null);
  const inputRef = useRef(null);
  const restored = useRef(false);

  // restore this tab's conversation, and show the teaser bubble once
  useEffect(() => {
    let saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    } catch {
      /* storage blocked */
    }
    const t1 = setTimeout(() => {
      restored.current = true;
      if (Array.isArray(saved) && saved.length) setMsgs(saved);
    }, 0);
    let seen = false;
    try {
      seen = sessionStorage.getItem(`${STORE}-teaser`) === '1';
    } catch {
      /* ignore */
    }
    const t2 = seen ? null : setTimeout(() => setTeaser(true), 5000);
    return () => {
      clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    try {
      sessionStorage.setItem(STORE, JSON.stringify(msgs.slice(-30)));
    } catch {
      /* ignore */
    }
  }, [msgs]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, waiting, open, busy]); // busy → chips appear after the reply, keep them in view

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  const dismissTeaser = () => {
    setTeaser(false);
    try {
      sessionStorage.setItem(`${STORE}-teaser`, '1');
    } catch {
      /* ignore */
    }
  };

  const send = async (raw) => {
    const text = raw.trim().slice(0, 500);
    if (!text || busy) return;
    if (/^كلّمني واتساب$|^كلمني واتساب$/.test(text)) {
      window.open(whatsappLink(), '_blank', 'noopener,noreferrer');
    }
    const history = [...msgs, { role: 'user', content: text }];
    setMsgs(history);
    setInput('');
    setBusy(true);
    setWaiting(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.filter((m) => m !== WELCOME).map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      let started = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        if (!started) {
          started = true;
          setWaiting(false);
          setMsgs((m) => [...m, { role: 'assistant', content: acc }]);
        } else {
          setMsgs((m) => [...m.slice(0, -1), { role: 'assistant', content: acc }]);
        }
      }
      if (!started) throw new Error('empty');
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', content: 'صار خلل بسيط في الاتصال 🙏 جرّب مرة ثانية، أو كلّم فريقنا مباشرة على واتساب.\n[[whatsapp]]' }]);
    } finally {
      setBusy(false);
      setWaiting(false);
    }
  };

  const reset = () => setMsgs([WELCOME]);
  const lastBot = [...msgs].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="print:hidden">
      {/* teaser bubble */}
      {teaser && !open && (
        <div className="rise fixed bottom-24 left-5 z-[80] max-w-[250px] rounded-2xl rounded-bl-sm border border-line bg-white p-3.5 pl-8 text-sm shadow-lift">
          <button type="button" onClick={dismissTeaser} aria-label="إغلاق" className="absolute left-2 top-2 text-muted hover:text-ink"><X className="size-3.5" /></button>
          <p className="font-bold">عندك سؤال عن موعِد؟ 👋</p>
          <p className="mt-0.5 text-xs text-muted">اسألني عن الأسعار أو المميزات — أرد فورًا.</p>
        </div>
      )}

      {/* launcher */}
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); dismissTeaser(); }}
        aria-label={open ? 'إغلاق المحادثة' : 'تحدث مع مساعد موعِد'}
        aria-expanded={open}
        className="group fixed bottom-5 left-5 z-[80] grid size-16 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-white shadow-lift transition hover:scale-105 active:scale-95"
      >
        {!open && <span className="absolute inset-0 animate-ping rounded-full bg-brand/30 [animation-duration:2.4s]" />}
        <span className={`absolute transition duration-300 ${open ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0'}`}><X className="size-7" /></span>
        <span className={`absolute transition duration-300 ${open ? '-rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}><MessageCircle className="size-7" /></span>
        {!open && <span className="absolute -right-0.5 -top-0.5 size-4 rounded-full border-2 border-white bg-gold" />}
      </button>

      {/* panel */}
      <section
        aria-label="مساعد موعِد"
        className={`fixed inset-x-3 bottom-24 z-[80] flex h-[min(620px,calc(100dvh-8rem))] origin-bottom-left flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-[0_30px_80px_-20px_rgb(11_31_42/0.45)] transition-all duration-300 sm:inset-x-auto sm:left-5 sm:w-[390px] ${
          open ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-95 opacity-0'
        }`}
      >
        <header className="relative overflow-hidden bg-gradient-to-bl from-brand to-brand-dark px-5 pb-5 pt-4 text-white">
          <div className="drift pointer-events-none absolute -left-10 -top-16 size-44 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="relative">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25"><LogoMark className="size-8" /></span>
              <span className="absolute -bottom-0.5 -left-0.5 size-3.5 rounded-full border-2 border-brand bg-emerald-400" />
            </span>
            <div className="flex-1">
              <p className="flex items-center gap-1.5 font-bold">مساعد موعِد <Sparkles className="size-4 text-gold" /></p>
              <p className="text-xs text-white/70">متصل الآن · يرد خلال ثواني</p>
            </div>
            <button type="button" onClick={reset} title="محادثة جديدة" aria-label="محادثة جديدة" className="grid size-9 place-items-center rounded-xl hover:bg-white/10"><RotateCcw className="size-4" /></button>
            <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق" className="grid size-9 place-items-center rounded-xl hover:bg-white/10"><X className="size-5" /></button>
          </div>
        </header>

        <div ref={list} className="flex-1 space-y-3 overflow-y-auto bg-sand/70 px-4 py-4" aria-live="polite">
          {msgs.map((m, i) => {
            if (m.role === 'user') {
              return (
                <div key={i} className="rise flex justify-end">
                  <p className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-brand px-4 py-2.5 text-sm leading-7 text-white shadow-soft">{m.content}</p>
                </div>
              );
            }
            const { text, chips, whatsapp } = parse(m.content);
            const isLast = m === lastBot;
            return (
              <Fragment key={i}>
                <div className="rise flex items-end gap-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white shadow-soft"><LogoMark className="size-6" /></span>
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-line bg-white px-4 py-3 text-sm leading-7 text-ink-soft shadow-soft">
                    <Rich text={text} />
                    {whatsapp && (
                      <a href={whatsappLink()} target="_blank" rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#25d366] py-2.5 text-sm font-bold text-white transition hover:brightness-105">
                        <MessageCircle className="size-4" /> كلّم فريقنا على واتساب
                      </a>
                    )}
                  </div>
                </div>
                {isLast && !busy && chips.length > 0 && (
                  <div className="rise flex flex-wrap gap-1.5 pr-10">
                    {chips.map((c) => (
                      <button key={c} type="button" onClick={() => send(c)}
                        className="rounded-full border border-brand/25 bg-white px-3 py-1.5 text-xs font-bold text-brand-dark transition hover:border-brand hover:bg-brand hover:text-white">
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </Fragment>
            );
          })}
          {waiting && (
            <div className="flex items-end gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white shadow-soft"><LogoMark className="size-6" /></span>
              <div className="flex gap-1 rounded-2xl rounded-br-sm border border-line bg-white px-4 py-3.5 shadow-soft">
                {[0, 1, 2].map((d) => <span key={d} className="size-2 animate-bounce rounded-full bg-brand/60" style={{ animationDelay: `${d * 0.15}s` }} />)}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-line bg-white p-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            placeholder="اكتب سؤالك هنا…"
            aria-label="رسالتك"
            className="flex-1 rounded-2xl bg-sand px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-brand/20"
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="إرسال"
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-soft transition hover:bg-brand-dark disabled:opacity-30">
            <Send className="size-5 -scale-x-100" />
          </button>
        </form>
        <p className="bg-white pb-2 text-center text-[10px] text-muted">مساعد آلي — للتفاصيل الدقيقة كلّم فريقنا على واتساب</p>
      </section>
    </div>
  );
}
