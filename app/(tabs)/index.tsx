import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useAppTheme } from '../../src/components/theme';
import { Avatar, EmptyState, PrototypeBanner } from '../../src/components/ui';
import { checkVaultHealth, HEALTH_LABELS } from '../../src/features/health/checks';
import { DEFAULT_CATEGORIES } from '../../src/features/vault/categories';
import { getPrototypeStore, type PrototypeEntry } from '../../src/features/vault/memory-store';

function EntryCard({
  entry,
  onToggleFavorite,
}: {
  entry: PrototypeEntry;
  onToggleFavorite: () => void;
}) {
  const c = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.card }]}>
      <Pressable
        style={styles.cardMainPress}
        onPress={() => router.push({ pathname: '/entry/detail', params: { id: entry.id } })}
        accessibilityRole="button"
      >
        <Avatar letter={entry.title.charAt(0) || '?'} />
        <View style={styles.cardMain}>
          <Text style={[styles.cardTitle, { color: c.text }]}>{entry.title}</Text>
          <Text style={[styles.cardSub, { color: c.muted }]}>{entry.username}</Text>
          <Text style={[styles.cardTag, { color: c.accent }]}>{entry.category.toUpperCase()}</Text>
        </View>
      </Pressable>
      <Pressable onPress={onToggleFavorite} accessibilityRole="button" accessibilityLabel="Toggle favorite">
        <Text style={[styles.star, { color: c.star }]}>{entry.isFavorite ? '★' : '☆'}</Text>
      </Pressable>
    </View>
  );
}

export default function VaultTab() {
  const c = useAppTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setVersion((v) => v + 1);
    }, []),
  );

  const { entries, issueCount, issueSummary } = useMemo(() => {
    void version;
    const store = getPrototypeStore();
    const found = store.search(query);
    const filtered = category ? found.filter((e) => e.category === category) : found;
    const health = checkVaultHealth(store.list());
    const kinds = [...new Set(health.issues.flatMap((i) => i.kinds))];
    return {
      entries: filtered,
      issueCount: health.issues.length,
      issueSummary: kinds.map((k) => HEALTH_LABELS[k]).join(' · '),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, version]);

  function renderItem({ item }: ListRenderItemInfo<PrototypeEntry>) {
    return (
      <EntryCard
        entry={item}
        onToggleFavorite={() => {
          getPrototypeStore().toggleFavorite(item.id);
          setVersion((v) => v + 1);
        }}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
          Vault
        </Text>
        <Link href="/entry/new" style={[styles.add, { backgroundColor: c.accent, color: c.accentText }]} accessibilityRole="button">
          + Add
        </Link>
      </View>
      <PrototypeBanner />
      <Pressable
        style={[styles.health, { backgroundColor: c.card, borderColor: c.accent }]}
        accessibilityRole="button"
      >
        <Text style={[styles.healthText, { color: issueCount > 0 ? c.accent : c.muted }]}>
          {issueCount > 0
            ? `Security check: ${issueCount} entr${issueCount === 1 ? 'y' : 'ies'} need attention — ${issueSummary}`
            : 'Security check: no issues found (local heuristic checks only)'}
        </Text>
      </Pressable>
      <TextInput
        style={[styles.search, { backgroundColor: c.card, color: c.text }]}
        placeholder="Search title, username, URL"
        placeholderTextColor={c.muted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />
      <View style={styles.chips}>
        <Pressable onPress={() => setCategory(null)} accessibilityRole="button">
          <Text
            style={[
              styles.chip,
              { backgroundColor: c.card, color: c.muted },
              category === null && { backgroundColor: c.accent, color: c.accentText },
            ]}
          >
            All
          </Text>
        </Pressable>
        {DEFAULT_CATEGORIES.filter((cat) => cat !== 'Other').map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setCategory(category === cat ? null : cat)}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.chip,
                { backgroundColor: c.card, color: c.muted },
                category === cat && { backgroundColor: c.accent, color: c.accentText },
              ]}
            >
              {cat.replace('Social Media', 'Social')}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState message="No entries yet. Add your first below — prototype only, no real passwords." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800' },
  add: { fontSize: 15, fontWeight: '700', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16 },
  health: { borderWidth: 1, borderRadius: 12, padding: 12 },
  healthText: { fontSize: 13, lineHeight: 18 },
  search: { borderRadius: 12, padding: 12, fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { fontSize: 13, fontWeight: '600', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 14 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 10, gap: 4 },
  cardMainPress: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardMain: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 13 },
  cardTag: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  star: { fontSize: 22 },
});
