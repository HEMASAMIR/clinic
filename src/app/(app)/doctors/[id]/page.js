import DoctorProfile from '@/components/patient/DoctorProfile';

const IDS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9'];

export function generateStaticParams() {
  return IDS.map((id) => ({ id }));
}

export const metadata = { title: 'ملف الطبيب والحجز' };

export default async function DoctorPage({ params }) {
  const { id } = await params;
  return <DoctorProfile id={id} />;
}
