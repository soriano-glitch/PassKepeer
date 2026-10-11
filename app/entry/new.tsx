import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { EntryForm } from '../../src/components/entry-form';
import { useAppTheme } from '../../src/components/theme';
import { PrototypeBanner } from '../../src/components/ui';
import { getPrototypeStore } from '../../src/features/vault/memory-store';

export default function NewEntry() {
  const c = useAppTheme();
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
        New entry
      </Text>
      <PrototypeBanner />
      <EntryForm
        submitLabel="Save (prototype memory only)"
        onSubmit={(input) => {
          getPrototypeStore().create(input);
          router.back();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 8 },
  title: { fontSize: 24, fontWeight: '800' },
});
