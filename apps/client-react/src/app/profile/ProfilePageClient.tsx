'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { useAppStore } from '@/hooks/useAppStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { getAccountTypeCopy, type AccountTypeCopy } from '@/lib/account-types';
import { getSchoolGatewayPath, type SchoolSlug } from '@/lib/school-site';
import type { AuthUser, FamilyInfo, PersonalInfo, StudentProfileDetails } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

const profileBentoTheme = {
  background: '#F8FCFF',
  card: '#FFFFFF',
  primaryBlue: '#1784DA',
  secondaryBlue: '#4FB3EC',
  softBlue: '#EEF7FF',
  red: '#E31D1C',
  redSoft: '#FFF1F1',
  green: '#10B981',
  softGreen: '#ECFDF5',
  yellow: '#F7D428',
  textMain: '#112641',
  textSecondary: '#475569',
  border: '#D8EAF5',
};

const academicDefaults = {
  className: 'CNTT K15A',
  cohort: '2022 - 2026',
  advisor: 'TS. Nguyễn Văn Minh',
  trainingScore: '86/100',
  creditProgress: '96/132 tín chỉ',
  gpa: '3.45/4.0',
  weeklyAssignments: '5/7',
  weeklyClasses: '18/24',
};

const defaultAcademicDetails = {
  status: 'Đang học',
  recordCode: '221SDUOM.00028',
  entryDate: '2022-09-23',
  className: 'DK13-CNTT1',
  campus: 'Đại học Sao Đỏ - Cơ sở 1',
  educationLevel: 'Đại học',
  trainingType: 'Chính quy',
  faculty: 'Khoa Công nghệ thông tin',
  specialization: 'Công nghệ phần mềm',
  cohort: '2022',
  courseRange: '2022 - 2026',
};

const defaultPersonalDetails = {
  ethnicity: 'Kinh',
  religion: 'Không',
  nationality: 'Việt Nam',
  region: 'Khu vực 1',
  identityNumber: '022204004356',
  issuedDate: '',
  issuedBy: '',
  subjectGroup: '',
  unionDate: '',
  partyDate: '',
  contactAddress: '471, Tổ 4, Khu Quang Trung, Mạo Khê, Đông Triều, Quảng Ninh',
  permanentAddress: 'Số nhà 471, Tổ 4, Khu Quang Trung, Phường Mạo Khê, Tỉnh Quảng Ninh',
};

const defaultFamilyDetails = {
  fatherName: 'Nguyễn Văn Thành',
  fatherBirthYear: '1966',
  fatherOccupation: '0904388848',
  fatherPhone: '',
  motherName: 'Đặng Thị Tự',
  motherBirthYear: '1972',
  motherOccupation: '0936792369',
  motherPhone: '',
};

const editablePersonalFields = [
  ['ethnicity', 'Dân tộc'],
  ['religion', 'Tôn giáo'],
  ['nationality', 'Quốc tịch'],
  ['region', 'Khu vực'],
  ['identityNumber', 'Số CCCD'],
  ['issuedDate', 'Ngày cấp'],
  ['issuedBy', 'Nơi cấp'],
  ['subjectGroup', 'Đối tượng'],
  ['unionDate', 'Ngày vào Đoàn'],
  ['partyDate', 'Ngày vào Đảng'],
  ['contactAddress', 'Địa chỉ liên hệ'],
  ['permanentAddress', 'Hộ khẩu thường trú'],
] as const;

type EditablePersonalKey = (typeof editablePersonalFields)[number][0];
type EditablePersonalForm = Record<EditablePersonalKey, string>;

type ProfileForm = {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  personalInfo: EditablePersonalForm;
};

const semesterSchedule = {
  semesterStartDate: '2026-01-12',
  lastExamDate: '2026-06-12',
};

const studyInfo = [
  ['MS', 'Mã sinh viên', '2200286', '#EEF7FF'],
  ['HT', 'Thông tin học tập', 'Công nghệ thông tin', '#ECFDF5'],
  ['LH', 'Lớp sinh hoạt', academicDefaults.className, '#FFF1F1'],
  ['KH', 'Khóa học', academicDefaults.cohort, '#FFFBE5'],
  ['CV', 'Cố vấn học tập', academicDefaults.advisor, '#EEF7FF'],
  ['TC', 'Tín chỉ tích lũy', academicDefaults.creditProgress, '#F3F8FC'],
] as const;

type ProfileStatConfig = {
  label: string;
  value: string;
  note: string;
  percent?: number;
  chart?: 'spark';
};

type MemoryCardConfig = {
  icon: string;
  title: string;
  text: string;
  progress?: number;
  tag?: string;
  button?: string;
  bg: string;
};

type ProfileSchoolConfig = {
  heading: string;
  defaultRecordId: string;
  fallbackEmail: string;
  fallbackBirthDate: string;
  fallbackFaculty: string;
  academicDefaults: typeof academicDefaults;
  academicDetails: NonNullable<StudentProfileDetails['academicInfo']>;
  personalDetails: PersonalInfo;
  familyDetails: FamilyInfo;
  semesterSchedule: typeof semesterSchedule;
  studyInfo: ReadonlyArray<readonly [string, string, string, string]>;
  academicSectionTitle: string;
  facultyLabel: string;
  specializationLabel: string;
  cohortLabel: string;
  memoryCards: MemoryCardConfig[];
  quickStats: ProfileStatConfig[];
};

