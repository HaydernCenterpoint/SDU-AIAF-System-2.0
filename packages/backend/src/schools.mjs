import { dirname, join } from 'node:path';

export const DEFAULT_SCHOOL_ID = 'sao-do';

export const SCHOOL_CONFIGS = {
  'sao-do': {
    id: 'sao-do',
    name: 'Trường Đại học Sao Đỏ',
    shortName: 'Sao Đỏ',
    aliases: ['sao-do', 'saodo', 'university'],
  },
  'nguyen-thi-due': {
    id: 'nguyen-thi-due',
    name: 'Trường THPT Nguyễn Thị Duệ',
    shortName: 'Nguyễn Thị Duệ',
    aliases: ['nguyen-thi-due', 'nguyenthidue', 'highschool'],
  },
};

export function normalizeSchoolId(value) {
  const raw = String(value || DEFAULT_SCHOOL_ID).trim().toLowerCase();
  const match = Object.values(SCHOOL_CONFIGS).find((school) => school.aliases.includes(raw));
  return match?.id || DEFAULT_SCHOOL_ID;
}

export function getSchoolConfig(value) {
  return SCHOOL_CONFIGS[normalizeSchoolId(value)];
}

export function getAllSchoolIds() {
  return Object.keys(SCHOOL_CONFIGS);
}

export function getSchoolScopedPath(basePath, schoolId, fileName) {
  return join(dirname(basePath), 'schools', normalizeSchoolId(schoolId), fileName);
}
