import Link from 'next/link';
import {
  Activity, Apple, ArrowLeft, Baby, BarChart3, BellRing, Bone, Brain, Building2, Calculator, Check, ChevronDown,
  ClipboardList, CreditCard, Eye, FileHeart, Globe, HeartPulse, Hourglass, LayoutDashboard, Lock, MessageCircle,
  Monitor, Package, Pill, QrCode, Search, ShieldCheck, Smile, Sparkles, Star, Stethoscope, Timer, UserRound, Users,
  Video, X, Zap,
} from 'lucide-react';
import Navbar from '@/components/site/Navbar';
import Footer from '@/components/site/Footer';
import HeroMock from '@/components/site/HeroMock';
import Pricing from '@/components/site/Pricing';
import LeadForm from '@/components/site/LeadForm';
import ScrollEffects from '@/components/site/ScrollEffects';
import WhatsAppDemo from '@/components/site/WhatsAppDemo';
import RoiCalculator from '@/components/site/RoiCalculator';
import { CountUp, RotatingWord } from '@/components/site/Motion';
import { whatsappLink } from '@/config/site';

const HERO_WORDS = ['عيادات الأسنان', 'الجلدية والتجميل', 'العلاج الطبيعي', 'عيادات الأطفال', 'المجمعات الطبية'];

const STATS = [
  [30, '', ' ثانية', 'يحجز فيها المريض موعده'],
  [24, '', '/7', 'حجز مفتوح حتى والعيادة مقفلة'],
  [48, '', ' ساعة', 'ونسلّمك نظامك جاهز'],
  [0, '', '%', 'عمولة على مواعيدك'],
];

const PAINS = [
  ['الاستقبال ما يوقف تلفون', 'موظف الاستقبال يقضي يومه يرد على «فيه موعد مع الدكتور؟».', 'المريض يشوف مواعيد الطبيب المتاحة ويحجز بنفسه 24 ساعة.'],
  ['مرضى يحجزون وما يحضرون', 'كل موعد فاضي = وقت طبيب ضايع ودخل ما يرجع.', 'تأكيد فوري وتذكير قبل الموعد + عربون اختياري يقلّل الغياب.'],
  ['جداول الأطباء متلخبطة', 'مواعيد متداخلة، وإجازات طبيب ما أحد يعرف عنها.', 'جدول واحد ذكي لكل طبيب — مستحيل يتكرر الموعد.'],
];

const FEATURES = [
  [Hourglass, 'الدور المباشر', 'المريض يشوف من بيته الطبيب على أي رقم وكم واحد قدّامه — وداعًا لساعات الانتظار.'],
  [BellRing, 'تذكير قبل 24 ساعة وساعتين', 'واتساب أو SMS بزر تأكيد أو إلغاء بضغطة — والموعد الملغي يرجع متاح فورًا.'],
  [FileHeart, 'الملف الطبي الرقمي', 'التحاليل والأشعة والحساسية والأدوية المزمنة لكل مريض في مكان واحد.'],
  [Pill, 'روشتة إلكترونية بـ QR', 'اقتراح تلقائي للأدوية والجرعات، تنبيه حساسية، وتوصل للمريض PDF وواتساب.'],
  [Video, 'استشارات فيديو', 'متابعات وكشوفات عن بُعد بمكالمة مشفّرة داخل المنصة.'],
  [Users, 'حساب عائلي', 'الأب أو الأم يحجز للأولاد والوالدين، وكل فرد له ملفه الطبي المنفصل.'],
  [ShieldCheck, 'التأمين الطبي', 'بوبا والتعاونية وميدغلف وغيرها — نسبة التحمّل تنحسب تلقائيًا عند الحجز.'],
  [CreditCard, 'دفع وتقسيط', 'مدى وApple Pay وSTC Pay، وقسّم العمليات الكبيرة مع تابي وتمارا.'],
  [Star, 'تقييمات موثّقة', 'ما يقيّم إلا اللي حضر الكشف فعلًا — صفر تقييمات مزيفة.'],
  [ClipboardList, 'استقبال وشاشة انتظار', 'تسجيل وصول، مرضى بدون حجز، وشاشة تلفزيون تعرض الدور بصوت تنبيه.'],
  [Package, 'باقات واشتراكات', 'متابعة الحمل، جلسات العلاج الطبيعي، متابعة السكري — دخل ثابت للعيادة.'],
  [BarChart3, 'تحليلات وخزينة', 'أوقات الذروة، الحضور والإلغاء، أداء الأطباء، وجرد يومي كاش وشبكة وتأمين.'],
];

