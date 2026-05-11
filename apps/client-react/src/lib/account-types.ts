import type { SchoolSlug } from '@/lib/school-site';

export type AccountType =
  | 'guest_public'
  | 'university_teacher'
  | 'highschool_teacher'
  | 'highschool_student'
  | 'highschool_media_student'
  | 'highschool_principal'
  | 'university_student';

export type AccountTypeCopy = {
  label: string;
  codeLabel: string;
  codePlaceholder: string;
  majorLabel: string;
  majorPlaceholder: string;
  registerSubtitle: string;
  statusLabel: string;
};

export const DEFAULT_ACCOUNT_TYPE: AccountType = 'university_student';
export const PUBLIC_GUEST_ACCOUNT_TYPE: AccountType = 'guest_public';

export const ACCOUNT_TYPE_OPTIONS: Array<{ value: AccountType; label: string; school: SchoolSlug }> = [
  { value: 'university_teacher', label: 'Giảng viên Đại học', school: 'sdu' },
  { value: 'university_student', label: 'Sinh viên Đại học', school: 'sdu' },
  { value: 'highschool_teacher', label: 'Giáo viên THPT', school: 'ntd' },
  { value: 'highschool_student', label: 'Học sinh THPT', school: 'ntd' },
  { value: 'highschool_media_student', label: 'Học sinh (Truyền thông)', school: 'ntd' },
  { value: 'highschool_principal', label: 'Ban giám hiệu', school: 'ntd' },
];

export const ACCOUNT_TYPE_COPY: Record<AccountType, AccountTypeCopy> = {
  guest_public: {
    label: 'Khách dùng AI',
    codeLabel: 'Mã khách',
    codePlaceholder: 'Tự tạo trong hệ thống',
    majorLabel: 'Mối quan tâm',
    majorPlaceholder: 'VD: ngành CNTT, học phí, ký túc xá',
    registerSubtitle: 'Tạo tài khoản khách để dùng AI, đọc cộng đồng và tìm hiểu thêm về trường.',
    statusLabel: 'Đang khám phá',
  },
  university_teacher: {
    label: 'Giảng viên Đại học',
    codeLabel: 'Mã giảng viên',
    codePlaceholder: 'VD: GV001',
    majorLabel: 'Khoa / bộ môn',
    majorPlaceholder: 'VD: Khoa Công nghệ thông tin',
    registerSubtitle: 'Đăng ký tài khoản giảng viên để quản lý lớp học và hỗ trợ sinh viên.',
    statusLabel: 'Đang giảng dạy',
  },
  highschool_teacher: {
    label: 'Giáo viên THPT',
    codeLabel: 'Mã giáo viên',
    codePlaceholder: 'VD: GVTHPT001',
    majorLabel: 'Tổ bộ môn / trường THPT',
    majorPlaceholder: 'VD: Tổ Toán - THPT Nguyễn Thị Duệ',
    registerSubtitle: 'Đăng ký tài khoản giáo viên THPT để theo dõi lớp học và học sinh.',
    statusLabel: 'Đang giảng dạy',
  },
  highschool_student: {
    label: 'Học sinh THPT',
    codeLabel: 'Mã học sinh',
    codePlaceholder: 'VD: HS001',
    majorLabel: 'Lớp / trường THPT',
    majorPlaceholder: 'VD: 12A1 - THPT Nguyễn Thị Duệ',
    registerSubtitle: 'Đăng ký tài khoản học sinh để nhận lịch học, tài liệu và nhắc nhở.',
    statusLabel: 'Đang học',
  },
  highschool_media_student: {
    label: 'Học sinh (Truyền thông)',
    codeLabel: 'Mã học sinh',
    codePlaceholder: 'VD: HS-TT001',
    majorLabel: 'Lớp / ban truyền thông',
    majorPlaceholder: 'VD: 11A2 - Ban truyền thông trường',
    registerSubtitle: 'Tài khoản truyền thông có quyền đăng bài và quản lý chat trong mục cộng đồng.',
    statusLabel: 'Đang hoạt động',
  },
  highschool_principal: {
    label: 'Ban giám hiệu',
    codeLabel: 'Mã cán bộ',
    codePlaceholder: 'VD: BGH001',
    majorLabel: 'Phân hệ điều hành',
    majorPlaceholder: 'VD: Ban giám hiệu - THPT Nguyễn Thị Duệ',
    registerSubtitle: 'Tài khoản ban giám hiệu có toàn quyền trong portal nội bộ của trường.',
    statusLabel: 'Toàn quyền',
  },
  university_student: {
    label: 'Sinh viên Đại học',
    codeLabel: 'Mã sinh viên',
    codePlaceholder: 'VD: 2024001',
    majorLabel: 'Khoa / ngành',
    majorPlaceholder: 'VD: Công nghệ thông tin',
    registerSubtitle: 'Đăng ký bằng thông tin sinh viên để bắt đầu sử dụng trợ lý.',
    statusLabel: 'Đang học',
  },
};

export function getAccountTypeOptionsForSchool(school: SchoolSlug) {
  return ACCOUNT_TYPE_OPTIONS.filter((option) => option.school === school).map(({ school: _school, ...option }) => option);
}

export function getDefaultAccountTypeForSchool(school: SchoolSlug): AccountType {
  return school === 'ntd' ? 'highschool_student' : DEFAULT_ACCOUNT_TYPE;
}

export function normalizeAccountType(accountType?: string | null): AccountType {
  return accountType && accountType in ACCOUNT_TYPE_COPY ? (accountType as AccountType) : DEFAULT_ACCOUNT_TYPE;
}

export function getAccountTypeCopy(accountType?: string | null): AccountTypeCopy {
  return ACCOUNT_TYPE_COPY[normalizeAccountType(accountType)];
}
