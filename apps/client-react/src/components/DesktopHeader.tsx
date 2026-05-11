'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandMark } from '@/components/BrandMark';
import { useAuthStore } from '@/hooks/useAuthStore';
import { getSchoolGatewayPath, getSchoolProfilePath, resolveSchoolSlugFromBackendId } from '@/lib/school-site';

export function DesktopHeader() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const currentSchool = resolveSchoolSlugFromBackendId(user?.schoolId);

  const handleLogout = () => {
    logout(currentSchool, getSchoolGatewayPath());
    router.replace(getSchoolGatewayPath());
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-5 py-3 shadow-card">
      <BrandMark compact size="sm" school={currentSchool} />
      <div className="flex items-center gap-3">
        <Link href={getSchoolProfilePath(currentSchool)} className="text-sm font-semibold text-text-sub hover:text-primary">
          {user?.fullName || 'Tai khoan'}
        </Link>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-sub hover:border-accent hover:text-accent"
        >
          Dang xuat
        </button>
      </div>
    </header>
  );
}
