'use client';

import { TeacherManagement } from '@/components/admin/TeacherManagement';
import { schoolConfigs } from '@/lib/school-config';

export default function SduTeachersPage() {
  return <TeacherManagement school={schoolConfigs.sdu} />;
}
