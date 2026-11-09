'use client';

import { useEffect, useRef, useState } from 'react';
import { Lock, Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { Avatar } from './ui';

/**
 * Teleconsultation room. The demo shows your own camera (with permission) and the other side
 * waiting to join; production plugs in an encrypted WebRTC provider here.
 */
export default function VideoRoom({ me, other, otherGender, onLeave }) {
  const video = useRef(null);
  const stream = useRef(null);
  const [cam, setCam] = useState(true);
  const [mic, setMic] = useState(true);
  const [state, setState] = useState('asking'); // asking | live | denied
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    let alive = true;
    navigator.mediaDevices?.getUserMedia?.({ video: true, audio: true })
      .then((st) => {
        if (!alive) return st.getTracks().forEach((t) => t.stop());
        stream.current = st;
        if (video.current) video.current.srcObject = st;
        setState('live');
      })
      .catch(() => alive && setState('denied'));
    const t = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => {
      alive = false;
      clearInterval(t);
      stream.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  const toggle = (kind) => {
    const tracks = kind === 'video' ? stream.current?.getVideoTracks() : stream.current?.getAudioTracks();
    tracks?.forEach((t) => (t.enabled = !t.enabled));
    kind === 'video' ? setCam((v) => !v) : setMic((v) => !v);
  };

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <div className="overflow-hidden rounded-3xl bg-ink text-white">
      <div className="flex items-center justify-between px-5 py-3 text-xs">
        <span className="flex items-center gap-1.5 text-emerald-300"><Lock className="size-3.5" /> اتصال مشفّر من طرف لطرف</span>
        <span className="tabular-nums text-white/70">{mm}:{ss}</span>
      </div>
      <div className="relative aspect-video bg-gradient-to-br from-[#12303c] to-ink">
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <span className="relative mx-auto block w-fit">
              <span className="absolute inset-0 animate-ping rounded-2xl bg-brand/40" />
              <Avatar name={other} gender={otherGender} className="relative size-24 text-4xl" />
            </span>
            <p className="mt-4 font-bold">{other}</p>
            <p className="text-xs text-white/60">بانتظار الانضمام…</p>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 aspect-video w-36 overflow-hidden rounded-2xl border-2 border-white/20 bg-black/40 sm:w-48">
          {/* one video element for the whole call, so turning the camera back on keeps the stream */}
          <video ref={video} autoPlay playsInline muted className={`size-full scale-x-[-1] object-cover ${state === 'live' && cam ? '' : 'hidden'}`} />
          {!(state === 'live' && cam) && (
            <div className="absolute inset-0 grid place-items-center text-[11px] text-white/60">
              {state === 'denied' ? 'الكاميرا غير مسموحة' : state === 'asking' ? 'جاري تشغيل الكاميرا…' : 'الكاميرا مقفلة'}
            </div>
          )}
          <span className="absolute bottom-1 right-2 text-[10px] font-bold">{me}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 p-4">
        <button type="button" onClick={() => toggle('audio')} aria-label="الميكروفون"
          className={`grid size-12 place-items-center rounded-full ${mic ? 'bg-white/10' : 'bg-rose-500'}`}>
          {mic ? <Mic className="size-5" /> : <MicOff className="size-5" />}
        </button>
        <button type="button" onClick={() => toggle('video')} aria-label="الكاميرا"
          className={`grid size-12 place-items-center rounded-full ${cam ? 'bg-white/10' : 'bg-rose-500'}`}>
          {cam ? <Video className="size-5" /> : <VideoOff className="size-5" />}
        </button>
        <button type="button" onClick={onLeave} aria-label="إنهاء" className="grid size-12 place-items-center rounded-full bg-rose-600">
          <PhoneOff className="size-5" />
        </button>
      </div>
    </div>
  );
}
