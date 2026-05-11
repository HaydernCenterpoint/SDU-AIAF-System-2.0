import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard, AppInput, Header } from '../../components/ui';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import { notificationApi, scheduleLocalReminder } from '../../services/notification-api';

const reminderTypes = ['assignment_deadline', 'study_time', 'exam', 'task', 'sleep', 'water', 'workout', 'meal', 'custom'] as const;
const repeatTypes = ['none', 'daily', 'weekly', 'monthly'] as const;

export function AddReminderScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type] = useState<(typeof reminderTypes)[number]>('custom');
  const [repeat_type] = useState<(typeof repeatTypes)[number]>('none');

  async function save() {
    const remind_at = new Date(Date.now() + 60_000).toISOString();
    await notificationApi.createReminder({ title, content, type, remind_at, repeat_type }).catch(() => undefined);
    await scheduleLocalReminder(title || 'Nhắc nhở Sao Đỏ', content || 'Local notification sẵn sàng.').catch(() => undefined);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Header title="Thêm nhắc nhở" subtitle="Tạo reminder cho deadline, học tập, giấc ngủ, uống nước, vận động và lịch thi." />
      <AppCard tone="gold">
        <AppInput label="Tiêu đề" value={title} onChangeText={setTitle} placeholder="Ví dụ: Ôn thi CSDL" />
        <AppInput label="Nội dung" value={content} onChangeText={setContent} placeholder="Ghi chú ngắn" />
        <Text style={styles.label}>Loại reminder</Text>
        <Text style={styles.options}>{reminderTypes.join(' · ')}</Text>
        <Text style={styles.label}>repeat_type</Text>
        <Text style={styles.options}>{repeatTypes.join(' · ')}</Text>
        <View style={styles.actions}>
          <AppButton title="Lưu reminder" onPress={save} disabled={!title.trim()} />
        </View>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 48, gap: Spacing.lg },
  label: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '900', marginTop: Spacing.md },
  options: { color: Colors.textSub, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 20 },
  actions: { marginTop: Spacing.lg },
});
