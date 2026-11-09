import { Suspense } from 'react';
import PatientPortal from '@/components/patient/PatientPortal';
import { Skeleton } from '@/components/app/ui';

export const metadata = { title: 'بوابة المريض' };

export default function PatientPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <PatientPortal />
    </Suspense>
  );
}
