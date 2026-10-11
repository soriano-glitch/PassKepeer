import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useAppTheme } from '../../src/components/theme';
import { Avatar, EmptyState, PrototypeBanner, SectionLabel } from '../../src/components/ui';
import { getPrototypeStore, type PrototypeEntry } from '../../src/features/vault/memory-store';

export default function FavoritesTab() {
  const c = useAppTheme();
  const [version, setVersion] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setVersion((v) => v + 1);
    }, []),
  );

  function renderItem({ item }: ListRenderItemInfo<PrototypeEntry>) {
    return (
      <View style={[styles.card, { backgroundColor: c.card }]}>
        <Avatar letter={item.title.charAt(0) || '?'} />
        <View style={styles.cardMain}>
          <Text style={[styles.cardTitle, { color: c.text }]}>{item.title}</Text>
          <Text style={[styles.cardSub, { color: c.muted }]}>{item.username}</Text>
          <Text style={[styles.cardTag, { color: c.accent }]}>{item.category.toUpperCase()}</Text>
        </View>
        <Text style={[styles.star, { color: c.star }]}>★</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
        Favorites
      </Text>
      <PrototypeBanner />
      <SectionLabel text="Pinned" />
      <FlatList
        data={getPrototypeStore().favorites()}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        extraData={version}
        ListEmptyComponent={<EmptyState message="Star entries from the Vault to pin them here." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 28, fontWeight: '800' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 10, gap: 12 },
  cardMain: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 13 },
  cardTag: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  star: { fontSize: 22 },
});
