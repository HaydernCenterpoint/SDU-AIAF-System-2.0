// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  getSchoolDashboardPath,
  getSchoolLoginPath,
  getSchoolProfilePath,
  resolveBackendSchoolId,
  resolveSchoolSlugFromBackendId,
  resolveSchoolSlugFromPathname,
} from '../apps/client-react/src/lib/school-site';
import {
  clearSchoolSession,
  getCurrentSchoolSlug,
  getSchoolStorageKeys,
  readSchoolDisplayName,
  readSchoolRefreshToken,
  readSchoolToken,
  writeSchoolSession,
} from '../apps/client-react/src/lib/school-session';

function createMemoryStorage() {
  const state = new Map<string, string>();
  return {
    getItem(key: string) {
      return state.has(key) ? state.get(key)! : null;
    },
    setItem(key: string, value: string) {
      state.set(key, value);
    },
    removeItem(key: string) {
      state.delete(key);
    },
  };
}

describe('school site routing helpers', () => {
  it('maps route namespaces to backend school ids', () => {
    expect(resolveBackendSchoolId('sdu')).toBe('sao-do');
    expect(resolveBackendSchoolId('ntd')).toBe('nguyen-thi-due');
    expect(resolveSchoolSlugFromBackendId('sao-do')).toBe('sdu');
    expect(resolveSchoolSlugFromBackendId('nguyen-thi-due')).toBe('ntd');
  });

  it('resolves school paths from the current pathname', () => {
    expect(resolveSchoolSlugFromPathname('/sdu/login')).toBe('sdu');
    expect(resolveSchoolSlugFromPathname('/ntd/dashboard')).toBe('ntd');
    expect(resolveSchoolSlugFromPathname('/')).toBe('sdu');
    expect(getCurrentSchoolSlug('/ntd/profile')).toBe('ntd');
  });

  it('builds school-aware dashboard and profile targets', () => {
    expect(getSchoolLoginPath('sdu')).toBe('/sdu/login');
    expect(getSchoolLoginPath('nguyen-thi-due')).toBe('/ntd/login');
    expect(getSchoolDashboardPath('ntd')).toBe('/ntd/dashboard');
    expect(getSchoolProfilePath('sao-do')).toBe('/sdu/profile');
  });
});

describe('school session helpers', () => {
  it('stores tokens and display names per school', () => {
    const storage = createMemoryStorage();

    writeSchoolSession('sdu', { token: 'sdu-token', refreshToken: 'sdu-refresh', displayName: 'Sinh viên A' }, storage);
    writeSchoolSession('ntd', { token: 'ntd-token', refreshToken: 'ntd-refresh', displayName: 'Học sinh B' }, storage);

    expect(readSchoolToken('sdu', storage)).toBe('sdu-token');
    expect(readSchoolRefreshToken('sdu', storage)).toBe('sdu-refresh');
    expect(readSchoolDisplayName('sdu', storage)).toBe('Sinh viên A');
    expect(readSchoolToken('ntd', storage)).toBe('ntd-token');
    expect(readSchoolDisplayName('ntd', storage)).toBe('Học sinh B');
  });

  it('clears only the current school session keys', () => {
    const storage = createMemoryStorage();

    writeSchoolSession('sdu', { token: 'sdu-token', refreshToken: 'sdu-refresh', displayName: 'Sinh viên A' }, storage);
    writeSchoolSession('ntd', { token: 'ntd-token', refreshToken: 'ntd-refresh', displayName: 'Học sinh B' }, storage);
    clearSchoolSession('sdu', storage);

    expect(readSchoolToken('sdu', storage)).toBeNull();
    expect(readSchoolRefreshToken('sdu', storage)).toBeNull();
    expect(readSchoolDisplayName('sdu', storage)).toBe('Sinh viên A');
    expect(readSchoolToken('ntd', storage)).toBe('ntd-token');
  });

  it('generates stable per-school storage keys', () => {
    expect(getSchoolStorageKeys('sdu')).toEqual({
      token: 'saodo_token_sdu',
      refreshToken: 'saodo_refresh_token_sdu',
      displayName: 'saodo_last_display_name_sdu',
    });
    expect(getSchoolStorageKeys('ntd')).toEqual({
      token: 'saodo_token_ntd',
      refreshToken: 'saodo_refresh_token_ntd',
      displayName: 'saodo_last_display_name_ntd',
    });
  });
});
