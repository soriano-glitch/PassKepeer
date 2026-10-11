import { Link, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../src/components/theme';
import { Avatar, PrototypeBanner } from '../../src/components/ui';
import { getPrototypeSettingsStore } from '../../src/features/settings/store';
import { getPrototypeStore, type PrototypeEntry } from '../../src/features/vault/memory-store';
import { expoClipboard } from '../../src/services/expo-clipboard';

function paramId(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

export default function EntryDetail() {
  const c = useAppTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const id = paramId(params.id);
  const [revealed, setRevealed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [, setVersion] = useState(0);

  const entry = id === undefined ? null : getPrototypeStore().get(id);

  if (entry === null) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <Text style={[styles.title, { color: c.text }]}>Entry not found</Text>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }
  const item: PrototypeEntry = entry;

  async function copy(text: string, label: string) {
    try {
      const ms = getPrototypeSettingsStore().get().clipboardClearMs;
      await expoClipboard.copyAndScheduleClear(text, ms);
      setNotice(`${label} copied — clears in ${Math.round(ms / 1000)}s.`);
    } catch {
      setNotice('Copy failed.');
    }
  }

  function confirmDelete(target: PrototypeEntry) {
    Alert.alert('Delete entry?', `"${target.title}" will be removed from the prototype store.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          getPrototypeStore().remove(target.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Avatar letter={item.title.charAt(0) || '?'} />
        <View style={styles.headerMain}>
          <Text style={[styles.title, { color: c.text }]}>{item.title}</Text>
          <Text style={[styles.tag, { color: c.accent }]}>{item.category.toUpperCase()}</Text>
        </View>
        <Pressable
          onPress={() => {
            getPrototypeStore().toggleFavorite(item.id);
            setVersion((v) => v + 1);
          }}
          accessibilityRole="button"
          accessibilityLabel="Toggle favorite"
        >
          <Text style={[styles.star, { color: c.star }]}>
            {getPrototypeStore().get(item.id)?.isFavorite ? '★' : '☆'}
          </Text>
        </Pressable>
      </View>
      <PrototypeBanner />

      <Text style={[styles.label, { color: c.muted }]}>USERNAME / EMAIL</Text>
      <View style={[styles.field, { backgroundColor: c.card }]}>
        <Text style={[styles.value, { color: c.text }]} selectable>
          {item.username || '—'}
        </Text>
        {item.username ? (
          <Pressable onPress={() => copy(item.username, 'Username')} accessibilityRole="button">
            <Text style={styles.link}>Copy</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={[styles.label, { color: c.muted }]}>PASSWORD</Text>
      <View style={[styles.field, { backgroundColor: c.card }]}>
        <Text style={[styles.value, { color: c.text }]} selectable>
          {revealed ? item.password : '•'.repeat(12)}
        </Text>
        <View style={styles.fieldActions}>
          <Pressable onPress={() => setRevealed((v) => !v)} accessibilityRole="button">
            <Text style={styles.link}>{revealed ? 'Hide' : 'Reveal'}</Text>
          </Pressable>
          <Pressable onPress={() => copy(item.password, 'Password')} accessibilityRole="button">
            <Text style={styles.link}>Copy</Text>
          </Pressable>
        </View>
      </View>

      {item.url ? (
        <>
          <Text style={[styles.label, { color: c.muted }]}>WEBSITE</Text>
          <View style={[styles.field, { backgroundColor: c.card }]}>
            <Text style={[styles.value, { color: c.text }]} selectable>
              {item.url}
            </Text>
          </View>
        </>
      ) : null}

      {item.notes ? (
        <>
          <Text style={[styles.label, { color: c.muted }]}>NOTES</Text>
          <View style={[styles.field, { backgroundColor: c.card }]}>
            <Text style={[styles.value, { color: c.text }]} selectable>
              {item.notes}
            </Text>
          </View>
        </>
      ) : null}

      <Text style={[styles.meta, { color: c.muted }]}>
        Updated {new Date(item.updatedAt).toLocaleString()}
      </Text>

      {notice ? <Text style={[styles.notice, { color: c.muted }]}>{notice}</Text> : null}

      <View style={styles.actions}>
        <Link
          href={{ pathname: '/entry/edit', params: { id: item.id } }}
          style={[styles.edit, { backgroundColor: c.card, color: c.text }]}
          accessibilityRole="button"
        >
          Edit
        </Link>
        <Pressable
          style={[styles.edit, { backgroundColor: c.card }]}
          onPress={() => confirmDelete(item)}
          accessibilityRole="button"
        >
          <Text style={[styles.deleteText, { color: c.danger }]}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerMain: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800' },
  tag: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  star: { fontSize: 26 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  field: { borderRadius: 12, padding: 14, gap: 10 },
  value: { fontSize: 16 },
  fieldActions: { flexDirection: 'row', gap: 20 },
  link: { fontSize: 15, color: '#1a73e8', fontWeight: '600' },
  meta: { fontSize: 12 },
  notice: { fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  edit: { flex: 1, borderRadius: 10, paddingVertical: 12, textAlign: 'center', fontSize: 15, fontWeight: '700' },
  deleteText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
});
