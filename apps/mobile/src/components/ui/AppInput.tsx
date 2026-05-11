import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';

export type AppInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  hint?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  error?: string;
};

export function AppInput({
  label,
  value,
  onChangeText,
  hint,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
}: AppInputProps) {
  const [focused, setFocused] = useState(false);
  const helperText = error || hint;
  const accessibilityHint = error || hint || placeholder;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.focused, error && styles.errorInput]}
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || hint}
        placeholderTextColor={Colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={keyboardType !== 'email-address'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {helperText ? <Text style={[styles.helper, error && styles.errorText]}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  input: {
    minHeight: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
    paddingHorizontal: Spacing.md,
  },
  focused: {
    borderColor: Colors.blue,
  },
  errorInput: {
    borderColor: Colors.red,
    backgroundColor: Colors.primaryBg,
  },
  helper: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  errorText: {
    color: Colors.red,
    fontWeight: '800',
  },
});
