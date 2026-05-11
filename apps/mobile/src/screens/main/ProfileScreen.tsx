import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';
import { apiClient, getApiErrorMessage } from '../../services/api-client';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { AuthUser, FamilyInfo, PersonalInfo, StudentProfileDetails } from '../../types';

type DetailItem = [string, string | undefined];
type ProfileResponse = { user: AuthUser; profile: StudentProfileDetails };

const defaultAcademicDetails = {
  status: 'Đang học',
  recordCode: '0000000',
  entryDate: '',
  className: 'Chưa cập nhật',
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
  identityNumber: '000000000000',
  issuedDate: '',
  issuedBy: '',
  subjectGroup: '',
  unionDate: '',
  partyDate: '',
  contactAddress: 'Chưa cập nhật',
  permanentAddress: 'Chưa cập nhật',
};

const defaultFamilyDetails = {
  fatherName: 'Chưa cập nhật',
  fatherBirthYear: '',
  fatherOccupation: 'Chưa cập nhật',
  fatherPhone: '',
  motherName: 'Chưa cập nhật',
  motherBirthYear: '',
  motherOccupation: 'Chưa cập nhật',
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

const profileTone = {
  school: Colors.blueBg,
  personal: Colors.primaryBg,
  family: Colors.goldBg,
  neutral: Colors.surfaceAlt,
};

type ProfileForm = {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  personalInfo: EditablePersonalForm;
};

export function ProfileScreen() {
  const { user: appUser, reset } = useAppStore();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [profileDetails, setProfileDetails] = useState<StudentProfileDetails | null>(user?.profile || null);

  const profile = useMemo(
    () => mergeProfileWithUser(profileDetails || buildFallbackProfile(user, appUser.major), user),
    [appUser.major, profileDetails, user],
  );
  const [form, setForm] = useState<ProfileForm>(() => buildProfileForm(profile, user));

  useEffect(() => {
    setForm(buildProfileForm(profile, user));
  }, [profile, user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    async function loadProfile() {
      setLoadingProfile(true);
      try {
        const response = await apiClient.get<ProfileResponse>('profile');
        if (cancelled) return;
        useAuthStore.setState({ user: response.data.user });
        setProfileDetails(response.data.profile);
      } catch {
        // Keep local data when the backend is unavailable.
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const avatarUrl = profile.avatarUrl || user?.avatarUrl || null;
  const academicInfo = profile.academicInfo || {};
  const personalInfo = profile.personalInfo || {};
  const familyInfo = profile.familyInfo || {};

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          reset();
          await logout();
          setLoggingOut(false);
        },
      },
    ]);
  };

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền truy cập ảnh', 'Vui lòng cho phép ứng dụng chọn ảnh đại diện từ thư viện.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.72,
      base64: true,
    });

    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Không thể đọc ảnh', 'Vui lòng chọn ảnh khác.');
      return;
    }

    const mimeType = asset.mimeType || 'image/jpeg';
    const avatarDataUrl = `data:${mimeType};base64,${asset.base64}`;
    if (avatarDataUrl.length > 750_000) {
      Alert.alert('Ảnh quá lớn', 'Vui lòng chọn ảnh nhỏ hơn để đồng bộ nhanh trên web và mobile.');
      return;
    }

    setAvatarSaving(true);
    try {
      const response = await apiClient.put<ProfileResponse>('profile/avatar', { avatarUrl: avatarDataUrl });
      useAuthStore.setState({ user: response.data.user });
      setProfileDetails(response.data.profile);
    } catch (error) {
      Alert.alert('Không thể đổi ảnh', getApiErrorMessage(error, 'Không thể cập nhật ảnh đại diện'));
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await apiClient.put<ProfileResponse>('profile', form);
      useAuthStore.setState({ user: response.data.user });
      setProfileDetails(response.data.profile);
      setEditOpen(false);
    } catch (error) {
      Alert.alert('Không thể lưu hồ sơ', getApiErrorMessage(error, 'Không thể cập nhật thông tin cá nhân'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <Pressable accessibilityRole="button" accessibilityLabel="Đổi ảnh đại diện" style={styles.avatarWrap} onPress={handlePickAvatar} disabled={avatarSaving}>
            {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="cover" /> : <Text style={styles.avatarInitial}>{initialFor(user?.fullName)}</Text>}
            <View style={styles.avatarAction}>
              <Ionicons name="camera-outline" size={14} color={Colors.blueDark} />
              <Text style={styles.avatarActionText}>{avatarSaving ? 'Đang lưu' : 'Đổi ảnh'}</Text>
            </View>
          </Pressable>
          <Text style={styles.name}>{user?.fullName || 'Sinh viên Sao Đỏ'}</Text>
          <Text style={styles.studentId}>MSSV: {user?.studentId || academicInfo.studentCode || '---'}</Text>
          <View style={styles.schoolBadge}>
            <Text style={styles.schoolBadgeText}>{user?.schoolName || academicInfo.schoolName || 'ĐẠI HỌC SAO ĐỎ'}</Text>
          </View>
          <View style={styles.heroActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Đổi thông tin cá nhân" style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]} onPress={() => setEditOpen(true)}>
              <Ionicons name="create-outline" size={17} color={Colors.blueDark} />
              <Text style={styles.heroBtnText}>Đổi thông tin</Text>
            </Pressable>
          </View>
          {loadingProfile ? <Text style={styles.loadingText}>Đang đồng bộ hồ sơ...</Text> : null}
        </View>

        <ProfileSection
          title="Thông tin học vấn"
          icon="school-outline"
          items={[
            ['Trạng thái', academicInfo.status],
            ['Mã hồ sơ', academicInfo.recordCode],
            ['Ngày vào trường', formatDisplayDate(academicInfo.entryDate)],
            ['Lớp học', academicInfo.className],
            ['Cơ sở', academicInfo.campus],
            ['Bậc đào tạo', academicInfo.educationLevel],
            ['Loại hình đào tạo', academicInfo.trainingType],
            ['Khoa', academicInfo.faculty],
            ['Ngành', academicInfo.major || user?.faculty],
            ['Chuyên ngành', academicInfo.specialization],
            ['Khóa học', academicInfo.cohort],
          ]}
        />

        <ProfileSection
          title="Thông tin cá nhân"
          icon="person-outline"
          items={buildPersonalItems(personalInfo)}
        />

        <ProfileSection
          title="Quan hệ gia đình"
          icon="people-outline"
          items={buildFamilyItems(familyInfo)}
        />

        <Text style={styles.sectionLabel}>CÀI ĐẶT</Text>
        <MenuRow icon="notifications-outline" label="Cài đặt thông báo" />
        <MenuRow icon="lock-closed-outline" label="Đổi mật khẩu" />
        <MenuRow icon="help-circle-outline" label="Trợ giúp & hỗ trợ" />

        <Pressable accessibilityRole="button" accessibilityLabel="Đăng xuất" style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]} onPress={handleLogout} disabled={loggingOut}>
          <Ionicons name="log-out-outline" size={20} color={Colors.red} />
          <Text style={styles.logoutText}>{loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</Text>
        </Pressable>

        <Text style={styles.version}>Trợ lý sinh viên Sao Đỏ v1.0.0</Text>
      </ScrollView>

      <EditProfileModal
        visible={editOpen}
        saving={saving}
        form={form}
        onClose={() => {
          setForm(buildProfileForm(profile, user));
          setEditOpen(false);
        }}
        onSave={handleSaveProfile}
        onFieldChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
        onPersonalFieldChange={(field, value) => setForm((current) => ({ ...current, personalInfo: { ...current.personalInfo, [field]: value } }))}
      />
    </>
  );
}

function ProfileSection({ title, icon, items }: { title: string; icon: React.ComponentProps<typeof Ionicons>['name']; items: DetailItem[] }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTitleRow}>
        <Ionicons name={icon} size={20} color={Colors.blueDark} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {items.map(([label, value]) => (
        <View key={label} style={styles.detailRow}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{value || 'Chưa cập nhật'}</Text>
        </View>
      ))}
    </View>
  );
}