const ntdAcademicDefaults = {
  className: '12A1',
  cohort: '2023 - 2026',
  advisor: 'Cô Nguyễn Thu Hà',
  trainingScore: '95/100',
  creditProgress: '4/6 chuyên đề',
  gpa: '8.6/10',
  weeklyAssignments: '4/6',
  weeklyClasses: '20/24',
};

const ntdAcademicDetails = {
  status: 'Đang học',
  recordCode: 'NTD-2025-12A1-018',
  entryDate: '2023-09-05',
  className: '12A1',
  campus: 'THPT Nguyễn Thị Duệ',
  educationLevel: 'THPT',
  trainingType: 'Chính quy',
  faculty: 'Khối 12',
  specialization: 'Ban cơ bản',
  cohort: '2023',
  courseRange: '2023 - 2026',
  schoolName: 'Trường THPT Nguyễn Thị Duệ',
};

const ntdPersonalDetails = {
  ethnicity: 'Kinh',
  religion: 'Không',
  nationality: 'Việt Nam',
  region: 'Khu vực 2',
  identityNumber: '030508004356',
  issuedDate: '',
  issuedBy: '',
  subjectGroup: 'A00',
  unionDate: '2024-03-26',
  partyDate: '',
  contactAddress: 'Tổ dân phố Chu Văn An, Chí Linh, Hải Dương',
  permanentAddress: 'Tổ dân phố Chu Văn An, Chí Linh, Hải Dương',
};

const ntdFamilyDetails = {
  fatherName: 'Nguyễn Văn Huy',
  fatherBirthYear: '1974',
  fatherOccupation: 'Kinh doanh',
  fatherPhone: '0912345670',
  motherName: 'Trần Thị Hương',
  motherBirthYear: '1978',
  motherOccupation: 'Giáo viên',
  motherPhone: '0912345671',
};

const PROFILE_SCHOOL_CONFIG: Record<SchoolSlug, ProfileSchoolConfig> = {
  sdu: {
    heading: 'Hồ sơ sinh viên',
    defaultRecordId: '2200286',
    fallbackEmail: '2200286@sv.saodo.edu.vn',
    fallbackBirthDate: '2004-01-01',
    fallbackFaculty: 'Công nghệ thông tin',
    academicDefaults,
    academicDetails: {
      ...defaultAcademicDetails,
      schoolName: 'Trường Đại học Sao Đỏ',
    },
    personalDetails: defaultPersonalDetails,
    familyDetails: defaultFamilyDetails,
    semesterSchedule,
    studyInfo,
    academicSectionTitle: 'Thông tin học vấn',
    facultyLabel: 'Khoa',
    specializationLabel: 'Chuyên ngành',
    cohortLabel: 'Khóa học',
    memoryCards: [
      { icon: '🎯', title: 'Mục tiêu học tập', text: 'Hoàn thành 3 môn trước 30/6/2026', progress: 60, bg: '#EEF7FF' },
      { icon: '📝', title: 'Lịch ôn tập gợi ý', text: 'Ôn thi CSDL vào Thứ 6, 19:00', tag: 'Trong 2 ngày', bg: '#EEF7FF' },
      { icon: '⭐', title: 'Gợi ý ưu tiên', text: 'Hoàn thành bài tập CTDL&GT trước hạn', tag: 'Ưu tiên cao', bg: '#FFF7E6' },
      { icon: '▣', title: 'Nội dung nên xem', text: 'Bài giảng AI - Buổi 6', tag: 'Khuyến nghị xem lại', button: 'Xem ngay', bg: '#F8FAFF' },
    ],
    quickStats: [
      { label: 'Điểm TB tích lũy', value: '3.45/4.0', note: 'Tăng 0.12 so với kỳ trước', chart: 'spark' },
      { label: 'Tín chỉ đã tích lũy', value: '96/132', note: 'Còn 36 tín chỉ', percent: 73 },
      { label: 'Bài tập tuần này', value: academicDefaults.weeklyAssignments, note: 'Đang tiến tốt!', percent: 71 },
      { label: 'Buổi học tuần này', value: academicDefaults.weeklyClasses, note: 'Duy trì đều đặn!', percent: 75 },
    ],
  },
  ntd: {
    heading: 'Hồ sơ học sinh',
    defaultRecordId: '2025324AK02',
    fallbackEmail: '2025324AK02@ntd.edu.vn',
    fallbackBirthDate: '2007-09-15',
    fallbackFaculty: 'Khối 12',
    academicDefaults: ntdAcademicDefaults,
    academicDetails: ntdAcademicDetails,
    personalDetails: ntdPersonalDetails,
    familyDetails: ntdFamilyDetails,
    semesterSchedule: {
      semesterStartDate: '2026-01-06',
      lastExamDate: '2026-05-28',
    },
    studyInfo: [
      ['MS', 'Mã học sinh', '2025324AK02', '#EEF7FF'],
      ['HT', 'Khối học tập', 'Khối 12', '#ECFDF5'],
      ['LH', 'Lớp học', '12A1', '#FFF1F1'],
      ['KH', 'Niên khóa', '2023 - 2026', '#FFFBE5'],
      ['CV', 'Giáo viên chủ nhiệm', 'Cô Nguyễn Thu Hà', '#EEF7FF'],
      ['TC', 'Tiến độ học tập', '4/6 chuyên đề', '#F3F8FC'],
    ],
    academicSectionTitle: 'Thông tin học tập',
    facultyLabel: 'Khối',
    specializationLabel: 'Ban học',
    cohortLabel: 'Niên khóa',
    memoryCards: [
      { icon: '🎯', title: 'Mục tiêu học tập', text: 'Hoàn thành đề cương ôn thi học kỳ II trước 20/5', progress: 64, bg: '#EEF7FF' },
      { icon: '📝', title: 'Lịch ôn tập gợi ý', text: 'Ôn Toán chuyên đề vào Thứ 6, 19:30', tag: 'Trong 2 ngày', bg: '#EEF7FF' },
      { icon: '⭐', title: 'Gợi ý ưu tiên', text: 'Nộp bài phân tích Văn trước hạn lớp yêu cầu', tag: 'Ưu tiên cao', bg: '#FFF7E6' },
      { icon: '▣', title: 'Nội dung nên xem', text: 'Thông báo sinh hoạt lớp cuối tuần', tag: 'Khuyến nghị xem lại', button: 'Xem ngay', bg: '#F8FAFF' },
    ],
    quickStats: [
      { label: 'Điểm trung bình', value: ntdAcademicDefaults.gpa, note: 'Ổn định trong học kỳ II', chart: 'spark' },
      { label: 'Tiến độ học tập', value: ntdAcademicDefaults.creditProgress, note: 'Còn 2 chuyên đề trọng tâm', percent: 67 },
      { label: 'Bài tập tuần này', value: ntdAcademicDefaults.weeklyAssignments, note: 'Đã theo kịp tiến độ', percent: 67 },
      { label: 'Tiết học tuần này', value: ntdAcademicDefaults.weeklyClasses, note: 'Cần giữ nhịp ôn tập', percent: 83 },
    ],
  },
};

