import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EntryForm } from '../../../src/components/entry-form';
import { useAppTheme } from '../../../src/components/theme';
import { PrototypeBanner } from '../../../src/components/ui';
import { getPrototypeStore } from '../../../src/features/vault/memory-store';

export default function EditEntry() {
  const c = useAppTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const entry = id ? getPrototypeStore().get(id) : null;

  if (!entry) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg }]}>
        <Text style={[styles.title, { color: c.text }]}>Entry not found</Text>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
        Edit entry
      </Text>
      <PrototypeBanner />
      <EntryForm
        initial={{
          title: entry.title,
          username: entry.username,
          password: entry.password,
          url: entry.url,
          notes: entry.notes,
          category: entry.category,
        }}
        submitLabel="Save changes"
        onSubmit={(input) => {
          getPrototypeStore().update(entry.id, input);
          router.back();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 8 },
  title: { fontSize: 24, fontWeight: '800' },
  link: { fontSize: 15, color: '#1a73e8', fontWeight: '600' },
});
