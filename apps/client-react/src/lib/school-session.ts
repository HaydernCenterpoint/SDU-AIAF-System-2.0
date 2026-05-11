import {
  DEFAULT_SCHOOL_SLUG,
  type BackendSchoolId,
  type SchoolSlug,
  resolveBackendSchoolId,
  resolveSchoolSlug,
  resolveSchoolSlugFromBackendId,
  resolveSchoolSlugFromPathname,
} from './school-site';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

type SchoolStorageKeys = {
  token: string;
  refreshToken: string;
  displayName: string;
};

const POST_LOGOUT_REDIRECT_PATH_KEY = 'saodo_post_logout_redirect_path';

function getSafeStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function getSafeSessionStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
}

export function getSchoolStorageKeys(school: SchoolSlug | BackendSchoolId | string | null | undefined): SchoolStorageKeys {
  const slug = valueToSchoolSlug(school);
  return {
    token: `saodo_token_${slug}`,
    refreshToken: `saodo_refresh_token_${slug}`,
    displayName: `saodo_last_display_name_${slug}`,
  };
}

export function valueToSchoolSlug(value: SchoolSlug | BackendSchoolId | string | null | undefined): SchoolSlug {
  if (value === 'nguyen-thi-due' || value === 'sao-do') return resolveSchoolSlugFromBackendId(value);
  return resolveSchoolSlug(value);
}

export function valueToBackendSchoolId(value: SchoolSlug | BackendSchoolId | string | null | undefined): BackendSchoolId {
  return resolveBackendSchoolId(value);
}

export function getCurrentSchoolSlug(pathname?: string | null): SchoolSlug {
  if (pathname) return resolveSchoolSlugFromPathname(pathname);
  if (typeof window === 'undefined') return DEFAULT_SCHOOL_SLUG;
  return resolveSchoolSlugFromPathname(window.location.pathname);
}

export function readSchoolToken(school: SchoolSlug | BackendSchoolId | string | null | undefined, storage?: StorageLike | null) {
  const local = getSafeStorage(storage);
  if (!local) return null;
  return local.getItem(getSchoolStorageKeys(school).token);
}

export function readSchoolRefreshToken(school: SchoolSlug | BackendSchoolId | string | null | undefined, storage?: StorageLike | null) {
  const local = getSafeStorage(storage);
  if (!local) return null;
  return local.getItem(getSchoolStorageKeys(school).refreshToken);
}

export function readSchoolDisplayName(school: SchoolSlug | BackendSchoolId | string | null | undefined, storage?: StorageLike | null) {
  const local = getSafeStorage(storage);
  if (!local) return '';
  return local.getItem(getSchoolStorageKeys(school).displayName) || '';
}

export function writeSchoolSession(
  school: SchoolSlug | BackendSchoolId | string | null | undefined,
  values: { token?: string | null; refreshToken?: string | null; displayName?: string | null },
  storage?: StorageLike | null,
) {
  const local = getSafeStorage(storage);
  if (!local) return;
  const keys = getSchoolStorageKeys(school);

  if (values.token) local.setItem(keys.token, values.token);
  if (values.refreshToken) local.setItem(keys.refreshToken, values.refreshToken);
  if (values.displayName) local.setItem(keys.displayName, values.displayName);
}

export function clearSchoolSession(school: SchoolSlug | BackendSchoolId | string | null | undefined, storage?: StorageLike | null) {
  const local = getSafeStorage(storage);
  if (!local) return;
  const keys = getSchoolStorageKeys(school);
  local.removeItem(keys.token);
  local.removeItem(keys.refreshToken);
}

export function markPostLogoutRedirectPath(path: string, storage?: StorageLike | null) {
  const session = getSafeSessionStorage(storage);
  if (!session) return;
  session.setItem(POST_LOGOUT_REDIRECT_PATH_KEY, path);
}

export function consumePostLogoutRedirectPath(storage?: StorageLike | null) {
  const session = getSafeSessionStorage(storage);
  if (!session) return null;
  const path = session.getItem(POST_LOGOUT_REDIRECT_PATH_KEY);
  if (path) session.removeItem(POST_LOGOUT_REDIRECT_PATH_KEY);
  return path;
}

export function clearPostLogoutRedirectPath(storage?: StorageLike | null) {
  const session = getSafeSessionStorage(storage);
  if (!session) return;
  session.removeItem(POST_LOGOUT_REDIRECT_PATH_KEY);
}
