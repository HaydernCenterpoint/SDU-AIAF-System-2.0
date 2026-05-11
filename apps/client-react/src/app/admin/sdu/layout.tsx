'use client';

import type { ReactNode } from 'react';
import { SchoolAdminLayout } from '@/components/admin/SchoolAdminLayout';
import { schoolConfigs } from '@/lib/school-config';

export default function SduAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SchoolAdminLayout school={schoolConfigs.sdu}>
      {children}
    </SchoolAdminLayout>
  );
}
