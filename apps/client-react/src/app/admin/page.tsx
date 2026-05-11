'use client';

import Link from 'next/link';
import { schoolConfigs } from '@/lib/school-config';

export default function AdminPortalSelect() {
  return (
    <main className="min-h-screen bg-surface-page flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-text mb-4">
          Cổng Quản Trị Hệ Thống
        </h1>
        <p className="text-text-muted font-medium max-w-md mx-auto">
          Vui lòng chọn phân hệ trường mà bạn muốn truy cập để quản lý.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Link href={`/admin/ntd/dashboard`} className="group relative bg-white rounded-3xl p-8 border border-border shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden flex flex-col items-center text-center">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, var(--admin-primary-soft), transparent 60%)' }} />
          <img src={schoolConfigs.ntd.logo} alt="NTD Logo" className="w-24 h-24 mb-6 drop-shadow-md transition-transform duration-300 group-hover:scale-110" />
          <h2 className="text-2xl font-black text-text mt-2 mb-4">
            {schoolConfigs.ntd.name}
          </h2>
          <p className="text-text-sub font-medium text-sm">
            Quản lý học sinh, giáo viên và hệ thống AI cho phân hệ THPT Nguyễn Thị Duệ.
          </p>
          <div className="mt-8 px-6 py-3 rounded-xl font-bold text-white transition-transform duration-300 group-hover:-translate-y-1" style={{ background: schoolConfigs.ntd.theme.primary }}>
            Truy cập Dashboard
          </div>
        </Link>

        <Link href={`/admin/sdu/dashboard`} className="group relative bg-white rounded-3xl p-8 border border-border shadow-card hover:shadow-hover transition-all duration-300 overflow-hidden flex flex-col items-center text-center">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, var(--admin-primary-soft), transparent 60%)' }} />
          <img src={schoolConfigs.sdu.logo} alt="SDU Logo" className="w-24 h-24 mb-6 drop-shadow-md transition-transform duration-300 group-hover:scale-110" />
          <h2 className="text-2xl font-black text-text mt-2 mb-4">
            {schoolConfigs.sdu.name}
          </h2>
          <p className="text-text-sub font-medium text-sm">
            Quản lý sinh viên, giảng viên và hệ thống AI cho phân hệ Đại học Sao Đỏ.
          </p>
          <div className="mt-8 px-6 py-3 rounded-xl font-bold text-white transition-transform duration-300 group-hover:-translate-y-1" style={{ background: schoolConfigs.sdu.theme.primary }}>
            Truy cập Dashboard
          </div>
        </Link>
      </div>
    </main>
  );
}
