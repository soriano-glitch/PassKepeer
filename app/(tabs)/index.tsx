import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { EmptyState, PrototypeBanner } from '../../src/components/ui';
import { DEFAULT_CATEGORIES } from '../../src/features/vault/categories';
import { getPrototypeStore, type PrototypeEntry } from '../../src/features/vault/memory-store';

function EntryRow({
  entry,
  onToggleFavorite,
}: {
  entry: PrototypeEntry;
  onToggleFavorite: () => void;
}) {
  const scheme = useColorScheme();
  const text = scheme === 'dark' ? '#e8eaed' : '#1a1b1e';
  const muted = scheme === 'dark' ? '#9aa0aa' : '#5f6368';
  return (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <Text style={[styles.cardTitle, { color: text }]}>{entry.title}</Text>
        <Text style={[styles.cardSub, { color: muted }]}>
          {entry.username} · {entry.category}
        </Text>
      </View>
      <Pressable onPress={onToggleFavorite} accessibilityRole="button" accessibilityLabel="Toggle favorite">
        <Text style={styles.star}>{entry.isFavorite ? '★' : '☆'}</Text>
      </Pressable>
    </View>
  );
}

export default function VaultTab() {
  const scheme = useColorScheme();
  const text = scheme === 'dark' ? '#e8eaed' : '#1a1b1e';
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setVersion((v) => v + 1);
    }, []),
  );

  const entries = useMemo(() => {
    void version;
    const store = getPrototypeStore();
    const found = store.search(query);
    return category ? found.filter((e) => e.category === category) : found;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, version]);

  function renderItem({ item }: ListRenderItemInfo<PrototypeEntry>) {
    return (
      <EntryRow
        entry={item}
        onToggleFavorite={() => {
          getPrototypeStore().toggleFavorite(item.id);
          setVersion((v) => v + 1);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: text }]} accessibilityRole="header">
          Vault
        </Text>
        <Link href="/entry/new" style={styles.add} accessibilityRole="button">
          + Add
        </Link>
      </View>
      <PrototypeBanner />
      <TextInput
        style={[styles.search, { color: text }]}
        placeholder="Search title, username, URL"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />
      <View style={styles.chips}>
        <Pressable onPress={() => setCategory(null)} accessibilityRole="button">
          <Text style={[styles.chip, category === null && styles.chipActive]}>All</Text>
        </Pressable>
        {DEFAULT_CATEGORIES.map((c) => (
          <Pressable key={c} onPress={() => setCategory(category === c ? null : c)} accessibilityRole="button">
            <Text style={[styles.chip, category === c && styles.chipActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        ListEmptyComponent={<EmptyState message="No entries yet. Add your first below — prototype only, no real passwords." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700' },
  add: { fontSize: 18, color: '#1a73e8', fontWeight: '600' },
  search: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { fontSize: 13, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14, backgroundColor: '#e8eaed' },
  chipActive: { backgroundColor: '#1a73e8', color: '#fff' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#f1f3f4', marginBottom: 8 },
  cardMain: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 13 },
  star: { fontSize: 22, color: '#f9ab00' },
});
