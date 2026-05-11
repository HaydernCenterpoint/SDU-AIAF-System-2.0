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
import styles from './ProfessionalProfile.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

// ===== ICONS =====

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17,21 17,13 7,13 7,21"/>
      <polyline points="7,3 7,8 15,8"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.icon}>
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <circle cx="12" cy="8" r="6"/>
      <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10,9 9,9 8,9"/>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.iconSmall}>
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.icon}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}

// ===== HELPER FUNCTIONS =====

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
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDisplayDateShort(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
}

function calculateAge(birthDate?: string) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
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

// ===== DEFAULT DATA =====

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
  schoolName: 'Trường Đại học Sao Đỏ',
  gpa: '3.45',
  creditsCompleted: 98,
  totalCredits: 150,
};

const defaultPersonalDetails = {
  ethnicity: 'Kinh',
  religion: 'Không',
  nationality: 'Việt Nam',
  region: 'Khu vực 1',
  identityNumber: '022204004356',
  issuedDate: '2022-03-15',
  issuedBy: 'Công an tỉnh Quảng Ninh',
  subjectGroup: '00 - Khối Khoa học Xã hội',
  unionDate: '2015-05-15',
  partyDate: '',
  contactAddress: '471, Tổ 4, Khu Quang Trung, Mạo Khê, Đông Triều, Quảng Ninh',
  permanentAddress: 'Số nhà 471, Tổ 4, Khu Quang Trung, Phường Mạo Khê, Tỉnh Quảng Ninh',
  bloodType: 'A',
  height: '168 cm',
  weight: '62 kg',
  healthStatus: 'Tốt',
};

const defaultFamilyDetails = {
  fatherName: 'Nguyễn Văn Thành',
  fatherBirthYear: '1966',
  fatherOccupation: 'Kinh doanh tự do',
  fatherPhone: '0904388848',
  motherName: 'Đặng Thị Tự',
  motherBirthYear: '1972',
  motherOccupation: 'Kinh doanh tự do',
  motherPhone: '0936792369',
};

const defaultEmergencyContact = {
  name: 'Nguyễn Văn Thành',
  relationship: 'Cha',
  phone: '0904388848',
};

function buildFallbackProfile(recordId: string, faculty: string, userProfile?: StudentProfileDetails | null) {
  const academicBase = { ...defaultAcademicDetails, ...(userProfile?.academicInfo || {}), studentCode: recordId, major: userProfile?.academicInfo?.major || faculty };
  return {
    avatarUrl: userProfile?.avatarUrl || null,
    academicInfo: academicBase,
    personalInfo: {
      ...defaultPersonalDetails,
      ...(userProfile?.personalInfo || {}),
    },
    familyInfo: {
      ...defaultFamilyDetails,
      ...(userProfile?.familyInfo || {}),
    },
  };
}

// ===== PROFILE COMPLETION =====

function calculateProfileCompletion(personalInfo: PersonalInfo | null | undefined, familyInfo: FamilyInfo | null | undefined, academicInfo: any) {
  const fields = [
    personalInfo?.fullName,
    personalInfo?.dateOfBirth,
    personalInfo?.phone,
    personalInfo?.email,
    personalInfo?.ethnicity,
    personalInfo?.nationality,
    personalInfo?.identityNumber,
    personalInfo?.contactAddress,
    personalInfo?.permanentAddress,
    familyInfo?.fatherName,
    familyInfo?.motherName,
    academicInfo?.className,
  ];
  
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

// ===== TAB TYPES =====

type TabId = 'overview' | 'academic' | 'personal' | 'family' | 'documents' | 'health' | 'emergency' | 'settings';

// ===== MAIN COMPONENT =====

export function ProfessionalProfilePage({ school = 'sdu' }: { school?: SchoolSlug }) {
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
        <ProfessionalProfileContent school={school} />
      </AppShell>
    </ProtectedRoute>
  );
}