const SPECIALTIES = [
  [Smile, 'عيادات الأسنان', 'كشف، تنظيف، حشو، تقويم، تبييض'],
  [Sparkles, 'الجلدية والتجميل', 'ليزر، بوتوكس، فيلر، علاج بشرة'],
  [Bone, 'العلاج الطبيعي', 'جلسات تأهيل، إصابات ملاعب'],
  [Baby, 'الأطفال', 'كشف، تطعيمات، متابعة نمو'],
  [Eye, 'العيون', 'كشف نظر، فحوصات، ليزك'],
  [Apple, 'التغذية', 'استشارات، برامج إنقاص وزن'],
  [Brain, 'الصحة النفسية', 'جلسات واستشارات حضورية وعن بُعد'],
  [Building2, 'المجمعات الطبية', 'كل التخصصات والفروع في نظام واحد'],
];

const PORTALS = [
  ['/doctors', Search, 'المريض: ابحث واحجز', 'فلترة بالتخصص والمدينة والتأمين والسعر والتقييم والمتاح اليوم، وحجز بالساعة مع الدفع أو التقسيط.', 'border-brand/20 bg-brand-soft/60'],
  ['/patient', UserRound, 'بوابة المريض', 'الدور المباشر، الملف الطبي، الروشتات PDF، الحساب العائلي، الباقات، والإشعارات.', 'border-sky-100 bg-sky-50'],
  ['/doctor', Stethoscope, 'بوابة الطبيب', 'طابور اليوم، تاريخ المريض وحساسيته، روشتة ذكية بـ QR، الإجازات وخانات الطوارئ، والفيديو.', 'border-violet-100 bg-violet-50'],
  ['/reception', ClipboardList, 'الاستقبال', 'تسجيل الوصول، مرضى بدون حجز، إلغاء وتأجيل جماعي بضغطة، والخزينة والفواتير.', 'border-amber-100 bg-amber-50'],
  ['/queue', Monitor, 'شاشة الانتظار', 'تلفزيون الصالة يعرض الرقم الحالي لكل طبيب مع تنبيه صوتي — يتحدّث لحظيًا.', 'border-white/10 bg-ink text-white'],
  ['/dashboard', LayoutDashboard, 'الإدارة والتحليلات', 'الإيرادات وأوقات الذروة وأداء الأطباء، التأمين، الباقات، والتقييمات.', 'border-gold/30 bg-gold-soft/70'],
];

const STEPS = [
  ['نجهّز نظام عيادتك', 'تعطينا التخصصات والأطباء والخدمات والأوقات — ونسلّمك النظام جاهز خلال 48 ساعة.'],
  ['شارك رابط الحجز', 'حطه في قوقل ماب والبايو والواتساب، أو اطبع الـ QR في الاستقبال.'],
  ['استقبل المرضى', 'المواعيد تنزل في جدول كل طبيب، والتذكيرات تطلع تلقائيًا.'],
];

const COMPARE = [
  ['واجهة عربية بالكامل وتدعم RTL صح', true, 'partial', false],
  ['بدون عمولة على كل موعد', true, false, true],
  ['تطبيق جوال باسم العيادة', true, false, false],
  ['أسعار بالريال ودفع محلي (مدى، STC Pay)', true, 'partial', false],
  ['دعم فني بلهجتك على واتساب', true, false, false],
  ['منع المواعيد المتداخلة تلقائيًا', true, true, false],
  ['تذكير تلقائي يقلّل غياب المرضى', true, true, false],
];

