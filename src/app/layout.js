import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { site } from '@/config/site';

const arabic = IBM_Plex_Sans_Arabic({
  variable: '--font-arabic',
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    locale: 'ar_SA',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#0d7a6f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${arabic.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
