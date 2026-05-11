import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard, AppInput } from '../../components/ui';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import type { RootStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<Navigation>();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    return clearError;
  }, [clearError]);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    const result = await forgotPassword(email.trim());
    if (result.success) setSent(true);
  };

  const goToLogin = () => navigation.navigate('Login');

  if (sent) {
    return (
      <View style={styles.container}>
        <AppCard tone="blue">
          <Text style={styles.title}>Kiểm tra email của bạn</Text>
          <Text style={styles.subtitle}>Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi tới {email.trim()}.</Text>
          <View style={styles.actionGap}>
            <AppButton title="Quay lại đăng nhập" onPress={goToLogin} />
          </View>
        </AppCard>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <AppCard>
        <Text style={styles.title}>Quên mật khẩu</Text>
        <Text style={styles.subtitle}>Nhập email sinh viên để nhận hướng dẫn đặt lại mật khẩu.</Text>
        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="sinhvien@saodo.edu.vn"
          keyboardType="email-address"
          error={error || undefined}
        />
        <View style={styles.actionGap}>
          <AppButton title="Gửi hướng dẫn" onPress={handleSubmit} loading={isLoading} disabled={!email.trim()} />
          <Pressable accessibilityRole="button" onPress={goToLogin} style={styles.backButton}>
            <Text style={styles.backText}>Quay lại đăng nhập</Text>
          </Pressable>
        </View>
      </AppCard>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.bg,
    padding: Spacing.xl,
  },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '900' },
  subtitle: { color: Colors.textSub, fontSize: FontSize.sm, lineHeight: 20, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  actionGap: { gap: Spacing.md, marginTop: Spacing.xl },
  backButton: { alignItems: 'center', padding: Spacing.sm },
  backText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '900' },
});
