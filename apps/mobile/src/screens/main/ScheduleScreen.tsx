import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const TYPE_COLORS: Record<string, string> = {
  'Lý thuyết': Colors.blue,
  'Thực hành': Colors.green,
  'Bài tập': Colors.orange,
  Thi: Colors.primary,
};

export function ScheduleScreen() {
  const { schedule } = useAppStore();
  const today = new Date().getDay();

  return (
    <View style={styles.container}>
      <View style={styles.dayTabs}>
        {DAYS.map((day, index) => (
          <View key={day} style={[styles.dayTab, today === index && styles.dayTabActive]}>
            <Text style={[styles.dayText, today === index && styles.dayTextActive]}>{day}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={schedule}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.banner}>
            <Text style={styles.eyebrow}>Lịch học</Text>
            <Text style={styles.bannerTitle}>Hôm nay có {schedule.length} tiết</Text>
            <Text style={styles.bannerSub}>Các thẻ được thiết kế lớn, dễ chạm và dễ đọc trên màn hình nhỏ.</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-clear-outline" size={52} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Không có lịch</Text>
            <Text style={styles.emptyText}>Lịch học của bạn sẽ hiển thị ở đây.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const typeColor = TYPE_COLORS[item.type] || Colors.blue;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTime}>{item.time}</Text>
                <View style={[styles.typeBadge, { backgroundColor: `${typeColor}18` }]}>
                  <Text style={[styles.typeText, { color: typeColor }]}>{item.type}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.cardMeta}>
                <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.metaText}>{item.room}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  dayTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },
  dayTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  dayTabActive: { backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primaryBorder },
  dayText: { fontSize: FontSize.xs, fontWeight: '900', color: Colors.textSub },
  dayTextActive: { color: Colors.primary },
  list: { padding: Spacing.lg, paddingBottom: 44 },
  banner: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.blueBorder,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadow.card,
  },
  eyebrow: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900', textTransform: 'uppercase' },
  bannerTitle: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '900', marginTop: 4 },
  bannerSub: { color: Colors.textSub, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 20, marginTop: 6 },
  empty: {
    alignItems: 'center',
    paddingVertical: 86,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, marginTop: Spacing.lg },
  emptyText: { fontSize: FontSize.md, color: Colors.textSub, marginTop: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  cardTime: { color: Colors.blueDark, fontSize: FontSize.sm, fontWeight: '900' },
  typeBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: Radius.sm },
  typeText: { fontSize: FontSize.xs, fontWeight: '900' },
  cardTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '900', marginBottom: Spacing.sm },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: Colors.textSub, fontSize: FontSize.sm, fontWeight: '800' },
});
