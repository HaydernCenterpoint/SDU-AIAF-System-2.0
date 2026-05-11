import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, EmptyView, Header, LoadingView } from '../../components/ui';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';
import { notificationApi, registerForPushNotifications } from '../../services/notification-api';

type NotificationItem = { id: string; title: string; content?: string; is_read?: boolean; type?: string };

export function NotificationScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationApi.listNotifications()
      .then((response) => setItems(response.data.notifications || []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    await notificationApi.markNotificationRead(id).catch(() => undefined);
    setItems((current) => current.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
  }

  if (loading) return <LoadingView text="Đang tải thông báo..." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Header title="Thông báo" subtitle="Deadline alert, task quá hạn và nhắc nhở học tập cá nhân." />
      <AppButton title="Bật push notification" onPress={() => { void registerForPushNotifications(); }} />
      <Text style={styles.localHint}>Local notification sẽ được dùng khi thiết bị chưa nhận push từ backend.</Text>
      {items.length === 0 ? (
        <EmptyView title="Chưa có thông báo" text="Thông báo từ reminder sẽ hiển thị tại đây." icon="notifications-outline" />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <Pressable key={item.id} onPress={() => markRead(item.id)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <Text style={styles.type}>{item.type || 'custom'}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.bodyText}>{item.content}</Text>
              <Text style={styles.action}>Đánh dấu đã đọc</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 48, gap: Spacing.lg },
  localHint: { color: Colors.textSub, fontSize: FontSize.sm, fontWeight: '700' },
  list: { gap: Spacing.md },
  card: { borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, padding: Spacing.lg, ...Shadow.card },
  type: { color: Colors.blueDark, fontSize: FontSize.xs, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '900', marginTop: 4 },
  bodyText: { color: Colors.textSub, fontSize: FontSize.sm, fontWeight: '700', marginTop: 6, lineHeight: 20 },
  action: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '900', marginTop: Spacing.md },
  pressed: { transform: [{ scale: 0.98 }] },
});
