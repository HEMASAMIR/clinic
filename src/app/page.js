import Link from 'next/link';
import {
  ArrowLeft, BarChart3, BellRing, Building2, Car, Check, ChevronDown, CreditCard, Dumbbell, Flower2, Gift,
  Globe, HeartPulse, LayoutDashboard, Link2, MessageCircle, QrCode, Scissors, ShieldCheck, Smartphone,
  Sparkles, Stethoscope, Timer, Users, X, Zap,
} from 'lucide-react';
import Navbar from '@/components/site/Navbar';
import Footer from '@/components/site/Footer';
import HeroMock from '@/components/site/HeroMock';
import Pricing from '@/components/site/Pricing';
import LeadForm from '@/components/site/LeadForm';
import { whatsappLink } from '@/config/site';

const PAINS = [
  ['رسائل واتساب طول اليوم', 'وقتك يروح في «فيه موعد بكرة؟» بدل ما تشتغل.', 'عميلك يشوف الأوقات المتاحة ويحجز بنفسه في ثواني.'],
  ['عملاء يحجزون وما يجون', 'كرسي فاضي = دخل ضايع ما يرجع.', 'تذكير تلقائي + عربون اختياري يقلّل الغياب بشكل واضح.'],
  ['دفتر وجداول ما تتفاهم', 'حجزين على نفس الموظفة، ولخبطة كل يوم.', 'تقويم واحد ذكي لكل موظف — مستحيل يتكرر الموعد.'],
];

const FEATURES = [
  [Link2, 'رابط حجز باسم نشاطك', 'صفحة أنيقة بشعارك وخدماتك وأسعارك. حطها في الإنستقرام وسناب وقوقل ماب.'],
  [BellRing, 'تذكير تلقائي', 'رسالة تأكيد فور الحجز وتذكير قبل الموعد — بدون ما تحرك إصبع.'],
  [Users, 'تقويم لكل موظف', 'ساعات عمل وإجازات وخدمات لكل موظف، والنظام يوزّع الحجوزات بذكاء.'],
  [CreditCard, 'عربون ودفع أونلاين', 'جاهز للربط مع مدى وApple Pay وSTC Pay عبر بوابات الدفع المحلية.'],
  [Smartphone, 'تطبيق جوال باسمك', 'تطبيق أندرويد وآيفون بشعارك على المتاجر — عملاؤك يحجزون بلمسة.'],
  [Building2, 'فروع متعددة', 'أدِر كل فروعك من لوحة واحدة، مع صلاحيات لكل مدير فرع.'],
  [BarChart3, 'تقارير تفهمها', 'الإيرادات، أكثر الخدمات طلبًا، أداء الموظفين، ونسبة الحضور.'],
  [Gift, 'ولاء وكوبونات', 'كافئ عملاءك الدائمين وارجع اللي غابوا بعروض ذكية.'],
];

const INDUSTRIES = [
  [Flower2, 'صالونات نسائية', 'قص، صبغة، بروتين، مكياج'],
  [Scissors, 'حلاقين وصالونات رجالية', 'حلاقة، لحية، عناية'],
  [Stethoscope, 'العيادات', 'أسنان، جلدية، تجميل، علاج طبيعي'],
  [Sparkles, 'مراكز التجميل والسبا', 'مساج، حمام مغربي، بشرة'],
  [Dumbbell, 'الأندية والمدربين', 'حصص خاصة، كلاسات جماعية'],
  [Car, 'مغاسل وعناية السيارات', 'غسيل، تلميع، نانو سيراميك'],
  [HeartPulse, 'الأخصائيين والمستشارين', 'تغذية، نفسي، استشارات'],
  [Building2, 'أي نشاط بمواعيد', 'تصوير، تدريب، خدمات منزلية'],
];

const STEPS = [
  ['نجهّز نظامك', 'تعطينا خدماتك وموظفيك وأوقاتك — ونسلّمك النظام جاهز خلال 48 ساعة.'],
  ['شارك رابطك', 'حطه في البايو والواتساب وقوقل ماب، أو اطبع الـ QR على الكاونتر.'],
  ['استقبل الحجوزات', 'الحجوزات تنزل في لوحتك وجوالك، والتذكيرات تطلع تلقائيًا.'],
];

