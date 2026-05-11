import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '../../constants/theme';

export type AppCardTone = 'default' | 'blue' | 'red' | 'gold';

export type AppCardProps = {
  children: React.ReactNode;
  tone?: AppCardTone;
  compact?: boolean;
};

const toneStyles: Record<AppCardTone, ViewStyle> = {
  default: { backgroundColor: Colors.surface, borderColor: Colors.border },
  blue: { backgroundColor: Colors.blueBg, borderColor: Colors.blueBorder },
  red: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  gold: { backgroundColor: Colors.goldBg, borderColor: Colors.brandGold },
};

export function AppCard({ children, tone = 'default', compact = false }: AppCardProps) {
  return <View style={[styles.card, compact && styles.compact, toneStyles[tone]]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  compact: {
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
});