function getProfileSchoolConfig(school: SchoolSlug) {
  return PROFILE_SCHOOL_CONFIG[school];
}

function buildStudyInfoItems(school: SchoolSlug, accountTypeCopy: AccountTypeCopy, recordId: string, faculty: string) {
  return getProfileSchoolConfig(school).studyInfo.map((item) => {
    if (item[0] === 'MS') return [item[0], accountTypeCopy.codeLabel, recordId, item[3]] as const;
    if (item[0] === 'HT') return [item[0], accountTypeCopy.majorLabel, faculty, item[3]] as const;
    return item;
  });
}

function buildStudyInfoTitle(accountTypeLabel: string) {
  if (accountTypeLabel === 'Ban giám hiệu') return 'Thông tin ban giám hiệu';

  const normalized = accountTypeLabel
    .replace('(Truyền thông)', 'truyền thông')
    .replace('Đại học', 'đại học');

  return `Thông tin ${normalized.charAt(0).toLowerCase()}${normalized.slice(1)}`;
}

function parseSemesterDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatSemesterDate(value: string) {
  return parseSemesterDate(value).toLocaleDateString('vi-VN');
}

function calculateSemesterProgress(semesterStartDate: string, lastExamDate: string, today = new Date()) {
  const start = parseSemesterDate(semesterStartDate).getTime();
  const end = parseSemesterDate(lastExamDate).getTime();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const totalDays = Math.max(1, Math.ceil((end - start) / 86_400_000));
  const elapsedDays = Math.ceil((current - start) / 86_400_000);
  const rawPercent = Math.round((elapsedDays / totalDays) * 100);
  const percent = Math.min(100, Math.max(0, rawPercent));
  const daysRemaining = Math.max(0, Math.ceil((end - current) / 86_400_000));

  return {
    percent,
    daysRemaining,
    startLabel: formatSemesterDate(semesterStartDate),
    endLabel: formatSemesterDate(lastExamDate),
  };
}

function emptyEditablePersonalForm(): EditablePersonalForm {
  return editablePersonalFields.reduce((values, [key]) => ({ ...values, [key]: '' }), {} as EditablePersonalForm);
}

function toInputDate(value?: string) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(value?: string) {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}

function buildFallbackProfile(
  school: SchoolSlug,
  recordId: string,
  faculty: string,
  userProfile?: StudentProfileDetails | null,
): StudentProfileDetails {
  const config = getProfileSchoolConfig(school);

  return {
    avatarUrl: userProfile?.avatarUrl || null,
    academicInfo: {
      ...config.academicDetails,
      ...(userProfile?.academicInfo || {}),
      studentCode: recordId,
      major: userProfile?.academicInfo?.major || faculty,
      schoolName: userProfile?.academicInfo?.schoolName || config.academicDetails.schoolName,
    },
    personalInfo: {
      ...config.personalDetails,
      ...(userProfile?.personalInfo || {}),
    },
    familyInfo: {
      ...config.familyDetails,
      ...(userProfile?.familyInfo || {}),
    },
  };
}

function buildProfileForm(profile: StudentProfileDetails | null, user?: AuthUser | null): ProfileForm {
  const personalInfo = profile?.personalInfo || {};
  const editable = emptyEditablePersonalForm();
  for (const [key] of editablePersonalFields) {
    editable[key] = String(personalInfo[key] || '');
  }

  return {
    fullName: user?.fullName || personalInfo.fullName || '',
    phone: user?.phone || personalInfo.phone || '',
    email: user?.email || personalInfo.email || '',
    dateOfBirth: toInputDate(user?.dateOfBirth || personalInfo.dateOfBirth),
    personalInfo: editable,
  };
}