const COMPARE = [
  ['واجهة عربية بالكامل وتدعم RTL صح', true, 'partial', false],
  ['بدون عمولة على كل حجز', true, false, true],
  ['تطبيق جوال باسم نشاطك', true, false, false],
  ['أسعار بالريال ودفع محلي (مدى، STC Pay)', true, 'partial', false],
  ['دعم فني بلهجتك على واتساب', true, false, false],
  ['منع الحجز المزدوج تلقائيًا', true, true, false],
  ['تذكير تلقائي يقلّل الغياب', true, true, false],
];

const FAQ = [
  ['هل أحتاج خبرة تقنية؟', 'أبدًا. نجهّز لك كل شيء، وتستخدم النظام من جوالك مثل أي تطبيق. وإذا احتجت شيء، فريقنا على واتساب.'],
  ['كم ياخذ وقت التجهيز؟', 'غالبًا خلال 48 ساعة من استلام بيانات نشاطك (الخدمات، الموظفين، الأوقات).'],
  ['هل فيه عمولة على الحجوزات؟', 'لا. اشتراك ثابت شهري أو سنوي، وكل حجوزاتك ودخلك لك.'],
  ['هل أقدر أستقبل عربون من العميل؟', 'نعم، النظام جاهز للربط مع بوابات الدفع المحلية لاستقبال عربون أو الدفع الكامل عند الحجز.'],
  ['هل يشتغل مع الفروع المتعددة؟', 'نعم، باقة المؤسسات تدعم فروع بلا حدود مع لوحة لكل فرع وتقارير مجمّعة للإدارة.'],
  ['هل بياناتي وبيانات عملائي آمنة؟', 'بياناتك ملكك بالكامل، محمية ومشفّرة، ونقدر نصدّرها لك متى ما طلبت.'],
  ['أقدر أجرب قبل ما أشترك؟', 'أكيد — جرّب صفحة الحجز ولوحة التحكم الآن من هذا الموقع، ولك 14 يوم تجربة مجانية على نشاطك.'],
];

function Mark({ v }) {
  if (v === true) return <Check className="mx-auto size-5 text-brand" aria-label="نعم" />;
  if (v === 'partial') return <span className="text-xs font-semibold text-gold">جزئي</span>;
  return <X className="mx-auto size-5 text-slate-300" aria-label="لا" />;
}

