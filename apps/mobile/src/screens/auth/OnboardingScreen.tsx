import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard } from '../../components/ui';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import { tokenStorage } from '../../services/token-storage';
import type { RootStackParamList } from '../../navigation/types';

const benefits = [
  'Hỏi AI về lịch học, tài liệu, bài tập.',
  'Theo dõi deadline, task, lịch học.',
  'Ghi lại sức khỏe, tài chính, nhắc nhở.',
];

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen() {
  const navigation = useNavigation<Navigation>();
  const mountedRef = useRef(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleContinue = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      await tokenStorage.setOnboardingComplete();
      if (mountedRef.current) navigation.replace('Login');
    } catch {
      if (mountedRef.current) setError('Không thể lưu trạng thái onboarding. Vui lòng thử lại.');
    } finally {
      if (mountedRef.current) setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Sao Đỏ trong túi bạn</Text>
      <Text style={styles.subtitle}>Một nền tảng học tập, nhắc việc và chăm sóc cá nhân tối giản cho sinh viên.</Text>

      <View style={styles.benefits}>
        {benefits.map((benefit, index) => (
          <AppCard key={benefit} tone={index === 0 ? 'blue' : index === 1 ? 'gold' : 'default'}>
            <View style={styles.benefitRow}>
              <View style={styles.iconBadge}>
                <Ionicons name={index === 0 ? 'sparkles' : index === 1 ? 'calendar' : 'heart'} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          </AppCard>
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <AppButton title="Bắt đầu" onPress={handleContinue} loading={isSaving} disabled={isSaving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: Colors.bg,
    padding: Spacing.xl,
  },
  logo: { width: 112, height: 112, alignSelf: 'center', marginBottom: Spacing.xl },
  title: { color: Colors.navy, fontSize: FontSize.xxxl, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: Colors.textSub, fontSize: FontSize.md, lineHeight: 22, textAlign: 'center', marginTop: Spacing.sm },
  benefits: { gap: Spacing.md, marginVertical: Spacing.xxxl },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  benefitText: { flex: 1, color: Colors.text, fontSize: FontSize.md, fontWeight: '800', lineHeight: 22 },
  errorText: { color: Colors.red, fontSize: FontSize.sm, fontWeight: '800', textAlign: 'center', marginBottom: Spacing.md },
});
