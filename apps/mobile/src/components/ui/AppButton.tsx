import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';

export type AppButtonVariant = 'primary' | 'secondary' | 'blue' | 'ghost' | 'danger';

export type AppButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: AppButtonVariant;
};

export function AppButton({ title, onPress, loading = false, disabled = false, variant = 'primary' }: AppButtonProps) {
  const isDisabled = disabled || loading;
  const titleStyle = variant === 'primary' ? styles.primaryTitle : variant === 'danger' ? styles.dangerTitle : styles.secondaryTitle;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.surface : Colors.primary} />
      ) : (
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  blue: {
    backgroundColor: Colors.blueBg,
    borderWidth: 1,
    borderColor: Colors.blueBorder,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  primaryTitle: {
    color: Colors.surface,
  },
  secondaryTitle: {
    color: Colors.primary,
  },
  dangerTitle: {
    color: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
