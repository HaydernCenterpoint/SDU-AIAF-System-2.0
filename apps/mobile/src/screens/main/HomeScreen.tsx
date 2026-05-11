import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AssignmentCard, EmptyView, ErrorView, Header, HealthCard, LoadingView, ReminderCard, StatisticCard } from '../../components/ui';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';
import { useBootstrapData } from '../../hooks/useBootstrapData';
import { RootStackParamList } from '../../navigation/types';

type QuickRoute = 'Subjects' | 'Tasks' | 'FinanceDashboard' | 'ReminderList' | 'Documents' | 'Settings';

type QuickAction = {
  label: string;
  route: QuickRoute;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const quickActions: QuickAction[] = [
  { label: 'Lịch học', route: 'Subjects', icon: 'calendar-outline' },
  { label: 'Tài liệu', route: 'Documents', icon: 'folder-open-outline' },
  { label: 'Task', route: 'Tasks', icon: 'checkbox-outline' },
  { label: 'Nhắc nhở', route: 'ReminderList', icon: 'alarm-outline' },
  { label: 'Tài chính', route: 'FinanceDashboard', icon: 'wallet-outline' },
  { label: 'Cài đặt', route: 'Settings', icon: 'settings-outline' },
];

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { data, loading, error, empty, refresh } = useBootstrapData();

  function navigateQuick(route: QuickRoute) {
    switch (route) {
      case 'Subjects':
        navigation.navigate('Subjects');
        break;
      case 'Tasks':
        navigation.navigate('Tasks');
        break;
      case 'FinanceDashboard':
        navigation.navigate('FinanceDashboard');
        break;
      case 'ReminderList':
        navigation.navigate('ReminderList');
        break;
      case 'Documents':
        navigation.navigate('Documents');
        break;
      case 'Settings':
        navigation.navigate('Settings');
        break;
    }
  }

  if (loading) {
    return <LoadingView text="Đang chuẩn bị dashboard sinh viên..." />;
  }

  if (error && empty) {
    return <ErrorView text={error} onRetry={refresh} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Header title="Hôm nay" subtitle="Lịch học, việc cần làm, tài liệu và gợi ý AI cho ngày học của bạn." />

      {error ? <ErrorView title="Đang dùng dữ liệu mẫu" text={error} onRetry={refresh} /> : null}

      <View style={styles.statsGrid}>
        <StatisticCard label="Deadline hôm nay" value={data.statistics[1]?.value ?? 0} icon="time-outline" color={Colors.primary} />
        <StatisticCard label="Task cần làm" value={data.assignments.length} icon="checkbox-outline" color={Colors.orange} />
        <StatisticCard label="Lịch học hôm nay" value={data.statistics[0]?.value ?? 0} icon="calendar-outline" color={Colors.blue} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.route}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
              onPress={() => navigateQuick(action.route)}
            >
              <Ionicons name={action.icon} size={22} color={Colors.primary} />
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deadline hôm nay</Text>
        {data.reminders.length === 0 ? (
          <EmptyView title="Chưa có deadline" text="Bạn đang rảnh deadline trong hôm nay." icon="checkmark-circle-outline" />
        ) : (
          data.reminders.map((reminder) => <ReminderCard key={reminder.id} title={reminder.title} dueText={reminder.dueText} done={reminder.done} />)
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task cần làm</Text>
        {data.assignments.length === 0 ? (
          <EmptyView title="Chưa có task" text="Thêm bài tập hoặc việc cần làm để Sao Đỏ nhắc bạn." icon="clipboard-outline" />
        ) : (
          data.assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              title={assignment.title}
              subject={assignment.subject}
              dueText={assignment.dueText}
              status={assignment.status}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sức khỏe nhanh</Text>
        <HealthCard title="Trạng thái hôm nay" value={data.healthAlerts[0]?.value ?? 'Chưa có dữ liệu'} helper={data.healthAlerts[0]?.helper} icon="heart-outline" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gợi ý từ AI</Text>
        {data.suggestions.length === 0 ? (
          <EmptyView title="Chưa có gợi ý" text="Sao Đỏ sẽ gợi ý khi có thêm dữ liệu học tập." icon="sparkles-outline" />
        ) : (
          data.suggestions.map((suggestion) => <Text key={suggestion} style={styles.suggestion}>• {suggestion}</Text>)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 48, gap: Spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  section: { gap: Spacing.md },
  sectionTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '900' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickCard: {
    width: '31.5%',
    minHeight: 86,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    ...Shadow.card,
  },
  quickLabel: { color: Colors.text, fontSize: FontSize.xs, fontWeight: '900', textAlign: 'center' },
  suggestion: { color: Colors.textSub, fontSize: FontSize.md, fontWeight: '700', lineHeight: 22 },
  pressed: { transform: [{ scale: 0.98 }] },
});