const FAQ = [
  ['هل يحتاج فريق الاستقبال تدريب؟', 'تقريبًا لا. النظام بسيط مثل أي تطبيق، ونعطي فريقك جلسة تعريف قصيرة، وفريقنا معكم على واتساب.'],
  ['كم ياخذ وقت التجهيز؟', 'غالبًا خلال 48 ساعة من استلام بيانات العيادة (التخصصات، الأطباء، الخدمات، الأوقات).'],
  ['هل فيه عمولة على المواعيد؟', 'لا. اشتراك ثابت شهري أو سنوي، وكل مواعيدك ودخلك لك.'],
  ['هل بيانات المرضى آمنة؟', 'بيانات المرضى ملك العيادة بالكامل، محمية ومشفّرة، والوصول لها حسب صلاحية كل موظف، ونقدر نصدّرها لك متى ما طلبت.'],
  ['هل يشتغل مع المجمعات الطبية والفروع؟', 'نعم، باقة المجمعات تدعم تخصصات وفروع بلا حدود، مع جدول لكل طبيب وتقارير مجمّعة للإدارة.'],
  ['هل أقدر أستقبل عربون من المريض؟', 'نعم، النظام جاهز للربط مع بوابات الدفع المحلية لاستقبال عربون أو قيمة الكشف عند الحجز.'],
  ['أقدر أجرب قبل ما أشترك؟', 'أكيد — جرّب صفحة الحجز ولوحة التحكم الآن من هذا الموقع، ولك 14 يوم تجربة مجانية على عيادتك.'],
];

const d = (i, step = 90) => ({ '--d': `${i * step}ms` });

function Mark({ v }) {
  if (v === true) return <Check className="mx-auto size-5 text-brand" aria-label="نعم" />;
  if (v === 'partial') return <span className="text-xs font-semibold text-gold">جزئي</span>;
  return <X className="mx-auto size-5 text-slate-300" aria-label="لا" />;
}

