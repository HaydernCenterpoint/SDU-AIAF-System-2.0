import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppInput } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';

type Props = {
  onNavigateRegister: () => void;
  onNavigateForgot: () => void;
};

export function LoginScreen({ onNavigateRegister, onNavigateForgot }: Props) {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    return clearError;
  }, [clearError]);

  const canSubmit = Boolean(studentId.trim() && password);

  const handleLogin = async () => {
    if (!canSubmit) return;
    await login({ identifier: studentId.trim(), password });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.brandBlock}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.school}>Trường Đại học Sao Đỏ</Text>
          <Text style={styles.tagline}>Trợ lí ảo AI của bạn</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Dùng mã sinh viên hoặc email để tiếp tục.</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={Colors.red} />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Ẩn lỗi" onPress={clearError}>
                <Ionicons name="close" size={18} color={Colors.red} />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.fields}>
            <AppInput
              label="Mã sinh viên hoặc email"
              value={studentId}
              onChangeText={setStudentId}
              placeholder="VD: 2024001"
            />
            <View>
              <AppInput
                label="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                secureTextEntry
              />
              <Pressable accessibilityRole="button" onPress={onNavigateForgot} style={styles.forgotButton}>
                <Text style={styles.inlineLink}>Quên mật khẩu?</Text>
              </Pressable>
            </View>
          </View>

          <AppButton title="Đăng nhập" onPress={handleLogin} loading={isLoading} disabled={!canSubmit} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <Pressable accessibilityRole="button" onPress={onNavigateRegister}>
              <Text style={styles.footerLink}>Đăng ký</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  brandBlock: { alignItems: 'center', marginBottom: Spacing.xxl },
  logo: { width: 112, height: 112, marginBottom: Spacing.md },
  school: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  tagline: { marginTop: 4, fontSize: FontSize.md, fontWeight: '800', color: Colors.textSub },
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
  forgotButton: { alignSelf: 'flex-end', marginTop: Spacing.sm },
  inlineLink: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.blueDark },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: FontSize.sm, color: Colors.textSub },
  footerLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '900' },
});
