import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Spacing } from '../../constants/theme';

export type HeaderProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function Header({ title, subtitle, right }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: Spacing.xs,
    color: Colors.textSub,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  right: {
    alignItems: 'flex-end',
  },
});
