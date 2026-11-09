import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import { site, whatsappLink } from '@/config/site';

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-7">{site.description}</p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">المنتج</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/doctors" className="hover:text-white">ابحث عن طبيب واحجز</Link></li>
            <li><Link href="/patient" className="hover:text-white">بوابة المريض</Link></li>
            <li><Link href="/doctor" className="hover:text-white">بوابة الطبيب</Link></li>
            <li><Link href="/reception" className="hover:text-white">الاستقبال وشاشة الانتظار</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">لوحة العيادة</Link></li>
            <li><Link href="/#pricing" className="hover:text-white">الأسعار</Link></li>
            <li><Link href="/#faq" className="hover:text-white">الأسئلة الشائعة</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">تواصل معنا</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                <MessageCircle className="size-4" /> واتساب
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 hover:text-white">
                <Mail className="size-4" /> {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row sm:px-6">
          <span>© {site.name} — جميع الحقوق محفوظة</span>
          <span>صُنع بعناية لعيادات الخليج 🇸🇦 🇦🇪 🇰🇼 🇶🇦 🇧🇭 🇴🇲</span>
        </div>
      </div>
    </footer>
  );
}
