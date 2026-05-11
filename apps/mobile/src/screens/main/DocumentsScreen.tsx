import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAppStore } from '../../store/useAppStore';

const DOC_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  PDF: 'document-text-outline',
  DOC: 'document-outline',
  PPT: 'easel-outline',
  PPTX: 'easel-outline',
  XLSX: 'grid-outline',
};

export function DocumentsScreen() {
  const { documents } = useAppStore();

  return (
    <View style={styles.container}>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.banner}>
              <Text style={styles.eyebrow}>Tài liệu</Text>
              <Text style={styles.bannerTitle}>Kho học liệu</Text>
              <Text style={styles.bannerSub}>{documents.length} tài liệu được sắp xếp để dễ tìm và đọc nhanh.</Text>
            </View>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
              <Text style={styles.searchPlaceholder}>Tìm kiếm tài liệu...</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={52} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có tài liệu</Text>
            <Text style={styles.emptyText}>Tài liệu học tập sẽ hiển thị ở đây.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const ext = item.meta?.split('·')[0]?.trim().toUpperCase() || 'DOC';
          const icon = DOC_ICONS[ext] || 'document-outline';
          return (
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name={icon} size={26} color={Colors.blueDark} />
              </View>
              <View style={styles.info}>
                <Text style={styles.docTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.docMeta}>{item.meta}</Text>
                {item.note ? <Text style={styles.docNote}>{item.note}</Text> : null}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { padding: Spacing.lg, paddingBottom: 44 },
  banner: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadow.card,
  },
  eyebrow: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900', textTransform: 'uppercase' },
  bannerTitle: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '900', marginTop: 4 },
  bannerSub: { color: Colors.textSub, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 20, marginTop: 6 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  searchPlaceholder: { fontSize: FontSize.md, color: Colors.textMuted, fontWeight: '800' },
  empty: {
    alignItems: 'center',
    paddingVertical: 86,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, marginTop: Spacing.lg },
  emptyText: { fontSize: FontSize.md, color: Colors.textSub, marginTop: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: { flex: 1 },
  docTitle: { fontSize: FontSize.md, fontWeight: '900', color: Colors.text, marginBottom: 4 },
  docMeta: { fontSize: FontSize.sm, color: Colors.textSub, fontWeight: '800' },
  docNote: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '900', marginTop: 3 },
});
