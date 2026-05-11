import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { withAlpha } from './color';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';

export type StatisticCardProps = {
  label: string;
  value: string | number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color?: string;
};

export function StatisticCard({ label, value, icon, color = Colors.blue }: StatisticCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: withAlpha(color, '18', Colors.blueBg) }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 136,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '900',
  },
  label: {
    color: Colors.textSub,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
});