function MenuRow({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={styles.menuItem}>
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon} size={20} color={Colors.blueDark} />
      </View>
      <View style={styles.menuBody}>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
    </View>
  );
}

function EditProfileModal({
  visible,
  saving,
  form,
  onClose,
  onSave,
  onFieldChange,
  onPersonalFieldChange,
}: {
  visible: boolean;
  saving: boolean;
  form: ProfileForm;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (field: keyof Omit<ProfileForm, 'personalInfo'>, value: string) => void;
  onPersonalFieldChange: (field: EditablePersonalKey, value: string) => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ScrollView style={styles.modalContainer} contentContainerStyle={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Đổi thông tin cá nhân</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Đóng chỉnh sửa hồ sơ" onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={Colors.text} />
          </Pressable>
        </View>
        <ProfileInput label="Họ tên" value={form.fullName} onChangeText={(value) => onFieldChange('fullName', value)} />
        <ProfileInput label="Email" value={form.email} keyboardType="email-address" onChangeText={(value) => onFieldChange('email', value)} />
        <ProfileInput label="Số điện thoại" value={form.phone} keyboardType="phone-pad" onChangeText={(value) => onFieldChange('phone', value)} />
        <ProfileInput label="Ngày sinh" value={form.dateOfBirth} placeholder="YYYY-MM-DD" onChangeText={(value) => onFieldChange('dateOfBirth', value)} />
        {editablePersonalFields.map(([key, label]) => (
          <ProfileInput
            key={key}
            label={label}
            value={form.personalInfo[key]}
            multiline={key === 'contactAddress' || key === 'permanentAddress'}
            onChangeText={(value) => onPersonalFieldChange(key, value)}
          />
        ))}
        <View style={styles.modalActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Lưu thay đổi hồ sơ" style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed, saving && styles.disabledBtn]} onPress={onSave} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Hủy chỉnh sửa hồ sơ" style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]} onPress={onClose} disabled={saving}>
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
  );
}