function mergeProfileWithUser(profile: StudentProfileDetails, user?: AuthUser | null): StudentProfileDetails {
  return {
    ...profile,
    avatarUrl: profile.avatarUrl || user?.avatarUrl || null,
    personalInfo: {
      ...(profile.personalInfo || {}),
      fullName: user?.fullName || profile.personalInfo?.fullName,
      dateOfBirth: user?.dateOfBirth || profile.personalInfo?.dateOfBirth,
      phone: user?.phone || profile.personalInfo?.phone,
      email: user?.email || profile.personalInfo?.email,
    },
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Không thể đọc ảnh đại diện'));
    reader.readAsDataURL(file);
  });
}

export function StudentProfilePage({ school = 'sdu' }: { school?: SchoolSlug }) {
  const { token, isAuthenticated, syncSessionFromStorage } = useAuthStore();
  const { bootstrap } = useAppStore();

  useEffect(() => {
    syncSessionFromStorage(school);
  }, [school, syncSessionFromStorage]);

  useEffect(() => {
    if (isAuthenticated && token) bootstrap(token);
  }, [isAuthenticated, token, bootstrap]);

  return (
    <ProtectedRoute school={school}>
      <AppShell school={school} activeNavId="profile">
        <StudentBentoProfileContent school={school} />
      </AppShell>
    </ProtectedRoute>
  );
}

export default function ProfilePage() {
  return <StudentProfilePage school="sdu" />;
}

