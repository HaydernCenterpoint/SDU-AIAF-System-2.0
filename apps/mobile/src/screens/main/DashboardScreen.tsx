import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const actions: { label: string; desc: string; icon: IconName; color: string; route: string }[] = [
  { label: 'Thông báo', desc: 'Việc cần nhớ', icon: 'notifications-outline', color: Colors.primary, route: 'Notifications' },
  { label: 'Lịch học', desc: 'Lớp hôm nay', icon: 'calendar-outline', color: Colors.blue, route: 'Schedule' },
  { label: 'Tài liệu', desc: 'Kho học liệu', icon: 'folder-open-outline', color: Colors.blueDark, route: 'Documents' },
  { label: 'Cá nhân', desc: 'Hồ sơ sinh viên', icon: 'person-outline', color: Colors.orange, route: 'Profile' },
];

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { user, stats, schedule, suggestions } = useAppStore();
  const { user: authUser } = useAuthStore();
  const enter = useRef(new Animated.Value(0)).current;

  const displayName = authUser?.fullName || user.name || 'Sinh viên';

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const animatedStyle = {
    opacity: enter,
    transform: [
      {
        translateY: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.hero, animatedStyle]}>
        <View style={styles.heroGlow} />
        <View style={styles.heroGoldDot} />
        <Image source={require('../../../assets/logo.png')} style={styles.heroLogo} resizeMode="contain" />
        <View style={styles.heroText}>
          <Text style={styles.greeting}>SAODO UNIVERSITY</Text>
          <Text style={styles.name} numberOfLines={1}>Xin chào, {displayName}</Text>
          <Text style={styles.heroSub} numberOfLines={1}>{authUser?.faculty || user.school}</Text>
        </View>
      </Animated.View>

      <View style={styles.statsRow}>
        <StatCard label="Lớp" value={stats.classesToday} icon="school-outline" color={Colors.blue} />
        <StatCard label="Tin" value={stats.reminders} icon="notifications-outline" color={Colors.primary} />
        <StatCard label="Tệp" value={stats.documents} icon="folder-open-outline" color={Colors.orange} />
      </View>

      <View style={styles.actionGrid}>
        {actions.map((item) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${item.color}14` }]}>
              <Ionicons name={item.icon} size={23} color={item.color} />
            </View>
            <Text style={styles.actionTitle}>{item.label}</Text>
            <Text style={styles.actionDesc}>{item.desc}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.eyebrow}>Hôm nay</Text>
            <Text style={styles.sectionTitle}>Lịch học gần nhất</Text>
          </View>
        </View>
        {schedule.length === 0 ? (
          <EmptyState icon="calendar-clear-outline" text="Hôm nay chưa có lịch học" />
        ) : (
          schedule.slice(0, 4).map((item) => (
            <View key={item.id} style={styles.scheduleItem}>
              <View style={styles.timePill}>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.scheduleMeta}>{item.room} · {item.type}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.eyebrow}>Gợi ý học tập</Text>
        <Text style={styles.sectionTitle}>Bắt đầu nhanh</Text>
        <View style={styles.suggestionList}>
          {(suggestions.length > 0 ? suggestions : ['Hỏi lịch học hôm nay', 'Tìm tài liệu mới', 'Tạo nhắc nhở ôn tập']).slice(0, 3).map((item) => (
            <Pressable key={item} style={({ pressed }) => [styles.suggestionChip, pressed && styles.pressed]} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="sparkles-outline" size={16} color={Colors.blueDark} />
              <Text style={styles.suggestionText} numberOfLines={2}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: IconName;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={34} color={Colors.textMuted} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 44 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadow.card,
  },
  heroGlow: {
    position: 'absolute',
    right: -34,
    top: -18,
    width: 128,
    height: 128,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroGoldDot: {
    position: 'absolute',
    right: 42,
    bottom: 24,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.brandGold,
  },
  heroLogo: { width: 58, height: 58, marginRight: Spacing.lg },
  heroText: { flex: 1 },
  greeting: { color: Colors.brandGold, fontSize: FontSize.xs, fontWeight: '900' },
  name: { color: '#fff', fontSize: FontSize.xl, fontWeight: '900', marginTop: 4 },
  heroSub: { color: 'rgba(255,255,255,0.78)', fontSize: FontSize.sm, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.card,
  },
  statValue: { fontSize: FontSize.xxl, fontWeight: '900', marginTop: 4 },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSub, fontWeight: '800', marginTop: 2 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  actionCard: {
    width: '48.5%',
    minHeight: 126,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  actionTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '900' },
  actionDesc: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '700', marginTop: 4 },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadow.card,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  eyebrow: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '900', textTransform: 'uppercase' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, marginTop: 2 },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.md },
  timePill: { width: 76, borderRadius: Radius.md, backgroundColor: Colors.blueBg, paddingVertical: Spacing.sm, alignItems: 'center' },
  timeText: { color: Colors.blueDark, fontSize: FontSize.xs, fontWeight: '900' },
  scheduleInfo: { flex: 1, borderRadius: Radius.md, backgroundColor: Colors.surfaceAlt, padding: Spacing.md },
  scheduleTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '900' },
  scheduleMeta: { color: Colors.textSub, fontSize: FontSize.sm, marginTop: 3 },
  suggestionList: { marginTop: Spacing.md, gap: Spacing.sm },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.blueBorder,
    backgroundColor: Colors.blueBg,
    padding: Spacing.md,
  },
  suggestionText: { flex: 1, color: Colors.text, fontSize: FontSize.sm, fontWeight: '800' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { marginTop: Spacing.sm, color: Colors.textSub, fontSize: FontSize.sm, fontWeight: '800' },
  pressed: { transform: [{ scale: 0.97 }] },
});
