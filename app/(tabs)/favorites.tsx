import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { EmptyState, PrototypeBanner } from '../../src/components/ui';
import { getPrototypeStore, type PrototypeEntry } from '../../src/features/vault/memory-store';

export default function FavoritesTab() {
  const scheme = useColorScheme();
  const text = scheme === 'dark' ? '#e8eaed' : '#1a1b1e';
  const [version, setVersion] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setVersion((v) => v + 1);
    }, []),
  );

  function renderItem({ item }: ListRenderItemInfo<PrototypeEntry>) {
    return (
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: text }]}>{item.title}</Text>
        <Text style={styles.cardSub}>
          {item.username} · {item.category}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: text }]} accessibilityRole="header">
        Favorites
      </Text>
      <PrototypeBanner />
      <FlatList
        data={getPrototypeStore().favorites()}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        extraData={version}
        ListEmptyComponent={<EmptyState message="No favorites yet. Star entries from the Vault tab." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { fontSize: 26, fontWeight: '700' },
  card: { padding: 12, borderRadius: 10, backgroundColor: '#f1f3f4', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 13, color: '#5f6368' },
});