function ProfessionalProfileContent({ school }: { school: SchoolSlug }) {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [editing, setEditing] = useState(false);
  const [profileDetails, setProfileDetails] = useState<StudentProfileDetails | null>(null);
  const [form, setForm] = useState<ProfileForm>(() => buildProfileForm(null, null));
  const [saving, setSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [error, setError] = useState('');

  const accountTypeCopy = getAccountTypeCopy(user?.accountType);
  const studentId = user?.studentId || '2200286';
  const faculty = user?.faculty || 'Công nghệ thông tin';
  const syncedProfile = mergeProfileWithUser(
    profileDetails || buildFallbackProfile(studentId, faculty, user?.profile),
    user,
  );
  const academicInfo = syncedProfile.academicInfo || {};
  const personalInfo = syncedProfile.personalInfo || {};
  const familyInfo = syncedProfile.familyInfo || {};
  const avatarUrl = syncedProfile.avatarUrl || user?.avatarUrl || null;

  const profileCompletion = useMemo(
    () => calculateProfileCompletion(personalInfo, familyInfo, academicInfo),
    [personalInfo, familyInfo, academicInfo]
  );

  const age = useMemo(() => calculateAge(user?.dateOfBirth || personalInfo?.dateOfBirth), [user, personalInfo]);

  useEffect(() => {
    const nextProfile = mergeProfileWithUser(
      profileDetails || buildFallbackProfile(studentId, faculty, user?.profile),
      user,
    );
    setForm(buildProfileForm(nextProfile, user));
  }, [faculty, profileDetails, studentId, user]);

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
      const newAvatarUrl = await readFileAsDataUrl(file);
      const res = await fetch(`${API_BASE}/profile/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatarUrl: newAvatarUrl }),
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

  const tabs: { id: TabId; label: string; icon: ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Tổng quan', icon: <UserIcon /> },
    { id: 'academic', label: 'Học vấn', icon: <BookIcon /> },
    { id: 'personal', label: 'Cá nhân', icon: <BadgeIcon /> },
    { id: 'family', label: 'Gia đình', icon: <UsersIcon /> },
    { id: 'documents', label: 'Tài liệu', icon: <FileIcon /> },
    { id: 'health', label: 'Y tế', icon: <HeartIcon /> },
    { id: 'emergency', label: 'Liên hệ khẩn', icon: <AlertIcon /> },
    { id: 'settings', label: 'Cài đặt', icon: <SettingsIcon /> },
  ];

  return (
    <div className={styles.page}>
      {/* Enhanced Header with Banner */}
      <header className={styles.header}>
        <div className={styles.headerBanner}>
          <div className={styles.headerPattern} />
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <p className={styles.headerLabel}>HỒ SƠ SINH VIÊN</p>
              <h1 className={styles.headerTitle}>Thông tin cá nhân</h1>
              <div className={styles.headerMeta}>
                <span className={styles.headerMetaItem}>
                  <BookIcon /> {academicInfo.faculty || 'Khoa Công nghệ thông tin'}
                </span>
                <span className={styles.headerMetaItem}>
                  <CalendarIcon /> {academicInfo.className || 'DK13-CNTT1'}
                </span>
              </div>
            </div>
            <div className={styles.headerStats}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{profileCompletion}%</span>
                <span className={styles.statLabel}>Hoàn thiện</span>
                <div className={styles.statProgress}>
                  <div className={styles.statProgressBar} style={{ width: `${profileCompletion}%` }} />
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{academicInfo?.gpa || '3.45'}</span>
                <span className={styles.statLabel}>GPA</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{academicInfo?.creditsCompleted || 98}</span>
                <span className={styles.statLabel}>Tín chỉ</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Profile Sidebar */}
        <aside className={styles.sidebar}>
          {/* Avatar Card */}
          <div className={styles.avatarCard}>
            <div className={styles.avatarWrapper}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user?.fullName?.charAt(0) || 'S'}
                </div>
              )}
              <label className={styles.avatarOverlay}>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/webp" 
                  onChange={handleAvatarFileChange}
                  className={styles.hiddenInput}
                />
                <CameraIcon />
                <span>{avatarSaving ? 'Đang lưu...' : 'Đổi ảnh'}</span>
              </label>
            </div>
            <h2 className={styles.profileName}>{user?.fullName || 'Sinh viên'}</h2>
            <p className={styles.profileId}>{accountTypeCopy.codeLabel}: {studentId}</p>
            <div className={styles.profileBadges}>
              <span className={styles.statusBadge}>
                <CheckIcon />
                {accountTypeCopy.statusLabel}
              </span>
              <span className={styles.bloodTypeBadge}>
                {personalInfo.bloodType || 'A'}
              </span>
            </div>
          </div>

          {/* Quick Info */}
          <div className={styles.quickInfo}>
            <div className={styles.quickInfoHeader}>
              <span>Thông tin liên hệ</span>
            </div>
            <div className={styles.quickInfoItem}>
              <MailIcon />
              <span>{user?.email || personalInfo.email || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.quickInfoItem}>
              <PhoneIcon />
              <span>{user?.phone || personalInfo.phone || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.quickInfoItem}>
              <MapPinIcon />
              <span>{personalInfo.contactAddress?.split(',')[0] || 'Chưa cập nhật'}</span>
            </div>
            {age && (
              <div className={styles.quickInfoItem}>
                <ClockIcon />
                <span>{age} tuổi</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className={styles.nav}>
            <div className={styles.navHeader}>Menu</div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && <span className={styles.navBadge}>{tab.badge}</span>}
                <ChevronRightIcon />
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          {error && (
            <div className={styles.errorAlert}>
              <AlertIcon />
              {error}
            </div>
          )}

          {activeTab === 'overview' && (
            <OverviewTab 
              user={user} 
              academicInfo={academicInfo}
              personalInfo={personalInfo}
              familyInfo={familyInfo}
              profileCompletion={profileCompletion}
            />
          )}

          {activeTab === 'academic' && (
            <AcademicTab academicInfo={academicInfo} />
          )}

          {activeTab === 'personal' && (
            <PersonalTab 
              personalInfo={personalInfo}
              editing={editing}
              form={form}
              onEdit={() => setEditing(true)}
              onCancel={() => {
                setForm(buildProfileForm(syncedProfile, user));
                setEditing(false);
              }}
              onSave={handleSave}
              onFieldChange={updateFormField}
              onPersonalFieldChange={updatePersonalField}
              saving={saving}
            />
          )}

          {activeTab === 'family' && (
            <FamilyTab familyInfo={familyInfo} />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab studentId={studentId} academicInfo={academicInfo} />
          )}

          {activeTab === 'health' && (
            <HealthTab personalInfo={personalInfo} />
          )}

          {activeTab === 'emergency' && (
            <EmergencyTab familyInfo={familyInfo} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              onLogout={() => {
                logout(school, getSchoolGatewayPath());
                router.replace(getSchoolGatewayPath());
              }}
              onEdit={() => setEditing(true)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ===== TAB COMPONENTS =====

function OverviewTab({ 
  user, 
  academicInfo, 
  personalInfo, 
  familyInfo,
  profileCompletion
}: { 
  user?: AuthUser | null;
  academicInfo: any;
  personalInfo: PersonalInfo | null | undefined;
  familyInfo: FamilyInfo | null | undefined;
  profileCompletion: number;
}) {
  const achievements = [
    { icon: '🎓', title: 'Tốt nghiệp THPT', desc: 'Loại Giỏi', year: '2022' },
    { icon: '📚', title: 'Học bổng', desc: 'Khá năm 2023-2024', year: '2024' },
    { icon: '⭐', title: 'Sinh viên 5 tốt', desc: 'Năm học 2023-2024', year: '2024' },
  ];

  const timeline = [
    { year: '2022', event: 'Nhập học ĐH Sao Đỏ', type: 'academic' },
    { year: '2023', event: 'Đạt GPA 3.6', type: 'achievement' },
    { year: '2024', event: 'Học bổng Khá', type: 'scholarship' },
    { year: '2025', event: 'Thực tập tại công ty', type: 'internship' },
  ];

  return (
    <div className={styles.tabContent}>
      {/* Profile Completion Banner */}
      <div className={styles.completionBanner}>
        <div className={styles.completionInfo}>
          <h3>Hoàn thiện hồ sơ: {profileCompletion}%</h3>
          <p>{profileCompletion < 100 ? 'Cập nhật thêm thông tin để hoàn thiện hồ sơ sinh viên của bạn.' : 'Hồ sơ của bạn đã được cập nhật đầy đủ!'}</p>
        </div>
        <div className={styles.completionBar}>
          <div className={styles.completionProgress} style={{ width: `${profileCompletion}%` }} />
        </div>
      </div>

      <div className={styles.overviewGrid}>
        {/* Student Card */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <UserIcon />
            <h3>Thông tin sinh viên</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Họ và tên</span>
              <span className={styles.infoValue}>{user?.fullName || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ngày sinh</span>
              <span className={styles.infoValue}>{formatDisplayDate(user?.dateOfBirth || personalInfo?.dateOfBirth)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Giới tính</span>
              <span className={styles.infoValue}>Nam</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Dân tộc</span>
              <span className={styles.infoValue}>{personalInfo?.ethnicity || 'Kinh'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Quốc tịch</span>
              <span className={styles.infoValue}>{personalInfo?.nationality || 'Việt Nam'}</span>
            </div>
          </div>
        </div>

        {/* Academic Card */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <BookIcon />
            <h3>Thông tin học tập</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Trường</span>
              <span className={styles.infoValue}>{academicInfo?.schoolName || 'Đại học Sao Đỏ'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Khoa</span>
              <span className={styles.infoValue}>{academicInfo?.faculty || 'Công nghệ thông tin'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Lớp</span>
              <span className={styles.infoValue}>{academicInfo?.className || 'DK13-CNTT1'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>GPA</span>
              <span className={styles.infoValueHighlight}>{academicInfo?.gpa || '3.45'}/4.0</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Tín chỉ</span>
              <span className={styles.infoValue}>{academicInfo?.creditsCompleted || 98}/{academicInfo?.totalCredits || 150}</span>
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <HomeIcon />
            <h3>Liên hệ</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValueSmall}>{user?.email || personalInfo?.email || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Điện thoại</span>
              <span className={styles.infoValue}>{user?.phone || personalInfo?.phone || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Địa chỉ</span>
              <span className={styles.infoValueSmall}>{personalInfo?.contactAddress || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>

        {/* Family Card */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <UsersIcon />
            <h3>Gia đình</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Cha</span>
              <span className={styles.infoValue}>{familyInfo?.fatherName || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Nghề nghiệp</span>
              <span className={styles.infoValue}>{familyInfo?.fatherOccupation || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Mẹ</span>
              <span className={styles.infoValue}>{familyInfo?.motherName || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Nghề nghiệp</span>
              <span className={styles.infoValue}>{familyInfo?.motherOccupation || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <AwardIcon />
          <h2>Thành tựu & Giải thưởng</h2>
        </div>
        <div className={styles.achievementsGrid}>
          {achievements.map((item, index) => (
            <div key={index} className={styles.achievementCard}>
              <span className={styles.achievementIcon}>{item.icon}</span>
              <div className={styles.achievementContent}>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
                <span className={styles.achievementYear}>{item.year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <ClockIcon />
          <h2>Hành trình học tập</h2>
        </div>
        <div className={styles.timeline}>
          {timeline.map((item, index) => (
            <div key={index} className={styles.timelineItem}>
              <div className={`${styles.timelineDot} ${styles[`timelineDot${item.type}`]}`} />
              <div className={styles.timelineContent}>
                <span className={styles.timelineYear}>{item.year}</span>
                <span className={styles.timelineEvent}>{item.event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AcademicTab({ academicInfo }: { academicInfo: any }) {
  const items = [
    ['Trạng thái sinh viên', academicInfo?.status, 'status'],
    ['Mã hồ sơ', academicInfo?.recordCode],
    ['Mã sinh viên', academicInfo?.studentCode],
    ['Ngày vào trường', formatDisplayDate(academicInfo?.entryDate)],
    ['Lớp học', academicInfo?.className],
    ['Cơ sở', academicInfo?.campus],
    ['Bậc đào tạo', academicInfo?.educationLevel],
    ['Loại hình đào tạo', academicInfo?.trainingType],
    ['Khoa', academicInfo?.faculty],
    ['Ngành', academicInfo?.major],
    ['Chuyên ngành', academicInfo?.specialization],
    ['Khóa học', academicInfo?.cohort],
    ['Thời gian đào tạo', academicInfo?.courseRange],
    ['GPA tích lũy', academicInfo?.gpa, 'gpa'],
    ['Tín chỉ đã hoàn thành', `${academicInfo?.creditsCompleted || 98}/${academicInfo?.totalCredits || 150}`],
    ['Xếp hạng học lực', 'Khá', 'rank'],
  ];

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeaderSimple}>
        <BookIcon />
        <h2>Thông tin học vấn</h2>
      </div>
      
      <div className={styles.academicOverview}>
        <div className={styles.academicStatCard}>
          <div className={styles.academicStatIcon}>
            <AwardIcon />
          </div>
          <div className={styles.academicStatContent}>
            <span className={styles.academicStatValue}>{academicInfo?.gpa || '3.45'}</span>
            <span className={styles.academicStatLabel}>GPA Tích lũy</span>
          </div>
          <div className={styles.academicStatMax}>/4.0</div>
        </div>
        <div className={styles.academicStatCard}>
          <div className={styles.academicStatIcon}>
            <BookIcon />
          </div>
          <div className={styles.academicStatContent}>
            <span className={styles.academicStatValue}>{academicInfo?.creditsCompleted || 98}</span>
            <span className={styles.academicStatLabel}>Tín chỉ hoàn thành</span>
          </div>
          <div className={styles.academicStatMax}>/{academicInfo?.totalCredits || 150}</div>
        </div>
        <div className={styles.academicStatCard}>
          <div className={styles.academicStatIcon}>
            <ActivityIcon />
          </div>
          <div className={styles.academicStatContent}>
            <span className={styles.academicStatValue}>Khá</span>
            <span className={styles.academicStatLabel}>Xếp hạng</span>
          </div>
        </div>
      </div>

      <div className={styles.fullWidthCard}>
        <div className={styles.cardHeader}>
          <BookIcon />
          <h3>Hồ sơ học tập chi tiết</h3>
        </div>
        <div className={styles.cardBodyGrid}>
          {items.map(([label, value, type]) => (
            <div key={label} className={`${styles.infoItem} ${type === 'status' ? styles.statusItem : ''}`}>
              <span className={styles.infoLabel}>{label}</span>
              <span className={`${styles.infoValue} ${type === 'gpa' ? styles.gpaHighlight : ''} ${type === 'rank' ? styles.rankHighlight : ''}`}>
                {value || 'Chưa cập nhật'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Study Progress */}
      <div className={styles.sectionWrapper}>
        <h3 className={styles.subSectionTitle}>Tiến độ học tập</h3>
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span>Tổng số tín chỉ yêu cầu</span>
            <span>{academicInfo?.creditsCompleted || 98}/{academicInfo?.totalCredits || 150}</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${((academicInfo?.creditsCompleted || 98) / (academicInfo?.totalCredits || 150)) * 100}%` }} 
            />
          </div>
          <span className={styles.progressPercent}>
            {Math.round(((academicInfo?.creditsCompleted || 98) / (academicInfo?.totalCredits || 150)) * 100)}% hoàn thành
          </span>
        </div>
      </div>
    </div>
  );
}

