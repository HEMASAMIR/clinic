import BookingFlow from '@/components/booking/BookingFlow';

export const metadata = {
  title: 'تجربة الحجز — صالون لمسة',
  description: 'جرّب صفحة الحجز كما يراها عملاؤك: اختر الخدمة والموظفة والوقت واحجز في ثوانٍ.',
};

export default function DemoPage() {
  return <BookingFlow />;
}
