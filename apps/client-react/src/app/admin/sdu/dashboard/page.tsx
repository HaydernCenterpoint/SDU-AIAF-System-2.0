'use client';

import { SchoolAdminDashboard } from '@/components/admin/SchoolAdminDashboard';
import { schoolConfigs } from '@/lib/school-config';

export default function SduDashboardPage() {
  return <SchoolAdminDashboard school={schoolConfigs.sdu} />;
}
