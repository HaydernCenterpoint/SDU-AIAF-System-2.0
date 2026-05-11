'use client';

import { StudentManagement } from '@/components/admin/StudentManagement';
import { schoolConfigs } from '@/lib/school-config';

export default function NtdStudentsPage() {
  return <StudentManagement school={schoolConfigs.ntd} />;
}
