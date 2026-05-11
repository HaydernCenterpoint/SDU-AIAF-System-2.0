import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Header, StatisticCard } from '../../components/ui';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';
import { statisticsApi } from '../../services/statistics-api';

const fallback = {
  study: { totalCourses: 3, upcomingDeadlines: 2, studyPlanProgress: 68 },
  tasks: { totalTasks: 8, completedTasks: 5, workEfficiency: 72 },
  health: { averageSleepHours: 7, workoutSessions: 3 },
  finance: { balance: 1350000, budgetUsedPercent: 58 },
};

export function StatisticsScreen() {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    statisticsApi.getDashboard('week')
      .then((response) => setData(response.data))
      .catch(() => undefined);
  }, []);

  const chartValues = [data.study.studyPlanProgress, data.tasks.workEfficiency, data.health.workoutSessions * 20, data.finance.budgetUsedPercent];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Header title="Thống kê" subtitle="Statistic cards, Chart đơn giản và Summary theo tuần / Summary theo tháng." />
      <Text style={styles.sectionTitle}>Summary theo tuần</Text>
      <View style={styles.grid}>
        <StatisticCard label="Học tập" value={data.study.totalCourses} icon="school-outline" color={Colors.blue} />
        <StatisticCard label="Công việc" value={data.tasks.totalTasks} icon="checkbox-outline" color={Colors.orange} />
        <StatisticCard label="Sức khỏe" value={data.health.averageSleepHours} icon="heart-outline" color={Colors.primary} />
        <StatisticCard label="Tài chính" value={`${Math.round(data.finance.balance / 1000)}k`} icon="wallet-outline" color={Colors.green} />
      </View>

      <Text style={styles.sectionTitle}>Chart đơn giản</Text>
      <View style={styles.chartCard}>
        {chartValues.map((value, index) => (
          <View key={index} style={styles.barWrap}>
            <View style={[styles.bar, { height: Math.max(16, value), backgroundColor: [Colors.blue, Colors.orange, Colors.primary, Colors.green][index] }]} />
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Summary theo tháng</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Học tập: {data.study.studyPlanProgress}% kế hoạch · Công việc: {data.tasks.workEfficiency}% hiệu suất · Sức khỏe: {data.health.workoutSessions} buổi tập · Tài chính: {data.finance.budgetUsedPercent}% ngân sách.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 48, gap: Spacing.lg },
  sectionTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  chartCard: { height: 180, flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md, borderRadius: Radius.xl, backgroundColor: Colors.surface, padding: Spacing.lg, ...Shadow.card },
  barWrap: { flex: 1, justifyContent: 'flex-end' },
  bar: { borderTopLeftRadius: Radius.md, borderTopRightRadius: Radius.md },
  summaryCard: { borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, padding: Spacing.lg, ...Shadow.card },
  summaryText: { color: Colors.textSub, fontSize: FontSize.md, fontWeight: '800', lineHeight: 24 },
});
