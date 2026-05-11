import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppInput } from '../../components/ui';
import { AuthGalaxyBackground } from '../../components/AuthGalaxyBackground';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';

type Props = {
  onNavigateLogin: () => void;
};

export function RegisterScreen({ onNavigateLogin }: Props) {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    return clearError;
  }, [clearError]);

  const passwordsMismatch = Boolean(confirmPassword && password !== confirmPassword);
  const canSubmit = Boolean(fullName.trim() && studentId.trim() && email.trim() && password && confirmPassword && !passwordsMismatch);

  const handleRegister = async () => {
    if (!canSubmit) return;
    await register({ fullName: fullName.trim(), studentId: studentId.trim(), email: email.trim(), password });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <AuthGalaxyBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.brandBlock}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.school}>Trường Đại học Sao Đỏ</Text>
          <Text style={styles.tagline}>Trợ lí ảo AI của bạn</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>Tạo tài khoản Sao Đỏ dùng chung cho web và mobile.</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Ẩn lỗi" onPress={clearError}>
                <Ionicons name="close" size={18} color={Colors.red} />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.fields}>
            <AppInput label="Họ và tên" value={fullName} onChangeText={setFullName} placeholder="Nguyễn Văn A" />
            <AppInput
              label="Mã sinh viên"
              value={studentId}
              onChangeText={setStudentId}
              placeholder="VD: 2024001"
            />
            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="sinhvien@saodo.edu.vn"
              keyboardType="email-address"
            />
            <AppInput label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="Tối thiểu 6 ký tự" secureTextEntry />
            <AppInput
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu"
              secureTextEntry
              error={passwordsMismatch ? 'Mật khẩu xác nhận không khớp.' : undefined}
            />
          </View>

          <AppButton title="Tiếp tục" onPress={handleRegister} loading={isLoading} disabled={!canSubmit} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <Pressable accessibilityRole="button" onPress={onNavigateLogin}>
              <Text style={styles.footerLink}>Đăng nhập</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061936' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl, zIndex: 1 },
  brandBlock: { alignItems: 'center', marginBottom: Spacing.xxl },
  logo: { width: 104, height: 104, marginBottom: Spacing.md },
  school: { fontSize: FontSize.xxl, fontWeight: '900', color: '#FFFFFF', textAlign: 'center' },
  tagline: { marginTop: 4, fontSize: FontSize.md, fontWeight: '800', color: Colors.brandGold },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text },
  subtitle: { marginTop: 6, marginBottom: Spacing.xl, fontSize: FontSize.sm, color: Colors.textSub, lineHeight: 20 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  errorText: { flex: 1, color: Colors.red, fontSize: FontSize.sm, fontWeight: '800' },
  fields: { gap: Spacing.lg, marginBottom: Spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: FontSize.sm, color: Colors.textSub },
  footerLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '900' },
});
