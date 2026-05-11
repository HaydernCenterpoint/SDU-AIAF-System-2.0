import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

interface Reminder {
  id: string;
  title: string;
  dueDate: string;
  done: boolean;
}

export function NotificationsScreen() {
  const { token } = useAuthStore();
  const [items, setItems] = useState<Reminder[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/reminders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setItems(data.reminders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const addItem = async () => {
    if (!token || !title.trim()) return;
    const res = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems([data.reminder, ...items]);
      setTitle('');
    }
  };

  const toggle = async (item: Reminder) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/reminders/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ done: !item.done }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(items.map((entry) => (entry.id === item.id ? data.reminder : entry)));
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.banner}>
              <View style={styles.bannerGlow} />
              <Text style={styles.eyebrow}>Thông báo</Text>
              <Text style={styles.title}>Việc cần nhớ</Text>
              <Text style={styles.subtitle}>Theo dõi hạn nộp, lớp học và các việc quan trọng trong ngày.</Text>
            </View>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Thêm thông báo hoặc nhắc nhở..."
                placeholderTextColor={Colors.textMuted}
              />
              <Pressable style={({ pressed }) => [styles.addButton, pressed && styles.pressed]} onPress={addItem}>
                <Ionicons name="add" size={20} color="#fff" />
              </Pressable>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <>
                <ActivityIndicator color={Colors.blue} />
                <Text style={styles.emptyText}>Đang tải thông báo...</Text>
              </>
            ) : (
              <>
                <Ionicons name="notifications-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
                <Text style={styles.emptyText}>Các nhắc nhở mới sẽ hiển thị tại đây.</Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => toggle(item)}>
            <View style={[styles.check, item.done && styles.checkDone]}>
              {item.done ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, item.done && styles.doneText]}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {item.dueDate ? `Hạn: ${new Date(item.dueDate).toLocaleDateString('vi-VN')}` : 'Chưa đặt hạn'}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { padding: Spacing.lg, paddingBottom: 44 },
  banner: {
    backgroundColor: Colors.blue,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadow.card,
  },
  bannerGlow: {
    position: 'absolute',
    right: -28,
    top: -20,
    width: 116,
    height: 116,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  eyebrow: { color: Colors.brandGold, fontSize: FontSize.xs, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: '#fff', fontSize: FontSize.xxl, fontWeight: '900', marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,0.78)', fontSize: FontSize.sm, fontWeight: '700', lineHeight: 20, marginTop: 6 },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadow.card,
  },
  input: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginTop: 1,
  },
  checkDone: { backgroundColor: Colors.blue },
  cardBody: { flex: 1 },
  cardTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '900' },
  doneText: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  cardMeta: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '700', marginTop: 4 },
  empty: {
    alignItems: 'center',
    paddingVertical: 70,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '900', marginTop: Spacing.lg },
  emptyText: { color: Colors.textSub, fontSize: FontSize.md, fontWeight: '700', marginTop: Spacing.sm, textAlign: 'center' },
  pressed: { transform: [{ scale: 0.97 }] },
});
