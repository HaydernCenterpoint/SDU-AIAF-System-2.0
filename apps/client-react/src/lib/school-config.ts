import type { SchoolId } from '@/lib/admin-api';

export type SchoolConfig = {
  id: SchoolId;
  name: string;
  shortName: string;
  logo: string;
  /** Label used for students: "Học sinh" or "Sinh viên" */
  studentLabel: string;
  /** Label used for teachers: "Giáo viên" or "Giảng viên" */
  teacherLabel: string;
  /** Student ID label: "Mã HS" or "MSSV" */
  studentIdLabel: string;
  /** Teacher ID label */
  teacherIdLabel: string;
  /** CSS theme tokens */
  theme: {
    primary: string;
    primarySoft: string;
    primaryDark: string;
    accent: string;
    sidebarBg: string;
    sidebarBorder: string;
    gradientFrom: string;
    gradientTo: string;
  };
};

export const schoolConfigs: Record<SchoolId, SchoolConfig> = {
  ntd: {
    id: 'ntd',
    name: 'Trường THPT Nguyễn Thị Duệ',
    shortName: 'NTD',
    logo: '/assets/images/logo-ntd.png',
    studentLabel: 'Học sinh',
    teacherLabel: 'Giáo viên',
    studentIdLabel: 'Mã HS',
    teacherIdLabel: 'Mã GV',
    theme: {
      primary: '#4D97FF',
      primarySoft: 'rgba(77, 151, 255, 0.1)',
      primaryDark: '#0F3460',
      accent: '#FCDC62',
      sidebarBg: '#0F3460',
      sidebarBorder: 'rgba(77, 151, 255, 0.2)',
      gradientFrom: '#4D97FF',
      gradientTo: '#0F3460',
    },
  },
  sdu: {
    id: 'sdu',
    name: 'Trường Đại học Sao Đỏ',
    shortName: 'SDU',
    logo: '/assets/images/logo-saodo.png',
    studentLabel: 'Sinh viên',
    teacherLabel: 'Giảng viên',
    studentIdLabel: 'MSSV',
    teacherIdLabel: 'Mã GV',
    theme: {
      primary: '#b4233d',
      primarySoft: 'rgba(180, 35, 61, 0.1)',
      primaryDark: '#3b0613',
      accent: '#e14a5f',
      sidebarBg: '#3b0613',
      sidebarBorder: 'rgba(180, 35, 61, 0.2)',
      gradientFrom: '#7d1529',
      gradientTo: '#3b0613',
    },
  },
};
