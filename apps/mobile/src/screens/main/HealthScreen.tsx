import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyView, ErrorView, Header, HealthCard, LoadingView } from '../../components/ui';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';
import { useBootstrapData } from '../../hooks/useBootstrapData';
import { RootStackParamList } from '../../navigation/types';

const healthIcons = ['scale-outline', 'moon-outline', 'restaurant-outline', 'happy-outline'] as const;
const quickActions = [
  { label: 'Thêm cân nặng', route: 'AddWeightLog', icon: 'scale-outline' },
  { label: 'Thêm giấc ngủ', route: 'AddSleepLog', icon: 'moon-outline' },
  { label: 'Thêm bữa ăn', route: 'AddMealLog', icon: 'restaurant-outline' },
  { label: 'Thêm tập luyện', route: 'AddWorkoutLog', icon: 'fitness-outline' },
  { label: 'Thêm tâm trạng', route: 'AddMoodLog', icon: 'happy-outline' },
  { label: 'Thống kê', route: 'HealthStatistics', icon: 'stats-chart-outline' },
] as const;

export function HealthScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { data, loading, error, refresh } = useBootstrapData();

  if (loading) {
    return <LoadingView text="Đang tải sức khỏe sinh viên..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Header title="Sức khỏe" subtitle="Theo dõi Cân nặng, Giấc ngủ, Bữa ăn và Tâm trạng để học tập bền bỉ hơn." />

      {error ? <ErrorView title="Chưa kết nối dữ liệu sức khỏe" text={error} onRetry={refresh} /> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nhật ký nhanh</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.route}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => navigation.navigate(action.route)}
              style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
            >
              <Ionicons name={action.icon} size={22} color={Colors.primary} />
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {data.healthAlerts.length === 0 ? (
        <EmptyView title="Chưa có nhật ký sức khỏe" text="Khi bạn ghi lại sức khỏe, Sao Đỏ sẽ hiển thị cảnh báo và gợi ý tại đây." icon="heart-outline" />
      ) : (
        <View style={styles.cards}>
          {data.healthAlerts.slice(0, 4).map((item, index) => (
            <HealthCard key={item.id} title={item.title} value={item.value} helper={item.helper} icon={healthIcons[index] ?? 'heart-outline'} />
          ))}
        </View>
      )}

      <View style={styles.aiPanel}>
        <Text style={styles.aiTitle}>Gợi ý từ AI</Text>
        <Text style={styles.aiText}>AI có thể nhắc bạn ngủ đủ, vận động nhẹ và ăn uống đều; không thay thế bác sĩ hoặc chuyên gia y tế.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 48, gap: Spacing.lg },
  section: { gap: Spacing.md },
  sectionTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '900' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickCard: {
    width: '31.5%',
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    ...Shadow.card,
  },
  quickLabel: { color: Colors.text, fontSize: FontSize.xs, fontWeight: '900', textAlign: 'center' },
  cards: { gap: Spacing.md },
  aiPanel: { borderRadius: Radius.lg, backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primaryBorder, padding: Spacing.lg },
  aiTitle: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '900' },
  aiText: { marginTop: Spacing.sm, color: Colors.textSub, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 20 },
  pressed: { transform: [{ scale: 0.98 }] },
});