function PersonalTab({ 
  personalInfo,
  editing,
  form,
  onEdit,
  onCancel,
  onSave,
  onFieldChange,
  onPersonalFieldChange,
  saving
}: { 
  personalInfo: PersonalInfo | null | undefined;
  editing: boolean;
  form: ProfileForm;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onFieldChange: (field: keyof Omit<ProfileForm, 'personalInfo'>, value: string) => void;
  onPersonalFieldChange: (field: EditablePersonalKey, value: string) => void;
  saving: boolean;
}) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Thông tin cá nhân</h2>
        {!editing && (
          <button className={styles.editButton} onClick={onEdit}>
            <EditIcon />
            Chỉnh sửa
          </button>
        )}
      </div>

      {editing ? (
        <div className={styles.editForm}>
          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>Thông tin cơ bản</h3>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label>Họ tên</label>
                <input 
                  type="text" 
                  value={form.fullName} 
                  onChange={(e) => onFieldChange('fullName', e.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label>Email</label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => onFieldChange('email', e.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label>Số điện thoại</label>
                <input 
                  type="text" 
                  value={form.phone} 
                  onChange={(e) => onFieldChange('phone', e.target.value)}
                />
              </div>
              <div className={styles.formField}>
                <label>Ngày sinh</label>
                <input 
                  type="date" 
                  value={form.dateOfBirth} 
                  onChange={(e) => onFieldChange('dateOfBirth', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>Thông tin CCCD</h3>
            <div className={styles.formGrid}>
              {editablePersonalFields.slice(0, 6).map(([key, label]) => (
                <div key={key} className={styles.formField}>
                  <label>{label}</label>
                  <input 
                    type="text" 
                    value={form.personalInfo[key]} 
                    onChange={(e) => onPersonalFieldChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>Địa chỉ</h3>
            <div className={styles.formGrid}>
              {editablePersonalFields.slice(10).map(([key, label]) => (
                <div key={key} className={`${styles.formField} ${styles.fullWidth}`}>
                  <label>{label}</label>
                  <textarea 
                    value={form.personalInfo[key]} 
                    onChange={(e) => onPersonalFieldChange(key, e.target.value)}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={styles.saveButton} onClick={onSave} disabled={saving}>
              <SaveIcon />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button className={styles.cancelButton} onClick={onCancel}>
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.fullWidthCard}>
          <div className={styles.cardHeader}>
            <BadgeIcon />
            <h3>Thông tin cá nhân chi tiết</h3>
          </div>
          <div className={styles.cardBodyGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Họ tên</span>
              <span className={styles.infoValue}>{personalInfo?.fullName || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Ngày sinh</span>
              <span className={styles.infoValue}>{formatDisplayDate(personalInfo?.dateOfBirth)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Giới tính</span>
              <span className={styles.infoValue}>Nam</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Dân tộc</span>
              <span className={styles.infoValue}>{personalInfo?.ethnicity || 'Kinh'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tôn giáo</span>
              <span className={styles.infoValue}>{personalInfo?.religion || 'Không'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Quốc tịch</span>
              <span className={styles.infoValue}>{personalInfo?.nationality || 'Việt Nam'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Khu vực</span>
              <span className={styles.infoValue}>{personalInfo?.region || 'Khu vực 1'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Điện thoại</span>
              <span className={styles.infoValue}>{personalInfo?.phone || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValueSmall}>{personalInfo?.email || 'Chưa cập nhật'}</span>
            </div>
            <div className={`${styles.infoItem} ${styles.fullWidth}`}>
              <span className={styles.infoLabel}>Địa chỉ liên hệ</span>
              <span className={styles.infoValue}>{personalInfo?.contactAddress || 'Chưa cập nhật'}</span>
            </div>
            <div className={`${styles.infoItem} ${styles.fullWidth}`}>
              <span className={styles.infoLabel}>Hộ khẩu thường trú</span>
              <span className={styles.infoValue}>{personalInfo?.permanentAddress || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Info */}
      <div className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <CreditCardIcon />
          <h3>Thông tin CCCD</h3>
        </div>
        <div className={styles.idCardPreview}>
          <div className={styles.idCardField}>
            <span className={styles.idCardLabel}>Số CCCD</span>
            <span className={styles.idCardValue}>{personalInfo?.identityNumber || 'Chưa cập nhật'}</span>
          </div>
          <div className={styles.idCardField}>
            <span className={styles.idCardLabel}>Ngày cấp</span>
            <span className={styles.idCardValue}>{formatDisplayDate(personalInfo?.issuedDate)}</span>
          </div>
          <div className={styles.idCardField}>
            <span className={styles.idCardLabel}>Nơi cấp</span>
            <span className={styles.idCardValue}>{personalInfo?.issuedBy || 'Chưa cập nhật'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FamilyTab({ familyInfo }: { familyInfo: FamilyInfo | null | undefined }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeaderSimple}>
        <UsersIcon />
        <h2>Thông tin gia đình</h2>
      </div>

      <div className={styles.familyGrid}>
        {/* Father Card */}
        <div className={styles.familyCard}>
          <div className={styles.familyCardHeader}>
            <span className={styles.familyIcon}>👨</span>
            <div>
              <h3>Thông tin cha</h3>
              <span className={styles.familyRelation}>Cha ruột</span>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Họ tên</span>
              <span className={styles.infoValue}>{familyInfo?.fatherName || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Năm sinh</span>
              <span className={styles.infoValue}>{familyInfo?.fatherBirthYear || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Nghề nghiệp</span>
              <span className={styles.infoValue}>{familyInfo?.fatherOccupation || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Số điện thoại</span>
              <span className={styles.infoValueHighlight}>{familyInfo?.fatherPhone || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>

        {/* Mother Card */}
        <div className={styles.familyCard}>
          <div className={styles.familyCardHeader}>
            <span className={styles.familyIcon}>👩</span>
            <div>
              <h3>Thông tin mẹ</h3>
              <span className={styles.familyRelation}>Mẹ ruột</span>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Họ tên</span>
              <span className={styles.infoValue}>{familyInfo?.motherName || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Năm sinh</span>
              <span className={styles.infoValue}>{familyInfo?.motherBirthYear || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Nghề nghiệp</span>
              <span className={styles.infoValue}>{familyInfo?.motherOccupation || 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Số điện thoại</span>
              <span className={styles.infoValueHighlight}>{familyInfo?.motherPhone || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Family Summary */}
      <div className={styles.sectionWrapper}>
        <div className={styles.familySummary}>
          <div className={styles.familySummaryItem}>
            <span className={styles.familySummaryIcon}>👨‍👩‍👦</span>
            <div>
              <h4>Gia đình 4 người</h4>
              <p>Đang sinh sống tại Quảng Ninh</p>
            </div>
          </div>
          <div className={styles.familySummaryItem}>
            <span className={styles.familySummaryIcon}>💼</span>
            <div>
              <h4>Kinh doanh tự do</h4>
              <p>Cả cha và mẹ đều làm kinh doanh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ studentId, academicInfo }: { studentId: string; academicInfo: any }) {
  const documents = [
    { name: 'Thẻ sinh viên', icon: '🪪', status: 'active', expiry: '2026-06-30' },
    { name: 'Hồ sơ nhập học', icon: '📁', status: 'verified', date: '2022-09-23' },
    { name: 'Bằng tốt nghiệp THPT', icon: '🎓', status: 'verified', date: '2022-06-30' },
    { name: 'Giấy khám sức khỏe', icon: '🏥', status: 'verified', date: '2022-08-15' },
    { name: 'CMND/CCCD', icon: '🪪', status: 'verified', date: '2022-03-15' },
    { name: 'Học bạ THPT', icon: '📚', status: 'verified', date: '2022-06-30' },
  ];

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeaderSimple}>
        <FileIcon />
        <h2>Tài liệu & Giấy tờ</h2>
      </div>

      {/* Quick Actions */}
      <div className={styles.documentActions}>
        <button className={styles.documentActionBtn}>
          <DownloadIcon />
          Tải thẻ sinh viên
        </button>
        <button className={styles.documentActionBtn}>
          <FileIcon />
          Yêu cầu cấp lại
        </button>
      </div>

      {/* Documents Grid */}
      <div className={styles.documentsGrid}>
        {documents.map((doc, index) => (
          <div key={index} className={styles.documentCard}>
            <div className={styles.documentIconWrapper}>
              <span className={styles.documentIcon}>{doc.icon}</span>
            </div>
            <div className={styles.documentInfo}>
              <h4>{doc.name}</h4>
              <div className={styles.documentMeta}>
                <span className={`${styles.documentStatus} ${styles[`status${doc.status}`]}`}>
                  {doc.status === 'active' ? 'Đang hoạt động' : doc.status === 'verified' ? 'Đã xác minh' : doc.status}
                </span>
                {doc.expiry && <span className={styles.documentExpiry}>Hết hạn: {formatDisplayDate(doc.expiry)}</span>}
                {doc.date && <span className={styles.documentDate}>Ngày cấp: {formatDisplayDate(doc.date)}</span>}
              </div>
            </div>
            <button className={styles.documentDownload}>
              <DownloadIcon />
            </button>
          </div>
        ))}
      </div>

      {/* Student ID Preview */}
      <div className={styles.sectionWrapper}>
        <h3 className={styles.subSectionTitle}>Thẻ sinh viên</h3>
        <div className={styles.studentIdCard}>
          <div className={styles.studentIdHeader}>
            <span className={styles.schoolLogo}>🎓</span>
            <div>
              <h4>TRƯỜNG ĐẠI HỌC SAO ĐỎ</h4>
              <p>STUDENT ID CARD</p>
            </div>
          </div>
          <div className={styles.studentIdBody}>
            <div className={styles.studentIdAvatar}>
              <UserIcon />
            </div>
            <div className={styles.studentIdDetails}>
              <p className={styles.studentIdName}>{academicInfo.studentCode || studentId}</p>
              <p className={styles.studentIdFaculty}>{academicInfo.faculty || 'CNTT'}</p>
              <p className={styles.studentIdClass}>{academicInfo.className || 'DK13-CNTT1'}</p>
            </div>
          </div>
          <div className={styles.studentIdFooter}>
            <span>Hiệu lực: {academicInfo.courseRange || '2022 - 2026'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthTab({ personalInfo }: { personalInfo: PersonalInfo | null | undefined }) {
  const healthInfo = [
    { label: 'Nhóm máu', value: personalInfo?.bloodType || 'A', icon: '🩸' },
    { label: 'Chiều cao', value: personalInfo?.height || '168 cm', icon: '📏' },
    { label: 'Cân nặng', value: personalInfo?.weight || '62 kg', icon: '⚖️' },
    { label: 'Tình trạng sức khỏe', value: personalInfo?.healthStatus || 'Tốt', icon: '✅' },
  ];

  const allergies = ['Không có'];
  const medications = ['Không sử dụng'];
  const conditions = ['Không có'];

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeaderSimple}>
        <HeartIcon />
        <h2>Thông tin sức khỏe</h2>
      </div>

      {/* Health Stats */}
      <div className={styles.healthStats}>
        {healthInfo.map((item, index) => (
          <div key={index} className={styles.healthStatCard}>
            <span className={styles.healthStatIcon}>{item.icon}</span>
            <div className={styles.healthStatContent}>
              <span className={styles.healthStatLabel}>{item.label}</span>
              <span className={styles.healthStatValue}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Medical Details */}
      <div className={styles.medicalDetails}>
        <div className={styles.medicalSection}>
          <h3><span>🤧</span> Dị ứng</h3>
          <ul>
            {allergies.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={styles.medicalSection}>
          <h3><span>💊</span> Thuốc đang sử dụng</h3>
          <ul>
            {medications.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={styles.medicalSection}>
          <h3><span>🏥</span> Bệnh lý đặc biệt</h3>
          <ul>
            {conditions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Insurance Info */}
      <div className={styles.sectionWrapper}>
        <div className={styles.insuranceCard}>
          <div className={styles.insuranceHeader}>
            <ShieldIcon />
            <h3>Bảo hiểm y tế</h3>
          </div>
          <div className={styles.insuranceBody}>
            <div className={styles.insuranceField}>
              <span className={styles.insuranceLabel}>Số thẻ BHYT</span>
              <span className={styles.insuranceValue}>DN1234567890123</span>
            </div>
            <div className={styles.insuranceField}>
              <span className={styles.insuranceLabel}>Nơi đăng ký KCB</span>
              <span className={styles.insuranceValue}>Bệnh viện đa khoa tỉnh Quảng Ninh</span>
            </div>
            <div className={styles.insuranceField}>
              <span className={styles.insuranceLabel}>Hạn sử dụng</span>
              <span className={styles.insuranceValue}>31/12/2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmergencyTab({ familyInfo }: { familyInfo: FamilyInfo | null | undefined }) {
  const emergencyContacts = [
    {
      name: familyInfo?.fatherName || 'Nguyễn Văn Thành',
      relationship: 'Cha',
      phone: familyInfo?.fatherPhone || '0904388848',
      icon: '👨',
      priority: 'primary'
    },
    {
      name: familyInfo?.motherName || 'Đặng Thị Tự',
      relationship: 'Mẹ',
      phone: familyInfo?.motherPhone || '0936792369',
      icon: '👩',
      priority: 'secondary'
    },
  ];

  const emergencyServices = [
    { name: 'Cấp cứu', phone: '115', icon: '🚑' },
    { name: 'PCCC', phone: '114', icon: '🚒' },
    { name: 'Công an', phone: '113', icon: '🚔' },
  ];

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeaderSimple}>
        <AlertIcon />
        <h2>Liên hệ khẩn cấp</h2>
      </div>

      <div className={styles.emergencyNotice}>
        <AlertIcon />
        <p>Nếu có sự cố khẩn cấp, vui lòng liên hệ ngay với người thân hoặc dịch vụ cứu hộ.</p>
      </div>

      {/* Emergency Contacts */}
      <div className={styles.emergencyContacts}>
        {emergencyContacts.map((contact, index) => (
          <div key={index} className={`${styles.emergencyCard} ${styles[`emergency${contact.priority}`]}`}>
            <div className={styles.emergencyCardHeader}>
              <span className={styles.emergencyIcon}>{contact.icon}</span>
              <div>
                <h4>{contact.name}</h4>
                <span className={styles.emergencyRelation}>{contact.relationship}</span>
              </div>
              {contact.priority === 'primary' && (
                <span className={styles.priorityBadge}>Ưu tiên</span>
              )}
            </div>
            <div className={styles.emergencyCardBody}>
              <a href={`tel:${contact.phone}`} className={styles.emergencyPhone}>
                <PhoneIcon />
                {contact.phone}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Services */}
      <div className={styles.sectionWrapper}>
        <h3 className={styles.subSectionTitle}>Dịch vụ khẩn cấp</h3>
        <div className={styles.emergencyServices}>
          {emergencyServices.map((service, index) => (
            <a key={index} href={`tel:${service.phone}`} className={styles.emergencyServiceCard}>
              <span className={styles.emergencyServiceIcon}>{service.icon}</span>
              <span className={styles.emergencyServiceName}>{service.name}</span>
              <span className={styles.emergencyServicePhone}>{service.phone}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ 
  onLogout, 
  onEdit 
}: { 
  onLogout: () => void;
  onEdit: () => void;
}) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeaderSimple}>
        <SettingsIcon />
        <h2>Cài đặt tài khoản</h2>
      </div>

      <div className={styles.settingsGrid}>
        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <EditIcon />
            <h3>Chỉnh sửa thông tin</h3>
          </div>
          <p className={styles.settingsDesc}>
            Cập nhật thông tin cá nhân, địa chỉ liên hệ và các thông tin khác trong hồ sơ sinh viên.
          </p>
          <button className={styles.settingsButton} onClick={onEdit}>
            Chỉnh sửa hồ sơ
          </button>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <ShieldIcon />
            <h3>Bảo mật</h3>
          </div>
          <p className={styles.settingsDesc}>
            Quản lý mật khẩu và các cài đặt bảo mật cho tài khoản của bạn.
          </p>
          <button className={styles.settingsButton}>
            Đổi mật khẩu
          </button>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <MailIcon />
            <h3>Thông báo</h3>
          </div>
          <p className={styles.settingsDesc}>
            Cài đặt nhận thông báo về lịch học, tin tức và các cập nhật từ nhà trường.
          </p>
          <button className={styles.settingsButton}>
            Quản lý thông báo
          </button>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.cardHeader}>
            <HeartIcon />
            <h3>Hỗ trợ</h3>
          </div>
          <p className={styles.settingsDesc}>
            Liên hệ với bộ phận hỗ trợ sinh viên hoặc xem các câu hỏi thường gặp.
          </p>
          <button className={styles.settingsButton}>
            Liên hệ hỗ trợ
          </button>
        </div>

        <div className={`${styles.settingsCard} ${styles.dangerCard}`}>
          <div className={styles.cardHeader}>
            <LogoutIcon />
            <h3>Đăng xuất</h3>
          </div>
          <p className={styles.settingsDesc}>
            Đăng xuất khỏi tài khoản của bạn trên thiết bị này.
          </p>
          <button className={`${styles.settingsButton} ${styles.dangerButton}`} onClick={onLogout}>
            Đăng xuất ngay
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className={styles.appInfo}>
        <p>Trợ lý sinh viên Sao Đỏ</p>
        <p>Phiên bản 1.0.0</p>
        <p>© 2024 Trường Đại học Sao Đỏ</p>
      </div>
    </div>
  );
}
