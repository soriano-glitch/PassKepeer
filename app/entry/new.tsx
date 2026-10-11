import { router } from 'expo-router';
import { useState } from 'react';
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppTheme } from '../../src/components/theme';
import { PrototypeBanner } from '../../src/components/ui';
import { DEFAULT_CATEGORIES } from '../../src/features/vault/categories';
import { getPrototypeStore } from '../../src/features/vault/memory-store';
import { requireNonEmptyString } from '../../src/utils/validation';

export default function NewEntry() {
  const c = useAppTheme();
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<string>('Other');
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    try {
      getPrototypeStore().create({
        title: requireNonEmptyString(title, 'title'),
        username: username.trim(),
        password: requireNonEmptyString(password, 'password'),
        url: url.trim(),
        notes,
        category,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    }
  }

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
        New entry
      </Text>
      <PrototypeBanner />
      <Text style={[styles.label, { color: c.text }]}>Title *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Personal email"
        placeholderTextColor={c.muted}
      />
      <Text style={[styles.label, { color: c.text }]}>Username / email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
        value={username}
        onChangeText={setUsername}
        placeholder="you@example.com"
        placeholderTextColor={c.muted}
        autoCapitalize="none"
      />
      <Text style={[styles.label, { color: c.text }]}>Password *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
        value={password}
        onChangeText={setPassword}
        placeholder="Prototype only — not a real password"
        placeholderTextColor={c.muted}
        secureTextEntry
      />
      <Text style={[styles.label, { color: c.text }]}>Website URL</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
        value={url}
        onChangeText={setUrl}
        placeholder="https://…"
        placeholderTextColor={c.muted}
        autoCapitalize="none"
      />
      <Text style={[styles.label, { color: c.text }]}>Notes</Text>
      <TextInput
        style={[
          styles.input,
          styles.notes,
          { backgroundColor: c.inputBg, color: c.text, borderColor: c.border },
        ]}
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Text style={[styles.label, { color: c.text }]}>Category</Text>
      <View style={styles.chips}>
        {DEFAULT_CATEGORIES.map((cat) => (
          <Pressable key={cat} onPress={() => setCategory(cat)} accessibilityRole="button">
            <Text
              style={[
                styles.chip,
                { backgroundColor: c.card, color: c.muted },
                category === cat && { backgroundColor: c.accent, color: c.accentText },
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>
      {error ? (
        <Text style={[styles.error, { color: c.danger }]} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Button title="Save (prototype memory only)" onPress={handleSave} color={c.accent} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 8 },
  title: { fontSize: 24, fontWeight: '800' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 16 },
  notes: { minHeight: 70, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { fontSize: 13, fontWeight: '600', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14 },
  error: { fontSize: 14 },
});
