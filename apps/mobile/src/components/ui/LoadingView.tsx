import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Spacing } from '../../constants/theme';

export type LoadingViewProps = {
  text?: string;
};

export function LoadingView({ text = 'Đang tải dữ liệu...' }: LoadingViewProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.primary} size="large" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  text: {
    color: Colors.textSub,
    fontSize: FontSize.md,
    fontWeight: '800',
    textAlign: 'center',
  },
});
