'use client';

import { schoolConfigs } from '@/lib/school-config';
import type { SchoolSlug } from '@/lib/school-site';

type BrandMarkProps = {
  showText?: boolean;
  compact?: boolean;
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  school?: SchoolSlug;
};

const imageSize = {
  sm: 'h-[54px] w-[54px]',
  md: 'h-[72px] w-[72px]',
  lg: 'h-24 w-24',
};

export function BrandMark({
  showText = true,
  compact = false,
  tone = 'dark',
  size = 'md',
  school = 'sdu',
}: BrandMarkProps) {
  const textColor = tone === 'light' ? 'text-white' : 'text-text';
  const subColor = tone === 'light' ? 'text-white/72' : 'text-text-muted';
  const schoolConfig = schoolConfigs[school];
  const subtitle = school === 'ntd' ? 'Cổng nội bộ THPT' : 'Trợ lý AI của bạn';

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={`${imageSize[size]} shrink-0`}>
        <img src={schoolConfig.logo} alt={schoolConfig.name} className="h-full w-full object-contain" />
      </div>
      {showText && (
        <div className="min-w-0">
          <p className={`truncate text-sm font-extrabold leading-tight ${textColor}`}>
            {compact ? schoolConfig.shortName : schoolConfig.name}
          </p>
          <p className={`truncate text-xs font-medium ${subColor}`}>{subtitle}</p>
        </div>
      )}
    </div>
  );
}