function SectionTitle({ kicker, title, sub, dark }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center" data-reveal="">
      <p className={`mb-3 text-sm font-bold ${dark ? 'text-gold' : 'text-brand'}`}>{kicker}</p>
      <h2 className="text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
      {sub && <p className={`mt-4 text-lg leading-8 ${dark ? 'text-white/65' : 'text-ink-soft'}`}>{sub}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <ScrollEffects />
      <div className="pattern relative overflow-hidden">
        <div className="drift pointer-events-none absolute -left-32 top-10 size-[420px] rounded-full bg-brand/10 blur-3xl" />
        <div className="drift pointer-events-none absolute -right-24 bottom-0 size-[340px] rounded-full bg-gold/10 blur-3xl [animation-delay:-6s]" />
        <Navbar />
        {/* ── Hero ── */}
        <section className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div>
            <p className="rise inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-1.5 text-sm font-semibold text-brand-dark shadow-soft">
              <Zap className="size-4 text-gold" /> نظام مواعيد مصمم لـ
              <span className="text-brand">
                <RotatingWord words={HERO_WORDS} />
              </span>
            </p>
            <h1 className="rise rise-2 mt-6 text-4xl font-bold leading-[1.25] sm:text-5xl lg:text-[3.1rem]">
              مرضاك يحجزون بأنفسهم..
              <br />
              <span className="text-brand">
                وعيادتك ما يفوتها موعد
              </span>
            </h1>
            <p className="rise rise-3 mt-6 max-w-xl text-lg leading-8 text-ink-soft">
              موعِد نظام حجز مواعيد متكامل للعيادات والمجمعات الطبية: رابط حجز باسم عيادتك، جدول لكل طبيب، تذكير
              تلقائي يقلّل غياب المرضى، ولوحة تحكم تشوف منها كل شيء.
            </p>
            <div className="rise rise-4 mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/doctors"
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-brand px-7 py-4 font-bold text-white shadow-lift transition hover:bg-brand-dark"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-full" />
                جرّب المنصة كمريض
                <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-white px-7 py-4 font-bold transition hover:border-brand hover:text-brand"
              >
                <LayoutDashboard className="size-4" /> شوف لوحة العيادة
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-soft">
              {['بدون عمولة على المواعيد', 'تجهيز خلال 48 ساعة', 'بيانات المرضى محمية'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-brand" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rise rise-3">
            <HeroMock />
          </div>
        </section>
      </div>

      <main>
        {/* ── Stats ── */}
        <section className="border-y border-line bg-sand/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-12 sm:px-6 lg:grid-cols-4">
            {STATS.map(([n, pre, suf, label], i) => (
              <div key={label} data-reveal="" style={d(i)} className="text-center">
                <p className="text-4xl font-bold text-brand sm:text-5xl">
                  <CountUp to={n} prefix={pre} suffix={suf} />
                </p>
                <p className="mt-2 text-sm text-muted">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Platform: 5 portals ── */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle
              kicker="مو مجرد صفحة حجز"
              title="منصة طبية كاملة.. كل واحد له بوابته"
              sub="المريض والطبيب والاستقبال والإدارة وشاشة الانتظار — كلهم على نفس البيانات لحظة بلحظة. جرّب كل بوابة الآن."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PORTALS.map(([href, Icon, title, text, tone], i) => (
                <Link
                  key={href}
                  href={href}
                  data-reveal=""
                  style={d(i, 90)}
                  className={`spot group relative overflow-hidden rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift ${tone}`}
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-white/90 text-brand shadow-soft transition group-hover:scale-110">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 opacity-80">{text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold">
                    افتح البوابة <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pains → solution ── */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle kicker="التلفون مو نظام مواعيد" title="تعبت عيادتك من إدارة المواعيد يدويًا؟" />
            <div className="grid gap-5 md:grid-cols-3">
              {PAINS.map(([title, pain, fix], i) => (
                <div key={title} data-reveal="" style={d(i, 120)} className="rounded-3xl border border-line bg-sand p-7">
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{pain}</p>
                  <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-white p-4 text-sm font-medium leading-7 shadow-soft">
                    <Check className="mt-1 size-4 shrink-0 text-brand" /> {fix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="scroll-mt-20 bg-sand/60 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle
              kicker="كل اللي تحتاجه عيادتك في مكان واحد"
              title="مميزات تخلّي عيادتك تشتغل بسلاسة"
              sub="من أول حجز للمريض لين موعد المراجعة والتقرير الشهري."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(([Icon, title, text], i) => (
                <div
                  key={title}
                  data-reveal=""
                  style={d(i % 4, 80)}
                  className="spot group rounded-3xl border border-line bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lift"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand transition duration-300 group-hover:rotate-[-6deg] group-hover:bg-brand group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WhatsApp live demo ── */}
        <section className="overflow-hidden py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
            <div data-reveal="start">
              <p className="mb-3 text-sm font-bold text-brand">شوفها بعينك</p>
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl">كذا يوصل التذكير لمريضك.. ويأكد بضغطة</h2>
              <p className="mt-4 text-lg leading-8 text-ink-soft">
                تأكيد فوري لحظة الحجز، وتذكير قبل الموعد فيه زر «تأكيد الحضور» و«تغيير الموعد». المريض يرد بضغطة،
                والموعد يتحدّث في جدول الطبيب تلقائيًا — بدون ولا مكالمة من الاستقبال.
              </p>
              <ul className="mt-6 space-y-3">
                {['رسالة تأكيد بتفاصيل الموعد والطبيب', 'تذكير قبل الموعد بالوقت اللي تختاره', 'المريض يأكد أو يغيّر موعده بنفسه', 'الموعد الملغي يرجع متاح لمريض ثاني'].map((t, i) => (
                  <li key={t} data-reveal="" style={d(i + 2, 100)} className="flex items-center gap-3 font-medium">
                    <span className="grid size-7 place-items-center rounded-full bg-brand text-white"><Check className="size-4" /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal="zoom" style={d(2)}>
              <WhatsAppDemo />
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="relative overflow-hidden bg-ink py-24 text-white">
          <div className="pointer-events-none absolute -right-40 -top-40 size-[480px] rounded-full bg-brand/25 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle dark kicker="بسيطة جدًا" title="3 خطوات وعيادتك تستقبل حجوزات أونلاين" />
            <ol className="relative grid gap-6 md:grid-cols-3">
              <div className="absolute inset-x-[16%] top-[3.25rem] hidden h-px bg-gradient-to-l from-gold/0 via-gold/50 to-gold/0 md:block" />
              {STEPS.map(([title, text], i) => (
                <li key={title} data-reveal="" style={d(i, 180)} className="relative rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gold text-xl font-bold text-ink shadow-[0_0_30px_rgb(201_154_46/0.45)]">{i + 1}</span>
                  <h3 className="mt-5 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/65">{text}</p>
                </li>
              ))}
            </ol>
            <div data-reveal="" className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm text-white/70">
              <QrCode className="size-5 text-gold" /> رابطك جاهز لقوقل ماب والبايو والواتساب بزنس
              <Globe className="ms-4 size-5 text-gold" /> يشتغل على أي جوال بدون تحميل
            </div>
          </div>
        </section>

        {/* ── Specialties ── */}
        <section id="industries" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle kicker="لكل التخصصات" title="يناسب تخصص عيادتك" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {SPECIALTIES.map(([Icon, title, sub], i) => (
                <div
                  key={title}
                  data-reveal="zoom"
                  style={d(i, 60)}
                  className="spot group flex flex-col gap-3 rounded-3xl border border-line bg-white p-5 transition hover:border-gold/40 hover:shadow-soft sm:flex-row sm:items-center"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold-soft text-gold transition group-hover:scale-110">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold sm:text-base">{title}</h3>
                    <p className="mt-0.5 text-xs text-muted">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROI calculator ── */}
        <section id="calculator" className="scroll-mt-20 bg-sand/60 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle
              kicker={<span className="inline-flex items-center gap-1.5"><Calculator className="size-4" /> احسبها بنفسك</span>}
              title="كم تخسر عيادتك من المرضى اللي ما يحضرون؟"
              sub="حرّك الأرقام حسب عيادتك وشوف الفرق اللي يصنعه موعِد."
            />
            <div data-reveal="zoom">
              <RoiCalculator />
            </div>
          </div>
        </section>

        {/* ── Privacy band ── */}
        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-6 rounded-[2rem] border border-line bg-white p-8 shadow-soft sm:p-10 md:grid-cols-3">
            {[
              [Lock, 'بيانات المرضى محمية', 'اتصال مشفّر، ونسخ احتياطي، وبيانات العيادة ملكها بالكامل.'],
              [ShieldCheck, 'صلاحيات لكل موظف', 'الاستقبال يشوف المواعيد، والطبيب يشوف جدوله، والإدارة تشوف التقارير.'],
              [Activity, 'سجل لكل عملية', 'تعرف مين حجز ومين عدّل أو ألغى أي موعد ومتى.'],
            ].map(([Icon, title, text], i) => (
              <div key={title} data-reveal="" style={d(i, 120)} className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand text-white">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-7 text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Live demo band ── */}
        <section className="px-4 sm:px-6">
          <div data-reveal="zoom" className="relative mx-auto grid max-w-6xl gap-5 overflow-hidden rounded-[2rem] bg-gradient-to-bl from-brand to-brand-dark p-8 text-white shadow-lift sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className="drift pointer-events-none absolute -left-16 -top-16 size-72 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold leading-tight">لا تصدّق كلامنا.. جرّب بنفسك الآن</h2>
              <p className="mt-4 leading-8 text-white/75">
                احجز موعد في «عيادات رِفق» التجريبية كأنك مريض، وبعدها افتح لوحة العيادة وشوف موعدك نزل في جدول الطبيب فورًا.
              </p>
            </div>
            <div className="relative grid gap-3 sm:grid-cols-2">
              <Link href="/doctors" className="rounded-2xl bg-white p-5 text-ink transition hover:-translate-y-1">
                <Timer className="size-6 text-brand" />
                <p className="mt-3 font-bold">تجربة المريض</p>
                <p className="mt-1 text-xs text-muted">احجز موعد في أقل من 30 ثانية</p>
              </Link>
              <Link href="/dashboard" className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 transition hover:-translate-y-1 hover:bg-white/15">
                <LayoutDashboard className="size-6 text-gold" />
                <p className="mt-3 font-bold">لوحة العيادة</p>
                <p className="mt-1 text-xs text-white/65">المواعيد، جداول الأطباء، التقارير</p>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Compare ── */}
        <section id="compare" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionTitle kicker="ليش موعِد؟" title="الفرق واضح من أول نظرة" />
            <div data-reveal="" className="overflow-x-auto rounded-3xl border border-line bg-white shadow-soft">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th className="p-4 text-right font-semibold" />
                    <th className="bg-brand-soft p-4 font-bold text-brand-dark">موعِد</th>
                    <th className="p-4 font-semibold">الأنظمة الأجنبية</th>
                    <th className="p-4 font-semibold">التلفون والدفتر</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map(([label, a, b, c]) => (
                    <tr key={label} className="border-b border-line/60 transition last:border-0 hover:bg-sand/60">
                      <td className="p-4 font-medium">{label}</td>
                      <td className="bg-brand-soft/50 p-4 text-center"><Mark v={a} /></td>
                      <td className="p-4 text-center"><Mark v={b} /></td>
                      <td className="p-4 text-center"><Mark v={c} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="scroll-mt-20 border-y border-line bg-sand/60 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle kicker="أسعار واضحة بالريال" title="باقة تناسب حجم عيادتك" sub="بدون رسوم خفية وبدون عمولة على مواعيدك." />
            <div data-reveal="">
              <Pricing />
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionTitle kicker="عندك سؤال؟" title="الأسئلة الشائعة" />
            <div className="space-y-3">
              {FAQ.map(([q, a], i) => (
                <details key={q} data-reveal="" style={d(i, 60)} className="group rounded-2xl border border-line bg-white px-6 py-1 shadow-soft open:shadow-lift">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown className="size-5 shrink-0 text-muted transition group-open:rotate-180" />
                  </summary>
                  <p className="pb-5 leading-8 text-ink-soft">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section id="contact" className="scroll-mt-20 px-4 pb-24 sm:px-6">
          <div data-reveal="" className="relative mx-auto grid max-w-6xl gap-10 overflow-hidden rounded-[2rem] bg-ink p-8 text-white sm:p-12 lg:grid-cols-2 lg:items-center">
            <div className="drift pointer-events-none absolute -bottom-24 -right-24 size-80 rounded-full bg-brand/30 blur-3xl" />
            <div className="relative">
              <HeartPulse className="size-10 text-gold" />
              <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">جاهز تنظّم مواعيد عيادتك؟</h2>
              <p className="mt-4 leading-8 text-white/70">
                عبّي البيانات وبنتواصل معك على واتساب، نعرض لك النظام على عيادتك ونجهّزه لك — بدون أي التزام.
              </p>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10"
              >
                <MessageCircle className="size-4 text-gold" /> أو كلّمنا واتساب مباشرة
              </a>
            </div>
            <div className="relative">
              <LeadForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
