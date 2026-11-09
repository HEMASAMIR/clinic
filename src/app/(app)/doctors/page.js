import DoctorSearch from '@/components/patient/DoctorSearch';

export const metadata = {
  title: 'ابحث عن طبيب واحجز',
  description: 'ابحث بالتخصص والمدينة والتأمين والسعر والتقييم، واحجز موعدك بالساعة.',
};

export default function DoctorsPage() {
  return <DoctorSearch />;
}
