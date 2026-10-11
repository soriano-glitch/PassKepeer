import { router } from 'expo-router';
import { useState } from 'react';
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { PrototypeBanner } from '../../src/components/ui';
import { DEFAULT_CATEGORIES } from '../../src/features/vault/categories';
import { getPrototypeStore } from '../../src/features/vault/memory-store';
import { requireNonEmptyString } from '../../src/utils/validation';

export default function NewEntry() {
  const scheme = useColorScheme();
  const text = scheme === 'dark' ? '#e8eaed' : '#1a1b1e';
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: text }]} accessibilityRole="header">
        New entry
      </Text>
      <PrototypeBanner />
      <Text style={[styles.label, { color: text }]}>Title *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Personal email" />
      <Text style={[styles.label, { color: text }]}>Username / email</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="you@example.com"
        autoCapitalize="none"
      />
      <Text style={[styles.label, { color: text }]}>Password *</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Prototype only — not a real password"
        secureTextEntry
      />
      <Text style={[styles.label, { color: text }]}>Website URL</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="https://…"
        autoCapitalize="none"
      />
      <Text style={[styles.label, { color: text }]}>Notes</Text>
      <TextInput style={[styles.input, styles.notes]} value={notes} onChangeText={setNotes} multiline />
      <Text style={[styles.label, { color: text }]}>Category</Text>
      <View style={styles.chips}>
        {DEFAULT_CATEGORIES.map((c) => (
          <Pressable key={c} onPress={() => setCategory(c)} accessibilityRole="button">
            <Text style={[styles.chip, category === c && styles.chipActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Button title="Save (prototype memory only)" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 8 },
  title: { fontSize: 24, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '600', marginTop: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, fontSize: 16 },
  notes: { minHeight: 70, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { fontSize: 13, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14, backgroundColor: '#e8eaed' },
  chipActive: { backgroundColor: '#1a73e8', color: '#fff' },
  error: { color: '#b00020', fontSize: 14 },
});
