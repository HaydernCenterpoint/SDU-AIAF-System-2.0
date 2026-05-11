import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { withAlpha } from './color';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';

export type HealthCardProps = {
  title: string;
  value: string;
  helper?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color?: string;
};

export function HealthCard({ title, value, helper, icon, color = Colors.green }: HealthCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: withAlpha(color, '18', Colors.blueBg) }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: Colors.textSub,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  value: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '900',
  },
  helper: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
