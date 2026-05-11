import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';

export type AssignmentCardProps = {
  title: string;
  subject: string;
  dueText: string;
  status?: string;
  onPress?: () => void;
};

export function AssignmentCard({ title, subject, dueText, status = 'Đang làm', onPress }: AssignmentCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="document-text-outline" size={22} color={Colors.blueDark} />
      </View>
      <View style={styles.copy}>
        <View style={styles.row}>
          <Text style={styles.subject}>{subject}</Text>
          <Text style={styles.status}>{status}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.due}>{dueText}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  subject: {
    color: Colors.blueDark,
    fontSize: FontSize.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  status: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '900',
    lineHeight: 21,
  },
  due: {
    color: Colors.textSub,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
