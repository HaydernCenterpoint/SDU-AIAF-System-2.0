import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from './AppButton';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';

export type ErrorViewProps = {
  title?: string;
  text: string;
  onRetry?: () => void;
};

export function ErrorView({ title = 'Có lỗi xảy ra', text, onRetry }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="alert-circle-outline" size={34} color={Colors.red} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {onRetry ? <AppButton title="Thử lại" onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '900',
    textAlign: 'center',
  },
  text: {
    color: Colors.textSub,
    fontSize: FontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
});
