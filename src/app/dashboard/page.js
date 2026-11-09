import Dashboard from '@/components/dashboard/Dashboard';

export const metadata = {
  title: 'لوحة العيادة — تجربة',
  description: 'لوحة العيادة في موعِد: المواعيد، جداول الأطباء، الخدمات، المرضى والتقارير.',
};

export default function DashboardPage() {
  return <Dashboard />;
}