function ProfileInput({ label, value, placeholder, keyboardType, multiline = false, onChangeText }: { label: string; value: string; placeholder?: string; keyboardType?: 'default' | 'email-address' | 'phone-pad'; multiline?: boolean; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder || label}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        onChangeText={onChangeText}
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholderTextColor={Colors.textMuted}
      />
    </View>
  );
}

function buildFallbackProfile(user: AuthUser | null, appMajor: string): StudentProfileDetails {
  return {
    avatarUrl: user?.avatarUrl || null,
    academicInfo: {
      ...defaultAcademicDetails,
      studentCode: user?.studentId || '0000000',
      schoolName: user?.schoolName || 'Trường Đại học Sao Đỏ',
      major: user?.faculty || appMajor || 'Công nghệ thông tin',
    },
    personalInfo: {
      ...defaultPersonalDetails,
      fullName: user?.fullName || 'Sinh viên Sao Đỏ',
      dateOfBirth: user?.dateOfBirth || '',
      phone: user?.phone || '',
      email: user?.email || 'demo@sv.saodo.edu.vn',
    },
    familyInfo: defaultFamilyDetails,
  };
}

function mergeProfileWithUser(profile: StudentProfileDetails, user: AuthUser | null): StudentProfileDetails {
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

function buildProfileForm(profile: StudentProfileDetails, user: AuthUser | null): ProfileForm {
  const personalInfo = profile.personalInfo || {};
  const editable = editablePersonalFields.reduce((values, [key]) => ({ ...values, [key]: String(personalInfo[key] || '') }), {} as EditablePersonalForm);
  return {
    fullName: user?.fullName || personalInfo.fullName || '',
    phone: user?.phone || personalInfo.phone || '',
    email: user?.email || personalInfo.email || '',
    dateOfBirth: user?.dateOfBirth || personalInfo.dateOfBirth || '',
    personalInfo: editable,
  };
}

function buildPersonalItems(personalInfo: PersonalInfo): DetailItem[] {
  return [
    ['Ngày sinh', formatDisplayDate(personalInfo.dateOfBirth)],
    ['Dân tộc', personalInfo.ethnicity],
    ['Tôn giáo', personalInfo.religion],
    ['Quốc tịch', personalInfo.nationality],
    ['Khu vực', personalInfo.region],
    ['Số CCCD', personalInfo.identityNumber],
    ['Ngày cấp', personalInfo.issuedDate ? formatDisplayDate(personalInfo.issuedDate) : 'Chưa cập nhật'],
    ['Nơi cấp', personalInfo.issuedBy],
    ['Đối tượng', personalInfo.subjectGroup],
    ['Ngày vào Đoàn', personalInfo.unionDate ? formatDisplayDate(personalInfo.unionDate) : 'Chưa cập nhật'],
    ['Ngày vào Đảng', personalInfo.partyDate ? formatDisplayDate(personalInfo.partyDate) : 'Chưa cập nhật'],
    ['Điện thoại', personalInfo.phone],
    ['Email', personalInfo.email],
    ['Địa chỉ liên hệ', personalInfo.contactAddress],
    ['Hộ khẩu thường trú', personalInfo.permanentAddress],
  ];
}

function buildFamilyItems(familyInfo: FamilyInfo): DetailItem[] {
  return [
    ['Họ tên Cha', familyInfo.fatherName],
    ['Năm sinh Cha', familyInfo.fatherBirthYear],
    ['Nghề nghiệp Cha', familyInfo.fatherOccupation],
    ['Số điện thoại Cha', familyInfo.fatherPhone],
    ['Họ tên Mẹ', familyInfo.motherName],
    ['Năm sinh Mẹ', familyInfo.motherBirthYear],
    ['Nghề nghiệp Mẹ', familyInfo.motherOccupation],
    ['Số điện thoại Mẹ', familyInfo.motherPhone],
  ];
}

function formatDisplayDate(value?: string) {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}

function initialFor(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || 'S';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: 44 },
  hero: {
    backgroundColor: Colors.blue,
    padding: Spacing.xxxl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    right: -36,
    top: -28,
    width: 138,
    height: 138,
    borderRadius: 90,
    backgroundColor: Colors.surface,
    opacity: 0.18,
  },
  avatarWrap: { width: 118, height: 118, marginBottom: Spacing.lg, alignItems: 'center' },
  avatarImage: { width: 104, height: 104, borderRadius: 52, backgroundColor: Colors.surface },
  avatarInitial: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.surface,
    color: Colors.blueDark,
    fontSize: 44,
    fontWeight: '900',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 104,
  },
  avatarAction: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    ...Shadow.card,
  },
  avatarActionText: { color: Colors.blueDark, fontWeight: '900', fontSize: FontSize.xs },
  name: { color: Colors.surface, fontSize: FontSize.xl, fontWeight: '900', textAlign: 'center' },
  studentId: { color: Colors.surface, opacity: 0.78, fontSize: FontSize.sm, marginTop: 5, fontWeight: '800' },
  schoolBadge: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.surface,
  },
  schoolBadgeText: { color: Colors.surface, fontSize: FontSize.sm, fontWeight: '900', textTransform: 'uppercase' },
  heroActions: { marginTop: Spacing.lg, flexDirection: 'row', gap: Spacing.sm },
  heroBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  heroBtnText: { color: Colors.blueDark, fontWeight: '900', fontSize: FontSize.sm },
  loadingText: { marginTop: Spacing.sm, color: Colors.surface, fontWeight: '800', fontSize: FontSize.xs },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '900',
    color: Colors.textMuted,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  detailRow: { paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderSoft },
  detailLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '900', textTransform: 'uppercase' },
  detailValue: { marginTop: 3, fontSize: FontSize.md, color: Colors.text, fontWeight: '800', lineHeight: 21 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: profileTone.school,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuBody: { flex: 1 },
  menuLabel: { fontSize: FontSize.md, fontWeight: '900', color: Colors.text },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    margin: Spacing.lg,
    marginTop: Spacing.xxl,
    backgroundColor: profileTone.personal,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  logoutText: { fontSize: FontSize.md, fontWeight: '900', color: Colors.red },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.xl, fontWeight: '800' },
  modalContainer: { flex: 1, backgroundColor: Colors.bg },
  modalContent: { padding: Spacing.lg, paddingBottom: 48 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  inputWrap: { marginBottom: Spacing.md },
  inputLabel: { fontSize: FontSize.xs, fontWeight: '900', color: Colors.textMuted, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '800',
  },
  inputMultiline: { minHeight: 88, textAlignVertical: 'top' },
  modalActions: { gap: Spacing.sm, marginTop: Spacing.md },
  saveBtn: { backgroundColor: Colors.blue, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center' },
  saveBtnText: { color: Colors.surface, fontWeight: '900', fontSize: FontSize.md },
  cancelBtn: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  cancelBtnText: { color: Colors.textSub, fontWeight: '900', fontSize: FontSize.md },
  disabledBtn: { opacity: 0.6 },
  pressed: { transform: [{ scale: 0.97 }] },
});
