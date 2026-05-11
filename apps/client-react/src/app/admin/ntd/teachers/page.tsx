'use client';

import { TeacherManagement } from '@/components/admin/TeacherManagement';
import { schoolConfigs } from '@/lib/school-config';

export default function NtdTeachersPage() {
  return <TeacherManagement school={schoolConfigs.ntd} />;
}
