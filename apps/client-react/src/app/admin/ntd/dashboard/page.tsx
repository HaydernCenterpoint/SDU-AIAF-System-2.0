'use client';

import { SchoolAdminDashboard } from '@/components/admin/SchoolAdminDashboard';
import { schoolConfigs } from '@/lib/school-config';

export default function NtdDashboardPage() {
  return <SchoolAdminDashboard school={schoolConfigs.ntd} />;
}