function StudentBentoProfileContent({ school }: { school: SchoolSlug }) {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [profileDetails, setProfileDetails] = useState<StudentProfileDetails | null>(null);
  const [form, setForm] = useState<ProfileForm>(() => buildProfileForm(null, null));
  const [saving, setSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [error, setError] = useState('');

  const schoolConfig = getProfileSchoolConfig(school);
  const accountTypeCopy = getAccountTypeCopy(user?.accountType);
  const displayName = user?.fullName || `${accountTypeCopy.label} ${schoolConfig.defaultRecordId}`;
  const studentId = user?.studentId || schoolConfig.defaultRecordId;
  const faculty = user?.faculty || schoolConfig.fallbackFaculty;
  const syncedProfile = mergeProfileWithUser(
    profileDetails || buildFallbackProfile(school, studentId, faculty, user?.profile),
    user,
  );
  const academicInfo = syncedProfile.academicInfo || {};
  const personalInfo = syncedProfile.personalInfo || {};
  const familyInfo = syncedProfile.familyInfo || {};
  const avatarUrl = syncedProfile.avatarUrl || user?.avatarUrl || null;

  useEffect(() => {
    const nextProfile = mergeProfileWithUser(
      profileDetails || buildFallbackProfile(school, studentId, faculty, user?.profile),
      user,
    );
    setForm(buildProfileForm(nextProfile, user));
  }, [faculty, profileDetails, school, studentId, user]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function loadProfile() {
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || cancelled) return;
        useAuthStore.setState({ user: data.user });
        setProfileDetails(data.profile);
      } catch {
        // Keep local profile fallback when offline.
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const formattedBirthDate = formatDisplayDate(personalInfo.dateOfBirth || user?.dateOfBirth || schoolConfig.fallbackBirthDate);
  const personalDetails = [
    `Email: ${personalInfo.email || user?.email || schoolConfig.fallbackEmail}`,
    `Số điện thoại: ${personalInfo.phone || user?.phone || '0936651618'}`,
    `Ngày sinh: ${formattedBirthDate}`,
    `Lớp: ${academicInfo.className || schoolConfig.academicDefaults.className}`,
    `${school === 'ntd' ? 'Niên khóa' : 'Khóa'}: ${academicInfo.courseRange || schoolConfig.academicDefaults.cohort}`,
  ];
  const semesterProgress = useMemo(
    () =>
      calculateSemesterProgress(
        schoolConfig.semesterSchedule.semesterStartDate,
        schoolConfig.semesterSchedule.lastExamDate,
      ),
    [schoolConfig.semesterSchedule.lastExamDate, schoolConfig.semesterSchedule.semesterStartDate],
  );
  const studyInfoItems = useMemo(
    () => buildStudyInfoItems(school, accountTypeCopy, studentId, faculty),
    [accountTypeCopy, faculty, school, studentId],
  );

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Không thể cập nhật hồ sơ');
        setSaving(false);
        return;
      }
      useAuthStore.setState({ user: data.user });
      setProfileDetails(data.profile);
      setEditing(false);
      setSaving(false);
    } catch {
      setError('Lỗi kết nối máy chủ');
      setSaving(false);
    }
  };

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !token) return;
    if (file.size > 520_000) {
      setError('Ảnh đại diện cần nhỏ hơn 500KB để đồng bộ nhanh trên web và mobile.');
      return;
    }

    setAvatarSaving(true);
    setError('');
    try {
      const avatarUrl = await readFileAsDataUrl(file);
      const res = await fetch(`${API_BASE}/profile/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Không thể cập nhật ảnh đại diện');
        setAvatarSaving(false);
        return;
      }
      useAuthStore.setState({ user: data.user });
      setProfileDetails(data.profile);
      setAvatarSaving(false);
    } catch {
      setError('Không thể đọc hoặc tải ảnh đại diện');
      setAvatarSaving(false);
    }
  };

  const updateFormField = (field: keyof Omit<ProfileForm, 'personalInfo'>, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updatePersonalField = (field: EditablePersonalKey, value: string) => {
    setForm((current) => ({
      ...current,
      personalInfo: { ...current.personalInfo, [field]: value },
    }));
  };

  return (
    <section className="min-w-0 space-y-5 text-text">
      <h1 className="sr-only">{schoolConfig.heading}</h1>
      {error && <div className="rounded-[22px] border border-rose-100 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-600">{error}</div>}
      <div className="grid gap-5 xl:grid-cols-[1.05fr_1fr]">
        <HeroProfileCard
          displayName={displayName}
          studentId={studentId}
          faculty={faculty}
          personalDetails={personalDetails}
          accountTypeCopy={accountTypeCopy}
          avatarUrl={avatarUrl}
          avatarSaving={avatarSaving}
          onAvatarFileChange={handleAvatarFileChange}
        />
        <SemesterProgressCard school={school} semesterProgress={semesterProgress} />
        <StudyInfoCard accountTypeCopy={accountTypeCopy} items={studyInfoItems} />
        <QuickStatsCard school={school} />
        <AcademicPortalInfoCard school={school} academicInfo={academicInfo} />
        <PersonalPortalInfoCard personalInfo={personalInfo} />
        <FamilyInfoCard familyInfo={familyInfo} />
        <AICompanionMemoryCard school={school} />
        <AccountStatusCard
          school={school}
          editing={editing}
          saving={saving}
          form={form}
          onEdit={() => setEditing(true)}
          onCancel={() => {
            setForm(buildProfileForm(syncedProfile, user));
            setEditing(false);
          }}
          onSave={handleSave}
          onFieldChange={updateFormField}
          onPersonalFieldChange={updatePersonalField}
          accountTypeCopy={accountTypeCopy}
            onLogout={() => {
              logout(school, getSchoolGatewayPath());
              router.replace(getSchoolGatewayPath());
            }}
          />
      </div>
    </section>
  );
}

function HeroProfileCard({
  displayName,
  studentId,
  faculty,
  personalDetails,
  accountTypeCopy,
  avatarUrl,
  avatarSaving,
  onAvatarFileChange,
}: {
  displayName: string;
  studentId: string;
  faculty: string;
  personalDetails: string[];
  accountTypeCopy: AccountTypeCopy;
  avatarUrl?: string | null;
  avatarSaving: boolean;
  onAvatarFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const initial = displayName.trim().charAt(0).toUpperCase() || 'S';

  return (
    <section className="academic-card relative min-h-[270px] overflow-hidden bg-white p-6 sm:p-7 xl:col-span-1">
      <CampusIllustration />
      <div className="absolute left-6 top-5 text-4xl text-primary/15">✧</div>
      <div className="absolute right-12 top-8 text-2xl text-primary/20">✦</div>
      <div className="relative z-10 flex h-full flex-col justify-center gap-5 sm:flex-row sm:items-center sm:justify-start">
        <div className="relative h-32 w-32 shrink-0">
          <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-full bg-surface-alt text-5xl font-black text-text shadow-[0_16px_36px_rgba(27,37,89,0.16)] ring-8 ring-white/80">
            {avatarUrl ? <img src={avatarUrl} alt={`Ảnh đại diện ${displayName}`} className="h-full w-full object-cover" /> : initial}
          </div>
          <input id="web-avatar-input" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onAvatarFileChange} />
          <label htmlFor="web-avatar-input" className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 cursor-pointer items-center rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#1784DA] shadow-lg transition hover:-translate-y-0.5">
            {avatarSaving ? 'Đang đổi...' : 'Đổi ảnh'}
          </label>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-sub">Xin chào!</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">{displayName}</h2>
            <span className="rounded-full bg-[#57C785] px-3 py-1.5 text-xs font-black text-white shadow-sm">{accountTypeCopy.statusLabel}</span>
          </div>
          <div className="mt-4 space-y-2 text-sm font-semibold text-text-sub">
            <p>♙ {accountTypeCopy.codeLabel}: {studentId}</p>
            <p>♧ {faculty}</p>
          </div>
          <div className="mt-4 grid gap-2 text-xs font-bold text-text-sub sm:grid-cols-2">
            {personalDetails.map((detail) => (
              <span key={detail} className="rounded-full bg-surface-alt px-3 py-2 backdrop-blur-sm">
                {detail}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SemesterProgressCard({
  school,
  semesterProgress,
}: {
  school: SchoolSlug;
  semesterProgress: ReturnType<typeof calculateSemesterProgress>;
}) {
  const schoolConfig = getProfileSchoolConfig(school);

  return (
    <BentoCard className="xl:col-span-1">
      <CardTitle icon="〽️" title={school === 'ntd' ? 'Nhịp học kỳ hiện tại' : 'Nhịp học kỳ hiện tại'} />
      <div className="mt-5 grid grid-cols-2 gap-4">
        <MetricWithRing label="Tiến độ học kỳ" value={`${semesterProgress.percent}%`} percent={semesterProgress.percent} color="#1784DA" />
        <MetricWithRing
          label={schoolConfig.academicDefaults.trainingScore === '95/100' ? 'Điểm chuyên cần' : 'Điểm rèn luyện'}
          value={schoolConfig.academicDefaults.trainingScore}
          percent={schoolConfig.academicDefaults.trainingScore === '95/100' ? 95 : 86}
          color="#57C785"
          accent="⭐"
        />
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#EAF0FF]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#1784DA] to-[#4FB3EC]" style={{ width: `${semesterProgress.percent}%` }} />
      </div>
      <div className="mt-5 grid gap-3 border-y border-[#EAF0FF] py-4 sm:grid-cols-2">
        <DateLine label="Ngày đầu tiên đi học" value={semesterProgress.startLabel} />
        <DateLine label="Ngày thi cuối cùng" value={semesterProgress.endLabel} />
      </div>
      <div className="mt-4 flex gap-3 rounded-[22px] bg-gradient-to-r from-[#EEF7FF] to-[#FFF1F1] p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-xl shadow-sm">🤖</span>
        <p className="text-sm font-semibold leading-6 text-[#6B7280]">
          <b className="text-[#1784DA]">Còn {semesterProgress.daysRemaining} ngày đến mốc kết thúc học kỳ.</b>
          <br />
          {school === 'ntd'
            ? 'AI Companion sẽ ưu tiên nhắc lịch học, kiểm tra và các đầu việc ôn tập gần nhất.'
            : 'AI Companion sẽ ưu tiên nhắc các mốc bài tập và ôn tập gần nhất.'}
        </p>
      </div>
    </BentoCard>
  );
}

function StudyInfoCard({
  accountTypeCopy,
  items,
}: {
  accountTypeCopy: AccountTypeCopy;
  items: ReadonlyArray<readonly [string, string, string, string]>;
}) {
  return (
    <BentoCard>
      <CardTitle icon="🎓" title={buildStudyInfoTitle(accountTypeCopy.label)} />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map(([icon, label, value, bg]) => (
          <div key={label} className="flex items-center gap-3 rounded-[18px] border border-[#EAF0FF] bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl text-lg" style={{ backgroundColor: bg }}>{icon}</span>
            <div>
              <p className="text-xs font-semibold text-[#6B7280]">{label}</p>
              <p className="mt-1 text-sm font-black text-[#1B2559]">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

function AcademicPortalInfoCard({
  school,
  academicInfo,
}: {
  school: SchoolSlug;
  academicInfo: StudentProfileDetails['academicInfo'];
}) {
  const schoolConfig = getProfileSchoolConfig(school);
  const items: Array<[string, string | undefined]> = [
    ['Trạng thái', academicInfo?.status],
    ['Mã hồ sơ', academicInfo?.recordCode],
    ['Ngày vào trường', formatDisplayDate(academicInfo?.entryDate)],
    ['Lớp học', academicInfo?.className],
    ['Cơ sở', academicInfo?.campus],
    ['Bậc đào tạo', academicInfo?.educationLevel],
    ['Loại hình đào tạo', academicInfo?.trainingType],
    [schoolConfig.facultyLabel, academicInfo?.faculty],
    ['Ngành', academicInfo?.major],
    [schoolConfig.specializationLabel, academicInfo?.specialization],
    [schoolConfig.cohortLabel, academicInfo?.cohort],
  ];

  return (
    <DetailSectionCard
      icon="🏫"
      title={schoolConfig.academicSectionTitle}
      items={items}
      className="xl:col-span-2"
    />
  );
}

function PersonalPortalInfoCard({ personalInfo }: { personalInfo: PersonalInfo | null | undefined }) {
  const items: Array<[string, string | undefined]> = [
    ['Ngày sinh', formatDisplayDate(personalInfo?.dateOfBirth)],
    ['Dân tộc', personalInfo?.ethnicity],
    ['Tôn giáo', personalInfo?.religion],
    ['Quốc tịch', personalInfo?.nationality],
    ['Khu vực', personalInfo?.region],
    ['Số CCCD', personalInfo?.identityNumber],
    ['Ngày cấp', personalInfo?.issuedDate ? formatDisplayDate(personalInfo.issuedDate) : 'Chưa cập nhật'],
    ['Nơi cấp', personalInfo?.issuedBy],
    ['Đối tượng', personalInfo?.subjectGroup],
    ['Ngày vào Đoàn', personalInfo?.unionDate ? formatDisplayDate(personalInfo.unionDate) : 'Chưa cập nhật'],
    ['Ngày vào Đảng', personalInfo?.partyDate ? formatDisplayDate(personalInfo.partyDate) : 'Chưa cập nhật'],
    ['Điện thoại', personalInfo?.phone],
    ['Email', personalInfo?.email],
    ['Địa chỉ liên hệ', personalInfo?.contactAddress],
    ['Hộ khẩu thường trú', personalInfo?.permanentAddress],
  ];

  return <DetailSectionCard icon="🪪" title="Thông tin cá nhân" items={items} className="xl:col-span-2" />;
}

function FamilyInfoCard({ familyInfo }: { familyInfo: FamilyInfo | null | undefined }) {
  const items: Array<[string, string | undefined]> = [
    ['Họ tên Cha', familyInfo?.fatherName],
    ['Năm sinh Cha', familyInfo?.fatherBirthYear],
    ['Nghề nghiệp Cha', familyInfo?.fatherOccupation],
    ['Số điện thoại Cha', familyInfo?.fatherPhone],
    ['Họ tên Mẹ', familyInfo?.motherName],
    ['Năm sinh Mẹ', familyInfo?.motherBirthYear],
    ['Nghề nghiệp Mẹ', familyInfo?.motherOccupation],
    ['Số điện thoại Mẹ', familyInfo?.motherPhone],
  ];

  return <DetailSectionCard icon="👨‍👩‍👦" title="Quan hệ gia đình" items={items} className="xl:col-span-2" />;
}

function DetailSectionCard({ icon, title, items, className = '' }: { icon: string; title: string; items: Array<[string, string | undefined]>; className?: string }) {
  return (
    <BentoCard className={className}>
      <CardTitle icon={icon} title={title} />
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-[18px] border border-[#EAF0FF] bg-[#F8FAFF] px-4 py-3">
            <p className="text-xs font-bold text-[#6B7280]">{label}</p>
            <p className="mt-1 break-words text-sm font-black text-[#1B2559]">{value || 'Chưa cập nhật'}</p>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

function AccountStatusCard({
  school: _school,
  editing,
  saving,
  form,
  onEdit,
  onCancel,
  onSave,
  onFieldChange,
  onPersonalFieldChange,
  accountTypeCopy,
  onLogout,
}: {
  school: SchoolSlug;
  editing: boolean;
  saving: boolean;
  form: ProfileForm;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onFieldChange: (field: keyof Omit<ProfileForm, 'personalInfo'>, value: string) => void;
  onPersonalFieldChange: (field: EditablePersonalKey, value: string) => void;
  accountTypeCopy: AccountTypeCopy;
  onLogout: () => void;
}) {
  return (
    <BentoCard className="bg-gradient-to-br from-white to-[#EEF7FF] xl:col-span-2">
      <CardTitle icon="🛡️" title="Quản lý thông tin cá nhân" />
      {editing ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <ProfileInput label="Họ tên" value={form.fullName} onChange={(value) => onFieldChange('fullName', value)} />
            <ProfileInput label="Email" type="email" value={form.email} onChange={(value) => onFieldChange('email', value)} />
            <ProfileInput label="Số điện thoại" value={form.phone} onChange={(value) => onFieldChange('phone', value)} />
            <ProfileInput label="Ngày sinh" type="date" value={form.dateOfBirth} onChange={(value) => onFieldChange('dateOfBirth', value)} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {editablePersonalFields.map(([key, label]) => (
              <ProfileInput
                key={key}
                label={label}
                value={form.personalInfo[key]}
                multiline={key === 'contactAddress' || key === 'permanentAddress'}
                onChange={(value) => onPersonalFieldChange(key, value)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={onSave} disabled={saving} className="flex-1 rounded-2xl bg-[#1784DA] px-4 py-3 text-sm font-black text-white transition hover:bg-[#0F6FB8] disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
            <button onClick={onCancel} className="flex-1 rounded-2xl border border-[#EAF0FF] bg-white px-4 py-3 text-sm font-black text-[#6B7280]">Hủy</button>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_150px] sm:items-center">
          <div>
            <p className="text-2xl font-black text-[#57C785]">{accountTypeCopy.statusLabel}</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#6B7280]">Tài khoản của bạn đang được đồng bộ để truy cập <b className="text-[#1784DA]">AI Companion</b>, lịch biểu, tài liệu và nhắc nhở cá nhân.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={onEdit} className="rounded-2xl border border-[#1784DA] bg-white px-4 py-2.5 text-sm font-black text-[#1784DA] transition hover:-translate-y-0.5 hover:bg-[#EEF7FF]">Đổi thông tin →</button>
              <button onClick={onLogout} className="rounded-2xl border border-rose-100 bg-white px-4 py-2.5 text-sm font-black text-rose-500 transition hover:bg-rose-50">Đăng xuất</button>
            </div>
          </div>
          <div className="relative mx-auto grid h-36 w-36 place-items-center rounded-[32px] bg-gradient-to-br from-[#EEF7FF] to-[#D8EAF5]">
            <div className="absolute inset-5 rounded-full border border-[#1784DA]/30" />
            <span className="text-6xl drop-shadow-lg">🛡️</span>
            <span className="absolute right-7 top-8 text-2xl">✓</span>
          </div>
        </div>
      )}
    </BentoCard>
  );
}

function AICompanionMemoryCard({ school }: { school: SchoolSlug }) {
  const schoolConfig = getProfileSchoolConfig(school);

  return (
    <BentoCard>
      <CardTitle icon="✦" title="AI Companion ghi nhớ" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {schoolConfig.memoryCards.map((card) => (
          <MemoryMiniCard key={`${card.title}-${card.text}`} {...card} />
        ))}
      </div>
      <div className="mt-5 rounded-full bg-[#EEF7FF] px-5 py-3 text-center text-sm font-bold text-[#1784DA]">🤖 AI Companion luôn ghi nhớ và đồng hành cùng bạn mỗi ngày!</div>
    </BentoCard>
  );
}

function QuickStatsCard({ school }: { school: SchoolSlug }) {
  const schoolConfig = getProfileSchoolConfig(school);

  return (
    <BentoCard>
      <CardTitle icon="▥" title="Thống kê nhanh" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {schoolConfig.quickStats.map((item) => (
          <QuickStat key={item.label} {...item} />
        ))}
      </div>
    </BentoCard>
  );
}

function BentoCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[28px] border border-[#EAF0FF] bg-white p-5 shadow-[0_10px_30px_rgba(90,120,180,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_42px_rgba(90,120,180,0.12)] sm:p-6 ${className}`}>{children}</section>;
}

