import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';

export type EmptyViewProps = {
  title: string;
  text: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
};

export function EmptyView({ title, text, icon = 'file-tray-outline' }: EmptyViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={30} color={Colors.blueDark} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
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
