export type SchoolSlug = 'sdu' | 'ntd';
export type BackendSchoolId = 'sao-do' | 'nguyen-thi-due';

export type SchoolSiteConfig = {
  slug: SchoolSlug;
  backendId: BackendSchoolId;
  loginPath: `/${SchoolSlug}/login`;
  dashboardPath: `/${SchoolSlug}/dashboard`;
  profilePath: `/${SchoolSlug}/profile`;
  cvPath: `/${SchoolSlug}/cv`;
};

export const DEFAULT_SCHOOL_SLUG: SchoolSlug = 'sdu';
export const SCHOOL_GATEWAY_PATH = '/' as const;

export const schoolSiteConfigs: Record<SchoolSlug, SchoolSiteConfig> = {
  sdu: {
    slug: 'sdu',
    backendId: 'sao-do',
    loginPath: '/sdu/login',
    dashboardPath: '/sdu/dashboard',
    profilePath: '/sdu/profile',
    cvPath: '/sdu/cv',
  },
  ntd: {
    slug: 'ntd',
    backendId: 'nguyen-thi-due',
    loginPath: '/ntd/login',
    dashboardPath: '/ntd/dashboard',
    profilePath: '/ntd/profile',
    cvPath: '/ntd/cv',
  },
};

const backendToSchoolSlugMap: Record<BackendSchoolId, SchoolSlug> = {
  'sao-do': 'sdu',
  'nguyen-thi-due': 'ntd',
};

export function isSchoolSlug(value: string | null | undefined): value is SchoolSlug {
  return value === 'sdu' || value === 'ntd';
}

export function resolveSchoolSlug(value: string | null | undefined): SchoolSlug {
  return isSchoolSlug(value) ? value : DEFAULT_SCHOOL_SLUG;
}

export function resolveSchoolSlugFromBackendId(value: string | null | undefined): SchoolSlug {
  return value === 'nguyen-thi-due' ? 'ntd' : 'sdu';
}

export function resolveBackendSchoolId(value: SchoolSlug | BackendSchoolId | string | null | undefined): BackendSchoolId {
  if (value === 'nguyen-thi-due' || value === 'sao-do') return value;
  return schoolSiteConfigs[resolveSchoolSlug(value)].backendId;
}

export function getSchoolSiteConfig(value: SchoolSlug | BackendSchoolId | string | null | undefined): SchoolSiteConfig {
  if (value === 'nguyen-thi-due' || value === 'sao-do') {
    return schoolSiteConfigs[backendToSchoolSlugMap[value]];
  }
  return schoolSiteConfigs[resolveSchoolSlug(value)];
}

export function resolveSchoolSlugFromPathname(pathname: string | null | undefined): SchoolSlug {
  if (!pathname) return DEFAULT_SCHOOL_SLUG;
  const segment = pathname.split('/').filter(Boolean)[0];
  return resolveSchoolSlug(segment);
}

export function getSchoolLoginPath(school: SchoolSlug | BackendSchoolId | string | null | undefined): `/${SchoolSlug}/login` {
  return getSchoolSiteConfig(school).loginPath;
}

export function getSchoolGatewayPath(): typeof SCHOOL_GATEWAY_PATH {
  return SCHOOL_GATEWAY_PATH;
}

export function getSchoolDashboardPath(school: SchoolSlug | BackendSchoolId | string | null | undefined): `/${SchoolSlug}/dashboard` {
  return getSchoolSiteConfig(school).dashboardPath;
}

export function getSchoolProfilePath(school: SchoolSlug | BackendSchoolId | string | null | undefined): `/${SchoolSlug}/profile` {
  return getSchoolSiteConfig(school).profilePath;
}

export function getSchoolCvPath(school: SchoolSlug | BackendSchoolId | string | null | undefined): `/${SchoolSlug}/cv` {
  return getSchoolSiteConfig(school).cvPath;
}
