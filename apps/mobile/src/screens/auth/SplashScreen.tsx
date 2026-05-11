import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LoadingView } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, FontSize, Spacing } from '../../constants/theme';

export function SplashScreen() {
  const { isInitializing } = useAuth();

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.school}>Trường Đại học Sao Đỏ</Text>
      <Text style={styles.tagline}>Trợ lí ảo AI của bạn</Text>
      <LoadingView text={isInitializing ? 'Đang khởi tạo phiên đăng nhập...' : 'Đang chuẩn bị ứng dụng...'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
    padding: Spacing.xxl,
  },
  logo: { width: 120, height: 120, marginBottom: Spacing.lg },
  school: { color: Colors.navy, fontSize: FontSize.xxl, fontWeight: '900', textAlign: 'center' },
  tagline: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '900', marginTop: Spacing.sm, marginBottom: Spacing.xxl },
});
