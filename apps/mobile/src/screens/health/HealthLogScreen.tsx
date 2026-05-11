import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard, AppInput, Header } from '../../components/ui';
import { Colors, FontSize, Spacing } from '../../constants/theme';

type HealthLogScreenProps = {
  title: string;
  subtitle: string;
  primaryField: string;
  helper: string;
};

export function HealthLogScreen({ title, subtitle, primaryField, helper }: HealthLogScreenProps) {
  const [primaryValue, setPrimaryValue] = useState('');
  const [note, setNote] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Header title={title} subtitle={subtitle} />
      <AppCard tone="blue">
        <AppInput label={primaryField} placeholder="Nhập thông tin" value={primaryValue} onChangeText={setPrimaryValue} />
        <AppInput label="Ghi chú" placeholder="Điều gì đáng nhớ hôm nay?" value={note} onChangeText={setNote} />
        <Text style={styles.helper}>{helper}</Text>
        <View style={styles.actions}>
          <AppButton title="Lưu nhật ký" onPress={() => undefined} />
        </View>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 48, gap: Spacing.lg },
  helper: { color: Colors.textMuted, fontSize: FontSize.sm, lineHeight: 20, marginTop: Spacing.sm },
  actions: { marginTop: Spacing.lg },
});
