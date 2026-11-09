import BookingFlow from '@/components/booking/BookingFlow';

export const metadata = {
  title: 'تجربة حجز موعد — عيادات رِفق',
  description: 'جرّب صفحة الحجز كما يراها مرضاك: اختر الخدمة والطبيب والوقت واحجز في ثوانٍ.',
};

export default function DemoPage() {
  return <BookingFlow />;
}
