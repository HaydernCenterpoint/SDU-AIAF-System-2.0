import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Header, StatisticCard } from '../../components/ui';
import { Colors, Spacing } from '../../constants/theme';

export function HealthStatisticsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Header title="Thống kê sức khỏe" subtitle="Tổng hợp cân nặng, giấc ngủ, bữa ăn, vận động và tâm trạng." />
      <StatisticCard label="BMI hiện tại" value="24.9" icon="body-outline" />
      <StatisticCard label="Giấc ngủ trung bình" value="7.2h" icon="moon-outline" />
      <StatisticCard label="Tập luyện tuần này" value="3 buổi" icon="fitness-outline" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 48, gap: Spacing.md },
});
