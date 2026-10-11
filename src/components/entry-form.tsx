import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppTheme } from './theme';
import { DEFAULT_CATEGORIES } from '../features/vault/categories';
import type { NewPrototypeEntry } from '../features/vault/memory-store';
import { requireNonEmptyString } from '../utils/validation';

export const EMPTY_ENTRY: NewPrototypeEntry = {
  title: '',
  username: '',
  password: '',
  url: '',
  notes: '',
  category: 'Other',
};

export function EntryForm({
  initial = EMPTY_ENTRY,
  submitLabel,
  onSubmit,
}: {
  initial?: NewPrototypeEntry;
  submitLabel: string;
  onSubmit: (input: NewPrototypeEntry) => void;
}) {
  const c = useAppTheme();
  const [title, setTitle] = useState(initial.title);
  const [username, setUsername] = useState(initial.username);
  const [password, setPassword] = useState(initial.password);
  const [url, setUrl] = useState(initial.url);
  const [notes, setNotes] = useState(initial.notes);
  const [category, setCategory] = useState(initial.category);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    try {
      onSubmit({
        title: requireNonEmptyString(title, 'title'),
        username: username.trim(),
        password: requireNonEmptyString(password, 'password'),
        url: url.trim(),
        notes,
        category,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    }
  }

  const inputStyle = { backgroundColor: c.inputBg, color: c.text, borderColor: c.border };
  return (
    <View style={styles.form}>
      <Text style={[styles.label, { color: c.text }]}>Title *</Text>
      <TextInput
        style={[styles.input, inputStyle]}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Personal email"
        placeholderTextColor={c.muted}
      />
      <Text style={[styles.label, { color: c.text }]}>Username / email</Text>
      <TextInput
        style={[styles.input, inputStyle]}
        value={username}
        onChangeText={setUsername}
        placeholder="you@example.com"
        placeholderTextColor={c.muted}
        autoCapitalize="none"
      />
      <Text style={[styles.label, { color: c.text }]}>Password *</Text>
      <TextInput
        style={[styles.input, inputStyle]}
        value={password}
        onChangeText={setPassword}
        placeholder="Prototype only — not a real password"
        placeholderTextColor={c.muted}
        secureTextEntry
      />
      <Text style={[styles.label, { color: c.text }]}>Website URL</Text>
      <TextInput
        style={[styles.input, inputStyle]}
        value={url}
        onChangeText={setUrl}
        placeholder="https://…"
        placeholderTextColor={c.muted}
        autoCapitalize="none"
      />
      <Text style={[styles.label, { color: c.text }]}>Notes</Text>
      <TextInput
        style={[styles.input, styles.notes, inputStyle]}
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
      <Button title={submitLabel} onPress={handleSubmit} color={c.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 16 },
  notes: { minHeight: 70, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { fontSize: 13, fontWeight: '600', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14 },
  error: { fontSize: 14 },
});