function CardTitle({ icon, title }: { icon: string; title: string }) {
  return <div className="flex items-center gap-2 text-lg font-black text-[#1B2559]"><span className="text-[#1784DA]">{icon}</span><h2>{title}</h2></div>;
}

function MetricWithRing({ label, value, percent, color, accent }: { label: string; value: string; percent: number; color: string; accent?: string }) {
  return <div className="flex items-center justify-between rounded-[22px] bg-[#F8FAFF] p-4"><div><p className="text-xs font-bold text-[#6B7280]">{label}</p><p className="mt-2 text-2xl font-black text-[#1B2559]">{value}</p></div><ProgressRing percent={percent} color={color} accent={accent} /></div>;
}

function ProgressRing({ percent, color, accent }: { percent: number; color: string; accent?: string }) {
  const strokeDasharray = `${percent} 100`;
  return <div className="relative h-16 w-16"><svg viewBox="0 0 36 36" className="h-full w-full -rotate-90"><path d="M18 2.5a15.5 15.5 0 1 1 0 31a15.5 15.5 0 0 1 0-31" fill="none" stroke="#EAF0FF" strokeWidth="4" /><path d="M18 2.5a15.5 15.5 0 1 1 0 31a15.5 15.5 0 0 1 0-31" fill="none" stroke={color} strokeLinecap="round" strokeWidth="4" strokeDasharray={strokeDasharray} /></svg><span className="absolute inset-0 grid place-items-center text-sm font-black text-[#1B2559]">{accent || ''}</span></div>;
}

