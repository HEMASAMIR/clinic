import { BellRing, CalendarCheck, Check, Star } from 'lucide-react';

const SLOTS = ['4:00', '4:30', '5:00', '5:30', '6:00', '6:30'];

/** Illustration of the customer's booking page on a phone, with floating notification cards. */
export default function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute -inset-10 -z-10 rounded-full bg-brand/10 blur-3xl" />

      {/* phone */}
      <div className="relative rounded-[2.6rem] border-[10px] border-ink bg-white shadow-lift">
        <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
        <div className="overflow-hidden rounded-[2rem]">
          <div className="bg-gradient-to-bl from-brand to-brand-dark px-5 pb-6 pt-10 text-white">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-white/15 text-lg font-bold">ل</div>
              <div>
                <p className="font-bold">صالون لمسة</p>
                <p className="flex items-center gap-1 text-xs text-white/75">
                  <Star className="size-3 fill-gold text-gold" /> الرياض · حي الملقا
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-5">
            <div className="rounded-2xl border border-line p-3">
              <p className="text-[11px] text-muted">الخدمة</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-sm font-semibold">قص وتصفيف · 45 د</p>
                <p className="text-sm font-bold text-brand">120 ر.س</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] text-muted">الخميس، 12 نوفمبر</p>
              <div className="grid grid-cols-3 gap-2">
                {SLOTS.map((t, i) => (
                  <span
                    key={t}
                    className={`rounded-xl py-2 text-center text-xs font-semibold ${
                      i === 3 ? 'bg-brand text-white shadow-soft' : i === 1 ? 'bg-sand text-muted line-through' : 'bg-brand-soft text-brand-dark'
                    }`}
                  >
                    {t} م
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-ink py-3 text-center text-sm font-semibold text-white">تأكيد الحجز</div>
          </div>
        </div>
      </div>

      {/* floating cards */}
      <div className="floaty absolute -right-6 top-24 hidden rounded-2xl border border-line bg-white p-3 shadow-lift sm:block">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <CalendarCheck className="size-4" />
          </span>
          <div>
            <p className="text-xs font-bold">حجز جديد</p>
            <p className="text-[11px] text-muted">سارة · 5:30 م</p>
          </div>
        </div>
      </div>
      <div className="floaty absolute -left-8 bottom-28 hidden rounded-2xl border border-line bg-white p-3 shadow-lift [animation-delay:1.5s] sm:block">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-gold-soft text-gold">
            <BellRing className="size-4" />
          </span>
          <div>
            <p className="text-xs font-bold">تذكير أُرسل</p>
            <p className="text-[11px] text-muted">قبل الموعد بساعتين</p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-soft">
        <Check className="size-3.5 text-brand" /> الحجز تم بدون أي مكالمة
      </div>
    </div>
  );
}
