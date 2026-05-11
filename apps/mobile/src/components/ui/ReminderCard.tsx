import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';

export type ReminderCardProps = {
  title: string;
  dueText?: string;
  done?: boolean;
  onPress?: () => void;
};

export function ReminderCard({ title, dueText, done = false, onPress }: ReminderCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, done && styles.doneCard, pressed && onPress && styles.pressed]}
    >
      <View style={[styles.check, done && styles.doneCheck]}>
        <Ionicons name={done ? 'checkmark' : 'time-outline'} size={18} color={done ? Colors.surface : Colors.orange} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, done && styles.doneTitle]}>{title}</Text>
        {dueText ? <Text style={styles.due}>{dueText}</Text> : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  doneCard: {
    backgroundColor: Colors.surfaceAlt,
  },
  check: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.goldBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCheck: {
    backgroundColor: Colors.green,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  doneTitle: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  due: {
    marginTop: Spacing.xs,
    color: Colors.textSub,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