function DateLine({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#EEF7FF] text-[#1784DA]">📅</span><div><p className="text-xs font-semibold text-[#6B7280]">{label}</p><p className="text-sm font-black text-[#1B2559]">{value}</p></div></div>;
}

function MemoryMiniCard({ icon, title, text, progress, tag, button, bg }: { icon: string; title: string; text: string; progress?: number; tag?: string; button?: string; bg: string }) {
  return <div className="rounded-[20px] border border-[#EAF0FF] bg-white p-4 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-2xl text-lg" style={{ backgroundColor: bg }}>{icon}</span><p className="mt-3 text-sm font-black text-[#1B2559]">{title}</p><p className="mt-1 min-h-10 text-xs font-semibold leading-5 text-[#6B7280]">{text}</p>{progress ? <div className="mt-3 h-2 rounded-full bg-[#EAF0FF]"><div className="h-full rounded-full bg-[#1784DA]" style={{ width: `${progress}%` }} /></div> : null}{tag ? <span className="mt-3 inline-flex rounded-full bg-[#EEF7FF] px-3 py-1 text-[11px] font-black text-[#1784DA]">{tag}</span> : null}{button ? <button className="mt-3 rounded-full bg-[#EEF7FF] px-3 py-1 text-[11px] font-black text-[#1784DA]">{button}</button> : null}</div>;
}

function QuickStat({ label, value, note, percent, chart }: { label: string; value: string; note: string; percent?: number; chart?: 'spark' }) {
  return <div className="rounded-[20px] border border-[#EAF0FF] p-4"><p className="text-xs font-semibold text-[#6B7280]">{label}</p><p className="mt-2 text-2xl font-black text-[#1B2559]">{value}</p><div className="mt-3 h-14">{chart ? <MiniSparkline /> : <ProgressRing percent={percent || 0} color={percent && percent > 72 ? '#57C785' : '#4FB3EC'} />}</div><p className="mt-2 text-xs font-semibold text-[#6B7280]">{note}</p></div>;
}

function MiniSparkline() {
  return <svg viewBox="0 0 120 45" className="h-full w-full"><path d="M5 35 L25 25 L45 18 L65 28 L85 12 L110 20" fill="none" stroke="#1784DA" strokeLinecap="round" strokeWidth="3" /><path d="M5 35 L25 25 L45 18 L65 28 L85 12 L110 20 L110 45 L5 45 Z" fill="#1784DA" opacity="0.08" />{[5, 25, 45, 65, 85, 110].map((x, index) => <circle key={x} cx={x} cy={[35, 25, 18, 28, 12, 20][index]} r="3" fill="#1784DA" />)}</svg>;
}

function ProfileInput({ label, value, type = 'text', multiline = false, onChange }: { label: string; value: string; type?: string; multiline?: boolean; onChange: (value: string) => void }) {
  return (
    <label className={multiline ? 'block md:col-span-2' : 'block'}>
      <span className="mb-1 block text-xs font-black text-[#6B7280]">{label}</span>
      {multiline ? (
        <textarea value={value} rows={3} onChange={(event) => onChange(event.target.value)} className="w-full resize-none rounded-2xl border border-[#EAF0FF] bg-white px-4 py-3 text-sm font-bold text-[#1B2559] outline-none focus:border-[#1784DA] focus:ring-4 focus:ring-[#1784DA]/10" />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-[#EAF0FF] bg-white px-4 py-3 text-sm font-bold text-[#1B2559] outline-none focus:border-[#1784DA] focus:ring-4 focus:ring-[#1784DA]/10" />
      )}
    </label>
  );
}

function CampusIllustration() {
  return <svg className="absolute bottom-0 right-0 h-48 w-80 text-primary/10" viewBox="0 0 320 190" fill="none"><path d="M180 170V74l54-34 54 34v96" stroke="currentColor" strokeWidth="3" /><path d="M205 170v-52h58v52M220 91h28M234 40v-22" stroke="currentColor" strokeWidth="3" /><path d="M40 172c44-22 79-26 120-8 34 15 61 13 103-6" stroke="currentColor" strokeWidth="3" /><circle cx="284" cy="24" r="8" stroke="currentColor" strokeWidth="3" /><path d="M82 112h54v58H82zM96 126h10M115 126h10M96 145h10M115 145h10" stroke="currentColor" strokeWidth="3" /></svg>;
}