function SectionTitle({ kicker, title, sub }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-3 text-sm font-bold text-brand">{kicker}</p>
      <h2 className="text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-lg leading-8 text-ink-soft">{sub}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <div className="pattern">
        <Navbar />
        {/* ── Hero ── */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div>
            <p className="rise inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-1.5 text-sm font-semibold text-brand-dark shadow-soft">
              <Zap className="size-4 text-gold" /> صُنع لأسواق الخليج — عربي من أول حرف
            </p>
            <h1 className="rise rise-2 mt-6 text-4xl font-bold leading-[1.25] sm:text-5xl lg:text-[3.1rem]">
              عملاؤك يحجزون بأنفسهم..
              <br />
              <span className="text-brand">وأنت تركّز على شغلك</span>
            </h1>
            <p className="rise rise-3 mt-6 max-w-xl text-lg leading-8 text-ink-soft">
              موعِد نظام حجز مواعيد متكامل: رابط حجز باسمك، تذكير تلقائي يقلّل الغياب، تقويم لكل موظف، ولوحة تحكم
              تشوف منها كل شيء — من جوالك.
            </p>
            <div className="rise rise-4 mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-brand px-7 py-4 font-bold text-white shadow-lift transition hover:bg-brand-dark"
              >
                جرّب الحجز كأنك عميل
                <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-white px-7 py-4 font-bold transition hover:border-brand hover:text-brand"
              >
                <LayoutDashboard className="size-4" /> شوف لوحة التحكم
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-soft">
              {['بدون عمولة على الحجوزات', 'تجهيز خلال 48 ساعة', 'دعم عربي على واتساب'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-brand" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroMock />
        </section>
      </div>

      <main>
        {/* ── Pains → solution ── */}
        <section className="border-y border-line bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle kicker="الواتساب مو نظام حجز" title="تعبت من إدارة المواعيد يدويًا؟" />
            <div className="grid gap-5 md:grid-cols-3">
              {PAINS.map(([title, pain, fix]) => (
                <div key={title} className="rounded-3xl border border-line bg-sand p-7">
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
        <section id="features" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle
              kicker="كل اللي تحتاجه في مكان واحد"
              title="مميزات تخلّي نشاطك يشتغل لحاله"
              sub="من أول حجز لين التقرير الشهري — موعِد يغطي رحلة عميلك كاملة."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(([Icon, title, text]) => (
                <div
                  key={title}
                  className="group rounded-3xl border border-line bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="bg-ink py-24 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="mb-3 text-sm font-bold text-gold">بسيطة جدًا</p>
              <h2 className="text-3xl font-bold sm:text-4xl">3 خطوات وتبدأ تستقبل حجوزات</h2>
            </div>
            <ol className="grid gap-6 md:grid-cols-3">
              {STEPS.map(([title, text], i) => (
                <li key={title} className="relative rounded-3xl border border-white/10 bg-white/5 p-7">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gold text-xl font-bold text-ink">{i + 1}</span>
                  <h3 className="mt-5 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/65">{text}</p>
                </li>
              ))}
            </ol>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm text-white/70">
              <QrCode className="size-5 text-gold" /> رابطك جاهز للبايو، قوقل ماب، والواتساب بزنس
              <Globe className="ms-4 size-5 text-gold" /> يشتغل على أي جوال بدون تحميل
            </div>
          </div>
        </section>

        {/* ── Industries ── */}
        <section id="industries" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle kicker="لكل نشاط يعتمد على المواعيد" title="مصمم لنشاطك أنت" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {INDUSTRIES.map(([Icon, title, sub]) => (
                <div key={title} className="flex flex-col gap-3 rounded-3xl border border-line bg-white p-5 sm:flex-row sm:items-center">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold-soft text-gold">
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

        {/* ── Live demo band ── */}
        <section className="px-4 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-5 rounded-[2rem] bg-gradient-to-bl from-brand to-brand-dark p-8 text-white shadow-lift sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-bold leading-tight">لا تصدّق كلامنا.. جرّب بنفسك الآن</h2>
              <p className="mt-4 leading-8 text-white/75">
                احجز موعد في «صالون لمسة» التجريبي كأنك عميل، وبعدها افتح لوحة التحكم وشوف حجزك نزل فورًا.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/demo" className="rounded-2xl bg-white p-5 text-ink transition hover:-translate-y-1">
                <Timer className="size-6 text-brand" />
                <p className="mt-3 font-bold">تجربة العميل</p>
                <p className="mt-1 text-xs text-muted">احجز في أقل من 30 ثانية</p>
              </Link>
              <Link href="/dashboard" className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 transition hover:-translate-y-1 hover:bg-white/15">
                <LayoutDashboard className="size-6 text-gold" />
                <p className="mt-3 font-bold">لوحة صاحب النشاط</p>
                <p className="mt-1 text-xs text-white/65">الحجوزات، التقويم، التقارير</p>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Compare ── */}
        <section id="compare" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionTitle kicker="ليش موعِد؟" title="الفرق واضح من أول نظرة" />
            <div className="overflow-x-auto rounded-3xl border border-line bg-white shadow-soft">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th className="p-4 text-right font-semibold" />
                    <th className="bg-brand-soft p-4 font-bold text-brand-dark">موعِد</th>
                    <th className="p-4 font-semibold">المنصات الأجنبية</th>
                    <th className="p-4 font-semibold">الواتساب والدفتر</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map(([label, a, b, c]) => (
                    <tr key={label} className="border-b border-line/60 last:border-0">
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
        <section id="pricing" className="scroll-mt-20 border-y border-line bg-white py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle kicker="أسعار واضحة بالريال" title="باقة تناسب حجم نشاطك" sub="بدون رسوم خفية وبدون عمولة على حجوزاتك." />
            <Pricing />
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionTitle kicker="عندك سؤال؟" title="الأسئلة الشائعة" />
            <div className="space-y-3">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group rounded-2xl border border-line bg-white px-6 py-1 shadow-soft open:shadow-lift">
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
          <div className="mx-auto grid max-w-6xl gap-10 rounded-[2rem] bg-ink p-8 text-white sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <ShieldCheck className="size-10 text-gold" />
              <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">جاهز تنظّم مواعيدك؟</h2>
              <p className="mt-4 leading-8 text-white/70">
                عبّي البيانات وبنتواصل معك على واتساب، نعرض لك النظام على نشاطك ونجهّزه لك — بدون أي التزام.
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
            <LeadForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
