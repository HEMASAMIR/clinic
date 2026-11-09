import PortalBar from '@/components/app/PortalBar';
import ChatWidget from '@/components/site/ChatWidget';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-dvh bg-sand/70">
      <PortalBar />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
      <ChatWidget />
    </div>
  );
}
