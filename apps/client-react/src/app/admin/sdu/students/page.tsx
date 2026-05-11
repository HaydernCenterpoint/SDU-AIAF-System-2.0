'use client';

import { StudentManagement } from '@/components/admin/StudentManagement';
import { schoolConfigs } from '@/lib/school-config';

export default function SduStudentsPage() {
  return <StudentManagement school={schoolConfigs.sdu} />;
}
