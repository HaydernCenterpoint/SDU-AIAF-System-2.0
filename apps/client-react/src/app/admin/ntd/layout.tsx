'use client';

import type { ReactNode } from 'react';
import { SchoolAdminLayout } from '@/components/admin/SchoolAdminLayout';
import { schoolConfigs } from '@/lib/school-config';

export default function NtdAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SchoolAdminLayout school={schoolConfigs.ntd}>
      {children}
    </SchoolAdminLayout>
  );
}
